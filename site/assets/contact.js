/* Static AB/digital contact: prepare Telegram draft only. No server or automatic submission. */
(function(){
  'use strict';
  const form=document.getElementById('ab-contact-form');
  if(!form)return;
  const status=document.getElementById('ab-contact-status');
  form.addEventListener('submit',function(event){
    event.preventDefault();
    if(!form.reportValidity())return;
    const values=new FormData(form);
    const read=(key,max)=>String(values.get(key)||'').trim().slice(0,max);
    const name=read('name',80), contact=read('contact',120), service=read('service',70), details=read('details',1200);
    if(!name||!contact||!details)return;
    const message=['Здравствуйте, Артём! Заявка с сайта AB/digital.','','Имя: '+name,'Контакт: '+contact,'Направление: '+service,'','Задача:',details].join('\n');
    if(status){status.textContent='Открываем чат с подготовленным текстом. Проверьте заявку и нажмите «Отправить» в Telegram.';status.classList.add('is-ready')}
    window.location.assign('https://t.me/ArtemBalakin?text='+encodeURIComponent(message));
  });
})();
