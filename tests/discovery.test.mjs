import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const data=JSON.parse(read('data/site-footer.json'));
const urls=[...read('sitemap.xml').matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
const agencyId='https://motivetoday.com/#agency';
test('directory contains exactly the published canonical HTML URLs',()=>{
 const links=[...read('llms.txt').matchAll(/^- \[[^\]]+\]\(([^)]+)\)/gm)].map(m=>m[1]);
 assert.equal(new Set(urls).size,urls.length);
 assert.equal(new Set(links).size,links.length);
 assert.deepEqual([...links].sort(),[...urls].sort());
 for(const url of urls)assert.ok(fs.existsSync(path.join(root,new URL(url).pathname.slice(1)||'index.html')));
});
test('each document defines shared entities once and resolves Motive references consistently',()=>{
 for(const url of urls){
  const file=new URL(url).pathname.slice(1)||'index.html',html=read(file),nodes=[];
  function walk(v){if(!v||typeof v!=='object')return;nodes.push(v);Object.values(v).forEach(walk);}
  for(const m of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g))walk(JSON.parse(m[1]));
  const definitions=nodes.filter(n=>n['@id']&&n['@type']);
  const ids=definitions.map(n=>n['@id']);assert.equal(new Set(ids).size,ids.length,file+' duplicate definitions');
  const agency=definitions.filter(n=>n['@id']===agencyId);
  if(nodes.some(n=>n['@id']===agencyId))assert.equal(agency.length,1,file+' unresolved agency');
  assert.ok(!nodes.some(n=>n['@type']==='Organization'&&/motive/i.test(n.name||'')),file+' duplicate unnamed organization');
  if(agency.length){
   assert.equal(agency[0].name,data.company,file);
   assert.equal(agency[0].telephone,data.phoneHref.slice(4),file);
   assert.deepEqual(agency[0].areaServed,data.states,file);
   assert.equal(agency[0].location.length,data.locations.length,file);
   data.locations.forEach((location,i)=>{
    assert.equal(agency[0].location[i]['@id'],'https://motivetoday.com/#location-'+location.id,file);
    assert.equal(agency[0].location[i].address.streetAddress,location.street,file);
   });
  }
 }
});
test('new contextual paths target existing pages and real section anchors',()=>{
 const expected={
  'commercial.html':['commercial-fleet-insurance.html','household-goods.html','medical-courier-insurance.html'],
  'commercial-truck.html':['how-to-start-a-box-truck-business-illinois.html#usdot-authority','box-truck-insurance-quote.html','household-goods.html','commercial-fleet-insurance.html','box-truck-loads-illinois.html'],
  'commercial-van.html':['medical-courier-insurance.html','commercial-fleet-insurance.html','general-liability.html'],
  'bmc-84-vs-bmc-85.html':['surety-bonds.html','contact-us.html#contactForm'],
  'bobtail-vs-non-trucking-liability.html':['commercial-truck.html','contact-us.html#contactForm'],
  'auto.html':['ilivs.html'],
  'how-to-start-a-box-truck-business-illinois.html':['commercial-truck.html','household-goods.html']
 };
 for(const [file,links]of Object.entries(expected))for(const link of links){
  assert.ok(read(file).includes(`href="${link}"`));
  const [target,anchor]=link.split('#');assert.ok(urls.includes('https://motivetoday.com/'+target));
  if(anchor)assert.ok(read(target).includes(`id="${anchor}"`));
 }
});
