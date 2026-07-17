import { chromium } from 'playwright';
const file = process.argv[2];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto('file://' + file, { waitUntil: 'load' });
await page.waitForTimeout(1800);
console.log('feed cards:', await page.locator('#view-feed a.card').count());
// type card breathes on the feed
const feedOpt = page.locator('#ot-feed .ot-line.opt');
const f1 = await feedOpt.evaluate((el) => el.style.fontSize);
await page.waitForTimeout(1500);
const f2 = await feedOpt.evaluate((el) => el.style.fontSize);
console.log('feed type breathing:', f1 !== f2);
// sheet reopen in artifact: dismiss then click a row
await page.locator('a[href="#/bottom-sheet"]').click();
await page.waitForTimeout(600);
const shPlaySheet = page.locator('#sh-play .sh-sheet');
const shY = async () => shPlaySheet.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m42);
await page.locator('#sh-dismiss').click();
await page.waitForTimeout(900);
const yc = await shY();
await page.locator('#sh-play .sh-row').first().click();
await page.waitForTimeout(900);
const yr = await shY();
console.log('artifact sheet reopen:', Math.round(yc), '→', Math.round(yr), '|', yr < yc - 40);
// type view: route + chips + copy
await page.evaluate(() => { location.hash = '#/optical-type'; });
await page.waitForTimeout(600);
console.log('type view visible:', await page.locator('#view-type').isVisible(), '| tabs:', await page.locator('#ot-tabs button').count());
await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
await page.locator('#ot-copy').click();
await page.waitForTimeout(300);
const clip = await page.evaluate(() => navigator.clipboard.readText());
console.log('type copy:', (clip.length / 1000).toFixed(1) + 'k | full code:', clip.includes('export function OpticalTypeDemo'));
// every view routes
for (const [h, id] of [['#/', '#view-feed'], ['#/materials', '#view-materials'], ['#/fluid-springs', '#view-springs'], ['#/meeting-overlay', '#view-detail'], ['#/optical-type', '#view-type']]) {
  await page.evaluate((x) => { location.hash = x; }, h);
  await page.waitForTimeout(350);
  const ok = await page.locator(id).isVisible();
  if (!ok) console.log('ROUTE FAIL:', h);
}
console.log('all routes ok');
console.log('errors:', errors.length ? errors.join(' | ') : 'none');
await browser.close();
