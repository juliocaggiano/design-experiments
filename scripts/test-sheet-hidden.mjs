import { chromium } from 'playwright';
const file = process.argv[2];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));

// SCENARIO A (Julio's bug): load on feed, THEN open the sheet card
await page.goto('file://' + file, { waitUntil: 'load' });
await page.waitForTimeout(1500);
await page.locator('a[href="#/bottom-sheet"]').click();
await page.waitForTimeout(800);
const heroBoxH = (await page.locator('#sh-hero').boundingBox()).height;
const heroY = await page.locator('#sh-hero .sh-sheet').evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m42);
console.log('A) feed→detail: hero sheet at', Math.round(heroY), '≈ half (', Math.round(heroBoxH * 0.48), ') |', Math.abs(heroY - heroBoxH * 0.48) < 4 ? 'FIXED' : 'STILL BROKEN');
const playBoxH = (await page.locator('#sh-play').boundingBox()).height;
const playY = await page.locator('#sh-play .sh-sheet').evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m42);
console.log('   playground sheet at', Math.round(playY), '≈ half (', Math.round(playBoxH * 0.48), ') |', Math.abs(playY - playBoxH * 0.48) < 4 ? 'FIXED' : 'STILL BROKEN');

// SCENARIO B: load directly on the sheet view, then go back to the feed
const page2 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page2.goto('file://' + file + '#/bottom-sheet', { waitUntil: 'load' });
await page2.waitForTimeout(1200);
const h2 = (await page2.locator('#sh-hero').boundingBox()).height;
const y2 = await page2.locator('#sh-hero .sh-sheet').evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m42);
console.log('B) direct-load detail: hero at', Math.round(y2), '≈ half |', Math.abs(y2 - h2 * 0.48) < 4);
await page2.evaluate(() => { location.hash = '#/'; });
await page2.waitForTimeout(700);
const fh = (await page2.locator('#sh-feed').boundingBox()).height;
const fy = await page2.locator('#sh-feed .sh-sheet').evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m42);
console.log('   then feed card at', Math.round(fy), '≈ half (', Math.round(fh * 0.48), ') |', Math.abs(fy - fh * 0.48) < 4);

// springs chip sane after being hidden at load (scenario B: springs view was hidden)
await page2.evaluate(() => { location.hash = '#/fluid-springs'; });
await page2.waitForTimeout(3500);
const chip = await page2.locator('#fs-hero .fs-chip').boundingBox();
const heroBox = await page2.locator('#fs-hero').boundingBox();
const inside = chip.x >= heroBox.x - 2 && chip.y >= heroBox.y - 2 && chip.x + chip.width <= heroBox.x + heroBox.width + 2 && chip.y + chip.height <= heroBox.y + heroBox.height + 2;
console.log('C) springs chip inside its box after hidden load:', inside);
console.log('errors:', errors.length ? errors.join(' | ') : 'none');
await browser.close();
