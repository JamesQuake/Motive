import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { syncFiles } from '../scripts/sync-business-data.mjs';

test('checked-in generated business fields and footer shells are current', () => {
  assert.deepEqual(syncFiles(true), []);
});

test('canonical changes propagate into contact markup and nested SEO without losing other schema', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'motive-business-'));
  try {
    fs.mkdirSync(path.join(root, 'scripts'));
    fs.mkdirSync(path.join(root, 'data'));
    fs.copyFileSync(new URL('../scripts/sync-business-data.mjs', import.meta.url), path.join(root, 'scripts/sync-business-data.mjs'));
    const data = JSON.parse(fs.readFileSync(new URL('../data/site-footer.json', import.meta.url)));
    data.locations[0] = {...data.locations[0], street:'123 Test Street', city:'Example, IL 60001'};
    data.phone = '555 010 1234';
    data.phoneHref = 'tel:5550101234';
    data.states = ['Example State'];
    fs.writeFileSync(path.join(root, 'data/site-footer.json'), JSON.stringify(data));
    const {syncHtml} = await import(pathToFileURL(path.join(root, 'scripts/sync-business-data.mjs')));
    const schema = {'@type':'WebPage', publisher:{'@type':'InsuranceAgency', name:'Motive Insurance', address:{}}, breadcrumb:{'@id':'keep-me'}};
    const result = syncHtml('<head><script type="application/ld+json">'+JSON.stringify(schema)+'</script></head><body><!-- business:location-0 -->old<!-- /business --></body>');
    assert.ok(result.includes('123 Test Street Example, IL 60001'));
    const updated = JSON.parse(result.match(/<script[^>]*>(.*?)<\/script>/)[1]);
    assert.equal(updated.publisher['@id'], 'https://motivetoday.com/#agency');
    const agency=JSON.parse([...result.matchAll(/<script[^>]*>(.*?)<\/script>/g)][1][1]);
    assert.equal(agency.address.streetAddress,data.locations[0].street);
    assert.equal(agency.telephone,'5550101234');
    assert.deepEqual(agency.areaServed,data.states);
    assert.equal(agency.location[0]['@id'],'https://motivetoday.com/#location-matteson');
    assert.equal(agency.location[1].address.streetAddress,data.locations[1].street);
    assert.deepEqual(updated.breadcrumb, schema.breadcrumb);
    assert.equal(syncHtml(result), result);
  } finally {
    fs.rmSync(root, {recursive:true, force:true});
  }
});
