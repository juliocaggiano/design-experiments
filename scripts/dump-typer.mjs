import { chromium } from 'playwright';
import fs from 'fs';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('https://www.arlan.me/vault/typer', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(2500);
const html = await page.evaluate(() => {
  const el = document.querySelector('main');
  // strip the big code text to keep the dump readable
  const clone = el.cloneNode(true);
  clone.querySelectorAll('pre, code').forEach(c => { c.textContent = '…'; });
  clone.querySelectorAll('style, script').forEach(c => c.remove());
  return clone.outerHTML;
});
fs.writeFileSync('./capture-typer/main.html', html);
console.log('bytes', html.length);
await browser.close();
