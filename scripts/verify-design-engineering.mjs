import { chromium } from 'playwright'

const base = process.env.BASE_URL ?? 'http://127.0.0.1:5173'
const ROUTE = '/vault/skill-design-eng'
const SECTIONS = ['Taste', 'Animation Vocabulary', '12 Principles', 'Better UI']

const browser = await chromium.launch()
const errors = []

function collectErrors(page, label) {
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`${label} console: ${message.text()}`)
  })
  page.on('pageerror', (error) => errors.push(`${label} page: ${error.message}`))
}

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
collectErrors(page, '1440px')
await page.goto(`${base}${ROUTE}`, { waitUntil: 'networkidle' })
await page.locator('.ek-box').first().waitFor()

if ((await page.getByRole('heading', { level: 1 }).textContent()) !== 'Design Engineering') {
  throw new Error('Umbrella page h1 mismatch')
}

const tabs = page.getByRole('tab')
if (await tabs.count() !== SECTIONS.length) {
  throw new Error(`Expected ${SECTIONS.length} section chips, found ${await tabs.count()}`)
}
for (const [index, label] of SECTIONS.entries()) {
  if ((await tabs.nth(index).textContent()) !== label) throw new Error(`Chip ${index} should be "${label}"`)
}

/* Default section: Taste renders the design-eng implementation. */
if ((await tabs.nth(0).getAttribute('aria-selected')) !== 'true') {
  throw new Error('Taste chip is not selected by default')
}
if (await page.locator('.ek-box[data-skill="emil-design-eng"]').count() !== 1) {
  throw new Error('Taste section does not render the design-eng implementation')
}
if (await page.locator('select').first().locator('option').count() !== 3) {
  throw new Error('Taste section lost its variant selector')
}

/* Chip switching swaps sections in place, without a reload. */
await page.getByRole('tab', { name: 'Animation Vocabulary' }).click()
if (await page.locator('.ek-box[data-skill="animation-vocabulary"]').count() !== 1) {
  throw new Error('Vocabulary chip did not render the vocabulary implementation')
}
if (await page.locator('.ek-box[data-skill="emil-design-eng"]').count() !== 0) {
  throw new Error('Vocabulary section should not render the design-eng demo')
}
const vocabularyOptions = await page.locator('select').first().locator('option').count()
if (vocabularyOptions !== 4) throw new Error(`Vocabulary selector should expose 4 effects, found ${vocabularyOptions}`)

await page.getByRole('tab', { name: '12 Principles' }).click()
if (await page.locator('.ap-demo').count() !== 1) throw new Error('12 Principles chip did not render the inspector')
if (!((await page.locator('.ap-score').textContent()) ?? '').includes('12 / 12')) {
  throw new Error('12 Principles inspector did not mount its score')
}
await page.getByRole('button', { name: 'Replay', exact: true }).click()

await page.getByRole('tab', { name: 'Better UI' }).click()
if ((await page.getByText('Interface review').count()) < 1) {
  throw new Error('Better UI chip did not render the interface review demo')
}
/* The save button's accessible name flips to "Saved" on click, so locate it
   by the persistent aria-pressed attribute instead of its label. */
const saveButton = page.locator('section[aria-label="Better UI"] button[aria-pressed]')
if ((await saveButton.getAttribute('aria-pressed')) !== 'false') {
  throw new Error('Better UI save action should start unpressed')
}
await saveButton.click()
if ((await saveButton.getAttribute('aria-pressed')) !== 'true') {
  throw new Error('Better UI save action is not interactive')
}

await page.getByRole('tab', { name: 'Taste' }).click()
if (await page.locator('.ek-box[data-skill="emil-design-eng"]').count() !== 1) {
  throw new Error('Returning to Taste did not restore the implementation')
}

await page.close()

/* Every section must fit mobile widths without horizontal overflow. */
for (const [width, height] of [[390, 844], [320, 720]]) {
  const mobile = await browser.newPage({ viewport: { width, height } })
  collectErrors(mobile, `${width}px`)
  await mobile.goto(`${base}${ROUTE}`, { waitUntil: 'networkidle' })
  await mobile.locator('.ek-box').first().waitFor()
  for (const label of SECTIONS) {
    if (label !== 'Taste') await mobile.getByRole('tab', { name: label }).click()
    await mobile.waitForTimeout(120)
    const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    if (overflow > 1) throw new Error(`${ROUTE} section "${label}" overflows ${width}px by ${overflow}px`)
  }
  await mobile.close()
}

await browser.close()

if (errors.length) throw new Error(errors.join('\n'))
console.log('Design Engineering umbrella verified: h1, four section chips, in-place switching, variant selectors, direct interaction, and 1440/390/320 px fit.')
