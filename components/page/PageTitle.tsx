import HeaderSentinel from '../HeaderSentinel/HeaderSentinel';
import styles from './PageTitle.module.css';

// Title block for pages that have no hero image on the live site.
export default function PageTitle({ heading, subheading }: { heading: string; subheading?: string | null }) {
  return (
    <>
      <header className={styles.title}>
        <h1 className={styles.heading} id="page-heading">
          {heading}
        </h1>
        {subheading && <p className={styles.subheading}>{subheading}</p>}
      </header>
      <HeaderSentinel />
    </>
  );
}
