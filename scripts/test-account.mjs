import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

// LOCAL: account morph swaps on hover, reverses on leave, geometry stable
await page.goto('http://localhost:5173/vault/micro-buttons', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
const hero = page.locator('div[aria-label*="Nine pill"]').first();
const account = hero.locator('.bt-grid > .bt').first();
console.log('first button label:', (await account.textContent()).trim());
const g0 = await hero.locator('.bt-grid').evaluate((el) => { const r = el.getBoundingClientRect(); return `${Math.round(r.width)}x${Math.round(r.height)}`; });
await account.hover();
await page.waitForTimeout(400);
const i2 = await account.locator('.i2').evaluate((el) => ({ o: getComputedStyle(el).opacity, s: new DOMMatrix(getComputedStyle(el).transform).a }));
console.log('hover: check-icon opacity', i2.o, 'scale', i2.s.toFixed(2), '|', Number(i2.o) > 0.9 && i2.s > 0.95);
await page.mouse.move(10, 10);
await page.waitForTimeout(400);
const i2off = await account.locator('.i2').evaluate((el) => getComputedStyle(el).opacity);
const i1back = await account.locator('.i1').evaluate((el) => getComputedStyle(el).opacity);
console.log('leave: reverses (i2 hidden, i1 back):', Number(i2off) < 0.1 && Number(i1back) > 0.9);
const g1 = await hero.locator('.bt-grid').evaluate((el) => { const r = el.getBoundingClientRect(); return `${Math.round(r.width)}x${Math.round(r.height)}`; });
console.log('grid stable:', g0 === g1, `(${g1})`);

// ARTIFACT: same checks + copy payload reflects new set
const file = '/private/tmp/claude-501/-Users-juliocaggiano-Desktop-CLAUDE-CODEX/10157727-c23d-4bb8-b5c9-fddfe9c2492d/scratchpad/vault-caggiano.html';
await page.goto('file://' + file + '#/micro-buttons', { waitUntil: 'load' });
await page.waitForTimeout(900);
const ah = page.locator('#bt-hero [data-k="account"]');
console.log('artifact account label:', (await ah.textContent()).trim());
await ah.scrollIntoViewIfNeeded();
await ah.hover();
await page.waitForTimeout(400);
const ai2 = await ah.locator('.i2').evaluate((el) => getComputedStyle(el).opacity);
console.log('artifact hover morph:', Number(ai2) > 0.9);
await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
await page.locator('#bt-copy').click();
await page.waitForTimeout(300);
const clip = await page.evaluate(() => navigator.clipboard.readText());
console.log('copy payload has Account, no slide-arrow:', clip.includes('"Account"') && clip.includes('name="account"') && !clip.includes('bt-slide'));
console.log('errors:', errors.length ? errors.join(' | ') : 'none');
await browser.close();
