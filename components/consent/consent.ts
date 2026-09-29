// Consent model and storage, ported from the LHM site
// (app/components/cookies/consent.ts).
//
// Changes from LHM, for this brief (section 7):
//  - The choice is stored in a first-party cookie for at most 6 months
//    (LHM used localStorage), named and versioned in lib/consent/config.ts.
//  - It is exposed as a small external store for useSyncExternalStore, so
//    reading it after hydration needs no setState in an effect.

import { CONSENT_COOKIE } from '../../lib/consent/config';

export type ConsentCategories = {
  necessary: true; // always granted, cannot be switched off
  analytics: boolean;
  marketing: boolean;
};

// null: no choice yet (show the banner). undefined: not known yet (server
// render and first client render), so nothing is shown or loaded.
export type ConsentState = ConsentCategories | null | undefined;

type StoredConsent = { v: number; a: 0 | 1; m: 0 | 1; t: string };

export const GRANT_ALL: ConsentCategories = { necessary: true, analytics: true, marketing: true };
export const DENY_ALL: ConsentCategories = { necessary: true, analytics: false, marketing: false };

function readCookie(): string {
  const prefix = `${CONSENT_COOKIE.name}=`;
  return document.cookie.split('; ').find((c) => c.startsWith(prefix))?.slice(prefix.length) ?? '';
}

function parse(raw: string): ConsentCategories | null {
  if (!raw) return null;
  try {
    const stored = JSON.parse(decodeURIComponent(raw)) as StoredConsent;
    // Policy changed since the choice was made: ask again.
    if (stored.v !== CONSENT_COOKIE.version) return null;
    return { necessary: true, analytics: stored.a === 1, marketing: stored.m === 1 };
  } catch {
    return null;
  }
}

const listeners = new Set<() => void>();
let cachedRaw: string | undefined;
let cached: ConsentCategories | null = null;

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): ConsentCategories | null {
  const raw = readCookie();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cached = parse(raw);
  }
  return cached;
}

export function getServerSnapshot(): undefined {
  return undefined;
}

export function writeConsent(categories: ConsentCategories): void {
  const stored: StoredConsent = {
    v: CONSENT_COOKIE.version,
    a: categories.analytics ? 1 : 0,
    m: categories.marketing ? 1 : 0,
    t: new Date().toISOString(),
  };
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie =
    `${CONSENT_COOKIE.name}=${encodeURIComponent(JSON.stringify(stored))}; Max-Age=${CONSENT_COOKIE.maxAgeDays * 86400}` +
    `; Path=/; SameSite=Lax${secure}`;
  for (const listener of listeners) listener();
}

// When a visitor withdraws analytics consent, clear the GA cookies that may
// already be set rather than waiting for them to expire (unchanged from LHM).
export function clearAnalyticsCookies(): void {
  const host = window.location.hostname;
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=')[0]?.trim();
    if (!name) continue;
    if (name === '_ga' || name.startsWith('_ga_') || name === '_gid' || name.startsWith('_gat')) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${host}`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${host}`;
    }
  }
}
