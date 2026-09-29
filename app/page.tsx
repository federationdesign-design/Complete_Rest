import type { Metadata } from 'next';
import PageView from '../components/templates/PageView';
import { getPage } from '../lib/content';
import { pageMetadata } from '../lib/metadata';

function home() {
  const page = getPage('/');
  if (!page) throw new Error('Home page content is missing; run node scripts/build-content.mjs');
  return page;
}

export function generateMetadata(): Metadata {
  return pageMetadata(home());
}

export default function Home() {
  return <PageView page={home()} />;
}
