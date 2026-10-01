# Notes for Steve

Items found during the rebuild that are outside the brief or need a decision. Nothing here has been acted on.

## Step 1: content extraction and URL inventory (29 September 2026)

Extraction script: `scripts/extract-content.mjs` (Node, no dependencies). Re-run with `node scripts/extract-content.mjs`; image downloads are cached.

### REST API

1. The REST API is enabled and returned 27 pages, 20 posts, 100 media items, 3 categories, 9 tags and 1 testimonial. No WXR export is needed.
2. Most page copy is not in the REST API. The theme keeps it in custom fields, so `content.rendered` is empty for the home page and every service, internal and external page. The script therefore also saves the rendered HTML of each page (`content/raw/html/`) and the content region between the navigation and the footer (`renderedHtml` in each `content/pages/*.json`). Page copy for the build will come from that rendered HTML, verbatim. Where the REST API does hold copy (case studies, blog posts, legal pages), both versions are saved.

### URLs live on the site but not in the brief's URL map

All 30 URLs in the brief return 200. The following also return 200. Proposed 301 targets are suggestions only; no redirects have been added.

| URL | What it is | Proposed handling |
|---|---|---|
| `/blog/how-to-look-after-original-wood-flooring/` | Blog post, in sitemap, has meta description | Keep as a page, or 301 to `/services/floor-restoration/` |
| `/blog/do-you-need-your-parquet-floor-restored/` | Blog post, in sitemap | Keep, or 301 to `/services/floor-restoration/` |
| `/blog/brass-and-mixed-metals-top-interiors-trend/` | Blog post, in sitemap | Keep, or 301 to `/services/metal-polishing/` |
| `/blog/the-advantages-of-having-a-wet-room/` | Blog post, in sitemap | Keep, or 301 to `/internal/wet-rooms/` |
| `/blog/top-tips-for-decorating-a-period-property/` | Blog post, in sitemap | Keep, or 301 to `/internal/decorating/` |
| `/blog/old-house-restoration-tips/` | Blog post, in sitemap | Keep, or 301 to `/services/building-restoration/` |
| `/blog/what-are-listed-buildings/` | Blog post, in sitemap | Keep, or 301 to `/services/building-restoration/` |
| `/blog/period-features-sought-after-in-renovation-properties/` | Blog post, in sitemap | Keep, or 301 to `/` |
| `/blog/work-begins-on-ipswichs-unitarian-meeting-house/` | Blog post, in sitemap | Keep, or 301 to `/` |
| `/blog/what-would-you-do-to-create-your-forever-home/` | Blog post, in sitemap | Keep, or 301 to `/` |
| `/blog/the-uks-five-most-desirable-property-types/` | Blog post, in sitemap | Keep, or 301 to `/` |
| `/blog/camdens-koko-nightclub-damaged-in-fire/` | Blog post, in sitemap | Keep, or 301 to `/` |
| `/blog/period-home-in-harpenden-goes-on-sale/` | Blog post, in sitemap | Keep, or 301 to `/` |
| `/blog/peckham-top-urban-district/` | Blog post, in sitemap | Keep, or 301 to `/` |
| `/blog/uks-top-10-most-endangered-buildings-revealed/` | Blog post, in sitemap | Keep, or 301 to `/` |
| `/blog/swindons-mechanics-institute-set-to-be-restored/` | Blog post, in sitemap | Keep, or 301 to `/` |
| `/blog/` | Blog archive ("BLog Archives") | Keep if the blog is kept, otherwise 301 to `/` |
| `/category/blog/`, `/category/blog/page/2/` | Category archive, duplicate of `/blog/` | 301 to `/blog/` if kept, otherwise `/` |
| `/category/case-studies/` | Category archive | 301 to `/case-studies/` |
| `/category/uncategorised/` | Empty category archive | 301 to `/` |
| `/tag/floor-restoration-london/` | Tag archive | 301 to `/services/floor-restoration/` |
| `/tag/metal-polishing-london/`, `/tag/metal-polishing-in-london/` | Tag archives | 301 to `/services/metal-polishing/` |
| `/tag/building-restorations-london/`, `/tag/building-restorations-in-london/` | Tag archives | 301 to `/services/building-restoration/` |
| `/tag/restoration-services/`, `/tag/restoration-services-london/`, `/tag/complete-restoration-solutions/`, `/tag/uk-building-conservation/` | Tag archives | 301 to `/services/` |
| `/author/addrankone/`, `/author/federation/` | Author archives, expose WordPress user names | 301 to `/` |
| `/esm_testimonials/test1/` | Test testimonial post type, no real content | 301 to `/` |
| `/site-map/` | Broken page: shows the raw shortcode `[wp_sitemap_page]` | 301 to `/` |
| `/feed/`, `/comments/feed/`, `/case-studies/feed/` | RSS feeds | 301 to `/` (or `/blog/` if kept) |

The main decision is the 16 blog posts (2019 to 2020). They are in the sitemap, 14 have their own meta descriptions, and 10 have their own photos. Keeping them needs two more templates (post and archive); dropping them needs the 301s above. They are extracted either way, in `content/pages/blog--*.json`.

### Tracking and third parties loaded today (from page source; please confirm in DevTools)

1. Google Analytics `UA-139352035-1` via gtag.js, on every page, before any consent. This is a Universal Analytics property, which Google has retired, so it is probably collecting nothing.
2. Google reCAPTCHA v3 on every page, not only pages with the form. The brief rules out reCAPTCHA, so it will not be carried over.
3. Google Maps JavaScript API on `/contact-us/`, with an API key embedded in the page. If a map is wanted on the new contact page, it needs a consent decision and a key restricted to the new domain.
4. Google Fonts (Crimson Text, Lato, Roboto Slab) and Font Awesome from maxcdn and cdnjs. These will be self-hosted in the rebuild, so no visitor IP goes to Google.
5. No Meta, LinkedIn, X or Google Ads pixels were found in the page source.

### SEO metadata

Pages with their own title tag and meta description: home, `/services/`, floor restoration, shot blasting, metal polishing, brick and stone cleaning, doff, sash window restoration, and 14 of the 16 blog posts (all 16 have their own title tag).

