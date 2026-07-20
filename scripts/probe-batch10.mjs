/* Batch 10 measurement probe — gathers before-values for the four annotated
   changes. Run with the dev server live: node scripts/probe-batch10.mjs */
import { chromium } from 'playwright'

const BASE = process.env.VAULT_URL ?? 'http://127.0.0.1:5173'
const browser = await chromium.launch()

/* ── Feed geometry @1440 ── */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)

  const feed = await page.evaluate(() => {
    const rect = (el) => { const r = el.getBoundingClientRect(); return { left: +r.left.toFixed(1), right: +r.right.toFixed(1), width: +r.width.toFixed(1) } }
    const firstCard = document.querySelector('#vault-filter-results > a, #vault-filter-results > article')
    const headline = document.querySelector('h1')
    const tablist = document.querySelector('[role="tablist"]')
    const tabWrapper = tablist?.parentElement
    return {
      firstCard: rect(firstCard),
      firstCardTag: firstCard.tagName.toLowerCase(),
      headline: rect(headline),
      tablist: rect(tablist),
      tabWrapper: rect(tabWrapper),
    }
  })
  console.log('FEED @1440:', JSON.stringify(feed, null, 1))

  const lc = await page.evaluate(() => {
    const demo = document.querySelector('.lc-demo--compact')
    const stage = demo?.querySelector('svg.lc-stage')
    const r = (el) => { const b = el.getBoundingClientRect(); return { left: +b.left.toFixed(1), top: +b.top.toFixed(1), width: +b.width.toFixed(1), height: +b.height.toFixed(1) } }
    return { demo: r(demo), svg: r(stage), demoBg: getComputedStyle(demo).backgroundColor }
  })
  console.log('LC COMPACT @1440:', JSON.stringify(lc, null, 1))

  /* Micro Interactions stage = the card's stage container bg. */
  const mb = await page.evaluate(() => {
    const card = document.querySelector('article:has(a[href="/vault/micro-buttons"])')
    const stage = card?.querySelector('.aspect-\\[1344\\/520\\]') ?? card?.querySelector('[class*="aspect-"]')
    const bt = card?.querySelector('.bt-box')
    return {
      stageBg: stage ? getComputedStyle(stage).backgroundColor : null,
      btBg: bt ? getComputedStyle(bt).backgroundColor : null,
    }
  })
  console.log('MICRO-BUTTONS STAGE BG:', JSON.stringify(mb, null, 1))

  /* Card demo (login) thumbnail clipping. */
  const cardClip = await page.evaluate(() => {
    const card = document.querySelector('a[href="/vault/shadcn-card"], article:has(a[href="/vault/shadcn-card"])')
    const demo = card?.querySelector('.sh-demo[data-id="card"]')
    const native = demo?.querySelector('.sx-native')
    const specimen = demo?.querySelector('.sx-card-demo')
    const r = (el) => { const b = el.getBoundingClientRect(); return { top: +b.top.toFixed(1), bottom: +b.bottom.toFixed(1), height: +b.height.toFixed(1), width: +b.width.toFixed(1) } }
    return {
      demo: r(demo),
      specimenBox: r(specimen),
      natural: { width: specimen.offsetWidth, height: specimen.offsetHeight },
      transform: getComputedStyle(native).transform,
      previewPadding: getComputedStyle(demo.querySelector('.sx-preview')).padding,
    }
  })
  console.log('CARD DEMO FEED @1440:', JSON.stringify(cardClip, null, 1))
  await page.close()
}

/* ── Feed @390 for card clip + LC compact ── */
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)
  const m = await page.evaluate(() => {
    const card = document.querySelector('a[href="/vault/shadcn-card"], article:has(a[href="/vault/shadcn-card"])')
    const demo = card?.querySelector('.sh-demo[data-id="card"]')
    const specimen = demo?.querySelector('.sx-card-demo')
    const r = (el) => { const b = el.getBoundingClientRect(); return { top: +b.top.toFixed(1), bottom: +b.bottom.toFixed(1), height: +b.height.toFixed(1), width: +b.width.toFixed(1) } }
    const lcDemo = document.querySelector('.lc-demo--compact')
    const lcSvg = lcDemo?.querySelector('svg.lc-stage')
    return {
      cardDemo: r(demo),
      specimen: r(specimen),
      natural: { width: specimen.offsetWidth, height: specimen.offsetHeight },
      transform: getComputedStyle(demo.querySelector('.sx-native')).transform,
      lcDemo: r(lcDemo),
      lcSvg: r(lcSvg),
    }
  })
  console.log('FEED @390:', JSON.stringify(m, null, 1))
  await page.close()
}

/* ── Card demo detail page ── */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto(`${BASE}/vault/shadcn-card`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  const d = await page.evaluate(() => {
    const demo = document.querySelector('.sh-demo[data-id="card"]')
    const specimen = demo?.querySelector('.sx-card-demo')
    const r = (el) => { const b = el.getBoundingClientRect(); return { top: +b.top.toFixed(1), bottom: +b.bottom.toFixed(1), height: +b.height.toFixed(1), width: +b.width.toFixed(1) } }
    return {
      demo: r(demo),
      specimen: r(specimen),
      natural: { width: specimen.offsetWidth, height: specimen.offsetHeight },
      transform: getComputedStyle(demo.querySelector('.sx-native')).transform,
    }
  })
  console.log('CARD DEMO DETAIL @1440:', JSON.stringify(d, null, 1))
  await page.close()
}

/* ── LC detail stage bg surface separation reference ── */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto(`${BASE}/vault/liquid-connector`, { waitUntil: 'networkidle' })
  await page.waitForSelector('.lc-demo--playground svg.lc-stage')
  await page.waitForTimeout(600)
  const s = await page.evaluate(() => {
    const demo = document.querySelector('.lc-demo--playground')
    const fill = demo.querySelector('.lc-surface-fill')
    return {
      demoBg: getComputedStyle(demo).backgroundColor,
      surfaceFill: getComputedStyle(fill).fill,
      surfaceFilter: getComputedStyle(fill).filter,
    }
  })
  console.log('LC DETAIL SURFACE:', JSON.stringify(s, null, 1))
  await page.close()
}

await browser.close()
