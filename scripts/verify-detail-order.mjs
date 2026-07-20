/* Detail page layout-order QA — asserts every expanded page follows the house
   order: implementation frame (chips on the frame when the page has no
   controls) → Description (the controls panel, action chips in its header,
   grouped with the frame in a 24 px wrapper) → description prose → Code/copy
   (when present) → Credits. Also asserts the batch-6 nav contract: no
   breadcrumbs, no "Implementation" heading, prev/next as two separate
   bordered buttons, a bordered close button, and action chips inside the
   Description header whenever a controls section exists.
   Run with the dev server live: node scripts/verify-detail-order.mjs */
import { chromium } from 'playwright'

const BASE = process.env.VAULT_URL ?? 'http://127.0.0.1:5173'

const ROUTES = [
  { path: '/vault/reactive-dither', controls: true, code: true },
  { path: '/vault/liquid-connector', controls: true, code: true },
  { path: '/vault/border-beam', controls: true, code: true },
  { path: '/vault/meeting-overlay', controls: true, code: true },
  { path: '/vault/fluid-springs', controls: true, code: true },
  { path: '/vault/bottom-sheet', controls: true, code: true },
  /* Materials is a hidden orphan page: no feed card and no VAULT_ITEMS entry,
     so DetailShell renders no prev/next nav for it. Skip the nav geometry. */
  { path: '/vault/materials', controls: true, code: true, orphan: true },
  { path: '/vault/micro-buttons', controls: true, code: true },
  { path: '/vault/better-colors', controls: true, code: true },
  { path: '/vault/better-typography', controls: true, code: true },
  { path: '/vault/skill-apple-design', controls: true, code: true },
  { path: '/vault/skill-design-eng', controls: true, code: false },
  { path: '/vault/card-resize', controls: false, code: true },
  { path: '/vault/ai-streaming-text', controls: false, code: true },
  { path: '/vault/shadcn-calendar', controls: false, code: true },
  { path: '/vault/chief-keef-index', controls: false, code: true },
]

const results = []
const check = (name, ok, detail = '') => {
  results.push({ name, ok })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

/* Walk the main column in document order and reduce it to layout markers:
   section h2 texts plus one "description" marker at the first long prose
   paragraph. The relative order of these markers is the page's layout. */
const collectMarkers = (page) =>
  page.evaluate(() => {
    const markers = []
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT)
    let descriptionMarked = false
    while (walker.nextNode()) {
      const el = walker.currentNode
      if (el.tagName === 'H2') {
        markers.push(el.textContent.trim())
      } else if (
        !descriptionMarked
        && el.tagName === 'P'
        && el.className.includes('text-pretty')
        && el.textContent.trim().length > 80
      ) {
        markers.push('description')
        descriptionMarked = true
      }
    }
    return markers
  })

const browser = await chromium.launch()

