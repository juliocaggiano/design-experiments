import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
// optical-type gone from feed and routes
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
const captions = await page.locator('.truncate').allTextContents();
console.log('feed cards:', captions.join(', '));
console.log('optical gone:', !captions.some((c) => /optical/i.test(c)));
await page.goto('http://localhost:5173/vault/optical-type', { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
console.log('route falls back to feed:', (await page.locator('h1').first().textContent()).includes('product designer'));
// sheet: consistent height at open, stays put with zero interaction
await page.goto('http://localhost:5173/vault/bottom-sheet', { waitUntil: 'networkidle' });
await page.waitForTimeout(700);
const hero = page.locator('div[aria-label*="bottom sheet"], div[aria-label*="velocity"]').first();
const sheet = hero.locator('.cursor-grab');
const y = async () => sheet.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m42);
const boxH = (await hero.boundingBox()).height;
const y0 = await y();
await page.waitForTimeout(5000); // no interaction at all
const y5 = await y();
console.log('sheet at open:', Math.round(y0), '≈ half (', Math.round(boxH * 0.48), ') |', Math.abs(y0 - boxH * 0.48) < 4);
console.log('still there after 5s untouched:', Math.abs(y5 - y0) < 1);
// interaction still works: dismiss chip then row-tap reopen
await page.getByRole('button', { name: 'Dismiss', exact: true }).click();
await page.waitForTimeout(900);
const play = page.locator('div.relative.z-10.overflow-hidden');
await play.scrollIntoViewIfNeeded();
const psheet = play.locator('.cursor-grab');
const pc = await psheet.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m42);
await play.locator('.cursor-pointer').first().click();
await page.waitForTimeout(900);
const pr = await psheet.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m42);
console.log('dismiss → row-tap reopen:', Math.round(pc), '→', Math.round(pr), '|', pr < pc - 40);
console.log('errors:', errors.length ? errors.join(' | ') : 'none');
await browser.close();
