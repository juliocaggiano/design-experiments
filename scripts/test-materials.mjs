import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:5173/vault/materials', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
// popover materializes via chip
const play = page.locator('div.relative.z-10.overflow-hidden');
await play.scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
const pop = play.locator('.mt-popover');
await page.getByRole('button', { name: 'Materialize', exact: true }).click();
await page.waitForTimeout(500);
const opened = await pop.evaluate((el) => el.classList.contains('on') && getComputedStyle(el).opacity === '1');
await page.getByRole('button', { name: 'Dismiss', exact: true }).click();
await page.waitForTimeout(500);
const closed = await pop.evaluate((el) => !el.classList.contains('on'));
console.log('popover materialize/dismiss chips:', opened, closed);
// wheel scroll shows the edge fade
const box = await play.boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.wheel(0, 60);
await page.waitForTimeout(400);
const edge = await play.locator('.mt-edge').evaluate((el) => getComputedStyle(el).opacity);
console.log('scroll edge fade after wheel:', edge === '1');
// copy payloads: prompt + FULL code on all four cards
await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
const check = async (route, marker) => {
  await page.goto('http://localhost:5173' + route, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.locator('button:has-text("Copy prompt")').click();
  await page.waitForTimeout(300);
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  console.log(route.padEnd(24), (clip.length / 1000).toFixed(1) + 'k chars | has full code:', clip.includes(marker));
};
await check('/vault/materials', 'export function MaterialsDemo');
await check('/vault/bottom-sheet', 'export function SheetDemo');
await check('/vault/fluid-springs', 'export function FluidSpringDemo');
await check('/vault/meeting-overlay', 'class AnimationController');
// screenshots
await page.goto('http://localhost:5173/vault/materials', { waitUntil: 'networkidle' });
await page.waitForTimeout(2600);
await page.screenshot({ path: './diff/materials-detail.png', fullPage: true });
await browser.close();
console.log('done');
