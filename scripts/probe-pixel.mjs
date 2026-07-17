import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
await page.goto('https://www.arlan.me/vault', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(2000);
const info = await page.evaluate(() => {
  const media = document.querySelector('.pixel-select');
  const inner = media.firstElementChild;
  const ms = getComputedStyle(media);
  const is = getComputedStyle(inner);
  const mr = media.getBoundingClientRect();
  const ir = inner.getBoundingClientRect();
  return {
    mediaClass: media.className,
    mediaSize: [Math.round(mr.width), Math.round(mr.height)],
    mediaAspect: ms.aspectRatio, mediaPadding: ms.padding, mediaMinH: ms.minHeight,
    innerClass: inner.className,
    innerSize: [Math.round(ir.width), Math.round(ir.height)],
    innerAspect: is.aspectRatio, innerMargin: is.margin, innerMaxW: is.maxWidth,
  };
});
console.log(JSON.stringify(info, null, 1));
await browser.close();
