// Cookie and consent configuration. The single source for the consent banner
// and the cookie policy table, so the two can never disagree (brief 9).
//
// Only categories that have something in them are shown (brief 7.4). At
// present the site sets one strictly necessary cookie; analytics and
// marketing are empty until Steve confirms which tools to use
// (PLACEHOLDERS.md: ANALYTICS_TOOL, MARKETING_TAGS).

export type ConsentCategoryId = 'necessary' | 'analytics' | 'marketing';

export type ConsentCategory = {
  id: ConsentCategoryId;
  label: string;
  description: string;
  // What the banner says it would like to do with this category.
  bannerText?: string;
  alwaysOn: boolean;
};

export type CookieInfo = {
  name: string;
  provider: string;
  purpose: string;
  category: ConsentCategoryId;
  duration: string;
};

// Stored choice: first-party cookie, at most 6 months, versioned so that a
// policy change asks again (brief 7.8).
export const CONSENT_COOKIE = {
  name: 'cr_consent',
  maxAgeDays: 182,
  version: 1,
};

export const categories: ConsentCategory[] = [
  {
    id: 'necessary',
    label: 'Strictly necessary',
    description: 'Needed for the website to work, such as remembering your cookie choices. These are always on.',
    alwaysOn: true,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    description: 'Help us understand how visitors use the website so we can improve it.',
    bannerText: 'analytics cookies to understand how you use the website, so we can improve it',
    alwaysOn: false,
  },
  {
    id: 'marketing',
    label: 'Marketing',
    description: 'Used by advertising and social media services to show you relevant adverts.',
    bannerText: 'marketing cookies to show you relevant adverts on other websites',
    alwaysOn: false,
  },
];

// Google Analytics 4, only if a measurement ID is configured. It loads only
// after analytics consent (components/consent/ConsentScripts.tsx).
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export const cookies: CookieInfo[] = [
  {
    name: CONSENT_COOKIE.name,
    provider: 'The Complete Restoration Company (this website)',
    purpose: 'Remembers the cookie choices you have made, so we do not ask again on every page.',
    category: 'necessary',
    duration: '6 months',
  },
  ...(GA_ID
    ? ([
        {
          name: '_ga',
          provider: 'Google Analytics',
          purpose: 'Distinguishes visitors so we can count visits and see how the website is used.',
          category: 'analytics',
          duration: '2 years',
        },
        {
          name: `_ga_${GA_ID.replace(/^G-/, '')}`,
          provider: 'Google Analytics',
          purpose: 'Keeps track of your current visit for Google Analytics.',
          category: 'analytics',
          duration: '2 years',
        },
      ] satisfies CookieInfo[])
    : []),
];

export function categoryLabel(id: ConsentCategoryId): string {
  return categories.find((c) => c.id === id)?.label ?? id;
}

// Categories with at least one cookie or script in them.
export const activeCategories: ConsentCategory[] = categories.filter(
  (c) => c.alwaysOn || cookies.some((cookie) => cookie.category === c.id),
);
