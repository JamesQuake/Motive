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

The homepage fetches `data/site-rating.json` with caching disabled. No review count
is embedded in the page. It shows only five stars while fetching and
when the request fails or data is invalid or unverified. Valid, verified data
adds the rating and review count regardless of its timestamp. `lastUpdated`
records the scrape date; it does not control whether the rating is displayed.
A manually entered
count is not treated as a verified scrape.

The existing Windows task, **Motive Insurance - Daily Google Rating**, runs
`scrape-google-reviews.ps1` daily at 08:00 in the Windows system time zone
(Central). By default this updates the local website JSON. With `-OutputJson`,
it also saves JSON to the specified existing folder for Google Drive to sync.
It does not publish to the website.
The computer must be on, connected to the internet, and the task's Windows user
must be logged in. Missed runs start when available; failed runs retry up to
three times at 15-minute intervals.

### Browser operation

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

### Checks and daily upload

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

Upload `data/site-rating.json` after a successful run, or have Make copy the
synced JSON to the website. No CSV conversion is needed. Deploy the updated
`index.html` and `app.js` for the stars-only fallback without a timestamp cutoff.
Never upload the dedicated browser profile. The maintenance scripts are blocked
by `.htaccess`. No upload automation or API integration is installed.

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
