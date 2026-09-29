import type { Metadata } from 'next';
import type { Page } from './content';

export const SITE_URL = 'https://www.completerestoration.co.uk';
// The live Open Graph site name, carried over exactly.
const OG_SITE_NAME = 'Complete restoration company';

// Title tags and descriptions are carried over exactly from the live site.
// Pages with a hero use it as their Open Graph image.
export function pageMetadata(page: Page): Metadata {
  const description = page.seo.description ?? undefined;
  const image = page.seo.ogImage ?? page.hero?.src;
  return {
    title: { absolute: page.seo.title },
    description,
    alternates: { canonical: page.path },
    openGraph: {
      type: page.kind === 'blogPost' || page.kind === 'caseStudy' ? 'article' : 'website',
      locale: 'en_GB',
      siteName: OG_SITE_NAME,
      url: page.path,
      title: page.seo.title,
      description,
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: page.seo.title,
      description,
    },
  };
}
