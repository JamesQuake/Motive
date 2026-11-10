# Discovery and entity audit — 2026-11-10

Completed locally; not deployed. This report compares this task against its starting workspace, which already contained earlier footer, article, crawler, and stylesheet repairs.

## Sitemap coverage

47 root HTML files inspected; 41 published canonical pages included exactly once. The other six are the error page, four redirect pages, and an empty HTML file. All 41 URLs returned HTTP 200 with the expected canonical and no meta/header noindex in the live check. XML parsed successfully. The local manifest already contained 41 URLs at this task's start; the deployed sitemap contained 34. No new URLs were invented.

The existing sitemap remains the explicit publication manifest for manual cPanel uploads. The generator rejects missing eligible canonical pages, duplicates, redirects, noindex pages, invalid dates, and noncanonical entries. The 31 pages changed in this task receive the known edit date 2026-11-10; untouched dates remain unchanged. Article modification dates derive from this manifest.

## Structured data

The existing data/site-footer.json remains authoritative. Added stable location IDs without changing addresses, phone, or service states. Wood Dale remains 333 N Wood Dale Rd # 208. Existing #agency identifies the InsuranceAgency; this type already inherits Organization/LocalBusiness. Two Place nodes identify Matteson and Wood Dale without inventing separate branch businesses. Anonymous Motive publisher/author/provider copies become references to the single agency definition per document. No licenses, ratings, reviews, appointments, hours, or coordinates added. Broad United States service assertions were narrowed to the configured states; existing Illinois-specific scope remains.

Counts are typed nodes across HTML documents, not unique businesses across the website:

| Type | Before | After |
|---|---:|---:|
| InsuranceAgency | 12 | 28 |
| Organization | 16 | 0 |
| Place | 0 | 56 |
| Article | 11 | 14 |
| BlogPosting | 3 | 3 |
| Service | 6 | 10 |
| BreadcrumbList | 17 | 28 |
| FAQPage | 20 | 20 |
| CollectionPage | 1 | 3 |
| WebPage | 5 | 12 |

All 112 existing FAQ questions and answers match visible page content after synchronizing 10 mismatched answers on the two Illinois box-truck guides. No new FAQ questions were invented. Existing Article, Service, breadcrumb, and FAQ nodes were preserved; missing targeted nodes were supplemented with stable identifiers. Three comparison/requirements articles now have Article markup.

## Internal links

Contextual links were added in seven pages: commercial, commercial truck, commercial van, BMC comparison, bobtail comparison, auto, and the Illinois startup guide. Existing hubs and quote pathways remain. The authority pathway uses the published startup guide’s existing #usdot-authority section. Specialty’s existing five guide links remain. No unpublished targets added.

Counts below exclude self-links, navigation, footer, sidebars, breadcrumbs, and insights strips; they count distinct published source pages.

| Destination | Before | After |
|---|---:|---:|
| commercial-truck.html | 7 | 9 |
| commercial-van.html | 3 | 3 |
| commercial-fleet-insurance.html | 2 | 5 |
| household-goods.html | 0 | 3 |
| general-liability.html | 2 | 3 |
| surety-bonds.html | 1 | 2 |
| medical-courier-insurance.html | 0 | 2 |
| ilivs.html | 1 | 2 |

Household-goods and medical-courier pages previously had no contextual incoming links under this definition. New links connect them from relevant hubs and guides.

## AI directory

llms.txt is generated from the existing sitemap and HTML titles: 41 unique canonical destinations. It contains no second business configuration. Run scripts/sync-discovery.mjs after publishing/content changes; --check detects drift. The directory is optional and does not replace robots.txt, sitemap.xml, or JSON-LD, or guarantee AI inclusion.

## Changed source files

- about-us.html
- amazon-relay-requirements.html
- auto.html
- black-car.html
- bmc-84-vs-bmc-85.html
- bobtail-vs-non-trucking-liability.html
- box-truck-insurance-quote.html
- box-truck-loads-illinois.html
- box-truck-operating-costs-matteson.html
- bundled-insurance.html
- car-hauling.html
- commercial-fleet-insurance.html
- commercial-truck.html
- commercial-van.html
- commercial.html
- contact-us.html
- general-liability.html
- household-goods.html
- how-to-start-a-box-truck-business-illinois.html
- ilivs.html
- index.html
- medical-courier-insurance.html
- nemt.html
- personal.html
- shuttle.html
- specialty-transportation-insurance-guide.html
- specialtytransportation.html
- surety-bonds.html
- tow-truck-insurance-illinois.html
- towing.html
- workers-compensation.html
- data/site-footer.json
- sitemap.xml
- llms.txt
- scripts/sync-business-data.mjs
- scripts/sync-discovery.mjs
- tests/business-data.test.mjs
- tests/discovery.test.mjs
- .github/workflows/business-data.yml
- README.md

Audit artifacts: before.json, after.json, changed-pages.json, inspect.cjs, report.cjs, and this report.

## Validation and remaining warnings

- Browser checks passed on 42 pages: exactly one footer with canonical data, HTTP/network/invalid-data fallbacks, and JavaScript disabled. Four representative footers fit 390px and 1440px widths with external assets blocked. This is a footer smoke test, not a complete visual review.
- Five automated tests passed; both generators report current output. XML parses; git diff --check passes.
- All changed pages retain byte-identical title, meta, link, footer, form, iframe, and non-JSON-LD script elements relative to the task baseline. Quote integration source is unchanged; no real submissions made.
- DOM inspection separately parsed 47 HTML documents and checked all 112 visible FAQ answers.
- The existing specialty guide hero URL assets/specialty-transportation-guide-hero.jpg is missing locally and returns live HTTP 404. It affects the visible hero, preload, social image, and existing schema image. No replacement image was guessed. This remains a pre-existing asset issue to resolve before upload.
- No external rich-results certification or actual AI indexing claim is made. Google removed FAQ rich results in May 2026; valid FAQ schema does not promise them. Google says llms.txt has no effect on Search visibility.
- Public HTTP checks do not establish genuine crawler/firewall access; no hosting access logs were available.
- Manually upload the reviewed changed HTML, canonical JSON, sitemap, and llms.txt together. Audit directories, scripts, and tests are not public-site upload content. Nothing was deployed.

## Supporting sources

- https://schema.org/InsuranceAgency
- https://schema.org/location
- https://llmstxt.org/
- https://developers.google.com/search/updates
