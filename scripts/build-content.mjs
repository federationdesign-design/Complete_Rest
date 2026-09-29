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
const LEGAL = new Set(['/contact-us/privacy-policy/', '/contact-us/cookies-policy/', '/contact-us/disclaimer/']);

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
  if (!decorative && text.alt === undefined) warn(page, `no alt text for ${name}`);
  return {
    src: m.file,
    width: m.width,
    height: m.height,
    alt: decorative ? '' : (text.alt ?? ''),
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
  const $inner = $('.content-inner').first();
  page.heading = text($inner.find('h1').first());
  $inner.find('h1').first().remove();
  page.bodyHtml = cleanHtml($, $inner, raw.path).html || null;
  page.members = members($);
  return page;
}

async function buildBlogArchive(posts) {
  const html = await readFile(path.join(ROOT, 'content/raw/html/blog.html'), 'utf8');
  const $ = cheerio.load(html);
  const page = base(
    {
      path: '/blog/',
      title: text($('#row_intro h1').first()),
      seo: {
        title: text($('title')),
        description: $('meta[name="description"]').attr('content') || null,
        ogImage: null,
      },
    },
    'blogArchive',
  );
  page.heading = text($('#row_intro h1').first());
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

console.log(`${pages.length} pages written to content/site/`);
const counts = pages.reduce((acc, p) => ({ ...acc, [p.kind]: (acc[p.kind] || 0) + 1 }), {});
console.log(counts);
if (warnings.length) {
  console.log(`\n${warnings.length} warnings:`);
  for (const w of warnings) console.log(`  ${w}`);
}
