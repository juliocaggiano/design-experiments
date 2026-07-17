import { chromium } from 'playwright'

const base = process.env.BASE_URL ?? 'http://127.0.0.1:5173'
const routes = [
  ['/vault/thinking-state', 'Thinking State'],
  ['/vault/thinking-reasoning', 'Thinking + Reasoning'],
  ['/vault/ai-web-search', 'Web Search'],
  ['/vault/ai-file-diff', 'File Diff'],
  ['/vault/ai-image-generation', 'Image Generation'],
  ['/vault/ai-text-response', 'Text Response'],
  ['/vault/ai-streaming-text', 'Streaming Text'],
  ['/vault/ai-inline-citations', 'Inline Citations'],
  ['/vault/ai-code-block', 'Code Block'],
  ['/vault/ai-task-list', 'To-do List'],
  ['/vault/ai-data-table', 'Data Table'],
  ['/vault/ai-comparison-table', 'Comparison Table'],
]

const browser = await chromium.launch()
const errors = []

async function auditViewport(width, height) {
  const page = await browser.newPage({ viewport: { width, height } })
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`${width}px console: ${message.text()}`)
  })
  page.on('pageerror', (error) => errors.push(`${width}px page: ${error.message}`))

  await page.goto(base, { waitUntil: 'networkidle' })
  const feedCount = await page.locator('.ac-demo[data-compact="true"]').count()
  if (feedCount !== routes.length) throw new Error(`${width}px feed rendered ${feedCount}/${routes.length} AI CSS cards`)

  for (const [path, title] of routes) {
    const links = await page.locator(`a[href="${path}"]`).count()
    if (links < 1) throw new Error(`${width}px feed is missing ${path}`)
    await page.goto(`${base}${path}`, { waitUntil: 'commit', timeout: 12_000 })
    await page.locator('.ac-demo').first().waitFor()
    if (await page.locator('h1').textContent() !== title) throw new Error(`${path} title mismatch`)
    if (await page.locator('.ac-demo').count() !== 2) throw new Error(`${path} does not share one demo across hero and implementation`)
    if (await page.getByRole('button', { name: 'Reset' }).count() !== 1) throw new Error(`${path} is missing Reset`)
    if (await page.getByRole('button', { name: 'Replay' }).count() !== 1) throw new Error(`${path} is missing Replay`)

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    if (overflow > 1) throw new Error(`${path} overflows ${width}px by ${overflow}px`)

    const hero = await page.locator('.ac-demo').first().boundingBox()
    const inner = await page.locator('.ac-demo').first().locator('.ac-specimen').boundingBox()
    if (!hero || !inner || inner.x < hero.x - 1 || inner.x + inner.width > hero.x + hero.width + 1) {
      throw new Error(`${path} specimen escapes its ${width}px hero`)
    }
  }

  await page.close()
}

await auditViewport(1440, 900)
await auditViewport(390, 844)
await auditViewport(320, 720)

const page = await browser.newPage({ viewport: { width: 1200, height: 900 } })
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(`interaction console: ${message.text()}`)
})
page.on('pageerror', (error) => errors.push(`interaction page: ${error.message}`))

await page.goto(`${base}/vault/ai-streaming-text`, { waitUntil: 'commit', timeout: 12_000 })
await page.locator('.ac-demo').first().waitFor()
const stream = page.locator('.ac-demo').nth(1).locator('.ac-streaming-text p')
const earlyStream = await stream.textContent()
await page.waitForTimeout(500)
const laterStream = await stream.textContent()
if ((laterStream?.length ?? 0) <= (earlyStream?.length ?? 0)) throw new Error('Streaming text did not advance')
await page.getByRole('button', { name: 'Replay' }).click()
await page.waitForTimeout(80)
if ((await stream.textContent())?.length > 8) throw new Error('Streaming text did not restart')

await page.goto(`${base}/vault/ai-web-search`, { waitUntil: 'commit', timeout: 12_000 })
await page.locator('.ac-demo').first().waitFor()
await page.waitForTimeout(2600)
if (await page.locator('.ac-demo').nth(1).locator('[data-resolved="true"]').count() !== 3) throw new Error('Web search sources did not resolve')

await page.goto(`${base}/vault/ai-code-block`, { waitUntil: 'commit', timeout: 12_000 })
await page.locator('.ac-demo').first().waitFor()
const codeDemo = page.locator('.ac-demo').nth(1)
await codeDemo.getByRole('button', { name: 'Copy' }).click()
if (await codeDemo.getByRole('button', { name: 'Copied' }).count() !== 1) throw new Error('Code copy feedback did not appear')

await page.goto(`${base}/vault/ai-task-list`, { waitUntil: 'commit', timeout: 12_000 })
await page.locator('.ac-demo').first().waitFor()
const taskDemo = page.locator('.ac-demo').nth(1)
if (!(await taskDemo.locator('.ac-task-header small').textContent())?.includes('2/5')) throw new Error('Task list initial progress is wrong')
await page.getByRole('button', { name: 'Replay' }).click()
if (!(await taskDemo.locator('.ac-task-header small').textContent())?.includes('3/5')) throw new Error('Task list replay did not advance progress')

await page.goto(`${base}/vault/ai-inline-citations`, { waitUntil: 'commit', timeout: 12_000 })
await page.locator('.ac-demo').first().waitFor()
const citationDemo = page.locator('.ac-demo').nth(1)
await citationDemo.getByRole('button', { name: 'View citation 2' }).click()
if (await citationDemo.locator('footer > button[data-active="true"] b').textContent() !== 'W3C WAI') throw new Error('Citation selection did not update the source')

await page.goto(`${base}/vault/ai-comparison-table`, { waitUntil: 'commit', timeout: 12_000 })
await page.locator('.ac-demo').first().waitFor()
const comparison = page.locator('.ac-demo').nth(1).locator('table')
await page.locator('.ac-demo').nth(1).getByRole('button', { name: 'Personal' }).click()
if (await comparison.getAttribute('data-selected') !== 'personal') throw new Error('Comparison selection did not move')

await page.close()
await browser.close()

if (errors.length) throw new Error(errors.join('\n'))
console.log(`AI CSS verified: ${routes.length} cards × 3 viewports, shared hero/implementation parity, and key interactions.`)
