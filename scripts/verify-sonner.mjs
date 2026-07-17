import { chromium } from 'playwright'

const base = process.env.BASE_URL ?? 'http://127.0.0.1:5173'
const output = 'artifacts/design-qa/sonner-2026-07-16'
const browser = await chromium.launch()
const errors = []

function collectErrors(page, label) {
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`${label} console: ${message.text()}`)
  })
  page.on('pageerror', (error) => errors.push(`${label} page: ${error.message}`))
}

async function auditViewport(width, height) {
  const page = await browser.newPage({ viewport: { width, height } })
  collectErrors(page, `${width}px`)
  await page.goto(`${base}/vault/sonner`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)

  if (await page.getByRole('heading', { level: 1 }).textContent() !== 'Toast Notifications') {
    throw new Error(`${width}px detail title mismatch`)
  }
  if (await page.locator('.sv-demo').count() !== 2) {
    throw new Error(`${width}px route does not share the demo across hero and implementation`)
  }
  if (await page.getByRole('button', { name: 'Reset' }).count() !== 1) throw new Error(`${width}px Reset missing`)
  if (await page.getByRole('button', { name: 'Replay' }).count() !== 1) throw new Error(`${width}px Replay missing`)

  const selects = page.locator('select')
  if (await selects.count() !== 4) throw new Error(`${width}px expected four exploration controls`)
  if (await selects.nth(0).locator('option').count() !== 8) throw new Error(`${width}px toast types incomplete`)
  if (await selects.nth(1).locator('option').count() !== 6) throw new Error(`${width}px positions incomplete`)

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  if (overflow > 1) throw new Error(`${width}px route overflows by ${overflow}px`)

  for (const demo of await page.locator('.sv-demo').all()) {
    const outer = await demo.boundingBox()
    const trigger = await demo.locator('.sv-trigger').boundingBox()
    const toast = await demo.locator('.sv-toast').first().boundingBox()
    if (!outer || !trigger || !toast) throw new Error(`${width}px missing visible Sonner geometry`)
    for (const box of [trigger, toast]) {
      if (
        box.x < outer.x - 1
        || box.y < outer.y - 1
        || box.x + box.width > outer.x + outer.width + 1
        || box.y + box.height > outer.y + outer.height + 1
      ) {
        throw new Error(`${width}px Sonner content escapes its container`)
      }
    }
  }

  if (width === 390) {
    await page.screenshot({ path: `${output}/detail-mobile-390.png`, fullPage: false })
  }
  await page.close()
}

await auditViewport(1440, 900)
await auditViewport(390, 844)
await auditViewport(320, 720)

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
collectErrors(page, 'interaction')

await page.goto(`${base}/vault/sonner`, { waitUntil: 'networkidle' })
const implementation = page.locator('.sv-demo').nth(1)
const typeSelect = page.locator('select').nth(0)
const positionSelect = page.locator('select').nth(1)
const stackSelect = page.locator('select').nth(2)
const dismissSelect = page.locator('select').nth(3)

await page.getByRole('button', { name: 'Reset' }).click()
if (await implementation.locator('.sv-toast').count() !== 0) throw new Error('Reset did not clear notifications')
await page.getByRole('button', { name: 'Replay' }).click()
await page.waitForTimeout(100)
if (await implementation.locator('.sv-toast[data-mounted="true"]').count() !== 1) {
  throw new Error('Replay did not mount a toast')
}

await typeSelect.selectOption('promise')
await page.waitForTimeout(100)
if (!(await implementation.locator('.sv-toast').first().textContent())?.includes('Loading')) {
  throw new Error('Promise toast did not start in loading state')
}
await page.waitForTimeout(1400)
if (!(await implementation.locator('.sv-toast').first().textContent())?.includes('Sonner toast has been added')) {
  throw new Error('Promise toast did not update in place')
}

await typeSelect.selectOption('action')
await page.waitForTimeout(100)
const actionToast = implementation.locator('.sv-toast').first()
if (await actionToast.getByRole('button', { name: 'Undo' }).count() !== 1) {
  throw new Error('Action toast is missing Undo')
}
await actionToast.getByRole('button', { name: 'Undo' }).click()
await page.waitForTimeout(260)
if (await implementation.locator('.sv-toast').count() !== 0) throw new Error('Undo did not dismiss the toast')

