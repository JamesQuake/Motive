import fs from 'node:fs';
import {syncHtml} from './sync-business-data.mjs';
const root=new URL('../',import.meta.url),file=new URL('testimonials.html',root);
const data=JSON.parse(fs.readFileSync(new URL('data/testimonials.json',root),'utf8'));
if(!/^\d{4}-\d{2}-\d{2}$/.test(data.capturedOn)||!Number.isFinite(Date.parse(data.capturedOn)))throw Error('Invalid review snapshot date');
const capturedDate=new Date(data.capturedOn+'T00:00:00Z');
const capturedShort=new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(capturedDate);
const capturedLong=new Intl.DateTimeFormat('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'}).format(capturedDate);
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
if(data.reviews.length!==12||new Set(data.reviews.map(r=>r.id)).size!==12)throw Error('Expected twelve distinct supplied reviews');
for(const r of data.reviews){if(!r.name||!r.initials||!Number.isInteger(r.rating)||r.rating<1||r.rating>5||!r.relativeDate||/View full review/.test(r.comment||''))throw Error('Incomplete review record');if(r.photoUrl&&(!/^\/images\/reviewers\/[a-z0-9-]+\.(png|jpg|webp)$/.test(r.photoUrl)||!fs.existsSync(new URL(r.photoUrl.slice(1),root))))throw Error('Invalid local photo');if(r.profileUrl&&!/^https:\/\/www\.google\.com\/maps\/contrib\/\d+\/reviews\?hl=en$/.test(r.profileUrl))throw Error('Invalid profile URL');}
const cards=data.reviews.map(r=>`<li class="review-card" data-review-id="${escape(r.id)}"><article aria-labelledby="review-${escape(r.id)}"><header class="review-author">${r.photoUrl?`<img class="review-avatar" data-initials="${escape(r.initials)}" src="${escape(r.photoUrl)}" width="48" height="48" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer"/>`:`<span class="review-avatar" aria-hidden="true">${escape(r.initials)}</span>`}<div><h3 id="review-${escape(r.id)}">${r.profileUrl?`<a href="${escape(r.profileUrl)}" target="_blank" rel="noopener noreferrer">${escape(r.name)}</a>`:escape(r.name)}</h3><div class="review-date">${escape(r.relativeDate)}<br/><span>as of ${capturedShort}</span></div></div></header><div class="review-stars" role="img" aria-label="${r.rating} out of 5 stars"><span aria-hidden="true">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</span></div>${r.comment?`<blockquote${r.language?` lang="${escape(r.language)}"`:''}><p>${escape(r.comment)}</p></blockquote>`:'<p class="review-rating-only">5-star rating</p>'}<div class="review-attribution">Posted on Google</div></article></li>`).join('\n');
const body=`<!-- testimonials:start -->
<div class="testimonials-content">
<section class="container" aria-labelledby="customer-reviews-title">
  <div class="review-intro"><div class="review-intro-copy"><p class="review-eyebrow">Customer perspectives</p><h2 id="customer-reviews-title">Their words. Your next decision.</h2><p>Read what customers shared about their experience with Motive.</p></div><a class="review-source-link" href="${escape(data.listingUrl)}" target="_blank" rel="noopener noreferrer">Read all reviews on Google <span aria-hidden="true">↗</span></a></div>
  <div class="review-carousel" data-review-carousel role="region" aria-roledescription="carousel" aria-label="Customer reviews" aria-describedby="review-source-note">
    <div class="review-viewport" tabindex="0" aria-label="Review cards. Use left and right arrow keys to browse."><div class="review-track"><ol class="review-set" data-review-original>
${cards}
    </ol></div></div>
    <div class="review-controls-space"><div class="review-controls" hidden><button class="review-control" type="button" data-review-toggle>Pause reviews</button><div class="review-control-group"><button class="review-control" type="button" data-review-prev aria-label="Previous review">←</button><button class="review-control" type="button" data-review-next aria-label="Next review">→</button></div></div></div>
    <p class="review-count" data-review-status role="status" aria-live="polite" aria-atomic="true">12 selected reviews</p>
  </div>
  <p class="review-note" id="review-source-note">Selected Google Business Profile entries supplied by Motive. Eleven complete comments in supplied date order, followed by one rating-only entry; shortened comments are omitted. Original wording and ratings are retained. Dates reflect the ${capturedLong} snapshot.</p>
</section>
<section class="review-visit" aria-labelledby="review-office-title"><div class="container review-visit-grid"><div><p class="review-eyebrow">Motive in Matteson</p><h2 id="review-office-title">A conversation starts here.</h2><p>Have a question about your coverage or a change ahead? Connect with Motive to discuss your personal or commercial insurance needs.</p></div><div class="review-office"><h3>Matteson office</h3><address><!-- business:street-0 --><!-- /business -->, <!-- business:city-0 --><!-- /business --></address><a class="review-source-link" href="${escape(data.listingUrl)}" target="_blank" rel="noopener noreferrer">Find Motive on Google Maps <span aria-hidden="true">↗</span></a></div></div></section>
<section class="review-cta" aria-labelledby="review-cta-title"><div class="container"><div class="review-cta-inner"><div><h2 id="review-cta-title">Let’s talk about what matters to you.</h2><p>Bring your questions. We’ll help you take a closer look at your coverage options.</p></div><a class="btn btn-start" href="contact-us.html#contactForm">Contact Motive <span aria-hidden="true">→</span></a></div></div></section>
</div>
<!-- testimonials:end -->`;
let html=fs.readFileSync(file,'utf8');
if(html.includes('<!-- testimonials:start -->'))html=html.replace(/<!-- testimonials:start -->[\s\S]*?<!-- testimonials:end -->/,body);
else {const start=html.indexOf('<section class="product-content-band">'),end=html.indexOf('</main>',start);if(start<0||end<0)throw Error('Expected testimonials content');html=html.slice(0,start)+body+'\n'+html.slice(end);}
if(!html.includes('href="testimonials.css'))html=html.replace('</head>','<link href="testimonials.css?v=20261110" rel="stylesheet"/>\n</head>');
if(!html.includes('src="testimonials.js'))html=html.replace('</body>','<script src="testimonials.js?v=20261110" defer></script>\n</body>');
html=syncHtml(html);
if(html!==fs.readFileSync(file,'utf8')){if(process.argv.includes('--check'))throw Error('Run node scripts/sync-testimonials.mjs');fs.writeFileSync(file,html);console.log('Testimonials regenerated from supplied records and shared business JSON.')}else console.log('Testimonials are current.');
