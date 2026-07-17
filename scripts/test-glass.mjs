import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto('http://localhost:5173/vault/materials', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
const hero = page.locator('div[aria-label*="liquid-glass"]');
const btn = hero.locator('.gl-btn');
// wallpaper drifts
const blob = hero.locator('.gl-blob').first();
const b1 = await blob.evaluate((el) => el.style.transform);
await page.waitForTimeout(900);
const b2 = await blob.evaluate((el) => el.style.transform);
console.log('wallpaper drifting:', b1 !== b2);
// drag the button away and release → springs back to center
const bb = await btn.boundingBox();
const cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2;
await page.mouse.move(cx, cy);
await page.mouse.down();
for (let i = 1; i <= 8; i++) await page.mouse.move(cx + i * 20, cy - i * 8, { steps: 1 });
await page.mouse.up();
await page.waitForTimeout(250);
const mid = await btn.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41);
await page.waitForTimeout(1600);
const settled = await btn.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41);
console.log('x shortly after throw:', Math.round(mid), '→ settled:', Math.round(settled), '| sprang home:', Math.abs(settled) < 3 && Math.abs(mid) > 10);
// press gives (scale < 1 while down)
await page.mouse.move(cx, cy);
await page.mouse.down();
await page.waitForTimeout(300);
const pressScale = await btn.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a);
await page.mouse.up();
console.log('press scale:', pressScale.toFixed(3), '| gives:', pressScale < 0.97);
// copy ships full new code
await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
await page.locator('button:has-text("Copy prompt")').click();
await page.waitForTimeout(300);
const clip = await page.evaluate(() => navigator.clipboard.readText());
console.log('copy:', (clip.length / 1000).toFixed(1) + 'k | new impl:', clip.includes('gl-spec') && clip.includes('liquid-glass'));
await page.screenshot({ path: './diff/glass-detail.png', fullPage: true });
console.log('errors:', errors.length ? errors.join(' | ') : 'none');
await browser.close();
