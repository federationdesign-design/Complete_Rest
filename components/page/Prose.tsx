import styles from './Prose.module.css';

// Verbatim copy from the live site, cleaned by scripts/build-content.mjs.
export default function Prose({ html, className }: { html: string; className?: string }) {
  return <div className={className ? `${styles.prose} ${className}` : styles.prose} dangerouslySetInnerHTML={{ __html: html }} />;
}
