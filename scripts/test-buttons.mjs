import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto('http://localhost:5173/vault/micro-buttons', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
const hero = page.locator('div[aria-label*="Nine pill"]').first();
// deploy morph cycle
const deploy = hero.locator('button', { hasText: 'Deploy' }).first();
await deploy.click();
await page.waitForTimeout(400);
const busy = await deploy.textContent();
await page.waitForTimeout(1100);
const done = await deploy.textContent();
await page.waitForTimeout(1400);
const idle = await deploy.textContent();
console.log('deploy morph:', JSON.stringify(busy), '→', JSON.stringify(done), '→', JSON.stringify(idle));
// delete arms then confirms
const del = hero.locator('button', { hasText: /Delete|Sure/ }).first();
await del.click();
await page.waitForTimeout(300);
const armed = await del.textContent();
await del.click();
await page.waitForTimeout(300);
const confirmed = await del.textContent();
console.log('delete two-stage:', JSON.stringify(armed), '→', JSON.stringify(confirmed));
// subscribe toggles
const sub = hero.locator('button', { hasText: /Subscribe/ }).first();
await sub.click();
await page.waitForTimeout(300);
console.log('subscribe toggled:', (await sub.textContent()).includes('Subscribed'));
// play-all chip triggers, copy ships full source
await page.locator('button:has-text("Play all")').click();
await page.waitForTimeout(500);
await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
await page.locator('button:has-text("Copy prompt")').click();
await page.waitForTimeout(300);
const clip = await page.evaluate(() => navigator.clipboard.readText());
console.log('copy:', (clip.length / 1000).toFixed(1) + 'k | full source:', clip.includes('export function MicroButtonsDemo'));
// clicking a button on the FEED card must not navigate
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
const feedStar = page.locator('a[href="/vault/micro-buttons"] button', { hasText: 'Star' }).first();
await feedStar.click();
await page.waitForTimeout(400);
console.log('feed button click stays on feed:', page.url().endsWith('/'));
await page.screenshot({ path: './diff/buttons-feed.png' });
// 390px layout
await page.setViewportSize({ width: 390, height: 844 });
await page.goto('http://localhost:5173/vault/micro-buttons', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
console.log('390px: no horizontal overflow:', !overflow);
await page.screenshot({ path: './diff/buttons-390.png' });
console.log('errors:', errors.length ? errors.join(' | ') : 'none');
await browser.close();
