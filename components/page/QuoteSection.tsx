import styles from './QuoteSection.module.css';

// One title for the quote form wherever it appears (round 2, item 2). It
// replaces the per-page titles carried over from the live site.
export const QUOTE_TITLE = 'Interested in us looking at your restoration project?';

// The quote panel. id="quote" is the target of the bottom action bar.
export default function QuoteSection({ children }: { children?: React.ReactNode }) {
  return (
    <section className={styles.quote} id="quote" aria-labelledby="quote-heading">
      <h2 className={styles.heading} id="quote-heading">
        {QUOTE_TITLE}
      </h2>
      {children}
    </section>
  );
}
