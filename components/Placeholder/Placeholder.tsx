import type { Fact } from '../../lib/company';
import styles from './Placeholder.module.css';

// Renders a confirmed fact, or a clearly marked placeholder that is easy to
// find on the page and in the HTML (data-placeholder="ID").
export default function Placeholder({ fact }: { fact: Fact }) {
  if ('value' in fact) return <>{fact.value}</>;
  return (
    <span className={styles.placeholder} data-placeholder={fact.placeholder}>
      [{fact.label}]
    </span>
  );
}
