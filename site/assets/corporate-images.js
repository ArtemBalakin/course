/* On slow connections, keep a branded preview until each corporate screenshot fully decodes. */
(function(){
  'use strict';
  const shots=document.querySelectorAll('.corporate-case-shot');
  if(!shots.length)return;
  shots.forEach(shot=>{
    const img=shot.querySelector('img');
    if(!img)return;
    const ready=()=>{shot.classList.add('is-ready');shot.classList.remove('is-error')};
    const failed=()=>{shot.classList.add('is-error');shot.classList.remove('is-ready')};
    img.addEventListener('load',ready);
    img.addEventListener('error',failed);
    if(img.complete){
      if(img.naturalWidth>0)ready();
      else failed();
    }
  });
  document.documentElement.classList.add('js');
})();
