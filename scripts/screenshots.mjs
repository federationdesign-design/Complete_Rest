#!/usr/bin/env node
// Full-page screenshots at 390px and 1280px, saved to agent/screenshots/ with
// the same names as the reference files in agent/reference/ (mobile files
// carry a mob- prefix).
//
// Usage: node scripts/screenshots.mjs [baseUrl] [name ...]
// Start the site first (npm run dev or npm start). Default base URL is
// http://localhost:3000. With no names, every page below is captured.

import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'agent/screenshots');

// Names match agent/reference/. Pages without a reference get a descriptive name.
export const PAGES = {
  home: '/',
  about: '/about/',
  services: '/services/',
  'floor-restoration': '/services/floor-restoration/',
  'shot-blasting': '/services/shot-blasting/',
  'metal-polishing': '/services/metal-polishing/',
  'brick-stone-cleaning': '/services/brick-and-stone-cleaning/',
  doff: '/services/doff/',
  'hand-stripping': '/services/hand-stripping/',
  internal: '/internal/',
  external: '/external/',
  'sash-window': '/external/sash-window-restoration/',
  casestudies: '/case-studies/',
  'casestudy-example': '/case-studies/halcyon-gallery/',
  contactus: '/contact-us/',
  privacy: '/contact-us/privacy-policy/',
};

const VIEWPORTS = [
  { prefix: 'mob-', width: 390, height: 844 },
  { prefix: '', width: 1280, height: 800 },
];

// Scroll through the page so lazy images load, wait for them and the fonts,
// then return to the top. networkidle is not used: aborted route prefetches
// can keep it from ever firing.
async function settle(page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight / 2) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 50));
    }
    // Only rendered images: lazy images in hidden UI (such as the closed menu
    // dialog) never load. Capped so one slow image cannot stall the run.
    const pending = [...document.images]
      .filter((img) => !img.complete && img.getClientRects().length > 0)
      .map((img) => new Promise((r) => { img.onload = img.onerror = r; }));
    await Promise.race([Promise.all(pending), new Promise((r) => setTimeout(r, 5000))]);
    await document.fonts.ready;
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(300);
}

const [base = 'http://localhost:3000', ...names] = process.argv.slice(2);
const selected = names.length ? names : Object.keys(PAGES);

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
try {
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.width < 768 ? 2 : 1,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    for (const name of selected) {
      const url = new URL(PAGES[name], base).href;
      const res = await page.goto(url, { waitUntil: 'load' });
      if (!res || res.status() !== 200) {
        console.warn(`  ${res?.status()} ${url}`);
        continue;
      }
      await settle(page);
      const file = path.join(OUT, `${vp.prefix}${name}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log(`  ${path.relative(ROOT, file)}`);
    }
    await context.close();
  }
} finally {
  await browser.close();
}
