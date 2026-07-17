import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:5173/vault/bottom-sheet', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
const play = page.locator('div.relative.z-10.overflow-hidden');
const sheet = play.locator('.cursor-grab');
const y = async () => sheet.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m42);
const box = await play.boundingBox();
// open to half via chip
await page.locator('button:has-text("Open")').click();
await page.waitForTimeout(900);
const yHalf = await y();
// SLOW drag down 40px → should spring back near half
await page.mouse.move(box.x + box.width / 2, box.y + yHalf + 20);
await page.mouse.down();
for (let i = 1; i <= 20; i++) { await page.mouse.move(box.x + box.width / 2, box.y + yHalf + 20 + i * 2, { steps: 1 }); await page.waitForTimeout(30); }
await page.mouse.up();
await page.waitForTimeout(1100);
const ySlow = await y();
console.log('half:', Math.round(yHalf), '| after slow 40px drag:', Math.round(ySlow), '| snapped back:', Math.abs(ySlow - yHalf) < 8);
// FAST flick down from half → should dismiss (y ≈ container height + 12)
await page.mouse.move(box.x + box.width / 2, box.y + ySlow + 20);
await page.mouse.down();
for (let i = 1; i <= 6; i++) await page.mouse.move(box.x + box.width / 2, box.y + ySlow + 20 + i * 18, { steps: 1 });
await page.mouse.up();
await page.waitForTimeout(1100);
const yFast = await y();
console.log('after fast flick:', Math.round(yFast), '| dismissed:', yFast > box.height);
// screenshots
await page.screenshot({ path: './diff/sheet-detail.png', fullPage: true });
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(4200);
await page.screenshot({ path: './diff/sheet-feed.png' });
await browser.close();
console.log('done');
