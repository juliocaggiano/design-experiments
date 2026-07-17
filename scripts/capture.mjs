#!/usr/bin/env node
/**
 * capture.mjs — Ground-truth capture of a reference web page.
 *
 * Produces a "capture bundle" so the rebuild is verified against real data
 * instead of the model's memory of what the page looked like.
 *
 * Usage:
 *   node capture.mjs <url> <outDir> [--viewports=390,768,1440] [--no-assets]
 *
 * Output (inside <outDir>/):
 *   screenshots/<w>.png        full-page screenshot per viewport
 *   screenshots/<w>-fold.png   above-the-fold screenshot per viewport
 *   assets/                    downloaded same-origin-ish static assets
 *   tokens.json                colors, fonts, CSS variables, type scale (measured)
 *   dom.json                   section outline + per-element computed styles
 *   network.json              every request the page made (url, type, status, bytes)
 *   assets-manifest.json       asset list with local paths + download status
 *   meta.json                  title, framework hints, viewport list, timestamps
 *
 * Requires Playwright. If not present the script prints the install command and exits 2.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { join, extname } from 'node:path';
import { pipeline } from 'node:stream/promises';

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error(
    'Playwright not installed. Run:\n  npm i -D playwright && npx playwright install chromium'
  );
  process.exit(2);
}

// ---- args ----------------------------------------------------------------
const [url, outDir] = process.argv.slice(2);
if (!url || !outDir) {
  console.error('Usage: node capture.mjs <url> <outDir> [--viewports=390,768,1440] [--no-assets]');
  process.exit(1);
}
const vpArg = process.argv.find((a) => a.startsWith('--viewports='));
const viewports = (vpArg ? vpArg.split('=')[1] : '390,768,1440')
  .split(',')
  .map((n) => parseInt(n.trim(), 10))
  .filter(Boolean);
const downloadAssets = !process.argv.includes('--no-assets');

await mkdir(join(outDir, 'screenshots'), { recursive: true });
await mkdir(join(outDir, 'assets'), { recursive: true });

// ---- browser -------------------------------------------------------------
const browser = await chromium.launch();
const ctx = await browser.newContext({ deviceScaleFactor: 2 });
const page = await ctx.newPage();

// Record every network request — this is the only reliable asset list.
const network = [];
page.on('response', async (res) => {
  try {
    const req = res.request();
    const headers = res.headers();
    network.push({
      url: res.url(),
      method: req.method(),
      status: res.status(),
      type: req.resourceType(),
      contentType: headers['content-type'] || '',
      bytes: Number(headers['content-length'] || 0),
    });
  } catch { /* ignore */ }
});

const widest = Math.max(...viewports);
await page.setViewportSize({ width: widest, height: 900 });
await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
// Scroll the page to trigger lazy-loaded assets and scroll-reveal sections.
await page.evaluate(async () => {
  await new Promise((resolve) => {
    let y = 0;
    const step = () => {
      window.scrollBy(0, window.innerHeight);
      y += window.innerHeight;
      if (y < document.body.scrollHeight && y < 30000) setTimeout(step, 150);
      else resolve();
    };
    step();
  });
  window.scrollTo(0, 0);
});
await page.waitForTimeout(800);

