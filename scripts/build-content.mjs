#!/usr/bin/env node
// Build the site content model from the extracted WordPress content.
//
// Reads content/pages/*.json and content/raw/html/blog.html (written by
// extract-content.mjs), plus content/images.json and content/image-text.json,
// and writes one normalised file per page to content/site/, with an index.
// Copy is kept verbatim: text is only decoded from HTML entities, and site
// links are rewritten to relative paths.
//
// Usage: node scripts/build-content.mjs

import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'content/site');
const SITE_HOST = /^https?:\/\/(www\.)?completerestoration\.co\.uk/i;

// Pages that exist on the live site but are redirected (see NOTES_FOR_STEVE.md).
const SKIP = new Set(['/site-map/']);
// Legal pages are redrafted (components/legal/); the live copy is not carried over.
const LEGAL = new Map([
  ['/contact-us/privacy-policy/', 'Privacy notice'],
  ['/contact-us/cookies-policy/', 'Cookie policy'],
  ['/contact-us/disclaimer/', 'Website terms'],
]);

const warnings = [];
const warn = (page, msg) => warnings.push(`${page}: ${msg}`);

// ---------------------------------------------------------------------------
// Images

const manifest = JSON.parse(await readFile(path.join(ROOT, 'content/images.json'), 'utf8'));
let imageText = {};
try {
  imageText = JSON.parse(await readFile(path.join(ROOT, 'content/image-text.json'), 'utf8'));
} catch {
  /* written in step 4 */
}
const bySource = new Map();
for (const m of manifest) {
  if (!m.file) continue;
  bySource.set(m.source, m);
  for (const v of m.variants || []) bySource.set(v, m);
}

const altSwaps = new Map();

function image(url, page, { decorative = false } = {}) {
  if (!url) return null;
  const abs = url.trim().replace(/^http:/, 'https:').split('?')[0];
  const m = bySource.get(abs);
  if (!m) {
    warn(page, `image not in manifest: ${abs}`);
    return null;
  }
  const name = m.file.replace('/images/', '');
  const text = imageText[name] || {};
  // Alt text from the WordPress media library wins over alt text written for
  // the rebuild (content/image-text.json).
  const wpAlt = m.wpAlt?.trim();
  if (!decorative && wpAlt && wpAlt !== text.alt) altSwaps.set(name, { wordpress: wpAlt, replaced: text.alt ?? null });
  if (!decorative && !wpAlt && text.alt === undefined) warn(page, `no alt text for ${name}`);
  return {
    src: m.file,
    width: m.width,
    height: m.height,
    alt: decorative ? '' : (wpAlt || (text.alt ?? '')),
    ...(text.focal ? { focal: text.focal } : {}),
  };
}

// ---------------------------------------------------------------------------
// Text and HTML helpers

const text = ($el) => $el.text().replace(/\s+/g, ' ').trim();

function relativeHref(href) {
  if (!href) return href;
  let h = href.trim();
  if (SITE_HOST.test(h)) h = h.replace(SITE_HOST, '') || '/';
  if (h.startsWith('/wp-content/uploads/')) {
    const m = bySource.get('https://www.completerestoration.co.uk' + h.split('?')[0]);
    return m ? m.file : h;
  }
  if (h.startsWith('/') && !h.includes('#') && !h.includes('?') && !/\.[a-z0-9]+$/i.test(h) && !h.endsWith('/')) h += '/';
  return h;
}

