'use client';

import { OPEN_SETTINGS_EVENT } from '../../lib/consent/events';

// Reopens the cookie preferences panel from anywhere (footer, cookie policy).
export default function CookieSettingsButton({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT))}>
      {children ?? 'Cookie settings'}
    </button>
  );
}
