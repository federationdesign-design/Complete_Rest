'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { contact, isCurrent, mainNav, siteName } from '../../lib/site';
import HeaderSentinel from '../HeaderSentinel/HeaderSentinel';
import { CloseIcon, MailIcon, MenuIcon, PhoneIcon, PinIcon } from '../icons';
import styles from './SiteHeader.module.css';

// The logo links to the home page, so its alt text names the destination.
// (The WordPress media library alt, "complete restoration", is not used here.)
const LOGO = { src: '/images/CompleteRestorationlogo-1.svg', width: 279, height: 60, alt: `${siteName}, home` };
// Phones (mobile round 1): the tall logo in the header and menu panel.
const LOGO_TALL = { src: '/images/CR-logo-tall.svg', width: 279, height: 55, alt: LOGO.alt };
// Phones: the short, single-line logo in the compact bar after scrolling.
const LOGO_SHORT = { src: '/images/CR-logo-short.svg', width: 279, height: 21, alt: LOGO.alt };

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function SiteHeader() {
  const pathname = usePathname();
  const [compact, setCompact] = useState(false);
  // The menu is open for the path it was opened on, so navigating closes it.
  const [menuOpenOn, setMenuOpenOn] = useState<string | null>(null);
  const menuOpen = menuOpenOn === pathname;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);

  // Show the compact bar once the last sentinel on the page has scrolled
  // above the viewport. The header renders a default sentinel; pages with a
  // hero render another one after it, which takes precedence.
  useEffect(() => {
    const sentinels = document.querySelectorAll('[data-header-sentinel]');
    const target = sentinels[sentinels.length - 1];
    if (!target) return;
    // The observed area is everything above the top of the viewport (the
    // root is extended far upwards and its bottom edge moved to the top), so
    // the sentinel intersects exactly when it has scrolled off the top. This
    // also catches jumps straight past it, such as the End key, an anchor
    // link or a restored scroll position, which a plain "left the viewport"
    // check misses when the sentinel was never on screen.
    const observer = new IntersectionObserver(([entry]) => setCompact(entry.isIntersecting), {
      rootMargin: '100000px 0px -100% 0px',
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [pathname]);

  // Keep the native dialog in step with state.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (menuOpen && !dialog.open) {
      dialog.showModal();
    } else if (!menuOpen && dialog.open) {
      dialog.close();
    }
  }, [menuOpen]);

  function openMenu(button: HTMLButtonElement) {
    openerRef.current = button;
    setMenuOpenOn(pathname);
  }

  // Fired by Escape, the close button and link clicks.
  function handleDialogClose() {
    setMenuOpenOn(null);
    openerRef.current?.focus();
  }

  // Native modal dialogs make the page inert; this also keeps Tab cycling
  // inside the panel rather than escaping to the browser chrome.
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
    <>
      <a className={styles.skipLink} href="#main">
        Skip to content
      </a>

      <header className={styles.header}>
        <div className={styles.strip}>
          <div className={styles.stripInner}>
            <p className={styles.tagline}>{siteName}</p>
            <a className={styles.stripLink} href={contact.phoneHref}>
              <PhoneIcon className={styles.stripIcon} />
              <span className="visually-hidden">Call </span>
              {contact.phoneDisplay}
            </a>
            <a className={styles.stripLink} href={contact.emailHref}>
              <MailIcon className={styles.stripIcon} />
              <span className="visually-hidden">Email </span>
              {contact.email}
            </a>
            <Link className={`${styles.stripLink} ${styles.findUs}`} href="/contact-us/">
              <PinIcon className={styles.stripIcon} />
              Find us
            </Link>
          </div>
        </div>

        <div className={styles.panel}>
          <Link className={styles.logoLink} href="/" aria-current={pathname === '/' ? 'page' : undefined}>
            <Image
              className={styles.logoTall}
              src={LOGO_TALL.src}
              width={LOGO_TALL.width}
              height={LOGO_TALL.height}
              alt={LOGO_TALL.alt}
              priority
            />
            <Image
              className={styles.logo}
              src={LOGO.src}
              width={LOGO.width}
              height={LOGO.height}
              alt={LOGO.alt}
              priority
            />
          </Link>
          <button
            type="button"
            className={`${styles.menuButton} ${styles.panelMenuButton}`}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            onClick={(e) => openMenu(e.currentTarget)}
          >
            <MenuIcon className={styles.menuIcon} />
            <span className={styles.menuLabel}>Menu</span>
          </button>
        </div>

        <nav className={styles.nav} aria-label="Main">
          <ul className={styles.navList}>
            {mainNav.map((link) => (
              <li key={link.href} className={styles.navItem}>
                <Link
                  className={styles.navLink}
                  href={link.href}
                  aria-current={pathname === link.href ? 'page' : undefined}
                  data-section={isCurrent(link.href, pathname) || undefined}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <HeaderSentinel />

      <div className={styles.compact} data-visible={compact}>
        <Link className={styles.compactLogoLink} href="/">
          <Image
            className={styles.logoShort}
            src={LOGO_SHORT.src}
            width={LOGO_SHORT.width}
            height={LOGO_SHORT.height}
            alt={LOGO_SHORT.alt}
          />
          <Image
            className={styles.compactLogo}
            src={LOGO.src}
            width={LOGO.width}
            height={LOGO.height}
            alt={LOGO.alt}
          />
        </Link>
        <button
          type="button"
          className={styles.menuButton}
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          onClick={(e) => openMenu(e.currentTarget)}
        >
          <MenuIcon className={styles.menuIcon} />
          <span className={styles.menuLabel}>Menu</span>
        </button>
      </div>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-label="Menu"
        onClose={handleDialogClose}
        onKeyDown={trapFocus}
      >
        <div className={styles.dialogHead}>
          <span className={styles.dialogLogo}>
            <Image
              className={styles.logoTall}
              src={LOGO_TALL.src}
              width={LOGO_TALL.width}
              height={LOGO_TALL.height}
              alt=""
            />
            <Image
              className={styles.compactLogo}
              src={LOGO.src}
              width={LOGO.width}
              height={LOGO.height}
              alt=""
            />
          </span>
          <button
            type="button"
            className={styles.menuButton}
            aria-label="Close menu"
            onClick={() => dialogRef.current?.close()}
          >
            <CloseIcon className={styles.menuIcon} />
            <span className={`${styles.menuLabel} ${styles.closeLabel}`}>Close</span>
          </button>
        </div>
        <nav aria-label="Main">
          <ul className={styles.dialogList}>
            {mainNav.map((link) => (
              <li key={link.href}>
                <Link
                  className={styles.dialogLink}
                  href={link.href}
                  aria-current={pathname === link.href ? 'page' : undefined}
                  onClick={() => dialogRef.current?.close()}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.dialogContact}>
          <a className={styles.dialogAction} href={contact.phoneHref}>
            <PhoneIcon className={styles.stripIcon} />
            Call {contact.phoneDisplay}
          </a>
          <a className={styles.dialogAction} href={contact.emailHref}>
            <MailIcon className={styles.stripIcon} />
            <span className={styles.email}>{contact.email}</span>
          </a>
        </div>
      </dialog>
    </>
  );
}
