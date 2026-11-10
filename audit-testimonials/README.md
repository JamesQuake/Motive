# Testimonials redesign — November 10, 2026

Local implementation only. Nothing deployed.

## Sources and selection

The owner supplied [Google Doc](https://docs.google.com/document/d/1LyiFOqJJxIPNZGS1cinaBb0vRPDgSkUMEfWdSGYr6pQ) and `C:/Users/user14/Desktop/ai testimonials.pdf`. The PDF text is retained in `pdf-source.txt`. Names, complete comments, ratings and relative dates were matched against the Doc; `doc-verification.json` records the checks and original contributor links. Avatars were downloaded from the Doc's embedded images without alteration. Temporary signed image URLs are not published.

Twelve entries: eleven complete written comments, followed by Krystal Grant's rating-only entry. Truncated comments are excluded rather than completed. Original spelling and Spanish comments remain intact. Dates are explicitly anchored to the supplied November 10 snapshot; exact publication dates are unavailable. Google attribution and supplied author profile links appear on each card.

**NOT VERIFIED:** Independent retrieval of individual reviews from the live Google listing. These are owner-supplied records, not a live Google feed. The site's existing aggregate-rating updater does not update these cards.

Attribution references: [Google Places policies](https://developers.google.com/maps/documentation/places/web-service/policies), [Business Profile review API](https://developers.google.com/my-business/reference/rest/v4/accounts.locations.reviews/list), [Business Profile API policies](https://developers.google.com/my-business/content/policies). No API connection or API-derived cache was added; these references do not establish independent verification or a blanket rights certification.

## Validation

`check.cjs` serves the local site and tests Chromium. `results.json` contains results; `after-1920.png`, `after-1440.png`, `after-1024.png`, `after-768.png`, `after-390.png`, and `after-375.png` show the final layouts.

- PASS: 12 original cards; three/two/one visible at requested desktop/tablet/mobile widths; no page overflow.
- PASS: all 36 original/cloned avatar elements decode; twelve original profile links match supplied records.
- PASS: continuous autoplay and modulo wrap across the clone seam, hover/focus pause, persistent manual pause, arrow/Home/End keys, previous/next wrapping, mouse drag and native mobile touch swipe.
- PASS: reduced motion starts paused; clones are inert and hidden from assistive technology.
- PASS: 12 cards remain in raw HTML without JavaScript; inactive controls stay hidden.
- PASS: one rendered footer and Matteson address exactly matches `data/site-footer.json`.
- PASS: hero, navigation, footer markup, title, meta tags and canonical match `before.html`.
- PASS: no browser JavaScript errors or HTTP error responses during these tests.
- PASS: existing quote modal opens the unchanged NowCerts survey URL and closes. Vendor traffic was stubbed; no leads submitted.
- NOT VERIFIED: production quote submission, live deployment, real-device Safari/Firefox, screen-reader usability, field performance or Core Web Vitals. No claim of those tests is made.

No Review/AggregateRating markup added. The existing business generator supplies the address at build time, retaining crawlable text and the shared authoritative JSON. CSS is scoped to review components. Avatar dimensions and control space are reserved; the 12 avatar files total approximately 32 KB.

## Changed files for this task

- `testimonials.html`: generated review content and scoped asset references.
- `testimonials.css`, `testimonials.js`: responsive carousel presentation and interaction.
- `data/testimonials.json`: supplied review records and provenance, no duplicated business configuration.
- `images/reviewers/*.png`: 12 supplied avatars.
- `scripts/sync-testimonials.mjs`: repeatable static generation using existing business-data bindings.
- `.github/workflows/business-data.yml`: generated-content freshness check.
- `README.md`: maintenance and manual upload instructions.
- `sitemap.xml`: only Testimonials lastmod updated to this edit date.
- `audit-testimonials/`: baseline, source evidence, browser checks, screenshots and this report.

Other existing working-tree changes belong to earlier tasks. Shared footer configuration, quote integrations and CRM code were not changed by this redesign.
