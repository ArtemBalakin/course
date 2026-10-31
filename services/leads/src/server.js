// Приём заявок с формы ab-digital.kz. Без внешних зависимостей: только Node.js.
import http from 'node:http';
import {createHandler} from './app.js';
import {createChannels} from './channels.js';
import {createDelivery} from './delivery.js';
import {openStore} from './store.js';

const TICK_MS=30_000;
const env=process.env;

const config={
  port:Number(env.PORT||8091),
  dbPath:env.DB_PATH||'/data/leads.sqlite',
  allowedOrigins:(env.ALLOWED_ORIGINS||'https://ab-digital.kz,https://www.ab-digital.kz').split(',').map(x=>x.trim()).filter(Boolean),
  ipSalt:env.IP_SALT||'',
  telegramApi:env.TELEGRAM_API||'https://api.telegram.org',
  telegramToken:env.TELEGRAM_BOT_TOKEN||'',
  telegramChatId:env.TELEGRAM_CHAT_ID||'',
  resendApi:env.RESEND_API||'https://api.resend.com',
  resendKey:env.RESEND_API_KEY||'',
  mailFrom:env.MAIL_FROM||'',
  mailTo:env.MAIL_TO||'admin@ab-digital.kz'
};

const store=openStore(config.dbPath);
const channels=createChannels(config);
const delivery=createDelivery({store,channels});
const server=http.createServer(createHandler({config,store,delivery,channels}));

const logError=error=>console.error('tick failed',String(error?.message??'error').slice(0,100));
const tick=setInterval(()=>{
  delivery.run().catch(logError);
  delivery.sendHeldSummaries().catch(logError);
},TICK_MS);

server.listen(config.port,'0.0.0.0',()=>{
  console.log('leads service on',config.port,'telegram:',Boolean(channels.telegram),'email:',Boolean(channels.email));
  delivery.run().catch(logError);
});

function stop(){
  clearInterval(tick);
  server.close(()=>{
    store.close();
    process.exit(0);
  });
}
process.on('SIGTERM',stop);
process.on('SIGINT',stop);
