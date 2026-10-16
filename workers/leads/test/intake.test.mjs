import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';

const id='11223344-5566-7788-9900-aabbccddeeff';
const origin='https://ab-digital.onrender.com';
const lead={id,name:'Alice',contact:'@alice',details:'Need a website',service:'Site',consent:true,turnstile_token:'testtoken'};
function fakeDb(){
 const rows=new Map();
 return {rows,prepare(sql){return{bind(...params){return{
  async first(){const value=rows.get(params[0]);return value?{id:value.id,notify_state:value.notify_state}:null;},
  async run(){
   if(sql.startsWith('INSERT')){
    if(rows.has(params[0]))return{meta:{changes:0}};
    rows.set(params[0],{id:params[0],notify_state:'pending'});return{meta:{changes:1}};
   }
   if(sql.startsWith('UPDATE')){
    const item=rows.get(params.at(-1));
    if(item&&sql.includes("notify_state='sent'"))item.notify_state='sent';
    return{meta:{changes:1}};
   }
   throw Error('unknown sql '+sql);
  },
  async all(){return {results:[]}}
 };}};}}};
}
const env=(DB=fakeDb())=>({DB,TELEGRAM_BOT_TOKEN:'TEST_SECRET',TELEGRAM_CHAT_ID:'123',TURNSTILE_SECRET:'TEST_SECRET'});
const req=(data=lead,from=origin)=>new Request('https://test.workers.dev/api/lead',{method:'POST',headers:{Origin:from,'content-type':'application/json'},body:JSON.stringify(data)});
test('saves and sends once, repeated UUID does not send again',async()=>{
 const saved=globalThis.fetch;let sent=0;
 globalThis.fetch=async url=>{
  if(String(url).includes('siteverify'))return Response.json({success:true,hostname:'ab-digital.onrender.com'});
  sent++;return Response.json({ok:true});
 };
 try{
  const e=env();const r=await worker.fetch(req(),e);
  assert.equal(r.status,201);assert.equal((await r.json()).notification,'sent');
  assert.equal(e.DB.rows.size,1);
  const duplicate=await worker.fetch(req(),e);
  assert.equal(duplicate.status,200);assert.equal((await duplicate.json()).duplicate,true);assert.equal(sent,1);
 }finally{globalThis.fetch=saved;}
});
test('rejects unknown origins, missing consent and secrets',async()=>{
 assert.equal((await worker.fetch(req(lead,'https://attacker.example'),env())).status,403);
 assert.equal((await worker.fetch(req({...lead,consent:false}),env())).status,400);
 const e=env();delete e.TELEGRAM_BOT_TOKEN;
 assert.equal((await worker.fetch(req(),e)).status,503);
});
test('rejects Turnstile challenge created for another host',async()=>{
 const old=globalThis.fetch;globalThis.fetch=async()=>Response.json({success:true,hostname:'other.example'});
 try{const e=env();assert.equal((await worker.fetch(req(),e)).status,403);assert.equal(e.DB.rows.size,0);}
 finally{globalThis.fetch=old;}
});
test('stores lead for retry if Telegram is down',async()=>{
 const old=globalThis.fetch;
 globalThis.fetch=async url=>String(url).includes('siteverify')?Response.json({success:true,hostname:'ab-digital.onrender.com'}):new Response('down',{status:503});
 try{const e=env();const r=await worker.fetch(req(),e);
 assert.equal(r.status,201);assert.equal((await r.json()).notification,'queued');assert.equal(e.DB.rows.get(id).notify_state,'pending');}
 finally{globalThis.fetch=old;}
});
