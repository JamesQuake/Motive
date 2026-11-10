import fs from 'node:fs';
import assert from 'node:assert/strict';
import {parse} from 'file:///C:/Users/user14/AppData/Local/Temp/motive-regression-validator/node_modules/parse5/dist/index.js';
const root=new URL('../',import.meta.url),read=f=>fs.readFileSync(new URL(f,root),'utf8');
const before=read('audit-about/before.html'),after=read('about-us.html');
const metadata=/<title\b[^>]*>[\s\S]*?<\/title>|<meta\b[^>]*>|<link[^>]*rel="canonical"[^>]*>/g;
assert.deepEqual(after.match(metadata),before.match(metadata));
const errors=[];parse(after,{onParseError:e=>errors.push(e)});assert.equal(errors.length,0);
const beforeViews=JSON.parse(read('audit-about/before.json')).views,afterViews=JSON.parse(read('audit-about/after.json')).views;
for(let i=0;i<afterViews.length;i++)assert.deepEqual(afterViews[i].hero,beforeViews[i].hero);
const photos=JSON.parse(read('audit-about/image-sizes.json'));
const files=['about-us.html','about-us.css',...photos.flatMap(p=>p.variants.map(v=>'images/about/'+({'household-goods-moving.jpg':'moving','box-truck-quote-closing.jpg':'business','pexels-divinetechygirl-1181690.jpg':'professional','box-truck-quote-preparation.jpg':'transportation','personal_bundle.jpg':'home'}[p.source])+'-'+v.width+'.webp'))];
const report=`# About Us redesign — November 10, 2026

Implemented locally; not deployed. Only the content below the existing hero and above the shared footer was redesigned, with one new page-specific stylesheet link.

## Design and reference

Inspected [Assurance's About page](https://assurancetoday.com/about-us.html) in Chrome at 1440, 768 and 390px, including its complete desktop/mobile page. The reference uses alternating light/dark sections, paired editorial content, a four-step progression, trust cards and a closing CTA. Motive retains its own blue/orange tokens, Inter/Montserrat typography, container widths and existing button styling. The new content uses alternating photography, a restrained numbered process without decorative cards, practical independent-agency guidance, people-focused imagery and a home/auto closing section.

Five existing local photographs are reused, with nine responsive WebP derivatives and the original JPEGs retained as fallbacks. No third-party photography was downloaded, no person was identified as Motive staff, and no carrier affiliations, testimonials, statistics, awards or credentials were invented. Trust is described through concrete coverage conversations instead of unverified badges.

## Validation

| Check | Result |
|---|---|
| Desktop / tablet / mobile | PASS at 1440 / 768 / 390px; no horizontal scrolling or broken images |
| Hero preservation | PASS: byte-identical markup; identical measured bounds at all three widths (heights 480 / 360 / 400px) |
| Header, navigation, footer | PASS: byte-identical markup; one rendered JSON footer |
| Scripts / quote integration | PASS: scripts and modal markup byte-identical; existing commercial quote opens the correct survey and closes |
| Production form delivery | NOT RETESTED: vendor iframe stubbed; no lead submissions or placeholder forms added |
| JavaScript and resources | PASS: no uncaught exceptions or HTTP resource errors in local checks; analytics and vendor embeds suppressed |
| New contextual links | PASS: destinations and contactForm fragment exist locally |
| Raw HTML / no JavaScript | PASS: all five new sections present and visible without JavaScript |
| HTML parsing | PASS: local parse5 HTML5 parser reports no errors; not a full conformance certification |
| SEO / JSON-LD | PASS: title, metadata, canonical and existing scripts unchanged; discovery generator reports zero stale files |
| Reduced motion | No animation introduced; existing global behavior untouched |
| Photography | PASS: all chosen images decoded successfully, descriptive alt text and intrinsic dimensions supplied |
| Performance | Lazy loading, responsive WebP sources and reserved image aspect ratios implemented. No field Core Web Vitals claim |

The five 640px WebP images total 146,728 bytes versus 810,127 bytes for their original JPEGs (about 82% smaller). Larger sources are available for higher-density displays; no source image was upscaled. Global style.css, app.js, business JSON, header, hero, footer and forms were not edited.

## Screenshots

| Width | Before | After | Reference |
|---|---|---|---|
| Desktop 1440 | [Before](before-1440.png) | [After](after-1440.png) | [Reference](reference-1440.png) |
| Tablet 768 | [Before](before-768.png) | [After](after-768.png) | [Reference](reference-768.png) |
| Mobile 390 | [Before](before-390.png) | [After](after-390.png) | [Reference](reference-390.png) |

## Changed production files

${files.map(f=>'- '+f).join('\n')}

Audit-only artifacts are under audit-about/ (before snapshot, reference/current screenshots, browser evidence and scripts). Do not upload that directory. Upload the reviewed HTML, page stylesheet and images/about/ derivatives together when deployment is authorized. Existing JPEG fallback assets remain unchanged.
`;
fs.writeFileSync(new URL('audit-about/README.md',root),report);console.log('PASS: HTML parsing, metadata preservation and identical hero bounds. Report written.');
