import Image from 'next/image';
import Link from 'next/link';
import { company } from '../../lib/company';
import { footerMenus, siteName } from '../../lib/site';
import Placeholder from '../Placeholder/Placeholder';
import styles from './SiteFooter.module.css';

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <Link className={styles.logoLink} href="/">
          <Image
            className={styles.logo}
            src="/images/CompleteRestorationlogo.svg"
            width={279}
            height={60}
            alt={`${siteName}, home`}
          />
        </Link>

        <div className={styles.menus}>
          {footerMenus.map((menu) => (
            <nav key={menu.title} className={styles.menu} aria-labelledby={`footer-${slug(menu.title)}`}>
              <h2 className={styles.menuTitle} id={`footer-${slug(menu.title)}`}>
                {menu.href ? (
                  <Link className={styles.menuTitleLink} href={menu.href}>
                    {menu.title}
                  </Link>
                ) : (
                  menu.title
                )}
              </h2>
              <ul className={styles.list}>
                {menu.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link className={styles.link} href={link.href}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className={styles.legal}>
          <p>
            {siteName} is the trading name of <Placeholder fact={company.legalName} />, a company registered in
            England and Wales with company number <Placeholder fact={company.companyNumber} />.
          </p>
          <p>
            Registered office: <Placeholder fact={company.registeredOffice} />. VAT number{' '}
            <Placeholder fact={company.vatNumber} />.
          </p>
        </div>
      </div>
    </footer>
  );
}

function slug(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}
