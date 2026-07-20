/* Batch 11 recon — study transitions.dev's Toggle specimen (look + motion).
   Saves reference captures to artifacts/design-qa/batch11-2026-07-20/ref/. */
import { chromium } from 'playwright'

const OUT = new URL('../artifacts/design-qa/batch11-2026-07-20/ref/', import.meta.url).pathname
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
await page.goto('https://transitions.dev/detail.html?t=toggle', { waitUntil: 'networkidle', timeout: 45000 })
await page.waitForTimeout(1500)
await page.screenshot({ path: `${OUT}transitions-dev-toggle-page.png` })

/* Find the toggle/switch on the page. */
const found = await page.evaluate(() => {
  const el = document.querySelector('[role="switch"], .toggle, [class*="toggle"], [class*="switch"]')
  if (!el) return null
  const r = el.getBoundingClientRect()
  return { tag: el.tagName, cls: el.className, rect: { x: r.x, y: r.y, w: r.width, h: r.height }, html: el.outerHTML.slice(0, 500) }
})
console.log('TOGGLE ELEMENT:', JSON.stringify(found, null, 1))

/* Dump styles that mention toggle/switch. */
const styles = await page.evaluate(() => {
  const out = []
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        const text = rule.cssText
        if (/toggle|switch|thumb|track/i.test(text)) out.push(text.slice(0, 400))
      }
    } catch { /* cross-origin */ }
  }
  return out
})
console.log('STYLES:', JSON.stringify(styles, null, 1))

/* Motion sampling: click the toggle and record the thumb's x over time. */
const target = page.locator('[role="switch"], .toggle, [class*="toggle"]').first()
if (await target.count()) {
  const motion = await page.evaluate(async () => {
    const root = document.querySelector('[role="switch"], .toggle, [class*="toggle"]')
    const thumb = root.querySelector('[class*="thumb"], [class*="knob"], span, div') ?? root
    const read = () => {
      const a = thumb.getBoundingClientRect()
      const b = root.getBoundingClientRect()
      return +(a.left - b.left).toFixed(2)
    }
    const samples = []
    const t0 = performance.now()
    root.click()
    return await new Promise((resolve) => {
      const tick = () => {
        samples.push([+(performance.now() - t0).toFixed(0), read()])
        if (performance.now() - t0 > 1400) resolve({ samples, thumbClass: thumb.className, rootHtml: root.outerHTML.slice(0, 300) })
        else requestAnimationFrame(tick)
      }
      tick()
    })
  })
  console.log('MOTION:', JSON.stringify(motion, null, 1))
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${OUT}transitions-dev-toggle-on.png` })
}
await browser.close()
