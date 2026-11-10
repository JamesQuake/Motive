# Shared footer audit and repair

Canonical source: `data/site-footer.json` (unchanged). Wood Dale is **333 N Wood Dale Rd # 208, Wood Dale, IL 60191**. No Suite 207 value was found in the audited HTML or JavaScript sources.

## Architecture

`app.js` → `initializeSharedFooter()` fetches the JSON, validates it, creates the existing three-column DOM layout, and replaces the contents of `[data-site-footer]`. Text is inserted using DOM text nodes. The schema contains `company`, `logo`, `phone`, `phoneHref`, `locations` (`street`, `city`), `states`, and `socials` (`name`, `url`). No second configuration was added. The renderer and CSS are unchanged.

Each content page has one footer shell with Contact Motive and Privacy Policy links. A successful JSON request replaces its contents. Failure, invalid data, the existing ten-second timeout, or disabled JavaScript leaves usable navigation without displaying a stale address snapshot.

## Changes

- Removed independent footer snapshots from `box-truck-insurance-quote.html`, `commercial-fleet-insurance.html`, and `tow-truck-insurance-illinois.html`, plus the obsolete `audit-quote/shared-footer.html` artifact (deleted). The three public pages retain the existing shared loader.
- Added the existing shared footer shell to `404.html`.
- Bound legitimate contact details in `contact-us.html`, `privacy.html`, `box-truck-insurance-quote.html`, and `box-truck-operating-costs-matteson.html` to the canonical JSON at build time. HTML comments identify generated text; `data-business-phone` identifies generated telephone links.
- Synchronized existing InsuranceAgency JSON-LD in `index.html`, `box-truck-insurance-quote.html`, `box-truck-loads-illinois.html`, `commercial-fleet-insurance.html`, `commercial-truck.html`, `commercial-van.html`, `general-liability.html`, `how-to-start-a-box-truck-business-illinois.html`, `medical-courier-insurance.html`, `surety-bonds.html`, `tow-truck-insurance-illinois.html`, and `workers-compensation.html`. Retained the primary-office address representation, agency identity, FAQs, breadcrumbs, service records, and other SEO data. Telephone, primary address, agency service states, and existing social profiles now derive from JSON.
- Updated `audit-quote/build.cjs` to reuse the existing footer shell and synchronize generated business data. `audit-quote/footer.cjs` is now a compatibility entry point rather than a browser snapshot generator.
- Added `scripts/sync-business-data.mjs`, `.github/workflows/business-data.yml`, `tests/business-data.test.mjs`, and `tests/footer-browser.cjs`.

## Updating business details

Edit only `data/site-footer.json`, then run:

```sh
node scripts/sync-business-data.mjs
node scripts/sync-business-data.mjs --check
node --test tests/business-data.test.mjs
```

Commit the generated HTML with the JSON change. The check fails on stale generated contact/SEO values or footer snapshots. CI checks only; it does not deploy. The legacy quote-page build also runs the sync. Static SEO and contact output remain available without JavaScript. Footer data continues to load directly from JSON at runtime.

## Validation and remaining references

- Source: canonical synchronization is idempotent; tests verify changed JSON propagates into contact output and nested agency metadata without losing surrounding schema.
- Rendered output: all 42 content pages passed Chrome checks for exactly one footer, canonical addresses, states, phone links, and social-link counts. All 42 also passed HTTP-error, invalid-data, network-error, and JavaScript-disabled fallback checks.
- Browser tests block external assets and integrations. They verify local DOM behavior, not CDN availability or a pixel-perfect comparison of externally styled layouts. The footer rendering code and all styles remain unchanged.
- `car.html`, `freight-broker.html`, `mandatory-insurance-vehicle-services.html`, and `sr22.html` are redirect documents; `test.html` is empty. These were not given independent footers.
- Current phone CTAs, editorial state/city references, and FAQ prose elsewhere remain; they are not footer copies. `google-rating-extract.js` retains its current partial Matteson address match for Google listing identity verification. No outdated address was identified there. Generated HTML intentionally contains canonical address values for contact usability and SEO, maintained by the sync command rather than independently edited.
- Quote forms, NowCerts integrations, CRM scripts, `app.js`, styles, and canonical JSON were not changed. Nothing was deployed.
