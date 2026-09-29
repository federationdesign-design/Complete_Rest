import styles from './QuoteSection.module.css';

// The "Get a quote" panel on the brick background. id="quote" is the target
// of the bottom action bar.
export default function QuoteSection({ title, children }: { title: string | null; children?: React.ReactNode }) {
  return (
    <section className={styles.quote} id="quote" aria-labelledby="quote-heading">
      <h2 className={title ? styles.heading : 'visually-hidden'} id="quote-heading">
        {title ?? 'Get a quote'}
      </h2>
      {children}
    </section>
  );
}