Pages with only the default `Page - Complete restoration company` title and no meta description (brief section 3.6, no new copy written): `/about/` (title is lower case "about"), `/about/our-ethos/`, `/about/our-team/`, `/services/building-restoration/`, `/services/hand-stripping/`, `/internal/` and all four internal pages, `/external/`, `/external/brickwork/`, `/external/structural/`, `/case-studies/` and all four case studies, `/contact-us/` and all three legal pages. Blog posts without a description: `do-you-need-your-parquet-floor-restored`, `what-are-listed-buildings`.

### Images

1. 58 images downloaded to `public/images/` with their original file names; manifest with dimensions and the pages that use each image is in `content/images.json`. No file name collisions among live images.
2. Where the site used WordPress resized copies (for example `Halcyon-img2-300x201.png`), the full-size original was downloaded instead and the resized URLs are recorded as variants, for the `/wp-content/uploads/` redirects.
3. 42 media library items are not used on any public page and were not downloaded. List in `content/inventory.json` under `images.unreferencedMedia`.
4. Broken on the live site: the favicon (`/wp-content/themes/completerestoration/images/favicon-2.ico` returns 404), so there is no current favicon to carry over. A favicon will need to be supplied or made from the logo.
5. The legacy stylesheets reference about 50 images from `dev.federation-design.co.uk` (other client projects) and plugin sprites. These were skipped; they are not part of the brand.
6. The case study photos are large PNGs (1.9 to 4.0 MB each). `next/image` will serve resized versions, but the source files could be converted to JPEG to shrink the repo.

### Typos in the live copy (migrated verbatim, not corrected)

| Page | Text |
|---|---|
| `/`, `/services/building-restoration/` | "working with our clinets" |
| `/`, `/services/building-restoration/` | "allows the beautiy of the property" |
| `/`, `/services/building-restoration/` | "to shine though" |
| `/services/hand-stripping/`, and its summary on `/services/` and `/internal/` | "The Complete Restoration Company with establish what process needs to be used" |
| `/case-studies/imperialscience-collage/`, `/case-studies/`, footer menu | "Imperial Science Collage" |

The Haileybury case study is titled "Haileybury College" correctly; only its slug says `collages`. The full proofread from step 4 is below.

### Company details seen on the live site (for section 10)

1. Footer: "The Complete Restoration Company is the trading name of The Complete Restoration Company (Hertford) Ltd." then "The Complete Restoration Company Ltd. is a company registered in England and Wales with company number 3905618" and "VAT Number 749 8815 68". The company number is missing its leading zero (Companies House: 03905618).
2. The enquiry form notice names a third variant, "Complete Restoration Ltd".
3. Header phone `07973424181`, email `info@completerestoration.co.uk`.

### Housekeeping

1. The brief says reference screenshots are in `agent/reference/current/`. That folder exists but is empty; the screenshots are in `agent/reference/`. There are desktop shots for 15 pages (including one case study example) and mobile shots for 8. None exist for the four internal pages, brickwork, structural, building restoration, the team or ethos pages, or the legal pages other than a mobile privacy shot.
2. `/blog/page/2/` returns 404 while `/category/blog/page/2/` works.

### Decisions confirmed by Steve (29 September 2026)

1. Keep all 16 blog posts and the `/blog/` archive; build post and archive templates.
2. The proposed 301 targets above for the other extra URLs are approved (the blog rows now resolve as "keep").
3. Reference screenshots stay in `agent/reference/`.

## Step 2: scaffold and layout shell

1. Next.js 16.3.7 was scaffolded with `create-next-app`. It creates an `AGENTS.md` whose text (written by Next.js) contains em dashes, and `next dev` rewrites that file whenever a coding agent runs it and the text differs. If `AGENTS.md` is missing, `next dev` writes the same block into `CLAUDE.md` instead. So `AGENTS.md` is kept on disk, which protects `CLAUDE.md`, and listed in `.gitignore` so no em dashes are committed.
2. The scaffold's `LayoutProps<"/">` global type only exists after a build, which made the `tsc --noEmit` step of the gate fail on a clean checkout. Layouts use explicit prop types instead.
3. Brand tokens in `app/globals.css` come from the live stylesheets, checked against pixels in `agent/reference/home.png`: header and form grey `#6e6e6d`, brick lines `#555454`, nav bar `#4a4a49`, footer `#3b3b3b`, text `#2e2e2e`, muted text `#595959`, rules `#d8d9d9`. The live CSS also contains many unused colours from other projects (blues, greens, purples), which were ignored. Fonts are the live ones, Crimson Text and Lato, now self-hosted through `next/font`.
4. On phones narrower than 376px the header's email link shows only its icon (it keeps the full address as its accessible name), because the phone number and address do not fit on one line at 320px. From 376px up the address is shown in full.
5. The footer keeps all four live menus. Every link is a 44px tap target with 8px spacing, as the brief requires, so the footer is long on phones (about 1,600px at 390px wide).
6. On pages without the quote form, the bottom bar's Get a quote button links to `/contact-us/#quote`. On pages with the form it jumps to the form, and the bar hides while the form is on screen so it never covers the form buttons.
7. The blog is not linked from the main navigation or footer on the live site; it is reachable only from the sitemap and search results. The rebuild will match that unless you want a Blog link added.
8. `scripts/screenshots.mjs` captures the brief's 390px and 1280px screenshots into `agent/screenshots/`. Run it against a production build (`npm run build && npm start`), not `npm run dev`, which adds the Next.js dev badge to every shot.
9. Footer menus on phones (below 768px) are collapsible sections, closed by default, as you asked. Services and Case studies have linked headings on the live site; on phones the heading becomes the toggle, so the section link is repeated as the first item in its list. From 768px up all four menus are open with their original headings.

## Step 3: page templates

1. Content model: `scripts/build-content.mjs` (`npm run content`) turns the extracted pages into `content/site/*.json`, one per page. Every page is rendered by one template component (`components/templates/PageView.tsx`) that follows the live section order for its kind of page: home, section index (services, internal, external), inner page, case studies index, case study, contact, legal, blog archive and blog post. Unknown URLs return 404 (`dynamicParams = false`).
2. Heading levels were adjusted for a logical order without changing any words. Each page has one `h1`. The live `h2` straplines under page titles and the `h4` lead sentences are now styled paragraphs, and blog archive titles (`h4` on the live site) are `h2`.
3. Card labels from the live site ("Confirm" on the home tiles, "more" on section pages, "read on" on the blog) are kept visibly, but the card title is the link and the label is hidden from screen readers. Otherwise a screen reader would hear the same ambiguous link text several times on one page.
4. The four home page tiles are four across on desktop rather than three, to avoid a single orphaned tile. Section and case study listings follow the brief: one, two and three columns.
5. `/services/floor-restoration/` has no quote form title on the live site. Its form section has a visually hidden heading, "Get a quote", so the form is still labelled for screen readers.
6. The blog archive heading is "BLog" on the live site (typo, carried over). The Swindon post's excerpt on the live archive is actually the Harpenden post's text; carried over as it is.
7. The live contact page loads the Google Maps script but never shows a map, so there is no map to rebuild. The contact page publishes a trading address (Lordship lodge, Dane End, Ware, Hertfordshire SG12 0NS), carried over as it is; please confirm it against brief item 10.2.
8. The disclaimer uses a fourth company name variant, "Complete Restoration Limited". It is replaced in step 7.

