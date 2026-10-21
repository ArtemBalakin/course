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
  const plans={self:{title:'SELF DANCE',description:'Самостоятельные занятия. Доступ к видео на три месяца.',price:'12 900 ₸'},feedback:{title:'DANCE WITH ME',description:'Общий чат, ответы Сабины дважды в неделю, видео на шесть месяцев.',price:'19 900 ₸'},personal:{title:'VIP LATINA',description:'Три индивидуальных видеоразбора, личный чат с Сабиной на четыре недели.',price:'34 900 ₸'}};
  const buttons=[...document.querySelectorAll('[data-plan]')];
  if(buttons.length){
    const params=new URLSearchParams(location.search);let selected=plans[params.get('plan')]?params.get('plan'):'self';
    const title=document.querySelector('#selected-plan-title');
    const desc=document.querySelector('#selected-plan-desc');
    const price=document.querySelector('#selected-plan-price');
    const render=()=>{buttons.forEach(b=>{const active=b.dataset.plan===selected;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});title.textContent=plans[selected].title;desc.textContent=plans[selected].description;if(price)price.textContent=plans[selected].price;history.replaceState({},'',location.pathname+'?plan='+encodeURIComponent(selected));};
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

  const tr=value=>(window.AB_TRANSLATIONS&&window.AB_TRANSLATIONS[value])||value;

  // Static portfolio gallery: images are stored with the site and require no bot or payment credentials.
  const showcaseDialog=document.getElementById('portfolio-gallery');
  if(showcaseDialog&&typeof showcaseDialog.showModal==='function'){
    const showcaseProjects={
      reminder:{title:'Мой дом',source:'https://github.com/ArtemBalakin/reminderBot',screens:[
        ['Главная — светлая тема','/assets/portfolio/reminder-today.webp'],
        ['Главная — тёмная тема','/assets/portfolio/reminder-night.webp'],
        ['Календарь задач','/assets/portfolio/reminder-calendar.webp'],
        ['Профиль и статистика','/assets/portfolio/reminder-profile.webp']
      ]},
      salon:{title:'Salon Booking',source:'https://github.com/ArtemBalakin/salon-booking-bot/tree/feature/miniapp-showcase',screens:[
        ['Выбор услуги','/assets/portfolio/salon-services.webp'],
        ['Выбор мастера','/assets/portfolio/salon-master.webp'],
        ['Дата и время','/assets/portfolio/salon-slots.webp'],
        ['Подтверждение записи','/assets/portfolio/salon-summary.webp']
      ]}
    };
    const viewerHeading=showcaseDialog.querySelector('#portfolio-viewer-heading');
    const viewerCaption=showcaseDialog.querySelector('#portfolio-viewer-caption');
    const viewerImage=showcaseDialog.querySelector('#portfolio-viewer-image');
    const viewerCount=showcaseDialog.querySelector('#portfolio-viewer-count');
    const viewerSource=showcaseDialog.querySelector('#portfolio-viewer-source');
    const thumbArea=showcaseDialog.querySelector('#portfolio-viewer-thumbs');
    const closeButton=showcaseDialog.querySelector('.portfolio-viewer-close');
    let activeProject='reminder',activeScreen=0,returnFocus=null;
    const updateViewer=()=>{
      const item=showcaseProjects[activeProject],screen=item.screens[activeScreen];
      viewerHeading.textContent=tr(item.title);
      viewerCaption.textContent=tr(screen[0]);
      viewerImage.src=screen[1];
      viewerImage.alt=tr(item.title)+' — '+tr(screen[0]);
      viewerCount.textContent=String(activeScreen+1).padStart(2,'0')+' / '+String(item.screens.length).padStart(2,'0');
      viewerSource.href=item.source;
      thumbArea.replaceChildren();
      item.screens.forEach((shot,i)=>{
        const button=document.createElement('button');
        button.type='button';
        button.className='portfolio-viewer-thumb';
        button.setAttribute('aria-label',tr(shot[0]));
        button.setAttribute('aria-pressed',String(i===activeScreen));
        const img=document.createElement('img');
        img.src=shot[1];img.alt='';img.width=500;img.height=1013;
        button.append(img);
        button.addEventListener('click',()=>{activeScreen=i;updateViewer()});
        thumbArea.append(button);
      });
    };
    const moveViewer=direction=>{
      const total=showcaseProjects[activeProject].screens.length;
      activeScreen=(activeScreen+direction+total)%total;
      updateViewer();
    };
    document.querySelectorAll('[data-gallery-project]').forEach(trigger=>trigger.addEventListener('click',event=>{
      const project=trigger.dataset.galleryProject;
      if(!showcaseProjects[project])return;
      event.preventDefault();
      returnFocus=trigger;
      activeProject=project;
      activeScreen=Math.min(Math.max(Number(trigger.dataset.galleryIndex)||0,0),showcaseProjects[project].screens.length-1);
      updateViewer();
      showcaseDialog.showModal();
      closeButton.focus();
    }));
    showcaseDialog.querySelector('.portfolio-viewer-prev').addEventListener('click',()=>moveViewer(-1));
    showcaseDialog.querySelector('.portfolio-viewer-next').addEventListener('click',()=>moveViewer(1));
    closeButton.addEventListener('click',()=>showcaseDialog.close());
    showcaseDialog.addEventListener('click',event=>{if(event.target===showcaseDialog)showcaseDialog.close()});
    showcaseDialog.addEventListener('keydown',event=>{
      if(event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return;
      if(event.target instanceof HTMLElement&&event.target.closest('input,textarea,select'))return;
      if(event.key==='ArrowLeft'){event.preventDefault();moveViewer(-1)}
      if(event.key==='ArrowRight'){event.preventDefault();moveViewer(1)}
    });
    showcaseDialog.addEventListener('close',()=>returnFocus?.focus({preventScroll:true}));
  }

})();
