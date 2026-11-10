# Motive final website regression audit

Audit date: November 10, 2026. **No deployment, production lead submission, or production source change was performed by this audit.**

## Result

**41 published canonical pages tested: 33 PASS, 8 FAIL for the completed page checks.** These are scoped page results, not a claim that every requested test is fully verified. Cross-cutting NOT VERIFIED items below apply to the whole site. Overall release readiness is **FAIL / fixes required**.

The local sitemap defines 41 canonical pages. Both current local source and fresh public HTTP responses were inspected. Local pages were rendered at 1440px and 390px, then rechecked after fonts/images settled. A JavaScript-disabled browser visited all 41. Baselines: Git commit e437e82b6628dd185a73d6ee5c05ade354f162f5 and the saved pre-discovery workspace at C:/Users/user14/AppData/Local/Temp/motive-discovery-zm8ohu. The Git baseline includes earlier site design work; the discovery snapshot already includes footer and article repairs. Live remains an undeployed comparison, not a controlled performance baseline.

## Test matrix

| Check | Result | Actual evidence / limit |
|---|---|---|
| Public page HTTP retrieval | PASS | 41/41 canonical URLs returned 200; neutral MotiveRegressionAudit/1.0 client, no bot impersonation. |
| Internal page links | PASS | All local/live same-origin anchor destinations checked; 43 distinct page paths, including /index.html and the expected freight-broker redirect. No broken local targets or fragments. Full status list in results.json. |
| Redirects | PASS | freight-broker.html returns 301 to specialtytransportation.html; destination 200. HTTP and www redirect to HTTPS apex. car.html retains its existing HTML redirect. |
| Titles/descriptions/canonicals | PASS | No duplicate values among 41 pages; one H1 and canonical each. 0 key metadata differences versus Git; 0 versus discovery baseline. |
| Local sitemap | PASS | 41 unique eligible pages; XML parsed; generator check current. |
| Deployed sitemap coverage | FAIL | Live sitemap still lists 34 URLs; seven published pages remain omitted until reviewed local changes are uploaded. |
| robots.txt | PASS | Live 200; wildcard Allow / with archived-path exclusions; correct deployed sitemap URL. Repository rules unchanged. |
| HTML parser checks | PASS | parse5 8.1.1 WHATWG parser: no parse errors on 41 current pages or the discovery baseline; no duplicate IDs. |
| Complete HTML conformance | NOT VERIFIED | A parser is not a complete conformance validator. External validator upload was rejected; no local source was sent. |
| JSON-LD syntax/entity checks | PASS | All present JSON-LD parses; five automated tests pass, including duplicate definitions, stable canonical entity/location data, and internal targets. |
| Complete schema eligibility | NOT VERIFIED | No external Schema.org/Google certification. Optional omissions and broken image warning below. |
| AI robots permission | PASS | All seven requested identities permitted for public paths by current wildcard rules. |
| Genuine provider crawler access | NOT VERIFIED | No cPanel access logs, ModSecurity events, or host firewall settings available. Public 200 and official IP feeds do not prove provider-origin access. |
| Shared footer rendering | PASS | All 41 local pages render exactly one footer with both canonical addresses and configured states; raw footer contains no independent address/phone copy. |
| Conflicting footer values | PASS | No contradictory hardcoded footer addresses in published local pages; Wood Dale canonical value is # 208. |
| All business values centrally bound | FAIL | Existing non-footer phone/contact/FAQ copies remain outside generated bindings. Values currently agree; future configuration changes can leave these stale. Inventory below. |
| Desktop/mobile geometry | PASS | All 41 pages fit 1440px and 390px after settling; desktop hover/keyboard and mobile menu checks passed. |
| Complete visual equivalence | NOT VERIFIED | Representative screenshots inspected; no pixel-matched pre-change baseline or real-device matrix. Missing image remains a visible defect. |
| Uncaught JavaScript exceptions | PASS | None observed in the 41-page primary browser run. |
| Resource requests | FAIL | Missing local specialty script, missing specialty hero, Vimeo 401. Navigation-cancelled hidden iframe requests are distinguished from HTTP failures. |
| FAQ controls | PASS | 135 details/Bootstrap accordion toggles tested; 0 failures. |
| Quote modal controls | PASS | Box-truck and household modal open/close and observed survey selection tested; six hosted survey endpoints loaded 200. This does not cover every button state. |
| Every button and integration state | NOT VERIFIED | Phone/mail handlers, every generated option, all wizard steps, and every browser/device were not exhaustively exercised. |
| Safe hosted-form validation | PASS | Empty trucking, business and contact surveys show required-field errors; every interaction-time request was blocked. No personal data entered. |
| Remaining hosted wizard validation | NOT VERIFIED | Three surveys loaded but suitable next controls were not exercised by the selector-based test. |
| Production lead/CRM delivery | NOT VERIFIED | No authorized sandbox endpoint provided; no successful production lead submitted. |
| Medical-courier delivery | FAIL | Existing local validation-only form explicitly reports not sent after valid synthetic input. |
| Integration endpoint preservation | PASS | All 41 pages retain iframe tags, form blocks, survey IDs and NowCerts/Momentum-related URL strings versus both baselines. app.js unchanged. Existing medical Momentum TODO remains unchanged. |
| Main-content AI readability | PASS | Headings, service/article text and primary links present in raw HTML and visible in JavaScript-disabled visits on all 41 pages. No hidden duplicate content introduced. |
| Performance regressions | NOT VERIFIED | Current timings and source-size deltas recorded; no controlled before/after speed or Core Web Vitals baseline. |
| Reviewed insurance articles | PASS | Surety, BMC comparison and Relay core claims remain relevant and match the official sources listed below. |
| Every insurance/regulatory claim site-wide | NOT VERIFIED | Topic alignment was inspected; this is not a complete underwriting/legal review of every cost, policy term or historical article. |

