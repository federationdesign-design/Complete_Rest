# Placeholders

Every fact the build needs from Steve. Each one renders on the site as a highlighted `[Label]` with a `data-placeholder="ID"` attribute, so a search of the built HTML for `data-placeholder` lists what is still outstanding. Values live in `lib/company.ts` unless noted.

| ID | Needed | Where it appears | Notes |
|---|---|---|---|
| `LEGAL_ENTITY_NAME` | Legal entity name exactly as registered (brief 10.1) | Footer company statement; legal pages (step 7) | Companies House lists THE COMPLETE RESTORATION COMPANY (HERTFORD) LIMITED. The live site uses three variants. |
| `COMPANY_NUMBER` | Company number for that entity | Footer company statement; legal pages | Companies House gives 03905618 for the Hertford company. The live footer shows 3905618, without the leading zero. |
| `REGISTERED_OFFICE` | Registered office address to publish (brief 10.2) | Footer company statement; privacy notice | |
| `VAT_NUMBER` | VAT number | Footer company statement | The live footer shows 749 8815 68. Please confirm it is current and belongs to the same entity. |
| `FAVICON` | A favicon or a decision to make one from the logo | Browser tab icon (not yet added) | The live favicon returns 404, so there is nothing to carry over. The scaffold's Next.js icon has been removed. |
| `COMPACT_HEADER_LOGO` | A thinner logo for the compact (sticky) header bar | Compact header bar and menu panel (`components/SiteHeader/SiteHeader.tsx`, `LOGO`) | Steve will supply it. Until then the full logo is scaled down to fit. |
| `MEMBERSHIPS` | Current accreditations and memberships (brief 10.9) | "Proud members of..." logo strip on every page (`lib/members.ts`) | Shows the five live logos until confirmed: The Tile Association, The Guild of Master Craftsmen, NICEIC, MPA, Gas Safe Register. Not marked on the page, as the logos are live content. |
| `EMAIL_PROVIDER` | Email delivery provider for enquiries (brief 10.6) | `lib/enquiry/deliver.ts` | Only a development "console" provider exists. In production the form shows a friendly "please email or call us" failure until a provider is added. The provider also needs naming in the privacy notice. |
| `ENQUIRY_RECIPIENT` | Address that receives enquiries (brief 10.6) | `ENQUIRY_TO` environment variable, read by the provider | See `.env.example`. |
| `ENQUIRY_STORAGE` | Whether enquiries are also stored anywhere, and where (brief 10.7) | `lib/enquiry/deliver.ts`; privacy notice | Nothing is stored at present; enquiries are only emailed. |
| `ENQUIRY_RETENTION` | How long enquiry data is kept (brief 10.8) | Privacy notice (step 7) | |
| `MARKETING_EMAILS` | Whether the client sends marketing emails (brief 10.5) | `SHOW_MARKETING_OPT_IN` in `lib/enquiry/schema.ts` | The optional, unticked checkbox is shown until confirmed. Set the flag to `false` to remove it if they do not send marketing. |
