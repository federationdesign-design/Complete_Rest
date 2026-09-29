# Placeholders

Every fact the build needs from Steve. Each one renders on the site as a highlighted `[Label]` with a `data-placeholder="ID"` attribute, so a search of the built HTML for `data-placeholder` lists what is still outstanding. Values live in `lib/company.ts` unless noted.

| ID | Needed | Where it appears | Notes |
|---|---|---|---|
| `LEGAL_ENTITY_NAME` | Legal entity name exactly as registered (brief 10.1) | Footer company statement; legal pages (step 7) | Companies House lists THE COMPLETE RESTORATION COMPANY (HERTFORD) LIMITED. The live site uses three variants. |
| `COMPANY_NUMBER` | Company number for that entity | Footer company statement; legal pages | Companies House gives 03905618 for the Hertford company. The live footer shows 3905618, without the leading zero. |
| `REGISTERED_OFFICE` | Registered office address to publish (brief 10.2) | Footer company statement; privacy notice | |
| `VAT_NUMBER` | VAT number | Footer company statement | The live footer shows 749 8815 68. Please confirm it is current and belongs to the same entity. |
| `FAVICON` | A favicon or a decision to make one from the logo | Browser tab icon (not yet added) | The live favicon returns 404, so there is nothing to carry over. The scaffold's Next.js icon has been removed. |
