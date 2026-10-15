/* The two Render hosts share static files. The preview host forwards browser traffic
   to the indexed main host. This is NOT an HTTP 301 response. */
(function(){
  'use strict';
  if(location.hostname!=='ab-digital-preview.onrender.com')return;
  const noindex=document.createElement('meta');
  noindex.name='robots';noindex.content='noindex,nofollow';
  document.head.appendChild(noindex);
  location.replace('https://ab-digital.onrender.com'+location.pathname+location.search+location.hash);
})();
