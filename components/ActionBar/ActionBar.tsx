'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { contact } from '../../lib/site';
import { useCookieConsent } from '../consent/CookieConsentProvider';
import { PhoneIcon, QuoteIcon } from '../icons';
import styles from './ActionBar.module.css';

// Pages with the quote form give it id="quote".
const QUOTE_ID = 'quote';
const CONTACT_QUOTE = `/contact-us/#${QUOTE_ID}`;

// Fixed bottom bar on phones: Call and Get a quote. It hides while the quote
// form is on screen so it never covers the form's buttons, and while the
// cookie banner is open so it never covers the banner (brief 6.8).
export default function ActionBar() {
  const pathname = usePathname();
  const { bannerOpen } = useCookieConsent();
  // Set by the observer, which fires once on observe, so a record for the
  // current path means this page has the form.
  const [form, setForm] = useState<{ path: string; visible: boolean } | null>(null);

  useEffect(() => {
    const element = document.getElementById(QUOTE_ID);
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      setForm({ path: pathname, visible: entry.isIntersecting });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [pathname]);

  const formOnPage = form?.path === pathname;
  const quoteHref = formOnPage ? `#${QUOTE_ID}` : CONTACT_QUOTE;
  const formVisible = formOnPage && form.visible;

  return (
    <div className={styles.bar} data-hidden={formVisible || bannerOpen}>
      <a className={styles.action} href={contact.phoneHref}>
        <PhoneIcon className={styles.icon} />
        Call
      </a>
      <a className={`${styles.action} ${styles.primary}`} href={quoteHref}>
        <QuoteIcon className={styles.icon} />
        Get a quote
      </a>
    </div>
  );
}
