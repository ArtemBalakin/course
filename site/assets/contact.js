/* AB/digital contact form: Formspree + optional Cloudflare Worker/D1 backup.
 * Credentials never reach the browser. Backup is disabled until configured.
 */
(function(){
  'use strict';
  const tr=value=>(window.AB_TRANSLATIONS&&window.AB_TRANSLATIONS[value])||value;
  const form=document.getElementById('ab-contact-form');
  if(!form)return;

  const submit=form.querySelector('button[type="submit"]');
  const label=submit?.querySelector('.contact-submit-label');
  const status=document.getElementById('ab-contact-status');
  const alternative=document.getElementById('ab-contact-telegram-copy');
  const config=window.AB_LEADS_CONFIG||{};
  const endpoint=typeof config.endpoint==='string'?config.endpoint.trim():'';
  const sitekey=typeof config.sitekey==='string'?config.sitekey.trim():'';
  const backupEnabled=/^https:\/\/[-a-z0-9.]+\/(api\/lead)$/.test(endpoint)&&sitekey.length>=16;
  let submitting=false,turnstileId=null,turnstileReady=false;

  function announce(message,state){
    if(!status)return;
    status.textContent=message;
    status.dataset.state=state||'idle';
    status.classList.toggle('is-ready',state==='success');
  }

  function currentFields(){
    const data=new FormData(form);
    const query=new URLSearchParams(location.search);
    const text=k=>String(data.get(k)||'').trim();
    return {
      id:form.dataset.requestId || (window.crypto?.randomUUID?window.crypto.randomUUID():''),
      name:text('name'),contact:text('contact'),service:text('service'),details:text('details'),
      consent:data.get('consent')==='Да',
      source:text('source'),landing:location.pathname,
      referrer:document.referrer.slice(0,500),
      utm_source:(query.get('utm_source')||'').slice(0,100),
      utm_medium:(query.get('utm_medium')||'').slice(0,100),
      utm_campaign:(query.get('utm_campaign')||'').slice(0,160),
      utm_content:(query.get('utm_content')||'').slice(0,160),
      utm_term:(query.get('utm_term')||'').slice(0,160)
    };
  }

  if(backupEnabled){
    const widget=document.createElement('div');
    widget.className='contact-turnstile';
    widget.id='ab-contact-turnstile';
    const before=submit||status;
    if(before)form.insertBefore(widget,before);
    const script=document.createElement('script');
    script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async=true;
    script.defer=true;
    script.onload=()=>{
      if(!window.turnstile)return;
      try{
        turnstileId=window.turnstile.render(widget,{sitekey,theme:'light'});
        turnstileReady=true;
      }catch(_ignored){turnstileReady=false;}
    };
    document.head.appendChild(script);
  }

  function withTimeout(url,options,ms=12000){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),ms);
    return fetch(url,{...options,signal:controller.signal}).finally(()=>clearTimeout(timer));
  }

  function sendFormspree(fields){
    const body=new FormData(form);
    if(fields.id)body.set('request_id',fields.id);
    ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','landing','referrer'].forEach(k=>{
      if(fields[k])body.set(k,fields[k]);
    });
    return withTimeout(form.action,{
      method:'POST',body,headers:{Accept:'application/json'}
    }).then(response=>response.ok);
  }

  function sendBackup(fields){
    if(!backupEnabled||!turnstileReady||!window.turnstile)return Promise.resolve(false);
    const token=window.turnstile.getResponse(turnstileId);
    if(!token)return Promise.resolve(false);
    return withTimeout(endpoint,{
      method:'POST',headers:{'content-type':'application/json'},
      body:JSON.stringify({...fields,turnstile_token:token})
    }).then(async response=>{
      if(!response.ok)return false;
      const result=await response.json();
      return result.saved===true;
    });
  }

  async function copyTelegramText(){
    const f=currentFields();
    if(!f.name||!f.contact||!f.details){announce(tr('Сначала заполните имя, контакт и описание задачи.'),'error');return;}
    const message=[
      'Заявка AB/digital','Имя: '+f.name,'Контакт: '+f.contact,
      'Услуга: '+f.service,'Задача: '+f.details,
      'Источник: '+f.source,'UTM: '+[f.utm_source,f.utm_medium,f.utm_campaign].filter(Boolean).join(' / ')
    ].join('\n');
    // Open synchronously to avoid popup blockers; the customer must paste and send.
    window.open('https://t.me/ArtemBalakin','_blank','noopener,noreferrer');
    try{
      await navigator.clipboard.writeText(message);
      announce(tr('Текст заявки скопирован. Вставьте его в чат Telegram и отправьте.'),'idle');
    }catch{
      announce(tr('Telegram открыт. Скопируйте описание задачи из формы и отправьте его в чат.'),'idle');
    }
  }

  alternative?.addEventListener('click',copyTelegramText);

  form.addEventListener('submit',async function(event){
    if(!('fetch' in window))return; // Native Formspree POST without JavaScript.
    event.preventDefault();
    if(submitting||!form.reportValidity())return;
    submitting=true;
    if(submit){submit.disabled=true;submit.setAttribute('aria-busy','true');}
    if(label)label.textContent=tr('Отправляем…');
    announce(tr('Отправляем заявку. Пожалуйста, подождите…'),'sending');

    const fields=currentFields();
    if(fields.id)form.dataset.requestId=fields.id;
    const outcomes=await Promise.allSettled([sendFormspree(fields),sendBackup(fields)]);
    const primary=outcomes[0].status==='fulfilled'&&outcomes[0].value===true;
    const backup=outcomes[1].status==='fulfilled'&&outcomes[1].value===true;

    if(backup){
      form.reset();
      delete form.dataset.requestId;
      announce(primary?
        tr('Заявка сохранена и отправлена по двум независимым каналам. Мы скоро свяжемся с вами.'):
        tr('Заявка надёжно сохранена. Мы скоро свяжемся с вами.'),'success');
    }else if(primary){
      form.reset();
      delete form.dataset.requestId;
      announce(backupEnabled?
        tr('Formspree принял заявку, но резервный канал не подтвердил сохранение. Для надёжности напишите нам в Telegram.'):
        tr('Formspree принял заявку. Если ответ задержится, напишите нам в Telegram: @ArtemBalakin.'),'success');
    }else{
      announce(tr('Не удалось подтвердить доставку заявки. Данные остались в форме. Используйте кнопку отправки в Telegram ниже.'),'error');
    }

    if(turnstileReady&&window.turnstile){
      try{window.turnstile.reset(turnstileId);}catch(_ignored){}
    }
    submitting=false;
    if(submit){submit.disabled=false;submit.removeAttribute('aria-busy');}
    if(label)label.textContent=tr('Отправить заявку');
  });
})();
