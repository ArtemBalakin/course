(function(){
  'use strict';
  const toggle=document.querySelector('.nav-toggle');
  const menu=document.querySelector('.mobile-nav');
  if(toggle&&menu){
    toggle.addEventListener('click',()=>{
      const open=toggle.getAttribute('aria-expanded')!=='true';
      toggle.setAttribute('aria-expanded',String(open));
      menu.hidden=!open;
    });
    menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.hidden=true;toggle.setAttribute('aria-expanded','false')}));
  }
  const plans={self:{title:'Для себя',description:'Самостоятельные занятия по видеозаписям.'},feedback:{title:'Вместе',description:'Видеоуроки и обратная связь по домашним заданиям (объём уточняется).'},personal:{title:'Индивидуально',description:'Видеоуроки и персональные разборы (условия уточняются).'}};
  const buttons=[...document.querySelectorAll('[data-plan]')];
  if(buttons.length){
    const params=new URLSearchParams(location.search);let selected=plans[params.get('plan')]?params.get('plan'):'self';
    const title=document.querySelector('#selected-plan-title');
    const desc=document.querySelector('#selected-plan-desc');
    const render=()=>{buttons.forEach(b=>{const active=b.dataset.plan===selected;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});title.textContent=plans[selected].title;desc.textContent=plans[selected].description;history.replaceState({},'',location.pathname+'?plan='+encodeURIComponent(selected));};
    buttons.forEach(b=>b.addEventListener('click',()=>{selected=b.dataset.plan;render()}));
    render();
  }
  // The course uses a native dialog for details; Escape/focus trapping are handled by the browser.
  const lessonDialog=document.getElementById('lesson-dialog');
  if(lessonDialog&&typeof lessonDialog.showModal==='function'){
    const triggers=[...document.querySelectorAll('[data-module]')];
    const title=lessonDialog.querySelector('#lesson-dialog-title');
    const subtitle=lessonDialog.querySelector('#lesson-dialog-subtitle');
    const number=lessonDialog.querySelector('#lesson-dialog-number');
    const visual=lessonDialog.querySelector('#lesson-dialog-visual');
    const content=lessonDialog.querySelector('#lesson-dialog-content');
    const close=lessonDialog.querySelector('.lesson-dialog-close');
    const toTariffs=lessonDialog.querySelector('.lesson-dialog-cta');
    let previousTrigger=null;
    triggers.forEach(button=>button.addEventListener('click',()=>{
      const id=button.dataset.module;
      const template=document.getElementById('lesson-template-'+id);
      if(!template)return;
      previousTrigger=button;
      number.textContent=id+' / 06';
      visual.textContent=id;
      title.textContent=button.querySelector('.module-title')?.textContent||'Этап курса';
      subtitle.textContent=button.querySelector('.module-subtitle')?.textContent||'';
      content.replaceChildren(template.content.cloneNode(true));
      lessonDialog.showModal();
      close.focus();
    }));
    close.addEventListener('click',()=>lessonDialog.close());
    toTariffs.addEventListener('click',()=>lessonDialog.close());
    lessonDialog.addEventListener('click',event=>{if(event.target===lessonDialog)lessonDialog.close()});
    lessonDialog.addEventListener('close',()=>{previousTrigger?.focus({preventScroll:true})});
  }

})();
