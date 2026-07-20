/* Batch-5 evidence captures: reference-style slider panels and the reordered
   expanded pages. Run with the dev server live:
   node scripts/capture-batch5.mjs */
import { chromium } from 'playwright'

const BASE = process.env.VAULT_URL ?? 'http://127.0.0.1:5173'
const OUT = new URL('../artifacts/design-qa/batch5-2026-07-18/', import.meta.url).pathname

const browser = await chromium.launch()

/* Dither controls panel + page top at desktop and both mobile widths. */
for (const [width, height] of [[1440, 900], [390, 844], [320, 720]]) {
  const page = await browser.newPage({ viewport: { width, height } })
  await page.goto(`${BASE}/vault/reactive-dither`, { waitUntil: 'networkidle' })
  await page.waitForSelector('.rd-controls input[type="range"]')
  await page.waitForTimeout(600)
  await page.locator('.rd-controls').screenshot({ path: `${OUT}/dither-controls-${width}.png` })
  if (width === 1440) {
    await page.screenshot({ path: `${OUT}/dither-page-top-1440.png`, fullPage: false })
  }
  await page.close()
}

/* Border-beam controls panel (reference strength row). */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto(`${BASE}/vault/border-beam`, { waitUntil: 'networkidle' })
  await page.waitForSelector('.bb-panel .bb-slider-track')
  await page.waitForTimeout(600)
  await page.locator('.bb-panel').screenshot({ path: `${OUT}/border-beam-controls-1440.png` })
  await page.screenshot({ path: `${OUT}/border-beam-page-top-1440.png`, fullPage: false })
  await page.close()
}

/* A reordered transition page top (Implementation first, no hero). */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto(`${BASE}/vault/card-resize`, { waitUntil: 'networkidle' })
  await page.waitForSelector('.td-demo')
  await page.waitForTimeout(600)
  await page.screenshot({ path: `${OUT}/card-resize-page-top-1440.png`, fullPage: false })
  await page.close()
}

await browser.close()
console.log(`captures written to ${OUT}`)
