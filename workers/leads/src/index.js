// AB/digital backup intake. Keep every credential in Cloudflare Worker secrets.
const allowedOrigins = new Set(['https://ab-digital.onrender.com']);
const responseHeaders = {'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'};
const field=(value,max)=>String(value??'').trim().slice(0,max);
const json=(value,status=200,origin)=>new Response(JSON.stringify(value),{
  status,headers:{...responseHeaders,...(allowedOrigins.has(origin)?{'access-control-allow-origin':origin,'vary':'Origin'}:{})}
});
const MAX_LENGTH=18000;

function validate(body){
  if(!body||typeof body!=='object'||Array.isArray(body))return null;
  const lead={
    id:field(body.id,100),name:field(body.name,80),contact:field(body.contact,120),
    service:field(body.service,80),details:field(body.details,1200),
    source:field(body.source,180),landing:field(body.landing,300),
    referrer:field(body.referrer,500),
    utm_source:field(body.utm_source,100),utm_medium:field(body.utm_medium,100),
    utm_campaign:field(body.utm_campaign,160),utm_content:field(body.utm_content,160),
    utm_term:field(body.utm_term,160)
  };
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lead.id))return null;
  if(!lead.name||!lead.contact||!lead.details||body.consent!==true)return null;
  if(Object.keys(lead).some(k=>String(body[k]??'').length>({id:100,name:80,contact:120,service:80,details:1200,source:180,landing:300,referrer:500,utm_source:100,utm_medium:100,utm_campaign:160,utm_content:160,utm_term:160}[k])))return null;
  return lead;
}

async function verifyTurnstile(token, env, ip){
  if(!token||typeof token!=='string'||token.length>2048)return false;
  const form=new FormData();
  form.set('secret',env.TURNSTILE_SECRET);form.set('response',token);
  if(ip)form.set('remoteip',ip);
  const reply=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{
    method:'POST',body:form,signal:AbortSignal.timeout(6500)
  });
  if(!reply.ok)return false;
  const result=await reply.json();
  // A valid token for a different hostname is not valid for this site.
  return result.success===true&&result.hostname==='ab-digital.onrender.com';
}

function telegramMessage(lead){
  return [
    '📩 Новая заявка AB/digital',
    'ID: '+lead.id,
    'Имя: '+lead.name,
    'Контакт: '+lead.contact,
    'Услуга: '+(lead.service||'—'),
    'Задача: '+lead.details,
    'Источник: '+(lead.source||'—'),
    'UTM: '+[lead.utm_source,lead.utm_medium,lead.utm_campaign].filter(Boolean).join(' / '),
    'Страница: '+(lead.landing||'—'),
    'Переход: '+(lead.referrer||'—')
  ].join('\n').slice(0,3900);
}

async function notifyTelegram(env, lead){
  const response=await fetch('https://api.telegram.org/bot'+env.TELEGRAM_BOT_TOKEN+'/sendMessage',{
    method:'POST',headers:{'content-type':'application/json'},
    body:JSON.stringify({chat_id:env.TELEGRAM_CHAT_ID,text:telegramMessage(lead),disable_web_page_preview:true}),
    signal:AbortSignal.timeout(6500)
  });
  if(!response.ok)throw new Error('Telegram HTTP '+response.status);
  const result=await response.json();
  if(result.ok!==true)throw new Error('Telegram API refused the notification');
}

async function deliver(env,lead){
  try{
    await notifyTelegram(env,lead);
    await env.DB.prepare("UPDATE leads SET notify_state='sent', notified_at=?, last_error=NULL WHERE id=?")
      .bind(Date.now(),lead.id).run();
    return 'sent';
  }catch(err){
    // Never include lead PII or bot token in logs or stored error text.
    console.error('Backup Telegram delivery failed for lead',lead.id,String(err?.message??'error').replace(/bot\d+:[A-Za-z0-9_-]+/g,'bot[redacted]'));
    await env.DB.prepare("UPDATE leads SET notify_state='pending',attempts=attempts+1,next_attempt_at=?,last_error='send_failed' WHERE id=?")
      .bind(Date.now()+60_000,lead.id).run();
    return 'queued';
  }
}

