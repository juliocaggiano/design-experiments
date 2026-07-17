import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto('http://localhost:5173/vault/micro-buttons', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
const hero = page.locator('div[aria-label*="Nine pill"]').first();
const account = hero.locator('.bt-grid > .bt').first();
await account.hover();
await page.waitForTimeout(400);
const on = await account.locator('.i2').evaluate((el) => getComputedStyle(el).opacity);
await page.mouse.move(10, 10);
await page.waitForTimeout(100);
const mid = await account.locator('.i2').evaluate((el) => getComputedStyle(el).opacity);
await page.waitForTimeout(500);
const off = await account.locator('.i2').evaluate((el) => getComputedStyle(el).opacity);
console.log(`morph: hover ${on} → mid-reverse ${Number(mid).toFixed(2)} → settled ${off}`);
console.log('ANIMATES back (mid between 0 and 1):', Number(mid) > 0.05 && Number(mid) < 0.95, '| settles:', Number(off) < 0.05);
// same-node check: element identity survives a hot toggle
const stable = await account.evaluate(async (el) => {
  const before = el;
  el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
  await new Promise((r) => setTimeout(r, 100));
  return document.querySelector('.bt-grid > .bt') === before;
});
console.log('node identity stable across state change:', stable);
console.log('errors:', errors.length ? errors.join(' | ') : 'none');
await browser.close();
