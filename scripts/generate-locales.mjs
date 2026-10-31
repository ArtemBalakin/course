/* Builds pre-rendered, crawlable RU / KK / EN versions of the studio homepage.
 * Source: scripts/templates/home.ru.html. Translations: scripts/i18n/*.json.
 * Usage: node scripts/generate-locales.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root=process.cwd();
const template=fs.readFileSync(path.join(root,'scripts/templates/home.ru.html'),'utf8');
const domain='https://ab-digital.kz';
const ogImage=domain+'/assets/og-image.png';
const ogImageAlt='AB/digital: Telegram bots, Mini Apps, websites';
const email='admin@ab-digital.kz';
const locales={
 ru:{lang:'ru',path:'/',title:'Разработка Telegram-ботов, Mini Apps и сайтов в Алматы | AB/digital',
  description:'Разрабатываем Telegram-ботов, Mini Apps, сайты и backend-системы для бизнеса в Алматы и Казахстане. Дизайн, интеграции, запуск и поддержка.',
  ogLocale:'ru_RU',switchTitle:'Язык сайта'},
 kk:{lang:'kk',path:'/kk/',title:'Алматыда Telegram-бот, Mini App және сайт әзірлеу | AB/digital',
  description:'Алматы мен Қазақстандағы бизнеске Telegram-боттар, Mini Apps, сайттар және backend жүйелері. Дизайн, интеграциялар, іске қосу және қолдау.',
  ogLocale:'kk_KZ',switchTitle:'Сайт тілі'},
 en:{lang:'en',path:'/en/',title:'Telegram Bots, Mini Apps & Website Development in Kazakhstan | AB/digital',
  description:'We build Telegram bots, Mini Apps, websites and backend systems for businesses in Almaty and Kazakhstan. Design, integrations, launch and support.',
  ogLocale:'en_US',switchTitle:'Site language'}
};

const escapeText=x=>x.replaceAll('&','&amp;').replaceAll('<','&lt;');
const escapeAttr=x=>escapeText(x).replaceAll('"','&quot;');
const jsonForHtml=x=>JSON.stringify(x).replace(/</g,'\\u003c');

function translateHtml(input,strings){
  let source=input.replace(/>([^<>]+)</g,(ent,text)=>{
    const trimmed=text.trim();
    if(!trimmed || !Object.prototype.hasOwnProperty.call(strings,trimmed))return ent;
    return '>'+text.replace(trimmed,escapeText(strings[trimmed]))+'<';
  });
  source=source.replace(/\b(aria-label|alt|placeholder|value)="([^"]*)"/g,(match,name,value)=>
    Object.prototype.hasOwnProperty.call(strings,value)? name+'="'+escapeAttr(strings[value])+'"':match
  );
  return source;
}

function headMetadata(locale){
  const u=domain+locale.path;
  const links=Object.values(locales).map(l=>'<link rel="alternate" hreflang="'+l.lang+'" href="'+domain+l.path+'">').join('')+
    '<link rel="alternate" hreflang="x-default" href="'+domain+'/">';
  const organization={
    '@context':'https://schema.org','@type':'Organization','@id':domain+'/#organization',
    name:'AB/digital',url:domain+'/',description:locale.description,email,
    areaServed:[{'@type':'Country',name:'Kazakhstan'},{'@type':'City',name:'Almaty'}],
    availableLanguage:['ru','kk','en'],
    sameAs:['https://github.com/ArtemBalakin'],
    contactPoint:[{'@type':'ContactPoint',contactType:'sales',url:'https://t.me/ArtemBalakin',email}]
  };
  const website={'@context':'https://schema.org','@type':'WebSite','@id':u+'#website',
    name:'AB/digital',url:u,inLanguage:locale.lang,description:locale.description,publisher:{'@id':domain+'/#organization'}};
  return '<link rel="canonical" href="'+u+'">'+links+
    '<meta property="og:type" content="website">'+
    '<meta property="og:site_name" content="AB/digital">'+
    '<meta property="og:locale" content="'+locale.ogLocale+'">'+
    '<meta property="og:title" content="'+escapeAttr(locale.title)+'">'+
    '<meta property="og:description" content="'+escapeAttr(locale.description)+'">'+
    '<meta property="og:url" content="'+u+'">'+
    '<meta property="og:image" content="'+ogImage+'">'+
    '<meta property="og:image:width" content="1200">'+
    '<meta property="og:image:height" content="630">'+
    '<meta property="og:image:alt" content="'+ogImageAlt+'">'+
    '<meta name="twitter:card" content="summary_large_image">'+
    '<meta name="twitter:title" content="'+escapeAttr(locale.title)+'">'+
    '<meta name="twitter:description" content="'+escapeAttr(locale.description)+'">'+
    '<meta name="twitter:image" content="'+ogImage+'">'+
    '<script type="application/ld+json">'+jsonForHtml(organization)+'</script>'+
    '<script type="application/ld+json">'+jsonForHtml(website)+'</script>';
}

function languageSwitcher(current){
  const switcher=Object.values(locales).map(l=>{
    const label={ru:'RU',kk:'ҚАЗ',en:'EN'}[l.lang];
    return '<a href="'+l.path+'" data-switch-lang="'+l.lang+'" hreflang="'+l.lang+'" lang="'+l.lang+'"'+
      (current.lang===l.lang?' aria-current="page"':'')+'>'+label+'</a>';
  }).join('');
  return '<nav class="lang-switch" aria-label="'+current.switchTitle+'">'+switcher+'</nav>';
}

const outFiles=[];
for(const locale of Object.values(locales)){
  const dictionary=locale.lang==='ru'?{}:JSON.parse(fs.readFileSync(path.join(root,'scripts/i18n/'+locale.lang+'.json'),'utf8'));
  let html=translateHtml(template,dictionary);
  if(locale.lang!=='ru') html=html.replaceAll('href="/services/','href="'+locale.path+'services/');
  html=html.replace('<html lang="ru">','<html lang="'+locale.lang+'">');
  html=html.replace(/<meta name="description" content="[^"]+">/,
    '<meta name="description" content="'+escapeAttr(locale.description)+'">');
  html=html.replace('<meta name="robots" content="noindex,nofollow">','<meta name="robots" content="index,follow,max-image-preview:large">');
  html=html.replace(/<title>[^<]+<\/title>/,'<title>'+escapeText(locale.title)+'</title>');
  if(locale.lang==='kk') html=html.replace('</head>','<link rel="stylesheet" href="/assets/sabina-kk-font.css?v=20261035"></head>');
  html=html.replace('</head>',headMetadata(locale)+'<script src="/assets/preview-redirect.js"></script></head>');
  // Rewrite navigation links before inserting the locale switcher. Otherwise the
  // global href="/" rewrite mistakenly changes the RU option on /kk/ and /en/.
  html=html.replaceAll('href="/#','href="'+locale.path+'#');
  html=html.replaceAll('href="/"','href="'+locale.path+'"');
  html=html.replace('<button class="nav-toggle"',languageSwitcher(locale)+'<button class="nav-toggle"');
  html=html.replace('</body>','</body>');
  if(locale.lang!=='ru'){
    html=html.replace('<script src="/assets/site.js" defer></script>',
      '<script src="/assets/i18n-'+locale.lang+'.js?v=20261015" defer></script><script src="/assets/site.js" defer></script>');
    // Verify that every Russian source phrase has an explicit translation.
    // Kazakh uses Cyrillic too, so looking for Cyrillic in the output is incorrect.
    const untranslatedTexts=[...template.matchAll(/>([^<>]+)</g)].map(m=>m[1].trim())
      .filter(s=>/[А-Яа-яЁё]/.test(s) && s!=='AB/digital — сайты, Telegram Mini Apps и backend-разработка' && !Object.prototype.hasOwnProperty.call(dictionary,s));
    const untranslatedAttrs=[...template.matchAll(/\b(?:aria-label|alt|placeholder)="([^"]+)"/g)].map(m=>m[1])
      .filter(s=>/[А-Яа-яЁё]/.test(s) && !Object.prototype.hasOwnProperty.call(dictionary,s));
    if(untranslatedTexts.length||untranslatedAttrs.length)throw new Error(locale.lang+' missing translations: '+
      JSON.stringify({untranslatedTexts:[...new Set(untranslatedTexts)],untranslatedAttrs:[...new Set(untranslatedAttrs)]}).slice(0,3000));
    fs.writeFileSync(path.join(root,'site/assets/i18n-'+locale.lang+'.js'),'window.AB_TRANSLATIONS='+jsonForHtml(dictionary)+';\n');
    outFiles.push('site/assets/i18n-'+locale.lang+'.js');
  }
  const target=path.join(root,'site',locale.lang==='ru'?'index.html':locale.lang+'/index.html');
  fs.mkdirSync(path.dirname(target),{recursive:true});
  fs.writeFileSync(target,html);
  outFiles.push(path.relative(root,target));
}
// lastmod is the page's last commit date, or today while the page has uncommitted changes.
const lastmod=urlPath=>{
  const file='site'+urlPath+'index.html';
  const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
  const date=git('status','--porcelain','--',file)?'':git('log','-1','--format=%cs','--',file);
  return '<lastmod>'+(date||new Date().toISOString().slice(0,10))+'</lastmod>';
};
const sitemap='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'+
  Object.values(locales).map(l=>'  <url><loc>'+domain+l.path+'</loc>'+lastmod(l.path)+
    Object.values(locales).map(other=>'<xhtml:link rel="alternate" hreflang="'+other.lang+'" href="'+domain+other.path+'"/>').join('')+
    '<xhtml:link rel="alternate" hreflang="x-default" href="'+domain+'/"/></url>').join('\n')+
  '\n'+['telegram-bots','website-development','telegram-mini-apps'].flatMap(slug=>{
    const servicePath=l=>(l.lang==='ru'?'':l.path.slice(0,-1))+'/services/'+slug+'/';
    const alternates=Object.values(locales).map(o=>'<xhtml:link rel="alternate" hreflang="'+o.lang+'" href="'+domain+servicePath(o)+'"/>').join('')+
      '<xhtml:link rel="alternate" hreflang="x-default" href="'+domain+'/services/'+slug+'/"/>';
    return Object.values(locales).map(l=>'  <url><loc>'+domain+servicePath(l)+'</loc>'+lastmod(servicePath(l))+alternates+'</url>');
  }).join('\n')+'\n</urlset>\n';
fs.writeFileSync(path.join(root,'site/sitemap.xml'),sitemap);
fs.writeFileSync(path.join(root,'site/robots.txt'),'User-agent: *\nAllow: /\n\nSitemap: '+domain+'/sitemap.xml\n');
outFiles.push('site/sitemap.xml','site/robots.txt');
console.log('Generated localized pages: '+outFiles.join(', '));
