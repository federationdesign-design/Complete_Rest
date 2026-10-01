# Mobile updates: round 1

Steve's review of the rebuild preview. Work through every item in order, run the gate, commit, and report back item by item.

## Scope rules for this round

1. These are mobile changes. Apply them below the tablet breakpoint only. Desktop and tablet stay as they are, except item 4, which is site-wide.
2. Where Steve says "pt", treat it as CSS px. "Two points smaller" means 2px smaller.
3. Line heights are unitless: use `line-height: 1.3`, not `1.3em`.
4. Every horizontal slider in this round is a native swipe slider using CSS scroll-snap: one row, partial next card visible as a cue, no autoplay, no arrows required, keyboard scrollable, and no page-level sideways scroll. Build it once as a shared component and reuse it. Item 18 is the only exception.
5. Text placed over an image needs a dark gradient scrim behind it so it meets WCAG AA contrast.
6. "Rounded edges" means a consistent `border-radius: 8px` on every button and card changed in this round. Define it once as a token.
7. Do not change any copy.

## Header and logo

1. **Mobile header height.** Replace the mobile header logo with `public/images/CR-logo-tall.svg` and reduce the padding above and below it so the header is noticeably shorter. Use `public/images/CR-logo-short.svg` in the compact sticky bar after scroll. This resolves the COMPACT_HEADER_LOGO placeholder; update PLACEHOLDERS.md.
2. **Top contact strip.** Hide the white bar with the phone number and email on mobile.

## Bottom action bar

3. **Call and Get a quote buttons.** Give both buttons rounded corners and reduce their text by 2px.

## Typography

4. **Body font, site-wide.** All body text uses `font-family: "Crimson Text", serif;`. Steve's note said `sans-serif` as the fallback, but Crimson Text is a serif face, so the fallback is `serif`.

## Home page: service boxes (Building restoration, Internal, External, Floor restoration)

5. **Layout.** Replace the stacked boxes with a horizontal swipe slider.
6. **Background.** Remove the brick pattern from the text area of each box.
7. **Buttons.** Give the buttons inside the boxes rounded corners.
8. **Title.** Move each title out of the grey box below the image and place it over the image, with a scrim, 3px larger than now.
9. **Paragraph text.** Set `line-height: 1.3` and reduce the size by 1px.

## Home page: quote form

10. **Restyle the form.** Remove the brick wall background and redesign the form as a modern quote box: white background, rounded corners, soft shadow, clear spacing between fields, rounded inputs with visible labels, and a full-width rounded submit button. Keep every field, the privacy notice, the separate marketing checkbox, validation and error handling exactly as built. Keep visible focus states and AA contrast on every element.

## Home page: membership logos

11. **Proud members of.** Replace the two rows of three logos with a single-row horizontal swipe slider. This overrides the brief's "wrapping grid, not a carousel" rule for this strip.

## Mobile menu

12. **Close button.** Remove the word "Close" under the X. The X must sit in exactly the same position and size as the menu icon, so there is no visible jump when the menu opens or closes. Keep its accessible name ("Close menu") for screen readers.
13. **Menu logo.** Replace the logo in the menu panel with `CR-logo-tall.svg`.
14. **Divider.** Remove the white dividing line below the logo and close button.
15. **Menu list.** Reduce the menu item text by 1px and set it in Crimson Text.
16. **Phone and email buttons.** Remove the outline border around the two buttons below the menu list.

## About page: testimonial

17. **Quote box.** Add padding above and below the quote-mark PNGs so they sit inset within the box instead of touching its top and bottom edges. Set all quote text in italic with `line-height: 1.3`.

## Services page

18. **Service list.** See the instruction given with this file for the approach to use.

## Case study pages

19. **Spacing under the title.** Close up the uneven gap between the dividing line and the page text, so the space below the line matches the space above it.
20. **Paragraph text.** Set `line-height: 1.3`.
21. **Image captions.** Remove the grey brick-pattern box under each case study image. Centre the caption text over the image, with a scrim, 2px larger than now.
22. **Quote form.** Apply the same restyle as item 10.

## Internal and external pages

23. **Service boxes.** Put the boxes into the shared horizontal swipe slider, matching the home page boxes from items 5 to 9: brick pattern removed, title over the image with a scrim, and the More button styled as a proper button with rounded corners.

## Verification

1. Run the gate before committing.
2. Take Playwright screenshots at 390px of every page touched and save them in `agent/screenshots/round1/`.
3. Confirm at 320px and 390px that no page scrolls sideways.
4. Confirm desktop at 1280px is unchanged apart from the font.
5. Report back item by item: done, or why not.
