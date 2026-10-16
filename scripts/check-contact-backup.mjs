import { chromium } from 'playwright';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const languages=[
 {path:'/',label:'Отправить копию через Telegram',success:'Formspree принял заявку'},
 {path:'/kk/',label:'Көшірмесін Telegram арқылы жіберу',success:'Formspree өтінімді қабылдады'},
 {path:'/en/',label:'Send a copy via Telegram',success:'Formspree accepted your inquiry'}
];
const failures=[];
try {
 for(const lang of languages) {
  const page=await browser.newPage({viewport:{width:1200,height:900}});
  const errors=[];
  page.on('pageerror',error=>errors.push(String(error)));
  const response=await page.goto('https://ab-digital.onrender.com'+lang.path,{waitUntil:'domcontentloaded',timeout:60000});
  await page.locator('#ab-contact-telegram-copy').waitFor({state:'visible',timeout:30000});
  const label=await page.locator('#ab-contact-telegram-copy').innerText();
  const config=await page.evaluate(()=>window.AB_LEADS_CONFIG);
  if(response.status()!==200||!label.includes(lang.label)||config.endpoint||config.sitekey||errors.length){
    failures.push({path:lang.path,stage:'load',status:response.status(),label,config,errors});
  }
  // Verify the Formspree acceptance branch without sending a real customer enquiry.
  await page.route('https://formspree.io/**',route=>route.fulfill({
    status:200,headers:{'access-control-allow-origin':'*','content-type':'application/json'},body:'{"ok":true}'
  }));
  await page.locator('#ab-contact-name').fill('Test Person');
  await page.locator('#ab-contact-way').fill('@testusername');
  await page.locator('#ab-contact-details').fill('This is an automated browser smoke test.');
  await page.locator('#ab-contact-consent').check();
  await page.locator('.contact-form-submit').click();
  await page.waitForFunction(()=>document.querySelector('#ab-contact-status')?.dataset.state==='success',{timeout:12000});
  const message=await page.locator('#ab-contact-status').innerText();
  const cleared=await page.locator('#ab-contact-name').inputValue();
  if(!message.includes(lang.success)||cleared!==''||errors.length)failures.push({path:lang.path,stage:'accepted',message,cleared,errors});
  await page.close();
  console.log('PASS',lang.path,'Formspree mock acceptance + alternate Telegram button',label);
 }
 const page=await browser.newPage();
 await page.goto('https://ab-digital.onrender.com/',{waitUntil:'domcontentloaded'});
 await page.route('https://formspree.io/**',route=>route.fulfill({
   status:503,headers:{'access-control-allow-origin':'*'},body:'unavailable'
 }));
 await page.locator('#ab-contact-name').fill('Keep Details');
 await page.locator('#ab-contact-way').fill('@preserved');
 await page.locator('#ab-contact-details').fill('Please do not erase my enquiry.');
 await page.locator('#ab-contact-consent').check();
 await page.locator('.contact-form-submit').click();
 await page.waitForFunction(()=>document.querySelector('#ab-contact-status')?.dataset.state==='error',{timeout:12000});
 const retained=await page.locator('#ab-contact-name').inputValue();
 if(retained!=='Keep Details')failures.push({stage:'formspree-down',retained});
 console.log('PASS failure handling: form data retained and Telegram copy available');
 await page.close();
}finally{await browser.close();}
if(failures.length){console.error(JSON.stringify(failures,null,2));process.exit(1);}
console.log('PASS all localized contact form smoke tests');
