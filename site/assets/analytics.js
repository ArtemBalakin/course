/* Public Metrica counter. No form values or session recording. */
(function(){
 'use strict';
 if(location.hostname!=='ab-digital.kz'&&location.hostname!=='www.ab-digital.kz')return;
 const id=113830797;
 window.ym=window.ym||function(){(window.ym.a=window.ym.a||[]).push(arguments)};
 window.ym.l=Date.now();
 const script=document.createElement('script');script.async=true;script.src='https://mc.yandex.ru/metrika/tag.js';document.head.appendChild(script);
 // Query strings and fragments can contain customer data; omit them from page URLs.
 const safeUrl=location.origin+location.pathname;
 let safeRef='';try{const r=new URL(document.referrer);safeRef=r.origin+r.pathname}catch{}
 window.ym(id,'init',{clickmap:false,trackLinks:false,accurateTrackBounce:true,webvisor:false,trackHash:false,defer:true});
 window.ym(id,'hit',safeUrl,{referer:safeRef,title:document.title});
 const allowed=new Set(['telegram_click','lead_submit','lead_error','service_open']);
 window.abTrack=function(name){if(allowed.has(name))window.ym(id,'reachGoal',name)};
 document.addEventListener('click',function(event){const a=event.target.closest?.('a[href]');if(!a)return;let u;try{u=new URL(a.href,location.href)}catch{return}if(u.hostname==='t.me'&&u.pathname==='/ArtemBalakin')window.abTrack('telegram_click');else if(u.origin===location.origin&&u.pathname.startsWith('/services/'))window.abTrack('service_open')});
})();
