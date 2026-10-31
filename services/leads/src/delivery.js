// Очередь доставки. Несработавший канал повторяется, пока не получится; заявка из базы не исчезает.
import {emailMessage,heldSummary,telegramText} from './lead.js';

export function createDelivery({store,channels,clock=Date.now,log=console}){
  let running=false,again=false;

  async function sendOne(row){
    const channel=channels[row.channel];
    // Канал ещё не настроен: заявка ждёт в базе и уйдёт после настройки.
    if(!channel)return;
    try{
      if(row.channel==='telegram')await channel(telegramText(row));
      else await channel(emailMessage(row),row.id);
      store.markSent(row.id,row.channel,clock());
    }catch(error){
      store.markFailed(row.id,row.channel,row.attempts,clock());
      log.error('delivery failed',row.id,row.channel,String(error?.message??'error').slice(0,100));
    }
  }

  async function sendHeldSummaries(){
    if(!channels.telegram)return;
    for(const group of store.heldGroups()){
      try{
        await channels.telegram(heldSummary(group));
        store.clearHeld(group.rows);
      }catch(error){
        log.error('held summary failed',String(error?.message??'error').slice(0,100));
      }
    }
  }

  async function run(){
    if(running){again=true;return;}
    running=true;
    try{
      do{
        again=false;
        await Promise.all(store.due(clock()).map(sendOne));
      }while(again);
    }finally{
      running=false;
    }
  }

  return {run,sendHeldSummaries};
}
