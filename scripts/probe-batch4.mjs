import { chromium } from 'playwright'

const base = process.env.BASE_URL ?? 'http://127.0.0.1:5173'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 320, height: 720 } })
await page.goto(base, { waitUntil: 'networkidle' })
const card = page.locator('article').filter({ has: page.locator('a[href="/vault/shadcn-calendar"]') }).first()
await card.scrollIntoViewIfNeeded()
await page.waitForTimeout(500)

const info = await page.evaluate(() => {
  const demo = document.querySelector('.sh-demo[data-id="calendar"]')
  const native = demo?.querySelector('.sx-native')
  const cal = demo?.querySelector('.sx-calendar')
  const r = (el) => el ? JSON.parse(JSON.stringify(el.getBoundingClientRect())) : null
  return {
    demoRect: r(demo),
    nativeRect: r(native),
    calRect: r(cal),
    nativeTransform: native ? getComputedStyle(native).transform : null,
    calDisplay: cal ? getComputedStyle(cal).display : null,
    calVisibility: cal ? getComputedStyle(cal).visibility : null,
    calOpacity: cal ? getComputedStyle(cal).opacity : null,
    dayCount: demo?.querySelectorAll('.sx-calendar-day-button').length,
    selectedBg: (() => {
      const sel = demo?.querySelector('.sx-calendar-day-button[data-selected-single="true"]')
      return sel ? getComputedStyle(sel).backgroundColor : null
    })(),
    textPrimary: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
    weekdayColor: (() => {
      const w = demo?.querySelector('.sx-calendar-weekday')
      return w ? getComputedStyle(w).color : null
    })(),
  }
})
console.log(JSON.stringify(info, null, 2))
await page.screenshot({ path: 'artifacts/design-qa/batch4-2026-07-18/debug-320-viewport.png' })
await browser.close()