for (const route of ROUTES) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const errors = []
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  page.on('pageerror', (error) => errors.push(String(error)))

  await page.goto(`${BASE}${route.path}`, { waitUntil: 'networkidle' })
  await page.waitForSelector('h1')
  await page.waitForTimeout(400)

  const markers = await collectMarkers(page)
  const at = (name) => markers.indexOf(name)
  const sequence = [
    ...(route.controls ? [['Description', at('Description')]] : []),
    ['description', at('description')],
    ...(route.code ? [['Code', at('Code')]] : []),
    ['Credits', at('Credits')],
  ]
  const missing = sequence.filter(([, index]) => index === -1).map(([name]) => name)
  const ordered = missing.length === 0 && sequence.every(([, index], i) => i === 0 || index > sequence[i - 1][1])
  check(
    `${route.path} order: ${sequence.map(([name]) => name).join(' → ')}`,
    ordered,
    missing.length ? `missing: ${missing.join(', ')}` : markers.join(' | '),
  )
  check(`${route.path} has no Implementation heading`, at('Implementation') === -1)
  if (!route.controls) {
    check(`${route.path} has no Description section`, at('Description') === -1)
  }

  /* Nav contract: breadcrumbs gone; prev/next are two separately bordered
     buttons; the close button is bordered the same way. */
  check(
    `${route.path} has no breadcrumbs`,
    (await page.locator('nav[aria-label="Breadcrumb"]').count()) === 0,
  )

  /* Batch 9: the title-to-frame rhythm is a 36 px article column gap. */
  const articleGap = await page.evaluate(() => {
    const article = document.querySelector('article')
    return article ? parseFloat(getComputedStyle(article).rowGap) : 0
  })
  check(`${route.path} article column gap is 36 px`, articleGap === 36, `gap=${articleGap}px`)
  const navGeometry = await page.evaluate(() => {
    const styleOf = (el) => {
      const style = getComputedStyle(el)
      return { border: parseFloat(style.borderTopWidth), radius: parseFloat(style.borderTopLeftRadius) }
    }
    const nav = document.querySelector('nav[aria-label="Browse experiments"]')
    const links = nav ? [...nav.querySelectorAll('a')].map(styleOf) : []
    const close = document.querySelector('a[aria-label="Close"]')
    return {
      navBorder: nav ? styleOf(nav).border : 0,
      links,
      close: close ? styleOf(close) : null,
    }
  })
  if (!route.orphan) {
    check(
      `${route.path} prev/next are two separate bordered buttons`,
      navGeometry.links.length === 2
        && navGeometry.navBorder === 0
        && navGeometry.links.every((link) => link.border >= 1 && link.radius >= 8 && link.radius <= 12),
      JSON.stringify(navGeometry.links),
    )
  }
  check(
    `${route.path} close button is bordered`,
    navGeometry.close !== null && navGeometry.close.border >= 1 && navGeometry.close.radius >= 8 && navGeometry.close.radius <= 12,
    JSON.stringify(navGeometry.close),
  )

  if (route.controls) {
    const controlsDom = await page.evaluate(() => {
      const heading = [...document.querySelectorAll('h2')].find((h) => h.textContent.trim() === 'Description')
      const header = heading?.closest('header')
      const section = heading?.closest('section')
      const wrapper = section?.parentElement ?? null
      return {
        chips: header ? header.querySelectorAll('button').length : 0,
        /* Batch 9: the Description header lost its hairline divider. */
        headerBorder: header ? parseFloat(getComputedStyle(header).borderBottomWidth) : 1,
        /* Batch 7: frame + controls are grouped in one 24 px wrapper directly
           under the frame; the wrapper holds exactly the frame block and the
           controls section. */
        groupGap: wrapper ? parseFloat(getComputedStyle(wrapper).rowGap) : 0,
        groupChildren: wrapper ? wrapper.children.length : 0,
      }
    })
    check(`${route.path} action chips live in the Description header`, controlsDom.chips >= 1, `${controlsDom.chips} button(s)`)
    check(`${route.path} Description header has no divider`, controlsDom.headerBorder === 0, `border-bottom=${controlsDom.headerBorder}px`)
    check(
      `${route.path} controls sit directly under the frame (24 px group)`,
      controlsDom.groupGap === 24 && controlsDom.groupChildren === 2,
      `gap=${controlsDom.groupGap}px, children=${controlsDom.groupChildren}`,
    )
  }

  /* Some demos (SkillsLab) use the 1344/520 aspect frame as their own stage —
     that frame is the implementation visual. A duplicate hero is one that
     sits OUTSIDE the first content section. */
  const strayHeroes = await page.evaluate(() => {
    const article = document.querySelector('article')
    const firstSection = article?.querySelector('section, div.flex.min-w-0.flex-col.gap-14 > *')
    return [...document.querySelectorAll('[class*="aspect-[1344/520]"]')]
      .filter((el) => !firstSection || !firstSection.contains(el)).length
  })
  check(`${route.path} has no duplicate hero preview`, strayHeroes === 0, strayHeroes ? `${strayHeroes} hero frame(s) remain` : '')

  check(`${route.path} zero console errors`, errors.length === 0, errors.join(' | '))
  await page.close()
}

await browser.close()
const failed = results.filter((result) => !result.ok).length
console.log(`\n${results.length - failed}/${results.length} checks passed`)
process.exit(failed === 0 ? 0 : 1)
