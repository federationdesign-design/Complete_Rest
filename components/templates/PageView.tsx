import { Fragment } from 'react';
import { getPage, type Page } from '../../lib/content';
import { openingHours } from '../../lib/hours';
import { pageSchema } from '../../lib/schema';
import EnquiryForm from '../EnquiryForm/EnquiryForm';
import JsonLd from '../JsonLd/JsonLd';
import OpenStatus from '../OpenStatus/OpenStatus';
import { legalDrafts } from '../legal/drafts';
import CardGrid from '../page/CardGrid';
import Gallery from '../page/Gallery';
import Hero from '../page/Hero';
import Members from '../page/Members';
import PageTitle from '../page/PageTitle';
import Prose from '../page/Prose';
import QuoteSection from '../page/QuoteSection';
import Testimonial from '../page/Testimonial';
import styles from './PageView.module.css';

const LEARN_MORE = 'Learn more';

// Renders any page from the content model. Section order follows the live
// template for each kind of page.
export default function PageView({ page }: { page: Page }) {
  return (
    <>
      <JsonLd data={pageSchema(page)} />
      {page.hero ? (
        <Hero
          image={page.hero}
          heading={page.heading}
          subheading={page.subheading}
          fadeOnScroll={page.kind === 'home'}
        />
      ) : (
        <PageTitle heading={page.heading} subheading={page.subheading} />
      )}
      <Body page={page} />
      {page.members && <Members />}
    </>
  );
}

function Body({ page }: { page: Page }) {
  switch (page.kind) {
    case 'home': {
      // The four case studies directly below the service slider, with no
      // heading, as full-image caption cards like those on /case-studies/.
      const caseStudies = getPage('/case-studies/');
      return (
        <>
          <Intro html={page.introHtml} />
          <div className={styles.tiles}>
            <CardGrid cards={page.cards} wide mobile="slider" phoneStyle="overlay" cta={LEARN_MORE} />
          </div>
          {caseStudies && caseStudies.cards.length > 0 && (
            <div className={styles.tiles}>
              <CardGrid
                cards={caseStudies.cards}
                label={caseStudies.title}
                mobile="slider"
                phoneStyle="captionAlways"
                nameSuffix="case study"
                row
              />
            </div>
          )}
          <ContentRow page={page} />
        </>
      );
    }
    case 'section':
      return (
        <>
          <Intro html={page.introHtml} />
          <div className={styles.container}>
            <CardGrid cards={page.cards} label={page.title} mobile="slider" phoneStyle="overlay" />
          </div>
        </>
      );
    case 'caseStudies':
      return (
        <>
          <Intro html={page.introHtml} tight />
          <div className={styles.container}>
            <CardGrid cards={page.cards} label={page.title} phoneStyle="captionAlways" nameSuffix="case study" wide />
          </div>
        </>
      );
    case 'blogArchive':
      return (
        <div className={styles.container}>
          <CardGrid cards={page.cards} />
        </div>
      );
    case 'contact':
      return (
        <>
          {page.contact && <ContactDetails contact={page.contact} />}
          {page.quote && (
            <div className={styles.container}>
              <QuoteSection>
                <EnquiryForm />
              </QuoteSection>
            </div>
          )}
        </>
      );
    case 'legal': {
      const Draft = legalDrafts[page.path];
      return <div className={`${styles.container} ${styles.legal}`}>{Draft && <Draft />}</div>;
    }
    default:
      return (
        <>
          <Intro html={page.introHtml} />
          <ContentRow page={page} />
          {page.testimonial && <Testimonial text={page.testimonial} />}
        </>
      );
  }
}

// tight: line-height 1.3 on phones (case study pages, mobile round 1).
function Intro({ html, tight = false }: { html: string | null; tight?: boolean }) {
  if (!html) return null;
  return (
    <div className={styles.intro}>
      <Prose html={html} className={tight ? `${styles.introProse} ${styles.introTight}` : styles.introProse} />
    </div>
  );
}

// Copy on the left, quote panel on the right from desktop up.
function ContentRow({ page }: { page: Page }) {
  const hasCopy = page.lead || page.bodyHtml || page.gallery.length > 0;
  if (!hasCopy && !page.quote) return null;
  return (
    <div className={`${styles.container} ${styles.row}`}>
      {hasCopy && (
        <div className={page.kind === 'caseStudy' ? `${styles.copy} ${styles.copyTight}` : styles.copy}>
          {page.lead && <p className={styles.lead}>{page.lead}</p>}
          {page.bodyHtml && <Prose html={page.bodyHtml} />}
          {page.gallery.length > 0 && (
            <div className={styles.gallery}>
              <Gallery images={page.gallery} label={`${page.heading} photographs`} />
            </div>
          )}
        </div>
      )}
      {page.quote && (
        <QuoteSection>
          <EnquiryForm />
        </QuoteSection>
      )}
    </div>
  );
}

function ContactDetails({ contact }: { contact: NonNullable<Page['contact']> }) {
  return (
    <div className={`${styles.container} ${styles.contact}`}>
      <section className={styles.contactBlock} aria-labelledby="contact-address">
        <h2 className={styles.contactHeading} id="contact-address">
          Address
        </h2>
        <address className={styles.address}>
          {contact.address.map((line, i) => (
            <Fragment key={line}>
              {i > 0 && <br />}
              {line}
            </Fragment>
          ))}
        </address>
      </section>
      <section className={styles.contactBlock} aria-labelledby="contact-phone">
        <h2 className={styles.contactHeading} id="contact-phone">
          Phone
        </h2>
        <p>
          <a className={styles.contactLink} href={`tel:${contact.phone.replace(/\s+/g, '')}`}>
            {contact.phone}
          </a>
        </p>
      </section>
      <section className={styles.contactBlock} aria-labelledby="contact-email">
        <h2 className={styles.contactHeading} id="contact-email">
          Email
        </h2>
        <p>
          <a className={styles.contactLink} href={`mailto:${contact.email}`}>
            {contact.email}
          </a>
        </p>
      </section>
      {/* Status tag as on the LHM contact page. Shown only once opening hours
          are set in lib/hours.ts (PLACEHOLDERS.md, OPENING_HOURS). */}
      {openingHours && (
        <section className={styles.contactBlock} aria-labelledby="contact-status">
          <h2 className={styles.contactHeading} id="contact-status">
            Open / Closed
          </h2>
          <OpenStatus />
        </section>
      )}
    </div>
  );
}
