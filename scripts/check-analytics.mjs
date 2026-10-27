// Static bootstrap and live installation check; no synthetic lead submissions.
import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../site/assets/analytics.js',import.meta.url),'utf8');
const window={},scripts=[];
const document={title:'Analytics check',referrer:'https://google.com/search?q=private',createElement:()=>({}),head:{appendChild:s=>scripts.push(s)},addEventListener:()=>{}};
const location={hostname:'ab-digital.kz',origin:'https://ab-digital.kz',pathname:'/',href:'https://ab-digital.kz/?private=value'};
vm.runInNewContext(source,{window,document,location,URL,Date,Set});
assert.equal(scripts.length,1);assert.equal(window.ym.a[0][0],113830797);assert.equal(window.ym.a[0][2].webvisor,false);assert.equal(window.ym.a[1][2],'https://ab-digital.kz/');
window.abTrack('lead_submit');assert.equal(window.ym.a[2][2],'lead_submit');window.abTrack('unexpected');assert.equal(window.ym.a.length,3);
for(const p of ['/','/kk/','/en/','/services/telegram-bots/','/services/website-development/','/services/telegram-mini-apps/']){const response=await fetch('https://ab-digital.kz'+p);assert.equal(response.status,200);assert((await response.text()).includes('/assets/analytics.js'));}
const installed=await fetch('https://ab-digital.kz/assets/analytics.js');assert.equal(installed.status,200);assert.equal((await installed.text()).replaceAll('\r\n','\n'),source.replaceAll('\r\n','\n'));
console.log('PASS: Metrica bootstrap, host, sanitized URL, safe events, and installation on 6 live pages. Report ingestion is verified separately in the Metrica UI.');
