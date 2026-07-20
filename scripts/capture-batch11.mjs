/* Batch 11 captures: pinned feed order, fluid toggle thumb (settled + mid
   double-bounce), Design Engineering fintech thumb, filled notification
   bell, Gradient Button (stone, 8%) feed + detail.
   Run with the dev server on :5173 — node scripts/capture-batch11.mjs */
import fs from 'node:fs'
import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'
const OUT = 'artifacts/design-qa/batch11-2026-07-20'
fs.mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto(BASE, { waitUntil: 'networkidle' })
await page.waitForTimeout(1400)

/* 1. Feed top — new pinned order (cards 1-9). */
await page.evaluate(() => window.scrollTo(0, 0))
await page.waitForTimeout(400)
await page.screenshot({ path: `${OUT}/feed-top.png` })

const shotCard = async (href, name) => {
  /* Interactive LinkCards render the visible card as an <article> plus an
     sr-only anchor; plain LinkCards are the anchor itself. */
  const card = page.locator(`article:has(a[href="${href}"]), a[href="${href}"]`).first()
  await card.scrollIntoViewIfNeeded()
  await page.waitForTimeout(500)
  await card.screenshot({ path: `${OUT}/${name}.png` })
}

/* 2. Fluid toggle thumb — settled, then mid-flight of the double-bounce. */
const fluidCard = page.locator('a[href="/vault/fluid-springs"]').first()
await fluidCard.scrollIntoViewIfNeeded()
await page.waitForTimeout(600)
await fluidCard.screenshot({ path: `${OUT}/fluid-toggle-thumb.png` })
let mid = null
for (let i = 0; i < 700; i += 1) {
  const x = await page.evaluate(() => {
    const thumb = document.querySelector('.ft-thumb')
    if (!thumb) return null
    const t = getComputedStyle(thumb).translate
    if (!t || t === 'none') return 0
    return parseFloat(t.split(' ')[0])
  })
  if (x !== null && x > 4 && x < 44) { mid = x; break }
  await page.waitForTimeout(16)
}
if (mid !== null) {
  await fluidCard.screenshot({ path: `${OUT}/fluid-toggle-mid-flight.png` })
  console.log(`mid-flight captured at translate ${mid.toFixed(1)}px`)
} else {
  console.log('WARN: no mid-flight sample; settled shot only')
}

/* 3. Design Engineering fintech thumb. */
await shotCard('/vault/skill-design-eng', 'de-thumb')

/* 4. Notification badge — filled bell. */
await shotCard('/vault/notification-badge', 'notification-badge')

/* 5. Gradient Button feed card (stone beam, 8%). */
await shotCard('/vault/border-beam', 'gradient-button-feed')

/* 6. Gradient Button detail — h1 + default stone/8% stage. */
await page.goto(`${BASE}/vault/border-beam`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1200)
await page.screenshot({ path: `${OUT}/gradient-button-detail.png` })

await browser.close()
console.log('batch 11 captures done')
