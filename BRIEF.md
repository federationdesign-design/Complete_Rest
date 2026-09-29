# Complete Restoration: Build Brief

Next.js rebuild of completerestoration.co.uk, mobile first, with privacy compliance brought up to current UK standards.

Prepared by Federation Design, 29 September 2026. Place this file at the repo root as `BRIEF.md`.

---

## 1. What you are building

1. A Next.js (App Router, TypeScript) replacement for the WordPress 4.9.26 site at https://www.completerestoration.co.uk, deployed on Vercel.
2. The site must be designed for a phone first. Desktop is the secondary layout, built up from the mobile one.
3. Every existing public URL keeps working at the same path, so search rankings are not lost.
4. The cookie banner, enquiry form, privacy notice, cookie policy and website terms are rebuilt to comply with UK GDPR, the Data Protection Act 2018 and PECR as amended by the Data (Use and Access) Act 2025.

The client is The Complete Restoration Company, a period building restoration and conservation contractor working across Hertfordshire, the Home Counties and London.

## 2. Ground rules

1. Next.js App Router, React, TypeScript. CSS Modules only. No Tailwind, no styled-components, no inline style blocks.
2. Relative imports only. Do not use the `@/` alias.
3. No em dashes anywhere, in code comments, copy or commit messages. UK English throughout.
4. Work on a feature branch named `rebuild`. Never commit to `main`. Commit incrementally with real messages. Do not push; Steve pushes.
5. Verification gate before every commit: `./node_modules/.bin/tsc --noEmit` clean, then `npm run build`. Use the repo binaries, not `npx`.
6. CSS Modules trap: a bare `:global(.foo)` selector with no local class passes the type-check but hard-fails the Vercel build. Always compound it as `.localClass:global(.foo)`. Before any commit touching module CSS, run `grep -n ":global(\.[a-zA-Z-]*) *{" **/*.module.css` and confirm every hit is compounded.
7. Always `git add public/` when adding images, or they 404 on Vercel.
8. Never invent facts. Company details, addresses, retention periods, supplier names and legal wording marked as needed from Steve (section 10) get a clearly named placeholder, logged in `PLACEHOLDERS.md` at the repo root.
9. Do not touch DNS, email, the Vercel project settings or the live WordPress server. Deployment and domain cutover are Steve's.
10. Do only what this brief asks. If you find something outside it, log it in `NOTES_FOR_STEVE.md` and carry on.

## 3. Content migration

1. Pull all page, post and media content from the WordPress REST API (`/wp-json/wp/v2/pages`, `/posts`, `/media`, `/categories`) using a Node script, not curl. If the REST API is disabled, stop and log it; Steve will supply a WXR export instead.
2. Store content as local data files (MDX or JSON), one per page. No CMS, no runtime calls to WordPress.
3. Migrate copy verbatim. Do not rewrite or correct it. Log every visible typo you notice in `NOTES_FOR_STEVE.md` with the page and the text. Known examples: "clinets", "beautiy", "shine though", "Collage" for College, "with establish".
4. Download every image referenced by the site into `public/images/`, keeping the original file names. Serve them through `next/image` with explicit dimensions.
5. Write alt text for every content image based on what the page says it shows. Decorative images get empty alt.
6. Carry over each page's title tag and meta description exactly. Where a page has none (most inner pages only have "Page - Complete restoration company"), log it; do not write new SEO copy.

## 4. URL map

Set `trailingSlash: true` in `next.config`. Every URL below must return 200 at the same path.

| Section | Paths |
|---|---|
| Home | `/` |
| About | `/about/`, `/about/our-ethos/`, `/about/our-team/` |
| Services index | `/services/` |
| Services | `/services/building-restoration/`, `/services/floor-restoration/`, `/services/shot-blasting/`, `/services/metal-polishing/`, `/services/brick-and-stone-cleaning/`, `/services/doff/`, `/services/hand-stripping/` |
| Internal | `/internal/`, `/internal/staircase-refurb/`, `/internal/kitchens/`, `/internal/wet-rooms/`, `/internal/decorating/` |
| External | `/external/`, `/external/brickwork/`, `/external/sash-window-restoration/`, `/external/structural/` |
| Case studies | `/case-studies/`, `/case-studies/halcyon-gallery/`, `/case-studies/haileybury-collages/`, `/case-studies/victorian-residence/`, `/case-studies/imperialscience-collage/` |
| Contact and legal | `/contact-us/`, `/contact-us/privacy-policy/`, `/contact-us/cookies-policy/`, `/contact-us/disclaimer/` |

