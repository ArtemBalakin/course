import { chromium } from 'playwright';

const targets = [
  { name: 'n3', url: 'https://n3corp.ru/' },
  { name: 'ispace', url: 'https://ispace-platform.ru/' }
];
const browser = await chromium.launch({headless: true, args: ['--no-sandbox']});
try {
  for (const target of targets) {
    const page = await browser.newPage({viewport: {width: 1440, height: 960}, deviceScaleFactor: 1, locale: 'ru-RU', reducedMotion: 'reduce'});
    try {
      const response = await page.goto(target.url, {waitUntil: 'domcontentloaded', timeout: 55000});
      if (!response || response.status() >= 400) throw new Error(`Bad HTTP response: ${response?.status()}`);
      await page.waitForTimeout(4500);
      await page.evaluate(async () => {
        await document.fonts.ready;
        const imgs = [...document.images].slice(0,12);
        await Promise.all(imgs.map(img => img.decode().catch(() => {})));
      });
      await page.screenshot({path: `/tmp/${target.name}-site.png`, type: 'png', animations:'disabled', timeout: 30000});
      const meta=await page.evaluate(()=>({title:document.title,bodyText:document.body.innerText.slice(0,250)}));
      console.log(`Captured ${target.url}: ${JSON.stringify(meta)}`);
    } finally { await page.close(); }
  }
} finally { await browser.close(); }
