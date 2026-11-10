# Article content audit — November 10, 2026

Changed pages: `surety-bonds.html` and `amazon-relay-requirements.html` only. `bmc-84-vs-bmc-85.html` was read in full, checked against current FMCSA sources, and left byte-for-byte unchanged. No deployment was performed. Earlier shared-footer work already in the working tree was preserved.

## Before / after

The complete, task-specific HTML patch is [changes.diff](changes.diff). It compares the working files immediately before this task with the final files, so it excludes the earlier footer changes.

| Location | Before | After |
| --- | --- | --- |
| Surety hero | BMC-84 Bond / BMC-85 Trust | BMC-84 Surety Bonds & BMC-85 Trusts |
| Surety introduction heading | Surety Bonds and Trusts that gets it right | Freight Broker Financial Responsibility |
| Surety definition | Repeated “BMC-84 bonds, often known as BMC-84 bonds” | Explains the bond's purpose and the $75,000 financial-security requirement |
| Bond/trust comparison | Brief descriptions of funds and premiums | Explains qualifying trust assets, fees versus security, premium versus bond amount, collateral and indemnity considerations |
| Coverage highlights | Two BMC-84 entries | One BMC-84 entry; five distinct highlights |
| 2026 changes | Not covered in the main explanation | Adds the January 16 changes to eligible assets/trustees and reporting/suspension procedures |
| Surety JSON-LD | Service name called both products “BMC-84” | Service name/type and breadcrumb name identify BMC-84 bonds and BMC-85 trusts; schema structure and FAQ records retained |
| Relay article | Already relevant, with current numerical limits and eligibility information | Preserves that content; clarifies commercial auto/cargo labels, equipment-dependent trailer coverage, non-auto liability, onboarding verification, and platform versus federal minimums |
| BMC comparison | Accurate, relevant article including the 2026 rules | Unchanged |

All existing meta titles, descriptions, canonical URLs, internal links, layout classes, styles, quote-form markup, survey identifiers, integrations and footer markup were retained. New contextual and official-source links were added. Surety FAQs were preserved in both visible HTML and JSON-LD.

## Official sources and editorial decisions

Sources checked November 10, 2026:

