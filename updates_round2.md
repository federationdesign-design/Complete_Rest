# Updates: round 2

Steve's second review. Work through every item in order, run the gate, commit, and report back item by item.

## Scope rules for this round

1. Copy and label changes apply at every screen size, since there is only one version of the content.
2. Styling, spacing and sizing changes apply below the tablet breakpoint only, as in round 1, unless the item says otherwise.
3. Sizes in px, line heights unitless (`1.3`), rounded corners from the existing radius token.
4. Reuse the shared slider component from round 1 for any new slider.

## Home page

1. **Service box button.** In the home page service slider, rename the button label to "Learn more" and style it as a text link: no border, no background, underlined or with an arrow, in the brand link colour. Give each link an accessible name that includes the service, e.g. "Learn more about Floor restoration", so screen readers do not hear several identical links.
2. **Quote form.**
   - Increase the form box's left and right padding by 5px each.
   - Centre the form title and change its text to "Interested in us looking at your restoration project?"
   - Field labels: see the instruction given with this file for the approach.
   - Reduce the text next to the checkbox (and the privacy notice beside it) by 2px and set `line-height: 1.3`.
   - Change the submit button label from "Send enquiry" to "Submit".
   - Apply wherever the shared form appears.
3. **Case studies slider.** Add a new section directly below the service slider: a horizontal slider of the four case studies, using the same card style as the service boxes (image, title over the image on a scrim, "Learn more" text link as in item 1). From tablet up, show the four cards as a single row. Use only existing case study titles and images.
4. **Hero fade on scroll.** As the visitor scrolls, the hero content fades out, matching the effect on the LHM site. Port it from the LHM repo (re-clone read-only to `/tmp/LHM` if it is no longer there; do not modify it). With `prefers-reduced-motion` set, there is no fade. Apply at all screen sizes if LHM does.

## Testimonial

5. **Quote box.** Reduce the quote text by 2px and set `line-height: 1.3`. The quote-mark PNGs are currently distorted. Make them keep their native aspect ratio at every size (set one dimension only, with `height: auto` or `object-fit: contain`). Apply wherever the shared testimonial appears.

## Contact page

6. **Address, phone and email.** Restyle the contact details block using the LHM contact page as the model: copy its layout, alignment, icon treatment and spacing as closely as possible, in this site's brand colours. LHM also shows a red and green status tag. Inspect how it works there and replicate it. If it depends on opening hours or availability that this site does not have, add OPENING_HOURS to PLACEHOLDERS.md and do not invent hours.

## Footer and company details

7. **Company statement.** Replace the footer company statement placeholders with:

   > The Complete Restoration Company is the trading name of The Complete Restoration Company (Hertford) Limited, a company registered in England and Wales with company number 03905618. VAT number 749 8815 68.

   Fill LEGAL_ENTITY_NAME, COMPANY_NUMBER and VAT_NUMBER in `lib/company.ts` with these values so the schema and legal pages pick them up, and mark them closed in PLACEHOLDERS.md. REGISTERED_OFFICE and TRADING_ADDRESS stay open.

## Verification

1. Run the gate before committing.
2. Playwright screenshots at 390px of every page touched, in `agent/screenshots/round2/`.
3. No sideways scroll at 320px or 390px.
4. axe clean on the home and contact pages, including the form with errors showing.
5. Report back item by item: done, or why not.
