import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {createHandler} from '../src/app.js';
import {createChannels} from '../src/channels.js';
import {createDelivery} from '../src/delivery.js';
import {emailMessage,parseLead,telegramText} from '../src/lead.js';
import {openStore} from '../src/store.js';

const origin='https://ab-digital.kz';
const id='11223344-5566-7788-9900-aabbccddeeff';
const lead={id,name:'Alice',contact:'alice@example.com',details:'Нужен сайт',service:'Сайт',consent:true};
const quiet={error(){}};
const baseConfig={
  allowedOrigins:[origin],ipSalt:'salt',telegramApi:'https://tg.test',telegramToken:'123:SECRET',telegramChatId:'42',
  resendApi:'https://mail.test',resendKey:'re_secret',mailFrom:'AB <leads@ab-digital.kz>',mailTo:'admin@ab-digital.kz'
};

async function harness(t,{failing=new Set(),config={}}={}){
  const calls=[];
  const fakeFetch=async(url,options)=>{
    const channel=url.startsWith('https://tg.test')?'telegram':'email';
    calls.push({channel,url,options,body:JSON.parse(options.body)});
    if(failing.has(channel))return new Response('{}',{status:500});
    return new Response(JSON.stringify({ok:true}),{status:200});
  };
  const merged={...baseConfig,...config};
  const store=openStore(':memory:');
  const channels=createChannels(merged,fakeFetch);
  const clock={now:1_000_000};
  const delivery=createDelivery({store,channels,clock:()=>clock.now,log:quiet});
  const handler=createHandler({config:merged,store,delivery,channels,clock:()=>clock.now,log:quiet});
  const server=http.createServer(handler);
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(()=>new Promise(resolve=>server.close(()=>{store.close();resolve();})));
  const url='http://127.0.0.1:'+server.address().port;
  const post=(body,{headers={},raw}={})=>fetch(url+'/api/lead',{
    method:'POST',redirect:'manual',
    headers:{'content-type':'application/json',origin,'x-real-ip':'10.0.0.1',...headers},
    body:raw??JSON.stringify(body)
  });
  return {calls,store,delivery,clock,post,url,failing};
}

const idFor=n=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0');

test('заявка сохраняется и уходит в оба канала',async t=>{
  const {calls,store,delivery,post}=await harness(t);
  const response=await post(lead);
  assert.equal(response.status,201);
  assert.deepEqual(await response.json(),{saved:true,id});
  await delivery.run();
  assert.deepEqual(calls.map(call=>call.channel).sort(),['email','telegram']);
  const telegram=calls.find(call=>call.channel==='telegram');
  assert.equal(telegram.body.chat_id,'42');
  assert.match(telegram.body.text,/Новая заявка/);
  const email=calls.find(call=>call.channel==='email');
  assert.equal(email.body.reply_to,'alice@example.com');
  assert.deepEqual(email.body.to,['admin@ab-digital.kz']);
  assert.equal(email.options.headers['idempotency-key'],id);
  assert.deepEqual(store.counts(),{leads:1,undelivered:0});
});

test('повторная отправка того же id не дублирует заявку',async t=>{
  const {calls,store,delivery,post}=await harness(t);
  await post(lead);
  await delivery.run();
  const again=await post(lead);
  assert.equal(again.status,200);
  await delivery.run();
  assert.equal(calls.length,2);
  assert.equal(store.counts().leads,1);
});

test('сбой канала не теряет заявку, а второй канал работает',async t=>{
  const failing=new Set(['telegram']);
  const {calls,store,delivery,clock,post}=await harness(t,{failing});
  assert.equal((await post(lead)).status,201);
  await delivery.run();
  assert.deepEqual(store.counts(),{leads:1,undelivered:1});
  assert.equal(calls.filter(call=>call.channel==='email').length,1);

  // До конца паузы повторов нет, после неё заявка доходит.
  await delivery.run();
  assert.equal(calls.filter(call=>call.channel==='telegram').length,1);
  failing.clear();
  clock.now+=61_000;
  await delivery.run();
  assert.equal(calls.filter(call=>call.channel==='telegram').length,2);
  assert.equal(calls.filter(call=>call.channel==='email').length,1);
  assert.deepEqual(store.counts(),{leads:1,undelivered:0});
});

test('ненастроенный канал не блокирует заявку и она ждёт его в базе',async t=>{
  const {calls,store,delivery,post}=await harness(t,{config:{resendKey:''}});
  assert.equal((await post(lead)).status,201);
  await delivery.run();
  assert.deepEqual(calls.map(call=>call.channel),['telegram']);
  assert.deepEqual(store.counts(),{leads:1,undelivered:1});
});

test('без каналов сервис не обещает доставку',async t=>{
  const {store,post}=await harness(t,{config:{resendKey:'',telegramToken:''}});
  assert.equal((await post(lead)).status,503);
  assert.equal(store.counts().leads,0);
});

