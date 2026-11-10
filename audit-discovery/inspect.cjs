const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.MOTIVE_BROWSER_MODULE||'playwright');
const root=process.env.MOTIVE_AUDIT_ROOT||path.resolve(__dirname,'..');
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.MOTIVE_CHROME?{executablePath:process.env.MOTIVE_CHROME}:{})});try{
 const page=await browser.newPage();const result=[];
 for(const file of fs.readdirSync(root).filter(f=>f.endsWith('.html'))){
 const html=fs.readFileSync(path.join(root,file),'utf8');
 result.push(await page.evaluate(({file,html})=>{
 const doc=new DOMParser().parseFromString(html,'text/html');
 const clean=s=>{const d=new DOMParser().parseFromString(s||'','text/html');return d.body.textContent.replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/[–—]/g,'-').replace(/\s+/g,' ').trim().toLowerCase();};
 const schemas=[...doc.querySelectorAll('script[type="application/ld+json"]')].map(s=>JSON.parse(s.textContent));
 const main=doc.querySelector('main')||doc.body.cloneNode(true);main.querySelectorAll('script,style,nav,footer').forEach(e=>e.remove());
 const text=clean(main.textContent).replace(/\s/g,'');const nodes=[],faqs=[];
 function visit(v){if(!v||typeof v!=='object')return;if(v['@type'])nodes.push({type:v['@type'],id:v['@id'],name:v.name});if(v['@type']==='FAQPage')for(const q of v.mainEntity||[])faqs.push({question:q.name,questionVisible:text.includes(clean(q.name).replace(/\s/g,'')),answerVisible:text.includes(clean(q.acceptedAnswer?.text).replace(/\s/g,''))});Object.values(v).forEach(visit);}schemas.forEach(visit);
 const links=[...main.querySelectorAll('a[href]')].filter(a=>!a.closest('aside,.insights-strip,.breadcrumb,.detail-breadcrumb')).map(a=>({href:a.getAttribute('href'),text:a.textContent.trim()}));
 return {file,title:doc.title,canonical:doc.querySelector('link[rel="canonical"]')?.getAttribute('href'),nodes,faqs,links};
 },{file,html}));}
 const output=process.env.MOTIVE_AUDIT_OUTPUT||path.join(__dirname,'after.json');fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');
 console.log('Pages:',result.length,'FAQ questions:',result.flatMap(p=>p.faqs).length);for(const p of result)for(const q of p.faqs)if(!q.questionVisible||!q.answerVisible)console.log('FAQ REVIEW',p.file,JSON.stringify(q));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
