/* Reactive Dither QA — verifies the feed thumbnail and expanded route against
   the card's acceptance criteria. Run with the dev server live:
   node scripts/verify-reactive-dither.mjs */
import { chromium } from 'playwright'

const BASE = process.env.VAULT_URL ?? 'http://127.0.0.1:5173'
const results = []
const check = (name, ok, detail = '') => {
  results.push({ name, ok })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

/* Hash a sampling of the canvas's pixels without scrolling the page. */
const canvasHash = (page, selector) =>
  page.evaluate((sel) => {
    const canvas = document.querySelector(sel)
    if (!canvas) return -1
    const context = canvas.getContext('2d')
    const data = context.getImageData(0, 0, canvas.width, canvas.height).data
    let hash = 0
    for (let index = 3; index < data.length; index += 397) {
      hash = (hash * 31 + data[index]) | 0
    }
    return hash
  }, selector)

/* Drive a SliderChip bar to an exact value: click the proportional position,
   then nudge with arrow keys until aria-valuenow matches exactly. */
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
  const stuck = await slider.getAttribute('aria-valuenow')
  if (Number(stuck) !== target) throw new Error(`slider "${name}" stuck at ${stuck}, target ${target}`)
}

const FEED_CANVAS = 'a[href="/vault/reactive-dither"] canvas'
const FULL_CANVAS = '.rd-demo--playground canvas'

const browser = await chromium.launch()

/* ── 1. Desktop feed: idle drift, pointer displacement, offscreen pause ── */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const errors = []
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  page.on('pageerror', (error) => errors.push(String(error)))
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })

  const card = page.locator('a[href="/vault/reactive-dither"]').first()
  await card.scrollIntoViewIfNeeded()
  await page.waitForTimeout(1200)

  const idleA = await canvasHash(page, FEED_CANVAS)
  await page.waitForTimeout(600)
  const idleB = await canvasHash(page, FEED_CANVAS)
  check('thumbnail idle drift animates while visible', idleA !== -1 && idleA !== idleB)

  const box = await card.locator('canvas').boundingBox()
  await page.mouse.move(box.x + box.width * 0.32, box.y + box.height * 0.5, { steps: 10 })
  await page.waitForTimeout(300)
  const displaced = await canvasHash(page, FEED_CANVAS)
  check('pointer movement visibly displaces dots', displaced !== idleB)

  await page.mouse.move(12, 12)
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight }))
  await page.waitForTimeout(900)
  const offA = await canvasHash(page, FEED_CANVAS)
  await page.waitForTimeout(600)
  const offB = await canvasHash(page, FEED_CANVAS)
  check('thumbnail rendering pauses offscreen', offA === offB)

  await card.scrollIntoViewIfNeeded()
  // The idle drift intentionally resumes ~4.5 s after the last interaction;
  // this window crosses that boundary.
  await page.waitForTimeout(3200)
  const reA = await canvasHash(page, FEED_CANVAS)
  await page.waitForTimeout(1200)
  const reB = await canvasHash(page, FEED_CANVAS)
  check('thumbnail resumes on re-entry', reA !== reB)

  check('zero console errors on feed', errors.length === 0, errors.join(' | '))
  await page.close()
}

