// Read-only source audit; use the already installed parse5 via MOTIVE_PARSE5.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const {parse}=await import(pathToFileURL(process.env.MOTIVE_PARSE5).href);
const root=path.resolve(import.meta.dirname,'..'), read=f=>fs.readFileSync(path.join(root,f),'utf8');
const origin='https://motivetoday.com';
const urls=[...read('sitemap.xml').matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
const results={pages:[],broken:[],redirectLinks:[],duplicates:{},cssMissing:[]};
const aliases={'car.html':'auto.html','freight-broker.html':'specialtytransportation.html','sr22.html':'ilivs.html','mandatory-insurance-vehicle-services.html':'ilivs.html'};
for(const file of fs.readdirSync(root).filter(f=>f.endsWith('.html'))){
 const html=read(file),errors=[],doc=parse(html,{onParseError:e=>errors.push(e.code)}),nodes=[];
 function walk(n){nodes.push(n);for(const c of n.childNodes||[])walk(c);}walk(doc);
 const a=(n,k)=>n.attrs?.find(a=>a.name===k)?.value;
 const text=n=>(n.value||'')+(n.childNodes||[]).map(text).join('');
 const tags=t=>nodes.filter(n=>n.tagName===t);
 const p={file,kind:aliases[file]?'alias':file==='404.html'?'error':html.trim()?'public':'empty',title:tags('title').map(text),description:tags('meta').filter(n=>a(n,'name')==='description').map(n=>a(n,'content')),canonical:tags('link').filter(n=>a(n,'rel')==='canonical').map(n=>a(n,'href')),robots:tags('meta').filter(n=>/^(robots|googlebot|bingbot)$/.test(a(n,'name'))).map(n=>a(n,'content')),ids:nodes.map(n=>a(n,'id')).filter(Boolean),links:[],schemas:[],schemaErrors:[],parseErrors:errors,h1:tags('h1').map(text)};
 const main=tags('main')[0]||tags('body')[0];
 function content(n){return ['nav','footer','script','style','aside'].includes(n.tagName)?'':(n.value||'')+(n.childNodes||[]).map(content).join(' ');}
 p.mainText=main?content(main).replace(/\s+/g,' ').trim():'';
 p.words=p.mainText.split(/\s+/).filter(Boolean).length;
 for(const n of tags('script').filter(n=>a(n,'type')==='application/ld+json'))try{p.schemas.push(JSON.parse(text(n)));}catch(e){p.schemaErrors.push(e.message);}
 for(const n of nodes)for(const key of ['href','src','action','poster'])if(a(n,key))p.links.push({tag:n.tagName,attribute:key,value:a(n,key)});
 p.sitemap=urls.includes(origin+(file==='index.html'?'/':'/'+file));results.pages.push(p);
}
for(const p of results.pages)for(const l of p.links){
 const u=new URL(l.value,origin+'/'+p.file);if(!['motivetoday.com','www.motivetoday.com'].includes(u.hostname))continue;
 const file=decodeURIComponent(u.pathname.slice(1))||'index.html',target=results.pages.find(p=>p.file===file);
 if(!fs.existsSync(path.join(root,file)))results.broken.push({source:p.file,...l,reason:'missing file'});
 else if(u.hash&&target&&!target.ids.includes(decodeURIComponent(u.hash.slice(1))))results.broken.push({source:p.file,...l,reason:'missing anchor'});
 if(aliases[file])results.redirectLinks.push({source:p.file,...l,target:aliases[file]});
}
for(const key of ['title','description','mainText']){const groups=new Map();for(const p of results.pages.filter(p=>p.kind==='public')){const v=JSON.stringify(p[key]);groups.set(v,[...(groups.get(v)||[]),p.file]);}results.duplicates[key]=[...groups.values()].filter(g=>g.length>1);}
for(const file of fs.readdirSync(root).filter(f=>f.endsWith('.css')).concat(['fonts/fonts.css']))for(const m of read(file).matchAll(/url\(\s*["']?([^\s)'"]+)["']?\s*\)/g)){const u=new URL(m[1],origin+'/'+file);if(u.origin===origin&&!fs.existsSync(path.join(root,decodeURIComponent(u.pathname.slice(1)))))results.cssMissing.push({file,url:m[1]});}
results.orphans=results.pages.filter(p=>p.kind==='public'&&p.file!=='index.html'&&!results.pages.some(q=>q.file!==p.file&&q.links.some(l=>l.tag==='a'&&new URL(l.value,origin+'/'+q.file).pathname==='/'+p.file))).map(p=>p.file);
const shingles=s=>{const w=s.toLowerCase().split(/\s+/);return new Set(w.slice(0,-4).map((_,i)=>w.slice(i,i+5).join(' ')));};
results.nearDuplicates=[];
const publicPages=results.pages.filter(p=>p.kind==='public');
for(let i=0;i<publicPages.length;i++)for(let j=i+1;j<publicPages.length;j++){const a=shingles(publicPages[i].mainText),b=shingles(publicPages[j].mainText),common=[...a].filter(s=>b.has(s)).length,score=common/(a.size+b.size-common);if(score>0.5)results.nearDuplicates.push({pages:[publicPages[i].file,publicPages[j].file],jaccard:score});}
fs.writeFileSync(path.join(import.meta.dirname,'source-results.json'),JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify({...results,pages:results.pages.map(({file,kind,title,description,canonical,robots,words,sitemap,parseErrors,schemaErrors})=>({file,kind,title,description,canonical,robots,words,sitemap,parseErrors,schemaErrors}))},null,2));
