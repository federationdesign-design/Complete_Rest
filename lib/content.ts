// Content model written by scripts/build-content.mjs, read at build time.

import fs from 'node:fs';
import path from 'node:path';

export type SiteImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
  focal?: string; // CSS object-position, e.g. "50% 30%"
};

export type Card = {
  title: string;
  href: string;
  excerpt: string | null;
  label: string | null;
  image: SiteImage | null;
};

export type PageKind =
  | 'home'
  | 'section'
  | 'inner'
  | 'caseStudies'
  | 'caseStudy'
  | 'contact'
  | 'legal'
  | 'blogPost'
  | 'blogArchive';

export type Page = {
  path: string;
  kind: PageKind;
  title: string;
  seo: { title: string; description: string | null; ogImage: string | null };
  hero: SiteImage | null;
  heading: string;
  subheading: string | null;
  introHtml: string | null;
  lead: string | null;
  bodyHtml: string | null;
  gallery: SiteImage[];
  cards: Card[];
  quote: { title: string | null } | null;
  testimonial: string | null;
  contact: { address: string[]; phone: string; email: string } | null;
  members: boolean;
  modified: string | null; // YYYY-MM-DD, last modified in WordPress
  date?: string;
};

export type IndexEntry = { path: string; key: string; kind: PageKind; title: string };

const DIR = path.join(process.cwd(), 'content/site');

let index: IndexEntry[] | null = null;

export function getIndex(): IndexEntry[] {
  index ??= JSON.parse(fs.readFileSync(path.join(DIR, 'index.json'), 'utf8')) as IndexEntry[];
  return index;
}

export function getPage(pagePath: string): Page | null {
  const entry = getIndex().find((e) => e.path === pagePath);
  if (!entry) return null;
  return JSON.parse(fs.readFileSync(path.join(DIR, `${entry.key}.json`), 'utf8')) as Page;
}

// "/services/doff/" -> ["services", "doff"]
export function pathToSlug(pagePath: string): string[] {
  return pagePath.split('/').filter(Boolean);
}

export function slugToPath(slug: string[]): string {
  return slug.length ? `/${slug.join('/')}/` : '/';
}
