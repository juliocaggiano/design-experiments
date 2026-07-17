import { chromium } from 'playwright';
const file = process.argv[2];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('file://' + file + '#/materials', { waitUntil: 'load' });
await page.waitForTimeout(800);
const btn = page.locator('#mt-play .gl-btn');
await btn.scrollIntoViewIfNeeded();
// sample the scale every frame for 400ms after clicking Pulse
const min = await page.evaluate(async () => {
  const btn = document.querySelector('#mt-play .gl-btn');
  document.getElementById('mt-open').click();
  let m = 1;
  const t0 = performance.now();
  while (performance.now() - t0 < 400) {
    m = Math.min(m, new DOMMatrix(getComputedStyle(btn).transform).a);
    await new Promise(requestAnimationFrame);
  }
  return m;
});
console.log('min scale within 400ms of Pulse:', min.toFixed(3), '| squeezes:', min < 0.95);
await browser.close();
