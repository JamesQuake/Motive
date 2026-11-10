import fs from 'node:fs';
import {parse} from 'file:///C:/Users/user14/AppData/Local/Temp/motive-regression-validator/node_modules/parse5/dist/index.js';
const root=new URL('../',import.meta.url),read=f=>fs.readFileSync(new URL(f,root),'utf8');
const r=JSON.parse(read('audit-regression/results.json')),results=[];
for(const p of r.pages){const errors=[];parse(read(p.file),{sourceCodeLocationInfo:true,onParseError:e=>errors.push(e)});const oldErrors=[];parse(fs.readFileSync('C:/Users/user14/AppData/Local/Temp/motive-discovery-zm8ohu/'+p.file,'utf8'),{onParseError:e=>oldErrors.push(e)});results.push({file:p.file,errors,baselineErrors:oldErrors,duplicateIds:p.raw.duplicateIds,jsonLdErrors:p.raw.schemaErrors});}
fs.writeFileSync(new URL('audit-regression/html-validation.json',root),JSON.stringify({parser:'parse5 8.1.1; WHATWG HTML parser error checks, not complete conformance validation',results},null,2));
console.log(JSON.stringify(results.filter(p=>p.errors.length||p.duplicateIds.length||p.jsonLdErrors.length),null,2));
