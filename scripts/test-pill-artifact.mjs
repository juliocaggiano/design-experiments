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
console.log('feed pill present:', await page.locator('#mt-feed .gl-btn').count() === 1);
await page.evaluate(() => { location.hash = '#/materials'; });
await page.waitForTimeout(600);
const btn = page.locator('#mt-play .gl-btn');
await btn.scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
const bb = await btn.boundingBox();
const cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2;
await page.mouse.move(cx, cy);
await page.mouse.down();
await page.mouse.move(cx + 90, cy - 25, { steps: 4 });
const during = await btn.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41);
await page.mouse.up();
await page.waitForTimeout(1400);
const settled = await btn.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41);
console.log('drag tracks:', Math.abs(during - 90) < 8, '| springs home:', Math.abs(settled) < 3);
// pulse dips (per-frame sampling)
const min = await page.evaluate(async () => {
  const b = document.querySelector('#mt-play .gl-btn');
  document.getElementById('mt-open').click();
  let m = 1;
  const t0 = performance.now();
  while (performance.now() - t0 < 400) {
    m = Math.min(m, new DOMMatrix(getComputedStyle(b).transform).a);
    await new Promise(requestAnimationFrame);
  }
  return m;
});
console.log('pulse dips to:', min.toFixed(3), '|', min < 0.95);
// sliders exist and copy ships the new implementation
console.log('sliders:', await page.locator('#mt-sl-blue, #mt-sl-edge, #mt-sl-gloss').count(), '/3');
await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
await page.locator('#mt-copy').click();
await page.waitForTimeout(300);
const clip = await page.evaluate(() => navigator.clipboard.readText());
console.log('copy:', (clip.length / 1000).toFixed(1) + 'k | new impl:', clip.includes('gl-rim') && clip.includes('glass pill'));
for (const [h, id] of [['#/', '#view-feed'], ['#/materials', '#view-materials'], ['#/bottom-sheet', '#view-sheet'], ['#/fluid-springs', '#view-springs'], ['#/optical-type', '#view-type'], ['#/meeting-overlay', '#view-detail']]) {
  await page.evaluate((x) => { location.hash = x; }, h);
  await page.waitForTimeout(300);
  if (!(await page.locator(id).isVisible())) console.log('ROUTE FAIL:', h);
}
console.log('all routes ok');
console.log('errors:', errors.length ? errors.join(' | ') : 'none');
await browser.close();
