import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(3200); // let an ambient flick land
await page.screenshot({ path: './diff/springs-feed.png', fullPage: false });
// drag test: grab the chip, drag 200px right and 60px down fast, release
const chipBox = await page.locator('a[href="/vault/fluid-springs"] .will-change-transform').boundingBox();
console.log('chip at', Math.round(chipBox.x), Math.round(chipBox.y));
await page.mouse.move(chipBox.x + 40, chipBox.y + 30);
await page.mouse.down();
for (let i = 1; i <= 8; i++) await page.mouse.move(chipBox.x + 40 + i * 30, chipBox.y + 30 + i * 6, { steps: 1 });
await page.mouse.up();
await page.waitForTimeout(900);
const after = await page.locator('a[href="/vault/fluid-springs"] .will-change-transform').boundingBox();
console.log('after flick', Math.round(after.x), Math.round(after.y), '| moved:', Math.round(after.x - chipBox.x), 'px');
// detail page
await page.goto('http://localhost:5173/vault/fluid-springs', { waitUntil: 'networkidle' });
await page.waitForTimeout(2800);
await page.screenshot({ path: './diff/springs-detail.png', fullPage: true });
await browser.close();
console.log('shots saved');
