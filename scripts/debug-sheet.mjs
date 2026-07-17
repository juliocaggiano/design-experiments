import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:5173/vault/bottom-sheet', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
const play = page.locator('div.relative.z-10.overflow-hidden');
const sheet = play.locator('.cursor-grab');
const box = await play.boundingBox();
console.log('play box', Math.round(box.x), Math.round(box.y), Math.round(box.width), Math.round(box.height));
// instrument pointer events on the playground sheet
await sheet.evaluate((el) => {
  window.__evts = [];
  ['pointerdown','pointermove','pointerup','pointercancel'].forEach((n) =>
    el.addEventListener(n, (e) => window.__evts.push([n, Math.round(e.clientX), Math.round(e.clientY), Math.round(performance.now())])));
});
const y0 = await sheet.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m42);
console.log('sheet y before:', Math.round(y0));
const px = box.x + box.width / 2;
const py = box.y + y0 + 20;
await page.mouse.move(px, py);
await page.mouse.down();
for (let i = 1; i <= 6; i++) await page.mouse.move(px, py + i * 18, { steps: 1 });
await page.mouse.up();
await page.waitForTimeout(200);
console.log('events:', await page.evaluate(() => JSON.stringify(window.__evts)));
await page.waitForTimeout(900);
console.log('sheet y after:', Math.round(await sheet.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m42)));
await browser.close();