## Page results

PASS means no observed failure in the completed checks for that page. Global limitations above still apply.

| Page | Result | Finding |
|---|---|---|
| index.html | FAIL | Vimeo video returned 401 in both local and live automated-browser checks; a provider challenge was observed. Human playback is NOT VERIFIED. |
| about-us.html | PASS | Completed HTTP, metadata, HTML/JSON syntax, raw/no-JS content, footer, layout and applicable menu/FAQ checks without a page-specific failure. |
| amazon-relay-requirements.html | PASS | Completed HTTP, metadata, HTML/JSON syntax, raw/no-JS content, footer, layout and applicable menu/FAQ checks without a page-specific failure. |
| bmc-84-vs-bmc-85.html | PASS | Completed HTTP, metadata, HTML/JSON syntax, raw/no-JS content, footer, layout and applicable menu/FAQ checks without a page-specific failure. |
| bobtail-vs-non-trucking-liability.html | PASS | Completed HTTP, metadata, HTML/JSON syntax, raw/no-JS content, footer, layout and applicable menu/FAQ checks without a page-specific failure. |
| box-truck-loads-illinois.html | PASS | Completed HTTP, metadata, HTML/JSON syntax, raw/no-JS content, footer, layout and applicable menu/FAQ checks without a page-specific failure. |
| bundled-insurance.html | PASS | Completed HTTP, metadata, HTML/JSON syntax, raw/no-JS content, footer, layout and applicable menu/FAQ checks without a page-specific failure. |
| auto.html | PASS | Completed HTTP, metadata, HTML/JSON syntax, raw/no-JS content, footer, layout and applicable menu/FAQ checks without a page-specific failure. |
| careers.html | PASS | Completed HTTP, metadata, HTML/JSON syntax, raw/no-JS content, footer, layout and applicable menu/FAQ checks without a page-specific failure. |
| changes-to-policy.html | PASS | Completed HTTP, metadata, HTML/JSON syntax, raw/no-JS content, footer, layout and applicable menu/FAQ checks without a page-specific failure. |
| commercial.html | PASS | Completed HTTP, metadata, HTML/JSON syntax, raw/no-JS content, footer, layout and applicable menu/FAQ checks without a page-specific failure. |
| commercial-truck.html | PASS | Completed HTTP, metadata, HTML/JSON syntax, raw/no-JS content, footer, layout and applicable menu/FAQ checks without a page-specific failure. |
| commercial-van.html | PASS | Completed HTTP, metadata, HTML/JSON syntax, raw/no-JS content, footer, layout and applicable menu/FAQ checks without a page-specific failure. |
| condo.html | PASS | Completed HTTP, metadata, HTML/JSON syntax, raw/no-JS content, footer, layout and applicable menu/FAQ checks without a page-specific failure. |
| contact-us.html | PASS | Completed HTTP, metadata, HTML/JSON syntax, raw/no-JS content, footer, layout and applicable menu/FAQ checks without a page-specific failure. |
| file-a-claim.html | PASS | Completed HTTP, metadata, HTML/JSON syntax, raw/no-JS content, footer, layout and applicable menu/FAQ checks without a page-specific failure. |
| general-liability.html | PASS | Completed HTTP, metadata, HTML/JSON syntax, raw/no-JS content, footer, layout and applicable menu/FAQ checks without a page-specific failure. |
| how-to-start-a-box-truck-business-illinois.html | PASS | Completed HTTP, metadata, HTML/JSON syntax, raw/no-JS content, footer, layout and applicable menu/FAQ checks without a page-specific failure. |
| homeowners.html | PASS | Completed HTTP, metadata, HTML/JSON syntax, raw/no-JS content, footer, layout and applicable menu/FAQ checks without a page-specific failure. |
| ilivs.html | PASS | Completed HTTP, metadata, HTML/JSON syntax, raw/no-JS content, footer, layout and applicable menu/FAQ checks without a page-specific failure. |
| motorcycle.html | PASS | Completed HTTP, metadata, HTML/JSON syntax, raw/no-JS content, footer, layout and applicable menu/FAQ checks without a page-specific failure. |
| personal.html | PASS | Completed HTTP, metadata, HTML/JSON syntax, raw/no-JS content, footer, layout and applicable menu/FAQ checks without a page-specific failure. |
| privacy.html | PASS | Completed HTTP, metadata, HTML/JSON syntax, raw/no-JS content, footer, layout and applicable menu/FAQ checks without a page-specific failure. |
| refer-a-friend.html | PASS | Completed HTTP, metadata, HTML/JSON syntax, raw/no-JS content, footer, layout and applicable menu/FAQ checks without a page-specific failure. |
| rental.html | PASS | Completed HTTP, metadata, HTML/JSON syntax, raw/no-JS content, footer, layout and applicable menu/FAQ checks without a page-specific failure. |
| specialtytransportation.html | PASS | Completed HTTP, metadata, HTML/JSON syntax, raw/no-JS content, footer, layout and applicable menu/FAQ checks without a page-specific failure. |
| surety-bonds.html | PASS | Completed HTTP, metadata, HTML/JSON syntax, raw/no-JS content, footer, layout and applicable menu/FAQ checks without a page-specific failure. |
| testimonials.html | PASS | Completed HTTP, metadata, HTML/JSON syntax, raw/no-JS content, footer, layout and applicable menu/FAQ checks without a page-specific failure. |
| workers-compensation.html | PASS | Completed HTTP, metadata, HTML/JSON syntax, raw/no-JS content, footer, layout and applicable menu/FAQ checks without a page-specific failure. |
| medical-courier-insurance.html | FAIL | Review form validates locally but does not send requests: Momentum AMP connection remains a TODO. Synthetic valid input confirms the explicit not-sent message. |
| box-truck-operating-costs-matteson.html | PASS | Completed HTTP, metadata, HTML/JSON syntax, raw/no-JS content, footer, layout and applicable menu/FAQ checks without a page-specific failure. |
| box-truck-insurance-quote.html | PASS | Completed HTTP, metadata, HTML/JSON syntax, raw/no-JS content, footer, layout and applicable menu/FAQ checks without a page-specific failure. |
| household-goods.html | PASS | Completed HTTP, metadata, HTML/JSON syntax, raw/no-JS content, footer, layout and applicable menu/FAQ checks without a page-specific failure. |
| tow-truck-insurance-illinois.html | PASS | Completed HTTP, metadata, HTML/JSON syntax, raw/no-JS content, footer, layout and applicable menu/FAQ checks without a page-specific failure. |
| black-car.html | FAIL | Referenced transportation-guide.js is missing locally (404), although live returns 200. |
| car-hauling.html | FAIL | Referenced transportation-guide.js is missing locally (404), although live returns 200. |
| commercial-fleet-insurance.html | PASS | Completed HTTP, metadata, HTML/JSON syntax, raw/no-JS content, footer, layout and applicable menu/FAQ checks without a page-specific failure. |
| nemt.html | FAIL | Referenced transportation-guide.js is missing locally (404), although live returns 200. |
| shuttle.html | FAIL | Referenced transportation-guide.js is missing locally (404), although live returns 200. |
| specialty-transportation-insurance-guide.html | FAIL | Hero image assets/specialty-transportation-guide-hero.jpg returns 404 locally and live; also referenced by social metadata and Article schema. |
| towing.html | FAIL | Referenced transportation-guide.js is missing locally (404), although live returns 200. |

