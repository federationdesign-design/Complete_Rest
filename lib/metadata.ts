import type { Metadata } from 'next';
import type { Page } from './content';

export const SITE_URL = 'https://www.completerestoration.co.uk';
// The live Open Graph site name, carried over exactly.
const OG_SITE_NAME = 'Complete restoration company';
// Google Search Console verification, carried over exactly from the live home
// page (the only live page that has it).
const GOOGLE_SITE_VERIFICATION = 'NypkqmvX8BOL03OpiNTr6bxG_-LpMSvkfh6tkbtqUGY';

// Title tags and descriptions are carried over exactly from the live site.
// The canonical URL is the same path, with its trailing slash, on SITE_URL
// (resolved against metadataBase in the root layout).
export function pageMetadata(page: Page): Metadata {
  const description = page.seo.description ?? undefined;
  const isArticle = page.kind === 'blogPost' || page.kind === 'caseStudy';
  // Hero cropped to 1200x630 around its focal point; the home hero for pages
  // without one (scripts/build-og.mjs).
  const image = { url: page.ogImage.src, width: page.ogImage.width, height: page.ogImage.height, alt: page.ogImage.alt };
  return {
    title: { absolute: page.seo.title },
    description,
    alternates: { canonical: page.path },
    ...(page.path === '/' ? { verification: { google: GOOGLE_SITE_VERIFICATION } } : {}),
    openGraph: {
      locale: 'en_GB',
      siteName: OG_SITE_NAME,
      url: page.path,
      title: page.seo.title,
      description,
      images: [image],
      ...(isArticle
        ? {
            type: 'article' as const,
            ...(page.publishedTime ? { publishedTime: page.publishedTime } : {}),
            ...(page.modifiedTime ? { modifiedTime: page.modifiedTime } : {}),
          }
        : { type: 'website' as const }),
    },
    twitter: {
      card: 'summary_large_image',
      title: page.seo.title,
      description,
      images: [image],
    },
  };
}
