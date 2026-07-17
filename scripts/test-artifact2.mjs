import { chromium } from 'playwright';
const file = process.argv[2];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto('file://' + file, { waitUntil: 'load' });
await page.waitForTimeout(2600);
const cards = await page.locator('#view-feed a.card').count();
console.log('feed cards:', cards);
// springs chip is animating ambient flicks on the feed
const chip = page.locator('#fs-feed .fs-chip');
const t1 = await chip.evaluate((el) => el.style.transform);
await page.waitForTimeout(1800);
const t2 = await chip.evaluate((el) => el.style.transform);
console.log('feed chip animating:', t1 !== t2);
// route to springs detail
await page.locator('a[href="#/fluid-springs"]').click();
await page.waitForTimeout(700);
console.log('springs view visible:', await page.locator('#view-springs').isVisible(), '| feed hidden:', !(await page.locator('#view-feed').isVisible()));
console.log('fs tabs:', await page.locator('#fs-tabs button').count(), '| pre has code:', (await page.locator('#fs-pre').textContent()).includes('2 * Math.PI'));
// flick button moves the playground chip
const pchip = page.locator('#fs-play .fs-chip');
const p1 = await pchip.evaluate((el) => el.style.transform);
await page.locator('#fs-flick').click();
await page.waitForTimeout(700);
const p2 = await pchip.evaluate((el) => el.style.transform);
console.log('flick moves playground chip:', p1 !== p2);
// copy prompt
await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
await page.locator('#fs-copy').click();
await page.waitForTimeout(300);
const clip = await page.evaluate(() => navigator.clipboard.readText());
console.log('copied springs prompt length:', clip.length, '| starts ok:', clip.startsWith('Build this: a draggable card'));
// back to feed, then overlay view still works
await page.locator('#view-springs .close-x').click();
await page.waitForTimeout(500);
await page.locator('a[href="#/meeting-overlay"]').click();
await page.waitForTimeout(700);
console.log('overlay view visible:', await page.locator('#view-detail').isVisible());
console.log('errors:', errors.length ? errors.join(' | ') : 'none');
await browser.close();