## Broken links, resources and redirects

No broken internal HTML navigation links or local fragments were found. Resource failures are separate:

- **FAIL:** transportation-guide.js: local 404 on black-car, car-hauling, nemt, shuttle and towing; live 200 JavaScript. Recover/reconcile the exact live script before preparing a complete local upload. The HTML reference already existed; it is not a discovery change.
- **FAIL:** assets/specialty-transportation-guide-hero.jpg: local/live 404. Restore the intended image or consistently replace its visible hero, preload, social and schema references. Do not substitute an unrelated image.
- **FAIL (observed retrieval):** homepage Vimeo embed returns 401 locally and on the live origin in the automated browser. A provider challenge was observed. Verify video privacy/domain permissions and real-browser playback; the audit does not prove all human visitors are blocked.
- **NOT VERIFIED (undeployed asset):** live /llms.txt returns 404; the new local file exists and passes its 41-URL consistency test. It is not linked from current HTML, and this is not a broken navigation link.
- **PASS:** expected freight-broker 301 resolves to a live page. /index.html is a 200 alias canonicalized to /. No unexpected redirect among canonical pages.
- **NOT VERIFIED / existing cleanup:** direct /404.html returns 200 without canonical/noindex; the tested nonexistent route correctly returns 404. car.html retains a client-side redirect rather than a server 301. These were not changed.

