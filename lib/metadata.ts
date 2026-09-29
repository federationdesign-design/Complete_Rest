import type { Metadata } from 'next';
import type { Page } from './content';

// Title tags and descriptions are carried over exactly from the live site.
export function pageMetadata(page: Page): Metadata {
  return {
    title: { absolute: page.seo.title },
    description: page.seo.description ?? undefined,
    alternates: { canonical: page.path },
  };
}
