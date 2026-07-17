import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:5173/vault/meeting-overlay', { waitUntil: 'networkidle' });
await page.waitForTimeout(2600); // let the walk-in finish and the bubble settle
await page.screenshot({ path: './diff/detail-full.png', fullPage: true });
// also test the copy button wiring
await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
const chip = page.locator('button:has-text("Copy prompt")');
await chip.click();
await page.waitForTimeout(300);
const clip = await page.evaluate(() => navigator.clipboard.readText());
console.log('copied length:', clip.length, '| starts:', JSON.stringify(clip.slice(0, 60)));
// and the tab switcher
await page.locator('button[role="tab"]:has-text("config.py")').click();
await page.waitForTimeout(400);
const pre = await page.locator('pre').textContent();
console.log('config tab shows SPRITE_TARGET_H:', pre.includes('SPRITE_TARGET_H'));
await browser.close();
