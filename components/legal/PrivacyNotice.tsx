import Link from 'next/link';
import { company } from '../../lib/company';
import { legal } from '../../lib/legal';
import { SHOW_MARKETING_OPT_IN } from '../../lib/enquiry/schema';
import { contact, siteName } from '../../lib/site';
import Placeholder from '../Placeholder/Placeholder';
import styles from './Legal.module.css';

// Draft privacy notice (brief 9). Every fact that needs confirming is a
// placeholder. For the client to sign off before launch.
export default function PrivacyNotice() {
  return (
    <div className={styles.legal}>
      <p className={styles.updated}>
        Last updated: <Placeholder fact={legal.lastUpdated} />
      </p>

      <p>
        This notice explains what personal information we collect through this website and when you contact us, why we
        use it, who we share it with, how long we keep it and what your rights are.
      </p>

      <h2>1. Who we are</h2>
      <p>
        {siteName} is the trading name of <Placeholder fact={company.legalName} />, a company registered in England and
        Wales with company number <Placeholder fact={company.companyNumber} />. Our registered office is{' '}
        <Placeholder fact={company.registeredOffice} />.
      </p>
      <p>
        We are the controller of the personal information described in this notice. If you have any questions about it,
        email us at <a href={contact.emailHref}>{contact.email}</a>.
      </p>
      <p>
        ICO registration number: <Placeholder fact={legal.icoNumber} />
      </p>

      <h2>2. What we collect</h2>
      <ul>
        <li>
          <strong>Enquiry form:</strong> your name, email address and message, your phone number and postcode or town if
          you give them{SHOW_MARKETING_OPT_IN ? ', and whether you ticked the box to receive marketing emails' : ''}.
        </li>
        <li>
          <strong>Emails and phone calls:</strong> your contact details and anything you tell us about your property or
          project.
        </li>
        <li>
          <strong>Website visits:</strong> our hosting provider processes your IP address and browser details to deliver
          the website and keep it secure. When you send the enquiry form, we also use your IP address for up to 10 minutes
          to limit repeated submissions.
        </li>
        <li>
          <strong>Analytics:</strong> this website does not currently use analytics. If that changes, we will update this
          notice and our <Link href="/contact-us/cookies-policy/">cookie policy</Link> first.
        </li>
      </ul>

      <h2>3. Why we use it and our lawful basis</h2>
      <div className={styles.tableWrap} tabIndex={0} role="region" aria-labelledby="privacy-purposes">
        <table className={styles.table}>
          <caption id="privacy-purposes">Purposes and lawful bases</caption>
          <thead>
            <tr>
              <th scope="col">Purpose</th>
              <th scope="col">Lawful basis</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Replying to your enquiry and preparing a quote</td>
              <td>Taking steps at your request before entering into a contract, or our legitimate interest in answering enquiries</td>
            </tr>
            <tr>
              <td>Dealing with emails and phone calls</td>
              <td>Our legitimate interest in running our business and answering the people who contact us</td>
            </tr>
            {SHOW_MARKETING_OPT_IN && (
              <tr>
                <td>Sending marketing emails, only if you ticked the box</td>
                <td>Your consent, which you can withdraw at any time</td>
              </tr>
            )}
            <tr>
              <td>Running the website securely and stopping spam</td>
              <td>Our legitimate interest in keeping the website working and secure</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>4. Who we share it with</h2>
      <p>We do not sell your personal information. We use these service providers, who act on our instructions:</p>
      <ul>
        <li>
          <strong>Email delivery:</strong> <Placeholder fact={legal.emailProvider} />, which sends enquiry form messages to
          us.
        </li>
        <li>
          <strong>Website hosting:</strong> Vercel Inc., which hosts this website.
        </li>
      </ul>
      <p>We may also share information if the law requires it.</p>

      <h2>5. International transfers</h2>
      <p>
        Vercel Inc. is based in the United States, and our email provider processes data in{' '}
        <Placeholder fact={legal.emailProviderLocation} />. Where your information is transferred outside the UK, it is
        protected by <Placeholder fact={legal.transferSafeguards} />.
      </p>

      <h2>6. How long we keep it</h2>
      <ul>
        <li>
          Enquiries: <Placeholder fact={legal.enquiryRetention} />.
        </li>
        <li>
          Emails and notes of phone calls: <Placeholder fact={legal.correspondenceRetention} />.
        </li>
        {SHOW_MARKETING_OPT_IN && (
          <li>
            Marketing consent: until you unsubscribe, then a record that you did so for{' '}
            <Placeholder fact={legal.marketingRetention} />.
          </li>
        )}
        <li>
          Hosting logs: <Placeholder fact={legal.hostingLogRetention} />.
        </li>
        <li>Your IP address for spam protection: up to 10 minutes.</li>
      </ul>

      <h2>7. Your rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li>ask for a copy of the personal information we hold about you (access)</li>
        <li>ask us to correct information that is wrong or incomplete (rectification)</li>
        <li>ask us to delete your information (erasure)</li>
        <li>ask us to limit how we use your information (restriction)</li>
        <li>object to us using your information, including for marketing at any time (objection)</li>
        <li>receive information you gave us in a format you can reuse (portability)</li>
        <li>withdraw your consent at any time, where we rely on it, without affecting what we did before</li>
      </ul>
      <p>
        To use any of these rights, email us at <a href={contact.emailHref}>{contact.email}</a>. We will reply within one month.
      </p>

      <h2>8. How to complain</h2>
      <p>
        If you are unhappy with how we have used your information, please contact us first at{' '}
        <a href={contact.emailHref}>{contact.email}</a> so we can try to put it right. You can also complain to the
        Information Commissioner&rsquo;s Office (ICO) at{' '}
        <a href="https://ico.org.uk/make-a-complaint/" rel="noopener">
          ico.org.uk/make-a-complaint
        </a>
        .
      </p>

      <h2>9. Changes to this notice</h2>
      <p>
        We will update this notice if how we use personal information changes. The date at the top shows when it was last
        updated.
      </p>
    </div>
  );
}
