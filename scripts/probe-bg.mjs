import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('https://www.arlan.me/vault', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(1500);
const info = await page.evaluate(() => {
  const media = document.querySelector('.pixel-select');
  const s = getComputedStyle(media);
  return { bgImage: s.backgroundImage, bgSize: s.backgroundSize, bgColor: s.backgroundColor, bgPos: s.backgroundPosition };
});
console.log(JSON.stringify(info, null, 1));
await browser.close();
