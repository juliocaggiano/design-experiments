import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto('http://localhost:5173/vault/micro-buttons', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
const hero = page.locator('div[aria-label*="Nine pill"]').first();

const snap = () => hero.evaluate((h) => {
  const grid = h.querySelector('.bt-grid');
  const g = grid.getBoundingClientRect();
  const btns = [...grid.querySelectorAll(':scope > .bt')].map((b) => {
    const r = b.getBoundingClientRect();
    return { label: b.textContent.trim().slice(0, 14), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
  });
  return { gw: Math.round(g.width), gh: Math.round(g.height), gy: Math.round(g.y), btns, doc: document.documentElement.scrollHeight };
});

const before = await snap();
console.log('BASELINE grid', before.gw + 'x' + before.gh, 'doc', before.doc);
before.btns.forEach((b, i) => console.log(' ', i, b.label.padEnd(14), `${b.w}x${b.h}`, '@', b.x + ',' + b.y));

// click each button and diff geometry (300ms after click, then 1500ms)
const n = await hero.locator('.bt-grid > .bt').count();
for (let i = 0; i < n; i++) {
  const btn = hero.locator('.bt-grid > .bt').nth(i);
  const label = (await btn.textContent()).trim().slice(0, 14);
  await btn.click({ force: true });
  await page.waitForTimeout(300);
  const mid = await snap();
  await page.waitForTimeout(1500);
  const after = await snap();
  const diffs = [];
  if (mid.gh !== before.gh) diffs.push(`grid H ${before.gh}→${mid.gh}`);
  if (mid.gw !== before.gw) diffs.push(`grid W ${before.gw}→${mid.gw}`);
  mid.btns.forEach((b, j) => {
    const o = before.btns[j];
    if (Math.abs(b.y - o.y) > 2) diffs.push(`#${j} ${o.label} y ${o.y}→${b.y}`);
    if (Math.abs(b.h - o.h) > 2) diffs.push(`#${j} ${o.label} h ${o.h}→${b.h}`);
    if (Math.abs(b.w - o.w) > 3) diffs.push(`#${j} ${o.label} w ${o.w}→${b.w}`);
  });
  const settled = [];
  after.btns.forEach((b, j) => {
    const o = before.btns[j];
    if (Math.abs(b.y - o.y) > 2 || Math.abs(b.h - o.h) > 2 || Math.abs(b.w - o.w) > 3) settled.push(`#${j} ${o.label} stays moved`);
  });
  console.log(`CLICK #${i} ${label.padEnd(14)}`, diffs.length ? 'DIFF: ' + diffs.join(' | ') : 'stable', settled.length ? ' | SETTLED-BAD: ' + settled.join(', ') : '');
}
// rapid spam on deploy + star
for (let k = 0; k < 5; k++) { await hero.locator('.bt-grid > .bt').nth(2).click({ force: true }); await page.waitForTimeout(60); }
await page.waitForTimeout(400);
const spam = await snap();
console.log('after deploy spam: grid', spam.gw + 'x' + spam.gh, spam.gh !== before.gh || spam.gw !== before.gw ? '<<< CHANGED' : 'stable');
for (let k = 0; k < 5; k++) { await hero.locator('.bt-grid > .bt').nth(1).click({ force: true }); await page.waitForTimeout(60); }
await page.waitForTimeout(400);
const spam2 = await snap();
console.log('after star spam: grid', spam2.gw + 'x' + spam2.gh, spam2.gh !== before.gh || spam2.gw !== before.gw ? '<<< CHANGED' : 'stable');
await hero.screenshot({ path: './diff/buttons-audit.png' });
console.log('errors:', errors.length ? errors.join(' | ') : 'none');
await browser.close();
