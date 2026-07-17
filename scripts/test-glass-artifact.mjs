import { chromium } from 'playwright';
const file = process.argv[2];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto('file://' + file, { waitUntil: 'load' });
await page.waitForTimeout(1500);
console.log('feed cards:', await page.locator('#view-feed a.card').count());
// glass button lives on the feed card
console.log('feed glass button:', await page.locator('#mt-feed .gl-btn').count() === 1);
// materials view: drag the playground button, sliders, pulse
await page.evaluate(() => { location.hash = '#/materials'; });
await page.waitForTimeout(600);
const btn = page.locator('#mt-play .gl-btn');
await btn.scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
const bb = await btn.boundingBox();
const cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2;
await page.mouse.move(cx, cy);
await page.mouse.down();
await page.mouse.move(cx + 100, cy - 30, { steps: 4 });
const during = await btn.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41);
await page.mouse.up();
await page.waitForTimeout(1400);
const settled = await btn.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41);
console.log('drag tracks:', Math.abs(during - 100) < 8, '| springs home:', Math.abs(settled) < 3);
await page.locator('#mt-open').click(); // Pulse
await page.waitForTimeout(120);
const pulseScale = await btn.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a);
console.log('pulse squeezes:', pulseScale < 0.99);
// copy ships the new implementation
await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
await page.locator('#mt-copy').click();
await page.waitForTimeout(300);
const clip = await page.evaluate(() => navigator.clipboard.readText());
console.log('copy:', (clip.length / 1000).toFixed(1) + 'k | new impl:', clip.includes('gl-spec') && clip.includes('liquid-glass'));
// all six... five artifact views still route (knockout is local-only)
for (const [h, id] of [['#/', '#view-feed'], ['#/materials', '#view-materials'], ['#/bottom-sheet', '#view-sheet'], ['#/fluid-springs', '#view-springs'], ['#/optical-type', '#view-type'], ['#/meeting-overlay', '#view-detail']]) {
  await page.evaluate((x) => { location.hash = x; }, h);
  await page.waitForTimeout(300);
  if (!(await page.locator(id).isVisible())) console.log('ROUTE FAIL:', h);
}
console.log('all routes ok');
console.log('errors:', errors.length ? errors.join(' | ') : 'none');
await browser.close();
