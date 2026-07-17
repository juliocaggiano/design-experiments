import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:5173/vault/bottom-sheet', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
const play = page.locator('div.relative.z-10.overflow-hidden');
await play.scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
const sheet = play.locator('.cursor-grab');
const y = async () => sheet.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m42);
const box = await play.boundingBox();
console.log('play box y:', Math.round(box.y), '(in viewport)');
// open to half
await page.locator('button:has-text("Open")').click();
await page.waitForTimeout(900);
const yHalf = await y();
const px = box.x + box.width / 2;
// FAST flick down from half → dismiss
await page.mouse.move(px, box.y + yHalf + 20);
await page.mouse.down();
for (let i = 1; i <= 6; i++) await page.mouse.move(px, box.y + yHalf + 20 + i * 15, { steps: 1 });
await page.mouse.up();
await page.waitForTimeout(1000);
const yFast = await y();
console.log('half:', Math.round(yHalf), '→ after fast flick:', Math.round(yFast), '| dismissed:', yFast > box.height);
// reopen, then SLOW drag down 40px → should snap back near half (not dismiss)
await page.locator('button:has-text("Open")').click();
await page.waitForTimeout(900);
const y1 = await y();
await page.mouse.move(px, box.y + y1 + 20);
await page.mouse.down();
for (let i = 1; i <= 20; i++) { await page.mouse.move(px, box.y + y1 + 20 + i * 2, { steps: 1 }); await page.waitForTimeout(35); }
await page.mouse.up();
await page.waitForTimeout(1000);
const ySlow = await y();
console.log('half:', Math.round(y1), '→ after slow 40px drag:', Math.round(ySlow), '| stayed up (not dismissed):', ySlow < box.height * 0.8);
// drag far above full → rubber-band resists (sheet moves less than pointer)
await page.mouse.move(px, box.y + ySlow + 20);
await page.mouse.down();
for (let i = 1; i <= 10; i++) await page.mouse.move(px, box.y + ySlow + 20 - i * 12, { steps: 1 });
const yDuring = await y();
await page.mouse.up();
console.log('pointer moved up 120px; sheet at:', Math.round(yDuring), '| rubber-banded above full (~27):', yDuring > 5 && yDuring < 27);
await page.waitForTimeout(800);
await browser.close();
console.log('done');