// Clean a fragment of body HTML: drop presentational attributes, empty
// paragraphs and inline images (returned separately), keep the words.
function cleanHtml($, $root, page) {
  const images = [];
  $root.find('img').each((_, el) => {
    const $img = $(el);
    const srcset = ($img.attr('srcset') || '').split(',').map((s) => s.trim().split(/\s+/)[0]);
    const src = $img.attr('src');
    const img = image(src, page) || srcset.map((s) => image(s, page)).find(Boolean);
    if (img) images.push(img);
    $img.remove();
  });
  $root.find('script, style, form, noscript').remove();
  $root.find('*').each((_, el) => {
    const $el = $(el);
    const keep = {};
    if (el.tagName === 'a') {
      const href = relativeHref($el.attr('href'));
      if (href) keep.href = href;
      if (href && /^https?:/.test(href)) keep.rel = 'noopener';
    }
    for (const attr of Object.keys(el.attribs || {})) $el.removeAttr(attr);
    for (const [k, v] of Object.entries(keep)) $el.attr(k, v);
  });
  // Unwrap spans and divs, drop empty paragraphs.
  $root.find('span, div').each((_, el) => $(el).replaceWith($(el).contents()));
  $root.find('p').each((_, el) => {
    const $p = $(el);
    if (!text($p).replace(/ /g, '').trim() && !$p.find('a').length) $p.remove();
  });
  // WordPress sometimes wraps a heading in a one-item list; unwrap it.
  $root.find('ul, ol').each((_, list) => {
    const $list = $(list);
    const $items = $list.children('li');
    if ($items.length === 1 && $items.children().length === 1 && $items.children('h1, h2, h3, h4, h5, h6').length === 1) {
      $list.replaceWith($items.children().first());
    }
  });
  // Body headings start at h2 under the page h1 (logical order, same words).
  const levels = $root.find('h1, h2, h3, h4, h5, h6').map((_, h) => Number(h.tagName[1])).get();
  const shift = levels.length ? Math.min(...levels) - 2 : 0;
  if (shift !== 0) {
    $root.find('h1, h2, h3, h4, h5, h6').each((_, h) => {
      const level = Math.min(6, Math.max(2, Number(h.tagName[1]) - shift));
      $(h).replaceWith(`<h${level}>${$(h).html()}</h${level}>`);
    });
  }
  // Drop headings with no text.
  $root.find('h2, h3, h4, h5, h6').each((_, h) => {
    if (!text($(h))) $(h).remove();
  });
  const html = ($root.html() || '').replace(/\n\s*\n+/g, '\n').trim();
  return { html, images };
}

function paragraphsHtml($, $els, page) {
  const $wrap = $('<div></div>');
  $els.each((_, el) => $wrap.append($(el).clone()));
  return cleanHtml($, $wrap, page);
}

// ---------------------------------------------------------------------------
// Shared sections

function members($) {
  return $('#sectcompanies').length > 0;
}

function quote($, page) {
  if (!$('.wpcf7').length) return null;
  const title = text($('#form-title').first());
  if (!title) warn(page, 'quote form has no title on the live site');
  return { title: title || null };
}

function testimonial($) {
  const t = text($('.divtestimonials p').first());
  return t || null;
}

function heroFromSection($, page) {
  const src = $('#av_section_mobile img').attr('src');
  return src ? image(src, page) : null;
}

function bgImage(style) {
  return style?.match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/)?.[1] ?? null;
}

// ---------------------------------------------------------------------------
// Page builders, one per live template

function base(raw, kind) {
  return {
    path: raw.path,
    kind,
    title: raw.title,
    seo: {
      title: raw.seo.title,
      description: raw.seo.description,
      ogImage: raw.seo.ogImage ? relativeHref(raw.seo.ogImage) : null,
    },
    hero: null,
    heading: '',
    subheading: null,
    introHtml: null,
    lead: null,
    bodyHtml: null,
    gallery: [],
    cards: [],
    quote: null,
    testimonial: null,
    contact: null,
    members: false,
    modified: raw.modified ? raw.modified.slice(0, 10) : null,
    // Original WordPress publish and modified times. The site ran on UTC, so
    // the REST "date" and "date_gmt" values are the same.
    publishedTime: raw.date ? `${raw.date}+00:00` : null,
    modifiedTime: raw.modified ? `${raw.modified}+00:00` : null,
    ogImage: null,
  };
}

function buildHome(raw, $) {
  const page = base(raw, 'home');
  page.hero = heroFromSection($, raw.path);
  const $welcome = $('#home-welcome');
  page.heading = text($welcome.find('h1').first());
  page.subheading = text($welcome.find('h2').first()) || null;
  page.introHtml = `<p>${$('<i>').text(text($welcome.find('h3').first())).html()}</p>`;
  $('.herald-fa-item').each((_, el) => {
    const $a = $(el);
    page.cards.push({
      title: text($a.find('.entry-title')),
      href: relativeHref($a.find('.entry-title a').attr('href')),
      excerpt: text($a.find('.entry-content p').first()) || null,
      label: text($a.find('.fa-post-bg')) || null,
      image: image(bgImage($a.find('.fa-post-thumbnail').attr('style')), raw.path, { decorative: true }),
    });
  });
  const $col = $('#landlords-column-content').first();
  page.lead = text($col.find('h3').first()) || null;
  page.bodyHtml = paragraphsHtml($, $col.children('p'), raw.path).html || null;
  page.quote = quote($, raw.path);
  page.members = members($);
  return page;
}