/* ── 2. Detail route: direct load, controls, live updates, reset ── */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const errors = []
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  page.on('pageerror', (error) => errors.push(String(error)))
  await page.goto(`${BASE}/vault/reactive-dither`, { waitUntil: 'networkidle' })
  await page.waitForSelector('.rd-demo--playground canvas')
  await page.waitForTimeout(800)

  check('route works on direct browser load', await page.locator('h1').first().textContent() === 'Liquid Dither Effect')
  check('implementation frame renders the shared engine', (await page.locator('.rd-demo canvas').count()) === 1)
  check('all seven slider bars render', (await page.locator('.rd-controls [role="slider"]').count()) === 7)
  check('invert toggle renders as a switch', (await page.getByRole('switch', { name: 'Inverted' }).count()) === 1)

  const spacingSlider = page.getByRole('slider', { name: 'Dot spacing' })
  const before = await spacingSlider.getAttribute('aria-valuetext')
  await setSlider(page, 'Dot spacing', 9, 2.4, 10)
  const after = await spacingSlider.getAttribute('aria-valuetext')
  await page.waitForTimeout(400)
  check('dot spacing control updates live canvas', before !== after && after === '9.0 px', `${before} → ${after}`)

  const trackBox = await spacingSlider.boundingBox()
  const fillBox = await spacingSlider.locator('[data-slider-fill]').boundingBox()
  check(
    'fill block tracks the value (reference style)',
    trackBox !== null && fillBox !== null && fillBox.width > trackBox.width * 0.3,
    fillBox && trackBox ? `fill ${Math.round(fillBox.width)}px of ${Math.round(trackBox.width)}px` : 'missing',
  )

  await page.getByRole('switch', { name: 'Inverted' }).click()
  await page.waitForTimeout(300)
  const inverted = await page.locator('.rd-demo--playground').getAttribute('data-invert')
  check('invert colors toggles live', inverted === 'true')

  await page.getByRole('button', { name: 'Reset' }).click()
  await page.waitForTimeout(300)
  const resetSpacing = await spacingSlider.getAttribute('aria-valuetext')
  const resetInvert = await page.locator('.rd-demo--playground').getAttribute('data-invert')
  check('reset restores defaults', resetSpacing === '2.4 px' && resetInvert === 'false', `${resetSpacing}, invert=${resetInvert}`)

  /* Frame sits above the controls now, so bring the canvas back into the
     viewport before pointing at it. */
  await page.locator(FULL_CANVAS).scrollIntoViewIfNeeded()
  const fullBox = await page.locator(FULL_CANVAS).boundingBox()
  await page.mouse.move(fullBox.x + fullBox.width * 0.5, fullBox.y + fullBox.height * 0.5, { steps: 6 })
  await page.waitForTimeout(250)
  const implA = await canvasHash(page, FULL_CANVAS)
  await page.mouse.move(fullBox.x + fullBox.width * 0.2, fullBox.y + fullBox.height * 0.3, { steps: 6 })
  await page.waitForTimeout(250)
  const implB = await canvasHash(page, FULL_CANVAS)
  check('implementation canvas reacts to the pointer', implA !== implB)

  check('previous/next navigation links exist', (await page.locator('nav[aria-label="Browse experiments"] a').count()) === 2)
  check('zero console errors on detail route', errors.length === 0, errors.join(' | '))
  await page.close()
}

/* ── 3. Reduced motion: settled render, no loop, no pointer response ── */
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.goto(`${BASE}/vault/reactive-dither`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)

  const fullBox = await page.locator(FULL_CANVAS).boundingBox()
  await page.mouse.move(fullBox.x + 80, fullBox.y + 60, { steps: 6 })
  await page.waitForTimeout(400)
  const rmA = await canvasHash(page, FULL_CANVAS)
  await page.waitForTimeout(500)
  const rmB = await canvasHash(page, FULL_CANVAS)
  check('reduced motion renders a settled static mark', rmA !== -1 && rmA === rmB)
  await context.close()
}

/* ── 4. Mobile layouts: 390 px and 320 px ── */
for (const width of [390, 320]) {
  const page = await browser.newPage({ viewport: { width, height: 844 } })
  const errors = []
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  page.on('pageerror', (error) => errors.push(String(error)))

  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  const card = page.locator('a[href="/vault/reactive-dither"]').first()
  await card.scrollIntoViewIfNeeded()
  await page.waitForTimeout(900)
  const feedOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  await card.screenshot({ path: `scripts/../artifacts/design-qa/reactive-dither-2026-07-18/feed-${width}.png` }).catch(() => {})

  await page.goto(`${BASE}/vault/reactive-dither`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)
  const detailOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  await page.screenshot({ path: `scripts/../artifacts/design-qa/reactive-dither-2026-07-18/detail-${width}.png`, fullPage: false }).catch(() => {})

  check(`no horizontal overflow at ${width}px (feed + detail)`, feedOverflow <= 0 && detailOverflow <= 0, `feed ${feedOverflow}px, detail ${detailOverflow}px`)
  check(`zero console errors at ${width}px`, errors.length === 0, errors.join(' | '))
  await page.close()
}

await browser.close()
const failed = results.filter((result) => !result.ok).length
console.log(`\n${results.length - failed}/${results.length} checks passed`)
process.exit(failed === 0 ? 0 : 1)