1. Keep the case study slugs exactly as they are, misspellings included. Changing them needs a redirect decision from Steve.
2. Before building, compare this table against the REST API output and `/sitemap.xml` or `/wp-sitemap.xml`. Log any URL not listed here (category archives, tag pages, feeds, attachment pages) in `NOTES_FOR_STEVE.md` with a proposed 301 target. Do not add redirects until Steve confirms.
3. Add 301 redirects in `next.config` for `/wp-content/uploads/...` image paths to their new `/images/...` location, since some are indexed and used as Open Graph images.
4. Generate `sitemap.xml` and `robots.txt` from the route list.

## 5. Reference screenshots of the current site

1. Full-page screenshots of the live WordPress site are in `agent/reference/current/`.
2. Desktop files are named by page, e.g. `home.png`, `floor-restoration.png`. Mobile files carry a `mob-` prefix, e.g. `mob-home.png`.
3. Use them as a reference for content, section order and brand only. The current mobile layout is not fit for purpose on any page. Do not copy it.
4. Where a screenshot and the REST API content disagree, the REST API content wins. Log the difference in `NOTES_FOR_STEVE.md`.

## 6. Mobile-first layout rules

**Approach**

1. Work with the content the site already has. Keep every section each page currently has, in the same order. The job is to make that content work properly on a phone, not to add, remove or rewrite it.

**Specific changes**

2. Hero: on mobile, the hero image fills the full screen height below the header. Use `100svh` so the height does not jump as the mobile browser bar shows and hides. The image is cropped with `object-fit: cover` and a focal point set per image so the subject stays in view. The heading and intro sit over the image with enough contrast to meet WCAG AA.
3. Galleries: case study and service page images currently sit at mixed sizes and orientations. Replace them with a single, consistent grid: every image cropped to the same aspect ratio with `object-fit: cover`, the same gutter throughout, two across on mobile and three from tablet up. No image is ever wider than the screen or left orphaned at a different size.
4. Header: at the top of the page the header shows at full size with the logo and contact details. Once the visitor scrolls past the hero, it shrinks to a compact bar holding a smaller logo and the menu button, and stays fixed to the top of the screen. Trigger the change with an IntersectionObserver on a sentinel element, not a scroll listener. Reserve the header's height so the page content does not jump when it changes. With `prefers-reduced-motion` set, the change happens instantly with no animation.

**General rules**

5. Write base CSS for a 390px wide screen. Add layout for larger screens with `min-width` media queries only. No `max-width` media queries.
6. Use a liquid layout with type that scales with viewport width via `clamp()`. Body text never below 16px on mobile.
7. Every tap target is at least 44 by 44 CSS pixels, with at least 8px between adjacent targets.
8. The phone number and email are real links (`tel:07973424181`, `mailto:`). On mobile, a fixed bottom bar carries two actions: Call and Get a quote. It must not cover the cookie banner or form buttons.
9. Navigation on mobile is a single menu button opening a full-height panel. The panel is keyboard accessible, traps focus while open, closes on Escape and returns focus to the button.
10. No horizontal page scroll at any width from 320px up. Wide content scrolls inside its own container.
11. Service and case study listings are a single column on mobile, two columns from tablet, three from desktop.
12. The membership logos strip is a wrapping grid on mobile, not a carousel.
13. Images use responsive `sizes` so phones never download desktop-width files. Largest Contentful Paint target under 2.5 seconds on a mid-range phone.
14. Keep the existing brand: logo SVGs, colours and the brick header motif. Extract the colour values from the live stylesheet into CSS custom properties. Do not introduce a new visual identity.
15. Accessibility floor: WCAG 2.2 AA contrast, visible keyboard focus, one `h1` per page, logical heading order, `prefers-reduced-motion` respected, all form fields labelled.
16. Verify visually with `npm run dev` and Playwright screenshots at 390px and 1280px for every template. Save them in `agent/screenshots/` using the same names as the reference files, so each new page can be compared with its current version.

## 7. Cookie consent

The current banner treats continued browsing as consent and offers only Accept. Both are non-compliant. Replace it with the following.

1. Reuse the consent system built for the LHM site (`federationdesign-design/LHM`) as the starting point. Port it, do not reinvent it.
2. No non-essential script, pixel or tag loads until the visitor has chosen. Scripts are gated in code, not hidden with CSS.
3. The first layer shows Accept all and Reject all as equally prominent buttons of the same size and style, plus a Manage choices link. No pre-ticked boxes.
4. Categories: Strictly necessary (always on, no toggle), Analytics, Marketing. Only show categories that actually have something in them.
5. Analytics may run without prior consent only if every one of these is true: it is first-party, aggregate, used solely to improve the site, not shared with any third party for its own purposes, and the visitor is told about it and given a simple, free way to switch it off. Google Analytics does not meet this test and goes behind consent. If Steve chooses an analytics tool that does meet it, it still appears in the cookie policy with an off switch.
6. Advertising and social pixels (Google Ads, Meta, LinkedIn, X) always require opt-in consent. Only include them if Steve confirms they are wanted.
7. A persistent Cookie settings link in the footer reopens the preferences panel at any time. Withdrawing consent must be as easy as giving it.
8. Store the choice in a first-party cookie for no more than 6 months, with a version number so a policy change prompts again.
9. The banner must work at 320px without covering the whole screen, and must be fully keyboard and screen-reader operable.

