/* Liquid Connector QA — verifies the feed thumbnail (default open state with
   the connector card visible, direct Skip action, no ambient motion,
   offscreen freeze) and the expanded route (direct load, soft-shadow surface
   without hairlines, SliderChip controls with immediate gap scrub, open
   switch, reset, Codex sample content, native-geometry stage cap,
   compact feed cap (~34% of the stage), stage-white background with the
   recalibrated shadow, reduced-motion settle, viewport fit).
   Captures evidence into artifacts/design-qa/batch10-2026-07-19.
   Run with the dev server live: node scripts/verify-liquid-connector.mjs */
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const BASE = process.env.VAULT_URL ?? 'http://127.0.0.1:5173'
const SHOTS = new URL('../artifacts/design-qa/batch10-2026-07-19/liquid-connector/', import.meta.url).pathname
await mkdir(SHOTS, { recursive: true })

const results = []
const check = (name, ok, detail = '') => {
  results.push({ name, ok })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

const FEED_CARD = 'article:has(a[href="/vault/liquid-connector"])'
const FEED_ROOT = 'article:has(a[href="/vault/liquid-connector"]) .lc-demo'
const DETAIL_ROOT = '.lc-demo--playground'
const PANEL = '[aria-label="Liquid connector settings"]'

const dataOpen = (page, root) => page.locator(root).getAttribute('data-open')
const surfaceD = (page, root) => page.locator(`${root} .lc-surface-fill`).getAttribute('d')

/* Drive a SliderChip bar to an exact value: click the proportional position,
   then nudge with arrow keys (each press moves one rounded step) until the
   aria-valuenow matches the target exactly. */
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

const browser = await chromium.launch()

/* ── 1. Feed thumbnail: default state, direct action, no ambient motion ── */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const errors = []
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  page.on('pageerror', (error) => errors.push(String(error)))
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })

  const card = page.locator(FEED_CARD)
  await card.waitFor()
  await card.scrollIntoViewIfNeeded()
  await page.waitForTimeout(600)

  check('feed thumbnail renders the liquid stage', (await page.locator(`${FEED_ROOT} svg.lc-stage`).count()) === 1)

  /* Batch 10: the compact drawing is capped and centered — about 34% of the
     stage width on wide cards, never above the native 520 px. */
  const compactGeom = await page.evaluate(() => {
    const demo = document.querySelector('.lc-demo--compact')
    const svg = demo.querySelector('svg.lc-stage')
    const d = demo.getBoundingClientRect()
    const s = svg.getBoundingClientRect()
    return {
      demoW: d.width,
      svgW: s.width,
      centerOffset: Math.abs(s.left + s.width / 2 - (d.left + d.width / 2)),
      vCenterOffset: Math.abs(s.top + s.height / 2 - (d.top + d.height / 2)),
      demoBg: getComputedStyle(demo).backgroundColor,
      stageBg: getComputedStyle(demo.parentElement).backgroundColor,
    }
  })
  check(
    'feed thumbnail drawing capped near 34% of the stage, centered',
    compactGeom.svgW <= 520
      && compactGeom.svgW / compactGeom.demoW >= 0.32
      && compactGeom.svgW / compactGeom.demoW <= 0.36
      && compactGeom.centerOffset <= 2
      && compactGeom.vCenterOffset <= 2,
    `svg ${compactGeom.svgW.toFixed(1)}px of ${compactGeom.demoW.toFixed(1)}px (${(100 * compactGeom.svgW / compactGeom.demoW).toFixed(1)}%), offsets ${compactGeom.centerOffset.toFixed(1)}/${compactGeom.vCenterOffset.toFixed(1)}`,
  )
  check('feed stage matches the standard card stage white', compactGeom.demoBg === compactGeom.stageBg, `${compactGeom.demoBg} vs ${compactGeom.stageBg}`)
  check('thumbnail starts open and settled', (await dataOpen(page, FEED_ROOT)) === 'true', `data-open=${await dataOpen(page, FEED_ROOT)}`)
  const cardOpacity = await page.locator(`${FEED_ROOT} .lc-output-content`).first().evaluate((el) => Number(getComputedStyle(el).opacity))
  check('connector card is visible by default (Codex card present)', cardOpacity > 0.99, `opacity=${cardOpacity}`)
  await card.screenshot({ path: `${SHOTS}feed-card.png` })

  /* Direct manipulation: Skip lives inside the interactive card — clicking it
     closes the connector without navigating away. */
  await page.locator(`${FEED_ROOT} .lc-skip`).first().click()
  await page.waitForTimeout(300)
  check('Skip closes the thumbnail without navigating', page.url().endsWith('/') && (await dataOpen(page, FEED_ROOT)) === 'false', `url=${page.url()}`)

  /* Upstream has no ambient loop: once closed, the thumbnail stays closed. */
  await page.waitForTimeout(9000)
  const quietOpen = await dataOpen(page, FEED_ROOT)
  check('nothing re-opens on its own (no ambient loop)', quietOpen === 'false', `data-open=${quietOpen}`)

  /* Offscreen: in-flight rAF stands down, so nothing repaints. */
  const settledD = await surfaceD(page, FEED_ROOT)
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(3000)
  const frozenD = await surfaceD(page, FEED_ROOT)
  check('offscreen thumbnail freezes (no repaints)', frozenD === settledD)

  /* Back in view it stays exactly as left — no idle loop resumes. */
  await card.scrollIntoViewIfNeeded()
  await page.waitForTimeout(3000)
  check('re-entry leaves the thumbnail untouched', (await dataOpen(page, FEED_ROOT)) === 'false' && (await surfaceD(page, FEED_ROOT)) === settledD)

  check('zero console errors on feed', errors.length === 0, errors.join(' | '))
  await page.close()
}

