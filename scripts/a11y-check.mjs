#!/usr/bin/env node
// Accessibility and layout checks for every page in the route list.
//
// Runs axe (WCAG 2.2 A and AA rules) at 390px and 1280px, plus the brief's own
// rules: no horizontal scroll from 320px, one h1, no skipped heading levels,
// and every visible link and button at least 44 by 44 CSS pixels.
//
// Usage: node scripts/a11y-check.mjs [baseUrl]   (default http://localhost:3000)
// Run against a production build (npm run build && npm start).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = process.argv[2] || 'http://localhost:3000';
const pages = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/site/index.json'), 'utf8')).map((e) => e.path);

const problems = [];
const report = (page, width, msg) => problems.push(`${page} @${width}px: ${msg}`);

const browser = await chromium.launch();
try {
  for (const width of [320, 390, 1280]) {
    const context = await browser.newContext({ viewport: { width, height: 800 } });
    const page = await context.newPage();
    for (const p of pages) {
      await page.goto(base + p, { waitUntil: 'load' });

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (overflow > 0) report(p, width, `horizontal scroll of ${overflow}px`);
      if (width === 320) continue;

      const headings = await page.evaluate(() =>
        [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')]
          .filter((h) => h.getClientRects().length > 0 || h.classList.contains('visually-hidden'))
          .map((h) => Number(h.tagName[1])),
      );
      const h1s = headings.filter((l) => l === 1).length;
      if (h1s !== 1) report(p, width, `${h1s} h1 elements`);
      headings.forEach((level, i) => {
        if (i > 0 && level > headings[i - 1] + 1) report(p, width, `heading jumps from h${headings[i - 1]} to h${level}`);
      });

      const small = await page.evaluate(() =>
        [...document.querySelectorAll('a[href], button, input:not([type=hidden]), select, textarea')]
          .filter((el) => {
            // Stretched links (card titles) use ::after to cover their card.
            const stretched = getComputedStyle(el, '::after').position === 'absolute' && el.offsetParent;
            const r = (stretched ? el.offsetParent : el).getBoundingClientRect();
            const style = getComputedStyle(el);
            if (!r.width || !r.height || style.visibility === 'hidden') return false;
            if (el.closest('dialog:not([open]), [aria-hidden="true"]')) return false;
            if (el.matches('[class*="skipLink"]')) return false;
            // Links inside running text are exempt under WCAG 2.5.8.
            if (el.tagName === 'A' && el.closest('p, li') && !el.matches('[class]')) return false;
            return r.width < 44 || r.height < 44;
          })
          .map((el) => `${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)}" ${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)}`),
      );
      for (const s of small) report(p, width, `small tap target ${s}`);

      const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      for (const v of axe.violations) {
        report(p, width, `axe ${v.id} (${v.impact}): ${v.help} [${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(', ')}]`);
      }
    }
    await context.close();
  }
} finally {
  await browser.close();
}

if (problems.length) {
  console.log(problems.join('\n'));
  console.log(`\n${problems.length} problems across ${pages.length} pages`);
  process.exitCode = 1;
} else {
  console.log(`No problems found on ${pages.length} pages at 320, 390 and 1280px.`);
}
