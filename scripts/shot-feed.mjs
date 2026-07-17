import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2400);
await page.screenshot({ path: './diff/feed-about.png', fullPage: true });
await browser.close();
console.log('shot saved');