1. [FMCSA: financial-responsibility rule overview](https://www.fmcsa.dot.gov/registration/broker-and-freight-forwarder-financial-responsibility-rule-overview-and-compliance) — January 16, 2026 changes, eligible BMC-85 assets, trustee restrictions and provider responsibilities.
2. [Current 49 CFR 387.307](https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-B/part-387/subpart-C/section-387.307) — bond/trust purpose, qualifying trust assets, liquidity and current notification/suspension procedures. The version consulted was current through November 6, 2026.
3. [FMCSA: insurance filing requirements](https://www.fmcsa.dot.gov/registration/insurance-filing-requirements) — $75,000 broker/forwarder security and the vehicle/cargo-dependent motor-carrier filing chart used for the Relay comparison.
4. [FMCSA: financial-responsibility rule FAQs](https://www.fmcsa.dot.gov/registration/broker-and-freight-forwarder-financial-responsibility-rule-faqs) and the [existing 2023-rule FAQ link](https://www.fmcsa.dot.gov/registration/broker-and-freight-forwarder-financial-responsibility-2023-rule-frequently-asked) — verified the existing BMC comparison and its source link.
5. [Amazon Relay: onboarding requirements](https://relay.amazon.com/get-started) and [official FAQ](https://relay.amazon.com/faq) — verified the existing U.S. insurance limits and carrier eligibility statements.
6. [Amazon Relay: understanding insurance requirements](https://relay.amazon.com/blog/intro-to-amazon-relay/understanding-amazon-relay-insurance-requirements) — equipment-specific trailer interchange context and insurance verification during onboarding.

Two source nuances were handled explicitly:

- FMCSA's overview summarizes suspension using seven calendar days, while the current regulation specifies a seven-business-day response period after service of FMCSA's notice. The article does not repeat the overview's simplified suspension deadline. Its separate seven-calendar-day statement concerns converting qualifying trust assets to cash, which the current regulation supports.
- Amazon's general onboarding list says trailer replacement coverage; its insurance guide discusses trailer interchange for semi operations. The article identifies that distinction and directs readers to confirm the applicable coverage form for their equipment and program. It does not invent an equipment exemption or promise platform approval.

## Site-wide title/body topic QA

**Additional verified material title/body mismatches: none found. No unrelated pages were rewritten.**

The review compared page titles, headings and main content, excluding shared navigation, related-article cards and footer text. Those shared elements naturally mention other insurance topics and were not treated as article mismatches. This was a topic-alignment audit, not a fresh regulatory review of every claim elsewhere on the site.

| Pages screened | Result / suggested correction |
| --- | --- |
| `amazon-relay-requirements.html`, `bmc-84-vs-bmc-85.html`, `bobtail-vs-non-trucking-liability.html` | Bodies match their article topics. Relay's previously reported personal-auto mismatch is absent in the current repository. No replacement article needed. |
| `box-truck-insurance-quote.html`, `box-truck-loads-illinois.html`, `box-truck-operating-costs-matteson.html`, `how-to-start-a-box-truck-business-illinois.html` | Box-truck preparation, freight acquisition, costs and startup content align with the respective titles. No topic correction suggested. |
| `black-car.html`, `car-hauling.html`, `nemt.html`, `shuttle.html`, `towing.html`, `tow-truck-insurance-illinois.html` | Transportation guides address the named operations. No topic correction suggested. |
| `commercial-truck.html`, `commercial-van.html`, `commercial-fleet-insurance.html`, `household-goods.html`, `medical-courier-insurance.html` | Product/guide bodies match their commercial transportation titles. No topic correction suggested. |
| `general-liability.html`, `surety-bonds.html`, `workers-compensation.html` | Relevant subjects. Surety wording/duplication repaired as requested; no unrelated-topic replacement needed. |
| `auto.html`, `bundled-insurance.html`, `condo.html`, `homeowners.html`, `motorcycle.html`, `rental.html`, `ilivs.html` | Personal coverage and verification content match the titles. No topic correction suggested. |
| `commercial.html`, `personal.html`, `specialtytransportation.html`, `specialty-transportation-insurance-guide.html`, `index.html` | Multi-topic hubs intentionally present related insurance categories. No mismatch. |
| `about-us.html`, `careers.html`, `changes-to-policy.html`, `contact-us.html`, `file-a-claim.html`, `privacy.html`, `refer-a-friend.html`, `testimonials.html`, `404.html` | Service/information pages rather than insurance articles; main purpose matches the page title. |
| `car.html`, `freight-broker.html`, `mandatory-insurance-vehicle-services.html`, `sr22.html` | Redirect documents, not standalone articles. Unchanged. |
| `test.html` | Empty file, not an article. Unchanged. |

## Validation

- Exact source comparisons against pre-task copies passed for titles, all meta/link tags, footer markup, forms, iframes and non-SEO scripts. Existing internal links remain present.
- JSON-LD parses; only the surety service/type and breadcrumb labels changed. FAQ schema and visible FAQ content are unchanged.
- The BMC comparison matches its pre-task copy byte for byte.
- Headless Chrome checks passed on all three pages with the real Bootstrap and Font Awesome assets. The existing commercial-quote modal opens, selects the existing trucking survey URL, and closes. The surety FAQ accordion opens. Each page renders one shared footer, fits a 390px viewport, and reports no JavaScript page errors. The surety mobile screenshot was also inspected.
- NowCerts survey requests were intercepted during browser QA; no customer data was sent. This verifies local routing and UI behavior, not a live CRM submission.
- `node scripts/sync-business-data.mjs --check` and `git diff --check` pass. No shared-footer architecture changes were made in this task.
