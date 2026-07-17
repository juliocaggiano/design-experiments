import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 800 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) });
// wrap in the doctype/head/body skeleton the Artifact host adds
const fs = await import('fs');
const inner = fs.readFileSync(process.argv[2], 'utf8');
const html = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body>' + inner + '</body></html>';
fs.writeFileSync('/tmp/artifact-test.html', html);
await page.goto('file:///tmp/artifact-test.html');
await page.waitForTimeout(2600);
await page.screenshot({ path: './diff/artifact-feed.png', fullPage: true });
await page.evaluate(() => { location.hash = '#/meeting-overlay' });
await page.waitForTimeout(2600);
await page.screenshot({ path: './diff/artifact-detail.png', fullPage: true });
console.log('errors:', errors.length ? errors : 'none');
await browser.close();