## Structured-data and business-data warnings

- **PASS:** Shared agency name, phone, both offices and service states derive from data/site-footer.json for generated business schema. Stable IDs are preserved, with a single full definition per document. Static generated JSON-LD values are expected output, not a second configuration.
- **FAIL:** Specialty guide Article/social image points to the missing hero.
- **NOT VERIFIED / optional coverage:** These 11 pages have no JSON-LD; absence alone is not invalid HTML or a Google penalty: auto.html, careers.html, changes-to-policy.html, condo.html, file-a-claim.html, homeowners.html, motorcycle.html, privacy.html, refer-a-friend.html, rental.html, testimonials.html.
- **PASS:** The preceding discovery DOM audit verified all 112 FAQ question/answer pairs against visible content; this audit did not alter production files. Existing FAQ interactions were freshly tested. Rich-result appearance is not promised.
- **FAIL (maintainability):** Non-footer business literals still exist. Current values do not contradict the canonical footer, but the generator does not bind every phone CTA, natural-language FAQ, location mention or maintenance-script matcher. Full occurrences are in source-check.json; unbound non-schema occurrences are:

- about-us.html:126
- careers.html:126
- changes-to-policy.html:126
- commercial-fleet-insurance.html:117
- commercial-fleet-insurance.html:165
- file-a-claim.html:126
- google-rating-extract.js:43
- household-goods.html:180
- index.html:211
- index.html:220
- medical-courier-insurance.html:151
- medical-courier-insurance.html:152
- medical-courier-insurance.html:154
- medical-courier-insurance.html:155
- medical-courier-insurance.html:158
- medical-courier-insurance.html:170
- medical-courier-insurance.js:73
- refer-a-friend.html:126
- testimonials.html:126
- tow-truck-insurance-illinois.html:203

