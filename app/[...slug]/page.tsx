import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageView from '../../components/templates/PageView';
import { getIndex, getPage, pathToSlug, slugToPath } from '../../lib/content';
import { pageMetadata } from '../../lib/metadata';

type Props = { params: Promise<{ slug: string[] }> };

// Every page is generated at build time; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getIndex()
    .filter((entry) => entry.path !== '/')
    .map((entry) => ({ slug: pathToSlug(entry.path) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = getPage(slugToPath((await params).slug));
  return page ? pageMetadata(page) : {};
}

export default async function Page({ params }: Props) {
  const page = getPage(slugToPath((await params).slug));
  if (!page) notFound();
  return <PageView page={page} />;
}
