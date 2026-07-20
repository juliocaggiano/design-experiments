/* Batch 9 evidence captures — annotated-screenshot change batch:
   (1) title-to-frame gap, (2) divider-free Description header, (3) tab-bar
   left nudge, (4) native-width centered LC playground, (5) 24/22 corner
   radii, (6) Codex sample content with original glyph, (7) SliderChip ports.
   Run with the dev server live: node scripts/capture-batch9.mjs */
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const BASE = process.env.VAULT_URL ?? 'http://127.0.0.1:5173'
const OUT = new URL('../artifacts/design-qa/batch9-2026-07-19/', import.meta.url).pathname
await mkdir(OUT, { recursive: true })

/* Same SliderChip driver as the verify suites: proportional click, then
   arrow-key nudges until aria-valuenow matches the target exactly. */
async function setSlider(page, name, target, min, max) {
  const slider = page.getByRole('slider', { name })
  const box = await slider.boundingBox()
  const k = (target - min) / (max - min)
  await slider.click({ position: { x: Math.min(box.width - 1, Math.max(1, k * box.width)), y: box.height / 2 } })
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const now = Number(await slider.getAttribute('aria-valuenow'))
    if (now === target) return
    await slider.press(now < target ? 'ArrowRight' : 'ArrowLeft')
    await page.waitForTimeout(60)
  }
  throw new Error(`slider "${name}" could not reach ${target}`)
}

const browser = await chromium.launch()

/* 1. Feed top — tab bar sits 4 px left of the headline column. */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)
  await page.screenshot({ path: `${OUT}feed-top.png` })
  await page.close()
}

/* 2. Meeting-overlay detail — 36 px title gap, divider-free Description
   header, and the reference SliderChip style the other panels now share. */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto(`${BASE}/vault/meeting-overlay`, { waitUntil: 'networkidle' })
  await page.waitForSelector('h1')
  await page.waitForTimeout(700)
  await page.screenshot({ path: `${OUT}meeting-detail-top.png` })
  await page.getByRole('slider').first().scrollIntoViewIfNeeded()
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${OUT}meeting-detail-controls.png` })
  await page.close()
}

/* 3. Liquid Connector detail — native-width centered stage, Codex sample
   content, and the fused waist at gap −5 / −28 with the tuned 24/22 radii. */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto(`${BASE}/vault/liquid-connector`, { waitUntil: 'networkidle' })
  await page.waitForSelector('.lc-demo--playground svg.lc-stage')
  await page.waitForTimeout(900)
  await page.screenshot({ path: `${OUT}lc-detail-top.png` })
  await page.locator('.lc-demo--playground .lc-output-content').first().screenshot({ path: `${OUT}lc-connector-card.png` })

  await setSlider(page, 'Rest gap', -5, -60, 10)
  await page.waitForTimeout(300)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.locator('.lc-demo--playground').screenshot({ path: `${OUT}lc-stage-gap-5.png` })

  await setSlider(page, 'Rest gap', -28, -60, 10)
  await page.waitForTimeout(300)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.locator('.lc-demo--playground').screenshot({ path: `${OUT}lc-stage-gap-28.png` })

  /* SliderChip panel in the ported style. */
  await page.locator('[aria-label="Liquid connector settings"]').scrollIntoViewIfNeeded()
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${OUT}lc-detail-controls.png` })
  await page.close()
}

await browser.close()
console.log(`captures in ${OUT}`)
