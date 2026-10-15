import { chromium } from 'playwright';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const hosts=['ab-digital.onrender.com','ab-digital-preview.onrender.com'];
const languages=[
 {lang:'ru',path:'/',marker:'Сайты, Mini Apps'},
 {lang:'kk',path:'/kk/',marker:'Сайттар, Mini Apps'},
 {lang:'en',path:'/en/',marker:'Websites, Mini Apps'},
];
const failures=[];
try{
 for(const test of languages){
  const page=await browser.newPage({viewport:{width:1280,height:960},locale:'ru-RU'});
  const runtime=[];
  page.on('pageerror',e=>runtime.push(e.message));
  const r=await page.goto('https://'+hosts[0]+test.path,{waitUntil:'load',timeout:60000});
  await page.waitForTimeout(800);
  const state=await page.evaluate(()=>({
   lang:document.documentElement.lang,
   canonical:document.querySelector('link[rel="canonical"]')?.href,
   meta:document.querySelector('meta[name="robots"]')?.content,
   hreflangs:[...document.querySelectorAll('link[hreflang]')].map(x=>x.hreflang),
   active:document.querySelector('.lang-switch [aria-current="page"]')?.getAttribute('hreflang'),
   hero:document.querySelector('.home-hero h1')?.innerText,
   cssApplied:getComputedStyle(document.querySelector('.lang-switch')).display,
   gallery:typeof document.querySelector('#portfolio-gallery')?.showModal==='function',
   scripts:[...document.scripts].filter(x=>x.src.includes('i18n-')).map(x=>x.src)
  }));
  const expected='https://'+hosts[0]+test.path;
  if(r?.status()!==200||state.lang!==test.lang||state.canonical!==expected||!state.meta?.includes('index')||state.active!==test.lang||!state.hero?.includes(test.marker)||!['flex','inline-flex'].includes(state.cssApplied)||runtime.length)failures.push({test,state,status:r?.status(),runtime});
  console.log('LOCALE',JSON.stringify({lang:test.lang,status:r?.status(),state,runtime}));
  await page.close();
 }
 for(const lang of languages){
  const page=await browser.newPage();
  await page.goto('https://'+hosts[1]+lang.path+'?src=old#services',{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForTimeout(600);
  const url=page.url();
  console.log('PREVIEW',lang.lang,url);
  if(url!=='https://'+hosts[0]+lang.path+'?src=old#services')failures.push({test:'redirect-'+lang.lang,url});
  await page.close();
 }
 const page=await browser.newPage();
 await page.goto('https://'+hosts[0]+'/courses/sabina/',{waitUntil:'domcontentloaded'});
 const hidden=await page.$eval('meta[name="robots"]',e=>e.content);
 console.log('HIDDEN_COURSE',hidden);
 if(!hidden.includes('noindex'))failures.push({test:'course-noindex',hidden});
 await page.goto('https://'+hosts[0]+'/robots.txt');
 const robots=await page.locator('body').innerText();
 console.log('ROBOTS',robots);
 if(!robots.includes('Sitemap: https://ab-digital.onrender.com/sitemap.xml'))failures.push({test:'robots',robots});
 await page.goto('https://'+hosts[0]+'/sitemap.xml');
 const sitemap=await page.locator('body').innerText();
 console.log('SITEMAP',sitemap.slice(0,400));
 if(!sitemap.includes('/en/')||!sitemap.includes('/kk/'))failures.push({test:'sitemap',sitemap:sitemap.slice(0,500)});
 await page.close();
}finally{await browser.close()}
if(failures.length){console.error('FAIL',JSON.stringify(failures,null,2));process.exit(1)}
console.log('PASS: locales, canonical, SEO, switches, redirects and hidden course');
