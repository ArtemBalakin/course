/* AB/digital contact form: POST /api/lead on our own server.
 * The server replies only after the lead is stored; Telegram and email delivery follow from there.
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
  let submitting=false;

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
      consent:form.querySelector('[name="consent"]')?.checked===true,
      company_site:text('company_site'),
      source:text('source'),landing:location.pathname,
      referrer:document.referrer.slice(0,500),
      utm_source:(query.get('utm_source')||'').slice(0,100),
      utm_medium:(query.get('utm_medium')||'').slice(0,100),
      utm_campaign:(query.get('utm_campaign')||'').slice(0,160),
      utm_content:(query.get('utm_content')||'').slice(0,160),
      utm_term:(query.get('utm_term')||'').slice(0,160)
    };
  }

  function withTimeout(url,options,ms=12000){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),ms);
    return fetch(url,{...options,signal:controller.signal}).finally(()=>clearTimeout(timer));
  }

  async function sendLead(fields){
    const response=await withTimeout(form.action,{
      method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(fields)
    });
    if(!response.ok)return false;
    const result=await response.json();
    return result.saved===true;
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
    window.abTrack?.('telegram_click');
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
    if(!('fetch' in window))return; // Native POST without JavaScript.
    event.preventDefault();
    if(submitting||!form.reportValidity())return;
    submitting=true;
    if(submit){submit.disabled=true;submit.setAttribute('aria-busy','true');}
    if(label)label.textContent=tr('Отправляем…');
    announce(tr('Отправляем заявку. Пожалуйста, подождите…'),'sending');

    const fields=currentFields();
    if(fields.id)form.dataset.requestId=fields.id;
    const saved=await sendLead(fields).catch(()=>false);

    window.abTrack?.(saved?'lead_submit':'lead_error');
    if(saved){
      form.reset();
      delete form.dataset.requestId;
      announce(tr('Заявка надёжно сохранена. Мы скоро свяжемся с вами.'),'success');
    }else{
      announce(tr('Не удалось подтвердить доставку заявки. Данные остались в форме. Используйте кнопку отправки в Telegram ниже.'),'error');
    }

    submitting=false;
    if(submit){submit.disabled=false;submit.removeAttribute('aria-busy');}
    if(label)label.textContent=tr('Отправить заявку');
  });
})();
