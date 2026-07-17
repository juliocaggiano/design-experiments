import { chromium } from 'playwright';
import fs from 'fs';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('https://www.arlan.me/vault', { waitUntil: 'networkidle', timeout: 60000 });
// scroll to bottom to mount lazy content
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 400) {
    window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60));
  }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(2500);
const inv = await page.evaluate(() => {
  const feed = document.querySelector('main section');
  const out = { header: null, cards: [] };
  const header = feed.querySelector('header');
  if (header) out.header = { html: header.outerHTML, styles: null };
  // cards: direct children after header
  const kids = [...feed.children].filter(el => el.tagName !== 'HEADER');
  for (const k of kids) {
    // each entry: find the media container and the caption row
    const rect = k.getBoundingClientRect();
    const cs = getComputedStyle(k);
    const card = {
      tag: k.tagName.toLowerCase(),
      cls: k.className,
      h: Math.round(rect.height), w: Math.round(rect.width),
      children: []
    };
    const walk = (el, depth) => {
      if (depth > 7) return;
      for (const c of el.children) {
        const s = getComputedStyle(c);
        const r = c.getBoundingClientRect();
        const entry = {
          d: depth, tag: c.tagName.toLowerCase(),
          cls: String(c.className).slice(0, 200),
          h: Math.round(r.height), w: Math.round(r.width),
          bg: s.backgroundColor !== 'rgba(0, 0, 0, 0)' ? s.backgroundColor : undefined,
          radius: s.borderRadius !== '0px' ? s.borderRadius : undefined,
          text: c.children.length === 0 ? (c.textContent || '').trim().slice(0, 80) : undefined,
        };
        if (c.tagName === 'VIDEO') {
          entry.videoSources = [...c.querySelectorAll('source')].map(sr => sr.src);
          entry.poster = c.poster; entry.autoplay = c.autoplay; entry.loop = c.loop;
        }
        if (c.tagName === 'CANVAS') entry.canvas = true;
        if (c.tagName === 'IMG') entry.src = c.src;
        card.children.push(entry);
        walk(c, depth + 1);
      }
    };
    walk(k, 0);
    out.cards.push(card);
  }
  return out;
});
fs.writeFileSync('./capture/inventory.json', JSON.stringify(inv, null, 1));
console.log('cards:', inv.cards.length);
await browser.close();
