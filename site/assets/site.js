(function(){
  'use strict';
  // Перевод динамических строк: на /kk/ страницах словарь подключается файлом i18n-*.js до site.js.
  const tr=value=>(window.AB_TRANSLATIONS&&window.AB_TRANSLATIONS[value])||value;
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
  // Коды тарифов совпадают с ботом: кнопка оплаты открывает @DanceCoursebot сразу на карточке тарифа.
  const plans={self:{title:'SELF DANCE',description:'Самостоятельные занятия: уроки по порядку, без дат открытия. Доступ к материалам на 2 месяца с даты оплаты.',price:'12 990 ₸'},dwm:{title:'DANCE WITH ME',description:'Обучение в потоке 4 недели: новые уроки каждую неделю, общий чат и ответы Сабины три раза в неделю. Доступ на 2 месяца со старта потока.',price:'19 990 ₸'},vip:{title:'VIP LATINA',description:'Всё из DANCE WITH ME, разбор видео в конце каждой недели и личный чат с Сабиной 4 недели. Доступ на 2 месяца со старта потока.',price:'39 990 ₸'}};
  const legacyPlans={feedback:'dwm',personal:'vip'};
  const botUrl=code=>'https://t.me/DanceCoursebot?start=site_'+(document.documentElement.lang==='kk'?'kk_':'')+code;
  const buttons=[...document.querySelectorAll('[data-plan]')];
  if(buttons.length){
    const params=new URLSearchParams(location.search);const requested=legacyPlans[params.get('plan')]||params.get('plan');let selected=plans[requested]?requested:'self';
    const title=document.querySelector('#selected-plan-title');
    const desc=document.querySelector('#selected-plan-desc');
    const price=document.querySelector('#selected-plan-price');
    const pay=document.querySelector('#checkout-pay');
    const payAlt=document.querySelector('#checkout-pay-telegram');
    const payError=document.querySelector('#checkout-error');
    if(pay){pay.addEventListener('click',async()=>{
      pay.disabled=true;if(payError)payError.hidden=true;
      try{
        const res=await fetch('/api/site/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({tariff:selected,lang:document.documentElement.lang==='kk'?'kk':'ru'})});
        const data=await res.json().catch(()=>({}));
        if(!res.ok||!data.paymentUrl)throw new Error(data.error||'');
        try{sessionStorage.setItem('sabina-order',data.orderId)}catch(e){}
        location.href=data.paymentUrl;
      }catch(e){
        if(payError){payError.textContent=e.message||tr('Не удалось открыть страницу оплаты. Попробуйте ещё раз или оплатите через Telegram-бота.');payError.hidden=false}
        pay.disabled=false;
      }
    })}
    const render=()=>{buttons.forEach(b=>{const active=b.dataset.plan===selected;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});title.textContent=plans[selected].title;desc.textContent=tr(plans[selected].description);if(price)price.textContent=plans[selected].price;if(pay){pay.textContent=tr('Оплатить ')+plans[selected].price;if(payAlt)payAlt.href=botUrl(selected);}history.replaceState({},'',location.pathname+'?plan='+encodeURIComponent(selected));};
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
    // The introduction is not a numbered module: stages are counted without it.
    const isIntro=card=>card.dataset.intro==='true';
    const stageNumber=index=>cards.slice(0,index+1).filter(card=>!isIntro(card)).length;
    const stageTotal=cards.filter(card=>!isIntro(card)).length;
    cards.forEach((card,index)=>{
      const option=document.createElement('option');
      option.value=String(index);
      const label=card.querySelector('.module-title')?.textContent||tr('Этап курса');
      option.textContent=isIntro(card)?label:stageNumber(index)+'. '+label;
      jump.append(option);
    });
    const showStage=index=>{
      if(index<0||index>=cards.length)return;
      const card=cards[index];
      const template=document.getElementById('lesson-template-'+card.dataset.module);
      if(!template)return;
      activeIndex=index;
      const intro=isIntro(card);
      const step=String(stageNumber(index));
      const total=String(stageTotal);
      number.textContent=intro?tr('Введение').toUpperCase():step.padStart(2,'0')+' / '+total.padStart(2,'0');
      visual.textContent=card.dataset.module;
      title.textContent=card.querySelector('.module-title')?.textContent||tr('Этап курса');
      subtitle.textContent=card.querySelector('.module-subtitle')?.textContent||'';
      content.replaceChildren(template.content.cloneNode(true));
      progress.textContent=intro?tr('Введение'):tr('Этап ')+step+tr(' из ')+total;
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

// Страница результата оплаты: показывает статус заказа и ведёт в бота, который привяжет оплату к аккаунту Telegram.
(()=>{
  const tr=value=>(window.AB_TRANSLATIONS&&window.AB_TRANSLATIONS[value])||value;
  const box=document.querySelector('[data-order-result]');
  if(!box)return;
  const params=new URLSearchParams(location.search);let order=params.get('o');
  if(!order){try{order=sessionStorage.getItem('sabina-order')}catch(e){}}
  const title=box.querySelector('[data-result-title]');
  const text=box.querySelector('[data-result-text]');
  const link=box.querySelector('[data-result-bot]');
  const bot=order?'https://t.me/DanceCoursebot?start=claim_'+encodeURIComponent(order):'https://t.me/DanceCoursebot';
  link.href=bot;
  const states={
    PAID:['Оплата получена','Спасибо! Нажмите кнопку ниже: бот привяжет оплату к вашему аккаунту Telegram и откроет доступ к курсу.',true],
    PENDING:['Проверяем оплату','Платёж ещё обрабатывается. Страница обновится сама, это занимает не больше минуты.',false],
    CREATED:['Проверяем оплату','Платёж ещё обрабатывается. Страница обновится сама, это занимает не больше минуты.',false],
    ERROR:['Оплата не прошла','Деньги не списаны или будут возвращены банком. Вернитесь к тарифам и попробуйте ещё раз.',false],
    EXPIRED:['Срок оплаты истёк','Вернитесь к тарифам и оформите заказ заново.',false]
  };
  let tries=0;
  const show=status=>{
    const s=states[status]||states.PENDING;
    title.textContent=tr(s[0]);text.textContent=tr(s[1]);link.hidden=!s[2];
  };
  const poll=async()=>{
    if(!order){show('PENDING');text.textContent=tr('Не нашли номер заказа. Если вы оплатили курс, откройте бота: он найдёт заказ.');link.hidden=false;return}
    try{
      const res=await fetch('/api/site/checkout/'+encodeURIComponent(order));
      const data=await res.json();
      show(data.status);
      if((data.status==='PENDING'||data.status==='CREATED')&&++tries<30)setTimeout(poll,4000);
    }catch(e){show('PENDING');if(++tries<30)setTimeout(poll,6000)}
  };
  show('PENDING');poll();
})();
