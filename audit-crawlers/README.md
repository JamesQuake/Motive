# AI search crawler access audit

Checked November 10, 2026. Live GET audit: 10:57–10:58 a.m. America/Chicago (16:57–16:58 UTC).

**Result:** public robots rules permit the seven requested crawler identifiers, and all 41 canonical content pages were retrievable as HTTP 200 in an ordinary public HTTP audit. Genuine provider-origin crawler access remains **unverified** because authenticated GoDaddy access/security logs are not available in this workspace. No bot-specific block was established; absence of a block in this audit does not prove that every provider IP can access the site.

## Hosting and security evidence

- **Platform:** GoDaddy cPanel with manual uploads, confirmed by the owner. The repository README describes the same deployment method. GitHub holds source and publishes review data; it does not deploy this website through GitHub Pages.
- **Live server:** responses identify `Server: Apache`. DNS resolves `motivetoday.com` to `198.12.236.79`; nameservers are `ns11.domaincontrol.com` and `ns12.domaincontrol.com`; `www` aliases the apex. No apex AAAA answer was returned.
- **CDN:** no Cloudflare/CDN response identifiers or proxy DNS chain were observed. This is not proof that no upstream filtering exists.
- **Local server configuration:** `.htaccess` controls HTTPS/preferred-host redirects, legacy redirects, security headers, compression and caching. It has no crawler User-Agent or provider-IP blocks and no local rate-limit directives. Documentation, audit directories and maintenance scripts remain denied; directory listings remain disabled.
- **Live headers:** CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy and Permissions-Policy are present. They were not relaxed. No X-Robots-Tag was observed on the audited responses.
- **Host controls/logs:** cPanel IP Blocker, ModSecurity events, host-level firewall/rate-limit configuration and Apache access logs were not accessible through the available tools. Local `audit-quote/*error.log` files are development logs, not server visitor logs. No claim of verified crawler traffic is based on them.

## Crawler matrix

“Public GET 200” below refers to the same neutral `MotivePublicAccessAudit/1.0` test of all 41 canonical pages. **No crawler User-Agent was spoofed.** It is not a request originating from that provider's network.

| Crawler token | Live robots permission for public content | HTTP access result | Firewall / CDN evidence | Verified server-log evidence | Recommended correction |
| --- | --- | --- | --- | --- | --- |
| `OAI-SearchBot` | Permitted by `User-agent: *` / `Allow: /`; archived-path exclusions retained | Public GET 200; genuine OAI-SearchBot access unverified | No matching block in local `.htaccess`; host rules unknown | Unavailable | No robots change. Verify source IP against OpenAI search ranges if a host log later shows a failed request. |
| `ChatGPT-User` | No robots prohibition on public pages; OpenAI notes user-triggered fetches may not follow robots rules | Public GET 200; genuine ChatGPT-User access unverified | Same evidence boundary | Unavailable | No robots change. Use its own IP feed, not the search or training feed, for log verification. |
| `PerplexityBot` | Permitted by wildcard group | Public GET 200; genuine PerplexityBot access unverified | Same evidence boundary | Unavailable | No robots change. Verify against the PerplexityBot feed before considering a narrowly scoped host exception. |
| `Claude-SearchBot` | Permitted by wildcard group | Public GET 200; genuine Claude-SearchBot access unverified | Same evidence boundary | Unavailable | No robots change. Check the shared Anthropic IP list plus the logged agent identity. |
| `Claude-User` | Permitted by wildcard group | Public GET 200; genuine Claude-User access unverified | Same evidence boundary | Unavailable | No robots change. Check the shared Anthropic IP list plus the logged agent identity. |
| `Googlebot` | Permitted by wildcard group | Public GET 200; genuine Googlebot access unverified | Same evidence boundary | Unavailable | Preserve existing SEO rules. Verify using Google's common-crawler IP feed or forward-confirmed reverse DNS. |
| `bingbot` (Bingbot) | Permitted by wildcard group; token matching is case-insensitive | Public GET 200; genuine Bingbot access unverified | Same evidence boundary | Unavailable | Preserve existing rules. Verify using Microsoft's feed or forward-confirmed `search.msn.com` DNS. |

The only shared correction found was sitemap completeness; the local sitemap now includes the seven missing public pages.

## Official identifiers and IP sources

Official documentation and live JSON endpoints were read on the audit date. Full downloaded prefixes, source URLs, retrieval timestamps and provider creation timestamps are recorded in [provider-ip-snapshots.json](provider-ip-snapshots.json). These are dated audit evidence, **not a firewall allowlist**.