// ---- in-page extraction --------------------------------------------------
// Runs in the browser: returns measured tokens + a section/element outline.
const extracted = await page.evaluate(() => {
  const seen = { colors: {}, bg: {}, fonts: {}, sizes: {}, weights: {}, radii: {}, shadows: {} };
  const bump = (obj, k) => { if (k && k !== 'none' && k !== 'normal') obj[k] = (obj[k] || 0) + 1; };

  // CSS custom properties declared on :root.
  const rootStyle = getComputedStyle(document.documentElement);
  const cssVars = {};
  for (const name of rootStyle) {
    if (name.startsWith('--')) cssVars[name] = rootStyle.getPropertyValue(name).trim();
  }

  // @font-face families actually loaded.
  const fontFaces = [];
  try {
    document.fonts.forEach((f) => fontFaces.push({ family: f.family, weight: f.weight, style: f.style, status: f.status }));
  } catch { /* ignore */ }

  const all = Array.from(document.querySelectorAll('body *')).slice(0, 4000);
  for (const el of all) {
    const s = getComputedStyle(el);
    bump(seen.colors, s.color);
    bump(seen.bg, s.backgroundColor);
    bump(seen.fonts, s.fontFamily);
    bump(seen.sizes, s.fontSize);
    bump(seen.weights, s.fontWeight);
    bump(seen.radii, s.borderRadius);
    if (s.boxShadow && s.boxShadow !== 'none') bump(seen.shadows, s.boxShadow);
  }

  // Section outline: direct structural children of main/body, with key boxes.
  const root = document.querySelector('main') || document.body;
  const sections = Array.from(root.children).map((el, i) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    const heading = el.querySelector('h1,h2,h3');
    return {
      index: i,
      tag: el.tagName.toLowerCase(),
      id: el.id || null,
      classes: (el.className && el.className.toString().slice(0, 200)) || null,
      heading: heading ? heading.textContent.trim().slice(0, 120) : null,
      width: Math.round(r.width),
      height: Math.round(r.height),
      background: s.backgroundColor,
      backgroundImage: s.backgroundImage !== 'none' ? s.backgroundImage.slice(0, 300) : null,
      padding: s.padding,
      display: s.display,
      position: s.position,
      textPreview: el.textContent.trim().replace(/\s+/g, ' ').slice(0, 160),
    };
  });

  // Asset-ish references found in the DOM (imgs, svgs, videos, inline bg images).
  const domAssets = [];
  document.querySelectorAll('img[src],img[srcset],source[src],source[srcset],video[src],use[href],use[xlink\\:href]').forEach((el) => {
    const v = el.getAttribute('src') || el.getAttribute('srcset') || el.getAttribute('href') || el.getAttribute('xlink:href');
    if (v) domAssets.push({ tag: el.tagName.toLowerCase(), ref: v.split(' ')[0] });
  });

  const top = (obj, n) => Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, c]) => ({ value: k, count: c }));

  return {
    title: document.title,
    cssVars,
    fontFaces,
    sections,
    domAssets,
    tokens: {
      textColors: top(seen.colors, 12),
      backgrounds: top(seen.bg, 12),
      fontFamilies: top(seen.fonts, 6),
      fontSizes: top(seen.sizes, 16),
      fontWeights: top(seen.weights, 8),
      borderRadii: top(seen.radii, 8),
      boxShadows: top(seen.shadows, 8),
    },
    framework: {
      next: !!document.querySelector('#__next, script#__NEXT_DATA__'),
      nuxt: !!document.querySelector('#__nuxt'),
      react: !!document.querySelector('[data-reactroot]') || !!window.React,
      svelte: !!document.querySelector('[class*="svelte-"]'),
      gsap: !!window.gsap,
      framerMotion: !!document.querySelector('[style*="transform"][data-projection-id]'),
    },
  };
});

// ---- screenshots per viewport -------------------------------------------
for (const w of viewports) {
  await page.setViewportSize({ width: w, height: 900 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(outDir, 'screenshots', `${w}-fold.png`) });
  await page.screenshot({ path: join(outDir, 'screenshots', `${w}.png`), fullPage: true });
}

// ---- asset download ------------------------------------------------------
const assetTypes = new Set(['image', 'font', 'media', 'stylesheet']);
const manifest = [];
const origin = new URL(url).origin;
if (downloadAssets) {
  const candidates = network.filter((n) => assetTypes.has(n.type) && n.status < 400);
  let idx = 0;
  for (const a of candidates) {
    idx += 1;
    let localName = null, ok = false, note = '';
    try {
      const u = new URL(a.url);
      const base = (u.pathname.split('/').pop() || `asset-${idx}`).split('?')[0] || `asset-${idx}`;
      const ext = extname(base) || '';
      localName = `${String(idx).padStart(3, '0')}-${base}`.slice(0, 80) + (extname(base) ? '' : ext);
      const resp = await ctx.request.get(a.url, { timeout: 20000 });
      if (resp.ok()) {
        const buf = await resp.body();
        await writeFile(join(outDir, 'assets', localName), buf);
        ok = true;
      } else note = `http ${resp.status()}`;
    } catch (e) { note = String(e.message || e).slice(0, 120); }
    manifest.push({
      sourceUrl: a.url,
      localPath: ok ? `assets/${localName}` : null,
      type: a.type,
      contentType: a.contentType,
      sameOrigin: a.url.startsWith(origin),
      downloaded: ok,
      note: ok ? '' : (note || 'UNAVAILABLE — do not substitute silently'),
    });
  }
}

// ---- write bundle --------------------------------------------------------
const now = new Date().toISOString();
await writeFile(join(outDir, 'network.json'), JSON.stringify(network, null, 2));
await writeFile(join(outDir, 'assets-manifest.json'), JSON.stringify(manifest, null, 2));
await writeFile(join(outDir, 'tokens.json'), JSON.stringify({
  cssVars: extracted.cssVars,
  fontFaces: extracted.fontFaces,
  ...extracted.tokens,
}, null, 2));
await writeFile(join(outDir, 'dom.json'), JSON.stringify({
  sections: extracted.sections,
  domAssets: extracted.domAssets,
}, null, 2));
await writeFile(join(outDir, 'meta.json'), JSON.stringify({
  url, title: extracted.title, viewports,
  framework: extracted.framework,
  capturedAt: now,
  counts: {
    requests: network.length,
    assetsDownloaded: manifest.filter((m) => m.downloaded).length,
    assetsFailed: manifest.filter((m) => !m.downloaded).length,
    sections: extracted.sections.length,
  },
}, null, 2));

await browser.close();
console.log(`Capture complete → ${outDir}`);
console.log(`  ${network.length} requests, ${manifest.filter((m) => m.downloaded).length} assets saved, ${extracted.sections.length} sections`);
console.log(`  screenshots at ${viewports.join(', ')}px`);
