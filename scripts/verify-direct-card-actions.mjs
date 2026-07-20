import { chromium } from 'playwright'

const base = process.env.BASE_URL ?? 'http://127.0.0.1:5173'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []

page.on('console', (message) => {
  if (message.type() === 'error') errors.push(`console: ${message.text()}`)
})
page.on('pageerror', (error) => errors.push(`page: ${error.message}`))

async function open(path) {
  await page.goto(`${base}${path}`, { waitUntil: 'networkidle' })
  await page.locator('.td-demo').first().waitFor()
}

await page.goto(base, { waitUntil: 'networkidle' })
const captions = page.locator('[data-card-caption]')
const captionCount = await captions.count()
if (captionCount < 36) throw new Error(`Expected the complete feed, found ${captionCount} captions`)

const categories = await page.locator('[data-card-category]').allTextContents()
if (categories.length !== captionCount) throw new Error('Every feed caption should end with a category')
if (categories.some((category) => !['Skills', 'Interactions', 'Motion', 'Interfaces'].includes(category))) {
  throw new Error(`Unexpected feed category: ${categories.join(', ')}`)
}
const captionText = await captions.allTextContents()
if (captionText.some((text) => /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}\b/.test(text))) {
  throw new Error('A date is still visible in a feed caption')
}

const resizeCard = page.locator('article').filter({ has: page.locator('a[href="/vault/card-resize"]') })
const resizeButton = resizeCard.locator('.td-resize-card')
const feedWidthBefore = (await resizeButton.boundingBox())?.width
await resizeButton.click()
await page.waitForTimeout(380)
const feedWidthAfter = (await resizeButton.boundingBox())?.width
if (page.url() !== `${base}/`) throw new Error('Direct specimen interaction navigated away from the feed')
if (feedWidthBefore === feedWidthAfter) throw new Error('Feed card resize did not animate itself')
await resizeCard.locator('[data-card-caption]').click()
await page.waitForTimeout(250)
if (!page.url().endsWith('/vault/card-resize')) throw new Error('Card caption no longer opens the expanded page')

await open('/vault/card-resize')
const card = page.locator('.td-demo').first().locator('.td-resize-card')
const cardWidth = (await card.boundingBox())?.width
await card.click()
await page.waitForTimeout(380)
if ((await card.boundingBox())?.width === cardWidth) throw new Error('Card resize surface is not its own trigger')

await open('/vault/number-pop-in')
const number = page.locator('.td-demo').first().locator('.td-number')
const numberBefore = await number.textContent()
await number.click()
if (await number.textContent() === numberBefore) throw new Error('Number surface did not advance itself')

await open('/vault/notification-badge')
const notification = page.locator('.td-demo').first().locator('.td-icon-button')
await notification.click()
if (await notification.locator('.td-badge').getAttribute('data-visible') !== 'false') throw new Error('Notification surface did not toggle itself')

await open('/vault/text-states-swap')
const status = page.locator('.td-demo').first().locator('.td-status-line')
await status.click()
if (!(await status.textContent())?.includes('completed')) throw new Error('Status surface did not change itself')

await open('/vault/menu-dropdown')
const menuDemo = page.locator('.td-demo').first()
await menuDemo.getByRole('button', { name: 'Menu' }).click()
if (await menuDemo.locator('.td-menu').getAttribute('data-open') !== 'true') throw new Error('Menu product trigger did not open')

await open('/vault/icon-swap')
const icon = page.locator('.td-demo').first().locator('.td-swap-button')
await icon.click()
if (await icon.getAttribute('data-close') !== 'true') throw new Error('Icon button did not swap itself')

await open('/vault/error-state-shake')
const errorDemo = page.locator('.td-demo').first()
await errorDemo.locator('input').focus()
if (await errorDemo.locator('label').getAttribute('data-error') !== 'true') throw new Error('Error field did not validate from direct focus')

await open('/vault/skeleton-loader-reveal')
const profile = page.locator('.td-demo').first().locator('.td-profile')
await profile.click()
if (await profile.getAttribute('data-loading') !== 'true') throw new Error('Profile surface did not load itself')
await page.waitForTimeout(1100)
if (await profile.getAttribute('data-loading') !== 'false') throw new Error('Profile surface did not resolve')

await open('/vault/shimmer-text')
const shimmer = page.locator('.td-demo').first().locator('.td-shimmer')
await shimmer.click()
if (await shimmer.getAttribute('data-running') !== 'false') throw new Error('Shimmer label did not pause itself')

await open('/vault/tooltip-open-close')
const tooltipAnchor = page.locator('.td-demo').first().locator('.td-tooltip-anchor')
const tooltipButton = tooltipAnchor.locator('button')
const tooltipBox = await tooltipButton.boundingBox()
if (!tooltipBox || tooltipBox.height < 56) throw new Error(`Tooltip trigger stayed small: ${tooltipBox?.height ?? 0}px tall`)
await tooltipButton.click()
if (await tooltipAnchor.getAttribute('data-forced') !== 'true') throw new Error('Tooltip surface did not toggle itself')
const tooltipFontSize = await tooltipAnchor.locator('span[role="tooltip"]').evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
if (tooltipFontSize < 14) throw new Error(`Tooltip copy stayed small: ${tooltipFontSize}px font`)

const forbidden = ['Animate', 'Clear text', 'Reset text', 'Toggle menu', 'Toggle modal', 'Toggle panel']
for (const label of forbidden) {
  if (await page.getByText(label, { exact: true }).count()) throw new Error(`Redundant helper label remains: ${label}`)
}

for (const width of [390, 320]) {
  await page.setViewportSize({ width, height: 800 })
  await page.goto(base, { waitUntil: 'networkidle' })
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  if (overflow > 1) throw new Error(`Feed overflows ${width}px by ${overflow}px`)
}

await browser.close()
if (errors.length) throw new Error(errors.join('\n'))
console.log(`Direct card actions verified: ${captionCount} category captions, 10 direct-manipulation transitions, feed navigation, and 390/320 px fit.`)
