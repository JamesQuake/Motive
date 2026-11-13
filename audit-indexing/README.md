# Google indexing repair report

Audited November 13, 2026 (America/Chicago). Changes are local only; no deployment, production edits, or form submissions were performed.

The supplied Search Console totals (37 indexed, 47 excluded) do not identify URLs. This audit cannot attribute today's findings to those historical groups. HTTP accessibility and technical eligibility do not prove indexing or guarantee inclusion in Google.

## Fixed locally

| Category | Evidence and repair | Exact file |
| --- | --- | --- |
| Redirects | Live `/car.html` returned 200 with an HTML refresh; `/car` and `/car/` first redirected to that wrapper. Added a direct permanent redirect for all three to `/auto.html`, ahead of the generic extension rule. Retained the fallback HTML and its intentional noindex. | `.htaccess` |
| Empty page / soft-404 risk | Live `/test.html` returned 200 with zero bytes. Added an explicit 404 rule for `/test`, `/test/`, `/test.html`, and `/test.html/`. Kept the placeholder file; did not create content or redirect it to another page. | `.htaccess` |
| Broken error-page references | The error template used relative links and assets; at `/solutions/<missing>` those resolve under `/solutions/`, causing more missing requests and broken recovery navigation. Converted every local `href`/`src` to a root-relative URL; home links now use `/`. | `404.html` |
| Noindex | Direct `/404.html` returned 200 with no indexing exclusion. Added `noindex, follow` to the error template. Genuine missing routes continue to return 404. | `404.html` |
| Internal redirect link | Changed `freight-broker.html` to its existing permanent destination, `specialtytransportation.html`, in the resources link. No missing destination was found. | `surety-bonds.html` |
| Landing-page discovery | `tow-truck-insurance-illinois.html` was in the sitemap but had no incoming HTML anchor from another public page. Added one contextual link in the existing further-reading section of the towing guide. | `towing.html` |
| Regression coverage | Added checks for the new redirect/error rules, error-page references at nested URLs, and the towing guide's incoming link. | `tests/discovery.test.mjs` |

No CSS, application JavaScript, business JSON, forms, iframe configuration, survey IDs, canonical tags, or existing marketing paragraphs changed. The only added marketing-page text is the contextual towing-guide link. Follow-up correction: sitemap lastmod dates for `surety-bonds.html` and `towing.html` now reflect their November 13 link changes. The discovery generator also synchronized the towing Article dateModified in `towing.html` and its reference in `specialtytransportation.html`. Upload `sitemap.xml`, `towing.html`, and `specialtytransportation.html` after the original four-file upload.

## No action necessary

| Category | Result |
| --- | --- |
| Inventory | 47 root HTML files: 41 public canonical content pages, four legacy redirect wrappers, one error template, and one empty development placeholder. Audit-directory HTML snapshots are evidence, not landing pages; existing Apache rules deny access to audit directories and Markdown files. Full page/link/schema inventory is in `source-results.json`. |
| Broken links | No missing local destinations, assets, or fragment IDs in root HTML references. No missing local CSS `url()` resources. After repairs, no HTML anchors use the four legacy aliases; every public content page has an incoming HTML link. |
| Redirects | Existing preferred-host/HTTPS, WordPress solution routes, insights/blogs, freight broker, SR22, mandatory-insurance, archive-path and clean-path rules preserved. Sample live requests returned 301 with their configured destinations. `/index.html` already canonicalizes to `/`; it needs no speculative redirect change. |
| 404 | Two deliberate unique missing-path probes, at the root and under `/solutions/`, both returned genuine HTTP 404. These are test probes, not claimed Search Console URLs. No catch-all redirect to the homepage was added. |
| Noindex | Four local legacy wrappers intentionally use `noindex, follow`: `car.html`, `freight-broker.html`, `sr22.html`, and `mandatory-insurance-vehicle-services.html`. None is in the sitemap. No public landing page has accidental noindex or conflicting robots directives. These four files cannot be equated with Google's two reported noindex URLs. |
| Canonicals | All 41 public pages have exactly one self-referencing canonical matching the sitemap. Live responses also passed canonical and meta/header noindex checks. No canonical conflicts were found. |
| Sitemap | XML parses successfully; exactly 41 unique canonical URLs cover all eligible public pages. Live and local URL sets match. No URLs added or removed. Follow-up: corrected lastmod to 2026-11-13 for surety-bonds.html and towing.html. Aliases, error template, and empty placeholder are excluded. |
| Robots / AI search | Live robots.txt matches local: wildcard allow, with the two existing archive-path exclusions. No public-page block for Googlebot, Bingbot, or AI search crawlers is present. Existing policies and llms.txt were preserved; no AI-specific files added. Host-level filtering and genuine crawler access are not established by these checks. |
| Landing pages | Unique titles/descriptions, available initial HTML, relevant coverage content, correct canonicals and sitemap membership across 41 pages. No identical main-content pairs or pairs above 0.5 Jaccard similarity of five-word sequences after stripping navigation/footer/scripts. This heuristic is not Google's duplicate-content judgment. The towing-guide discovery defect was the confirmed repair; other copy was preserved. |
| Structured data | All JSON-LD parses; existing tests pass entity uniqueness and centralized agency/location consistency checks. No schema syntax or duplicate-definition defect found. This is not a Google Rich Results eligibility certification. |

