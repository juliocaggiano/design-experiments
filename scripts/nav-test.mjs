import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:5173/vault/meeting-overlay', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await page.locator('a[aria-label="Close"]').click();
await page.waitForTimeout(600);
const h1 = await page.locator('h1').textContent();
const url = page.url();
console.log('after close →', url, '| h1:', h1);
// browser back should return to the detail page
await page.goBack();
await page.waitForTimeout(600);
console.log('after back →', page.url(), '| h1:', await page.locator('h1').textContent());
await browser.close();
