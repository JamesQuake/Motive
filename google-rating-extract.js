// Executed only by the daily browser scraper; never included in the homepage.
function readMotiveGoogleRating() {
  if (location.href === 'about:blank' || !document.body) {
    return { pending: 'Waiting for Google Maps to finish navigating.' };
  }
  const visible = element => element.getClientRects().length > 0 &&
    getComputedStyle(element).visibility !== 'hidden';
  const normalize = text => (text || '').replace(/\s+/g, ' ').trim();
  const businessName = /^Motive Insurance Solutions(?:,? LLC)?$/i;
  const bodyText = normalize(document.body?.innerText);
  if (/\/sorry\//.test(location.pathname) ||
      /unusual traffic|verify (?:that )?you are (?:a )?human|not a robot/i.test(bodyText)) {
    return { error: 'Google returned a verification page.' };
  }
  if (!/(^|\.)google\.com$/.test(location.hostname)) {
    return { error: 'The browser did not load a public Google page.' };
  }

  // Accept an ordinary consent choice; never try to solve or bypass a challenge.
  if (location.hostname === 'consent.google.com' || /Before you continue to Google/i.test(bodyText)) {
    const reject = [...document.querySelectorAll('button')].find(button =>
      visible(button) && /^Reject all$/i.test(normalize(button.innerText)));
    if (reject) reject.click();
    return { pending: 'Waiting for the public listing after consent.' };
  }

  const headings = [...document.querySelectorAll('h1, [role="heading"][aria-level="1"]')]
    .filter(heading => visible(heading) && businessName.test(normalize(heading.innerText)));
  if (headings.length !== 1) return { pending: 'Waiting for one matching Motive business listing.' };
  const heading = headings[0];
  const panel = heading.closest('[role="main"], main');
  if (!panel) return { pending: 'Waiting for the business information panel.' };

  // Confirm identity within this business panel, never from a page-wide search snippet.
  const panelText = normalize(panel.innerText);
  const websiteMatches = [...panel.querySelectorAll('a[href]')].some(link => {
    try {
      const url = new URL(link.href);
      const destination = new URL(url.searchParams.get('q') || url.searchParams.get('url') || link.href);
      return /^(www\.)?motivetoday\.com$/.test(destination.hostname);
    } catch { return false; }
  });
  const addressMatches = /4801\s+Southwick/i.test(panelText) && /Matteson/i.test(panelText);
  if (!websiteMatches && !addressMatches) return { pending: 'Waiting to verify the Motive website or Matteson address.' };

  function summaryValues(container) {
    const ratings = new Set();
    const counts = new Set();
    const addRating = value => {
      const number = Number(value);
      if (Number.isFinite(number) && number >= 1 && number <= 5) ratings.add(number);
    };
    const addCount = value => {
      const number = Number(value.replace(/,/g, ''));
      if (Number.isSafeInteger(number) && number > 0) counts.add(number);
    };
    for (const element of container.querySelectorAll('[aria-label], button, a, span')) {
      if (!visible(element) || element.closest('[data-review-id], [role="article"]')) continue;
      const label = normalize(element.getAttribute('aria-label'));
      const text = normalize(element.innerText);
      for (const value of [label, text]) {
        // Accessible star labels and review buttons are independent of generated CSS classes.
        const rating = value.match(/^(?:Rated\s+)?([1-5](?:\.\d+)?)\s+(?:out of 5(?:\s+stars?)?|stars?)(?:\s|$)/i);
        if (rating) addRating(rating[1]);
        const count = value.match(/^(?:[1-5](?:\.\d+)?\s+(?:stars?\s+)?)?\(?([0-9]+(?:,[0-9]{3})*)\)?\s+(?:Google\s+)?reviews?$/i);
        if (count) addCount(count[1]);
        const combined = value.match(/^[1-5](?:\.\d+)?\s+stars?\s+([0-9]+(?:,[0-9]{3})*)\s+reviews?$/i);
        if (combined) addCount(combined[1]);
      }
      // Maps can show the count as a parenthesized number in a review button.
      if (element.matches('button, a, [role="button"]')) {
        const count = text.match(/^\(([0-9]+(?:,[0-9]{3})*)\)$/);
        if (count) addCount(count[1]);
      }
    }
    // Visible summary fallback: numeric score followed directly by the total count.
    const lines = container.innerText.split('\n').map(normalize).filter(Boolean);
    for (let index = 0; index < lines.length - 1; index++) {
      if (!/^[1-5]\.\d+$/.test(lines[index])) continue;
      const count = lines[index + 1].match(/^\(?([0-9]+(?:,[0-9]{3})*)\)?(?:\s+(?:Google\s+)?reviews?)?$/i);
      if (count) { addRating(lines[index]); addCount(count[1]); }
    }
    if (ratings.size > 1 || counts.size > 1) return { error: 'Ambiguous rating summary; keeping saved values.' };
    if (ratings.size === 1 && counts.size === 1) {
      return { rating: [...ratings][0], reviewCount: [...counts][0] };
    }
    return null;
  }

  // Stay in the small header containing this exact business name and its aggregate.
  // Never scan the entire panel's individual reviews or nearby businesses for numbers.
  for (let container = heading.parentElement; container && container !== panel; container = container.parentElement) {
    if (normalize(container.innerText).length > 2500 ||
        container.querySelector('[data-review-id], [role="article"], [role="feed"]')) break;
    const values = summaryValues(container);
    if (values) return values;
  }
  if (/limited view of Google Maps/i.test(bodyText)) {
    return { pending: 'Google is hiding review counts in its signed-out limited view. Run scrape-google-reviews.ps1 -SetupBrowser and sign in to Google.' };
  }
  return { pending: 'Waiting for a valid rating and total review count in the business header.' };
}