## Step 4: content import

1. All 47 pages are imported. An automated check compared every heading, paragraph, list item and link label in each live page's content area with the rebuilt page; nothing is missing.
2. Alt text and focal points for all 46 hero and gallery images are in `content/image-text.json`, written from what each page says the image shows. Plain texture backgrounds (the two brick wall photos and the dark panelled wall on `/internal/`) have empty alt text as decorative images. Card thumbnails also have empty alt text, because the card title beside them already names the link.
3. Copy was compared against the live rendered pages and the REST API, which agree. The reference screenshots were used for section order and brand only; no conflicts with the REST content were found on the pages reviewed.

### Content errors on the live site (carried over verbatim, not corrected)

These are bigger than typos and may be worth fixing before launch:

| Page | Problem |
|---|---|
| `/internal/wet-rooms/` | The page title (`h1`) reads "Staircase refurb by Complete Restoration", copied from the staircase page. |
| `/blog/swindons-mechanics-institute-set-to-be-restored/` | The whole article body is the Harpenden house sale article. There is no Swindon text on the live site. Its archive excerpt is the Harpenden text too. |
| `/blog/brass-and-mixed-metals-top-interiors-trend/` | The final sentence stops mid-way: "Get in touch with us today to find out". |
| `/internal/` | The page title starts with a lower-case letter: "internal Restoration by Complete Restoration". |
| `/about/` | The browser tab title is "about - Complete restoration company", in lower case. |
| `/blog/` | Heading "BLog". Fixed to "Blog" on 1 October 2026; see Follow-up changes. |

### Typos and grammar on the live site (carried over verbatim)

| Page | Text | Likely intended |
|---|---|---|
| `/`, `/services/building-restoration/` | "working with our clinets" | clients |
| `/`, `/services/building-restoration/` | "allows the beautiy of the property" | beauty |
| `/`, `/services/building-restoration/` | "to shine though" | through |
| `/` | "please feel free to get in touch" (no full stop) | |
| `/services/hand-stripping/`, and its cards on `/services/` and `/internal/` | "The Complete Restoration Company with establish" | will establish |
| `/case-studies/imperialscience-collage/`, `/case-studies/`, footer | "Imperial Science Collage" | College |
| `/case-studies/haileybury-collages/` | "Clement Atlee" | Attlee |
| `/case-studies/victorian-residence/` | "Bathrooms were updated and modernised leaving. clean modern feel which will last for years to come" | leaving a clean modern feel ... to come. |
| `/external/structural/` | "we can instruct structural engineer" | instruct a structural engineer |
| `/external/`, `/external/brickwork/` | "Specialists in; painted walls, removal of moss, algae, Ivy Carbon Deposits" | Specialists in painted walls ... ivy, carbon deposits |
| `/internal/decorating/` | "We have specialist skills in many areas your project will always be completed" | areas, and your project |
| `/internal/wet-rooms/` | "a full Service including re siting", "your bathrooms size", "wetrooms", "the clients requirements", "‘Dream Bathroom’ Just one call" (missing full stop), "re wiring", "wall hung w/c" | service, re-siting, bathroom's, wet rooms, client's, re-wiring, wall-hung WC |
| `/about/` | "all over the home counties" | Home Counties |
| `/blog/do-you-need-your-parquet-floor-restored/` | "asap", "inbetween tiles", "floor restoration company in london" | as soon as possible, in between, London |
| `/blog/the-advantages-of-having-a-wet-room/` | "easier too clean", "here’s some advantages", "frame work" | to clean, here are some, framework |
| `/blog/the-uks-five-most-desirable-property-types/` | "the great Georgian cites" | cities |
| `/blog/uks-top-10-most-endangered-buildings-revealed/` | "How incredible that should feature on the Top Ten Endangered Buildings list" | that these should feature |
| `/blog/period-home-in-harpenden-goes-on-sale/` (and the Swindon post) | "period features remains", "original features was why" | remain, were why |
| `/blog/work-begins-on-ipswichs-unitarian-meeting-house/` | "as well as been awarded further grants"; "gave cause for the church to be founded, and is now a Grade 1 listed building" | as well as being awarded; which is now Grade I listed |

Excerpts on the section index pages end mid-word ("natur...", "histori...", "rem...") because the live site cuts them at a fixed length. They are carried over as they are.

## Step 6: enquiry form

1. Fields as the brief sets out: name, email and message required; phone and postcode or town optional. On the live form the phone number was required and there was no message field; that has changed as the brief asks.
2. Labels are visible above each field (the live form used placeholder text only). The submit button reads "Send enquiry"; the live button said "Contact us".
3. Before the button, a short notice says who receives the details, that they are used only to reply, and links to the privacy notice. There is no "I agree" box. Marketing is a separate, optional, unticked checkbox that does not affect sending.
4. Submission is a server action (`app/actions/enquiry.ts`), so the form also works with JavaScript turned off. The same validation rules run in the browser and on the server (`lib/enquiry/schema.ts`). Errors appear in a summary at the top and next to each field, are linked to the fields for screen readers, and focus moves to them. On success the form is replaced by a confirmation on the same page. Nothing is stored in the browser.
5. Spam protection with no third parties: a hidden honeypot field (bots that fill it get a fake success and nothing is sent), a 3 second minimum between the form appearing and being sent, and a limit of 5 enquiries per IP address per 10 minutes. The time check relies on JavaScript, so it is skipped when JavaScript is off.
6. The rate limit is kept in server memory, so on Vercel each server instance counts separately. That is enough to stop casual repeat sending. A hard limit across instances needs a shared store such as Vercel KV or Upstash Redis, which would be a new processor for the privacy notice. Please say if you want it.
7. Delivery waits on the email provider and recipient (PLACEHOLDERS.md). Until then, production shows "Sorry, we could not send your enquiry. Please try again, or email us at info@completerestoration.co.uk or call 07973424181." Enquiries are never silently dropped.
8. The quote form appears on every page that had one on the live site: home, all about, service, internal and external pages, contact, each case study and each blog post.

