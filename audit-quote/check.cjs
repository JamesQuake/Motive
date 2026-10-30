const fs=require('fs'), http=require('http'), path=require('path'), assert=require('assert');
const {chromium}=require('C:/Users/user14/.vscode/extensions/danielsanmedium.dscodegpt-3.24.79/standalone/node_modules/patchright');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.jpg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.png':'image/png'};
const server=http.createServer((req,res)=>{const p=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!p.startsWith(root+path.sep)){res.writeHead(403);return res.end();}fs.readFile(p,(err,b)=>{res.writeHead(err?404:200,{'Content-Type':types[path.extname(p)]||'application/octet-stream'});res.end(err?'Not found':b);});});
(async()=>{
 await new Promise(r=>server.listen(8765,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const page=await browser.newPage();const errors=[],failed=[],results=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failed.push({url:r.url(),error:r.failure()?.errorText}));
 await page.route(/google-analytics\.com|googletagmanager\.com|clarity\.ms/,r=>r.fulfill({status:200,body:''}));
 // Do not fill or submit the embedded form. Observe loading only.
 const surveyResponses=[];page.on('response',r=>{if(r.url().includes('/widget/survey/'))surveyResponses.push({url:r.url(),status:r.status()});});
 await page.goto('http://127.0.0.1:8765/box-truck-insurance-quote.html',{waitUntil:'networkidle',timeout:60000});
 await page.waitForFunction(()=>document.querySelector('[data-site-footer]').dataset.footerState==='loaded');
 for(const width of [1440,768,390,320]){
  await page.setViewportSize({width,height:1000});
  await page.evaluate(async()=>{for(const im of document.images){im.loading='eager';await im.decode().catch(()=>{});}document.querySelectorAll('.quote-reveal').forEach(e=>e.classList.add('is-visible'));});
  await page.waitForTimeout(650);
  const dimensions=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,images:[...document.querySelectorAll('main img')].map(i=>({src:i.currentSrc,loaded:i.naturalWidth>0}))}));
  assert(dimensions.scroll<=dimensions.client,`overflow at ${width}`);assert(dimensions.images.every(i=>i.loaded),'broken photos');
  await page.screenshot({path:`audit-quote/page-${width}.png`,fullPage:true});results.push({width,...dimensions});
 }
 await page.setViewportSize({width:1440,height:1000});
 assert.equal(await page.locator('h1').count(),1);assert.equal(await page.locator('main details').count(),6);
 const summary=page.locator('main summary').first();await summary.focus();await page.keyboard.press('Enter');assert(await summary.evaluate(e=>e.parentElement.open));await page.keyboard.press('Space');assert(!(await summary.evaluate(e=>e.parentElement.open)));
 const ctas=page.locator('main .survey-direct-option');
 for(let i=0;i<await ctas.count();i++){
  const a=ctas.nth(i);await a.focus();await page.keyboard.press('Enter');
  await page.waitForSelector('#quoteModal.show');await page.waitForTimeout(450);
  assert.equal(await page.locator('#quoteSurveyFrame').getAttribute('src'),'https://apiautomate.nowcerts.com/widget/survey/qjuynuDi5uLhptxzWksw');
  assert.equal(await page.locator('#quoteModalTitle').textContent(),'Trucking Insurance Quote Form');
  if(i===0){await page.waitForTimeout(2500);await page.screenshot({path:'audit-quote/modal-desktop.png'});}
  if(i===1)await page.locator('#quoteModal [aria-label="Close"]').click();else await page.keyboard.press('Escape');
  await page.waitForSelector('#quoteModal.show',{state:'hidden'});await page.waitForTimeout(400);assert(await a.evaluate(e=>document.activeElement===e),'focus not restored');
 }
 await page.setViewportSize({width:390,height:844});await ctas.first().click();await page.waitForTimeout(700);await page.screenshot({path:'audit-quote/modal-mobile.png'});await page.locator('#quoteModal [aria-label="Close"]').click();await page.waitForTimeout(400);
 await page.locator('.navbar-toggler').click();assert.equal(await page.locator('.navbar-toggler').getAttribute('aria-expanded'),'true');await page.locator('.navbar-toggler').click();
 const phone=page.locator('main a[href^="tel:"]').first();await phone.evaluate(el=>el.addEventListener('click',e=>e.preventDefault()));await phone.click();
 await page.addScriptTag({content:"document.documentElement.dataset.auditEvents=JSON.stringify(window.dataLayer.map(e=>Array.from(e)).filter(e=>e[0]==='event'));"});
 const events=await page.evaluate(()=>JSON.parse(document.documentElement.dataset.auditEvents));
 assert.equal(events.filter(e=>e[1]==='quote_cta_click').length,4);assert.equal(events.filter(e=>e[1]==='phone_click').length,1);assert(!events.some(e=>/lead|submit/.test(e[1])));
 const links=await page.locator('a[href]').evaluateAll(es=>es.map(e=>e.getAttribute('href')));
 for(const href of links){if(href.startsWith('#'))assert(await page.locator(href).count(),href);else if(!/^(https?:|tel:|mailto:)/.test(href))assert(fs.existsSync(path.join(root,href.split('#')[0].replace(/^\//,''))),href);}
 await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.quote-reveal').first().evaluate(e=>getComputedStyle(e).animationName),'none');
 const structured=await page.locator('script[type="application/ld+json"]').textContent();JSON.parse(structured);
 fs.writeFileSync('audit-quote/results.json',JSON.stringify({results,errors,failed,surveyResponses,events,checks:'FAQ keyboard, CTA keyboard, correct survey, modal close/Escape, focus return, mobile navigation, phone event, internal links, reduced motion, single H1, JSON-LD'},null,2));
 console.log(JSON.stringify({errors,failed,surveyResponses,events:events.map(e=>e[1]),checks:'passed'}));
 const fallback=await browser.newPage({javaScriptEnabled:false,viewport:{width:1440,height:1000}});
 await fallback.goto('http://127.0.0.1:8765/box-truck-insurance-quote.html');
 assert.equal(await fallback.locator('footer [data-footer-addresses]').count(),1);
 assert.equal(await fallback.locator('footer .social-icon').count(),6);
 assert((await fallback.locator('footer').innerText()).includes('Matteson'));
 await fallback.locator('footer').screenshot({path:'audit-quote/footer-without-js.png'});
 console.log('Full shared footer verified with JavaScript disabled.');
 await browser.close();server.close();
})().catch(e=>{console.error(e);server.close();process.exit(1)});
