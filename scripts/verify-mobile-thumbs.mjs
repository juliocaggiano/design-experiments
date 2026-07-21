/* Mobile thumbnail scale + favicon — verifies the 2× stage height on narrow
   viewports (1344/1040), unchanged desktop ratio, favicon link + served SVG,
   and zero console errors. Evidence in artifacts/design-qa/mobile-thumbs-2026-07-21.
   Run: node scripts/verify-mobile-thumbs.mjs (dev server must be on :5173) */
import fs from 'node:fs'
import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'
const OUT = 'artifacts/design-qa/mobile-thumbs-2026-07-21'
fs.mkdirSync(OUT, { recursive: true })

let passed = 0
let failed = 0
const check = (name, ok, detail = '') => {
  if (ok) { passed += 1; console.log(`PASS  ${name}${detail ? ` — ${detail}` : ''}`) }
  else { failed += 1; console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ''}`) }
}

const browser = await chromium.launch()
const ratioOf = (box) => box.height / box.width

{
  // desktop baseline
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const errors = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)

  check('favicon link present', await page.locator('link[rel="icon"][href="/favicon.svg"]').count() === 1)
  const fav = await page.request.get(`${BASE}/favicon.svg`)
  check('favicon.svg served', fav.status() === 200, `status ${fav.status()}`)
  check('favicon is black circle', (await fav.text()).includes('<circle'))

  const stage = page.locator('a[href="/vault/reactive-dither"] .aspect-\\[1344\\/520\\]').first()
  await stage.scrollIntoViewIfNeeded()
  const box = await stage.boundingBox()
  const desktopRatio = ratioOf(box)
  check('desktop stage ratio unchanged', Math.abs(desktopRatio - 520 / 1344) < 0.02, `h/w ${desktopRatio.toFixed(3)}`)
  await page.screenshot({ path: `${OUT}/desktop-feed.png` })
  check('zero console errors (desktop)', errors.length === 0, errors[0] ?? '')
  await page.close()
}

{
  // mobile: stage should be ~2x taller
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  const errors = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)

  const stage = page.locator('a[href="/vault/reactive-dither"] .aspect-\\[1344\\/520\\]').first()
  await stage.scrollIntoViewIfNeeded()
  const box = await stage.boundingBox()
  const mobileRatio = ratioOf(box)
  check('mobile stage is 2x height', Math.abs(mobileRatio - 1040 / 1344) < 0.03, `h/w ${mobileRatio.toFixed(3)}`)
  check('no horizontal overflow @390', await page.evaluate(() => document.documentElement.scrollWidth <= 390))
  await page.screenshot({ path: `${OUT}/mobile-feed-390.png`, fullPage: false })
  check('zero console errors (mobile)', errors.length === 0, errors[0] ?? '')
  await page.close()
}

{
  // small mobile
  const page = await browser.newPage({ viewport: { width: 320, height: 700 } })
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)
  check('no horizontal overflow @320', await page.evaluate(() => document.documentElement.scrollWidth <= 320))
  await page.screenshot({ path: `${OUT}/mobile-feed-320.png` })
  await page.close()
}

await browser.close()
console.log(`\n${passed} passed, ${failed} failed — evidence in ${OUT}/`)
process.exit(failed ? 1 : 0)
