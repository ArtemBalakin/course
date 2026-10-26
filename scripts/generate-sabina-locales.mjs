/* RU / KK versions of the Latina Solo by Sabina pages (course, checkout, legal).
 * Source of truth: the Russian pages in site/courses/sabina/ (edited by hand).
 * Translations: scripts/i18n/sabina-kk.json (Russian phrase -> Kazakh).
 * The script adds the RU/ҚАЗ switcher and hreflang links to the Russian pages (idempotent)
 * and writes the Kazakh pages to site/kk/courses/sabina/.
 * Usage: node scripts/generate-sabina-locales.mjs            build, fail on missing translations
 *        node scripts/generate-sabina-locales.mjs --missing  list phrases without translation
 */
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const domain='https://ab-digital.kz';
const pages=['index.html','checkout/index.html','legal/index.html','legal/offer/index.html',
  'legal/privacy/index.html','legal/refunds/index.html','legal/payment/index.html','legal/consent/index.html'];
const dictFile=path.join(root,'scripts/i18n/sabina-kk.json');
const dict=fs.existsSync(dictFile)?JSON.parse(fs.readFileSync(dictFile,'utf8')):{};
const MARK='data-sabina-i18n';

const escapeText=x=>x.replaceAll('&','&amp;').replaceAll('<','&lt;');
const escapeAttr=x=>escapeText(x).replaceAll('"','&quot;');
const decode=x=>x.replaceAll('&nbsp;','\u00a0').replaceAll('&quot;','"').replaceAll('&#039;',"'").replaceAll('&laquo;','«')
  .replaceAll('&raquo;','»').replaceAll('&mdash;','—').replaceAll('&ndash;','–').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&amp;','&');
const has=(k)=>Object.prototype.hasOwnProperty.call(dict,k);
const cyr=s=>/[А-Яа-яЁё]/.test(s);
const TRANSLATED_ATTRS=/\b(aria-label|alt|placeholder|title|content)="([^"]*)"/g;

/** Убирает вставки прошлого запуска, чтобы скрипт можно было запускать повторно. */
function stripGenerated(html){
  return html.replace(new RegExp('<nav class="lang-switch[^"]*" '+MARK+'[^>]*>.*?</nav>','gs'),'')
    .replace(new RegExp('<link rel="alternate" hreflang="[a-z-]+" href="[^"]*" '+MARK+'>','g'),'');
}

function textNodes(html){
  return [...html.matchAll(/>([^<>]+)</g)].map(m=>decode(m[1]).trim()).filter(s=>s&&cyr(s));
}
function attrValues(html){
  return [...html.matchAll(TRANSLATED_ATTRS)].map(m=>decode(m[2])).filter(s=>cyr(s));
}

function translate(html){
  let out=html.replace(/>([^<>]+)</g,(all,raw)=>{
    const key=decode(raw).trim();
    if(!key||!has(key))return all;
    const lead=raw.match(/^\s*/)[0], tail=raw.match(/\s*$/)[0];
    return '>'+lead+escapeText(dict[key])+tail+'<';
  });
  out=out.replace(TRANSLATED_ATTRS,(all,name,value)=>{
    const key=decode(value);
    return has(key)?name+'="'+escapeAttr(dict[key])+'"':all;
  });
  return out;
}

function urlOf(lang,page){
  const p='/courses/sabina/'+page.replace(/index\.html$/,'');
  return (lang==='kk'?'/kk':'')+p;
}

function decorate(html,lang,page){
  const ru=urlOf('ru',page), kk=urlOf('kk',page);
  const links='<link rel="alternate" hreflang="ru" href="'+domain+ru+'" '+MARK+'>'+
    '<link rel="alternate" hreflang="kk" href="'+domain+kk+'" '+MARK+'>'+
    '<link rel="alternate" hreflang="x-default" href="'+domain+ru+'" '+MARK+'>';
  const label=lang==='kk'?'Сайт тілі':'Язык сайта';
  const switcher='<nav class="lang-switch sabina-lang" '+MARK+' aria-label="'+label+'">'+
    '<a href="'+ru+'" hreflang="ru" lang="ru"'+(lang==='ru'?' aria-current="page"':'')+'>RU</a>'+
    '<a href="'+kk+'" hreflang="kk" lang="kk"'+(lang==='kk'?' aria-current="page"':'')+'>ҚАЗ</a></nav>';
  let out=html.replace('</head>',links+'</head>');
  // курс и оформление - перед кнопкой в шапке; документы - перед ссылкой «На курс»
  const at=out.match(/<a [^>]*class="course-nav-cta"[^>]*>|<a class="s-legal-back"/);
  if(!at)throw new Error('no place for the language switcher in '+page);
  return out.replace(at[0],switcher+at[0]);
}

const missing=new Set();
const written=[];
for(const page of pages){
  const file=path.join(root,'site/courses/sabina',page);
  const source=stripGenerated(fs.readFileSync(file,'utf8'));
  [...textNodes(source),...attrValues(source)].filter(s=>!has(s)).forEach(s=>missing.add(s));
  if(process.argv.includes('--missing'))continue;

  fs.writeFileSync(file,decorate(source,'ru',page));
  written.push(path.relative(root,file));

  let kk=translate(source);
  kk=kk.replace('<html lang="ru">','<html lang="kk">');
  kk=kk.replaceAll('href="/courses/sabina/','href="/kk/courses/sabina/').replaceAll('href="/"','href="/kk/"');
  // кнопка оплаты ведёт в бота с меткой kk, чтобы в статистике было видно казахскую версию сайта
  kk=kk.replaceAll('?start=site_','?start=site_kk_');
  kk=kk.replace(/<script src="\/assets\/site\.js(\?[^"]*)?" defer><\/script>/,
    m=>'<script src="/assets/i18n-sabina-kk.js?v=20261026" defer></script>'+m);
  kk=decorate(kk,'kk',page);
  const target=path.join(root,'site/kk/courses/sabina',page);
  fs.mkdirSync(path.dirname(target),{recursive:true});
  fs.writeFileSync(target,kk);
  written.push(path.relative(root,target));
}

// строки, которые site.js подставляет на странице оформления и в диалоге программы
const jsKeys=Object.keys(dict).filter(k=>k.startsWith('js:'));
if(!process.argv.includes('--missing')){
  const js={};
  jsKeys.forEach(k=>{js[k.slice(3)]=dict[k];});
  fs.writeFileSync(path.join(root,'site/assets/i18n-sabina-kk.js'),
    'window.AB_TRANSLATIONS='+JSON.stringify(js).replace(/</g,'\\u003c')+';\n');
  written.push('site/assets/i18n-sabina-kk.js');
}

if(missing.size){
  const list=[...missing];
  if(process.argv.includes('--missing')){
    console.log(JSON.stringify(list,null,1));
    process.exit(0);
  }
  console.error('Missing Kazakh translations ('+list.length+'):\n'+list.slice(0,50).join('\n'));
  process.exit(1);
}
console.log('Generated: '+written.join(', '));