## 8. Enquiry form

The current form notice bundles marketing consent into submitting an enquiry. That is non-compliant. Rebuild it as follows.

1. Fields: name (required), email (required), phone (optional), postcode or town (optional), message (required). Do not collect anything else unless Steve adds it.
2. Before the submit button, a short notice: who will receive the details, that they are used to reply to the enquiry, and a link to the privacy notice. The lawful basis for replying is steps prior to a contract or legitimate interests, not consent, so there is no "I agree" checkbox for the enquiry itself.
3. Marketing is a separate, optional, unticked checkbox with its own plain-language label. The form submits whether or not it is ticked. If Steve confirms the client does not send marketing emails, remove the checkbox entirely.
4. Submission goes through a Next.js route handler or server action. Nothing is stored in the browser beyond the session.
5. Spam protection without third-party tracking: a honeypot field plus a minimum time-to-submit check, and server-side rate limiting per IP. No reCAPTCHA. If a challenge service is needed later, it needs cookie policy wording first.
6. Email delivery provider, recipient address and whether submissions are also stored are placeholders until Steve confirms (section 10).
7. Server-side validation mirrors client-side validation. Error messages sit next to the field, say what is wrong and how to fix it, and are announced to screen readers.
8. On success, show a confirmation on the page stating what happens next. Do not redirect to a thank-you URL unless Steve asks.
9. Every page that currently shows the Get a quote form keeps it: home, about, contact and each case study.

## 9. Legal pages

The current privacy notice was copied from an investment firm template. It refers to investment products, investor qualification tests, prospective investors, account passwords and group companies, and gives a Mill Hill address that matches neither the contact address nor the Companies House registered office. Replace all three legal pages. Draft the copy from the structures below, with every fact marked as a placeholder until Steve supplies it. Steve will have the client sign off the final wording.

**Privacy notice** (`/contact-us/privacy-policy/`)

1. Who we are: full legal entity name, company number, registered office, contact email, ICO registration number if held.
2. What we collect: enquiry form fields, emails and calls, and any analytics data.
3. Why and on what lawful basis, one line per purpose.
4. Who we share it with: named categories of processor (email provider, hosting on Vercel, analytics if used).
5. International transfers, if any processor is outside the UK.
6. How long we keep it, per purpose.
7. Your rights: access, rectification, erasure, restriction, objection, portability, and withdrawing consent.
8. How to complain: to the company first, then to the ICO, with the ICO's web address.
9. Date last updated.

**Cookie policy** (`/contact-us/cookies-policy/`)

1. A table generated from the same config the consent banner uses, so the two can never disagree: name, provider, purpose, category, duration.
2. How to change choices, linking to the Cookie settings panel.
3. Date last updated.

**Website terms** (`/contact-us/disclaimer/`, keep the URL)

1. Rewrite the existing disclaimer in plain English with the correct legal entity name throughout.
2. Keep the consumer-rights and death or personal injury carve-outs.
3. Remove the clause that says visitors agree to data use by using the site.

**Footer**

1. One consistent company statement using the legal name exactly as registered, with company number, registered office and VAT number.

## 10. Needed from Steve before launch

Placeholders for each of these go in `PLACEHOLDERS.md`. Do not guess them.

1. The legal entity name to use. Companies House lists THE COMPLETE RESTORATION COMPANY (HERTFORD) LIMITED, 03905618; the site currently uses three different variants.
2. Registered office and trading address to publish.
3. ICO registration number, if the client holds one.
4. Which analytics and marketing tags the live site actually loads, confirmed in browser DevTools, and which the client wants to keep.
5. Whether the client sends marketing emails.
6. Email delivery provider and the recipient address for enquiries.
7. Whether enquiries should also be stored anywhere, and for how long.
8. Retention period for enquiry data.
9. Current accreditations, so the membership logo strip is accurate.
10. A WordPress media export or SFTP copy of `wp-content/uploads/` if the REST API route fails.

## 11. Order of work

1. Content extraction script and URL inventory check. Report back with the inventory before building templates.
2. Layout shell: header, mobile menu, footer, bottom action bar, brand tokens.
3. Page templates: home, section index, service page, case study, contact, legal.
4. Content import into all templates.
5. Cookie consent port from LHM.
6. Enquiry form and route handler.
7. Legal page drafts with placeholders.
8. Redirects, sitemap, robots, metadata.
9. Playwright screenshots at 390px and 1280px, accessibility check, verification gate.
10. Final report: what is done, contents of `PLACEHOLDERS.md` and `NOTES_FOR_STEVE.md`.
