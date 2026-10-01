#!/usr/bin/env node
// Open Graph images: crop each page's hero to 1200x630 around its focal point.
//
// Reads the heroes from content/site/*.json (written by build-content.mjs)
// and writes public/og/<image name>.jpg. Pages with no hero use the home
// page's image, so no extra file is needed for them.
//
// Usage: node scripts/build-og.mjs   (run after scripts/build-content.mjs)

import { mkdir, readFile, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = path.join(ROOT, 'content/site');
const OUT = path.join(ROOT, 'public/og');
const WIDTH = 1200;
const HEIGHT = 630;

// "46% 50%" -> [0.46, 0.5]; centre when there is no focal point.
function focalPoint(focal) {
  const [x, y] = (focal ?? '50% 50%').split(/\s+/).map((v) => parseFloat(v) / 100);
  return [Number.isFinite(x) ? x : 0.5, Number.isFinite(y) ? y : 0.5];
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const heroes = new Map(); // og path -> hero
for (const file of (await readdir(SITE)).filter((f) => f.endsWith('.json') && f !== 'index.json')) {
  const page = JSON.parse(await readFile(path.join(SITE, file), 'utf8'));
  if (page.hero) heroes.set(page.ogImage.src, page.hero);
}

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

for (const [ogSrc, hero] of [...heroes].sort()) {
  const source = path.join(ROOT, 'public', hero.src);
  // Scale the image so it covers 1200x630, then take the window centred on
  // the focal point, kept inside the image.
  const scale = Math.max(WIDTH / hero.width, HEIGHT / hero.height);
  const width = Math.max(WIDTH, Math.round(hero.width * scale));
  const height = Math.max(HEIGHT, Math.round(hero.height * scale));
  const [fx, fy] = focalPoint(hero.focal);
  const left = clamp(Math.round(fx * width - WIDTH / 2), 0, width - WIDTH);
  const top = clamp(Math.round(fy * height - HEIGHT / 2), 0, height - HEIGHT);

  await sharp(source)
    .resize(width, height, { fit: 'fill' })
    .extract({ left, top, width: WIDTH, height: HEIGHT })
    .flatten({ background: '#ffffff' })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(ROOT, 'public', ogSrc));
  console.log(`  ${ogSrc}  from ${hero.src} (${hero.width}x${hero.height}), focal ${hero.focal ?? 'centre'}`);
}
console.log(`${heroes.size} Open Graph images written to public/og/`);
