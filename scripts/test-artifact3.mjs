import { chromium } from 'playwright';
const file = process.argv[2];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto('file://' + file, { waitUntil: 'load' });
await page.waitForTimeout(2000);
console.log('feed cards:', await page.locator('#view-feed a.card').count());
// sheet ambient on feed
const feedSheet = page.locator('#sh-feed .sh-sheet');
const t1 = await feedSheet.evaluate((el) => el.style.transform);
await page.waitForTimeout(4200);
const t2 = await feedSheet.evaluate((el) => el.style.transform);
console.log('feed sheet animating:', t1 !== t2);
// route to sheet view, chips work
await page.locator('a[href="#/bottom-sheet"]').click();
await page.waitForTimeout(600);
console.log('sheet view visible:', await page.locator('#view-sheet').isVisible());
console.log('sh tabs:', await page.locator('#sh-tabs button').count(), '| pre has code:', (await page.locator('#sh-pre').textContent()).includes('VELOCITY_COMMIT'));
const play = page.locator('#sh-play .sh-sheet');
await page.locator('#sh-open').click();
await page.waitForTimeout(800);
const yOpen = await play.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m42);
await page.locator('#sh-dismiss').click();
await page.waitForTimeout(800);
const yClosed = await play.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m42);
console.log('open y:', Math.round(yOpen), '→ dismiss y:', Math.round(yClosed), '| chips work:', yClosed > yOpen + 60);
// copy
await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
await page.locator('#sh-copy').click();
await page.waitForTimeout(300);
const clip = await page.evaluate(() => navigator.clipboard.readText());
console.log('copied sheet prompt:', clip.length, 'chars | starts ok:', clip.startsWith('Build this: a bottom sheet'));
// all four views still route
for (const [href, id] of [['#/fluid-springs', '#view-springs'], ['#/meeting-overlay', '#view-detail'], ['#/', '#view-feed']]) {
  await page.evaluate((h) => { location.hash = h; }, href);
  await page.waitForTimeout(400);
  console.log(href, 'visible:', await page.locator(id).isVisible());
}
console.log('errors:', errors.length ? errors.join(' | ') : 'none');
await browser.close();
