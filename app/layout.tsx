import type { Metadata, Viewport } from 'next';
import { Crimson_Text, Lato } from 'next/font/google';
import ActionBar from '../components/ActionBar/ActionBar';
import { Analytics, MarketingScripts } from '../components/consent/ConsentScripts';
import CookieBanner from '../components/consent/CookieBanner';
import { CookieConsentProvider } from '../components/consent/CookieConsentProvider';
import CookieSettingsDialog from '../components/consent/CookieSettingsDialog';
import SiteFooter from '../components/SiteFooter/SiteFooter';
import SiteHeader from '../components/SiteHeader/SiteHeader';
import { SITE_URL } from '../lib/metadata';
import './globals.css';

// next/font downloads these at build time and serves them from this site,
// so no visitor request goes to Google.
const crimson = Crimson_Text({
  variable: '--font-crimson',
  subsets: ['latin'],
  weight: ['400', '600'],
  display: 'swap',
});

const lato = Lato({
  variable: '--font-lato',
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Complete restoration company',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#6e6e6d',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${crimson.variable} ${lato.variable}`}>
      <body>
        <CookieConsentProvider>
          {/* First in the page so keyboard and screen reader users reach it first. */}
          <CookieBanner />
          <SiteHeader />
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          <SiteFooter />
          <ActionBar />
          <CookieSettingsDialog />
          <Analytics />
          <MarketingScripts />
        </CookieConsentProvider>
      </body>
    </html>
  );
}
