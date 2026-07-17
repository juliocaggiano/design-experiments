import { chromium } from 'playwright';
import fs from 'fs';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('https://amicro.vercel.app/', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(2500);
fs.mkdirSync('./capture-amicro', { recursive: true });
await page.screenshot({ path: './capture-amicro/full.png', fullPage: true });
// outline of interactive elements
const outline = await page.evaluate(() => {
  const els = document.querySelectorAll('button, a, [role="button"], input, [class*="button"], [class*="btn"]');
  return [...els].map((el) => {
    const r = el.getBoundingClientRect();
    return {
      tag: el.tagName.toLowerCase(),
      text: (el.textContent || '').trim().slice(0, 60),
      cls: String(el.className).slice(0, 120),
      x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
    };
  }).filter((e) => e.w > 0);
});
console.log(JSON.stringify(outline, null, 1));
const title = await page.title();
const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 600));
console.log('TITLE:', title);
console.log('TEXT:', bodyText);
await browser.close();
