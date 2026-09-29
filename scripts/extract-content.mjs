#!/usr/bin/env node
// Content extraction from the live WordPress site.
//
// Pulls pages, posts, media, categories and tags from the WordPress REST API,
// fetches the rendered HTML of every public URL (the theme keeps much of the
// copy in custom fields that the REST API does not expose), downloads every
// referenced image into public/images/ and writes an URL inventory.
//
// Usage: node scripts/extract-content.mjs
//
// Outputs:
//   content/raw/rest/*.json      raw REST API responses
//   content/raw/html/*.html      rendered HTML of every crawled URL
//   content/raw/css/*.css        site stylesheets (for brand tokens)
//   content/pages/*.json         one file per page or post
//   content/images.json          image manifest (source URLs, local file, size)
//   content/inventory.json       URL inventory compared against the brief
//   public/images/*              downloaded images, original file names

import { mkdir, writeFile, readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ORIGIN = 'https://www.completerestoration.co.uk';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = {
  rest: path.join(ROOT, 'content/raw/rest'),
  html: path.join(ROOT, 'content/raw/html'),
  css: path.join(ROOT, 'content/raw/css'),
  pages: path.join(ROOT, 'content/pages'),
  images: path.join(ROOT, 'public/images'),
};

// The URL map from section 4 of BRIEF.md.
const BRIEF_PATHS = [
  '/',
  '/about/', '/about/our-ethos/', '/about/our-team/',
  '/services/',
  '/services/building-restoration/', '/services/floor-restoration/', '/services/shot-blasting/',
  '/services/metal-polishing/', '/services/brick-and-stone-cleaning/', '/services/doff/',
  '/services/hand-stripping/',
  '/internal/', '/internal/staircase-refurb/', '/internal/kitchens/', '/internal/wet-rooms/',
  '/internal/decorating/',
  '/external/', '/external/brickwork/', '/external/sash-window-restoration/', '/external/structural/',
  '/case-studies/', '/case-studies/halcyon-gallery/', '/case-studies/haileybury-collages/',
  '/case-studies/victorian-residence/', '/case-studies/imperialscience-collage/',
  '/contact-us/', '/contact-us/privacy-policy/', '/contact-us/cookies-policy/', '/contact-us/disclaimer/',
];

// Common WordPress URLs that are not in any sitemap but may be indexed or linked.
const EXTRA_PROBES = [
  '/blog/', '/feed/', '/comments/feed/', '/category/uncategorised/',
  '/case-studies/feed/', '/blog/page/2/', '/category/blog/page/2/',
];

const IMAGE_EXT = /\.(jpe?g|png|gif|svg|webp|ico)$/i;

// ---------------------------------------------------------------------------
// Helpers

async function get(url, { tries = 3, redirect = 'follow' } = {}) {
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url, { redirect, headers: { 'user-agent': 'completerestoration-rebuild/1.0' } });
      return res;
    } catch (err) {
      if (i >= tries) throw err;
      await new Promise((r) => setTimeout(r, 500 * i));
    }
  }
}

async function getJson(url) {
  const res = await get(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return { data: await res.json(), headers: res.headers };
}

async function restAll(route) {
  const items = [];
  for (let page = 1; ; page++) {
    const sep = route.includes('?') ? '&' : '?';
    const { data, headers } = await getJson(`${ORIGIN}/wp-json/wp/v2/${route}${sep}per_page=100&page=${page}`);
    items.push(...data);
    const totalPages = Number(headers.get('x-wp-totalpages') || 1);
    if (page >= totalPages) break;
  }
  return items;
}

async function pool(items, size, fn) {
  const results = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: size }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return results;
}

const toPath = (url) => {
  const u = new URL(url, ORIGIN);
  return u.pathname + u.search;
};

