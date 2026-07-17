import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto('http://localhost:5173/vault/micro-buttons', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
const hero = page.locator('div[aria-label*="Nine pill"]').first();

const styleOf = (sel, prop) => hero.locator(sel).first().evaluate((el, p) => getComputedStyle(el)[p], prop);

// 1. slide-arrow: hover collapses leading slot, expands trailing
const slide = hero.locator('.bt-slide').first();
await slide.hover();
await page.waitForTimeout(450);
const sl1w = await styleOf('.bt-slide .bt-sl1', 'width');
const sl2w = await styleOf('.bt-slide .bt-sl2', 'width');
console.log('slide hover: leading', sl1w, '→ trailing', sl2w, '|', sl1w === '0px' && sl2w === '16px');
await page.mouse.move(10, 10);
await page.waitForTimeout(450);
const sl1back = await styleOf('.bt-slide .bt-sl1', 'width');
console.log('slide reverses on leave:', sl1back === '16px');

// 2. morph: deploy i2 appears on hover
const deploy = hero.locator('.bt-morph').first();
await deploy.hover();
await page.waitForTimeout(400);
const i2op = await deploy.locator('.i2').evaluate((el) => getComputedStyle(el).opacity);
console.log('deploy morph on hover: i2 opacity', i2op, '|', Number(i2op) > 0.9);

// 3. copy: label swaps to Copied and lingers ~500ms after leave
const copy = hero.locator('.bt-morph').nth(1);
await copy.hover();
await page.waitForTimeout(350);
const copiedOn = await copy.locator('.l2').evaluate((el) => getComputedStyle(el).opacity);
await page.mouse.move(10, 10);
await page.waitForTimeout(200);
const stillOn = await copy.locator('.l2').evaluate((el) => getComputedStyle(el).opacity);
await page.waitForTimeout(700);
const offAfter = await copy.locator('.l2').evaluate((el) => getComputedStyle(el).opacity);
console.log('copied label: hover', copiedOn, '| lingers 200ms after leave', Number(stillOn) > 0.5, '| gone after 900ms', Number(offAfter) < 0.1);

// 4. rotate: gear at 180° while hovered
const gear = hero.locator('.bt-rotate').first();
await gear.hover();
await page.waitForTimeout(500);
const rot = await gear.locator('.bt-ic').evaluate((el) => {
  const m = new DOMMatrix(getComputedStyle(el).transform);
  return Math.round(Math.atan2(m.b, m.a) * 180 / Math.PI);
});
console.log('gear rotation while hovered:', rot, '|', Math.abs(Math.abs(rot) - 180) < 8);

// 5. ring: dot pops in
const ring = hero.locator('.bt-ring').first();
await ring.hover();
await page.waitForTimeout(600);
const dot = await ring.locator('.bt-dot').evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a);
console.log('ring dot scale:', dot.toFixed(2), '|', dot > 0.9);

// 6. geometry stability under hover + click spam (fixed cells must hold)
await page.mouse.move(10, 10);
await page.waitForTimeout(400);
const g0 = await hero.locator('.bt-grid').evaluate((el) => { const r = el.getBoundingClientRect(); return `${Math.round(r.width)}x${Math.round(r.height)}`; });
for (let i = 0; i < 9; i++) {
  const b = hero.locator('.bt-grid > .bt').nth(i);
  await b.hover();
  await page.waitForTimeout(120);
  await b.click({ force: true });
}
await page.mouse.move(10, 10);
await page.waitForTimeout(500);
const g1 = await hero.locator('.bt-grid').evaluate((el) => { const r = el.getBoundingClientRect(); return `${Math.round(r.width)}x${Math.round(r.height)}`; });
console.log('grid geometry:', g0, '→', g1, '| stable:', g0 === g1);

// 7. Play all + copy payload
await page.getByRole('button', { name: 'Play all' }).click();
await page.waitForTimeout(400);
await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
await page.locator('button:has-text("Copy prompt")').click();
await page.waitForTimeout(300);
const clip = await page.evaluate(() => navigator.clipboard.readText());
console.log('copy payload:', (clip.length / 1000).toFixed(1) + 'k | hover spec:', clip.includes('HOVER-driven'));
console.log('errors:', errors.length ? errors.join(' | ') : 'none');
await browser.close();
