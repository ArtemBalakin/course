// Разбор и текст заявки. Лишние символы обрезаем, а не отклоняем: заявка живого человека важнее.
const LIMITS={
  name:80,contact:120,service:80,details:1200,source:180,landing:300,referrer:500,
  utm_source:100,utm_medium:100,utm_campaign:160,utm_content:160,utm_term:160
};
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const field=(value,max)=>String(value??'').trim().slice(0,max);

export function parseLead(body,newId){
  if(!body||typeof body!=='object'||Array.isArray(body))return null;
  const lead=Object.fromEntries(Object.entries(LIMITS).map(([key,max])=>[key,field(body[key],max)]));
  // Форма отправляет JSON с true, а без JavaScript браузер присылает значение галочки.
  const consent=body.consent===true||(typeof body.consent==='string'&&body.consent.trim()!=='');
  if(!lead.name||!lead.contact||!lead.details||!consent)return null;
  lead.id=UUID.test(String(body.id??''))?String(body.id).toLowerCase():newId();
  // Скрытое поле видят только боты. Это пометка, а не отказ: автозаполнение тоже может его заполнить.
  lead.suspicious=field(body.company_site,200)!==''?1:0;
  return lead;
}

function lines(lead){
  const utm=[lead.utm_source,lead.utm_medium,lead.utm_campaign].filter(Boolean).join(' / ');
  return [
    ...(lead.suspicious?['⚠️ возможно, спам (заполнено скрытое поле)']:[]),
    'Имя: '+lead.name,
    'Контакт: '+lead.contact,
    'Услуга: '+(lead.service||'—'),
    'Задача: '+lead.details,
    'Страница: '+(lead.landing||'—'),
    ...(lead.referrer?['Переход: '+lead.referrer]:[]),
    ...(utm?['UTM: '+utm]:[]),
    'ID: '+lead.id
  ];
}

export const telegramText=lead=>['📩 Новая заявка AB/digital',...lines(lead)].join('\n').slice(0,3900);

export function emailMessage(lead){
  return {
    subject:(lead.suspicious?'[возможно, спам] ':'')+'Заявка AB/digital: '+lead.name,
    text:lines(lead).join('\n'),
    replyTo:EMAIL.test(lead.contact)?lead.contact:null
  };
}

export function heldSummary(group){
  const shown=group.rows.slice(0,5).map(row=>'• '+row.name+' — '+row.contact);
  const rest=group.rows.length-shown.length;
  return [
    '📦 Ещё заявок с одного адреса: '+group.rows.length,
    'Они сохранены в базе, отдельных уведомлений не было.',
    ...shown,
    ...(rest>0?['…и ещё '+rest]:[])
  ].join('\n');
}
