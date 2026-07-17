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
console.log('feed grid buttons:', await page.locator('#bt-feed .bt').count(), '/9');
// route + interactions
await page.locator('a[href="#/micro-buttons"]').click();
await page.waitForTimeout(600);
console.log('buttons view visible:', await page.locator('#view-buttons').isVisible());
const play = page.locator('#bt-play');
await play.scrollIntoViewIfNeeded();
// deploy morph: busy state becomes visible after click
const deployBtn = play.locator('[data-k="deploy"]');
await deployBtn.click();
await page.waitForTimeout(300);
const busyVisible = await play.locator('.st-busy').evaluate((el) => !el.classList.contains('off'));
await page.waitForTimeout(1200);
const doneVisible = await play.locator('[data-k="deploy"] .st-done').evaluate((el) => !el.classList.contains('off'));
console.log('deploy morph busy→done:', busyVisible, doneVisible);
// delete arms
const delBtn = play.locator('[data-k="delete"]');
await delBtn.click();
await page.waitForTimeout(200);
const armed = await delBtn.evaluate((el) => el.classList.contains('armed'));
await delBtn.click();
await page.waitForTimeout(200);
const confirmedVisible = await play.locator('[data-k="delete"] .st-done').evaluate((el) => !el.classList.contains('off'));
console.log('delete arm → confirm:', armed, confirmedVisible);
// bell toggles label
const bell = play.locator('[data-k="bell"]');
await bell.click();
await page.waitForTimeout(200);
console.log('subscribe label:', (await bell.textContent()).includes('Subscribed'));
// play-all + reset chips
await page.locator('#bt-playall').click();
await page.waitForTimeout(400);
await page.locator('#bt-reset').click();
await page.waitForTimeout(200);
console.log('after reset, bell label back:', (await bell.textContent()).includes('Subscribe'));
// copy ships the full source
await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
await page.locator('#bt-copy').click();
await page.waitForTimeout(300);
const clip = await page.evaluate(() => navigator.clipboard.readText());
console.log('copy:', (clip.length / 1000).toFixed(1) + 'k | full source:', clip.includes('export function MicroButtonsDemo'));
// feed button click must not navigate
await page.evaluate(() => { location.hash = '#/'; });
await page.waitForTimeout(400);
await page.locator('#bt-feed [data-k="star"]').click();
await page.waitForTimeout(300);
console.log('feed star click stays on feed:', await page.locator('#view-feed').isVisible());
// all views route
for (const [h, id] of [['#/micro-buttons', '#view-buttons'], ['#/materials', '#view-materials'], ['#/bottom-sheet', '#view-sheet'], ['#/fluid-springs', '#view-springs'], ['#/meeting-overlay', '#view-detail'], ['#/', '#view-feed']]) {
  await page.evaluate((x) => { location.hash = x; }, h);
  await page.waitForTimeout(300);
  if (!(await page.locator(id).isVisible())) console.log('ROUTE FAIL:', h);
}
console.log('all routes ok');
console.log('errors:', errors.length ? errors.join(' | ') : 'none');
await browser.close();
