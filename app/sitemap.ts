import type { MetadataRoute } from 'next';
import { getIndex, getPage } from '../lib/content';
import { SITE_URL } from '../lib/metadata';

// Generated from the route list, so every page is included and nothing else.
export default function sitemap(): MetadataRoute.Sitemap {
  return getIndex().map((entry) => {
    const page = getPage(entry.path);
    return {
      url: `${SITE_URL}${entry.path}`,
      ...(page?.modified ? { lastModified: page.modified } : {}),
    };
  });
}
