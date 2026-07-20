/* Batch 13 captures: Fluid Cards restored (detail top + feed card with the
   blue-dot fluid card), Scroll Gallery with the owner's nine covers (feed
   card + detail coverflow), and a smoke check that every cover asset 200s.
   Run with the dev server on :5173 — node scripts/capture-batch13.mjs */
import fs from 'node:fs'
import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'
const OUT = 'artifacts/design-qa/batch13-2026-07-20'
fs.mkdirSync(OUT, { recursive: true })

const COVER_FILES = [
  'no-photos-please', 'uvalde-may-24-2022', 'summer-treat', 'making-mischief',
  'heres-looking-at-you', 'rat-race', 'the-face-of-justice', 'fighting-back',
]

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', (e) => errors.push(String(e)))

/* Every bundled cover asset serves. */
for (const slug of COVER_FILES) {
  const res = await page.request.get(`${BASE}/vault/scrollgallery/${slug}.jpg`)
  if (!res.ok()) throw new Error(`cover asset ${slug} returned ${res.status()}`)
}
console.log(`all ${COVER_FILES.length} cover assets serve 200`)

/* Fluid Cards detail — restored: no toggle, draggable card only. */
await page.goto(`${BASE}/vault/fluid-springs`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1200)
if (await page.locator('.ft-stage').count() !== 0) throw new Error('toggle stage still present on fluid detail')
await page.screenshot({ path: `${OUT}/fluid-detail-top-restored.png` })

/* Feed — Fluid Cards thumbnail restored to the fluid (blue-dot) card. */
await page.goto(BASE, { waitUntil: 'networkidle' })
await page.waitForTimeout(1400)
const fluidCard = page.locator('a[href="/vault/fluid-springs"]').first()
await fluidCard.scrollIntoViewIfNeeded()
await page.waitForTimeout(500)
await fluidCard.screenshot({ path: `${OUT}/fluid-feed-card-restored.png` })

/* Scroll Gallery feed card + detail coverflow with the new covers. */
const scrollCard = page.locator('article:has(a[href="/vault/chief-keef-index"]), a[href="/vault/chief-keef-index"]').first()
await scrollCard.scrollIntoViewIfNeeded()
await page.waitForTimeout(500)
await scrollCard.screenshot({ path: `${OUT}/scrollgallery-feed-card.png` })

await page.goto(`${BASE}/vault/chief-keef-index`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)
const coverCount = await page.locator('.cki-cover').count()
if (coverCount !== 9) throw new Error(`expected 9 covers in the detail coverflow, found ${coverCount}`)
await page.screenshot({ path: `${OUT}/scrollgallery-detail.png` })
/* List view shows all nine records in the user's order. */
const order = await page.evaluate(() => [...document.querySelectorAll('.cki-cover img')].map((img) => img.getAttribute('src')))
console.log('coverflow order:', JSON.stringify(order))

if (errors.length) throw new Error(errors.join('\n'))
await browser.close()
console.log('batch 13 captures done')