## Step 7: legal pages

1. All three legal pages are new drafts at the same URLs, for the client to sign off: `components/legal/PrivacyNotice.tsx`, `CookiePolicy.tsx` and `WebsiteTerms.tsx`. None of the live privacy policy's investment-firm wording (investor tests, group companies, passwords, the Mill Hill address) is carried over.
2. Page headings are now "Privacy notice", "Cookie policy" and "Website terms". The browser tab titles are still the live ones ("Privacy policy - Complete restoration company" and so on), as brief 3.6 asks. You may want to change those at the same time.
3. The privacy notice follows the nine sections in the brief. Facts that are already true of the rebuild are stated: the enquiry form fields, hosting on Vercel Inc. (US), no analytics, and IP addresses held for up to 10 minutes by the spam limit. Everything else is a placeholder. The lawful bases are the ones the brief gives: steps before a contract or legitimate interests for enquiries, consent for marketing.
4. The cookie policy table is generated from `lib/consent/config.ts`, the same config the consent banner uses. At present it lists one strictly necessary cookie, `cr_consent`, which stores the visitor's choice for 6 months. Its name may change when the LHM consent system is ported in step 5; the table follows the config either way.
5. The website terms keep the live disclaimer's substance in plain English: information provided as is, the liability limit, the consumer-rights and death or personal injury carve-outs, links, access and changes. The clause saying visitors agree to data use by using the site is removed and replaced with links to the privacy notice and cookie policy. Two small changes for the client's adviser to confirm: "exclusive jurisdiction of English courts" became "the courts of England and Wales", with a line letting consumers in Scotland or Northern Ireland use their local courts; and "by continuing to use our site you agree" became "changes apply from the date shown".
6. A Cookie settings button is now in the footer of every page and on the cookie policy. It opens the preferences panel once the consent system is ported in step 5.

## Step 8: redirects, sitemap, robots, metadata

1. Redirects are in `next.config.ts` and return 301 (Next.js would otherwise use 308 for permanent redirects). They cover all 20 approved legacy URLs and 190 `/wp-content/uploads/...` URLs: every downloaded image plus every resized copy the live pages referenced, each pointing to the original in `/images/`. A check against the production build confirmed every live URL that returned 200 now returns 200 or a single 301 to a working page.
2. Not redirected: uploads that no live page used (42 media library items, not downloaded) and per-post comment feeds such as `/blog/<post>/feed/`. These will 404. If Search Console shows any of them getting traffic after launch, they can be added.
3. URLs without a trailing slash (for example `/about`) get Next.js's standard 308 to the slashed version, which search engines treat as permanent.
4. `sitemap.xml` and `robots.txt` are generated from the route list. The sitemap lists all 47 pages, with last-modified dates from WordPress (the blog archive has none).
5. Every page keeps its live title tag and meta description (none written). Open Graph and Twitter tags reuse the same title and description, with the page's hero image where it has one; the live site had no Open Graph images. Canonical URLs use www.completerestoration.co.uk.
6. There is a branded 404 page ("Page not found"); its title tag is new, as the live site had none to carry over.

## Step 9: screenshots, accessibility and verification

1. `agent/screenshots/` holds 390px (`mob-` prefix) and 1280px full-page screenshots for 21 pages, named to match `agent/reference/`, plus `our-team`, `cookies-policy`, `disclaimer`, `blog` and `blog-post`, which have no reference. They were taken from a production build with `npm run screenshots -- http://localhost:3000` (after `npm run build && npm start`). The fixed mobile bottom bar appears once, where it sits on the first screen; that is how full-page captures show fixed elements.
2. `scripts/a11y-check.mjs` checks all 47 pages at 320, 390 and 1280px: axe with WCAG 2.2 A and AA rules (including colour contrast), no horizontal scroll, one `h1`, no skipped heading levels, and 44px tap targets. It reports no problems. axe also found nothing with the menu open, with the form showing errors, or with the compact header showing.
3. The check found one real issue, now fixed: a blog post's body headings were `h3` directly under the `h1`, each wrapped in a one-item list. Body headings now start at `h2`, and the stray lists are removed; the words are unchanged.
4. Largest Contentful Paint, measured with Lighthouse's mobile throttling (4x CPU slowdown, 1.6 Mbps, 150 ms latency) on a 390px screen: home 1.4 s, Doff 1.4 s, Victorian Residence 1.0 s, a blog post 1.1 s, contact 0.8 s. The target is under 2.5 s. Phones download hero images of about 30 to 50 KB.
5. The screenshots and checks were run before the cookie consent port (step 5), which comes next as agreed. They will be re-run after it.

## Step 5: cookie consent (ported from LHM)

1. Ported from `federationdesign-design/LHM` (`app/components/cookies/`), cloned read-only to `/tmp/LHM` at commit d4de67f; nothing in that repo was changed. The port lives in `components/consent/`, and each file notes what changed from the LHM original. The structure is kept: a consent provider with context, a categories model with a version number, Accept all and Reject all presets, the GA4 loader that renders nothing until analytics consent is given, clearing GA cookies on withdrawal, an empty marketing slot, and a Cookie settings control.
2. Changes needed for this brief:
   - The choice is stored in a first-party cookie, `cr_consent`, for 182 days with a version number (LHM used localStorage). Raise `CONSENT_COOKIE.version` in `lib/consent/config.ts` after a policy change, and everyone is asked again.
   - Accept all and Reject all are identical in size and style. LHM made one filled and one outlined, which the brief does not allow.
   - Categories come from `lib/consent/config.ts`, the same file that generates the cookie policy table, and only categories with something in them are shown.
   - LHM's toggle switches had no accessible name and hid the keyboard focus. They are now native checkboxes with visible labels, never ticked in advance.
   - The first-visit banner is a labelled region at the start of the page (LHM marked it as a modal dialog while the page behind stayed usable). It sits at the bottom of the screen, takes up at most 75% of the screen height, and uses 412px of the 568px on a 320px-wide phone. The settings panel is a real modal dialog: it traps focus, closes on Escape and returns focus to the button that opened it.
   - Withdrawing a category reloads the page so any script already running stops, and GA cookies are cleared.
   - The mobile bottom bar hides while the banner is open, so it never covers it.
