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

The Haileybury case study is titled "Haileybury College" correctly; only its slug says `collages`. A full proofread of every page will be done during content import (step 4) and added here.

### Company details seen on the live site (for section 10)

1. Footer: "The Complete Restoration Company is the trading name of The Complete Restoration Company (Hertford) Ltd." then "The Complete Restoration Company Ltd. is a company registered in England and Wales with company number 3905618" and "VAT Number 749 8815 68". The company number is missing its leading zero (Companies House: 03905618).
2. The enquiry form notice names a third variant, "Complete Restoration Ltd".
3. Header phone `07973424181`, email `info@completerestoration.co.uk`.

### Housekeeping

1. The brief says reference screenshots are in `agent/reference/current/`. That folder exists but is empty; the screenshots are in `agent/reference/`. There are desktop shots for 15 pages (including one case study example) and mobile shots for 8. None exist for the four internal pages, brickwork, structural, building restoration, the team or ethos pages, or the legal pages other than a mobile privacy shot.
2. `/blog/page/2/` returns 404 while `/category/blog/page/2/` works.

## Step 2: scaffold and layout shell

1. Next.js 16.3.7 was scaffolded with `create-next-app`. It creates an `AGENTS.md` whose text (written by Next.js) contains em dashes, and `next dev` rewrites that file whenever a coding agent runs it and the text differs. If `AGENTS.md` is missing, `next dev` writes the same block into `CLAUDE.md` instead. So `AGENTS.md` is kept on disk, which protects `CLAUDE.md`, and listed in `.gitignore` so no em dashes are committed.
2. The scaffold's `LayoutProps<"/">` global type only exists after a build, which made the `tsc --noEmit` step of the gate fail on a clean checkout. Layouts use explicit prop types instead.
3. Brand tokens in `app/globals.css` come from the live stylesheets, checked against pixels in `agent/reference/home.png`: header and form grey `#6e6e6d`, brick lines `#555454`, nav bar `#4a4a49`, footer `#3b3b3b`, text `#2e2e2e`, muted text `#595959`, rules `#d8d9d9`. The live CSS also contains many unused colours from other projects (blues, greens, purples), which were ignored. Fonts are the live ones, Crimson Text and Lato, now self-hosted through `next/font`.
4. On phones narrower than 376px the header's email link shows only its icon (it keeps the full address as its accessible name), because the phone number and address do not fit on one line at 320px. From 376px up the address is shown in full.
5. The footer keeps all four live menus. Every link is a 44px tap target with 8px spacing, as the brief requires, so the footer is long on phones (about 1,600px at 390px wide).
6. On pages without the quote form, the bottom bar's Get a quote button links to `/contact-us/#quote`. On pages with the form it jumps to the form, and the bar hides while the form is on screen so it never covers the form buttons.
7. The blog is not linked from the main navigation or footer on the live site; it is reachable only from the sitemap and search results. The rebuild will match that unless you want a Blog link added.
8. `scripts/screenshots.mjs` captures the brief's 390px and 1280px screenshots into `agent/screenshots/`. Run it against a production build (`npm run build && npm start`), not `npm run dev`, which adds the Next.js dev badge to every shot.
