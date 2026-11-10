import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/site-footer.json'), 'utf8'));
export const agencyId = 'https://motivetoday.com/#agency';
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const locations = data.locations.map(location => {
  if (!/^[a-z0-9-]+$/.test(location.id || '')) throw new Error('Each canonical location needs a stable id');
  const match = location.city.match(/^(.+), ([A-Z]{2}) (\d{5}(?:-\d{4})?)$/);
  if (!match) throw new Error('Invalid canonical location: ' + location.city);
  return { '@type': 'PostalAddress', streetAddress: location.street, addressLocality: match[1], addressRegion: match[2], postalCode: match[3], addressCountry: 'US' };
});
if (new Set(data.locations.map(location => location.id)).size !== data.locations.length) throw new Error('Duplicate location id');
export function canonicalAgency() {
  return {'@type':'InsuranceAgency', '@id':agencyId, name:data.company, legalName:data.company,
    url:'https://motivetoday.com/', logo:new URL(data.logo,'https://motivetoday.com').href,
    telephone:data.phoneHref.slice(4), address:locations[0], areaServed:data.states,
    sameAs:data.socials.map(social=>social.url),
    location:data.locations.map((location,i)=>({'@type':'Place','@id':`https://motivetoday.com/#location-${location.id}`,
      name:`${data.company} - ${locations[i].addressLocality}`,address:locations[i],telephone:data.phoneHref.slice(4)}))};
}
const values = { phone: data.phone, phoneHref: data.phoneHref };
const phoneDigits = data.phoneHref.slice(4).replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '');
values['phone-dashed'] = phoneDigits.length === 10 ? phoneDigits.replace(/^(\d{3})(\d{3})(\d{4})$/, '$1-$2-$3') : data.phone;
data.locations.forEach((location, i) => {
  values[`location-${i}`] = `${location.street} ${location.city}`;
  values[`street-${i}`] = location.street;
  values[`city-${i}`] = location.city;
});

export function syncHtml(html) {
  html = html.replace(/<a\b[^>]*data-business-phone[^>]*>/g, tag => tag.replace(/href="[^"]*"/, `href="${escape(data.phoneHref)}"`));
  html = html.replace(/<!-- business:([\w-]+) -->[\s\S]*?<!-- \/business -->/g, (_, key) => {
    if (!(key in values)) throw new Error('Unknown business binding: ' + key);
    return `<!-- business:${key} -->${escape(values[key])}<!-- /business -->`;
  });
  let hasAgency = false, referencesAgency = false;
  html = html.replace(/(<script\b[^>]*type="application\/ld\+json"[^>]*>)([\s\S]*?)(<\/script>)/g, (original, open, json, close) => {
    const schema = JSON.parse(json), before = JSON.stringify(schema);
    function visit(value, key = '') {
      if (!value || typeof value !== 'object') return value;
      if (Array.isArray(value)) return value.map(item=>visit(item,key));
      const types=[value['@type']].flat();
      const motive=/motive/i.test(value.name || '') && types.some(type=>['InsuranceAgency','Organization'].includes(type));
      if (value['@id'] === agencyId) referencesAgency = true;
      if (motive && (types.includes('Organization') || ['publisher','author','provider'].includes(key) || hasAgency)) {
        referencesAgency = true;
        return {'@id':agencyId};
      }
      if (motive && types.includes('InsuranceAgency')) {
        Object.assign(value, canonicalAgency());
        hasAgency = true;
      }
      if (types.includes('Service') && value.provider?.['@id'] === agencyId && value.areaServed?.['@type'] === 'Country' && value.areaServed.name === 'United States') value.areaServed = data.states;
      for (const [childKey, child] of Object.entries(value)) value[childKey] = visit(child,childKey);
      return value;
    }
    const updated=visit(schema);
    return JSON.stringify(updated)!==before ? open + JSON.stringify(updated).replaceAll('<', '\\u003c') + close : original;
  });
  if (referencesAgency && !hasAgency) html = html.replace('</head>', '<script data-motive-entity="1" type="application/ld+json">'+JSON.stringify({'@context':'https://schema.org',...canonicalAgency()}).replaceAll('<','\\u003c')+'</script></head>');
  return html;
}

export function syncFiles(check = false) {
  const stale = [];
  for (const file of fs.readdirSync(root).filter(file => file.endsWith('.html'))) {
    const target = path.join(root, file);
    const source = fs.readFileSync(target, 'utf8');
    if (/<\/html>\s*\S/i.test(source)) throw new Error('Unexpected markup after document end: ' + file);
    const footers = source.match(/<footer\b[\s\S]*?<\/footer>/g) || [];
    if (source.includes('data-site-footer') && (footers.length !== 1 || !footers[0].includes('data-site-footer') || /data-footer-addresses|tel:/.test(footers[0]))) {
      throw new Error('Expected one shared footer with a contact/privacy fallback: ' + file);
    }
    const result = syncHtml(source);
    if (result !== source) {
      stale.push(file);
      if (!check) fs.writeFileSync(target, result);
    }
  }
  if (check && stale.length) throw new Error('Run node scripts/sync-business-data.mjs: ' + stale.join(', '));
  return stale;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log('Business data synchronized:', syncFiles(process.argv.includes('--check')).join(', ') || 'already current');
}