## Requires external verification

- **Search Console:** Export affected URLs for the 14 historical 404s, two 5xx errors, two noindex exclusions, eight crawled-but-not-indexed pages, redirect group, and alternate canonical. Compare crawl dates and inspected canonicals against the current pages. There is insufficient evidence to recreate deleted pages or add further redirects.
- **5xx:** No server error reproduced in 61 public GET checks, including all 41 sitemap pages. The repository is a static Apache/cPanel site; no confirmed application or configuration failure was found. Historical hosting/access/ModSecurity logs and affected URLs are unavailable. Local audit logs are not production server logs.
- **Apache behavior after deployment:** No Apache executable is available locally. New rules were source-tested; the local browser server does not execute `.htaccess`. After separately authorized deployment, verify the auto aliases return 301 to `/auto.html`, the empty test paths return 404, and nested missing paths retain 404 while loading the repaired template. Existing production behavior was only read, not modified.
- **External integrations:** Browser tests suppress analytics, external quote frames, and submissions. Provider-side form completion and actual crawler-origin traffic remain unverified. Two Pexels images on `bundled-insurance.html` were deliberately suppressed by the test network policy; their test failures do not establish broken production images.

## Regression results and reproduction

- `node --test tests/business-data.test.mjs tests/discovery.test.mjs`: **8/8 passed** (used `--experimental-test-isolation=none` because the sandbox disallowed child-process spawning).
- `node scripts/sync-business-data.mjs --check`: **passed**.
- `sync-discovery.mjs --check` and `sync-testimonials.mjs --check`: **byte checks failed on pre-existing CRLF/LF differences only** in `llms.txt` and `testimonials.html`. Ran generators, compared normalized output, confirmed identical content, and restored original bytes. No generated-content drift found; no unrelated line-ending edits retained.
- `tests/google-rating.test.mjs`: **not runnable in this checkout** because its `playwright` package is missing. Rating code was not changed. No rating scraper or publishing workflow ran.
- `tests/footer-browser.cjs`: **passed for all 42 footer-bearing pages**, including loaded JSON, HTTP failure, invalid JSON, network failure and JavaScript disabled. Four representative pages fit 390px and 1440px footer checks.
- `audit-indexing/browser.cjs`: local HTTP, mobile navigation, footer, desktop/mobile layout, representative quote-modal open/close, nested error template, and JavaScript-disabled content checks; results recorded in `browser-results.json`. A test-server MIME-type issue was corrected before the final run.
- JavaScript syntax: **105 local/inline browser scripts parsed successfully**. Forms, iframe markup and survey IDs in changed HTML match HEAD. Application JS and CSS are unchanged.
- HTML parsing: no parse errors in the 46 nonempty root HTML files; the intentionally empty placeholder has no document. Sitemap XML and all JSON-LD parsed successfully. `git diff --check` passed.

Audit helpers use installed tooling selected through `MOTIVE_PARSE5`, `MOTIVE_BROWSER_MODULE`, and `MOTIVE_CHROME`; no project dependencies were installed. A temporary Node 22.16.0 executable was used outside the repository. The source audit and browser checks can be rerun with those environment variables and `node audit-indexing/check.mjs`, `node audit-indexing/browser.cjs`. `node audit-indexing/live.mjs` performs public GET requests only.

New audit files: `check.mjs` and `source-results.json` (source inventory/findings); `live.mjs` and `live-results.json` (timestamped pre-deployment HTTP evidence); `browser.cjs` and `browser-results.json` (local regression); `surety-bonds-mobile.png`, `towing-mobile.png`, `404-mobile.png` (review screenshots); this `README.md` (repair report). Do not upload audit files or tests to production.
