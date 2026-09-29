import Link from 'next/link';
import { activeCategories, categoryLabel, cookies } from '../../lib/consent/config';
import { legal } from '../../lib/legal';
import CookieSettingsButton from '../CookieSettingsButton/CookieSettingsButton';
import Placeholder from '../Placeholder/Placeholder';
import styles from './Legal.module.css';

// Draft cookie policy (brief 9). The table is generated from the same config
// as the consent banner (lib/consent/config.ts), so the two always match.
export default function CookiePolicy() {
  const optional = activeCategories.filter((c) => !c.alwaysOn);
  return (
    <div className={styles.legal}>
      <p className={styles.updated}>
        Last updated: <Placeholder fact={legal.lastUpdated} />
      </p>

      <p>
        Cookies are small files that a website stores on your device. This page lists every cookie this website uses and
        what it is for. For how we handle personal information more generally, see our{' '}
        <Link href="/contact-us/privacy-policy/">privacy notice</Link>.
      </p>

      <h2>The cookies we use</h2>
      {optional.length === 0 ? (
        <p>
          We only use cookies that are strictly necessary for the website to work. We do not use analytics, advertising or
          social media cookies.
        </p>
      ) : (
        <p>
          Strictly necessary cookies are always on. We only set other cookies, or load any service that sets them, after
          you have chosen to allow them.
        </p>
      )}

      <div className={styles.tableWrap} tabIndex={0} role="region" aria-labelledby="cookie-table-caption">
        <table className={styles.table}>
          <caption id="cookie-table-caption">Cookies on this website</caption>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Provider</th>
              <th scope="col">Purpose</th>
              <th scope="col">Category</th>
              <th scope="col">Duration</th>
            </tr>
          </thead>
          <tbody>
            {cookies.map((cookie) => (
              <tr key={cookie.name}>
                <td>
                  <code>{cookie.name}</code>
                </td>
                <td>{cookie.provider}</td>
                <td>{cookie.purpose}</td>
                <td>{categoryLabel(cookie.category)}</td>
                <td>{cookie.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Cookie categories</h2>
      <dl className={styles.definitions}>
        {activeCategories.map((c) => (
          <div key={c.id}>
            <dt>{c.label}</dt>
            <dd>{c.description}</dd>
          </div>
        ))}
      </dl>

      <h2>Changing your choices</h2>
      <p>
        You can change or withdraw your choices at any time, as easily as you made them, using the Cookie settings link at
        the bottom of every page or this button:
      </p>
      <p>
        <CookieSettingsButton className={styles.button} />
      </p>
      <p>
        You can also delete or block cookies in your browser settings. If you block strictly necessary cookies, we will not
        be able to remember your choices.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        If we change the cookies we use, we will update this page and ask for your choices again. The date at the top shows
        when it was last updated.
      </p>
    </div>
  );
}
