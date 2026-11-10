// Set MOTIVE_BROWSER_MODULE to an installed Playwright/patchright module if needed.
const { chromium } = require(process.env.MOTIVE_BROWSER_MODULE || 'playwright');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/site-footer.json')));
const pages = fs.readdirSync(root).filter(file => file.endsWith('.html') && /data-site-footer/.test(fs.readFileSync(path.join(root, file), 'utf8')) && (!process.env.MOTIVE_TEST_PAGES || process.env.MOTIVE_TEST_PAGES.split(',').includes(file)));
const server = http.createServer((req, res) => {
  const file = path.join(root, req.url.split('?')[0]);
  fs.readFile(file, (error, body) => {
    res.writeHead(error ? 404 : 200, { 'Content-Type': ({'.js':'application/javascript','.json':'application/json','.css':'text/css','.png':'image/png'})[path.extname(file)] || 'text/html' });
    res.end(error ? '' : body);
  });
});
(async () => {
  let browser;
  try {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    browser = await chromium.launch({ headless: true, ...(process.env.MOTIVE_CHROME ? {executablePath: process.env.MOTIVE_CHROME} : {}) });
    const page = await browser.newPage();
    await page.route('**/*', route => route.request().url().startsWith(base) ? route.continue() : route.abort());
    for (const file of pages) {
      await page.goto(`${base}/${file}`);
      await page.waitForSelector('[data-footer-state="loaded"]');
      assert.equal(await page.locator('footer').count(), 1, file);
      const footer = page.locator('footer');
      const content = await footer.innerText();
      for (const location of data.locations) assert.ok(content.includes(location.street) && content.includes(location.city), file);
      for (const state of data.states) assert.ok(content.includes(state), file);
      assert.equal(await footer.locator('a[href="'+data.phoneHref+'"]').count(), 2, file);
      assert.equal(await footer.locator('[data-footer-socials] a').count(), data.socials.length, file);
    }
    for (const width of [390, 1440]) {
      await page.setViewportSize({width, height:900});
      for (const file of ['index.html', 'box-truck-insurance-quote.html', 'commercial-fleet-insurance.html', 'tow-truck-insurance-illinois.html']) {
        await page.goto(`${base}/${file}`);
        await page.waitForSelector('[data-footer-state="loaded"]');
        assert.ok(await page.locator('footer').evaluate(element => element.scrollWidth <= window.innerWidth + 1), `${file}: footer overflow at ${width}`);
      }
    }
    for (const failure of ['http', 'invalid', 'network']) {
      await page.route('**/data/site-footer.json', route => failure === 'network' ? route.abort() : route.fulfill({status: failure === 'http' ? 503 : 200, contentType:'application/json', body:'{}'}));
      for (const file of pages) {
        await page.goto(`${base}/${file}`);
        await page.waitForSelector('[data-footer-state="unavailable"]');
        assert.equal(await page.locator('footer').count(), 1, file);
        assert.equal(await page.locator('footer a[href="/contact-us.html"]').count(), 1, file);
        assert.equal(await page.locator('footer a[href="/privacy.html"]').count(), 1, file);
      }
      await page.unroute('**/data/site-footer.json');
    }
    const nojs = await browser.newContext({javaScriptEnabled:false});
    const staticPage = await nojs.newPage();
    await staticPage.route('**/*', route => route.request().url().startsWith(base) ? route.continue() : route.abort());
    for (const file of pages) {
      await staticPage.goto(`${base}/${file}`);
      assert.equal(await staticPage.locator('footer').count(), 1, file);
      assert.equal(await staticPage.locator('footer a').count(), 2, file);
    }
    console.log(`PASS: ${pages.length} pages; loaded, HTTP failure, invalid JSON data, network failure, JavaScript disabled. Four representative footers fit 390px and 1440px viewports (external assets blocked).`);
  } finally {
    if (browser) await browser.close();
    server.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
