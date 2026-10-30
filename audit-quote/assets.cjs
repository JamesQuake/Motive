const fs=require('fs');
const {chromium}=require('C:/Users/user14/.vscode/extensions/danielsanmedium.dscodegpt-3.24.79/standalone/node_modules/patchright');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const page=await browser.newPage();
 const photos={hero:'Confident owner operator with white box truck.jpg',preparation:'Business Owner Checks Box Truck Details.jpg',closing:'Owner-Operator Preparing an Insurance Request.jpg'};
 for(const [name,file] of Object.entries(photos)){
  const data='data:image/jpeg;base64,'+fs.readFileSync('images/'+file).toString('base64');
  for(const width of [640,1024,1672]) for(const format of ['webp','jpeg']){
   const result=await page.evaluate(async({data,width,format})=>{const image=new Image();image.src=data;await image.decode();const canvas=document.createElement('canvas');canvas.width=width;canvas.height=Math.round(width*image.height/image.width);canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);return canvas.toDataURL('image/'+format,format==='webp'?.83:.87);},{data,width,format});
   if(!result.startsWith('data:image/'+format))throw Error('Unsupported format '+format);
   fs.writeFileSync('images/box-truck-quote-'+name+'-'+width+'.'+(format==='jpeg'?'jpg':format),Buffer.from(result.split(',')[1],'base64'));
  }
 }
 await browser.close();console.log('18 responsive derivatives saved.');
})().catch(e=>{console.error(e);process.exit(1)});