function buildIntro(page, $) {
  const $intro = $('#divintroductionThird');
  page.heading = text($intro.find('h1').first());
  page.subheading = text($intro.find('h2').first()) || null;
  const extra = paragraphsHtml($, $intro.children('p'), page.path).html;
  page.introHtml = extra || null;
}

function buildInner(raw, $) {
  const page = base(raw, 'inner');
  page.hero = heroFromSection($, raw.path);
  buildIntro(page, $);
  const $col = $('#landlords-column #landlords-column-content').first();
  page.lead = text($col.find('.h4_inner').first()) || null;
  const body = paragraphsHtml($, $col.children('p, ul, ol, h2, h3'), raw.path);
  page.bodyHtml = body.html || null;
  page.gallery = body.images;
  page.quote = quote($, raw.path);
  page.testimonial = testimonial($);
  page.members = members($);
  return page;
}

function buildSection(raw, $) {
  const page = base(raw, 'section');
  page.hero = heroFromSection($, raw.path);
  buildIntro(page, $);
  $('.treatments article').each((_, el) => {
    const $a = $(el);
    const $title = $a.find('.post-title a').first();
    page.cards.push({
      title: text($title),
      href: relativeHref($title.attr('href')),
      excerpt: text($a.find('.entry-content').first().clone().find('.read-more-link, .more-link').remove().end()) || null,
      label: text($a.find('.more-link').first()) || null,
      image: image($a.find('img').attr('src'), raw.path, { decorative: true }),
    });
  });
  page.members = members($);
  return page;
}

function buildCaseStudies(raw, $) {
  const page = base(raw, 'caseStudies');
  buildIntro(page, $);
  $('.div-line-grid').each((_, el) => {
    const $a = $(el);
    page.cards.push({
      title: text($a.find('h2').first()),
      href: relativeHref($a.find('a').first().attr('href')),
      excerpt: null,
      label: null,
      image: image($a.find('img').attr('src'), raw.path, { decorative: true }),
    });
  });
  page.members = members($);
  return page;
}

// Case studies and blog posts: the body comes from the REST API.
function buildPost(raw, $, kind) {
  const page = base(raw, kind);
  const featured = $('img.wp-post-image').first();
  if (featured.length) page.hero = image(featured.attr('src'), raw.path);
  page.heading = text($('.post-title-single').first()) || raw.title;
  page.subheading = text($('.complete-restoration-single-h2').first()) || null;
  const $rest = cheerio.load(`<div id="rest">${raw.restContentHtml}</div>`);
  const body = cleanHtml($rest, $rest('#rest'), raw.path);
  page.bodyHtml = body.html || null;
  page.gallery = body.images;
  page.quote = quote($, raw.path);
  page.members = members($);
  page.date = raw.date;
  return page;
}

function buildContact(raw, $) {
  const page = base(raw, 'contact');
  const $c = $('#row_contact');
  page.heading = text($c.find('h1').first());
  const block = (label) =>
    $c
      .find('h2')
      .filter((_, h) => text($(h)) === label)
      .first()
      .next('p');
  page.contact = {
    address: block('Address')
      .html()
      .split(/<br\s*\/?>|\n/)
      .map((l) => cheerio.load(l).text().trim())
      .filter(Boolean),
    phone: text(block('Phone')),
    email: text(block('Email')),
  };
  page.quote = quote($, raw.path);
  page.members = members($);
  return page;
}

function buildLegal(raw, $) {
  const page = base(raw, 'legal');
  page.heading = LEGAL.get(raw.path);
  page.members = members($);
  return page;
}

// Copy change approved by Steve (NOTES_FOR_STEVE.md): the live archive
// heading and title tag say "BLog".
const fixArchiveTypo = (value) => value.replace(/\bBLog\b/g, 'Blog');

async function buildBlogArchive(posts) {
  const html = await readFile(path.join(ROOT, 'content/raw/html/blog.html'), 'utf8');
  const $ = cheerio.load(html);
  const page = base(
    {
      path: '/blog/',
      title: fixArchiveTypo(text($('#row_intro h1').first())),
      seo: {
        title: fixArchiveTypo(text($('title'))),
        description: $('meta[name="description"]').attr('content') || null,
        ogImage: null,
      },
    },
    'blogArchive',
  );
  page.heading = fixArchiveTypo(text($('#row_intro h1').first()));
  $('.fac-news article').each((_, el) => {
    const $a = $(el);
    const href = relativeHref($a.find('a.button').attr('href'));
    page.cards.push({
      title: text($a.find('.post-title')),
      href,
      excerpt: text($a.find('.post-wrapper')) || null,
      label: text($a.find('a.button')) || null,
      image: null,
    });
    if (!posts.has(href)) warn('/blog/', `archive links to unknown post ${href}`);
  });
  page.members = $('#sectcompanies').length > 0;
  return page;
}