/* ── 2. Detail route: direct load, controls, live updates, reset ── */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const errors = []
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  page.on('pageerror', (error) => errors.push(String(error)))
  await page.goto(`${BASE}/vault/liquid-connector`, { waitUntil: 'networkidle' })
  await page.waitForSelector(`${DETAIL_ROOT} svg.lc-stage`)
  await page.waitForTimeout(800)

  check('route works on direct browser load', (await page.locator('h1').first().textContent()) === 'Liquid Connector')
  check('surface path is generated', ((await surfaceD(page, DETAIL_ROOT)) ?? '').length > 40)
  const strokeOutline = await page.locator(`${DETAIL_ROOT} .lc-outline-edge`).evaluate((el) => getComputedStyle(el).stroke)
  const strokeSurface = await page.locator(`${DETAIL_ROOT} .lc-surface`).evaluate((el) => getComputedStyle(el).stroke)
  const fillFilter = await page.locator(`${DETAIL_ROOT} .lc-surface-fill`).evaluate((el) => getComputedStyle(el).filter)
  check('hairline strokes removed, soft shadow on the white surface', strokeOutline === 'none' && strokeSurface === 'none' && fillFilter.includes('drop-shadow'), `outline=${strokeOutline}, surface=${strokeSurface}`)
  const detailBg = await page.locator(DETAIL_ROOT).evaluate((el) => getComputedStyle(el).backgroundColor)
  const frameBg = await page.locator(DETAIL_ROOT).evaluate((el) => getComputedStyle(el.parentElement).backgroundColor)
  check('detail stage matches the vault stage white', detailBg === frameBg, `${detailBg} vs ${frameBg}`)
  check('shadow recalibrated for the white stage', fillFilter.includes('rgba(20, 23, 28, 0.11)') && fillFilter.includes('rgba(20, 23, 28, 0.08)'), fillFilter)
  check('all five slider bars render', (await page.locator(`${PANEL} [role="slider"]`).count()) === 5)
  check('open switch renders', (await page.getByRole('switch', { name: 'Connector open' }).count()) === 1)
  check('action chips live in the Controls header', (await page.getByRole('button', { name: 'Reset', exact: true }).count()) === 1)
  check('provider sample renamed to Codex', (await page.locator(`${DETAIL_ROOT} .lc-provider-name`).first().textContent()) === 'Codex')
  check('original Codex glyph renders in the tile', (await page.locator(`${DETAIL_ROOT} .lc-codex-mark`).count()) >= 1)

  /* Native-geometry cap: the playground stage renders at its 520 px viewBox
     width, horizontally centered in the full-width gray panel. */
  const stageBox = await page.locator(`${DETAIL_ROOT} svg.lc-stage`).boundingBox()
  const panelBox = await page.locator(DETAIL_ROOT).boundingBox()
  const centerOffset = stageBox && panelBox
    ? Math.abs(stageBox.x + stageBox.width / 2 - (panelBox.x + panelBox.width / 2))
    : 999
  check(
    'detail stage capped at native width and centered in the panel',
    stageBox !== null && stageBox.width <= 521 && centerOffset <= 2,
    stageBox ? `stage ${Math.round(stageBox.width)}px wide, center offset ${centerOffset.toFixed(1)}px` : 'missing',
  )

  const gapSlider = page.getByRole('slider', { name: 'Rest gap' })
  const before = await gapSlider.getAttribute('aria-valuetext')
  const dBefore = await surfaceD(page, DETAIL_ROOT)
  await setSlider(page, 'Rest gap', -20, -60, 10)
  const after = await gapSlider.getAttribute('aria-valuetext')
  await page.waitForTimeout(250)
  const dAfter = await surfaceD(page, DETAIL_ROOT)
  const scrubAnimating = await page.locator(`${DETAIL_ROOT}[data-animating]`).count()
  check('rest gap control updates live surface', before !== after && after === '-20 px' && dBefore !== dAfter, `${before} → ${after}`)
  check('gap scrub lands immediately, no spring (upstream 1:1)', scrubAnimating === 0)

  /* Peel parameters re-solve the path immediately. At −20 px overlap the seam
     is saturated, so back off to a shallow −5 px bridge first — that is where
     the coupling radius visibly reshapes the path. */
  await setSlider(page, 'Rest gap', -5, -60, 10)
  await page.waitForTimeout(700)
  const dCouplingBefore = await surfaceD(page, DETAIL_ROOT)
  await setSlider(page, 'Coupling radius', 40, 4, 48)
  await page.waitForTimeout(400)
  check('coupling radius re-solves the path', (await surfaceD(page, DETAIL_ROOT)) !== dCouplingBefore)

  /* Fused waist state, settled — matches the reference's scrubbed negative-gap
     frame. Deterministic (immediate scrub), no transition timing involved. */
  await setSlider(page, 'Coupling radius', 5, 4, 48)
  await setSlider(page, 'Rest gap', -28, -60, 10)
  await page.waitForTimeout(300)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.locator(DETAIL_ROOT).screenshot({ path: `${SHOTS}detail-fused.png` })
  await setSlider(page, 'Rest gap', -5, -60, 10)
  await page.waitForTimeout(200)

  const toggle = page.getByRole('switch', { name: 'Connector open' })
  await toggle.click()
  await page.waitForTimeout(600)
  const closedOpen = await dataOpen(page, DETAIL_ROOT)
  const dClosed = await surfaceD(page, DETAIL_ROOT)
  check('open switch peels the card away', closedOpen === 'false' && dClosed !== dAfter)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.locator(DETAIL_ROOT).screenshot({ path: `${SHOTS}detail-closed.png` })

  await toggle.click()
  await page.waitForTimeout(600)
  check('open switch re-merges the card', (await dataOpen(page, DETAIL_ROOT)) === 'true')

  await page.getByRole('button', { name: 'Reset', exact: true }).click()
  await page.waitForTimeout(400)
  const resetGap = await gapSlider.getAttribute('aria-valuetext')
  const resetOpen = await toggle.getAttribute('aria-checked')
  check('reset restores defaults', resetGap === '10 px' && resetOpen === 'true', `${resetGap}, open=${resetOpen}`)

  /* Prompt behavior: send enables with text and clears on submit. */
  const textarea = page.locator(`${DETAIL_ROOT} textarea`)
  const send = page.locator(`${DETAIL_ROOT} .lc-send`)
  await textarea.fill('Remind me tomorrow')
  await page.waitForTimeout(150)
  const sendEnabled = await send.isEnabled()
  await send.click()
  await page.waitForTimeout(150)
  check('send enables with text and clears the prompt on submit', sendEnabled && (await textarea.inputValue()) === '')

  await page.locator(PANEL).scrollIntoViewIfNeeded()
  await page.screenshot({ path: `${SHOTS}detail-controls.png` })
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${SHOTS}detail-top.png` })

  check('zero console errors on detail route', errors.length === 0, errors.join(' | '))
  await page.close()
}

/* ── 3. Reduced motion: settled renders, no loop, no idle toggles ── */
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  const page = await context.newPage()
  const errors = []
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  page.on('pageerror', (error) => errors.push(String(error)))
  await page.goto(`${BASE}/vault/liquid-connector`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)

  await page.getByRole('switch', { name: 'Connector open' }).click()
  await page.waitForTimeout(200)
  const dA = await surfaceD(page, DETAIL_ROOT)
  await page.waitForTimeout(400)
  const dB = await surfaceD(page, DETAIL_ROOT)
  const animating = await page.locator(`${DETAIL_ROOT}[data-animating]`).count()
  check('reduced motion jumps straight to the settled state', dA === dB && animating === 0)

  await page.waitForTimeout(9000)
  const stillClosed = (await dataOpen(page, DETAIL_ROOT)) === 'false'
  check('reduced motion: nothing toggles on its own', stillClosed && (await surfaceD(page, DETAIL_ROOT)) === dB, `data-open=${await dataOpen(page, DETAIL_ROOT)}`)
  check('zero console errors with reduced motion', errors.length === 0, errors.join(' | '))
  await context.close()
}

/* ── 4. Viewport fit: no horizontal overflow at 1440 / 390 / 320 ── */
for (const width of [1440, 390, 320]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } })
  const errors = []
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  page.on('pageerror', (error) => errors.push(String(error)))
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await page.waitForSelector('a[href="/vault/liquid-connector"]')
  const feedOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  await page.goto(`${BASE}/vault/liquid-connector`, { waitUntil: 'networkidle' })
  await page.waitForSelector(`${DETAIL_ROOT} svg.lc-stage`)
  const detailOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  check(`no horizontal overflow at ${width}px (feed + detail)`, feedOverflow <= 1 && detailOverflow <= 1, `feed ${feedOverflow}px, detail ${detailOverflow}px`)
  check(`zero console errors at ${width}px`, errors.length === 0, errors.join(' | '))
  await page.close()
}

await browser.close()

const failed = results.filter((result) => !result.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed — captures in ${SHOTS}`)
if (failed.length > 0) process.exit(1)
