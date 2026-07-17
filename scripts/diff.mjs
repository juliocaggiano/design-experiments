#!/usr/bin/env node
/**
 * diff.mjs — Screenshot the rebuild and compare it to the reference, per viewport.
 *
 * This is the feedback loop. A spec, however detailed, degrades when re-read.
 * Pixel diffing is what actually closes the gap: build → screenshot → diff → fix → repeat.
 *
 * Usage:
 *   node diff.mjs <rebuildUrl> <captureDir> <outDir> [--viewports=390,768,1440] [--threshold=0.1]
 *
 *   rebuildUrl   running dev server of your rebuild, e.g. http://localhost:3000
 *   captureDir   the capture bundle dir (must contain screenshots/<w>.png)
 *   outDir       where diff images + report are written
 *
 * Output:
 *   <outDir>/<w>-reference.png  <w>-rebuild.png  <w>-diff.png   (per viewport)
 *   <outDir>/diff-report.json   mismatch ratio per viewport + verdict
 *
 * Requires playwright + pixelmatch + pngjs.
 */

import { mkdir, writeFile, readFile, access } from 'node:fs/promises';
import { join } from 'node:path';

let chromium, pixelmatch, PNG;
try {
  ({ chromium } = await import('playwright'));
  pixelmatch = (await import('pixelmatch')).default;
  ({ PNG } = await import('pngjs'));
} catch {
  console.error('Missing deps. Run:\n  npm i -D playwright pixelmatch pngjs && npx playwright install chromium');
  process.exit(2);
}

const [rebuildUrl, captureDir, outDir] = process.argv.slice(2);
if (!rebuildUrl || !captureDir || !outDir) {
  console.error('Usage: node diff.mjs <rebuildUrl> <captureDir> <outDir> [--viewports=...] [--threshold=0.1]');
  process.exit(1);
}
const vpArg = process.argv.find((a) => a.startsWith('--viewports='));
const viewports = (vpArg ? vpArg.split('=')[1] : '390,768,1440').split(',').map((n) => parseInt(n, 10)).filter(Boolean);
const thrArg = process.argv.find((a) => a.startsWith('--threshold='));
const threshold = thrArg ? parseFloat(thrArg.split('=')[1]) : 0.1;

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ deviceScaleFactor: 2 });
const page = await ctx.newPage();

const report = { rebuildUrl, viewports, threshold, results: [] };

for (const w of viewports) {
  const refPath = join(captureDir, 'screenshots', `${w}.png`);
  try { await access(refPath); } catch {
    report.results.push({ viewport: w, error: `reference ${refPath} not found` });
    continue;
  }
  await page.setViewportSize({ width: w, height: 900 });
  await page.goto(rebuildUrl, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.evaluate(async () => {
    await new Promise((r) => { let y = 0; const s = () => { window.scrollBy(0, innerHeight); y += innerHeight; (y < document.body.scrollHeight && y < 30000) ? setTimeout(s, 120) : r(); }; s(); });
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(500);
  const rebuildPath = join(outDir, `${w}-rebuild.png`);
  await page.screenshot({ path: rebuildPath, fullPage: true });

  const ref = PNG.sync.read(await readFile(refPath));
  const reb = PNG.sync.read(await readFile(rebuildPath));
  // Compare on a shared canvas sized to the smaller height to avoid index overrun.
  const width = Math.min(ref.width, reb.width);
  const height = Math.min(ref.height, reb.height);
  const crop = (src) => {
    const out = new PNG({ width, height });
    for (let y = 0; y < height; y++)
      for (let x = 0; x < width; x++) {
        const si = (src.width * y + x) << 2;
        const di = (width * y + x) << 2;
        out.data[di] = src.data[si]; out.data[di + 1] = src.data[si + 1];
        out.data[di + 2] = src.data[si + 2]; out.data[di + 3] = src.data[si + 3];
      }
    return out;
  };
  const a = crop(ref), b = crop(reb);
  const diff = new PNG({ width, height });
  const mismatched = pixelmatch(a.data, b.data, diff.data, width, height, { threshold });
  await writeFile(join(outDir, `${w}-reference.png`), PNG.sync.write(a));
  await writeFile(join(outDir, `${w}-diff.png`), PNG.sync.write(diff));
  const ratio = mismatched / (width * height);
  report.results.push({
    viewport: w,
    mismatchedPixels: mismatched,
    totalPixels: width * height,
    mismatchRatio: Number(ratio.toFixed(4)),
    heightDelta: ref.height - reb.height,
    verdict: ratio < 0.02 ? 'close' : ratio < 0.08 ? 'review' : 'far',
  });
}

await browser.close();
report.worstViewport = report.results.filter((r) => !r.error).sort((a, b) => b.mismatchRatio - a.mismatchRatio)[0] || null;
await writeFile(join(outDir, 'diff-report.json'), JSON.stringify(report, null, 2));
console.log('Diff complete →', join(outDir, 'diff-report.json'));
for (const r of report.results) {
  if (r.error) console.log(`  ${r.viewport}px: ERROR ${r.error}`);
  else console.log(`  ${r.viewport}px: ${(r.mismatchRatio * 100).toFixed(1)}% mismatch [${r.verdict}] (open ${r.viewport}-diff.png)`);
}
