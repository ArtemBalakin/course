/* AB/digital homepage motion. No dependencies; progressive enhancement only. */
(function(){
  'use strict';
  if(!document.body || document.body.dataset.page!=='home')return;
  const root=document.documentElement;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  if(reduced.matches)return;

  // The reading indicator needs one rAF per frame at most.
  const bar=document.querySelector('.ab-read-progress');
  const path=document.querySelector('.ab-workflow-path');
  const nodes=path?[...path.querySelectorAll('.ab-workflow-node')]:[];
  let pending=false;
  const clamp=n=>Math.max(0,Math.min(1,n));
  const updateScroll=()=>{
    pending=false;
    const maxScroll=Math.max(0,root.scrollHeight-window.innerHeight);
    if(bar)bar.style.setProperty('--ab-read',String(maxScroll?clamp(window.scrollY/maxScroll):0));
    if(!path || !path.isConnected)return;
    const r=path.getBoundingClientRect();
    const activation=window.innerHeight*.66;
    // A filled path visually connects only the steps that have been reached.
    const progress=clamp((activation-r.top)/Math.max(1,r.height-24));
    path.style.setProperty('--ab-flow-progress',String(progress));
    nodes.forEach(node=>{
      const marker=node.querySelector('.ab-workflow-node-marker');
      if(marker)node.classList.toggle('ab-flow-active',marker.getBoundingClientRect().top<activation);
    });
  };
  const requestScroll=()=>{
    if(pending)return;
    pending=true;
    window.requestAnimationFrame(updateScroll);
  };
  window.addEventListener('scroll',requestScroll,{passive:true});
  window.addEventListener('resize',requestScroll,{passive:true});
  requestScroll();

  // Reveals are enabled only when the observer exists, avoiding hidden content on old browsers.
  if('IntersectionObserver' in window){
    const selectors=[
      '.ab-cap-kicker','.ab-cap-signature','.ab-cap-item',
      '.solutions-section .section-kicker','.solutions-header','.solution-showcase',
      '.project-section .section-kicker','.project-section .section-head','.project-feature',
      '.corporate-section .section-kicker','.corporate-intro','.corporate-card',
      '.ab-workflow-kicker','.ab-workflow-intro','.ab-workflow-node',
      '.home-contact .wrap'
    ];
    const elements=[...document.querySelectorAll(selectors.join(','))];
    elements.forEach(element=>{
      element.classList.add('ab-motion-reveal');
      if(element.classList.contains('ab-cap-item')){
        const i=[...element.parentElement.querySelectorAll('.ab-cap-item')].indexOf(element);
        element.style.setProperty('--ab-stagger',Math.min(180,i*75)+'ms');
      }
      if(element.classList.contains('ab-workflow-node')){
        element.style.setProperty('--ab-stagger','0ms');
      }
    });
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        entry.target.classList.add('ab-inview');
        observer.unobserve(entry.target);
      });
    },{threshold:0.08,rootMargin:'0px 0px -4% 0px'});
    elements.forEach(element=>observer.observe(element));
    root.classList.add('ab-motion-ready');
  }

  // Pointer glow and gentle hero parallax, only for precise hover devices.
  if(window.matchMedia('(hover: hover) and (pointer: fine)').matches){
    document.querySelectorAll('.ab-cap-item,.solution-showcase,.corporate-card').forEach(card=>{
      card.addEventListener('pointermove',event=>{
        const bounds=card.getBoundingClientRect();
        card.style.setProperty('--ab-mx',((event.clientX-bounds.left)/bounds.width*100).toFixed(1)+'%');
        card.style.setProperty('--ab-my',((event.clientY-bounds.top)/bounds.height*100).toFixed(1)+'%');
      },{passive:true});
    });
    const hero=document.querySelector('.home-hero');
    const art=hero?.querySelector('.home-art');
    if(hero&&art){
      hero.addEventListener('pointermove',event=>{
        const r=hero.getBoundingClientRect();
        const x=clamp((event.clientX-r.left)/r.width);
        const y=clamp((event.clientY-r.top)/r.height);
        art.style.setProperty('--ab-art-x',((x-.5)*14).toFixed(1)+'px');
        art.style.setProperty('--ab-art-y',((y-.5)*11).toFixed(1)+'px');
      },{passive:true});
      hero.addEventListener('pointerleave',()=>{
        art.style.setProperty('--ab-art-x','0px');
        art.style.setProperty('--ab-art-y','0px');
      });
    }
  }

  // No needless animation work when this browser tab is hidden.
  document.addEventListener('visibilitychange',()=>{
    root.classList.toggle('ab-motion-paused',document.hidden);
    if(!document.hidden)requestScroll();
  });
})();
