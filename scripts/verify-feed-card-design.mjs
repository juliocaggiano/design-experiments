/* Feed card design pilot — verifies the RichCaption layout (headline, ≤2-line
   summary, chip + category footer) on the meeting-overlay pilot card, captures
   element evidence, and checks horizontal overflow at 1440/390/320 px.
   Run: node scripts/verify-feed-card-design.mjs */
import fs from 'node:fs'
import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'
const OUT = 'artifacts/design-qa/card-design-2026-07-17'
fs.mkdirSync(OUT, { recursive: true })

let passed = 0
let failed = 0
const check = (name, ok, detail = '') => {
  if (ok) { passed += 1; console.log(`PASS  ${name}${detail ? ` — ${detail}` : ''}`) }
  else { failed += 1; console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ''}`) }
}

const browser = await chromium.launch()

{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const errors = []
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  page.on('pageerror', (error) => errors.push(String(error)))
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)

  const card = page.locator('a[href="/vault/meeting-overlay"]').first()
  await card.scrollIntoViewIfNeeded()
  await page.waitForTimeout(400)

  const caption = card.locator('[data-card-caption]')
  const headline = caption.locator('span').first()
  const summary = caption.locator('[data-card-summary]')
  const chip = caption.locator('div span').first()
  const category = caption.locator('[data-card-category]')

  check('headline renders', (await headline.textContent()) === "Don't Miss Meetings")
  check('summary renders', ((await summary.textContent()) ?? '').length > 10)

  const box = await summary.boundingBox()
  const lineHeight = await summary.evaluate((el) => parseFloat(getComputedStyle(el).lineHeight))
  const lines = box && lineHeight ? box.height / lineHeight : Number.POSITIVE_INFINITY
  check('summary clamps to at most two lines', lines <= 2.1, `${lines.toFixed(2)} lines`)

  check('chip pill renders', ((await chip.textContent()) ?? '').trim().length > 0, (await chip.textContent())?.trim())
  check('category renders in footer', (await category.textContent()) === 'Motion')

  await card.screenshot({ path: `${OUT}/pilot-meeting-1440.png` })
  await page.screenshot({ path: `${OUT}/feed-1440.png`, fullPage: false })
  check('zero console errors on feed', errors.length === 0, errors[0] ?? '')

  /* Tab bar alignment (batch 10): the bar's outer left edge matches the first
     feed card's outer left edge exactly. */
  const tabAlign = await page.evaluate(() => {
    const tablist = document.querySelector('[role="tablist"]')
    const firstCard = document.querySelector('#vault-filter-results > a, #vault-filter-results > article')
    if (!tablist || !firstCard) return null
    return { tab: tablist.getBoundingClientRect().left, card: firstCard.getBoundingClientRect().left }
  })
  check(
    'tab bar outer left edge matches the first card',
    tabAlign !== null && Math.abs(tabAlign.card - tabAlign.tab) <= 1,
    tabAlign ? `tab ${tabAlign.tab.toFixed(1)}, card ${tabAlign.card.toFixed(1)}` : 'missing',
  )

  /* Card demo (login) thumbnail: the whole login surface fits inside the
     stage — batch 10 fixed the top-anchored grid track that clipped the
     footer mid-button. */
  const cardFit = await page.evaluate(() => {
    const card = document.querySelector('a[href="/vault/shadcn-card"], article:has(a[href="/vault/shadcn-card"])')
    const demo = card?.querySelector('.sh-demo[data-id="card"]')
    const specimen = demo?.querySelector('.sx-card-demo')
    if (!demo || !specimen) return null
    const d = demo.getBoundingClientRect()
    const s = specimen.getBoundingClientRect()
    return { topGap: s.top - d.top, bottomGap: d.bottom - s.bottom }
  })
  check(
    'Card demo login surface fits inside the feed stage',
    cardFit !== null && cardFit.topGap >= -0.5 && cardFit.bottomGap >= -0.5,
    cardFit ? `top ${cardFit.topGap.toFixed(1)}px, bottom ${cardFit.bottomGap.toFixed(1)}px` : 'missing',
  )

  /* Regression: category clicks must never scroll the page (cmdk in the
     shadcn command demo used to scrollIntoView its selected item). */
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.getByRole('tab', { name: /Interactions/ }).click()
  await page.waitForTimeout(700)
  const afterInteractions = await page.evaluate(() => window.scrollY)
  check('clicking Interactions keeps the page at the top', afterInteractions === 0, `scrollY=${afterInteractions}`)
  await page.getByRole('tab', { name: /^All/ }).click()
  await page.waitForTimeout(700)
  const afterAll = await page.evaluate(() => window.scrollY)
  check('clicking All keeps the page at the top', afterAll === 0, `scrollY=${afterAll}`)

  /* Rollout coverage: every feed card renders the rich caption. */
  const coverage = await page.evaluate(() => {
    const cards = document.querySelectorAll('#vault-filter-results > a, #vault-filter-results > article')
    const summaries = [...document.querySelectorAll('[data-card-summary]')].filter((el) => (el.textContent ?? '').trim().length > 10)
    return { cards: cards.length, summaries: summaries.length }
  })
  check('every feed card renders a rich caption with a summary', coverage.summaries === coverage.cards && coverage.cards === 36, `${coverage.summaries}/${coverage.cards} cards`)

  /* Pinned feed order (batch 11): the first nine cards are fixed. */
  const EXPECTED_FIRST_NINE = [
    '/vault/reactive-dither',
    '/vault/number-pop-in',
    '/vault/meeting-overlay',
    '/vault/shimmer-text',
    '/vault/tabs-sliding',
    '/vault/ai-streaming-text',
    '/vault/ai-web-search',
    '/vault/fluid-springs',
    '/vault/chief-keef-index',
  ]
  const firstNine = await page.evaluate(() =>
    [...document.querySelectorAll('#vault-filter-results > a, #vault-filter-results > article')]
      .slice(0, 9)
      .map((el) => el.getAttribute('href') ?? el.querySelector('a')?.getAttribute('href') ?? null),
  )
  check(
    'first nine feed cards match the pinned order',
    JSON.stringify(firstNine) === JSON.stringify(EXPECTED_FIRST_NINE),
    firstNine.map((href) => href?.replace('/vault/', '')).join(', '),
  )

  /* Liquid pill: springs to the clicked tab and settles exactly on it. */
  const pillMatchesTab = async (tabName) => page.evaluate((name) => {
    const tab = [...document.querySelectorAll('[role="tab"]')].find((el) => el.textContent.trim().startsWith(name))
    const pill = document.querySelector('[data-category-pill]')
    if (!tab || !pill) return { ok: false, detail: 'missing elements' }
    const matrix = new DOMMatrixReadOnly(getComputedStyle(pill).transform)
    const tx = matrix.m41
    const w = pill.getBoundingClientRect().width
    return { ok: true, tx, w, expectX: tab.offsetLeft - 4, expectW: tab.offsetWidth }
  }, tabName)
  await page.getByRole('tab', { name: /^Motion/ }).click()
  await page.waitForTimeout(1000)
  const pillMotion = await pillMatchesTab('Motion')
  check(
    'liquid pill settles exactly on the clicked tab',
    pillMotion.ok && Math.abs(pillMotion.tx - pillMotion.expectX) <= 1.5 && Math.abs(pillMotion.w - pillMotion.expectW) <= 1.5,
    `x ${pillMotion.tx?.toFixed(1)} vs ${pillMotion.expectX}, w ${pillMotion.w?.toFixed(1)} vs ${pillMotion.expectW}`,
  )

  /* Hover ghost: fades in over the hovered tab, out on leave. */
  const skillsTab = page.getByRole('tab', { name: /^Skills/ })
  await skillsTab.hover()
  await page.waitForTimeout(500)
  const ghost = page.locator('[data-category-ghost]')
  const ghostState = await page.evaluate(() => {
    const el = document.querySelector('[data-category-ghost]')
    const tab = [...document.querySelectorAll('[role="tab"]')].find((t) => t.textContent.trim().startsWith('Skills'))
    const matrix = new DOMMatrixReadOnly(getComputedStyle(el).transform)
    return { opacity: el.style.opacity, tx: matrix.m41, expectX: tab.offsetLeft - 4 }
  })
  check('hover ghost appears over the hovered tab', ghostState.opacity === '1' && Math.abs(ghostState.tx - ghostState.expectX) <= 1.5, `opacity=${ghostState.opacity}, x ${ghostState.tx?.toFixed(1)} vs ${ghostState.expectX}`)
  await page.mouse.move(0, 0)
  await page.waitForTimeout(400)
  check('hover ghost fades out on leave', (await ghost.evaluate((el) => el.style.opacity)) === '0')
  /* Liquid on click: the pill must TRAVEL, not jump — sample x mid-flight. */
  await page.getByRole('tab', { name: /^All/ }).click()
  await page.waitForTimeout(900)
  const startX = await page.evaluate(() => new DOMMatrixReadOnly(getComputedStyle(document.querySelector('[data-category-pill]')).transform).m41)
  await page.getByRole('tab', { name: /^Interfaces/ }).click()
  const flight = []
  for (let i = 0; i < 10; i += 1) {
    await page.waitForTimeout(40)
    flight.push(await page.evaluate(() => new DOMMatrixReadOnly(getComputedStyle(document.querySelector('[data-category-pill]')).transform).m41))
  }
  const targetX = await page.evaluate(() => {
    const tab = [...document.querySelectorAll('[role="tab"]')].find((el) => el.textContent.trim().startsWith('Interfaces'))
    return tab.offsetLeft - 4
  })
  const midFlight = flight.filter((x) => Math.abs(x - startX) > 2 && Math.abs(x - targetX) > 2).length
  check('liquid pill travels through mid-flight on click', midFlight >= 2, `${midFlight} mid-flight samples of ${flight.length}`)
  await page.getByRole('tab', { name: /^All/ }).click()
  await page.waitForTimeout(700)
  await page.close()
}

/* Reduced motion: pill snaps instantly, no spring. */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForTimeout(900)
  await page.getByRole('tab', { name: /^Motion/ }).click()
  await page.waitForTimeout(200)
  const snap = await page.evaluate(() => {
    const tab = [...document.querySelectorAll('[role="tab"]')].find((el) => el.textContent.trim().startsWith('Motion'))
    const pill = document.querySelector('[data-category-pill]')
    const matrix = new DOMMatrixReadOnly(getComputedStyle(pill).transform)
    return { tx: matrix.m41, expectX: tab.offsetLeft - 4 }
  })
  check('reduced motion snaps the pill instantly', Math.abs(snap.tx - snap.expectX) <= 1.5, `x ${snap.tx.toFixed(1)} vs ${snap.expectX}`)
  await page.close()
}

for (const width of [390, 320]) {
  const page = await browser.newPage({ viewport: { width, height: 800 } })
  const errors = []
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  page.on('pageerror', (error) => errors.push(String(error)))
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForTimeout(900)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  check(`no horizontal overflow at ${width}px`, overflow <= 0, `${overflow}px`)
  const cardFitMobile = await page.evaluate(() => {
    const card = document.querySelector('a[href="/vault/shadcn-card"], article:has(a[href="/vault/shadcn-card"])')
    const demo = card?.querySelector('.sh-demo[data-id="card"]')
    const specimen = demo?.querySelector('.sx-card-demo')
    if (!demo || !specimen) return null
    const d = demo.getBoundingClientRect()
    const s = specimen.getBoundingClientRect()
    return { topGap: s.top - d.top, bottomGap: d.bottom - s.bottom }
  })
  check(
    `Card demo login surface fits inside the feed stage at ${width}px`,
    cardFitMobile !== null && cardFitMobile.topGap >= -0.5 && cardFitMobile.bottomGap >= -0.5,
    cardFitMobile ? `top ${cardFitMobile.topGap.toFixed(1)}px, bottom ${cardFitMobile.bottomGap.toFixed(1)}px` : 'missing',
  )
  const card = page.locator('a[href="/vault/meeting-overlay"]').first()
  await card.scrollIntoViewIfNeeded()
  await page.waitForTimeout(300)
  await card.screenshot({ path: `${OUT}/pilot-meeting-${width}.png` })
  check(`zero console errors at ${width}px`, errors.length === 0, errors[0] ?? '')
  await page.close()
}

await browser.close()
console.log(`\n${passed}/${passed + failed} checks passed`)
process.exit(failed === 0 ? 0 : 1)
