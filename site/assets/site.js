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
  // Browse the entire Latina Solo syllabus inside one dialog, without reopening cards.
  const lessonDialog=document.getElementById('lesson-dialog');
  if(lessonDialog&&typeof lessonDialog.showModal==='function'){
    const cards=[...document.querySelectorAll('[data-module]')];
    const title=lessonDialog.querySelector('#lesson-dialog-title');
    const subtitle=lessonDialog.querySelector('#lesson-dialog-subtitle');
    const number=lessonDialog.querySelector('#lesson-dialog-number');
    const visual=lessonDialog.querySelector('#lesson-dialog-visual');
    const content=lessonDialog.querySelector('#lesson-dialog-content');
    const close=lessonDialog.querySelector('.lesson-dialog-close');
    const toTariffs=lessonDialog.querySelector('.lesson-dialog-cta');
    const prev=lessonDialog.querySelector('.lesson-nav-prev');
    const next=lessonDialog.querySelector('.lesson-nav-next');
    const progress=lessonDialog.querySelector('#lesson-nav-progress');
    const jump=lessonDialog.querySelector('#lesson-dialog-jump');
    let activeIndex=0;
    let returnFocus=null;
    // Build the jump list from existing cards: works with 6 or 20+ stages.
    cards.forEach((card,index)=>{
      const option=document.createElement('option');
      option.value=String(index);
      option.textContent=(index+1)+'. '+(card.querySelector('.module-title')?.textContent||'Этап курса');
      jump.append(option);
    });
    const showStage=index=>{
      if(index<0||index>=cards.length)return;
      const card=cards[index];
      const template=document.getElementById('lesson-template-'+card.dataset.module);
      if(!template)return;
      activeIndex=index;
      const step=String(index+1);
      const total=String(cards.length);
      number.textContent=step.padStart(2,'0')+' / '+total.padStart(2,'0');
      visual.textContent=card.dataset.module;
      title.textContent=card.querySelector('.module-title')?.textContent||'Этап курса';
      subtitle.textContent=card.querySelector('.module-subtitle')?.textContent||'';
      content.replaceChildren(template.content.cloneNode(true));
      progress.textContent='Этап '+step+' из '+total;
      jump.value=String(index);
      prev.disabled=index===0;
      next.disabled=index===cards.length-1;
      // Keep the next/previous buttons visible after a long chapter.
      const scroller=lessonDialog.querySelector('.lesson-dialog-main');
      if(scroller)scroller.scrollTop=0;
      if(window.matchMedia('(max-width: 700px)').matches){
        const shell=lessonDialog.querySelector('.lesson-dialog-shell');
        if(shell)shell.scrollTop=0;
      }
    };
    cards.forEach((card,index)=>card.addEventListener('click',()=>{
      returnFocus=card;
      showStage(index);
      lessonDialog.showModal();
      close.focus();
    }));
    prev.addEventListener('click',()=>showStage(activeIndex-1));
    next.addEventListener('click',()=>showStage(activeIndex+1));
    jump.addEventListener('change',()=>showStage(Number(jump.value)));
    lessonDialog.addEventListener('keydown',event=>{
      if(event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return;
      const element=event.target;
      if(element instanceof HTMLElement&&element.closest('select,input,textarea,[contenteditable="true"]'))return;
      if(event.key==='ArrowLeft'&&activeIndex>0){
        event.preventDefault();
        showStage(activeIndex-1);
      }else if(event.key==='ArrowRight'&&activeIndex<cards.length-1){
        event.preventDefault();
        showStage(activeIndex+1);
      }
    });
    close.addEventListener('click',()=>lessonDialog.close());
    toTariffs.addEventListener('click',()=>lessonDialog.close());
    lessonDialog.addEventListener('click',event=>{if(event.target===lessonDialog)lessonDialog.close()});
    lessonDialog.addEventListener('close',()=>{returnFocus?.focus({preventScroll:true})});
  }

})();