The homepage FAQ also embeds its phone in JSON-LD answer text; this prose is not normalized by the business-entity generator. google-rating-extract.js uses a Matteson address matcher to identify the correct review listing; it is not a footer. Geographic article prose should be reviewed contextually rather than globally replaced. Archived/audit copies are not public-page sources and are excluded by server rules.

**Live versus local:** three live pages still have full hardcoded footer business copies (box-truck-insurance-quote, tow-truck-insurance-illinois, commercial-fleet-insurance). Their current values agree with the JSON; local repaired pages remove those copies. Undeployed changes cannot fix live source yet.

## Crawler matrix

| Crawler | Public robots rule | Neutral HTTP | Genuine provider HTTP / logs | Firewall/CDN |
|---|---|---|---|---|
| OAI-SearchBot | PASS: permitted by wildcard, archive exclusions retained | PASS: 41/41 pages 200 | NOT VERIFIED: no provider-origin request or hosting logs | NOT VERIFIED: host controls unavailable; no matching deny in local .htaccess |
| ChatGPT-User | PASS: permitted by wildcard, archive exclusions retained | PASS: 41/41 pages 200 | NOT VERIFIED: no provider-origin request or hosting logs | NOT VERIFIED: host controls unavailable; no matching deny in local .htaccess |
| PerplexityBot | PASS: permitted by wildcard, archive exclusions retained | PASS: 41/41 pages 200 | NOT VERIFIED: no provider-origin request or hosting logs | NOT VERIFIED: host controls unavailable; no matching deny in local .htaccess |
| Claude-SearchBot | PASS: permitted by wildcard, archive exclusions retained | PASS: 41/41 pages 200 | NOT VERIFIED: no provider-origin request or hosting logs | NOT VERIFIED: host controls unavailable; no matching deny in local .htaccess |
| Claude-User | PASS: permitted by wildcard, archive exclusions retained | PASS: 41/41 pages 200 | NOT VERIFIED: no provider-origin request or hosting logs | NOT VERIFIED: host controls unavailable; no matching deny in local .htaccess |
| Googlebot | PASS: permitted by wildcard, archive exclusions retained | PASS: 41/41 pages 200 | NOT VERIFIED: no provider-origin request or hosting logs | NOT VERIFIED: host controls unavailable; no matching deny in local .htaccess |
| Bingbot | PASS: permitted by wildcard, archive exclusions retained | PASS: 41/41 pages 200 | NOT VERIFIED: no provider-origin request or hosting logs | NOT VERIFIED: host controls unavailable; no matching deny in local .htaccess |

Official published IP feeds for OpenAI search/user fetches, Perplexity, Anthropic, Google common crawlers and Bing were freshly fetched as 200 and saved in followup.json. This verifies feed availability only. No IP allowlist or security/rate-limit change was made. GPTBot training permission remains separate: the existing wildcard also permits it; this audit neither changes training policy nor equates it with search. ChatGPT-User may not follow robots for user-triggered fetches.

## Quote-process findings

- **PASS:** Six unique configured NowCerts survey URLs return 200 and render inputs. Existing form/iframe identifiers and app.js are unchanged from Git and discovery baselines. Three empty-form tests show required-field errors with all network blocked before clicking. The contact test also shows its challenge/terms validation.
- **NOT VERIFIED:** Server acceptance, email delivery, CRM routing, full wizard progression and real challenge completion. Blocking POST requests intentionally suppresses vendor telemetry and challenge traffic; resulting vendor validation/challenge failures must not be treated as proof of a production outage.
- **FAIL:** medical-courier-insurance.js still contains the explicit Momentum AMP integration TODO. Seven empty required fields fail validation; valid synthetic values show: “Your information is ready for review, but has not been sent. Online requests are not connected yet.” This predates the audited discovery/footer changes.
- **NOT VERIFIED / review needed:** The hosted contact survey renders consent text naming “Assurance Total Protection.” Confirm this is the intended Motive consent/legal entity in the vendor configuration before publication; do not silently change an external legal disclosure.
- **PASS:** No production lead was sent. All non-read browser requests were blocked in the form tests; all requests were blocked during hosted form interactions. Synthetic data was entered only in the local medical preview.

## AI readability and performance

