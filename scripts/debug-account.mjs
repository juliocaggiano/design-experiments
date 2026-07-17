import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:5173/vault/micro-buttons', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
const hero = page.locator('div[aria-label*="Nine pill"]').first();
const account = hero.locator('.bt-grid > .bt').first();
await account.hover();
await page.waitForTimeout(350);
console.log('hovered  :', await account.evaluate((el) => el.className));
await page.mouse.move(10, 10);
for (const ms of [50, 200, 400, 800, 1500]) {
  await page.waitForTimeout(ms === 50 ? 50 : ms - (ms === 200 ? 50 : ms === 400 ? 200 : ms === 800 ? 400 : 800));
  const s = await account.evaluate((el) => ({
    cls: el.className,
    i1: getComputedStyle(el.querySelector('.i1')).opacity,
    i2: getComputedStyle(el.querySelector('.i2')).opacity,
  }));
  console.log(`t+${ms}ms :`, s.cls, '| i1', s.i1, '| i2', s.i2);
}
await browser.close();
