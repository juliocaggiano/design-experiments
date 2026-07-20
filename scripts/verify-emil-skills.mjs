import { chromium } from 'playwright'

const base = process.env.BASE_URL ?? 'http://127.0.0.1:5173'
/* After the Design Engineering merge, Fluid Interfaces is the only standalone
   Emil detail page. The design-eng skill renders inside the umbrella page at
   /vault/skill-design-eng and as that card's feed thumbnail, so the skills
   feed carries exactly two Emil thumbnails. */
const skills = [
  {
    path: '/vault/skill-apple-design',
    title: 'Fluid Interfaces',
    id: 'apple-design',
    variants: ['interruptible-toggle', 'rubber-band', 'direct-drag', 'spatial-origin'],
  },
]

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

  await page.goto(`${base}/?category=skills`, { waitUntil: 'networkidle' })
  const compact = page.locator('.ek-box[data-compact="true"]')
  if (await compact.count() !== 2) {
    throw new Error(`${width}px skills feed rendered ${await compact.count()}/2 Emil thumbnails (umbrella + Fluid Interfaces)`)
  }
  if (await compact.locator('.ek-stage').count() !== 2) {
    throw new Error(`${width}px feed does not contain exactly one specimen per Emil thumbnail`)
  }
  if (await compact.locator('.ek-caption, .ek-plan, .ek-pin, .ek-checks').count() !== 0) {
    throw new Error(`${width}px feed still contains legacy report or caption UI`)
  }
  if (await page.locator('a[href="/vault/skill-design-eng"]').count() < 1) {
    throw new Error(`${width}px feed is missing the Design Engineering umbrella card`)
  }

  for (const skill of skills) {
    if (await page.locator(`a[href="${skill.path}"]`).count() < 1) {
      throw new Error(`${width}px feed is missing ${skill.path}`)
    }

    await page.goto(`${base}${skill.path}`, { waitUntil: 'networkidle' })
    const boxes = page.locator('.ek-box')
    await boxes.first().waitFor()

    if (await page.getByRole('heading', { level: 1 }).textContent() !== skill.title) {
      throw new Error(`${skill.path} title mismatch at ${width}px`)
    }
    if (await boxes.count() !== 1) {
      throw new Error(`${skill.path} does not render the shared implementation demo`)
    }
    if (await page.getByRole('button', { name: 'Reset', exact: true }).count() !== 1) {
      throw new Error(`${skill.path} is missing Reset`)
    }
    if (await page.getByRole('button', { name: 'Replay', exact: true }).count() !== 1) {
      throw new Error(`${skill.path} is missing Replay`)
    }

    const selector = page.locator('select').first()
    if (await selector.locator('option').count() !== skill.variants.length) {
      throw new Error(`${skill.path} exposes the wrong number of examples`)
    }
    for (const variant of skill.variants) {
      await selector.selectOption(variant)
      if (await boxes.nth(0).getAttribute('data-variant') !== variant) {
        throw new Error(`${skill.path} did not render selected variant ${variant}`)
      }
    }

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    if (overflow > 1) throw new Error(`${skill.path} overflows ${width}px by ${overflow}px`)

    for (const box of await boxes.all()) {
      const outer = await box.boundingBox()
      const stage = await box.locator('.ek-stage').boundingBox()
      if (!outer || !stage) throw new Error(`${skill.path} is missing visible specimen geometry`)
      if (
        stage.x < outer.x - 1
        || stage.y < outer.y - 1
        || stage.x + stage.width > outer.x + outer.width + 1
        || stage.y + stage.height > outer.y + outer.height + 1
      ) {
        throw new Error(`${skill.path} specimen escapes its ${width}px container`)
      }
    }
  }

  await page.close()
}

await auditViewport(1440, 900)
await auditViewport(390, 844)
await auditViewport(320, 720)

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
collectErrors(page, 'interaction')

await page.goto(`${base}/?category=skills`, { waitUntil: 'networkidle' })
const fluidCard = page.locator('article').filter({ has: page.locator('a[href="/vault/skill-apple-design"]') })
const compactFluid = fluidCard.locator('.ek-box[data-skill="apple-design"]')

/* The skills feed is short enough that the Fluid Interfaces card can mount
   inside the viewport, so first park the page at the footer: gating must
   hold the thumbnail inactive while it is offscreen. */
await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }))
await page.waitForFunction(() => document.querySelector('.ek-box[data-compact="true"][data-skill="apple-design"]')?.getAttribute('data-active') === 'false')
if (await compactFluid.locator('.ek-spring-toggle').getAttribute('aria-pressed') !== 'false') {
  throw new Error('Offscreen Fluid Interfaces thumbnail did not reset')
}
await page.waitForTimeout(3100)
if (await compactFluid.locator('.ek-spring-toggle').getAttribute('aria-pressed') !== 'false') {
  throw new Error('Offscreen Fluid Interfaces thumbnail advanced its autoplay')
}
await fluidCard.scrollIntoViewIfNeeded()
await page.waitForFunction(() => document.querySelector('.ek-box[data-compact="true"][data-skill="apple-design"]')?.getAttribute('data-active') === 'true')
await page.waitForTimeout(180)
if (await compactFluid.locator('.ek-spring-toggle').getAttribute('aria-pressed') !== 'true') {
  throw new Error('Fluid Interfaces thumbnail did not begin on viewport entry')
}
await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }))
await page.waitForFunction(() => document.querySelector('.ek-box[data-compact="true"][data-skill="apple-design"]')?.getAttribute('data-active') === 'false')
if (await compactFluid.locator('.ek-spring-toggle').getAttribute('aria-pressed') !== 'false') {
  throw new Error('Fluid Interfaces thumbnail did not reset after leaving the viewport')
}
await fluidCard.scrollIntoViewIfNeeded()
await page.waitForFunction(() => document.querySelector('.ek-box[data-compact="true"][data-skill="apple-design"]')?.getAttribute('data-active') === 'true')
await page.waitForTimeout(180)
if (await compactFluid.locator('.ek-spring-toggle').getAttribute('aria-pressed') !== 'true') {
  throw new Error('Fluid Interfaces thumbnail did not replay after re-entry')
}

