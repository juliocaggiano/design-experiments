import { chromium } from 'playwright'

const base = process.env.BASE_URL ?? 'http://127.0.0.1:5173'
const OUT = 'artifacts/design-qa/batch4-2026-07-18'
const browser = await chromium.launch()

// Tooltip + accordion detail pages (implementation demo, forced open states)
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto(`${base}/vault/tooltip-open-close`, { waitUntil: 'networkidle' })
  const tipDemo = page.locator('.td-demo').nth(1)
  await tipDemo.locator('.td-tooltip-anchor > button').click()
  await page.waitForTimeout(400)
  await tipDemo.screenshot({ path: `${OUT}/tooltip-open-1440.png` })

  await page.goto(`${base}/vault/accordion`, { waitUntil: 'networkidle' })
  const accDemo = page.locator('.td-demo').nth(1)
  await accDemo.locator('.td-accordion > button').click()
  await page.waitForTimeout(450)
  await accDemo.screenshot({ path: `${OUT}/accordion-open-1440.png` })

  await page.goto(`${base}/vault/shadcn-calendar`, { waitUntil: 'networkidle' })
  const hero = page.locator('.sh-demo').first()
  await hero.screenshot({ path: `${OUT}/calendar-hero-1440.png` })
  await page.close()
}

// Calendar feed card at three viewports
for (const [width, height] of [[1440, 900], [390, 844], [320, 720]]) {
  const page = await browser.newPage({ viewport: { width, height } })
  await page.goto(base, { waitUntil: 'networkidle' })
  const card = page.locator('article').filter({ has: page.locator('a[href="/vault/shadcn-calendar"]') }).first()
  await card.scrollIntoViewIfNeeded()
  await page.waitForTimeout(400)
  await card.screenshot({ path: `${OUT}/calendar-card-${width}.png` })
  // Accordion + tooltip feed cards too
  const accCard = page.locator('article').filter({ has: page.locator('a[href="/vault/accordion"]') }).first()
  await accCard.scrollIntoViewIfNeeded()
  await page.waitForTimeout(300)
  await accCard.screenshot({ path: `${OUT}/accordion-card-${width}.png` })
  const tipCard = page.locator('article').filter({ has: page.locator('a[href="/vault/tooltip-open-close"]') }).first()
  await tipCard.hover()
  await page.waitForTimeout(300)
  await tipCard.screenshot({ path: `${OUT}/tooltip-card-${width}.png` })
  await page.close()
}

await browser.close()
console.log('captured')
