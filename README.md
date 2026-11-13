# Motive

## Contact details

Footers load their business details from `data/site-footer.json` through
`app.js`. This same JSON generates marked contact details and agency/location
JSON-LD at build time. Wood Dale uses suite 208. Location `id` values are stable
identifiers: keep them when an office address changes. Do not edit generated
business details independently in HTML.

After changing the JSON or published content, run:

```sh
node scripts/sync-business-data.mjs
node scripts/sync-discovery.mjs
node scripts/sync-testimonials.mjs
node scripts/sync-business-data.mjs --check
node scripts/sync-discovery.mjs --check
node scripts/sync-testimonials.mjs --check
node --test tests/business-data.test.mjs tests/discovery.test.mjs
```

The existing `sitemap.xml` is the explicit published-page manifest. Add only
confirmed public, indexable, self-canonical HTML URLs; never redirects or drafts.
Maintain `lastmod` using known substantive edit dates, not upload times. The
discovery script validates coverage and generates `llms.txt` from this manifest
and current page titles. Use `--verify-live` to check every listed URL over HTTP.
Generated schema supplements existing nodes rather than creating duplicate
articles, services or FAQs. FAQ answers in `<details>` are synchronized from
visible text. Run checks before manually uploading changes to GoDaddy cPanel.

Upload changed public HTML, the canonical JSON, `sitemap.xml` and `llms.txt`
together when ready. Do not upload audit directories, tests or maintenance
scripts. CI validates generated data but does not deploy the website.

If footer JSON cannot load, Contact and Privacy links remain usable. JavaScript
is required for the full footer, but contact and SEO output is static. Preview
through an HTTP server, not by double-clicking HTML files.

## Testimonials

`data/testimonials.json` contains the owner's supplied Google Business Profile
review snapshot, not a live Google API feed. Preserve names, original comments,
ratings, relative date labels and the capture date. Do not complete truncated
reviews or invent photos, profile links, or exact publication dates. Current
cards use the original avatars and contributor profile links from the owner's
Google Doc, cross-checked with the supplied PDF. Local avatar files live in
`images/reviewers/`; initials are the fallback if an image fails to load.

Run `node scripts/sync-testimonials.mjs` after changing those records. It builds
12 crawlable HTML cards and uses the existing business-data generator for the
Matteson address. Never hand-edit generated review cards or address values.
The carousel only enhances this static content; no API key or browser-side
review request is required. Do not add self-serving Review/AggregateRating
schema. A future live provider requires a separate authorized connection and
review of its attribution and storage terms; the aggregate rating updater below
does not refresh individual testimonials.

Upload `testimonials.html`, `testimonials.css`, `testimonials.js`, and
`images/reviewers/` together
when deployment is authorized. The review source JSON and generator can stay
in the repository; the page does not fetch them in visitors' browsers.

## Daily Google rating refresh

The GitHub Actions workflow `.github/workflows/motive-daily-reviews.yml` runs
daily at 07:05 America/Chicago and supports a manual run. It uses a GitHub-hosted
Ubuntu 24.04 runner and Playwright Chromium; no local computer, Google account,
API key, CAPTCHA bypass, or Google Cloud billing is required.

The job reads the public Google Maps listing, verifies the Motive Insurance
Solutions name and its website or Matteson address, and requires a valid rating
and positive review count before atomically saving `data/site-rating.json`.
An extraction or validation failure exits unsuccessfully and leaves that file
and its successful-sync timestamp unchanged. A successful scheduled or manual
run commits the JSON to the branch it ran on, then verifies its public raw
GitHub URL and CORS response. Pull-request runs exercise collection and
validation with read-only permissions; they do not publish or modify repository
data. The homepage reads the `main` branch.

GitHub Pages is not enabled for this repository. The website itself remains
hosted on cPanel; the workflow publishes just the JSON in the repository and
does not deploy or replace website files. A manual run on a review branch tests
publication without changing the live `main` JSON. For the initial website
update, wait until a successful manual run on `main` has verified public JSON
publication, then:

