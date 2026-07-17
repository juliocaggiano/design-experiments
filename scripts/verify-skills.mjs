import { chromium } from 'playwright'

const baseURL = process.env.BASE_URL ?? 'http://127.0.0.1:5173'
const failures = []
const evidence = []

function check(condition, message, detail = '') {
  const result = `${message}${detail ? `: ${detail}` : ''}`
  if (condition) evidence.push(result)
  else failures.push(result)
}

async function noOverflow(page, label) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))
  check(dimensions.scrollWidth <= dimensions.clientWidth, `${label} has no horizontal overflow`, JSON.stringify(dimensions))
}

async function verifyLocalSkill(page, viewport, slug, title, principleCount, finalPrinciple, files) {
  check(await page.getByRole('heading', { name: `${principleCount} core principles` }).count() === 1, `${viewport} ${title} includes its full principle guide`)
  check(await page.getByRole('heading', { name: finalPrinciple }).count() === 1, `${viewport} ${title} explains its final core principle`)
  check(await page.getByRole('heading', { name: 'Complete skill files' }).count() === 1, `${viewport} ${title} exposes the locally bundled source`)

  const localSkill = page.locator(`[data-local-skill="${slug}"]`)
  for (const [file, marker] of files) {
    const tab = localSkill.getByRole('tab', { name: file, exact: true })
    check(await tab.count() === 1, `${viewport} ${title} bundles ${file}`)
    await tab.click()
    check((await localSkill.locator('pre').textContent())?.includes(marker), `${viewport} ${title} renders the contents of ${file}`)
  }

  const remoteResources = await page.evaluate(() => performance.getEntriesByType('resource')
    .map((entry) => entry.name)
    .filter((url) => url.includes('github.com') || url.includes('githubusercontent.com')))
  check(remoteResources.length === 0, `${viewport} ${title} makes no GitHub runtime requests`, JSON.stringify(remoteResources))
}

const routes = [
  {
    path: '/vault/better-colors',
    title: 'Better colors',
    reference: 'https://github.com/jakubkrehel/skills/tree/main/skills/better-colors',
  },
  {
    path: '/vault/better-typography',
    title: 'Better typography',
    reference: 'https://github.com/jakubkrehel/skills/tree/main/skills/better-typography',
  },
  {
    path: '/vault/better-ui',
    title: 'Better UI',
    reference: 'https://github.com/jakubkrehel/skills/tree/main/skills/better-ui',
  },
]

