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
if (captionCount < 40) throw new Error(`Expected the complete feed, found ${captionCount} captions`)

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
const card = page.locator('.td-demo').nth(1).locator('.td-resize-card')
const cardWidth = (await card.boundingBox())?.width
await card.click()
await page.waitForTimeout(380)
if ((await card.boundingBox())?.width === cardWidth) throw new Error('Card resize surface is not its own trigger')

await open('/vault/number-pop-in')
const number = page.locator('.td-demo').nth(1).locator('.td-number')
const numberBefore = await number.textContent()
await number.click()
if (await number.textContent() === numberBefore) throw new Error('Number surface did not advance itself')

await open('/vault/notification-badge')
const notification = page.locator('.td-demo').nth(1).locator('.td-icon-button')
await notification.click()
if (await notification.locator('.td-badge').getAttribute('data-visible') !== 'false') throw new Error('Notification surface did not toggle itself')

await open('/vault/text-states-swap')
const status = page.locator('.td-demo').nth(1).locator('.td-status-line')
await status.click()
if (!(await status.textContent())?.includes('completed')) throw new Error('Status surface did not change itself')

await open('/vault/menu-dropdown')
const menuDemo = page.locator('.td-demo').nth(1)
await menuDemo.getByRole('button', { name: 'Menu' }).click()
if (await menuDemo.locator('.td-menu').getAttribute('data-open') !== 'true') throw new Error('Menu product trigger did not open')

await open('/vault/modal-open-close')
const modalDemo = page.locator('.td-demo').nth(1)
await modalDemo.getByRole('button', { name: 'New project' }).click()
if (await modalDemo.locator('.td-modal-layer').getAttribute('data-open') !== 'true') throw new Error('New project trigger did not open the modal')

await open('/vault/panel-reveal')
const panelDemo = page.locator('.td-demo').nth(1)
await panelDemo.locator('.td-panel-toolbar').click()
if (await panelDemo.locator('.td-panel-clip').getAttribute('data-open') !== 'false') throw new Error('Panel header did not close its panel')

await open('/vault/icon-swap')
const icon = page.locator('.td-demo').nth(1).locator('.td-swap-button')
await icon.click()
if (await icon.getAttribute('data-close') !== 'true') throw new Error('Icon button did not swap itself')

await open('/vault/success-check')
const success = page.locator('.td-demo').nth(1).locator('.td-success-trigger')
await success.click()
await page.waitForTimeout(40)
if (await success.locator('svg').getAttribute('data-visible') !== 'false') throw new Error('Success confirmation did not restart')
await page.waitForTimeout(180)
if (await success.locator('svg').getAttribute('data-visible') !== 'true') throw new Error('Success confirmation did not return')

await open('/vault/error-state-shake')
const errorDemo = page.locator('.td-demo').nth(1)
await errorDemo.locator('input').focus()
if (await errorDemo.locator('label').getAttribute('data-error') !== 'true') throw new Error('Error field did not validate from direct focus')

await open('/vault/input-clear')
const clearDemo = page.locator('.td-demo').nth(1)
await clearDemo.getByRole('button', { name: 'Clear search' }).click()
if (await clearDemo.locator('.td-search-field').getAttribute('data-cleared') !== 'true') throw new Error('Search clear control did not clear its field')
await clearDemo.getByRole('button', { name: 'Restore search text' }).click()
if (await clearDemo.locator('.td-search-field').getAttribute('data-cleared') !== 'false') throw new Error('Search field did not restore from the same control')

await open('/vault/skeleton-loader-reveal')
const profile = page.locator('.td-demo').nth(1).locator('.td-profile')
await profile.click()
if (await profile.getAttribute('data-loading') !== 'true') throw new Error('Profile surface did not load itself')
await page.waitForTimeout(1100)
if (await profile.getAttribute('data-loading') !== 'false') throw new Error('Profile surface did not resolve')

await open('/vault/texts-reveal')
const reveal = page.locator('.td-demo').nth(1).locator('.td-texts-reveal > button')
await reveal.click()
await page.waitForTimeout(60)
if (await reveal.getAttribute('data-visible') !== 'false') throw new Error('Text reveal did not restart')
await page.waitForTimeout(180)
if (await page.locator('.td-demo').nth(1).locator('.td-texts-reveal > button').getAttribute('data-visible') !== 'true') throw new Error('Text reveal did not return')

await open('/vault/shimmer-text')
const shimmer = page.locator('.td-demo').nth(1).locator('.td-shimmer')
await shimmer.click()
if (await shimmer.getAttribute('data-running') !== 'false') throw new Error('Shimmer label did not pause itself')

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
console.log(`Direct card actions verified: ${captionCount} category captions, 12 direct-manipulation transitions, feed navigation, and 390/320 px fit.`)
