/* Reactive Dither evidence capture — desktop feed card, expanded hero,
   implementation, pointer-displaced and inverted states. Run with the dev
   server live: node scripts/capture-reactive-dither-evidence.mjs */
import { chromium } from 'playwright'

const BASE = process.env.VAULT_URL ?? 'http://127.0.0.1:5173'
const OUT = 'artifacts/design-qa/reactive-dither-2026-07-18'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
const card = page.locator('a[href="/vault/reactive-dither"]').first()
await card.scrollIntoViewIfNeeded()
await page.waitForTimeout(1200)
await card.screenshot({ path: `${OUT}/feed-1440.png` })

await page.goto(`${BASE}/vault/reactive-dither`, { waitUntil: 'networkidle' })
await page.waitForSelector('.rd-demo--playground canvas')
await page.waitForTimeout(900)
await page.locator('.rd-demo--compact').first().screenshot({ path: `${OUT}/detail-hero-1440.png` })

const playground = page.locator('.rd-demo--playground')
await playground.screenshot({ path: `${OUT}/detail-implementation-1440.png` })

const canvasBox = await page.locator('.rd-demo--playground canvas').boundingBox()
await page.mouse.move(canvasBox.x + canvasBox.width * 0.38, canvasBox.y + canvasBox.height * 0.45, { steps: 8 })
await page.waitForTimeout(350)
await playground.screenshot({ path: `${OUT}/detail-displaced-1440.png` })

await page.mouse.move(12, 12)
await page.getByRole('button', { name: 'Inverted' }).click()
await page.waitForTimeout(350)
await playground.screenshot({ path: `${OUT}/detail-inverted-1440.png` })

await browser.close()

/* Reduced motion renders the fully settled mark — the true silhouette. */
const settledBrowser = await chromium.launch()
const settled = await settledBrowser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
await settled.goto(`${BASE}/vault/reactive-dither`, { waitUntil: 'networkidle' })
await settled.waitForSelector('.rd-demo--playground canvas')
await settled.waitForTimeout(700)
await settled.locator('.rd-demo--playground').screenshot({ path: `${OUT}/detail-settled-1440.png` })
await settled.locator('.rd-demo--compact').first().screenshot({ path: `${OUT}/detail-hero-settled-1440.png` })
await settledBrowser.close()

console.log('captures written to', OUT)
