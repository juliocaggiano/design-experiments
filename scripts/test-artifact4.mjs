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
// materials view: route, popover chip, sliders present
await page.locator('a[href="#/materials"]').click();
await page.waitForTimeout(600);
console.log('materials view visible:', await page.locator('#view-materials').isVisible());
await page.locator('#mt-open').click();
await page.waitForTimeout(500);
console.log('popover materialized:', await page.locator('#mt-play .mt-popover').evaluate((el) => el.classList.contains('on')));
console.log('mt tabs:', await page.locator('#mt-tabs button').count());
// copy payloads on all four views include full code
await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
const check = async (hash, btn, marker) => {
  await page.evaluate((h) => { location.hash = h; }, hash);
  await page.waitForTimeout(400);
  await page.locator(btn).click();
  await page.waitForTimeout(250);
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  console.log(hash.padEnd(20), (clip.length / 1000).toFixed(1) + 'k |', 'full code:', clip.includes(marker));
};
await check('#/materials', '#mt-copy', 'export function MaterialsDemo');
await check('#/bottom-sheet', '#sh-copy', 'export function SheetDemo');
await check('#/fluid-springs', '#fs-copy', 'export function FluidSpringDemo');
await check('#/meeting-overlay', '#btn-copy', 'class AnimationController');
// all views still route
for (const [h, id] of [['#/', '#view-feed'], ['#/materials', '#view-materials']]) {
  await page.evaluate((x) => { location.hash = x; }, h);
  await page.waitForTimeout(350);
  console.log(h, 'visible:', await page.locator(id).isVisible());
}
console.log('errors:', errors.length ? errors.join(' | ') : 'none');
await browser.close();
