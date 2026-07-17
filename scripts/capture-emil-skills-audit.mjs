import { chromium } from 'playwright'

const base = process.env.BASE_URL ?? 'http://127.0.0.1:5173'
const phase = process.env.PHASE ?? 'before'
const output = `artifacts/audits/emil-skills-2026-07-16/${phase}`
const skills = [
  ['skill-design-eng', 'design-engineering-taste'],
  ['skill-animation-vocabulary', 'animation-vocabulary'],
  ['skill-improve-animations', 'motion-audit'],
  ['skill-animation-opportunities', 'animation-opportunities'],
  ['skill-review-animations', 'craft-bar'],
  ['skill-apple-design', 'fluid-interfaces'],
]

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
const errors = []
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(`console: ${message.text()}`)
})
page.on('pageerror', (error) => errors.push(`page: ${error.message}`))

await page.goto(`${base}/?category=skills`, { waitUntil: 'networkidle' })
await page.waitForTimeout(700)

for (let index = 0; index < skills.length; index += 1) {
  const [route, name] = skills[index]
  const card = page.locator('article').filter({ has: page.locator(`a[href="/vault/${route}"]`) })
  await card.scrollIntoViewIfNeeded()
  await page.waitForTimeout(900)
  await card.screenshot({ path: `${output}/${String(index + 1).padStart(2, '0')}-${name}-thumbnail.png` })
}

for (let index = 0; index < skills.length; index += 1) {
  const [route, name] = skills[index]
  await page.goto(`${base}/vault/${route}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(850)
  await page.screenshot({ path: `${output}/${String(index + 1).padStart(2, '0')}-${name}-expanded.png`, fullPage: false })
}

await browser.close()
if (errors.length) throw new Error(errors.join('\n'))
console.log(`Captured ${skills.length} Emil skill thumbnails and expanded pages to ${output}.`)
