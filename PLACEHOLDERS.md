# Placeholders

Every fact the build needs from Steve. Each one renders on the site as a highlighted `[Label]` with a `data-placeholder="ID"` attribute, so a search of the built HTML for `data-placeholder` lists what is still outstanding. Values live in `lib/company.ts` unless noted.

| ID | Needed | Where it appears | Notes |
|---|---|---|---|
| ~~`LEGAL_ENTITY_NAME`~~ | Closed 1 October 2026 | Footer company statement; legal pages; business schema (`lib/company.ts`) | Resolved in round 2: The Complete Restoration Company (Hertford) Limited. |
| ~~`COMPANY_NUMBER`~~ | Closed 1 October 2026 | Footer company statement; legal pages; business schema (`lib/company.ts`) | Resolved in round 2: 03905618. |
| `REGISTERED_OFFICE` | Registered office address to publish (brief 10.2) | Privacy notice and website terms | Still open. The footer statement no longer mentions the registered office (round 2 wording), so this placeholder now shows only on the two legal pages. |
| ~~`VAT_NUMBER`~~ | Closed 1 October 2026 | Footer company statement; business schema (`lib/company.ts`) | Resolved in round 2: 749 8815 68. |
| `FAVICON` | A favicon or a decision to make one from the logo | Browser tab icon (not yet added) | The live favicon returns 404, so there is nothing to carry over. The scaffold's Next.js icon has been removed. |
| ~~`COMPACT_HEADER_LOGO`~~ | Closed 1 October 2026 | Compact header bar on phones (`components/SiteHeader/SiteHeader.tsx`, `LOGO_SHORT`) | Resolved: Steve supplied `public/images/CR-logo-short.svg`, now used in the compact bar on phones. The header and menu panel on phones use `CR-logo-tall.svg`; tablet and desktop keep the original logo. |
| `MEMBERSHIPS` | Current accreditations and memberships (brief 10.9) | "Proud members of..." logo strip on every page (`lib/members.ts`) | Shows the five live logos until confirmed: The Tile Association, The Guild of Master Craftsmen, NICEIC, MPA, Gas Safe Register. Not marked on the page, as the logos are live content. |
| `EMAIL_PROVIDER` | Email delivery provider for enquiries (brief 10.6) | `lib/enquiry/deliver.ts` | Only a development "console" provider exists. In production the form shows a friendly "please email or call us" failure until a provider is added. The provider also needs naming in the privacy notice. |
| `ENQUIRY_RECIPIENT` | Address that receives enquiries (brief 10.6) | `ENQUIRY_TO` environment variable, read by the provider | See `.env.example`. |
| `ENQUIRY_STORAGE` | Whether enquiries are also stored anywhere, and where (brief 10.7) | `lib/enquiry/deliver.ts`; privacy notice | Nothing is stored at present; enquiries are only emailed. |
| `ENQUIRY_RETENTION` | How long enquiry data is kept (brief 10.8) | Privacy notice (step 7) | |
| `MARKETING_EMAILS` | Whether the client sends marketing emails (brief 10.5) | `SHOW_MARKETING_OPT_IN` in `lib/enquiry/schema.ts` | The optional, unticked checkbox is shown until confirmed. Set the flag to `false` to remove it if they do not send marketing. |
| `ICO_REGISTRATION_NUMBER` | ICO registration number, if the client holds one (brief 10.3) | Privacy notice, section 1 (`lib/legal.ts`) | If they do not hold one, remove the line. Most businesses that process personal data must pay the ICO data protection fee. |
| `LEGAL_LAST_UPDATED` | Date the legal pages are signed off | Top of the privacy notice, cookie policy and website terms | |
| `EMAIL_PROVIDER_LOCATION` | Where the chosen email provider processes data | Privacy notice, section 5 | |
| `TRANSFER_SAFEGUARDS` | The safeguard for transfers outside the UK (Vercel Inc. is in the US, and possibly the email provider) | Privacy notice, section 5 | For example the UK Extension to the EU-US Data Privacy Framework, if the provider is certified, or the UK International Data Transfer Addendum. |
| `CORRESPONDENCE_RETENTION` | How long emails and notes of calls are kept | Privacy notice, section 6 | |
| `MARKETING_RETENTION` | How long a record of marketing consent and unsubscribes is kept | Privacy notice, section 6 | Only shown while the marketing checkbox is shown. |
| `HOSTING_LOG_RETENTION` | How long Vercel keeps request logs on the chosen plan | Privacy notice, section 6 | |
| `ANALYTICS_TOOL` | Which analytics tool, if any, the client wants (brief 10.4, 7.5) | `lib/consent/config.ts`; privacy notice section 2; cookie policy | None at present. Google Analytics would go behind consent. An exempt first-party tool would still be listed with an off switch. |
| `MARKETING_TAGS` | Whether any advertising or social pixels are wanted (brief 7.6) | `lib/consent/config.ts` | None at present; the live page source showed none. |
| `TRADING_ADDRESS` | Confirmation of the trading address to publish (brief 10.2) | Contact page (live copy, carried over) and the business schema on every page (`lib/schema.ts`) | Currently the live contact page address: Lordship lodge, Dane End, Ware, Hertfordshire, SG12 0NS. Not marked on the page, as it is live content. |
| `OPENING_HOURS` | Opening hours, if the client wants the open / closed status tag | Contact page status tag (`lib/hours.ts`, `openingHours`) | The tag is ported from the LHM contact page, where it is worked out from a table of opening hours. This site states no hours, so none were invented and the tag is not shown. Add the hours in `lib/hours.ts` to switch it on. |