1. In cPanel File Manager, open the website document root (normally
   `public_html`) and enable **Show Hidden Files**.
2. Back up the existing `.htaccess`.
3. Upload and replace only the modified `index.html` and `.htaccess`. The latter
   preserves the existing redirects and headers while allowing the raw GitHub
   JSON origin in `connect-src`.

The homepage then reads the public JSON directly from GitHub. Do not upload
`data/site-rating.json`, the workflow, or the scraper. Later successful workflow
runs need no cPanel upload.

The existing Windows scraper and scheduled-task instructions below are an
optional local/manual fallback. They are not required for daily updates.

### Future Google Places API migration

When billing is approved, create a Google Cloud project, enable Places API
(Place Details), and use a verified Motive place ID. Request only the needed
business identity, `rating`, `userRatingCount`, website, and address fields.
Keep the API key in a restricted GitHub Actions secret and call the API from
the runner, never from homepage JavaScript. Before migration, confirm current
Google Places attribution, caching, and storage requirements; then retain the
same identity checks and validated JSON schema while replacing browser
extraction with the API response. No Google Cloud project or billing is needed
for the current workflow.

### Optional Windows browser operation

Google returned a limited Maps view without review counts in headless mode.
The updater now starts ordinary Chrome hidden, reads the public listing, then
closes Chrome. It uses a dedicated persistent browser profile, outside this website
at `%LOCALAPPDATA%\MotiveRating\Browser`. It does not access or copy credentials
from your usual Chrome profile. No API key, service, or website rebuild is used.

On October 26, 2026, the repaired scraper independently read 5.0 from 155
Google reviews and saved verified JSON. Browser startup now waits for a
readable debugging-port file and a ready tab instead of racing Chrome's file
write. The extractor also waits through the initial blank navigation page.

If a future run requires sign-in, run this locally and sign in in the browser,
then return to the
Motive Insurance Solutions Maps listing in the same tab:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scrape-google-reviews.ps1 -SetupBrowser
```

Setup waits up to ten minutes for a valid business rating and review count. It
saves only a verified result and closes the browser. After using setup,
verify a separate unattended run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scrape-google-reviews.ps1
```

Daily runs use the same dedicated profile in a hidden ordinary browser. If Google expires
the session or presents a verification page, run setup again and handle Google's
normal sign-in yourself. The updater does not bypass verification challenges.

### Optional local checks

The scraper verifies the business name and website or Matteson address, then
reads the aggregate rating and total count from that business's header. Both
must pass validation. Successful runs atomically replace `data/site-rating.json`
and set `verified: true` with a fresh UTC `lastUpdated`. Failed runs exit 1 and
leave the previous data untouched; they never advance its timestamp.

Read without saving:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scrape-google-reviews.ps1 -DryRun
```

Check the task:

```powershell
Get-ScheduledTaskInfo -TaskName 'Motive Insurance - Daily Google Rating'
Get-Content .\data\site-rating.json
```

The cloud workflow publishes validated data automatically. If you run the
Windows scraper manually, it only updates the local repository file; it does
not publish to GitHub or the cPanel website. Never upload the dedicated browser
profile. The maintenance scripts are blocked by `.htaccess`.

To set a Google Drive destination, use its actual synced local path:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scrape-google-reviews.ps1 -OutputJson "<synced-folder>\site-rating.json"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scrape-google-reviews.ps1 -InstallDailyTask -OutputJson "<synced-folder>\site-rating.json"
```

Verify the first command succeeds before installing the task. The installation
command updates the existing named task; it does not create a second schedule.
Google Drive for desktop must be signed in and syncing that folder. The task
retries failed runs three times at 15-minute intervals. `-BrowserPath` can select
Chrome or Edge if installed elsewhere.
