import Link from 'next/link';
import PageTitle from '../components/page/PageTitle';
import styles from './not-found.module.css';

export const metadata = { title: 'Page not found - Complete restoration company' };

export default function NotFound() {
  return (
    <>
      <PageTitle heading="Page not found" />
      <div className={styles.body}>
        <p>Sorry, we could not find that page. It may have moved when we updated our website.</p>
        <p>
          <Link href="/">Go to the home page</Link> or <Link href="/contact-us/">contact us</Link>.
        </p>
      </div>
    </>
  );
}
