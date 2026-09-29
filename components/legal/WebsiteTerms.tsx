import Link from 'next/link';
import { company } from '../../lib/company';
import { legal } from '../../lib/legal';
import { siteName } from '../../lib/site';
import Placeholder from '../Placeholder/Placeholder';
import styles from './Legal.module.css';

// Website terms (brief 9): the live disclaimer rewritten in plain English,
// with the correct legal entity and without the clause that treated using the
// site as agreement to data use. For the client to sign off before launch.
export default function WebsiteTerms() {
  const name = <Placeholder fact={company.legalName} />;
  return (
    <div className={styles.legal}>
      <p className={styles.updated}>
        Last updated: <Placeholder fact={legal.lastUpdated} />
      </p>

      <h2>About these terms</h2>
      <p>
        These terms apply when you use www.completerestoration.co.uk. The website is run by {name}, trading as {siteName}
        (&ldquo;we&rdquo;, &ldquo;us&rdquo;). Our company number is <Placeholder fact={company.companyNumber} /> and our
        registered office is <Placeholder fact={company.registeredOffice} />.
      </p>

      <h2>Information on this website</h2>
      <p>
        We provide this website and its content as it is, for general information. We try to keep it accurate and up to
        date, but we do not promise that the information, pictures or graphics are complete, accurate or suitable for any
        particular purpose, and they may contain technical mistakes or typing errors.
      </p>

      <h2>Our liability</h2>
      <p>
        As far as the law allows, neither we nor our partners, employees or representatives are liable for any loss or
        damage arising from your use of this website, or from any mistakes in it. This includes direct, indirect or
        consequential loss, loss of data, income or profit, loss of or damage to property, and claims by third parties.
      </p>

      <h2>What these terms do not affect</h2>
      <p>Nothing in these terms:</p>
      <ul>
        <li>limits any rights you have as a consumer, or any other legal rights that cannot be excluded</li>
        <li>
          excludes or limits our liability for death or personal injury caused by our negligence or the negligence of our
          employees or agents
        </li>
      </ul>

      <h2>Links to other websites</h2>
      <p>
        Some links take you to websites run by other people. We include them for your convenience only. A link does not
        mean we endorse or approve that website, who runs it or what it contains, and we are not responsible for its
        content.
      </p>

      <h2>Access to this website</h2>
      <p>
        We may stop anyone using all or part of this website, without notice, if they break these terms.
      </p>

      <h2>Your personal information</h2>
      <p>
        Our <Link href="/contact-us/privacy-policy/">privacy notice</Link> explains how we use any personal information you
        give us, and our <Link href="/contact-us/cookies-policy/">cookie policy</Link> explains the cookies we use.
      </p>

      <h2>Changes</h2>
      <p>
        We may change the content of this website, including the services we describe, and these terms at any time. Any
        change to these terms will be published on this page and applies from the date shown at the top.
      </p>

      <h2>Which law applies</h2>
      <p>
        These terms are governed by the law of England and Wales, and the courts of England and Wales deal with any
        disputes. If you live in Scotland or Northern Ireland, you can also bring proceedings in your local courts.
      </p>
    </div>
  );
}
