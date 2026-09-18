# Public-site mobile readiness

Reviewed locally on 2026-09-18. These changes are preview-only, not deployed.

## Coverage

Browser viewport checks at 320, 390, 768 and 1024 CSS pixels covered:

- Homepage and PERMA Lab Process
- Ethanol systems overview, all four BLAST product pages and comparison
- Butane recovery
- Learning Center, workflow, temperature, process-ownership, LN2 transition, direct-refrigerant comparison, maintenance and design-checklist articles
- Contact, thank-you, privacy and terms
- Legacy article/product aliases (including `/insights` and `/more-output-per-gallon`)

The 404 page was checked at 320 pixels. Sign-in/password-entry routes were inspected at 390 pixels, but local authentication is not configured, so authenticated forms and customer/staff portal workflows were not end-to-end tested. No external messages or test inquiries were submitted.

## Findings and changes

- No document-wide horizontal overflow or header-action overlap in the tested public layouts.
- No failed images detected among loaded images. Equipment image viewer visually checked on a phone-width screen.
- Contact fields and Learning Center selectors increased to 16px to avoid small-field iOS focus zoom, with minimum 48px control height.
- Footer links and article filter/view buttons have minimum 44px touch targets.
- Mobile menu uses dynamic viewport height with a legacy fallback and contained scrolling, keeping it usable when browser bars change height.
- Comparison chart retains intentional horizontal scrolling, adds a mobile swipe cue and supports keyboard focus/scrolling.
- Closed desktop extraction dropdown now uses a boolean `inert` attribute, resolving its browser warning and preventing interaction while closed.

## Interaction checks

- Mobile menu opens, expands Extraction Chillers and navigates to Ethanol Chillers.
- Navigation closes the menu and releases page scrolling/background inert state.
- Escape closes the menu and restores focus to its opener.
- Menu remains scrollable at a 390 × 600 viewport.
- Mobile model selector navigates to BLAST 60/45 and updates its selected model and contextual pricing link.
- Equipment image opens in a dialog; Back to page closes it, restores scrolling and returns focus to the original image control.
- Lab Process contact link retains the intended product and interest without submitting the form.
- Learning Center search, list view, format filter and Clear filters work on mobile.
- Comparison chart scrolls independently using keyboard input without widening the page.
- Desktop extraction dropdown opens/closes correctly and closed links remain outside the tab order.

## Verification

Passed mobile-readiness, homepage-family, Lab Process, chiller-navigation, BLAST60-content and contact-funnel checks. Production build passed. Browser testing used responsive desktop Chromium, not physical iOS/Android devices; native keyboards, device-specific rendering and authenticated portal flows require separate device/session testing.
