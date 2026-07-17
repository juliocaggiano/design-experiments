import { chromium } from 'playwright';
const browser = await chromium.launch();
const probe = async (url, w) => {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2500);
  const rows = await page.evaluate(() => {
    const grid = document.querySelector('main section > div.relative > div.grid');
    return [...grid.children].map((el) => {
      const r = el.getBoundingClientRect();
      const label = el.querySelector('.truncate')?.textContent || el.getAttribute('data-canvas-card') || el.tagName;
      return { label: String(label).slice(0, 24), top: Math.round(r.top + window.scrollY), h: Math.round(r.height) };
    });
  });
  await page.close();
  return rows;
};
const [a, b] = await Promise.all([
  probe('https://www.arlan.me/vault', 390),
  probe('http://localhost:5173', 390),
]);
console.log('ORIGINAL'.padEnd(30), 'REBUILD');
for (let i = 0; i < Math.max(a.length, b.length); i++) {
  const o = a[i] || {}, m = b[i] || {};
  console.log(
    `${(o.label||'-').padEnd(16)} t${String(o.top).padStart(5)} h${String(o.h).padStart(4)}`,
    ' | ',
    `${(m.label||'-').padEnd(16)} t${String(m.top).padStart(5)} h${String(m.h).padStart(4)}`,
    Math.abs((o.h||0)-(m.h||0)) > 2 ? ' <<< H DIFF' : ''
  );
}
await browser.close();