// ---------------------------------------------------------------------------

const files = (await readdir(path.join(ROOT, 'content/pages'))).filter((f) => f.endsWith('.json'));
const pages = [];
for (const f of files) {
  const raw = JSON.parse(await readFile(path.join(ROOT, 'content/pages', f), 'utf8'));
  if (SKIP.has(raw.path)) continue;
  const $ = cheerio.load(raw.renderedHtml);
  let page;
  if (raw.path === '/') page = buildHome(raw, $);
  else if (raw.template === 'list-postsorpages.php') page = buildSection(raw, $);
  else if (raw.template === 'template-post-grid.php') page = buildCaseStudies(raw, $);
  else if (raw.template === 'template-contact.php') page = buildContact(raw, $);
  else if (LEGAL.has(raw.path)) page = buildLegal(raw, $);
  else if (raw.type === 'post' && raw.categories.includes('case-studies')) page = buildPost(raw, $, 'caseStudy');
  else if (raw.type === 'post') page = buildPost(raw, $, 'blogPost');
  else if (raw.template === 'template_inner_page.php') page = buildInner(raw, $);
  else throw new Error(`No template for ${raw.path} (${raw.template})`);
  if (!page.heading) warn(page.path, 'no h1 found');
  pages.push(page);
}
const postPaths = new Set(pages.filter((p) => p.kind === 'blogPost').map((p) => p.path));
pages.push(await buildBlogArchive(postPaths));
pages.sort((a, b) => a.path.localeCompare(b.path));

// Open Graph image: each hero cropped to 1200x630 around its focal point by
// scripts/build-og.mjs. Pages with no hero use the home page's.
const ogFor = (hero) => `/og/${path.basename(hero.src).replace(/\.[a-z0-9]+$/i, '')}.jpg`;
const homeHero = pages.find((p) => p.path === '/').hero;
for (const page of pages) {
  const hero = page.hero ?? homeHero;
  page.ogImage = { src: ogFor(hero), width: 1200, height: 630, alt: hero.alt };
}

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
const key = (p) => (p === '/' ? 'home' : p.replace(/^\/|\/$/g, '').replace(/\//g, '--'));
for (const page of pages) {
  await writeFile(path.join(OUT, `${key(page.path)}.json`), JSON.stringify(page, null, 2) + '\n');
}
await writeFile(
  path.join(OUT, 'index.json'),
  JSON.stringify(
    pages.map((p) => ({ path: p.path, key: key(p.path), kind: p.kind, title: p.title })),
    null,
    2,
  ) + '\n',
);

// 301s from WordPress upload URLs (originals and resized copies) to the
// downloaded file, since some are indexed or used as Open Graph images.
const uploadRedirects = [];
for (const m of manifest) {
  if (!m.file) continue;
  for (const url of [m.source, ...(m.variants || [])]) {
    const u = new URL(url);
    if (u.pathname.startsWith('/wp-content/uploads/')) uploadRedirects.push({ source: decodeURI(u.pathname), destination: m.file });
  }
}
uploadRedirects.sort((a, b) => a.source.localeCompare(b.source));
await writeFile(path.join(ROOT, 'content/upload-redirects.json'), JSON.stringify(uploadRedirects, null, 2) + '\n');

console.log(`${pages.length} pages written to content/site/, ${uploadRedirects.length} upload redirects`);
const counts = pages.reduce((acc, p) => ({ ...acc, [p.kind]: (acc[p.kind] || 0) + 1 }), {});
console.log(counts);
if (altSwaps.size) {
  console.log(`\n${altSwaps.size} alt texts taken from the WordPress media library:`);
  for (const [name, swap] of altSwaps) console.log(`  ${name}: "${swap.wordpress}" (replaced ${JSON.stringify(swap.replaced)})`);
}
if (warnings.length) {
  console.log(`\n${warnings.length} warnings:`);
  for (const w of warnings) console.log(`  ${w}`);
}
