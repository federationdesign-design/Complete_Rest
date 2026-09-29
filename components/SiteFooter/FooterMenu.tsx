'use client';

import Link from 'next/link';
import { useId, useState } from 'react';
import type { FooterMenu as FooterMenuData } from '../../lib/site';
import { ChevronIcon } from '../icons';
import styles from './SiteFooter.module.css';

// On phones each menu is a disclosure, closed by default. From tablet up the
// toggle is hidden and every menu is shown open with its original heading.
export default function FooterMenu({ menu }: { menu: FooterMenuData }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const headingId = `${id}-heading`;
  const listId = `${id}-list`;

  return (
    <nav className={styles.menu} aria-labelledby={headingId}>
      <h2 className={styles.menuTitle} id={headingId}>
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((value) => !value)}
        >
          {menu.title}
          <ChevronIcon className={styles.chevron} />
        </button>
        <span className={styles.staticTitle}>
          {menu.href ? (
            <Link className={styles.menuTitleLink} href={menu.href}>
              {menu.title}
            </Link>
          ) : (
            menu.title
          )}
        </span>
      </h2>
      <ul className={styles.list} id={listId} data-open={open}>
        {menu.href && (
          <li className={styles.mobileOnly}>
            <Link className={styles.link} href={menu.href}>
              {menu.title}
            </Link>
          </li>
        )}
        {menu.links.map((link) => (
          <li key={link.href + link.label}>
            <Link className={styles.link} href={link.href}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
