/* Batch 10 evidence captures — (1) tab bar aligned to the first card's outer
   edge, (2) LC feed thumbnail reduced to ~34% width on the white stage,
   (3) LC detail on the white stage with recalibrated shadow, (4) Card demo
   login surface unclipped in the feed, (5) Card detail top.
   Run with the dev server live: node scripts/capture-batch10.mjs */
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const BASE = process.env.VAULT_URL ?? 'http://127.0.0.1:5173'
const OUT = new URL('../artifacts/design-qa/batch10-2026-07-19/', import.meta.url).pathname
await mkdir(OUT, { recursive: true })

const browser = await chromium.launch()

/* 1+2. Feed top at 1440 — tab bar meets the first card's left edge; the LC
   thumbnail renders reduced on the white stage. */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)
  await page.screenshot({ path: `${OUT}feed-top.png` })
  const lcCard = page.locator('article:has(a[href="/vault/liquid-connector"])')
  await lcCard.scrollIntoViewIfNeeded()
  await page.waitForTimeout(500)
  await lcCard.screenshot({ path: `${OUT}lc-feed-card.png` })
  await page.close()
}

/* 3. LC detail — 520 px native stage centered on the white panel. */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto(`${BASE}/vault/liquid-connector`, { waitUntil: 'networkidle' })
  await page.waitForSelector('.lc-demo--playground svg.lc-stage')
  await page.waitForTimeout(900)
  await page.screenshot({ path: `${OUT}lc-detail-top.png` })
  await page.locator('.lc-demo--playground').screenshot({ path: `${OUT}lc-detail-stage.png` })
  await page.close()
}

/* 4+5. Card demo — unclipped feed thumbnail (1440 + 390) and detail top. */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)
  const card = page.locator('a[href="/vault/shadcn-card"], article:has(a[href="/vault/shadcn-card"])').first()
  await card.scrollIntoViewIfNeeded()
  await page.waitForTimeout(400)
  await card.screenshot({ path: `${OUT}card-feed-1440.png` })
  await page.goto(`${BASE}/vault/shadcn-card`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  await page.screenshot({ path: `${OUT}card-detail-top.png` })
  await page.close()
}
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(900)
  const card = page.locator('a[href="/vault/shadcn-card"], article:has(a[href="/vault/shadcn-card"])').first()
  await card.scrollIntoViewIfNeeded()
  await page.waitForTimeout(400)
  await card.screenshot({ path: `${OUT}card-feed-390.png` })
  const lcCard = page.locator('article:has(a[href="/vault/liquid-connector"])')
  await lcCard.scrollIntoViewIfNeeded()
  await page.waitForTimeout(400)
  await lcCard.screenshot({ path: `${OUT}lc-feed-card-390.png` })
  await page.close()
}

await browser.close()
console.log(`captures in ${OUT}`)
