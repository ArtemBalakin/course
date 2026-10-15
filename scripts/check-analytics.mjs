import { chromium } from 'playwright';

const browser = await chromium.launch({headless: true, args:['--no-sandbox']});
const targets=['https://ab-digital.onrender.com/','https://ab-digital-preview.onrender.com/'];
let errors=0;
try {
  for (const target of targets) {
    const page=await browser.newPage({viewport:{width:1280,height:900},locale:'ru-RU'});
    const network=[],runtime=[];
    page.on('request',r=>{
      if (/cloudflareinsights\.com/.test(r.url())) network.push({type:'request',url:r.url(),method:r.method()});
    });
    page.on('response',r=>{
      if (/cloudflareinsights\.com/.test(r.url())) network.push({type:'response',url:r.url(),status:r.status()});
    });
    page.on('requestfailed',r=>{
      if (/cloudflareinsights\.com/.test(r.url())) network.push({type:'failed',url:r.url(),error:r.failure()?.errorText});
    });
    page.on('pageerror',e=>runtime.push(String(e)));
    try {
      const response=await page.goto(target,{waitUntil:'load',timeout:55000});
      await page.waitForTimeout(6500);
      const state=await page.evaluate(()=>({
        title:document.title,
        bootstrapLoaded:[...document.scripts].some(x=>x.src.includes('/assets/analytics.js')),
        beaconPresent:[...document.scripts].some(x=>x.src.includes('static.cloudflareinsights.com/beacon.min.js')),
        beaconSnippet:[...document.scripts].filter(x=>x.src.includes('static.cloudflareinsights.com/beacon.min.js')).map(x=>({src:x.src,type:x.type,token:x.getAttribute('data-cf-beacon')}))
      }));
      await page.goto('about:blank',{waitUntil:'load'});
      await page.waitForTimeout(3000);
      console.log(JSON.stringify({target,status:response?.status(),state,network,runtime},null,2));
      if (!response?.ok() || !state.bootstrapLoaded || !state.beaconPresent || !network.some(x=>x.type==='response'&&x.url.includes('beacon.min.js')&&x.status===200) || !network.some(x=>x.type==='request'&&x.url.includes('/cdn-cgi/rum'))) {
        errors++;
        console.error('FAILED beacon smoke check for '+target);
      } else {
        console.log('PASS beacon delivery for '+target);
      }
    } catch(e) {
      errors++; console.error('FAILED '+target+': '+String(e));
      console.log(JSON.stringify({network,runtime},null,2));
    } finally {await page.close()}
  }
} finally {await browser.close()}
if(errors)process.exit(1);
