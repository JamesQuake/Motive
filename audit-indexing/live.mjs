// GET only. Never submits forms or modifies hosting.
import fs from 'node:fs';
const root=new URL('../',import.meta.url), read=f=>fs.readFileSync(new URL(f,root),'utf8');
const canonical=[...read('sitemap.xml').matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
const paths=['/robots.txt','/sitemap.xml','/car.html','/car','/car/','/freight-broker.html','/sr22.html','/mandatory-insurance-vehicle-services.html','/solutions/changes-to-policy/','/solutions/file-a-claim/','/insights-blogs/','/commercial','/Version%201.2/auto.html','/index.html','/404.html','/test.html','/indexing-audit-missing-20261113','/solutions/indexing-audit-missing-20261113'];
const results={checkedAt:new Date().toISOString(),requests:[]};
for(const url of [...canonical,...paths.map(p=>'https://motivetoday.com'+p),'http://motivetoday.com/','https://www.motivetoday.com/']){
 try {const r=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(15000),headers:{'User-Agent':'MotiveIndexingAudit/1.0'}}),body=await r.text();const item={url,status:r.status,location:r.headers.get('location'),robots:r.headers.get('x-robots-tag'),canonical:[...body.matchAll(/<link\b[^>]*>/gi)].map(m=>m[0]).filter(s=>/rel=["']canonical["']/i.test(s)),noindex:/<meta[^>]*noindex/i.test(body),bytes:Buffer.byteLength(body)};if(/\/(robots\.txt|sitemap\.xml)$/.test(url))item.body=body;results.requests.push(item);console.log(r.status,url);}
 catch(e){results.requests.push({url,error:e.message});console.log('ERROR',url,e.message);}
}
fs.writeFileSync(new URL('live-results.json',import.meta.url),JSON.stringify(results,null,2)+'\n');