await typeSelect.selectOption('success')
await dismissSelect.selectOption('visible')
await page.waitForTimeout(100)
const closeToast = implementation.locator('.sv-toast').first()
if (await closeToast.getByRole('button', { name: 'Close toast' }).count() !== 1) {
  throw new Error('Close-button mode is missing its control')
}
await closeToast.getByRole('button', { name: 'Close toast' }).click()
await page.waitForTimeout(260)
if (await implementation.locator('.sv-toast').count() !== 0) throw new Error('Close button did not dismiss')

await dismissSelect.selectOption('swipe')
await stackSelect.selectOption('stacked')
await typeSelect.selectOption('description')
await page.waitForTimeout(100)
const trigger = implementation.getByRole('button', { name: 'Render a toast' })
await trigger.click()
await trigger.click()
if (await implementation.locator('.sv-toast').count() !== 3) throw new Error('Toast stack did not cap at three items')
await page.waitForTimeout(340)
const backOpacity = await implementation.locator('.sv-toast').nth(1).locator('.sv-toast-inner').evaluate((node) => getComputedStyle(node).opacity)
if (backOpacity !== '0') throw new Error('Compact stack did not hide back-toast content')
await implementation.locator('.sv-toast').first().hover()
await page.waitForTimeout(420)
const expandedOpacity = await implementation.locator('.sv-toast').nth(1).locator('.sv-toast-inner').evaluate((node) => getComputedStyle(node).opacity)
if (expandedOpacity !== '1') throw new Error('Stack did not expand on hover')

await positionSelect.selectOption('top-right')
await page.waitForTimeout(100)
const toaster = implementation.locator('.sv-toaster')
if (await toaster.getAttribute('data-x') !== 'right' || await toaster.getAttribute('data-y') !== 'top') {
  throw new Error('Position control did not move the toaster')
}

await page.getByRole('button', { name: 'Reset' }).click()
await trigger.click()
await page.waitForTimeout(100)
const swiped = implementation.locator('.sv-toast').first()
const box = await swiped.boundingBox()
if (!box) throw new Error('Swipe target is missing')
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
await page.mouse.down()
await page.mouse.move(box.x + box.width / 2 + 80, box.y + box.height / 2, { steps: 5 })
await page.mouse.up()
await page.waitForTimeout(260)
if (await implementation.locator('.sv-toast').count() !== 0) throw new Error('Swipe threshold did not dismiss the toast')

await page.goto(`${base}/?category=interactions`, { waitUntil: 'networkidle' })
const feedCard = page.locator('article').filter({ has: page.locator('a[href="/vault/sonner"]') })
const compact = feedCard.locator('.sv-demo[data-compact="true"]')
await feedCard.scrollIntoViewIfNeeded()
await page.waitForFunction(() => document.querySelector('.sv-demo[data-compact="true"]')?.getAttribute('data-active') === 'true')
await compact.getByRole('button', { name: 'Render a toast' }).click()
if (new URL(page.url()).pathname !== '/') throw new Error('Feed toast interaction navigated away')
await feedCard.locator('[data-card-caption]').click()
if (new URL(page.url()).pathname !== '/vault/sonner') throw new Error('Feed caption did not open Sonner detail')

await page.close()

const reducedContext = await browser.newContext({
  viewport: { width: 1200, height: 800 },
  reducedMotion: 'reduce',
})
const reduced = await reducedContext.newPage()
collectErrors(reduced, 'reduced-motion')
await reduced.goto(`${base}/vault/sonner`, { waitUntil: 'networkidle' })
const reducedToast = reduced.locator('.sv-demo').first().locator('.sv-toast').first()
if (await reducedToast.getAttribute('data-mounted') !== 'true') throw new Error('Reduced motion did not show the settled toast')
const duration = await reducedToast.evaluate((node) => getComputedStyle(node).transitionDuration)
if (!duration.includes('0.00001s') && !duration.includes('1e-05s')) {
  throw new Error('Reduced motion did not collapse toast transitions')
}
await reducedContext.close()

await browser.close()
if (errors.length) throw new Error(errors.join('\n'))
console.log('Sonner verified: focused thumbnail, eight toast types, six positions, stack expansion, promise/action/close states, swipe dismissal, reduced motion, and desktop/mobile fit.')