async function accept(request,env){
  const origin=request.headers.get('Origin')||'';
  if(!allowedOrigins.has(origin))return json({error:'origin_not_allowed'},403,origin);
  if(!env.DB||!env.TELEGRAM_BOT_TOKEN||!env.TELEGRAM_CHAT_ID||!env.TURNSTILE_SECRET)
    return json({error:'not_configured'},503,origin);
  if(Number(request.headers.get('content-length')||0)>MAX_LENGTH)return json({error:'too_large'},413,origin);
  let raw;
  try{raw=await request.text();}catch{return json({error:'invalid_body'},400,origin);}
  if(raw.length>MAX_LENGTH)return json({error:'too_large'},413,origin);
  let body;
  try{body=JSON.parse(raw);}catch{return json({error:'invalid_json'},400,origin);}
  const lead=validate(body);
  if(!lead)return json({error:'invalid_fields'},400,origin);
  // Idempotency: replaying the same UUID cannot create another notification.
  try{
    const exists=await env.DB.prepare('SELECT id,notify_state FROM leads WHERE id=?').bind(lead.id).first();
    if(exists)return json({saved:true,notification:exists.notify_state,id:lead.id,duplicate:true},200,origin);
  }catch{return json({error:'storage_unavailable'},503,origin);}
  let passed=false;
  try{passed=await verifyTurnstile(body.turnstile_token,env,request.headers.get('CF-Connecting-IP'));}
  catch{passed=false;}
  if(!passed)return json({error:'verification_failed'},403,origin);
  try{
    const sql='INSERT OR IGNORE INTO leads (id,created_at,name,contact,service,details,source,landing,referrer,utm_source,utm_medium,utm_campaign,utm_content,utm_term,notify_state,attempts,next_attempt_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,\'pending\',0,?)';
    const result=await env.DB.prepare(sql).bind(
      lead.id,Date.now(),lead.name,lead.contact,lead.service,lead.details,lead.source,lead.landing,lead.referrer,
      lead.utm_source,lead.utm_medium,lead.utm_campaign,lead.utm_content,lead.utm_term,Date.now()
    ).run();
    if(result.meta?.changes===0)return json({saved:true,notification:'pending',id:lead.id,duplicate:true},200,origin);
  }catch{
    return json({error:'storage_unavailable'},503,origin);
  }
  const state=await deliver(env,lead);
  return json({saved:true,notification:state,id:lead.id},201,origin);
}

async function retryPending(env){
  if(!env.DB||!env.TELEGRAM_BOT_TOKEN||!env.TELEGRAM_CHAT_ID)return;
  // Reap old leads; published retention policy should explain this 90-day period.
  const now=Date.now();
  await env.DB.prepare('DELETE FROM leads WHERE created_at<?').bind(now-90*24*3600*1000).run();
  const queue=await env.DB.prepare(
    "SELECT * FROM leads WHERE notify_state='pending' AND next_attempt_at<=? ORDER BY created_at ASC LIMIT 25"
  ).bind(now).all();
  for(const lead of queue.results??[]){
    // Exponential backoff cap, no silent permanent drop within retention period.
    try{
      await notifyTelegram(env,lead);
      await env.DB.prepare("UPDATE leads SET notify_state='sent',notified_at=?,last_error=NULL WHERE id=?").bind(Date.now(),lead.id).run();
    }catch{
      const wait=Math.min(6*3600_000,60_000*Math.pow(2,Math.min(lead.attempts||0,8)));
      await env.DB.prepare("UPDATE leads SET attempts=attempts+1,next_attempt_at=?,last_error='send_failed' WHERE id=?")
        .bind(Date.now()+wait,lead.id).run();
    }
  }
}

export default {
  async fetch(request,env){
    const url=new URL(request.url);
    const origin=request.headers.get('Origin')||'';
    if(request.method==='OPTIONS'&&url.pathname==='/api/lead'){
      if(!allowedOrigins.has(origin))return new Response(null,{status:403});
      return new Response(null,{status:204,headers:{
        'access-control-allow-origin':origin,'access-control-allow-methods':'POST, OPTIONS',
        'access-control-allow-headers':'content-type','access-control-max-age':'3600','vary':'Origin'
      }});
    }
    if(url.pathname==='/health'&&request.method==='GET')return json({status:'ok'});
    if(url.pathname!=='/api/lead'||request.method!=='POST')return json({error:'not_found'},404);
    return accept(request,env);
  },
  async scheduled(_event,env,ctx){ctx.waitUntil(retryPending(env));}
};
