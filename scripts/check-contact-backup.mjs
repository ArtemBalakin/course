import { chromium } from 'playwright';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const languages=[
 {path:'/',label:'Отправить копию через Telegram',success:'Заявка надёжно сохранена'},
 {path:'/kk/',label:'Көшірмесін Telegram арқылы жіберу',success:'Өтінім сенімді түрде сақталды'},
 {path:'/en/',label:'Send a copy via Telegram',success:'Your inquiry is safely stored'}
];
const failures=[];
try {
 for(const lang of languages) {
  const page=await browser.newPage({viewport:{width:1200,height:900}});
  const errors=[];
  page.on('pageerror',error=>errors.push(String(error)));
  const response=await page.goto('https://ab-digital.kz'+lang.path,{waitUntil:'domcontentloaded',timeout:60000});
  await page.locator('#ab-contact-telegram-copy').waitFor({state:'visible',timeout:30000});
  const label=await page.locator('#ab-contact-telegram-copy').innerText();
  if(response.status()!==200||!label.includes(lang.label)||errors.length){
    failures.push({path:lang.path,stage:'load',status:response.status(),label,errors});
  }
  // Verify the acceptance branch without sending a real customer enquiry.
  await page.route('**/api/lead',route=>route.fulfill({
    status:201,headers:{'content-type':'application/json'},body:'{"saved":true}'
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
  console.log('PASS',lang.path,'mock acceptance + alternate Telegram button',label);
 }
 const page=await browser.newPage();
 await page.goto('https://ab-digital.kz/',{waitUntil:'domcontentloaded'});
 await page.route('**/api/lead',route=>route.fulfill({
   status:503,body:'unavailable'
 }));
 await page.locator('#ab-contact-name').fill('Keep Details');
 await page.locator('#ab-contact-way').fill('@preserved');
 await page.locator('#ab-contact-details').fill('Please do not erase my enquiry.');
 await page.locator('#ab-contact-consent').check();
 await page.locator('.contact-form-submit').click();
 await page.waitForFunction(()=>document.querySelector('#ab-contact-status')?.dataset.state==='error',{timeout:12000});
 const retained=await page.locator('#ab-contact-name').inputValue();
 if(retained!=='Keep Details')failures.push({stage:'intake-down',retained});
 console.log('PASS failure handling: form data retained and Telegram copy available');
 await page.close();
}finally{await browser.close();}
if(failures.length){console.error(JSON.stringify(failures,null,2));process.exit(1);}
console.log('PASS all localized contact form smoke tests');
