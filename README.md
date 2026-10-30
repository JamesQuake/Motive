# Motive

## Contact details

All 31 site footers load their locations, phone number, states, company name and
social links from `data/site-footer.json` through `app.js`. Wood Dale uses suite
208. The repeated footer addresses have been removed from the HTML.

For the initial deployment, upload the 31 updated HTML pages, `app.js`, and
`data/site-footer.json` together. Upload the updated `.htaccess` as well to block
project documentation and audit folders. Do not upload the audit folder.

After this initial deployment, update footer details by uploading only
`data/site-footer.json`. Footer data is fetched without caching on each page
load. If the data cannot load or is invalid, visitors retain Contact and Privacy
links instead of seeing an old address. JavaScript is required for the full
footer. Preview through an HTTP server, not by double-clicking HTML files.

Addresses in page content (such as Contact Us) are separate from the footer and
must still be updated when a location changes.

## Daily Google rating refresh

The GitHub Actions workflow `.github/workflows/motive-daily-reviews.yml` runs
daily at 08:30 America/Chicago and supports a manual run. It uses a GitHub-hosted
Ubuntu runner and Playwright Chromium; no local computer, Google account, API
key, CAPTCHA bypass, or Google Cloud billing is required.

The job reads the public Google Maps listing, verifies the Motive Insurance
Solutions name and its website or Matteson address, and requires a valid rating
and positive review count before atomically saving `data/site-rating.json`.
An extraction or validation failure exits unsuccessfully and leaves that file
and its successful-sync timestamp unchanged. A successful run commits the JSON
to `main`, then verifies the public raw GitHub URL and its CORS response.
Pull-request runs exercise collection and validation with read-only permissions;
they do not publish or modify repository data. The homepage reads the `main`
branch.

GitHub Pages is not enabled for this repository. The website itself remains
hosted on cPanel; the workflow publishes just the JSON in the repository and
does not deploy or replace website files. For the initial website update,
wait until a successful manual run on `main` has verified public JSON
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
