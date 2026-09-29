'use client';

// Provides consent state to the whole app and controls when the banner and
// the settings panel show. Ported from LHM (CookieConsentProvider.tsx).
//
// Changes from LHM: consent is read with useSyncExternalStore from the
// consent cookie; the banner only appears when there is at least one optional
// category to choose (brief 7.4); the settings panel also opens from a window
// event so server components can render a Cookie settings button; and
// withdrawing a category reloads the page so scripts already running stop.

import { createContext, useCallback, useContext, useEffect, useState, useSyncExternalStore } from 'react';
import { activeCategories, categories, type ConsentCategory } from '../../lib/consent/config';
import { OPEN_SETTINGS_EVENT } from '../../lib/consent/events';
import {
  DENY_ALL,
  GRANT_ALL,
  clearAnalyticsCookies,
  getServerSnapshot,
  getSnapshot,
  subscribe,
  writeConsent,
  type ConsentCategories,
  type ConsentState,
} from './consent';

type ConsentContextValue = {
  consent: ConsentState;
  optional: ConsentCategory[]; // categories the visitor can switch on or off
  preview: boolean;
  bannerOpen: boolean;
  settingsOpen: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (categories: ConsentCategories) => void;
  openSettings: () => void;
  closeSettings: () => void;
};

const CookieConsentContext = createContext<ConsentContextValue | null>(null);

// Review aid: on localhost, add ?cookie-preview to any URL to see the banner
// with every category, before any analytics or marketing tool is configured.
function subscribeNone() {
  return () => {};
}
function readPreview() {
  const { hostname, search } = window.location;
  return (hostname === 'localhost' || hostname === '127.0.0.1') && new URLSearchParams(search).has('cookie-preview');
}

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const consent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const preview = useSyncExternalStore(subscribeNone, readPreview, () => false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  const optional = (preview ? categories : activeCategories).filter((c) => !c.alwaysOn);

  // Footer and cookie policy buttons ask for the panel with a window event.
  useEffect(() => {
    const open = () => setSettingsOpen(true);
    window.addEventListener(OPEN_SETTINGS_EVENT, open);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, open);
  }, []);

  const apply = useCallback(
    (next: ConsentCategories) => {
      const previous = consent;
      writeConsent(next);
      if (!next.analytics) clearAnalyticsCookies();
      setSettingsOpen(false);
      setAnnouncement('Your cookie choices have been saved. You can change them at any time from Cookie settings.');
      // Scripts that already ran cannot be unloaded, so reload after a withdrawal.
      if (previous && ((previous.analytics && !next.analytics) || (previous.marketing && !next.marketing))) {
        window.location.reload();
      }
    },
    [consent],
  );

  const acceptAll = useCallback(() => apply(GRANT_ALL), [apply]);
  const rejectAll = useCallback(() => apply(DENY_ALL), [apply]);
  const savePreferences = useCallback((c: ConsentCategories) => apply(c), [apply]);
  const openSettings = useCallback(() => setSettingsOpen(true), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  // The first-visit banner shows once the stored choice is known to be
  // missing, and only if there is something to choose.
  const bannerOpen = consent === null && optional.length > 0 && !settingsOpen;

  return (
    <CookieConsentContext.Provider
      value={{
        consent,
        optional,
        preview,
        bannerOpen,
        settingsOpen,
        acceptAll,
        rejectAll,
        savePreferences,
        openSettings,
        closeSettings,
      }}
    >
      {children}
      <p className="visually-hidden" role="status">
        {announcement}
      </p>
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent(): ConsentContextValue {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) throw new Error('useCookieConsent must be used inside CookieConsentProvider');
  return ctx;
}
