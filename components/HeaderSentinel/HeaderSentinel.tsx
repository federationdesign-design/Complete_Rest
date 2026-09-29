import styles from './HeaderSentinel.module.css';

// Place directly after a page hero. When it scrolls above the viewport the
// header switches to its compact bar (see SiteHeader).
export default function HeaderSentinel() {
  return <div className={styles.sentinel} data-header-sentinel aria-hidden="true" />;
}