/* The umbrella page hosts the design-eng implementation as its default
   section — the same variant selector and controls the old page had. */
await page.goto(`${base}/vault/skill-design-eng`, { waitUntil: 'networkidle' })
let implementation = page.locator('.ek-box').nth(0)
await page.getByRole('button', { name: 'Reset', exact: true }).click()
if (await implementation.locator('.ek-save-button').getAttribute('data-saved') !== 'false') {
  throw new Error('Design Engineering Reset did not restore the initial state')
}
await page.getByRole('button', { name: 'Replay', exact: true }).click()
await page.waitForTimeout(600)
if (await implementation.locator('.ek-save-button').getAttribute('data-saved') !== 'true') {
  throw new Error('Design Engineering Replay did not complete')
}
await page.locator('select').first().selectOption('popover-origin')
await page.getByRole('button', { name: 'Reset', exact: true }).click()
await implementation.getByRole('button', { name: 'Options' }).click()
if (await implementation.getByRole('button', { name: 'Options' }).getAttribute('aria-expanded') !== 'true') {
  throw new Error('Popover example is not directly interactive')
}

await page.goto(`${base}/vault/skill-apple-design`, { waitUntil: 'networkidle' })
implementation = page.locator('.ek-box').nth(0)
await page.getByRole('button', { name: 'Reset', exact: true }).click()
const toggle = implementation.locator('.ek-spring-toggle')
if (await toggle.getAttribute('aria-pressed') !== 'false') {
  throw new Error('Fluid Interfaces Reset did not restore the toggle')
}
await toggle.click()
if (await toggle.getAttribute('aria-pressed') !== 'true') {
  throw new Error('Fluid Interfaces toggle is not directly interactive')
}
await page.locator('select').first().selectOption('direct-drag')
await page.getByRole('button', { name: 'Reset', exact: true }).click()
const slider = implementation.getByRole('slider')
const beforeKey = Number(await slider.getAttribute('aria-valuenow'))
await slider.press('ArrowRight')
const afterKey = Number(await slider.getAttribute('aria-valuenow'))
if (afterKey <= beforeKey) throw new Error('Direct manipulation slider is not keyboard operable')

await page.goto(`${base}/?category=skills`, { waitUntil: 'networkidle' })
const designCard = page.locator('article').filter({ has: page.locator('a[href="/vault/skill-design-eng"]') })
await designCard.scrollIntoViewIfNeeded()
await designCard.locator('.ek-save-button').click()
if (new URL(page.url()).pathname !== '/') throw new Error('Clicking the thumbnail interaction navigated away from the feed')
await designCard.locator('[data-card-caption]').click()
if (new URL(page.url()).pathname !== '/vault/skill-design-eng') throw new Error('Clicking the card caption did not open the umbrella page')

await page.close()

const reducedContext = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: 'reduce',
})
const reduced = await reducedContext.newPage()
collectErrors(reduced, 'reduced-motion')
await reduced.goto(`${base}/?category=skills`, { waitUntil: 'networkidle' })

const reducedChecks = [
  { path: '/vault/skill-design-eng', id: 'emil-design-eng' },
  { path: '/vault/skill-apple-design', id: 'apple-design' },
]
for (const skill of reducedChecks) {
  const card = reduced.locator('article').filter({ has: reduced.locator(`a[href="${skill.path}"]`) })
  const box = card.locator(`.ek-box[data-skill="${skill.id}"]`)
  await card.scrollIntoViewIfNeeded()
  await reduced.waitForFunction((id) => document.querySelector(`.ek-box[data-compact="true"][data-skill="${id}"]`)?.getAttribute('data-active') === 'true', skill.id)
  await reduced.waitForTimeout(30)
  if (skill.id === 'emil-design-eng' && await box.locator('.ek-save-button').getAttribute('data-saved') !== 'true') {
    throw new Error('Reduced motion did not preserve Design Engineering end state')
  }
  if (skill.id === 'apple-design' && await box.locator('.ek-spring-toggle').getAttribute('aria-pressed') !== 'true') {
    throw new Error('Reduced motion did not preserve Fluid Interfaces end state')
  }
}

await reducedContext.close()
await browser.close()

if (errors.length) throw new Error(errors.join('\n'))
console.log('Emil skills verified: one standalone detail page plus the umbrella thumbnail, all expanded variants, viewport-gated autoplay, direct interaction, reduced motion, keyboard controls, and desktop/mobile fit.')
