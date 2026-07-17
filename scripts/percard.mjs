import { chromium } from 'playwright';
import fs from 'fs';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('https://www.arlan.me/vault', { waitUntil: 'networkidle', timeout: 60000 });
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 300) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 80)); }
});
await page.waitForTimeout(3000);
await page.evaluate(() => window.scrollTo(0, 0));
fs.mkdirSync('./capture/cards', { recursive: true });
const n = await page.evaluate(() => document.querySelectorAll('main section > div.relative > div.grid > *').length);
console.log('top-level card nodes:', n);
for (let i = 0; i < n; i++) {
  const el = page.locator('main section > div.relative > div.grid > *').nth(i);
  const html = await el.evaluate(e => e.outerHTML);
  fs.writeFileSync(`./capture/cards/card-${String(i).padStart(2,'0')}.html`, html);
  try {
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(700);
    await el.screenshot({ path: `./capture/cards/card-${String(i).padStart(2,'0')}.png` });
  } catch (e) { console.log('shot fail', i, e.message.slice(0,80)); }
}
await browser.close();
console.log('done');
