'use client';

import { useEffect, useState } from 'react';
import { getOpenStatus, openingHours, type OpenStatus as Status } from '../../lib/hours';
import styles from './OpenStatus.module.css';

// Open / closed status tag, ported from the LHM contact page: a coloured dot
// (green open, amber closing soon, red closed) with a label, refreshed every
// minute. It renders nothing until opening hours are set in lib/hours.ts
// (PLACEHOLDERS.md, OPENING_HOURS), and nothing on the server, because the
// status depends on the time the page is viewed.
export default function OpenStatus() {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    if (!openingHours) return;
    const hours = openingHours;
    const update = () => setStatus(getOpenStatus(hours));
    const first = setTimeout(update, 0);
    const interval = setInterval(update, 60000);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, []);

  if (!status) return null;
  return (
    <p className={styles.status}>
      <span className={styles.dot} data-state={status.state} aria-hidden="true" />
      {status.label}
    </p>
  );
}
