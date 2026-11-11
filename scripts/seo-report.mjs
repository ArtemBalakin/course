// Отчёт по Google Search Console (только чтение).
// Ключ сервисного аккаунта: %USERPROFILE%\.claude\secrets\gsc.json (вне репозитория, не печатать).
// Запуск: node scripts/seo-report.mjs [дней=28]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';

const SITE = 'https://ab-digital.kz/';
const days = Number(process.argv[2] || 28);
const key = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.claude', 'secrets', 'gsc.json'), 'utf8'));

const b64 = (o) => Buffer.from(typeof o === 'string' ? o : JSON.stringify(o)).toString('base64url');
async function token() {
  const now = Math.floor(Date.now() / 1000);
  const head = b64({ alg: 'RS256', typ: 'JWT' });
  const body = b64({ iss: key.client_email, scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 });
  const sig = crypto.createSign('RSA-SHA256').update(`${head}.${body}`).sign(key.private_key, 'base64url');
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${head}.${body}.${sig}` }) });
  const j = await r.json();
  if (!j.access_token) throw new Error('auth: ' + JSON.stringify(j));
  return j.access_token;
}
const T = await token();
const api = async (url, body) => {
  const r = await fetch(url, { method: body ? 'POST' : 'GET', headers: { authorization: `Bearer ${T}`, 'content-type': 'application/json' }, body: body && JSON.stringify(body) });
  const j = await r.json();
  if (j.error) throw new Error(JSON.stringify(j.error));
  return j;
};
const site = encodeURIComponent(SITE);
const d = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
const q = (dimensions, limit = 15) => api(`https://searchconsole.googleapis.com/webmasters/v3/sites/${site}/searchAnalytics/query`,
  { startDate: d(days + 2), endDate: d(2), dimensions, rowLimit: limit });
const row = (r) => `${r.clicks}\t${r.impressions}\t${(r.ctr * 100).toFixed(1)}%\t${r.position.toFixed(1)}`;

console.log(`# Search Console ${SITE}, ${days} дней (клики / показы / CTR / позиция)`);
const tot = await q([], 1);
console.log('ИТОГО', tot.rows ? row(tot.rows[0]) : 'данных нет');
for (const [name, dim] of [['ЗАПРОСЫ', 'query'], ['СТРАНИЦЫ', 'page'], ['СТРАНЫ', 'country']]) {
  const r = await q([dim]);
  console.log(`\n## ${name}`);
  (r.rows || []).forEach((x) => console.log(`${row(x)}\t${x.keys[0]}`));
}
console.log('\n## SITEMAP');
const sm = await api(`https://searchconsole.googleapis.com/webmasters/v3/sites/${site}/sitemaps`);
(sm.sitemap || []).forEach((s) => console.log(s.path, 'ошибок:', s.errors, 'предупреждений:', s.warnings,
  'отправлено:', (s.contents || []).map((c) => `${c.type}=${c.submitted}/${c.indexed ?? '?'}`).join(',')));
if (!sm.sitemap) console.log('sitemap в Search Console не отправлен');

console.log('\n## ИНДЕКСАЦИЯ (URL Inspection, URL из sitemap)');
const xml = await (await fetch(SITE + 'sitemap.xml')).text();
const urls = [...xml.matchAll(/<loc>([^<]+)/g)].map((m) => m[1]);
for (const u of urls) {
  const r = await api('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', { inspectionUrl: u, siteUrl: SITE });
  const s = r.inspectionResult?.indexStatusResult || {};
  console.log(`${s.verdict}\t${s.coverageState}\t${u}`);
}
