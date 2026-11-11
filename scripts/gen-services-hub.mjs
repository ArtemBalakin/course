// Генерирует хаб-страницы /services/, /kk/services/, /en/services/
import fs from 'node:fs';
const L = {
  ru: { base:'', lang:'ru', loc:'ru_RU', home:'Главная', h1:'Услуги студии AB/digital', title:'Услуги: Telegram-боты, Mini Apps и сайты | AB/digital',
    desc:'Разработка Telegram-ботов от 70 000 ₸, Telegram Mini Apps от 500 000 ₸ и сайтов от 250 000 ₸ в Алматы и по всему Казахстану.',
    lead:'Боты, Mini Apps и сайты для бизнеса в Казахстане. Выберите услугу, чтобы увидеть примеры, цены и сроки.', contact:'Написать в Telegram', langnav:'Язык сайта', more:'Подробнее', priv:'Политика конфиденциальности',
    items:[['telegram-bots','Разработка Telegram-ботов','от 70 000 ₸','Заявки, запись клиентов, напоминания и интеграции.'],['telegram-mini-apps','Разработка Telegram Mini Apps','от 500 000 ₸','Каталоги, календари и кабинеты внутри Telegram.'],['website-development','Создание сайтов','от 250 000 ₸','Сайты на заказ в Алматы и по Казахстану.']] },
  kk: { base:'/kk', lang:'kk', loc:'kk_KZ', home:'Басты бет', h1:'AB/digital студиясының қызметтері', title:'Қызметтер: Telegram-боттар, Mini App және сайттар | AB/digital',
    desc:'Telegram-бот әзірлеу 70 000 ₸-ден, Telegram Mini App 500 000 ₸-ден және сайт 250 000 ₸-ден — Алматыда және бүкіл Қазақстанда.',
    lead:'Қазақстандағы бизнеске арналған боттар, Mini App және сайттар. Мысалдар, баға мен мерзімді көру үшін қызметті таңдаңыз.', contact:'Telegram-да жазу', langnav:'Сайт тілі', more:'Толығырақ', priv:'Құпиялылық саясаты',
    items:[['telegram-bots','Telegram-бот әзірлеу','70 000 ₸-ден','Өтінімдер, жазылу, еске салғыштар және интеграциялар.'],['telegram-mini-apps','Telegram Mini App әзірлеу','500 000 ₸-ден','Telegram ішіндегі каталог, күнтізбе және кабинеттер.'],['website-development','Сайт жасау','250 000 ₸-ден','Алматыда және Қазақстан бойынша тапсырыспен сайттар.']] },
  en: { base:'/en', lang:'en', loc:'en_US', home:'Home', h1:'AB/digital services', title:'Services: Telegram Bots, Mini Apps and Websites | AB/digital',
    desc:'Telegram bot development from 70,000 ₸, Telegram Mini Apps from 500,000 ₸ and websites from 250,000 ₸ in Almaty and across Kazakhstan.',
    lead:'Bots, Mini Apps and websites for businesses in Kazakhstan. Pick a service to see examples, prices and timelines.', contact:'Message on Telegram', langnav:'Site language', more:'Learn more', priv:'Privacy policy',
    items:[['telegram-bots','Telegram bot development','from 70,000 ₸','Leads, bookings, reminders and integrations.'],['telegram-mini-apps','Telegram Mini App development','from 500,000 ₸','Catalogs, calendars and accounts inside Telegram.'],['website-development','Website development','from 250,000 ₸','Custom websites in Almaty and across Kazakhstan.']] },
};
const hre = ['ru','kk','en'].map(k=>`<link rel="alternate" hreflang="${k}" href="https://ab-digital.kz${L[k].base}/services/">`).join('')+`<link rel="alternate" hreflang="x-default" href="https://ab-digital.kz/services/">`;
for (const [k,t] of Object.entries(L)) {
  const url = `https://ab-digital.kz${t.base}/services/`;
  const cards = t.items.map(([s,n,p,d])=>`<a class="tg-card" href="${t.base}/services/${s}/"><h2>${n}</h2><p><strong>${p}</strong></p><p>${d}</p><span>${t.more} →</span></a>`).join('');
  const sw = ['ru','kk','en'].map(x=>`<a href="${L[x].base}/services/" hreflang="${x}" lang="${x}"${x===k?' aria-current="page"':''}>${{ru:'RU',kk:'ҚАЗ',en:'EN'}[x]}</a>`).join('');
  const html = `<!doctype html><html lang="${t.lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#0e1b26"><title>${t.title}</title><meta name="description" content="${t.desc}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${url}">${hre}<meta property="og:type" content="website"><meta property="og:site_name" content="AB/digital"><meta property="og:locale" content="${t.loc}"><meta property="og:title" content="${t.title}"><meta property="og:description" content="${t.desc}"><meta property="og:url" content="${url}"><meta property="og:image" content="https://ab-digital.kz/assets/og-image.png"><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/assets/site.css"><link rel="stylesheet" href="/assets/telegram-bots.css?v=20261105-iphone"><script src="/assets/analytics.js" defer></script></head><body>
<header class="topbar"><a class="brand" href="${t.base}/">AB/digital</a><nav class="lang-switch" aria-label="${t.langnav}">${sw}</nav><a class="top-contact" href="https://t.me/ArtemBalakin" target="_blank" rel="noopener noreferrer">${t.contact}</a></header>
<main class="tg-page wrap" id="main">
<nav class="tg-crumbs" aria-label="${t.home}"><a href="${t.base}/">${t.home}</a><span aria-hidden="true"> / </span><span aria-current="page">${t.h1}</span></nav>
<section class="tg-section"><h1>${t.h1}</h1><p class="tg-lead">${t.lead}</p><div class="tg-related">${cards}</div></section>
</main>
<footer class="footer"><a href="${t.base}/">AB/digital</a> · <a href="mailto:admin@ab-digital.kz">admin@ab-digital.kz</a> · <a href="/legal/privacy/">${t.priv}</a></footer>
</body></html>
`;
  fs.writeFileSync(`site${t.base}/services/index.html`, html);
}
