import { chromium } from 'playwright'

const base = process.env.BASE_URL ?? 'http://127.0.0.1:5173'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []

page.on('console', (message) => {
  if (message.type() === 'error') errors.push(`console: ${message.text()}`)
})
page.on('pageerror', (error) => errors.push(`page: ${error.message}`))

await page.goto(base, { waitUntil: 'networkidle' })
const card = page.locator('article').filter({ has: page.locator('a[href="/vault/thinking-reasoning"]') })
const thumbnail = card.locator('.ac-demo[data-compact="true"]')
const reasoning = thumbnail.locator('.ac-reasoning-card')

if (await reasoning.getAttribute('data-in-view') !== 'false') {
  throw new Error('Offscreen thumbnail started as visible')
}

await page.waitForTimeout(4300)
if (await reasoning.getAttribute('data-done') !== 'false') {
  throw new Error('Offscreen thumbnail completed before it was viewed')
}
if (await reasoning.locator('li[data-visible="true"]').count() !== 0) {
  throw new Error('Offscreen thumbnail advanced reasoning timers')
}

await card.scrollIntoViewIfNeeded()
await page.waitForFunction(() => document.querySelector('.ac-demo[data-compact="true"][data-component="thinking-reasoning"] .ac-reasoning-card')?.getAttribute('data-in-view') === 'true')
await page.waitForTimeout(1000)
if (await reasoning.locator('li[data-visible="true"]').count() < 1) {
  throw new Error('Thumbnail did not begin reasoning when scrolled into view')
}

await page.screenshot({
  path: 'artifacts/design-qa/thinking-reasoning-visibility-2026-07-16/thumbnail-mid-animation.png',
  fullPage: false,
})

await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
await page.waitForFunction(() => document.querySelector('.ac-demo[data-compact="true"][data-component="thinking-reasoning"] .ac-reasoning-card')?.getAttribute('data-in-view') === 'false')
await page.waitForTimeout(120)
if (await reasoning.locator('li[data-visible="true"]').count() !== 0) {
  throw new Error('Thumbnail did not reset after leaving view')
}

await card.scrollIntoViewIfNeeded()
await page.waitForFunction(() => document.querySelector('.ac-demo[data-compact="true"][data-component="thinking-reasoning"] .ac-reasoning-card')?.getAttribute('data-in-view') === 'true')
await page.waitForTimeout(1000)
if (await reasoning.locator('li[data-visible="true"]').count() < 1) {
  throw new Error('Thumbnail did not replay after re-entering view')
}

await page.goto(`${base}/vault/thinking-reasoning`, { waitUntil: 'networkidle' })
const expanded = page.locator('.ac-demo').first().locator('.ac-reasoning-card')
if (await expanded.getAttribute('data-in-view') !== 'true') {
  throw new Error('Expanded card was incorrectly visibility-gated')
}
await page.waitForTimeout(1100)
if (await expanded.locator('li[data-visible="true"]').count() < 1) {
  throw new Error('Expanded card no longer animates naturally')
}

await browser.close()
if (errors.length) throw new Error(errors.join('\n'))
console.log('Thinking + Reasoning verified: offscreen pause, on-entry animation, leave reset, re-entry replay, and unchanged expanded behavior.')
