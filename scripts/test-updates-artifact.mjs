import { chromium } from 'playwright';
const file = process.argv[2];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto('file://' + file, { waitUntil: 'load' });
await page.waitForTimeout(1200);
const cards = await page.locator('#view-feed a.card').count();
const hasOptical = await page.locator('a[href="#/optical-type"]').count();
console.log('feed cards:', cards, '| optical gone:', hasOptical === 0);
// sheet consistent at half, no drift
const sheet = page.locator('#sh-feed .sh-sheet');
const boxH = (await page.locator('#sh-feed').boundingBox()).height;
const y0 = await sheet.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m42);
await page.waitForTimeout(4500);
const y5 = await sheet.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m42);
console.log('sheet at load:', Math.round(y0), '≈ half (', Math.round(boxH * 0.48), ') |', Math.abs(y0 - boxH * 0.48) < 4, '| no drift:', Math.abs(y5 - y0) < 1);
// remaining views route
for (const [h, id] of [['#/materials', '#view-materials'], ['#/bottom-sheet', '#view-sheet'], ['#/fluid-springs', '#view-springs'], ['#/meeting-overlay', '#view-detail'], ['#/', '#view-feed']]) {
  await page.evaluate((x) => { location.hash = x; }, h);
  await page.waitForTimeout(300);
  if (!(await page.locator(id).isVisible())) console.log('ROUTE FAIL:', h);
}
console.log('all routes ok');
console.log('errors:', errors.length ? errors.join(' | ') : 'none');
await browser.close();
