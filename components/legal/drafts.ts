import type { ComponentType } from 'react';
import CookiePolicy from './CookiePolicy';
import PrivacyNotice from './PrivacyNotice';
import WebsiteTerms from './WebsiteTerms';

// Drafted legal pages replace the live copy at the same URLs (brief 9).
export const legalDrafts: Record<string, ComponentType> = {
  '/contact-us/privacy-policy/': PrivacyNotice,
  '/contact-us/cookies-policy/': CookiePolicy,
  '/contact-us/disclaimer/': WebsiteTerms,
};