test('заполненная ловушка только помечает заявку',async t=>{
  const {calls,store,delivery,post}=await harness(t);
  assert.equal((await post({...lead,company_site:'https://spam.test'})).status,201);
  await delivery.run();
  assert.equal(store.counts().leads,1);
  assert.match(calls.find(call=>call.channel==='telegram').body.text,/возможно, спам/);
  assert.match(calls.find(call=>call.channel==='email').body.subject,/возможно, спам/);
});

test('текст со ссылками и рекламными словами не считается спамом',async t=>{
  const {calls,delivery,post}=await harness(t);
  await post({...lead,details:'Купить казино, viagra, http://a.b http://c.d бесплатно!!!'});
  await delivery.run();
  assert.doesNotMatch(calls.find(call=>call.channel==='telegram').body.text,/возможно, спам/);
});

test('сверх мягкого лимита заявки сохраняются и приходят одной сводкой',async t=>{
  const {calls,store,delivery,post}=await harness(t);
  for(let n=1;n<=13;n++){
    const response=await post({...lead,id:idFor(n),name:'Имя '+n});
    assert.equal(response.status,201);
  }
  await delivery.run();
  assert.equal(calls.filter(call=>call.channel==='telegram').length,10);
  assert.equal(store.counts().leads,13);

  await delivery.sendHeldSummaries();
  const summaries=calls.filter(call=>/с одного адреса: 3/.test(call.body.text??''));
  assert.equal(summaries.length,1);
  assert.match(summaries[0].body.text,/Имя 11/);
  await delivery.sendHeldSummaries();
  assert.equal(calls.filter(call=>/с одного адреса/.test(call.body.text??'')).length,1);
});

test('лимит считается отдельно для каждого IP и окно истекает',async t=>{
  const {calls,delivery,clock,post}=await harness(t);
  for(let n=1;n<=11;n++)await post({...lead,id:idFor(n)});
  await post({...lead,id:idFor(100)},{headers:{'x-real-ip':'10.0.0.2'}});
  clock.now+=10*60_000;
  await post({...lead,id:idFor(101)});
  await delivery.run();
  assert.equal(calls.filter(call=>call.channel==='telegram').length,12);
});

test('жёсткий лимит отвечает ошибкой, чтобы данные остались в форме',async t=>{
  const {store,post}=await harness(t);
  for(let n=1;n<=60;n++)assert.equal((await post({...lead,id:idFor(n)})).status,201);
  assert.equal((await post({...lead,id:idFor(61)})).status,429);
  assert.equal(store.counts().leads,60);
});

test('чужой Origin, неверный тип и битое тело отклоняются',async t=>{
  const {store,post}=await harness(t);
  assert.equal((await post(lead,{headers:{origin:'https://evil.test'}})).status,403);
  assert.equal((await post(lead,{headers:{'content-type':'text/plain'}})).status,415);
  assert.equal((await post(null,{raw:'{oops'})).status,400);
  assert.equal((await post({...lead,consent:false})).status,400);
  assert.equal((await post({...lead,name:'  '})).status,400);
  assert.equal((await post(null,{raw:JSON.stringify({...lead,details:'x'.repeat(20_000)})})).status,413);
  assert.equal(store.counts().leads,0);
});

test('форма без JavaScript сохраняется и возвращает на сайт',async t=>{
  const {store,post}=await harness(t);
  const raw=new URLSearchParams({name:'Боб',contact:'@bob',details:'Бот',consent:'Да'}).toString();
  const response=await post(null,{raw,headers:{'content-type':'application/x-www-form-urlencoded'}});
  assert.equal(response.status,303);
  assert.equal(response.headers.get('location'),'/?lead=sent#contact');
  assert.equal(store.counts().leads,1);
});

test('/health показывает состояние без секретов',async t=>{
  const {url}=await harness(t);
  const text=await (await fetch(url+'/health')).text();
  assert.deepEqual(JSON.parse(text),{status:'ok',telegram:true,email:true,leads:0,undelivered:0});
  assert.equal(text.includes('SECRET'),false);
  assert.equal((await fetch(url+'/other')).status,404);
});

test('длинные поля обрезаются, а не отклоняются',()=>{
  const parsed=parseLead({...lead,details:'я'.repeat(5000)},()=>id);
  assert.equal(parsed.details.length,1200);
  assert.ok(telegramText({...parsed,details:'я'.repeat(9000)}).length<=3900);
});

test('без email в контакте reply_to не ставится, неверный id заменяется',()=>{
  const parsed=parseLead({...lead,id:'bad',contact:'@alice'},()=>id);
  assert.equal(parsed.id,id);
  assert.equal(emailMessage(parsed).replyTo,null);
});