const browser = await chromium.launch({ headless: true })
try {
  for (const viewport of [
    { name: 'desktop 1440', width: 1440, height: 1000 },
    { name: 'mobile 390', width: 390, height: 844 },
    { name: 'mobile 320', width: 320, height: 720 },
  ]) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } })
    const page = await context.newPage()
    const runtimeErrors = []
    page.on('pageerror', (error) => runtimeErrors.push(`pageerror: ${error.message}`))
    page.on('console', (message) => {
      if (message.type() === 'error') runtimeErrors.push(`console: ${message.text()}`)
    })

    await page.goto(baseURL, { waitUntil: 'networkidle' })
    await noOverflow(page, `${viewport.name} feed`)

    const cards = page.locator('a[href^="/vault/"]')
    check(await cards.count() === 8, `${viewport.name} feed has eight live cards`)
    check(
      JSON.stringify(await cards.evaluateAll((elements) => elements.slice(0, 3).map((element) => element.getAttribute('href'))))
        === JSON.stringify(routes.map((route) => route.path)),
      `${viewport.name} feed starts with one card per skill`,
    )
    for (const route of routes) {
      const card = page.locator(`a[href="${route.path}"]`)
      check(await card.count() === 1, `${viewport.name} has ${route.title} card`)
      check((await card.textContent())?.includes('Jul 13, 2026'), `${viewport.name} ${route.title} card has the current date`)
      check(await card.getByRole('button').count() === 0, `${viewport.name} ${route.title} preview has no nested controls`)
    }
    const betterColorsCard = page.locator('a[href="/vault/better-colors"]')
    const animatedSwatch = betterColorsCard.locator('[aria-label="Palette step 100"]')
    const animatedColorBefore = await animatedSwatch.evaluate((element) => getComputedStyle(element).backgroundColor)
    await page.waitForTimeout(250)
    const animatedColorAfter = await animatedSwatch.evaluate((element) => getComputedStyle(element).backgroundColor)
    check(animatedColorBefore !== animatedColorAfter, `${viewport.name} Better colors preview continuously cycles hue`, `${animatedColorBefore} → ${animatedColorAfter}`)
    const betterUiCard = page.locator('a[href="/vault/better-ui"]')
    await betterUiCard.hover()
    await page.waitForTimeout(100)
    const blurredPreviewLayers = await betterUiCard.locator('*').evaluateAll((elements) => elements
      .map((element) => getComputedStyle(element).filter)
      .filter((filter) => filter.includes('blur(') && filter !== 'blur(0px)'))
    check(blurredPreviewLayers.length === 0, `${viewport.name} Better UI preview stays sharp while hovered`, JSON.stringify(blurredPreviewLayers))
    await page.mouse.move(0, 0)
    const typographyCard = page.locator('a[href="/vault/better-typography"]')
    const typographyFamilies = await typographyCard.getByRole('heading', { name: 'Type that knows its role.' }).evaluate((heading) => ({
      heading: getComputedStyle(heading).fontFamily,
      card: getComputedStyle(heading.closest('a')).fontFamily,
      size: getComputedStyle(heading).fontSize,
      panelPadding: getComputedStyle(heading.closest('.rounded-xl')).paddingTop,
    }))
    check(typographyFamilies.heading === typographyFamilies.card, `${viewport.name} Better typography preview uses one font family`, JSON.stringify(typographyFamilies))
    check(typographyFamilies.panelPadding === '10px', `${viewport.name} Better typography preview has increased internal spacing`, JSON.stringify(typographyFamilies))
    if (viewport.width === 1440) check(typographyFamilies.size === '44px', `${viewport.name} Better typography preview headline is 8px smaller`, JSON.stringify(typographyFamilies))

    for (const route of routes) {
      await page.goto(`${baseURL}${route.path}`, { waitUntil: 'networkidle' })
      await noOverflow(page, `${viewport.name} ${route.title}`)
      check(await page.getByRole('heading', { name: route.title, exact: true }).count() === 1, `${viewport.name} ${route.title} route renders`)
      const reference = page.getByRole('link', { name: new RegExp(route.title, 'i') }).last()
      check(await reference.getAttribute('href') === route.reference, `${viewport.name} ${route.title} credits the exact source`)
    }

    await page.goto(`${baseURL}/vault/better-colors`, { waitUntil: 'networkidle' })
    const hue = page.getByRole('slider', { name: 'Hue' })
    const firstSwatch = page.locator('[aria-label^="Palette step 100"]').last()
    const colorBefore = await firstSwatch.evaluate((element) => getComputedStyle(element).backgroundColor)
    await hue.press('End')
    const colorAfter = await firstSwatch.evaluate((element) => getComputedStyle(element).backgroundColor)
    check(await hue.getAttribute('aria-valuetext') === '360°', `${viewport.name} hue slider supports keyboard End`)
    check(colorBefore !== colorAfter, `${viewport.name} hue slider updates the palette`)
    await verifyLocalSkill(page, viewport.name, 'better-colors', 'Better colors', 10, 'Preserve code during conversion', [
      ['SKILL.md', 'OKLCH Colors'],
      ['accessibility-contrast.md', 'APCA thresholds'],
      ['color-conversion.md', 'Supported input formats'],
      ['gamut-and-tailwind.md', 'sRGB vs Display P3'],
      ['palette-generation.md', 'The scale convention'],
    ])

    await page.goto(`${baseURL}/vault/better-typography`, { waitUntil: 'networkidle' })
    const size = page.getByRole('slider', { name: 'Size' })
    await size.press('Home')
    check(await size.getAttribute('aria-valuetext') === '32px', `${viewport.name} type-size slider supports keyboard Home`)
    await verifyLocalSkill(page, viewport.name, 'better-typography', 'Better typography', 19, 'Style selection intentionally', [
      ['SKILL.md', 'Great typography'],
      ['choosing-fonts.md', 'Choosing a typeface'],
      ['css-cheat-sheet.md', 'One-line lookup'],
      ['details-and-accessibility.md', 'iOS input zoom'],
      ['spacing-and-sizing.md', 'Heading hierarchy'],
      ['variable-fonts-and-opentype.md', 'Properties over axis tags'],
      ['wrapping-and-punctuation.md', 'Smart punctuation'],
    ])

    await page.goto(`${baseURL}/vault/better-ui`, { waitUntil: 'networkidle' })
    const save = page.locator('button[aria-pressed]').first()
    const bounds = await save.boundingBox()
    const hitArea = await save.evaluate((element) => {
      const pseudo = getComputedStyle(element, '::after')
      return { width: pseudo.width, height: pseudo.height }
    })
    check(Boolean(bounds && Math.round(bounds.height) === 28), `${viewport.name} Save action matches the vault chip height`, JSON.stringify(bounds))
    check(hitArea.width === '40px' && hitArea.height === '40px', `${viewport.name} Save action keeps a 40px hit area`, JSON.stringify(hitArea))
    await save.click()
    check(await save.getAttribute('aria-pressed') === 'true' && (await save.textContent())?.includes('Saved'), `${viewport.name} Save action reaches its completed state`)
    await verifyLocalSkill(page, viewport.name, 'better-ui', 'Better UI', 13, 'Minimum hit area', [
      ['SKILL.md', 'Details that make interfaces feel better'],
      ['surfaces.md', 'Concentric Border Radius'],
      ['animations.md', 'Interruptible Animations'],
      ['performance.md', 'Transition Only What Changes'],
    ])

    check(runtimeErrors.length === 0, `${viewport.name} has no console or page errors`, runtimeErrors.join(' | '))
    await page.goto(baseURL, { waitUntil: 'networkidle' })
    await page.screenshot({ path: `/tmp/arlan-skills-${viewport.width}.png`, fullPage: true })
    await context.close()
  }
} finally {
  await browser.close()
}

console.log(`PASS ${evidence.length} checks`)
for (const item of evidence) console.log(`  ✓ ${item}`)
if (failures.length) {
  console.error(`FAIL ${failures.length} checks`)
  for (const item of failures) console.error(`  ✗ ${item}`)
  process.exitCode = 1
}
