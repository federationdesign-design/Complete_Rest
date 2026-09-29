'use client';

// First-visit banner, ported from LHM (CookieBanner.tsx).
//
// Changes from LHM: Accept all and Reject all are the same size and style
// (brief 7.3); "Manage choices" opens the category choices in place; the
// banner is a labelled region rather than a modal, because the page behind it
// stays usable; and the categories come from lib/consent/config.ts.

import Link from 'next/link';
import { useState } from 'react';
import { useCookieConsent } from './CookieConsentProvider';
import { DENY_ALL, type ConsentCategories } from './consent';
import Preferences from './Preferences';
import styles from './Consent.module.css';

// After a choice the banner disappears, so move focus somewhere sensible.
function focusMain() {
  document.getElementById('main')?.focus();
}

export default function CookieBanner() {
  const { bannerOpen, optional, preview, acceptAll, rejectAll, savePreferences } = useCookieConsent();
  const [managing, setManaging] = useState(false);
  if (!bannerOpen) return null;

  const wants = optional.map((c) => c.bannerText).filter(Boolean).join(', and ');
  const choose = (action: () => void) => () => {
    action();
    focusMain();
  };

  return (
    <section className={styles.banner} aria-labelledby="cookie-banner-heading">
      <div className={styles.bannerInner}>
        <h2 className={styles.heading} id="cookie-banner-heading">
          Cookies on this website
        </h2>
        {preview && <p className={styles.preview}>Preview: no analytics or marketing tools are set up yet.</p>}
        <p className={styles.text}>
          We use a strictly necessary cookie to make this website work. We would also like to use {wants}. We will only
          do this if you agree. <Link href="/contact-us/cookies-policy/">Read our cookie policy</Link>.
        </p>
        {managing ? (
          <Preferences
            optional={optional}
            initial={DENY_ALL}
            idPrefix="banner"
            onSave={(c: ConsentCategories) => {
              savePreferences(c);
              focusMain();
            }}
          />
        ) : (
          <div className={styles.actions}>
            <button type="button" className={styles.choice} onClick={choose(acceptAll)}>
              Accept all
            </button>
            <button type="button" className={styles.choice} onClick={choose(rejectAll)}>
              Reject all
            </button>
            <button type="button" className={styles.manage} onClick={() => setManaging(true)}>
              Manage choices
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
