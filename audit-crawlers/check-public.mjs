// Read-only public endpoint audit. Does not impersonate any crawler or change hosting.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root = fileURLToPath(new URL('../', import.meta.url));
const out = path.join(root, 'audit-crawlers');
const base = 'https://motivetoday.com';
const agent = 'MotivePublicAccessAudit/1.0';
const pause = () => new Promise(resolve => setTimeout(resolve, 1000));
const attrs = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)].map(m => [m[1].toLowerCase(), m[2]]));
function inspect(html) {
  const metas = [...html.matchAll(/<meta\b[^>]*>/gi)].map(m=>attrs(m[0]));
  const links = [...html.matchAll(/<link\b[^>]*>/gi)].map(m=>attrs(m[0]));
  const body = html.replace(/<script\b[\s\S]*?<\/script>/gi,'').replace(/<style\b[\s\S]*?<\/style>/gi,'');
  return {
    title: html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || null,
    robots: metas.filter(m=>/^(robots|googlebot|bingbot)$/i.test(m.name || '')).map(m=>({name:m.name,content:m.content})),
    canonical: links.filter(l=>(l.rel||'').toLowerCase()==='canonical').map(l=>l.href),
    refresh: metas.filter(m=>(m['http-equiv']||'').toLowerCase()==='refresh').map(m=>m.content),
    h1: [...body.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map(m=>m[1].replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim()),
    staticTextLength: body.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().length,
    challengeMarkers: /cf-chl-|challenges\.cloudflare\.com|<title>Just a moment|<title>.*captcha|verify you are human/i.test(html),
    sha256: createHash('sha256').update(html).digest('hex')
  };
}
async function get(url) {
  const chain=[];
  let text='';
  try {
    for(let hop=0;hop<6;hop++) {
      await pause();
      const response = await fetch(url,{headers:{'User-Agent':agent},redirect:'manual',signal:AbortSignal.timeout(20000)});
      const headers=Object.fromEntries(response.headers);
      // Do not persist cookies; this report only needs response/security/crawler headers.
      delete headers['set-cookie'];
      chain.push({url,status:response.status,headers});
      text=await response.text();
      if(response.status>=300&&response.status<400&&response.headers.get('location')){
        const next=new URL(response.headers.get('location'),url);
        if(!['motivetoday.com','www.motivetoday.com'].includes(next.hostname))break;
        url=next.href;continue;
      }
      break;
    }
    return {chain,text};
  } catch(error) {return {chain,text,error:String(error)};}
}
const results={startedAt:new Date().toISOString(),userAgent:agent,method:'GET; sequential; 1 second between requests; no crawler impersonation',robots:null,sitemap:null,pages:[],probes:[],local:[]};
for(const name of ['robots.txt','sitemap.xml']) {
  const response=await get(`${base}/${name}`);
  results[name==='robots.txt'?'robots':'sitemap']=response;
}
const deployedUrls=[...results.sitemap.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
const files=fs.readdirSync(root).filter(f=>f.endsWith('.html'));
for(const file of files){const html=fs.readFileSync(path.join(root,file),'utf8');results.local.push({file,...inspect(html)});}
const urls=[...new Set([...deployedUrls,...files.filter(f=>f!=='test.html').map(f=>`${base}/${f==='index.html'?'':f}`)])];
for(const url of urls){
 const response=await get(url);
 const row={url,chain:response.chain,error:response.error,...inspect(response.text)};
 results.pages.push(row);
 console.log(`${response.chain.at(-1)?.status||'ERR'} ${url}`);
}
for(const url of ['http://motivetoday.com/','https://www.motivetoday.com/','https://motivetoday.com/index.html','https://motivetoday.com/surety-bonds','https://motivetoday.com/solutions/file-a-claim/','https://motivetoday.com/crawler-audit-not-found-20261110.html','https://motivetoday.com/data/site-footer.json']){
 const response=await get(url);results.probes.push({url,chain:response.chain,error:response.error,...inspect(response.text)});
}
results.finishedAt=new Date().toISOString();
fs.writeFileSync(path.join(out,'public-results.json'),JSON.stringify(results,null,2)+'\n');
console.log('Saved audit-crawlers/public-results.json');
