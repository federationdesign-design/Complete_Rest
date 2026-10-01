# Desktop updates: round 1

Steve's review of the desktop layout. Work through every item in order, run the gate, commit, and report back item by item.

## Scope rules for this round

1. These changes apply from the tablet breakpoint up. The phone layout must not change. Confirm with a pixel comparison at 320px and 390px against the build before this round.
2. Sizes in px, line heights unitless, rounded corners from the existing radius token, spacing from the existing tokens.
3. Steve's standing convention: liquid layout with type that scales with viewport width via `clamp()`, rather than fixed sizes or a capped container. He reviews at a 2800px browser width, so check every item at 1280px, 1920px and 2800px as well as tablet.
4. Do not change any copy.

## Items

1. **Full-width liquid layout.** Remove the 1100px max-width container site-wide: header contact strip, nav, hero, page content, form, membership strip and footer. Content runs the full width of the window with liquid side gutters (a percentage or `clamp()` value, not a fixed px max-width). Apply to every page template, not only home. Long running paragraphs (intro text, page body copy, legal pages, blog posts) may keep a readable measure, set in `ch` or as a fraction of the viewport, but they must still scale with width rather than stop at a fixed px value.

2. **Hero.** Make the hero heading and subheading larger, scaling up continuously with window width via `clamp()`, with no upper cap below 2800px. Increase the hero height from desktop up so it scales with the viewport: around 75svh with a sensible minimum, so it is clearly taller than now at 1280px and taller again at 1920px and 2800px. Keep the focal points and the fade-on-scroll behaviour.

3. **Intro text below the hero.** Increase it by 3px at desktop width and make it scale with viewport width via `clamp()`, getting smaller on narrower screens and larger on wider ones.

4. **Service cards (Building restoration, Internal, External, Floor restoration).** Use the same card design as the phone version: a much taller image with the title over it on a scrim, then a short text area with the paragraph and the "Learn more" link. The image must be clearly taller than the text area. Remove the brick pattern from the text area. Tighten the text area padding so it is no taller than the content needs. All four cards in a row stay equal height.

5. **Case studies.** Show them two at a time instead of four in a row, as a horizontal slider of all four. Each case study card spans exactly two service-card columns plus the gutter between them, so its edges line up with the service cards above. Desktop users may not have a touch screen, so add previous and next arrow buttons: keyboard operable, with accessible names, disabled at each end. Keep scroll-snap so each move lands on a card edge.

6. **Gap between the sliders.** The space between the service cards and the case studies equals the gutter between cards, as on phones, using `--card-gap` as the only source of space. Measure from the bottom edge of a service card to the top edge of a case study card at 1280px, 1920px and 2800px and report the numbers.

7. **Quote form.** Restyle it to match the phone version: white background, no brick pattern, rounded corners, soft shadow, floating labels, rounded inputs and button. Reduce its total height by putting Name and Email side by side, and Phone and Postcode or town side by side, and shortening the message box to about four rows. Keep every field, the privacy notice, the marketing checkbox, validation and error handling exactly as built.

## Check while you are in there

1. In the review screenshot, "Proud members of..." shows no logos at desktop width. Check whether the membership slider renders on desktop and fix it if not.

## Verification

1. Run the gate before committing.
2. Playwright screenshots of every page touched at 1280px, 1920px and 2800px, in `agent/screenshots/desktop1/`.
3. No sideways page scroll at any width.
4. Phone layout unchanged at 320px and 390px.
5. axe clean on all pages at 1280px and 2800px, including the form with errors showing.
6. Report back item by item: done, or why not.
