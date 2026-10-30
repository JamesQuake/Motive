# Box truck insurance quote page — 2026-10-23

Implemented locally; not deployed.

## Compact layout and footer correction

Reduced desktop section padding from 88px to 44px and phone section padding from 48px to 28px. The preparation steps now use two columns on desktop, removing the unused space beside the long single-column guide. Reduced intro, closing and related-guide spacing.

The page now embeds the exact footer markup rendered by `initializeSharedFooter()` from `data/site-footer.json`, including both offices, logo, phone, states, six social links and privacy/copyright row. The existing app still refreshes it from JSON. Unlike the previous minimal fallback, the full footer is present without JavaScript or a successful JSON request. If contact data changes, regenerate the embedded snapshot using `audit-quote/footer.cjs` as part of updating this page; JSON remains the source of truth.

Verified the full footer with JavaScript disabled (`footer-without-js.png`) and with the normal shared loader. Responsive layout and interaction checks passed again. Desktop full-page height decreased from 6675px to 5659px at 1440px viewport width.

## Website UI revision

Revised after design feedback: the hero now follows the existing blue photo-overlay treatment, with the short “Box Truck Insurance Quote” heading, one supporting sentence, and separate quote/call buttons. Removed the visible breadcrumb, promotional eyebrow and extra hero link. Moved the supplied introductory paragraphs below the hero. Restored Motive blue section headings and panels, orange pill buttons with white labels, light-blue section surfaces, and rounded table/FAQ treatments. Existing site navigation and shared footer remain intact. The hero photo retains its full scene on mobile and is aligned to the top on desktop to preserve the person's face.

Repeated the 320/390/768/1440 browser checks after the revision: no horizontal overflow or broken images, and the FAQ, modal, focus, telephone and quote-event checks passed. The external challenge DNS limitation below remains.

## Deploy these changed files together

- `box-truck-insurance-quote.html`
- `box-truck-insurance-quote.css`
- `box-truck-insurance-quote.js`
- `analytics-events.js`
- `how-to-start-a-box-truck-business-illinois.html`
- `box-truck-loads-illinois.html`
- `box-truck-operating-costs-matteson.html`
- `sitemap.xml`
- All 18 `images/box-truck-quote-{hero,preparation,closing}-{640,1024,1672}.{webp,jpg}` derivatives.

The existing `app.js`, `style.css`, Bootstrap, official `images/logo.png`, fonts and `data/site-footer.json` remain dependencies. The shared footer successfully loaded its JSON. No changes to the survey integration, form fields, webhook, automation or campaign handling.

The analytics listener now uses capture so shared survey triggers that stop propagation still emit the existing `quote_cta_click` and `insurance_type_click` events. Existing `phone_click` events include this page's path. No submission or completed-lead event was added. No campaign parameters are appended to the iframe; the existing integration does not forward them.

## Photos

Used the three user-supplied photos in `images/`, mapped by visible subjects: olive jacket/white truck for hero; burgundy shirt/vehicle inspection for preparation; light blue shirt/laptop for closing. Generated responsive WebP and JPEG derivatives using browser canvas resampling, with no changes to their visual content. Original user files were retained. Replacement AI image generations started before the supplied files arrived but are not used or referenced by the site.

## Verification

- Chromium screenshots at 1440, 768, 390 and 320 pixels; no horizontal overflow, all photos decoded. Screenshots in this directory.
- Hero uses eager loading and high fetch priority; supporting images use lazy loading. All photos have intrinsic dimensions, `srcset`, `sizes`, descriptive alt text and JPEG fallbacks.
- Native FAQ Enter/Space controls, mobile menu, quote keyboard activation, modal Escape/Close, focus restoration, reduced-motion behavior.
- All three main quote buttons plus mobile hero quote opened `https://apiautomate.nowcerts.com/widget/survey/qjuynuDi5uLhptxzWksw` with the Trucking Insurance title.
- Survey request returned HTTP 200 and its first form step rendered. No fields filled and no leads submitted.
- Four tested quote clicks produced exactly four quote events and four insurance-selection events; the tested telephone click produced one phone event. Analytics transport was intercepted during QA to avoid sending test traffic. Actual GA ingestion is unverified.
- All local page links/anchors resolved. One contextual link was added to each educational guide, retaining existing copy. Startup and loads links are beside insurance preparation content.
- One H1; supplied title and description; production canonical; robots indexability; Open Graph/Twitter metadata; valid JSON-LD WebPage/BreadcrumbList using the existing InsuranceAgency identity.
- Sitemap XML parses and has one new entry dated 2026-10-23; the three modified guides have the same actual modification date.
- No uncaught page JavaScript errors. One external Cloudflare challenge request failed DNS resolution. End-to-end form submission, anti-bot completion and downstream lead delivery remain unverified.
- No verified survey completion signal exists in current shared code. Modal opening is never counted as a completed lead.

`results.json` contains browser observations. `build.cjs`, `assets.cjs`, `check.cjs`, logs and screenshots are local audit aids, not deployment assets. Existing `.htaccess` blocks `audit-*` directories; do not upload this directory.
