import { chromium } from 'playwright';
const file = process.argv[2];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto('file://' + file + '#/micro-buttons', { waitUntil: 'load' });
await page.waitForTimeout(900);
const hero = page.locator('#bt-hero');
const snap = () => hero.evaluate((h) => {
  const g = h.querySelector('.bt-grid').getBoundingClientRect();
  return { gw: Math.round(g.width), gh: Math.round(g.height) };
});
const before = await snap();
const n = await hero.locator('.bt-grid > .bt').count();
let unstable = 0;
for (let i = 0; i < n; i++) {
  await hero.locator('.bt-grid > .bt').nth(i).click({ force: true });
  await page.waitForTimeout(250);
  const mid = await snap();
  if (mid.gw !== before.gw || mid.gh !== before.gh) { unstable++; console.log('UNSTABLE #' + i, before, mid); }
  await page.waitForTimeout(1200);
}
console.log('artifact clicks stable:', unstable === 0, `(grid ${before.gw}x${before.gh})`);
// uniform widths
const widths = await hero.locator('.bt-grid > .bt').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().width)));
console.log('uniform widths:', widths.every((w) => w === widths[0]), widths.join(','));
console.log('errors:', errors.length ? errors.join(' | ') : 'none');
await browser.close();
