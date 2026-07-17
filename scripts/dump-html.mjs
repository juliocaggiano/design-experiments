import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('https://www.arlan.me/vault', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(3000);
const html = await page.content();
const fs = await import('fs');
fs.writeFileSync('./capture/rendered.html', html);
// Also dump a structural outline of each card
const outline = await page.evaluate(() => {
  const walk = (el, depth, maxDepth) => {
    if (depth > maxDepth) return '';
    const tag = el.tagName.toLowerCase();
    const cls = (el.className && typeof el.className === 'string') ? el.className.split(' ').slice(0,6).join('.') : '';
    const txt = el.children.length === 0 ? (el.textContent || '').trim().slice(0, 60) : '';
    let line = '  '.repeat(depth) + tag + (cls ? '.' + cls : '') + (txt ? ` "${txt}"` : '') + '\n';
    for (const c of el.children) line += walk(c, depth + 1, maxDepth);
    return line;
  };
  return walk(document.body, 0, 5);
});
fs.writeFileSync('./capture/outline.txt', outline);
await browser.close();
console.log('done, html bytes:', fs.statSync('./capture/rendered.html').size);
