/* AB/digital enquiries: submit directly to Formspree via JSON-aware AJAX.
   The native POST action remains a no-JavaScript fallback. */
(function(){
  'use strict';
  const form=document.getElementById('ab-contact-form');
  if(!form)return;

  const submit=form.querySelector('button[type="submit"]');
  const label=submit&&submit.querySelector('.contact-submit-label');
  const status=document.getElementById('ab-contact-status');
  let submitting=false;

  function announce(message,state){
    if(!status)return;
    status.textContent=message;
    status.dataset.state=state||'idle';
    status.classList.toggle('is-ready',state==='success');
  }

  form.addEventListener('submit',async function(event){
    if(!('fetch' in window))return; // Browser follows the native POST fallback.
    event.preventDefault();
    if(submitting||!form.reportValidity())return;
    submitting=true;
    if(submit){submit.disabled=true;submit.setAttribute('aria-busy','true')}
    if(label)label.textContent='Отправляем…';
    announce('Отправляем заявку. Пожалуйста, подождите…','sending');

    try{
      const result=await fetch(form.action,{
        method:'POST',
        body:new FormData(form),
        headers:{'Accept':'application/json'}
      });
      if(!result.ok){
        // Formspree may provide JSON field errors. Keep failure handling resilient
        // if it responds with an HTML error page or a non-JSON proxy response.
        let details='';
        try{
          const response=await result.json();
          if(response&&Array.isArray(response.errors)&&response.errors.length){
            details=String(response.errors[0].message||'').slice(0,300);
          }
        }catch(_ignored){}
        throw new Error(details||'Сервис не смог принять заявку. Попробуйте ещё раз.');
      }
      form.reset();
      announce('Готово! Заявка принята. Мы свяжемся с вами по указанному контакту.','success');
    }catch(error){
      announce('Не удалось отправить заявку. '+(error&&error.message?error.message:'Проверьте интернет-соединение и повторите попытку.')+' Если проблема повторится, напишите нам в Telegram: @ArtemBalakin.','error');
    }finally{
      submitting=false;
      if(submit){submit.disabled=false;submit.removeAttribute('aria-busy')}
      if(label)label.textContent='Отправить заявку';
    }
  });
})();
