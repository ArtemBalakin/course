// Каналы доставки. В логи не попадают ни токены, ни данные заявки.
const TIMEOUT_MS=8000;

function telegram(config,fetchImpl){
  const send=async text=>{
    const response=await fetchImpl(config.telegramApi+'/bot'+config.telegramToken+'/sendMessage',{
      method:'POST',headers:{'content-type':'application/json'},
      body:JSON.stringify({chat_id:config.telegramChatId,text,disable_web_page_preview:true}),
      signal:AbortSignal.timeout(TIMEOUT_MS)
    });
    if(!response.ok)throw new Error('telegram http '+response.status);
    const result=await response.json();
    if(result.ok!==true)throw new Error('telegram refused');
  };
  return send;
}

function resend(config,fetchImpl){
  return async(message,idempotencyKey)=>{
    const response=await fetchImpl(config.resendApi+'/emails',{
      method:'POST',
      headers:{
        'content-type':'application/json',
        authorization:'Bearer '+config.resendKey,
        'idempotency-key':idempotencyKey
      },
      body:JSON.stringify({
        from:config.mailFrom,to:[config.mailTo],subject:message.subject,text:message.text,
        ...(message.replyTo?{reply_to:message.replyTo}:{})
      }),
      signal:AbortSignal.timeout(TIMEOUT_MS)
    });
    if(!response.ok)throw new Error('resend http '+response.status);
  };
}

export function createChannels(config,fetchImpl=fetch){
  return {
    telegram:config.telegramToken&&config.telegramChatId?telegram(config,fetchImpl):null,
    email:config.resendKey&&config.mailFrom&&config.mailTo?resend(config,fetchImpl):null
  };
}