All 41 pages expose their main headings and substantive body text without JavaScript. The shared footer’s detailed addresses/states require its JSON renderer; the no-JS fallback offers contact/privacy links, and generated business identity remains in raw JSON-LD on relevant pages. Live ratings and embedded quote workflows also require JavaScript. No duplicate hidden crawler-only copy was added.

Current canonical HTML GET timings (single neutral-client run): min 80 ms, median 104 ms, max 438 ms. These are retrieval observations, not LCP/INP/CLS or a load test. Browser timing/resource observations are in results.json. Total uncompressed HTML delta versus Git across the 41 pages: 46885 bytes. app.js and style.css content are unchanged; restored specialty CSS is previously missing local content, not evidence of a measured slowdown. There is no valid controlled baseline to claim a performance PASS or regression magnitude.

## Insurance content review

**PASS (reviewed scope):** Surety and BMC-comparison articles distinguish bond premiums/indemnity from qualifying trust assets, state the $75,000 requirement, and describe the January 16, 2026 changes without inventing guaranteed approval. Relay limits, eligibility, equipment-dependent trailer requirements, and platform-versus-government distinctions align with the official Amazon and FMCSA material reviewed. No material title/body topic mismatch was found in the previously reviewed article inventory or this raw-content inventory.

**NOT VERIFIED:** Exhaustive accuracy of every financial, underwriting, state-law or regulatory statement across all other pages. The eCFR page returned an automated-access challenge during this fresh check; its current text was not revalidated here. The earlier article audit documents its regulatory cross-check and the difference between the FMCSA overview’s simplified calendar-day suspension summary and the regulation.

## Files modified and fixes required

This audit created only audit-regression scripts, JSON evidence, screenshots, this report and pending-change inventories. **No production HTML, CSS, JavaScript, JSON configuration, sitemap, robots or server configuration was modified in this audit.** Existing worktree changes are listed in pending-changes.txt and pending-diff-stat.txt; prior task-specific files are documented in ../audit-discovery/README.md, ../audit-content/README.md and ../audit-crawlers/README.md.

Required before calling the site fully verified:

1. Restore/reconcile the missing local transportation-guide.js and the specialty hero asset.
2. Investigate the observed Vimeo 401/challenge and confirm intended public playback.
3. Connect or clearly retain the medical preview with its limitation disclosed; verify Momentum AMP delivery using an authorized test destination. Do not send production leads automatically.
4. Review remaining non-footer shared business literals and the hosted consent entity.
5. Obtain a CRM sandbox/test workflow to complete the remaining hosted form and delivery tests.
6. After reviewing fixes, manually upload the approved changes together; local sitemap/llms/entity improvements are not live. No deployment was performed.
7. Full conformance validation, provider-log checks, real-device testing and controlled performance comparison remain NOT VERIFIED.

## Evidence and official sources

Evidence: results.json (raw/live/baseline metadata, all link statuses, browser console/resources/timing, no-JS output); stable.json (settled layouts and repeat controls); html-validation.json; source-check.json; followup.json (menus/forms/feeds/statuses); survey-validation.json; live-home.json; screenshots. Initial menu click assertions in results.json were superseded by focused keyboard/hover tests: pointer hover opens the menu before a click toggles it closed. Transient image measurements were superseded by stable.json after URL-decoding correction and settling.

- https://developers.openai.com/api/docs/bots
- https://docs.perplexity.ai/docs/resources/perplexity-crawlers
- https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler
- https://developers.google.com/crawling/docs/crawlers-fetchers/verify-google-requests
- https://www.bing.com/webmasters/help/how-to-verify-bingbot-3905dc26
- https://relay.amazon.com/get-started
- https://relay.amazon.com/blog/intro-to-amazon-relay/understanding-amazon-relay-insurance-requirements
- https://www.fmcsa.dot.gov/registration/broker-and-freight-forwarder-financial-responsibility-rule-overview-and-compliance
- https://www.fmcsa.dot.gov/registration/insurance-filing-requirements

External-validator limitation: automatic approval review rejected uploading full local HTML to W3C because it could disclose unpublished source. No upload occurred. Local HTML5 parser validation was completed instead; full conformance remains NOT VERIFIED.
