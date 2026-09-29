'use client';

// Preferences panel, reopened at any time from Cookie settings (brief 7.7).
// LHM showed this in the banner overlay; here it is a native modal dialog so
// it traps focus, closes on Escape and returns focus to the button that
// opened it.

import Link from 'next/link';
import { useEffect, useRef, type KeyboardEvent } from 'react';
import { CloseIcon } from '../icons';
import { useCookieConsent } from './CookieConsentProvider';
import { DENY_ALL } from './consent';
import Preferences from './Preferences';
import styles from './Consent.module.css';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function CookieSettingsDialog() {
  const { settingsOpen, closeSettings, optional, consent, savePreferences, acceptAll, rejectAll } = useCookieConsent();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (settingsOpen && !dialog.open) {
      openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.showModal();
    } else if (!settingsOpen && dialog.open) {
      dialog.close();
    }
  }, [settingsOpen]);

  function handleClose() {
    closeSettings();
    openerRef.current?.focus();
  }

  function trapFocus(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== 'Tab' || !dialogRef.current) return;
    const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="cookie-settings-heading"
      onClose={handleClose}
      onKeyDown={trapFocus}
    >
      <div className={styles.dialogHead}>
        <h2 className={styles.heading} id="cookie-settings-heading">
          Cookie settings
        </h2>
        <button type="button" className={styles.close} onClick={() => dialogRef.current?.close()}>
          <CloseIcon className={styles.closeIcon} />
          <span className="visually-hidden">Close cookie settings</span>
        </button>
      </div>
      {settingsOpen && (
        <>
          {optional.length === 0 ? (
            <p className={styles.text}>
              This website only uses a strictly necessary cookie, which remembers your cookie choices. There are no
              analytics or marketing cookies to switch on or off.{' '}
              <Link href="/contact-us/cookies-policy/">Read our cookie policy</Link>.
            </p>
          ) : (
            <>
              <p className={styles.text}>
                You can change your choices at any time. <Link href="/contact-us/cookies-policy/">Read our cookie policy</Link>.
              </p>
              <div className={styles.actions}>
                <button type="button" className={styles.choice} onClick={acceptAll}>
                  Accept all
                </button>
                <button type="button" className={styles.choice} onClick={rejectAll}>
                  Reject all
                </button>
              </div>
              <Preferences optional={optional} initial={consent ?? DENY_ALL} idPrefix="settings" onSave={savePreferences} />
            </>
          )}
        </>
      )}
    </dialog>
  );
}
