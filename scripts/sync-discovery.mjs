// sitemap.xml is the explicit publication manifest for this manually uploaded site.
// Keep drafts out of it. This script validates that manifest, augments existing schema,
// and generates llms.txt from published HTML and the existing business configuration.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {agencyId, syncHtml} from './sync-business-data.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const base='https://motivetoday.com/';
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const data=JSON.parse(read('data/site-footer.json'));
const check=process.argv.includes('--check');
const scriptPattern=/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
const generatedPattern=/<script data-motive-discovery="1" type="application\/ld\+json">[\s\S]*?<\/script>\s*/g;
const attr=(tag,key)=>tag.match(new RegExp(`\\b${key}=["']([^"']*)["']`,'i'))?.[1];
const decode=s=>s.replace(/&#(?:x([\da-f]+)|(\d+));/gi,(_,hex,num)=>String.fromCodePoint(parseInt(hex||num,hex?16:10))).replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&lt;','<').replaceAll('&gt;','>');
const title=html=>decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'').replace(/\s*\|\s*Motive(?: Insurance)?$/i,'').trim();
const canonical=html=>[...html.matchAll(/<link\b[^>]*>/gi)].map(m=>m[0]).filter(tag=>attr(tag,'rel')==='canonical').map(tag=>attr(tag,'href'));
const noindex=html=>[...html.matchAll(/<meta\b[^>]*>/gi)].some(m=>/^(robots|googlebot|bingbot)$/i.test(attr(m[0],'name')||'')&&/\bnoindex\b/i.test(attr(m[0],'content')||''));
function nodes(html){const found=[];function walk(v){if(!v||typeof v!=='object')return;if(v['@type'])found.push(v);Object.values(v).forEach(walk);}for(const m of html.matchAll(scriptPattern))walk(JSON.parse(m[1]));return found;}
const entries=[...read('sitemap.xml').matchAll(/<url>([\s\S]*?)<\/url>/g)].map(m=>({xml:m[0],url:m[1].match(/<loc>(.*?)<\/loc>/)?.[1]}));
if(!entries.length||new Set(entries.map(e=>e.url)).size!==entries.length)throw Error('Empty sitemap or duplicate URLs');
const pages=entries.map(entry=>{
 const url=new URL(entry.url);if(url.origin!==new URL(base).origin||url.search||url.hash)throw Error('Noncanonical sitemap URL: '+url);
 const file=url.pathname==='/'?'index.html':url.pathname.slice(1);if(!/^[\w-]+\.html$/.test(file))throw Error('Not a root HTML page: '+url);
 const html=read(file);if(noindex(html)||/http-equiv=["']refresh/i.test(html)||canonical(html).length!==1||canonical(html)[0]!==entry.url)throw Error('Ineligible sitemap page: '+file);
 const lastmod=entry.xml.match(/<lastmod>(.*?)<\/lastmod>/)?.[1];if(lastmod&&(!/^\d{4}-\d{2}-\d{2}$/.test(lastmod)||!Number.isFinite(Date.parse(lastmod))||new Date(lastmod).toISOString().slice(0,10)!==lastmod||Date.parse(lastmod)>Date.now()))throw Error('Invalid lastmod: '+file);
 return {...entry,file,html,title:title(html),lastmod};
});
const eligible=fs.readdirSync(root).filter(f=>f.endsWith('.html')&&f!=='404.html').filter(f=>{const h=read(f);return h.trim()&&!noindex(h)&&!/http-equiv=["']refresh/i.test(h)&&canonical(h)[0]===new URL(f==='index.html'?'':f,base).href;});
const omitted=eligible.filter(file=>!pages.some(p=>p.file===file));
if(omitted.length)throw Error('Canonical pages missing from publication manifest; verify live/public status before adding: '+omitted.join(', '));
// Existing topic hierarchy; no new landing pages or speculative URLs.
const articles=['amazon-relay-requirements.html','bmc-84-vs-bmc-85.html','bobtail-vs-non-trucking-liability.html'];
const services=['commercial-truck.html','commercial-van.html','commercial-fleet-insurance.html','household-goods.html','general-liability.html','surety-bonds.html','medical-courier-insurance.html','ilivs.html'];
const hubs=['commercial.html','personal.html','specialtytransportation.html'];
const focus=new Set([...articles,...services,...hubs,'about-us.html','contact-us.html','box-truck-operating-costs-matteson.html']);
const changed=[];
function write(file,content){if(readOrEmpty(file)!==content){changed.push(file);if(!check)fs.writeFileSync(path.join(root,file),content);}}
function readOrEmpty(file){return fs.existsSync(path.join(root,file))?read(file):'';}
for(const page of pages){
 let html=page.html.replace(generatedPattern,'');
 const text=value=>decode(value.replace(/<[^>]*>/g,' ')).replace(/\s+/g,' ').trim();
 const detailAnswers=new Map([...html.matchAll(/<details\b[^>]*>\s*<summary\b[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g)].map(m=>[text(m[1]),text(m[2])]));
 // Give existing content nodes stable IDs without adding duplicate articles/FAQs.
 html=html.replace(scriptPattern,(original,json)=>{
  const value=JSON.parse(json),before=JSON.stringify(value);
  function visit(v){if(!v||typeof v!=='object')return;
   if(v['@type']==='FAQPage')for(const q of v.mainEntity||[])if(detailAnswers.has(q.name))q.acceptedAnswer.text=detailAnswers.get(q.name);
   if(['Article','BlogPosting'].includes(v['@type'])){const published=pages.find(p=>p.url===(v.url||page.url));if(published?.lastmod)v.dateModified=published.lastmod;}
   if(!v['@id']&&['Article','BlogPosting','FAQPage','BreadcrumbList','CollectionPage'].includes(v['@type'])){
    const suffix={Article:'article',BlogPosting:'article',FAQPage:'faq',BreadcrumbList:'breadcrumb',CollectionPage:'webpage'}[v['@type']];v['@id']=(v.url||page.url)+'#'+suffix;
   }
   Object.values(v).forEach(visit);
  }visit(value);return before===JSON.stringify(value)?original:original.replace(json,JSON.stringify(value).replaceAll('<','\\u003c'));
 });
 const existing=nodes(html),has=type=>existing.some(n=>[n['@type']].flat().includes(type));
 const extra=[];
 if(focus.has(page.file)){
  if(articles.includes(page.file)&&!has('Article')&&!has('BlogPosting'))extra.push({'@type':'Article','@id':page.url+'#article',headline:page.title,url:page.url,mainEntityOfPage:page.url,...(page.lastmod?{dateModified:page.lastmod}:{}),author:{'@id':agencyId},publisher:{'@id':agencyId}});
  else if(!has('WebPage')&&!has('CollectionPage')&&!has('Article')&&!has('BlogPosting'))extra.push({'@type':hubs.includes(page.file)?'CollectionPage':'WebPage','@id':page.url+'#webpage',name:page.title,url:page.url,about:{'@id':agencyId}});
  if(services.includes(page.file)&&!has('Service'))extra.push({'@type':'Service','@id':page.url+'#service',name:page.title,url:page.url,provider:{'@id':agencyId},areaServed:page.file==='ilivs.html'?['Illinois']:data.states});
  if(!has('BreadcrumbList')){
   const items=[{name:'Home',item:base}];
   const parent=page.file==='ilivs.html'?'personal.html':(['about-us.html','contact-us.html',...hubs].includes(page.file)?null:'commercial.html');
   if(parent)items.push({name:pages.find(p=>p.file===parent).title,item:new URL(parent,base).href});
   items.push({name:page.title,item:page.url});
   extra.push({'@type':'BreadcrumbList','@id':page.url+'#breadcrumb',itemListElement:items.map((item,i)=>({'@type':'ListItem',position:i+1,...item}))});
  }
 }
 if(extra.length){const marker=html.includes('<script data-motive-entity="1"')?'<script data-motive-entity="1"':'</head>';html=html.replace(marker,'<script data-motive-discovery="1" type="application/ld+json">'+JSON.stringify({'@context':'https://schema.org','@graph':extra}).replaceAll('<','\\u003c')+'</script>'+marker);}
 html=syncHtml(html);write(page.file,html);page.html=html;
}
const groups=[['Start here',pages.filter(p=>['index.html',...hubs,'contact-us.html'].includes(p.file))],['Guides and articles',pages.filter(p=>nodes(p.html).some(n=>['Article','BlogPosting'].includes(n['@type']))&&!hubs.includes(p.file))]];
const listed=new Set(groups.flatMap(([,ps])=>ps.map(p=>p.file)));
groups.push(['Coverage and company information',pages.filter(p=>!listed.has(p.file))]);
let directory=`# ${data.company}\n\n> Canonical public insurance information, topic hubs, and service contacts.\n\nThis directory links to existing HTML pages. Coverage depends on policy terms and individual circumstances. Use the linked pages for context; this file does not replace sitemap.xml, robots.txt, or structured data.\n`;
for(const [heading,items]of groups){directory+='\n## '+heading+'\n\n';for(const p of items)directory+=`- [${p.title.replaceAll('[','(').replaceAll(']',')')}](${p.url})\n`;}
write('llms.txt',directory);
if(check&&changed.length)throw Error('Run node scripts/sync-discovery.mjs: '+changed.join(', '));
console.log(`${pages.length} published canonical pages; ${changed.length} ${check?'stale':'updated'} files.`,changed.join(', '));
if(process.argv.includes('--verify-live')){
 for(const page of pages){await new Promise(r=>setTimeout(r,500));const response=await fetch(page.url,{headers:{'User-Agent':'MotiveDiscoveryAudit/1.0'},redirect:'manual',signal:AbortSignal.timeout(20000)});const html=await response.text();if(response.status!==200||noindex(html)||canonical(html)[0]!==page.url||/noindex/i.test(response.headers.get('x-robots-tag')||''))throw Error('Live indexability failed: '+page.url);}
 console.log('All published canonical URLs verified live: 200, expected canonical, no noindex.');
}
