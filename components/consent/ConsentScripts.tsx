'use client';

// Non-essential scripts, loaded only after consent (brief 7.2). Ported from
// LHM (Analytics.tsx). Nothing renders until the visitor has chosen, so no
// script, pixel or tag loads before then; the gate is in code, not CSS.

import Script from 'next/script';
import { GA_ID } from '../../lib/consent/config';
import { useCookieConsent } from './CookieConsentProvider';

export function Analytics() {
  const { consent } = useCookieConsent();
  if (!GA_ID) return null; // no measurement ID configured (PLACEHOLDERS.md: ANALYTICS_TOOL)
  if (!consent?.analytics) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}', { anonymize_ip: true });`}
      </Script>
    </>
  );
}

// Marketing slot, empty until Steve confirms any pixels (PLACEHOLDERS.md:
// MARKETING_TAGS). Add the pixel here and list its cookies in
// lib/consent/config.ts; it is then gated on marketing consent automatically.
export function MarketingScripts() {
  const { consent } = useCookieConsent();
  if (!consent?.marketing) return null;
  return null;
}
