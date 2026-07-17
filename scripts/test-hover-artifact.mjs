import { chromium } from 'playwright';
const file = process.argv[2];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto('file://' + file + '#/micro-buttons', { waitUntil: 'load' });
await page.waitForTimeout(1000);
const hero = page.locator('#bt-hero');
await hero.scrollIntoViewIfNeeded();

// slide
const slide = hero.locator('[data-k="slide"]');
await slide.hover();
await page.waitForTimeout(450);
const sl1 = await hero.locator('[data-k="slide"] .bt-sl1').evaluate((el) => getComputedStyle(el).width);
const sl2 = await hero.locator('[data-k="slide"] .bt-sl2').evaluate((el) => getComputedStyle(el).width);
console.log('slide swap:', sl1, '/', sl2, '|', sl1 === '0px' && sl2 === '16px');
// copy linger
const copy = hero.locator('[data-k="copy"]');
await copy.hover();
await page.waitForTimeout(300);
await page.mouse.move(10, 10);
await page.waitForTimeout(200);
const linger = await copy.locator('.l2').evaluate((el) => getComputedStyle(el).opacity);
await page.waitForTimeout(700);
const gone = await copy.locator('.l2').evaluate((el) => getComputedStyle(el).opacity);
console.log('copied lingers then reverts:', Number(linger) > 0.5, Number(gone) < 0.1);
// rotate
const gear = hero.locator('[data-k="rotate"]');
await gear.hover();
await page.waitForTimeout(500);
const rot = await gear.locator('.bt-ic').evaluate((el) => { const m = new DOMMatrix(getComputedStyle(el).transform); return Math.round(Math.atan2(m.b, m.a) * 180 / Math.PI); });
console.log('gear at 180°:', Math.abs(Math.abs(rot) - 180) < 8);
// geometry stability across all hovers
await page.mouse.move(10, 10);
await page.waitForTimeout(400);
const g0 = await hero.locator('.bt-grid').evaluate((el) => { const r = el.getBoundingClientRect(); return `${Math.round(r.width)}x${Math.round(r.height)}`; });
for (let i = 0; i < 9; i++) { await hero.locator('.bt-grid > .bt').nth(i).hover(); await page.waitForTimeout(120); }
await page.mouse.move(10, 10);
await page.waitForTimeout(500);
const g1 = await hero.locator('.bt-grid').evaluate((el) => { const r = el.getBoundingClientRect(); return `${Math.round(r.width)}x${Math.round(r.height)}`; });
console.log('grid stable:', g0, '→', g1, '|', g0 === g1);
// chips + copy payload + routes
await page.locator('#bt-playall').click();
await page.waitForTimeout(300);
const allHot = await hero.locator('.bt.hot').count();
console.log('play-all ghost-hovers all:', allHot === 9, `(${allHot}/9)`);
await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
await page.locator('#bt-copy').click();
await page.waitForTimeout(300);
const clip = await page.evaluate(() => navigator.clipboard.readText());
console.log('copy payload:', (clip.length / 1000).toFixed(1) + 'k | hover spec:', clip.includes('HOVER-driven'));
for (const [h, id] of [['#/', '#view-feed'], ['#/micro-buttons', '#view-buttons'], ['#/materials', '#view-materials'], ['#/bottom-sheet', '#view-sheet'], ['#/fluid-springs', '#view-springs'], ['#/meeting-overlay', '#view-detail']]) {
  await page.evaluate((x) => { location.hash = x; }, h);
  await page.waitForTimeout(300);
  if (!(await page.locator(id).isVisible())) console.log('ROUTE FAIL:', h);
}
console.log('all routes ok');
console.log('errors:', errors.length ? errors.join(' | ') : 'none');
await browser.close();