3. **Important for review:** with the current config there is nothing optional to consent to (no analytics, no marketing, as the live source showed only a retired Universal Analytics tag). The site sets no non-essential cookies, so no banner appears, which is the correct behaviour under PECR. Cookie settings in the footer opens the panel, which says only a strictly necessary cookie is used. The banner appears automatically as soon as an analytics or marketing tool is added to the config.
4. To review the banner before that, add `?cookie-preview` to any URL on localhost (for example http://localhost:3000/?cookie-preview). It shows every category with a yellow "Preview" note. This only works on localhost.
5. Tested in the browser: no third-party request and no GA script before a choice or after Reject all; GA loads only after analytics consent (checked with a test measurement ID, since removed); the cookie policy table picks up the GA cookies from the same config; the choice cookie lasts 182 days; withdrawal reloads the page; everything works by keyboard. The step 9 checks were re-run after the port with no problems, and the screenshots were refreshed.
6. To turn on Google Analytics later: set `NEXT_PUBLIC_GA_ID` in Vercel and update the privacy notice's analytics line. The banner, cookie policy table and script gating follow on their own.

## SEO, schema and Open Graph pass (1 October 2026)

No visible copy was changed. The only component changes are the header logo's alt text and a structured data script on each page.

1. **Alt text from WordPress.** The media library holds alt text for 1 of its 100 items, so there is one swap:

   | Image | WordPress alt text (now used) | Alt text it replaced |
   |---|---|---|
   | `CompleteRestorationlogo-1.svg` (header logo, full and compact) | "complete restoration" | "The Complete Restoration Company, home" |

   The other 99 items, including every hero and gallery photo and the footer logo (`CompleteRestorationlogo.svg`, a separate media item), have no alt text in WordPress, so they keep the alt text written in step 4. The build script now always prefers WordPress alt text and lists any swap when it runs (`npm run content`). One thing to weigh: the header logo is the link to the home page, so screen readers now announce that link as "complete restoration" rather than naming the company and saying it goes home. It still passes the automated checks.
2. **Blog dates.** Every page now carries its original WordPress publish and modified times (`publishedTime`, `modifiedTime` in `content/site/*.json`). The WordPress site ran on UTC, so the times are written with `+00:00`. Blog posts and case studies output them as `article:published_time` and `article:modified_time` and in their schema. No date is shown on the page, as on the live site.
3. **Canonical tags.** Every page has a canonical tag pointing to https://www.completerestoration.co.uk with the same path and trailing slash (checked on all 47 pages).
4. **Search Console.** The live home page has `<meta name="google-site-verification" content="NypkqmvX8BOL03OpiNTr6bxG_-LpMSvkfh6tkbtqUGY" />`. It is carried over exactly, on the home page only, as on the live site. No other verification tags (Bing, Pinterest, Facebook) were found.
5. **JSON-LD** (`lib/schema.ts`), one script per page:
   - `HomeAndConstructionBusiness` and `WebSite` on every page. The business uses the trading name, the live home page description, the phone number and email from the header, the header logo, and the address published on the contact page. `areaServed` is Hertfordshire, London and the Home Counties, as the home and about pages state.
   - Unconfirmed facts appear in the schema as `[PLACEHOLDER: LEGAL_ENTITY_NAME]`, `[PLACEHOLDER: VAT_NUMBER]` and `[PLACEHOLDER: COMPANY_NUMBER]`. They fill in automatically when `lib/company.ts` is completed. **These must be filled before launch**, or the placeholder text will be read by search engines.
   - No `sameAs`: the live site links to no social profiles. No opening hours or price range, as the site states neither. No `aggregateRating` or `Review`.
   - `BreadcrumbList` on all 46 inner pages. Names are the menu labels for top-level sections and the page titles otherwise, so the blog crumb reads "BLog", the live archive title.
   - `Service` on the 14 service, internal and external pages (not the three index pages), with the business as provider. The description is the page's meta description, or its strapline where it has none.
   - `BlogPosting` on the 16 blog posts and `Article` on the 4 case studies, with dates and the hero image where the page has one. Author and publisher are the business; the WordPress author accounts were agency logins.
6. **Open Graph images.** `scripts/build-og.mjs` (`npm run og`) crops each hero to 1200x630 around its focal point into `public/og/` (35 images, 4 MB). Pages with no hero (contact, the legal pages, the case studies and blog archives, and six blog posts) use the home hero. Every page has `og:image` with its width and height, `twitter:card` set to `summary_large_image` and `twitter:image`. One source image, `victorian-img9b.jpg`, is 900x624 and was enlarged to fit.
7. The contact page address is now also used in the schema. It is listed in `PLACEHOLDERS.md` as `TRADING_ADDRESS` to confirm.

## Follow-up changes (1 October 2026)

1. **Copy change, approved by Steve:** the blog archive (`/blog/`) said "BLog" on the live site. It now says "Blog" in the page heading, in the browser tab title ("Blog Archives - Complete restoration company", was "BLog Archives - ...") and in the breadcrumb schema on the archive and every blog post. This is the only correction made to migrated copy; every other typo listed above is still carried over as it is. The fix is applied in `scripts/build-content.mjs` (`fixArchiveTypo`).
2. **Header logo alt text reverted** to "The Complete Restoration Company, home" at Steve's request. The WordPress media library alt text ("complete restoration") is no longer used, so the swap listed in the SEO pass above no longer applies and no WordPress alt text is in use anywhere.

## Mobile updates: round 1 (1 October 2026)

Applied from `updates_mobile_round1.md`. Phone changes apply below 768px. Tablet and desktop were compared pixel for pixel, on all 47 pages at 768px and 1280px, against a build with only the font change: no differences.

**Not done as written:** item 1's compact bar logo. `CR-logo-short.svg` was not in `public/images/` (only `CR-logo-tall.svg` was), so the compact bar on phones uses the tall logo for now. `COMPACT_HEADER_LOGO` stays open in PLACEHOLDERS.md.

1. **Mobile header height.** The phone header uses `CR-logo-tall.svg` at 40px high in a 60px bar (it was 96px plus the 44px strip). The logo is left-aligned so it does not move between the header, the compact bar and the menu panel.
2. **Top contact strip.** Hidden on phones. The phone number and email are still in the menu and the bottom bar.
3. **Call and Get a quote.** 8px rounded corners, text 2px smaller.
4. **Body font, site-wide.** Crimson Text with a `serif` fallback for all text. Lato is no longer loaded. Committed separately (717ace8).
5. to 9. **Home service boxes.** A swipe slider with the next box peeking in. The brick pattern is gone from the text area (plain grey), the title sits over the image on a dark scrim and is 3px larger, the paragraph is 1px smaller with line-height 1.3, and the Confirm button has rounded corners.
10. **Quote form.** On phones it is a white box with rounded corners and a soft shadow, rounded inputs with visible labels, wider spacing and a full-width rounded dark button. Fields, notice, marketing checkbox, validation and error handling are untouched. The form is one shared component, so every page with the form gets this on phones, not only home and case studies.
11. **Proud members of.** A single-row swipe slider on phones, on every page (it is one shared strip).
12. to 16. **Mobile menu.** The word "Close" is no longer shown; the button's accessible name is "Close menu". The X was measured at exactly the menu icon's position and size, from both the full header and the compact bar. The panel uses `CR-logo-tall.svg`, has no dividing line under the logo, menu items are 1px smaller in Crimson Text, and the phone and email buttons have no outline.
17. **Testimonial.** The quote marks are drawn inside padding, so they clear the top and bottom edges; the text is italic with line-height 1.3. Applies wherever the band appears (about and four service pages).
18. **Services list.** The same shared swipe slider and box style as the home, internal and external boxes, as instructed.
19. **Spacing under the title.** The gap is now 24px above and 24px below the dividing line. This is the shared title block, so contact, legal, blog archive and image-less blog posts get the same fix.
20. **Case study paragraph text.** Line-height 1.3 on the case studies page intro and on each case study's body text.
21. **Image captions.** On the case studies page, the grey brick box under each image is gone; the caption is centred over the image on a scrim, 2px larger, with rounded corners.
22. **Case study quote form.** Same restyle as item 10.
23. **Internal and external boxes.** In the shared slider, matching the home boxes, with the More button as a rounded button.

Other points:

- The slider is one component (`components/Slider/Slider.tsx`): native scrolling with CSS scroll-snap, no autoplay, no arrows. Tabbing to a box scrolls it into view, and the logo slider can be scrolled with the arrow keys. From tablet up it is the original grid.
- `--radius: 8px` is the one token for rounded corners (`app/globals.css`).
- Text over images sits on a dark gradient at least 50% black behind the text, for AA contrast.
- Checks: no sideways scroll at 320px or 390px on any page; axe (WCAG 2.2 AA) clean on all pages, with the menu open and with form errors showing. Screenshots at 390px of every page, plus the open menu and compact header, are in `agent/screenshots/round1/`.
- No copy was changed.

### Compact bar logo (1 October 2026)

`CR-logo-short.svg` has been supplied and is now used in the compact bar on phones, which completes item 1 of mobile round 1. It is 240px wide at 390px and 208px wide at 320px, leaving room for the menu button. The bar stays 60px high so the menu icon and the close icon still line up. `COMPACT_HEADER_LOGO` is closed in PLACEHOLDERS.md.

## Updates: round 2 (1 October 2026)

Applied from `updates_round2.md`. Copy and label changes apply at every size; styling changes apply below 768px, as the scope rules say. Tablet and desktop screenshots of all 47 pages were compared with the build before this round: the only differences are the copy changes listed here (form title, button labels, footer statement, the new home section, and the company details now filled in on the privacy notice and website terms).

1. **Service box button.** The home service boxes now say "Learn more" (it was "Confirm"). Each is the card's one link, named "Learn more about Building Restoration" and so on for screen readers. On phones it is a text link, underlined with an arrow, in white. White is used because the boxes are grey: the usual grey link colour would not have enough contrast there. From tablet up the label changes but it keeps the bordered button look, since styling changes are phone-only.
2. **Quote form.**
   - Box padding is 5px wider on the left and right (phones).
   - The title is "Interested in us looking at your restoration project?" on every page with the form, at every size, centred on phones. It replaces the per-page titles from the live site ("Get a Quote Today", "Get Quote today", and the empty one on floor restoration).
   - Floating labels on phones: the label sits inside the field and moves onto the top edge when the field has focus or a value. From tablet up, labels stay above the fields.
   - The checkbox text and the privacy notice are each 2px smaller with line-height 1.3 on phones. The notice was already smaller than the checkbox text, so it is now about 12px.
   - The button reads "Submit" at every size.
3. **Case studies slider.** A new section directly below the service slider on the home page: the four case studies in the same slider and card style, with "Learn more" links, and a single row of four from tablet up. It uses only the existing titles and images (so "Imperial Science Collage" keeps its live spelling). The section heading is "Case studies", the existing page title; say if you would rather have no heading.
4. **Hero fade on scroll.** Ported from LHM (`PrivateHomeClient.tsx`): a black layer between the hero image and its text goes from clear to solid as you scroll from 10% to 65% of the hero's height. On LHM it is the image that fades out behind the heading, not the heading text itself, so that is what was ported. It applies at all screen sizes, as on LHM, and only on the home page. With `prefers-reduced-motion` set there is no fade. The LHM clone at `/tmp/LHM` was still present and was not changed.
5. **Testimonial.** Text is 2px smaller with line-height 1.3 on phones. The quote marks are now two separate images (`quote-mark-open.png`, `quote-mark-close.png`, cut from the original PNG) with only their height set, so they keep their native proportions at every width. Applies wherever the band appears on phones.
6. **Contact details.** On phones the block follows the LHM contact page: a left-aligned row of blocks that wraps, each with a small letter-spaced label over a larger value, thin underlines on the phone and email links, and a dividing rule below. LHM has no icons on its email and phone details (its only icons there are social media links, which this site does not have), so none were added. LHM's red and green tag is an open or closed status worked out from a table of opening hours. That logic is ported (`lib/hours.ts`, `components/OpenStatus/`), corrected to use UK time, but this site has no opening hours, so the tag is not shown and `OPENING_HOURS` is in PLACEHOLDERS.md. Tablet and desktop keep the centred three columns.
7. **Company statement.** The footer now reads exactly as supplied. `LEGAL_ENTITY_NAME`, `COMPANY_NUMBER` and `VAT_NUMBER` are filled in `lib/company.ts` and closed in PLACEHOLDERS.md, so the privacy notice, website terms and the business schema now carry the real values and no placeholder text is left in the schema. `REGISTERED_OFFICE` and `TRADING_ADDRESS` stay open; the registered office placeholder now appears only on the two legal pages, as the new footer wording does not mention it.

Checks: no sideways scroll at 320px or 390px on any page; axe (WCAG 2.2 AA) clean on every page, and on the home and contact pages with form errors showing, at 390px and 1280px. Screenshots at 390px of every page, plus the form with errors, are in `agent/screenshots/round2/`.

### Round 2 follow-up (1 October 2026)

1. The footer company statement ends with "Registered office: [Registered office address]." again, after the VAT number. It fills in from `lib/company.ts` once `REGISTERED_OFFICE` is supplied.
2. The form's privacy notice and checkbox text are never below 14px on phones (14px at 320px, about 14.2px for the checkbox text at 390px).
3. "Learn more" is the underlined text link with an arrow at every screen size, on the home service boxes and the home case studies. This replaces the bordered button look that tablet and desktop kept in round 2.

## Updates: round 3 (1 October 2026)

1. **Hero fade.** The home hero now fades to the header grey (`--colour-brick`, #6e6e6d) instead of black.
2. **Home case studies heading.** Removed. The case studies slider sits directly below the service slider. The list keeps "Case studies" as a label for screen readers only.
3. **Home case study cards.** Now the same full-image caption cards as on `/case-studies/`: caption centred over the image, the same overlay, text size and rounded corners (measured identical on phones), no bottom gradient and no "Learn more". The whole card is one link, named "Halcyon Gallery case study" and so on. On the home page this card style is used at every screen size, in a single row of four from tablet up. The `/case-studies/` page itself still shows boxed cards from tablet up, as before; say if you want that page to use the caption cards on larger screens too.
4. **Order.** The Imperial College case study is first on the home slider and on `/case-studies/`; the others keep their order (Halcyon Gallery, Haileybury College, Victorian Residence). Its title still reads "Imperial Science Collage", as no copy change was asked for. The footer's Case studies menu keeps its own existing order.
5. **Registered office.** "Lordship Lodge, Dane End, Ware, Hertfordshire, SG12 0NS" is filled in `lib/company.ts` and shows in the footer, the privacy notice and the website terms. `REGISTERED_OFFICE` is closed.
6. **Footer menus.**
   - On phones, links inside the collapsible menus are 24px high with 4px between them (they were 44px with 8px). This is the WCAG 2.2 AA minimum and overrides the brief's 44px rule for footer links only, as instructed; `scripts/a11y-check.mjs` allows it for footer menu links and still requires 44px everywhere else. The menu headings that open and close each section are still 52px.
   - "Quick Nav" is renamed "Main menu" and is first; "Customer services" is last. The order is now Main menu, Services, Case studies, Customer services.
   - The rename and the new order apply at every screen size, not only phones. The menus are one list in the page, so reordering it for phones alone would have made the keyboard order on larger screens differ from what is on screen. From tablet up the links keep their 44px height.
7. **Trading address.** Same as the registered office; `TRADING_ADDRESS` is closed. **Copy change:** the contact page address now starts "Lordship Lodge" (the live page has "Lordship lodge"), so the page, the schema and the footer all agree.

There are now no placeholder markers on any page or in the schema except the legal pages' own open items (ICO number, dates, email provider, retention periods and transfer safeguards).

Checks: gate passed; axe clean on all 47 pages at 320, 390 and 1280px; no sideways scroll at 320px or 390px. Screenshots at 390px of every page, plus the footer with every menu open, are in `agent/screenshots/round3/`.

### Round 3 follow-up (1 October 2026)

1. **Copy change, approved by Steve:** the case study titled "Imperial Science Collage" on the live site is now "Imperial College of Science" everywhere it is shown: the page heading, its browser tab title ("Imperial College of Science - Complete restoration company"), the cards on the home page and `/case-studies/`, the footer menu, and the schema (Article headline and breadcrumb). The URL is unchanged: `/case-studies/imperialscience-collage/`. The fix is applied in `scripts/build-content.mjs` (`fixImperial`) and `lib/site.ts`. No page, title tag or schema contains the old title any more. The Haileybury slug (`haileybury-collages`) is also unchanged.
2. The footer Case studies menu now lists Imperial College of Science first, then Haileybury College, Halcyon Gallery and Victorian Residence in their existing order. (That menu's order differs from the home slider and `/case-studies/`, where Halcyon Gallery comes before Haileybury College; both are the orders they already had.)
3. `/case-studies/` uses the full-image caption cards at every screen size, matching the home page, and its links are named "<title> case study" for screen readers in the same way. The page keeps its listing layout: one column on phones, two from tablet and three from desktop, so the fourth card sits on a second row on desktop.

4. `/case-studies/` now shows its four cards in a single row of four from desktop up, matching the home page; one column on phones and two on tablet are unchanged.
5. The footer Case studies menu now matches the page order exactly: Imperial College of Science, Halcyon Gallery, Haileybury College, Victorian Residence. This replaces the order described in point 2 above.

### Home page sliders as one block (1 October 2026)

The service slider and the case studies slider now sit in one wrapper (`.tiles` in `components/templates/PageView.module.css`).

1. One token, `--card-gap`, sets both the gutter between cards and the gap between the two sliders: `--space-sm` on phones, `--space-md` from tablet up.
2. The vertical gap belongs to the wrapper alone, as its row gap. The sliders add no margin or padding of their own on either side: the room they keep for focus rings is cancelled by an equal negative margin, and their scrollbar, which would add height, is hidden in this block.
3. Both sliders use the same card width, gutter and left inset, so the cards line up in columns.
4. Measured in the browser:

   | Width | Gutter between cards | Gap between the sliders | Card width |
   |---|---|---|---|
   | 320px | 16px | 16px | 236px |
   | 390px | 16px | 16px | 291px |
   | 768px | 28.4px | 28.4px | 345px |
   | 1024px | 31.5px | 31.5px | 217px |
   | 1280px | 34.6px | 34.6px | 244px |

   At every width the two sliders' cards have identical left edges and widths.

One consequence on tablet (768px to 1023px): the service boxes are two across there, so the case studies are now two across as well, in a two-by-two grid. Round 2 had them as a single row of four from tablet up, which could not line up with the service boxes. From desktop (1024px) both are a single row of four.

### Gap between the home sliders, re-checked (1 October 2026)

Steve reported a gap of roughly 80px at about 400px wide, owned by `div.PageView-module__tiles` measuring 398 x 239.

1. That container is from the build before commit 5f65920. Building the previous commit (06d104d) and measuring at 398px wide reproduces it exactly: the case studies had their own `.tiles` wrapper of 398 x 239, and the gap from the bottom of a service card to the top of a case study card was 48.7px, made of 8px of padding under the service slider and the second wrapper's 40.7px top padding. From commit 5f65920 there is one wrapper holding both sliders (398 x 607 at that width) and the second wrapper no longer exists. If the browser still shows a 239px-high `.tiles`, it is showing the older build: restart `npm run dev`, or hard-refresh, and check `git log -1` shows the latest commit.
2. To leave nothing else between the cards, the sliders in this block now have no vertical padding or margin at all (before, 8px of padding was cancelled by an 8px negative margin to make room for focus rings, which showed up as spacing in DevTools). The focus ring is now drawn inside the card instead, on every card grid.
3. Everything between the last service card and the first case study card at 390px, read from the browser: service card margin-bottom 0, services list padding-bottom 0, margin-bottom 0, scrollbar 0, wrapper row-gap 16px (`--card-gap`), case studies list margin-top 0, padding-top 0, case study card margin-top 0. There are no elements between the two lists.
4. Measured from the bottom edge of a service card to the top edge of a case study card: 16px at 390px and at 398px, in Chromium, WebKit (Safari's engine) and Firefox, against the production build.

## Desktop updates: round 1 (1 October 2026)

Applied from `updates_desktop_round1.md`. Everything applies from 768px up. The phone layout is unchanged: all 47 pages are pixel-identical at 320px and 390px to the build before this round. No copy was changed.

1. **Full-width liquid layout.** The container is gone from tablet up on every template (the token was 72rem, 1152px): the contact strip, nav, hero, page content, form, membership strip and footer all run the width of the window. Side gutters are `clamp(1.5rem, 4vw, 7rem)`: 51px at 1280px, 77px at 1920px, 112px at 2800px. From 1280px the root font size also grows with the window (`clamp()`: 16px at 1280px, 20.2px at 1920px, 26px at 2800px, held at 26px beyond that), so everything set in rem scales together: body text (18px, 22.7px, 29.3px), spacing, the header and logo, and tap targets. Running text keeps a readable measure set in `ch` (68ch for body copy, 62ch for intro text), which widens with its font size. Legal pages and the quote box keep a maximum set in rem, which grows the same way.
2. **Hero.** Heading and subheading scale with the window with no cap below 2800px: heading 54px, 81px and 118px at 1280px, 1920px and 2800px (it was 42px); subheading 24px, 36px and 53px (it was 22px). From desktop the hero is `max(75svh, 30rem)` high: 600px at 1280 x 800 (it was 496px), 810px at 1920 x 1080 and 1125px at 2800 x 1500. Focal points and the fade on scroll are unchanged. Tablet keeps its previous hero height.
3. **Intro text.** 25px at 1280px (it was 22px), scaling with the window: about 18px at 768px, 36px at 1920px and 51px at 2800px.
4. **Service cards.** The home page's four boxes use the phone design from tablet up: title over the image on a scrim, plain grey text area with no brick pattern, rounded corners, "Learn more" link. The image is portrait (3:4) on desktop and square on tablet. Image against text area height: 358px to 195px at 1280px, 543px to 220px at 1920px, 800px to 248px at 2800px. Text padding is one spacing step all round, and the four cards are equal height. The cards on the Services, Internal and External pages keep their existing desktop design, as the item named the home page boxes; say if you want those to match.
5. **Case studies.** From desktop (1024px) they are a horizontal slider of all four, two at a time. Each card spans exactly two service columns plus the gutter (at 1280px, card one runs from 51.2px to 622.7px, the same as service columns one and two). Previous and Next arrow buttons sit on the left and right edges: they work by keyboard, are named "Previous case studies" and "Next case studies", and are marked disabled at each end (with `aria-disabled`, so a keyboard user keeps their focus on the button when they reach the end). Each move is one card and scroll-snap lands it on the card edge. On tablet (768px to 1023px) the service boxes are two across, so the case studies stay as the two-by-two grid that lines up with them, with no arrows.
6. **Gap between the sliders.** Still only `--card-gap` (the wrapper's row gap). Bottom of a service card to top of a case study card, and the gutter between cards: 34.56px and 34.56px at 1280px, 45.48px and 45.48px at 1920px, 58.5px and 58.5px at 2800px.
7. **Quote form.** From tablet up it matches the phone version: white box, no brick pattern, rounded corners, soft shadow, floating labels, rounded inputs and full-width rounded button. Name and Email sit side by side, as do Phone and Postcode or town, whenever the box is at least 30rem wide (a container query on the box). The message box is about four lines high. Fields, notice, checkbox, validation and errors are untouched. To give the box room for the paired fields, the copy and the form are now equal columns on desktop (they were three fifths and two fifths). On the contact page the box is centred with a maximum width of 56rem.

**Membership logos.** They do render on desktop: all five load at 1280px and 2800px. They were lazy-loaded, so a full-page screenshot taken without scrolling could catch them before they loaded. They now load eagerly (five small files). They were also stuck at their small native size on wide screens; from tablet up each sits in a box sized in rem, so they grow with the layout (same size as before at 1280px).

**A bug found and fixed.** The compact header bar was triggered when a 1px marker left the viewport. With the taller desktop hero that marker starts below the fold, so a jump straight past it (the End key, an anchor link, a restored scroll position) never put it on screen and the compact bar did not appear. The observer now watches the whole area above the viewport, so the bar appears whenever the marker is above the top of the screen, however the visitor got there. It is still an IntersectionObserver, with no scroll listener.

Checks: gate passed. axe (WCAG 2.2 AA) and the layout rules are clean on all 47 pages at 320, 390, 768, 1280, 1920 and 2800px, and with form errors showing and with the menu open at 1280px and 2800px. No sideways scroll at any of those widths. `scripts/a11y-check.mjs` now takes a list of widths as a second argument. Screenshots of every page at 1280px, 1920px and 2800px, plus the form with errors, are in `agent/screenshots/desktop1/` (JPEG, 65 MB).
