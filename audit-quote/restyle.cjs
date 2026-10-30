const fs=require('fs');
const file='audit-quote/build.cjs';
let build=fs.readFileSync(file,'utf8');
const start=build.indexOf('<section class="quote-hero">');
const end=build.indexOf('<section class="quote-answer',start);
build=build.slice(0,start)+`<section class="quote-hero modern-hero modern-hero-blue"><div class="quote-hero-photo">\${photo('hero','Woman in an olive jacket holding a folder beside a white box truck',true)}</div><div class="hero-gradient"></div><div class="container hero-container"><div class="quote-hero-copy"><h1>Box Truck<br>Insurance Quote</h1><p>Prepare your details. Take the next step with Motive.</p><div class="quote-actions">\${cta()}\${call('Call 888-943-0888')}</div></div></div></section>
<section class="quote-intro"><div class="container"><h2>Know what to prepare</h2>\${prose(intro)}</div></section>
`+build.slice(end);
build=build.replace('class="quote-button survey-direct-option"','class="btn btn-start quote-button survey-direct-option"');
build=build.replace('box-truck-insurance-quote.css?v=20261023','box-truck-insurance-quote.css?v=20261023-site-ui');
fs.writeFileSync(file,build);
let css=fs.readFileSync('box-truck-insurance-quote.css','utf8');
const a=css.indexOf('.quote-hero {');const b=css.indexOf('.quote-section {',a);
css=css.slice(0,a)+`.quote-hero { position: relative; display: flex; align-items: center; min-height: 590px; padding: 72px 0; overflow: hidden; background: var(--motive-blue); }
.quote-hero-photo { position: absolute; inset: 0; }
.quote-hero-photo picture,.quote-hero-photo picture img { height: 100%; }
.quote-hero-photo picture img { object-fit: cover; object-position: right center; }
.quote-hero .hero-gradient { position: absolute; inset: 0; background: linear-gradient(90deg, var(--motive-blue) 0%, rgba(0,51,102,.97) 25%, rgba(0,51,102,.75) 43%, rgba(0,51,102,.08) 65%, transparent 100%); }
.quote-hero .hero-container { position: relative; z-index: 1; }
.quote-hero-copy { max-width: 620px; color: white; }
.quote-page .quote-hero h1 { color: white; font-size: clamp(3rem, 5.1vw, 5rem); line-height: 1.02; margin: 0 0 24px; letter-spacing: -.035em; }
.quote-hero-copy p { font-size: 1.1rem; line-height: 1.7; max-width: 410px; color: white; }
.quote-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 16px 22px; margin-top: 28px; }
.quote-page .quote-button { display: inline-flex; align-items: center; justify-content: center; gap: 20px; min-height: 54px; padding: 14px 26px; border-radius: 999px; background: linear-gradient(135deg,var(--motive-orange),#e64a1f); color: white; font-size: 1rem; font-weight: 750; text-decoration: none; box-shadow: 0 10px 24px rgba(255,85,46,.2); }
.quote-page .quote-button:hover { background: linear-gradient(135deg,#e64a1f,#d93618); color: white; }
.quote-call { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: 10px 0; font-size: .95rem; font-weight: 700; }
.quote-hero .quote-call,.quote-close .quote-call { color: white; }
.quote-hero .quote-call { padding: 12px 22px; border: 1px solid rgba(255,255,255,.7); border-radius: 999px; text-decoration: none; }
.quote-hero .quote-call:hover { background: rgba(255,255,255,.12); }
.quote-intro { padding: 56px 0; background: white; }
.quote-intro .container { max-width: 1000px; }
.quote-intro p:last-child { margin-bottom: 0; }
`+css.slice(b);
css=css.replace('color: var(--motive-dark); line-height: 1.16','color: var(--motive-blue); line-height: 1.16');
css=css.replaceAll('background: #f3f6f8','background: var(--soft-blue)');
css=css.replaceAll('background: var(--motive-dark)','background: var(--motive-blue)');
css=css.replace('color: #985037','color: var(--motive-blue)');
css=css.replace('border-radius: 8px; }','border-radius: 14px; }');
css=css.replace('.quote-table-wrap { margin: 30px 0 24px; }','.quote-table-wrap { margin: 30px 0 24px; overflow: hidden; border: 1px solid var(--quote-rule); border-radius: 14px; }');
css=css.replace('.quote-comparison { align-self: start;', '.quote-comparison { border-radius: 18px; align-self: start;');
css=css.replace('.quote-faq details { border-bottom: 1px solid var(--quote-rule); }','.quote-faq details { border: 1px solid var(--quote-rule); border-radius: 12px; margin-bottom: 12px; overflow: hidden; background: white; }\n.quote-faq details[open] summary { background: var(--soft-blue); color: var(--motive-blue); }');
css=css.replace('padding: 22px 30px 22px 0;', 'padding: 20px 24px;');
css=css.replace('padding: 0 12px 12px 0;', 'padding: 18px 24px; margin: 0;');
const m=css.indexOf('  .quote-hero { grid-template-columns: 1fr; }');const n=css.indexOf('  .quote-answer-grid',m);
css=css.slice(0,m)+`  .quote-hero { display: flex; flex-direction: column; min-height: 0; padding: 0; }
  .quote-hero-photo { position: relative; inset: auto; width: 100%; order: 0; }
  .quote-hero-photo picture,.quote-hero-photo picture img { height: auto; }
  .quote-hero .hero-gradient { display: none; }
  .quote-hero .hero-container { order: 1; padding-top: 32px; padding-bottom: 38px; }
  .quote-hero-copy { max-width: none; }
  .quote-page .quote-hero h1 { font-size: clamp(2.45rem, 6.4vw, 3.6rem); }
`+css.slice(n);
css=css.replace('  .quote-page .quote-breadcrumb { margin-bottom: 28px; }','  .quote-hero .quote-call { width: 100%; }');
fs.writeFileSync('box-truck-insurance-quote.css',css);
require('./build.cjs');
