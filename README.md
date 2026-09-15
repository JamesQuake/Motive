# Motive

## Daily Google rating refresh

The homepage reads `data/site-rating.json` using the existing `initializeLocalRating()`
function in `app.js`. It fetches only this local static file, with caching disabled.
It never launches the scraper or contacts Google for review data. `style.css` fills
each existing star according to the numeric rating (for example, 4.8 fills the fifth
star to 80%). The HTML includes the last verified initial values as a fallback.

`scrape-google-reviews.ps1` runs with the existing Windows PowerShell 5.1 and installed
Chrome (or Edge). This static project has no Node.js setup. The script starts a
temporary headless browser, opens the public Google Maps search for **Motive Insurance
Solutions, Matteson**, and executes `google-rating-extract.js` against the rendered
business panel. It checks the business name plus the website or Matteson address.
It reads only the aggregate star rating and total review count using accessible
labels and visible summary text. There are no Google APIs, keys, databases, packages,
or persistent backend services. The loopback connection controls only the temporary
browser, which is closed after each run.

The saved file uses numeric values and a UTC timestamp:

```json
{
  "rating": 5.0,
  "reviewCount": 145,
  "source": "Google reviews",
  "lastUpdated": "2026-09-10T15:22:07Z"
}
```

Both values must pass validation before any replacement: rating must be a finite
number from 1 through 5, and review count must be a positive safe integer. The script
writes a temporary file alongside the existing JSON and atomically replaces the JSON
only when the new file is complete. An unsuccessful scrape, verification page,
ambiguous listing, invalid data, timeout, or write failure leaves the previous JSON
untouched and exits with code 1. Successful runs exit with code 0. `lastUpdated` changes
only after a successful save. Invalid JSON or a failed homepage fetch preserves the
already displayed values and stars. Google's markup can change; inspect a failed run
manually and update the selectors if necessary. There are no automatic retries.

From this project's root, run a scrape and save the result:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scrape-google-reviews.ps1
```

Read and validate without changing the saved file:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scrape-google-reviews.ps1 -DryRun
```

If the browser is installed elsewhere, supply `-BrowserPath "C:\path\to\chrome.exe"`.

### Existing Windows Task Scheduler

The task **Motive Insurance - Daily Google Rating** is installed on this Windows
machine. It invokes the scraper in this project's folder once daily at **06:00 in
the Windows system time zone** (currently Central Time). It runs as the current
Windows user while that user is logged in, including when the screen is locked.
Windows is configured to start a missed run when available, ignore overlapping
instances, and stop the task after five minutes. The scraper also prevents overlapping
manual runs. The computer must be available with internet access for the scrape.

To install the same task on the Windows machine that serves or publishes this folder:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scrape-google-reviews.ps1 -InstallDailyTask
```

Installation does not overwrite an existing task of the same name. Check its status
and next run in Task Scheduler, or use:

```powershell
Get-ScheduledTaskInfo -TaskName 'Motive Insurance - Daily Google Rating'
```

**Deployment:** this local task updates this working folder only; it does not upload
files to `motivetoday.com`. The live website must serve this updated folder, or the
existing deployment process must publish `data/site-rating.json` after successful
scrapes. Hosting access and the publishing process were not present in this project.
Uploading the site once does not install a scheduled task on the production server.
The `.htaccess` rule prevents the maintenance scripts and temporary rating files
from being requested through Apache.
