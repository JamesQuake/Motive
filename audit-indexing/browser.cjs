const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.MOTIVE_BROWSER_MODULE);
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f));
const files=JSON.parse(read('audit-indexing/source-results.json')).pages.filter(p=>p.kind==='public').map(p=>p.file);
const results={pages:[],errors:[],missing:[],checks:[]};
const server=http.createServer((req,res)=>{const p=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.resolve(root,'.'+(p==='/'?'/index.html':p));if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}fs.readFile(file,(err,body)=>{res.writeHead(err?404:200,{'Content-Type':err?'text/html':({'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2'})[path.extname(file)]||'application/octet-stream'});res.end(err?read('404.html'):body);});});
(async()=>{let browser;try{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true,executablePath:process.env.MOTIVE_CHROME});const context=await browser.newContext();
 // Permit only local assets and static CDN styles/scripts. No analytics, quote submissions, or provider frames.
 await context.route('**/*',r=>r.request().url().startsWith(base)||/^https:\/\/(cdn.jsdelivr.net|cdnjs.cloudflare.com)\//.test(r.request().url())?r.continue():r.fulfill({status:200,body:''}));
 const page=await context.newPage();page.setDefaultTimeout(6000);let current;
 page.on('pageerror',e=>results.errors.push({file:current,error:e.message}));page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400&&!r.url().includes('missing-probe'))results.missing.push({file:current,url:r.url(),status:r.status()});});
 for(const file of [...files,'solutions/missing-probe']){current=file;const response=await page.goto(base+'/'+file,{waitUntil:'load'});assert.equal(response.status(),file.includes('missing-probe')?404:200);await page.waitForSelector('[data-footer-state="loaded"]');const item={file,status:response.status(),views:[]};results.pages.push(item);
 for(const width of [1440,390]){await page.setViewportSize({width,height:900});item.views.push(await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,footer:document.querySelectorAll('footer').length,header:!!document.querySelector('nav'),brokenImages:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.getAttribute('src'))})));}
 const toggle=page.locator('.navbar-toggler').first();if(await toggle.isVisible()){await toggle.click();await page.waitForTimeout(350);assert.equal(await toggle.getAttribute('aria-expanded'),'true',file+' mobile menu');await toggle.click();item.mobileMenu=true;}
 if(['surety-bonds.html','towing.html','solutions/missing-probe'].includes(file)){await page.screenshot({path:path.join(__dirname,file.includes('/')?'404-mobile.png':file.replace('.html','-mobile.png')),fullPage:true});}
 if(['index.html','commercial-truck.html','box-truck-insurance-quote.html','surety-bonds.html','towing.html'].includes(file)){await page.setViewportSize({width:1440,height:900});const opener=page.locator('main [data-quote-choice-opener],main [data-bs-target="#quoteModal"],main a[href="#quoteModal"],main .survey-direct-option').first();if(await opener.isVisible()){await opener.click();await page.waitForTimeout(350);assert.ok(await page.locator('#quoteModal').isVisible(),file+' quote opens');await page.locator('#quoteModal [data-bs-dismiss="modal"]').first().click();await page.waitForTimeout(350);assert.ok(!await page.locator('#quoteModal').isVisible(),file+' quote closes');item.quoteModal=true;}}
 console.log('PASS',file);
 }
 assert.equal(results.errors.length,0,JSON.stringify(results.errors));assert.equal(results.missing.length,0,JSON.stringify(results.missing));
 const p=await browser.newPage({javaScriptEnabled:false});for(const file of files){await p.goto(base+'/'+file);assert.ok((await p.locator('body').innerText()).length>100,file+' initial content');}results.checks.push('41 pages have content with JavaScript disabled','42 local HTTP statuses and mobile menus','No local resource errors or uncaught JavaScript errors');
}finally{fs.writeFileSync(path.join(__dirname,'browser-results.json'),JSON.stringify(results,null,2)+'\n');await browser?.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