// "/services/floor-restoration/" -> "services--floor-restoration"
const pathKey = (p) => (p === '/' ? 'home' : p.replace(/^\/|\/$/g, '').replace(/\//g, '--'));

const decode = (s) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

const stripTags = (s) => decode(s.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

function metaContent(head, attr, name) {
  const re = new RegExp(`<meta[^>]+${attr}=["']${name}["'][^>]*>`, 'i');
  const tag = head.match(re)?.[0];
  if (!tag) return null;
  const c = tag.match(/content=(["'])([\s\S]*?)\1/i);
  return c ? decode(c[2]) : null;
}

// The content region between the navigation and the footer, with scripts,
// styles and HTML comments removed. Everything else is left verbatim.
function contentRegion(html) {
  let start = html.indexOf('sticky_placeholder');
  if (start === -1) start = html.lastIndexOf('</header>');
  if (start === -1) start = html.indexOf('<body');
  let end = html.indexOf('id="footer"');
  if (end === -1) end = html.indexOf("id='footer'");
  if (end === -1) end = html.length;
  return html
    .slice(start, end)
    .replace(/^[^>]*>/, '')
    .replace(/<div[^>]*class=["'][^"']*footer_color[^>]*$/, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/\n\s*\n+/g, '\n')
    .trim();
}

function findImageUrls(html) {
  const found = new Set();
  const add = (u) => {
    if (!u) return;
    u = decode(u.trim()).replace(/^['"]|['"]$/g, '');
    if (u.startsWith('//')) u = 'https:' + u;
    if (u.startsWith('/')) u = ORIGIN + u;
    try {
      const url = new URL(u);
      url.search = '';
      url.hash = '';
      if (IMAGE_EXT.test(url.pathname)) found.add(url.href.replace(/^http:/, 'https:'));
    } catch {
      /* not a URL */
    }
  };
  for (const m of html.matchAll(/<img[^>]+?\bsrc=["']([^"']+)["']/gi)) add(m[1]);
  for (const m of html.matchAll(/\bsrcset=["']([^"']+)["']/gi)) for (const part of m[1].split(',')) add(part.trim().split(/\s+/)[0]);
  for (const m of html.matchAll(/url\(\s*([^)]+?)\s*\)/gi)) add(m[1]);
  for (const m of html.matchAll(/<a[^>]+href=["']([^"']+)["']/gi)) add(m[1]);
  for (const m of html.matchAll(/<meta[^>]+content=["']([^"']+\.(?:jpe?g|png|gif|svg|webp))["']/gi)) add(m[1]);
  for (const m of html.matchAll(/<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]+href=["']([^"']+)["']/gi)) add(m[1]);
  return [...found];
}

// Third-party and tracking resources seen on a page, for section 7 and 10.
function findTracking(html) {
  const out = new Set();
  for (const m of html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)) {
    const host = new URL(m[1], ORIGIN).host;
    if (host !== new URL(ORIGIN).host) out.add(`script: ${m[1]}`);
  }
  for (const m of html.matchAll(/<(?:link|iframe|img)[^>]+(?:href|src)=["'](https?:\/\/[^"']+)["']/gi)) {
    const host = new URL(m[1]).host;
    if (host !== new URL(ORIGIN).host) out.add(`resource: ${host}`);
  }
  const patterns = {
    'Google Analytics / gtag': /gtag\(|google-analytics\.com|googletagmanager\.com/,
    'Google Tag Manager container': /GTM-[A-Z0-9]+/,
    'Meta pixel': /fbq\(|connect\.facebook\.net/,
    'LinkedIn Insight': /snap\.licdn\.com|_linkedin_partner_id/,
    'X / Twitter pixel': /static\.ads-twitter\.com|twq\(/,
    'Hotjar': /hotjar/,
    'reCAPTCHA': /recaptcha/i,
  };
  for (const [name, re] of Object.entries(patterns)) if (re.test(html)) out.add(`detected: ${name}`);
  for (const m of html.matchAll(/\b(UA-\d+-\d+|G-[A-Z0-9]{6,}|AW-\d+|GTM-[A-Z0-9]+)\b/g)) out.add(`id: ${m[1]}`);
  return [...out].sort();
}

// Minimal image dimension readers, so no dependency is needed.
function imageSize(buf, file) {
  const ext = path.extname(file).toLowerCase();
  try {
    if (buf[0] === 0x89 && buf.toString('ascii', 1, 4) === 'PNG') {
      return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    }
    if (buf.toString('ascii', 0, 3) === 'GIF') {
      return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
    }
    if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
      const chunk = buf.toString('ascii', 12, 16);
      if (chunk === 'VP8X') return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) };
      if (chunk === 'VP8L') {
        const b = buf.readUInt32LE(21);
        return { width: (b & 0x3fff) + 1, height: ((b >> 14) & 0x3fff) + 1 };
      }
      if (chunk === 'VP8 ') return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
    }
    if (buf[0] === 0xff && buf[1] === 0xd8) {
      let o = 2;
      while (o < buf.length) {
        if (buf[o] !== 0xff) { o++; continue; }
        const marker = buf[o + 1];
        const len = buf.readUInt16BE(o + 2);
        if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
          return { height: buf.readUInt16BE(o + 5), width: buf.readUInt16BE(o + 7) };
        }
        o += 2 + len;
      }
    }
    if (ext === '.svg') {
      const svg = buf.toString('utf8');
      const tag = svg.match(/<svg[^>]*>/i)?.[0] || '';
      const num = (a) => {
        const v = tag.match(new RegExp(`\\b${a}=["']([\\d.]+)(px)?["']`, 'i'));
        return v ? Math.round(Number(v[1])) : null;
      };
      const vb = tag.match(/viewBox=["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
      const width = num('width') ?? (vb ? Math.round(Number(vb[1])) : null);
      const height = num('height') ?? (vb ? Math.round(Number(vb[2])) : null);
      return { width, height };
    }
  } catch {
    /* fall through */
  }
  return { width: null, height: null };
}

// ---------------------------------------------------------------------------
// Main

async function main() {
  for (const dir of Object.values(OUT)) await mkdir(dir, { recursive: true });

  // 1. REST API
  console.log('REST API...');
  const rest = {};
  for (const route of ['pages', 'posts', 'media', 'categories', 'tags', 'esm_testimonials']) {
    try {
      rest[route] = await restAll(route);
    } catch (err) {
      console.warn(`  ${route}: ${err.message}`);
      rest[route] = [];
    }
    await writeFile(path.join(OUT.rest, `${route}.json`), JSON.stringify(rest[route], null, 2));
    console.log(`  ${route}: ${rest[route].length}`);
  }
  const mediaById = new Map(rest.media.map((m) => [m.id, m]));
  const mediaBySource = new Map(rest.media.map((m) => [m.source_url.replace(/^http:/, 'https:'), m]));
  const catById = new Map(rest.categories.map((c) => [c.id, c.slug]));
  const tagById = new Map(rest.tags.map((t) => [t.id, t.slug]));

  // 2. Sitemaps
  console.log('Sitemaps...');
  const sitemapUrls = {};
  const indexRes = await get(`${ORIGIN}/sitemap_index.xml`);
  const indexXml = indexRes.ok ? await indexRes.text() : '';
  for (const [, loc] of indexXml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const xml = await (await get(loc)).text();
    sitemapUrls[path.basename(loc)] = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => toPath(m[1]));
  }
  const robotsTxt = await (await get(`${ORIGIN}/robots.txt`)).text();
  await writeFile(path.join(OUT.rest, 'sitemaps.json'), JSON.stringify({ sitemapUrls, robotsTxt }, null, 2));

  // 3. Build the URL list and crawl it
  const restEntries = [
    ...rest.pages.map((p) => ({ type: 'page', item: p })),
    ...rest.posts.map((p) => ({ type: 'post', item: p })),
  ];
  const restByPath = new Map(restEntries.map((e) => [toPath(e.item.link), e]));
  const allPaths = [
    ...new Set([
      ...BRIEF_PATHS,
      ...restByPath.keys(),
      ...Object.values(sitemapUrls).flat(),
      ...EXTRA_PROBES,
    ]),
  ].sort();

  console.log(`Crawling ${allPaths.length} URLs...`);
  const crawled = await pool(allPaths, 6, async (p) => {
    const res = await get(ORIGIN + p, { redirect: 'manual' });
    const record = { path: p, status: res.status, location: res.headers.get('location') || null };
    if (res.status === 200) {
      const html = await res.text();
      await writeFile(path.join(OUT.html, `${pathKey(p)}.html`), html);
      record.html = html;
    }
    return record;
  });
  const crawledByPath = new Map(crawled.map((c) => [c.path, c]));

  // 4. Stylesheets, for colour tokens and CSS-referenced images
  console.log('Stylesheets...');
  const cssUrls = new Set();
  for (const c of crawled) {
    if (!c.html) continue;
    for (const m of c.html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi)) {
      const href = m[0].match(/href=["']([^"']+)["']/)?.[1];
      if (href && new URL(href, ORIGIN).host === new URL(ORIGIN).host) cssUrls.add(new URL(href, ORIGIN).href.split('?')[0]);
    }
  }
  const cssImageRefs = new Map();
  for (const href of cssUrls) {
    const res = await get(href);
    if (!res.ok) continue;
    const css = await res.text();
    const name = new URL(href).pathname.replace(/^\//, '').replace(/\//g, '--');
    await writeFile(path.join(OUT.css, name), css);
    for (const m of css.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/gi)) {
      const abs = new URL(m[1], href).href.split('?')[0].split('#')[0];
      if (IMAGE_EXT.test(abs) && !abs.startsWith('data:')) {
        if (!cssImageRefs.has(abs)) cssImageRefs.set(abs, new Set());
        cssImageRefs.get(abs).add(name);
      }
    }
  }

  // 5. Page files
  console.log('Page files...');
  const imageUse = new Map(); // referenced URL -> Set of page paths
  const pageSummaries = [];
  for (const c of crawled) {
    const entry = restByPath.get(c.path);
    if (!entry || !c.html) continue;
    const { type, item } = entry;
    const html = c.html;
    const head = html.slice(0, html.indexOf('<body'));
    const region = contentRegion(html);
    const images = findImageUrls(region);
    for (const u of [...findImageUrls(html)]) {
      if (!imageUse.has(u)) imageUse.set(u, new Set());
      imageUse.get(u).add(c.path);
    }
    const titleTag = decode(head.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() || '');
    const description = metaContent(head, 'name', 'description');
    const featured = item.featured_media ? mediaById.get(item.featured_media) : null;

    const page = {
      id: item.id,
      type,
      path: c.path,
      slug: item.slug,
      parent: item.parent ?? null,
      template: item.template || null,
      menuOrder: item.menu_order ?? null,
      date: item.date,
      modified: item.modified,
      categories: (item.categories || []).map((id) => catById.get(id) || id),
      tags: (item.tags || []).map((id) => tagById.get(id) || id),
      title: decode(item.title.rendered),
      seo: {
        title: titleTag,
        description,
        canonical: head.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1] || null,
        robots: metaContent(head, 'name', 'robots'),
        ogTitle: metaContent(head, 'property', 'og:title'),
        ogDescription: metaContent(head, 'property', 'og:description'),
        ogImage: metaContent(head, 'property', 'og:image'),
      },
      headings: [...region.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi)].map((m) => ({
        level: Number(m[1]),
        text: stripTags(m[2]),
      })),
      hasQuoteForm: /wpcf7/.test(region),
      featuredImage: featured ? featured.source_url : null,
      images,
      restContentHtml: item.content.rendered,
      restExcerptHtml: item.excerpt?.rendered ?? '',
      renderedHtml: region,
      tracking: findTracking(html),
    };
    await writeFile(path.join(OUT.pages, `${pathKey(c.path)}.json`), JSON.stringify(page, null, 2));
    pageSummaries.push(page);
  }

  // 6. Images
  console.log('Images...');
  // Legacy stylesheets reference many images from old dev servers and plugin
  // sprites. Only uploads on the live site are brand content worth keeping.
  const skippedImages = [];
  for (const [u, sheets] of cssImageRefs) {
    const url = new URL(u);
    if (url.origin !== ORIGIN || !url.pathname.startsWith('/wp-content/uploads/')) {
      if (!imageUse.has(u)) skippedImages.push({ source: u, reason: `css only: ${[...sheets].join(', ')}` });
      continue;
    }
    if (!imageUse.has(u)) imageUse.set(u, new Set());
    for (const s of sheets) imageUse.get(u).add(`css:${s}`);
  }
  for (const u of [...imageUse.keys()]) {
    const url = new URL(u);
    if (url.origin !== ORIGIN) {
      skippedImages.push({ source: u, reason: `external host, used on ${[...imageUse.get(u)].join(', ')}` });
      imageUse.delete(u);
    } else if (url.pathname.includes('/fonts/')) {
      skippedImages.push({ source: u, reason: 'icon font, not an image' });
      imageUse.delete(u);
    }
  }
  // Map WordPress resized variants (name-300x200.jpg) back to the original.
  const originalFor = (u) => {
    if (mediaBySource.has(u)) return u;
    const base = u.replace(/-\d+x\d+(\.[a-z]+)$/i, '$1');
    if (base !== u && mediaBySource.has(base)) return base;
    return u;
  };
  const byOriginal = new Map();
  for (const [u, pages] of imageUse) {
    const orig = originalFor(u);
    if (!byOriginal.has(orig)) byOriginal.set(orig, { variants: new Set(), usedOn: new Set() });
    const rec = byOriginal.get(orig);
    if (u !== orig) rec.variants.add(u);
    pages.forEach((p) => rec.usedOn.add(p));
  }
  const nameOwner = new Map();
  const collisions = [];
  const manifest = await pool([...byOriginal.entries()].sort(), 6, async ([src, rec]) => {
    const file = decodeURIComponent(path.basename(new URL(src).pathname));
    if (nameOwner.has(file) && nameOwner.get(file) !== src) {
      collisions.push({ file, first: nameOwner.get(file), second: src });
      return { source: src, file: null, error: 'file name collision', usedOn: [...rec.usedOn] };
    }
    nameOwner.set(file, src);
    const dest = path.join(OUT.images, file);
    let buf;
    let status = 'cached';
    if (existsSync(dest) && (await stat(dest)).size > 0) {
      buf = await readFile(dest);
    } else {
      const res = await get(src);
      if (!res.ok) return { source: src, file: null, error: `HTTP ${res.status}`, usedOn: [...rec.usedOn] };
      buf = Buffer.from(await res.arrayBuffer());
      await writeFile(dest, buf);
      status = 'downloaded';
    }
    const media = mediaBySource.get(src);
    return {
      source: src,
      file: `/images/${file}`,
      status,
      bytes: buf.length,
      ...imageSize(buf, file),
      mediaId: media?.id ?? null,
      wpAlt: media?.alt_text || null,
      wpTitle: media ? decode(media.title.rendered) : null,
      variants: [...rec.variants].sort(),
      usedOn: [...rec.usedOn].sort(),
    };
  });
  await writeFile(path.join(ROOT, 'content/images.json'), JSON.stringify(manifest, null, 2));
  const unreferencedMedia = rest.media
    .filter((m) => !byOriginal.has(m.source_url.replace(/^http:/, 'https:')))
    .map((m) => m.source_url);

  // 7. Inventory
  console.log('Inventory...');
  const briefSet = new Set(BRIEF_PATHS);
  const sitemapSet = new Set(Object.values(sitemapUrls).flat());
  const inventory = allPaths.map((p) => {
    const c = crawledByPath.get(p);
    const e = restByPath.get(p);
    const summary = pageSummaries.find((s) => s.path === p);
    return {
      path: p,
      status: c.status,
      location: c.location,
      inBrief: briefSet.has(p),
      inSitemap: sitemapSet.has(p),
      rest: e ? `${e.type}:${e.item.id}` : null,
      title: summary?.title ?? null,
      titleTag: summary?.seo.title ?? (c.html ? decode(c.html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() || '') : null),
      metaDescription: summary?.seo.description ?? null,
      h1Count: summary ? summary.headings.filter((h) => h.level === 1).length : null,
      hasQuoteForm: summary?.hasQuoteForm ?? null,
    };
  });
  const trackingAll = [...new Set(pageSummaries.flatMap((p) => p.tracking))].sort();
  await writeFile(
    path.join(ROOT, 'content/inventory.json'),
    JSON.stringify(
      {
        generated: new Date().toISOString(),
        origin: ORIGIN,
        counts: Object.fromEntries(Object.entries(rest).map(([k, v]) => [k, v.length])),
        briefMissingFromSite: BRIEF_PATHS.filter((p) => crawledByPath.get(p)?.status !== 200),
        notInBrief: inventory.filter((i) => !i.inBrief && i.status === 200).map((i) => i.path),
        urls: inventory,
        tracking: trackingAll,
        images: {
          total: manifest.length,
          failed: manifest.filter((m) => !m.file).map((m) => ({ source: m.source, error: m.error })),
          collisions,
          skipped: skippedImages,
          unreferencedMedia,
        },
        stylesheets: [...cssUrls],
      },
      null,
      2,
    ),
  );

  console.log(`Done. ${pageSummaries.length} page files, ${manifest.length} images.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
