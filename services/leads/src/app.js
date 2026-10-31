// HTTP-обработчик. Отвечает сразу после записи в базу, доставка идёт отдельно.
import {createHash,randomUUID} from 'node:crypto';
import {parseLead} from './lead.js';

const MAX_BODY=18_000;
const WINDOW_MS=10*60_000;
// Мягкий лимит: заявка сохраняется без отдельного уведомления. Запас нужен из-за общих IP мобильных операторов.
const SOFT_LIMIT=10;
// Жёсткий лимит защищает диск от флуда. Человек увидит ошибку, а данные останутся в форме.
const HARD_LIMIT=60;

const HEADERS={'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'};

function createLimiter(clock){
  const hits=new Map();
  return ip=>{
    const now=clock();
    const recent=(hits.get(ip)??[]).filter(time=>now-time<WINDOW_MS);
    recent.push(now);
    hits.set(ip,recent);
    if(hits.size>5000){
      for(const [key,times] of hits)if(now-times.at(-1)>=WINDOW_MS)hits.delete(key);
    }
    return recent.length;
  };
}

class BodyTooLarge extends Error{}

async function readBody(request){
  const chunks=[];
  let size=0;
  for await(const chunk of request){
    size+=chunk.length;
    if(size>MAX_BODY)throw new BodyTooLarge();
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

function parseBody(raw,type){
  if(type==='application/x-www-form-urlencoded')return Object.fromEntries(new URLSearchParams(raw));
  return JSON.parse(raw);
}

export function createHandler({config,store,delivery,channels,clock=Date.now,log=console}){
  const countHit=createLimiter(clock);
  const sender=ip=>createHash('sha256').update(config.ipSalt+ip).digest('hex').slice(0,16);
  const send=(response,status,body)=>{
    response.writeHead(status,HEADERS);
    response.end(JSON.stringify(body));
  };

  async function accept(request,response){
    const origin=request.headers.origin;
    if(origin&&!config.allowedOrigins.includes(origin))return send(response,403,{error:'origin_not_allowed'});
    const type=String(request.headers['content-type']??'').split(';')[0].trim().toLowerCase();
    if(type!=='application/json'&&type!=='application/x-www-form-urlencoded'){
      return send(response,415,{error:'unsupported_type'});
    }
    if(!channels.telegram&&!channels.email)return send(response,503,{error:'not_configured'});

    const ip=String(request.headers['x-real-ip']??'-');
    const hits=countHit(ip);
    if(hits>HARD_LIMIT)return send(response,429,{error:'too_many_requests'});

    let body;
    try{
      body=parseBody(await readBody(request),type);
    }catch(error){
      return error instanceof BodyTooLarge?send(response,413,{error:'too_large'}):send(response,400,{error:'invalid_body'});
    }
    const lead=parseLead(body,randomUUID);
    if(!lead)return send(response,400,{error:'invalid_fields'});

    const created=store.save(lead,{now:clock(),held:hits>SOFT_LIMIT,sender:sender(ip)});
    // Форма без JavaScript: браузер возвращается на страницу, а не показывает JSON.
    if(type==='application/x-www-form-urlencoded'){
      response.writeHead(303,{location:'/?lead=sent#contact','cache-control':'no-store'});
      response.end();
    }else{
      send(response,created?201:200,{saved:true,id:lead.id});
    }
    if(created)delivery.run().catch(error=>log.error('delivery run failed',String(error?.message??'error').slice(0,100)));
  }

  return (request,response)=>{
    const path=new URL(request.url,'http://localhost').pathname;
    if(path==='/health'&&request.method==='GET'){
      return send(response,200,{
        status:'ok',telegram:Boolean(channels.telegram),email:Boolean(channels.email),...store.counts()
      });
    }
    if(path!=='/api/lead')return send(response,404,{error:'not_found'});
    if(request.method!=='POST')return send(response,405,{error:'method_not_allowed'});
    accept(request,response).catch(error=>{
      log.error('intake failed',String(error?.message??'error').slice(0,100));
      if(!response.headersSent)send(response,503,{error:'storage_unavailable'});
    });
  };
}
