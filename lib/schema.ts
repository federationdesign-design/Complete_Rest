// JSON-LD structured data for every page.
//
// Nothing here is new copy: names, descriptions, contact details and areas
// come from the migrated content. Facts Steve has not confirmed are written
// as "[PLACEHOLDER: ID]", matching PLACEHOLDERS.md, so they are easy to find
// in the page source. There is deliberately no aggregateRating or Review.

import { company, type Fact } from './company';
import { getPage, type Page } from './content';
import { SITE_URL } from './metadata';
import { contact, mainNav, siteName } from './site';

type Node = Record<string, unknown>;

const abs = (pathname: string) => `${SITE_URL}${pathname}`;
const BUSINESS_ID = abs('/#business');
const WEBSITE_ID = abs('/#website');

// The live site's Open Graph and Yoast WebSite name.
const WEBSITE_NAME = 'Complete restoration company';
const HEADER_LOGO = '/images/CompleteRestorationlogo-1.svg';

// Areas the site copy says the company works in: "all over Hertfordshire and
// London" (home) and "all over the home counties and London" (about).
const AREA_SERVED: Node[] = [
  { '@type': 'AdministrativeArea', name: 'Hertfordshire' },
  { '@type': 'City', name: 'London' },
  { '@type': 'Place', name: 'Home Counties' },
];

const factText = (fact: Fact) => ('value' in fact ? fact.value : `[PLACEHOLDER: ${fact.placeholder}]`);

// The address published on the contact page: street lines, town, county, postcode.
function postalAddress(): Node | null {
  const lines = getPage('/contact-us/')?.contact?.address;
  if (!lines || lines.length < 4) return null;
  const [postalCode, addressRegion, addressLocality, ...street] = [...lines].reverse();
  return {
    '@type': 'PostalAddress',
    streetAddress: street.reverse().join(', '),
    addressLocality,
    addressRegion,
    postalCode,
    addressCountry: 'GB',
  };
}

function business(): Node {
  const home = getPage('/');
  const address = postalAddress();
  return {
    '@type': 'HomeAndConstructionBusiness',
    '@id': BUSINESS_ID,
    name: siteName,
    legalName: factText(company.legalName),
    url: abs('/'),
    ...(home?.seo.description ? { description: home.seo.description } : {}),
    telephone: contact.phoneDisplay,
    email: contact.email,
    logo: abs(HEADER_LOGO),
    ...(home ? { image: abs(home.ogImage.src) } : {}),
    ...(address ? { address } : {}),
    vatID: factText(company.vatNumber),
    identifier: { '@type': 'PropertyValue', propertyID: 'Company number', value: factText(company.companyNumber) },
    areaServed: AREA_SERVED,
    // No sameAs: the live site links to no social profiles.
  };
}

function website(): Node {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: abs('/'),
    name: WEBSITE_NAME,
    inLanguage: 'en-GB',
    publisher: { '@id': BUSINESS_ID },
  };
}

// Menu label for top-level sections, otherwise the page's own title.
function crumbName(page: Page): string {
  const nav = mainNav.find((link) => link.href === page.path);
  if (nav) return nav.label;
  return page.kind === 'legal' ? page.heading : page.title;
}

function breadcrumbs(page: Page): Node {
  const segments = page.path.split('/').filter(Boolean);
  const trail: { name: string; path: string }[] = [{ name: 'Home', path: '/' }];
  segments.forEach((_, i) => {
    const ancestorPath = `/${segments.slice(0, i + 1).join('/')}/`;
    const ancestor = ancestorPath === page.path ? page : getPage(ancestorPath);
    if (ancestor) trail.push({ name: crumbName(ancestor), path: ancestorPath });
  });
  return {
    '@type': 'BreadcrumbList',
    '@id': abs(`${page.path}#breadcrumb`),
    itemListElement: trail.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: abs(crumb.path),
    })),
  };
}

const isServicePage = (page: Page) => page.kind === 'inner' && /^\/(services|internal|external)\//.test(page.path);

function service(page: Page): Node {
  const description = page.seo.description ?? page.subheading ?? page.lead;
  return {
    '@type': 'Service',
    '@id': abs(`${page.path}#service`),
    name: page.title,
    serviceType: page.title,
    url: abs(page.path),
    ...(description ? { description } : {}),
    ...(page.hero ? { image: abs(page.ogImage.src) } : {}),
    provider: { '@id': BUSINESS_ID },
    areaServed: AREA_SERVED,
  };
}

function article(page: Page, type: 'BlogPosting' | 'Article'): Node {
  return {
    '@type': type,
    '@id': abs(`${page.path}#article`),
    headline: page.title,
    url: abs(page.path),
    mainEntityOfPage: abs(page.path),
    ...(page.seo.description ? { description: page.seo.description } : {}),
    ...(page.publishedTime ? { datePublished: page.publishedTime } : {}),
    ...(page.modifiedTime ? { dateModified: page.modifiedTime } : {}),
    ...(page.hero ? { image: abs(page.ogImage.src) } : {}),
    inLanguage: 'en-GB',
    author: { '@id': BUSINESS_ID },
    publisher: { '@id': BUSINESS_ID },
    isPartOf: { '@id': WEBSITE_ID },
  };
}

export function pageSchema(page: Page): Node {
  const graph: Node[] = [business(), website()];
  if (page.path !== '/') graph.push(breadcrumbs(page));
  if (isServicePage(page)) graph.push(service(page));
  if (page.kind === 'blogPost') graph.push(article(page, 'BlogPosting'));
  if (page.kind === 'caseStudy') graph.push(article(page, 'Article'));
  return { '@context': 'https://schema.org', '@graph': graph };
}
