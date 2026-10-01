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