| Provider / purpose | Official documentation | Official IP feed | Prefixes retrieved |
| --- | --- | --- | ---: |
| OpenAI search | [OpenAI crawler documentation](https://developers.openai.com/api/docs/bots) | [searchbot.json](https://openai.com/searchbot.json) | 39 |
| OpenAI user retrieval | [OpenAI crawler documentation](https://developers.openai.com/api/docs/bots) | [chatgpt-user.json](https://openai.com/chatgpt-user.json) | 237 |
| Perplexity search | [Perplexity crawler documentation](https://docs.perplexity.ai/docs/resources/perplexity-crawlers) | [perplexitybot.json](https://www.perplexity.ai/perplexitybot.json) | 13 |
| Anthropic bots (shared feed) | [Anthropic crawler documentation](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) | [bots.json](https://claude.com/crawling/bots.json) | 14 |
| Google common crawlers | [Google verification documentation](https://developers.google.com/crawling/docs/crawlers-fetchers/verify-google-requests), [Googlebot](https://developers.google.com/search/docs/crawling-indexing/googlebot) | [common-crawlers.json](https://developers.google.com/static/crawling/ipranges/common-crawlers.json) | 317 |
| Bing crawler | [Microsoft verification guidance](https://www.bing.com/webmasters/help/how-to-verify-bingbot-3905dc26) | [bingbot.json](https://www.bing.com/toolbox/bingbot.json) | 29 |

Do not substitute broad cloud-provider ranges or an unverified User-Agent for these identities. A genuine log check would compare the connection's trusted source IP against the current provider feed, then correlate requested path, timestamp, status and security-rule event. For Google/Bing reverse-DNS verification, the returned provider hostname must also resolve forward to the original address. Feed timestamps can be older than the retrieval date; refresh from the official endpoint before operational use.

## Robots and training policy

Live `robots.txt` returned HTTP 200 and matched the repository file:

```text
User-agent: *
Allow: /
Disallow: /Version%201.2/
Disallow: /Version 1.2/
Sitemap: https://motivetoday.com/sitemap.xml
```

No change is required. Adding bot-specific `Allow: /` groups could accidentally bypass the wildcard group's archive exclusions unless those exclusions were repeated. The actual deployed sitemap URL returns HTTP 200 XML.

`GPTBot` is a training crawler, separate from `OAI-SearchBot`. The existing wildcard policy also permits GPTBot on public paths; this task neither grants a new training permission nor introduces a training opt-out. Search access does not require changing GPTBot's policy. Anthropic's training crawler `ClaudeBot` is also separate from the two requested Claude identities. No training preference, private-path restriction or rate limit was changed.

## Indexability and redirects

- Audited 46 page URLs, plus robots, sitemap, host/URL redirect samples, a nonexistent URL and the public footer JSON. Redirect chains and relevant response headers are saved in [public-results.json](public-results.json).
- All **41 canonical content URLs** returned 200 directly, each with its own expected canonical (homepage `/`). None had noindex/nofollow meta directives, an X-Robots-Tag, a 403/429 response, or a detected challenge marker. Main page headings and copy are in source HTML; they do not require JavaScript rendering.
- The full shared footer and live rating use JavaScript. This does not hide the main articles or product descriptions; the public footer JSON also returned 200. The footer architecture and quote integrations were not changed.
- `http://motivetoday.com/` and `https://www.motivetoday.com/` redirect with 301 to the preferred HTTPS apex. Sample clean and legacy routes redirect to their intended HTML pages.
- `freight-broker.html`, `sr22.html` and `mandatory-insurance-vehicle-services.html` have working server 301s to the configured replacement pages. Their noindex HTML fallback files remain unchanged.
- `car.html` returns a noindex HTML redirect to `auto.html`, with a matching destination canonical. This is an existing client-side redirect, not a blocked canonical page. A server 301 would be a possible future cleanup, but no redirect policy was changed here.
- `index.html` returns 200 and canonicalizes to `/`, consistently with the sitemap. No canonical conflict was found among the 41 content URLs.
- A nonexistent test path returned a genuine 404. Direct `/404.html` returns 200 without a canonical/noindex; it is an error-page asset, excluded from the sitemap. This was recorded, not changed as an AI-crawler setting. Empty local `test.html` is also excluded.
- These are low-rate, single-network observations, not a load test or proof of access from every crawler source address. Search inclusion and ranking are not guaranteed by successful retrieval.

## Local correction and deployment handoff

The live and original local sitemaps contained 34 URLs. Added these seven existing, live, self-canonical, indexable pages to the local `sitemap.xml`:

- `black-car.html`
- `car-hauling.html`
- `commercial-fleet-insurance.html`
- `nemt.html`
- `shuttle.html`
- `specialty-transportation-insurance-guide.html`
- `towing.html`

All existing entries and dates were retained. No invented last-modified dates were added. XML parsing and validation confirm **41 unique URLs**, each backed by the live audit. `robots.txt`, `.htaccess`, page metadata, logins, private resources, CRM endpoints and quote integrations were untouched.

**Nothing was deployed.** When ready, the only production file from this task to upload through GoDaddy cPanel is `sitemap.xml`, replacing the current file in the website document root (normally `public_html`). Do not upload `audit-crawlers/`; it contains local audit evidence and a read-only diagnostic script. Earlier tasks' uncommitted changes remain separate.

No broad firewall bypass or security change is justified by the available evidence. If an actual crawler-specific failure later appears, GoDaddy's authenticated logs would be needed to identify the responsible rule before making a public-path-only correction that preserves login/private-resource protection and rate limiting.

## Reproducible evidence

- [check-public.mjs](check-public.mjs): read-only GET script, explicit neutral audit User-Agent, sequential requests with a one-second interval. No form submissions or private endpoint probes.
- [public-results.json](public-results.json): live headers/chains, robots and sitemap content, local/live indexability summaries and timestamps; cookies are omitted.
- [provider-ip-snapshots.json](provider-ip-snapshots.json): official provider range snapshots.
- [dns-a.json](dns-a.json), [dns-ns.json](dns-ns.json): DNS observations.

The audit directory is already covered by the existing `.htaccess` audit-directory deny rule. No host logs or credentials are stored here.
