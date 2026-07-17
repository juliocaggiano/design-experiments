import { chromium } from 'playwright'

const baseURL = process.env.BASE_URL ?? 'http://127.0.0.1:5173'
const failures = []
const evidence = []

function check(condition, message, detail = '') {
  if (!condition) failures.push(`${message}${detail ? `: ${detail}` : ''}`)
  else evidence.push(`${message}${detail ? `: ${detail}` : ''}`)
}

async function settle(page) {
  await page.waitForTimeout(650)
}

async function noOverflow(page, label) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))
  check(dimensions.scrollWidth <= dimensions.clientWidth, `${label} has no horizontal page overflow`, JSON.stringify(dimensions))
}

async function readMatch(stage, id) {
  return stage.locator(`[data-match="${id}"]`).evaluate((element) => ({
    text: element.textContent?.replace(/\s+/g, ' ').trim() ?? '',
    winners: element.querySelectorAll('[aria-label="Winner"]').length,
    winnerRowText: element.querySelector('[aria-label="Winner"]')?.parentElement?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
  }))
}

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

    const knockoutCard = page.locator('a[href="/vault/knockout-bracket"]')
    check(await knockoutCard.count() === 1, `${viewport.name} feed contains the knockout bracket card`)
    check((await knockoutCard.textContent())?.includes('Jul 12, 2026'), `${viewport.name} knockout card has Jul 12, 2026 date`)

    const compactStage = knockoutCard.locator('.kb-stage')
    check((await compactStage.getAttribute('data-page')) === '2', `${viewport.name} compact card opens on final window`)
    check((await compactStage.getAttribute('data-appearance')) === 'light', `${viewport.name} compact card uses the light appearance`)
    check((await knockoutCard.getByRole('button').count()) === 0, `${viewport.name} feed preview is static and contains no nested buttons`)
    const compactTheme = await compactStage.evaluate((stage) => ({
      stage: getComputedStyle(stage).backgroundColor,
      page: getComputedStyle(document.body).backgroundColor,
      match: getComputedStyle(stage.querySelector('[data-match-card]')).backgroundColor,
      card: getComputedStyle(stage.closest('a')).backgroundColor,
    }))
    check(compactTheme.stage === compactTheme.page && compactTheme.match === compactTheme.card, `${viewport.name} compact card uses the vault page and surface tokens`, JSON.stringify(compactTheme))
    const compactFinal = await readMatch(compactStage, 'final')
    check(compactFinal.text.includes('Spain') && compactFinal.text.includes('Brazil') && compactFinal.text.includes('UPCOMING'), `${viewport.name} compact card shows Brazil in upcoming final`, compactFinal.text)
    check(compactFinal.winners === 0, `${viewport.name} compact final has no winner`)

    const compactSemifinal = compactStage.locator('[data-match="sf-2"]')
    const compactBounds = await Promise.all([
      compactStage.evaluate((el) => el.getBoundingClientRect().toJSON()),
      compactSemifinal.evaluate((el) => el.getBoundingClientRect().toJSON()),
    ])
    check(
      compactBounds[1].top >= compactBounds[0].top - 0.5 && compactBounds[1].bottom <= compactBounds[0].bottom + 0.5,
      `${viewport.name} compact Brazil semifinal fits fully inside its stage`,
      JSON.stringify({ stage: compactBounds[0], semifinal: compactBounds[1] }),
    )

    await knockoutCard.click({ position: { x: 12, y: 12 } })
    await page.waitForURL('**/vault/knockout-bracket')
    check(new URL(page.url()).pathname === '/vault/knockout-bracket', `${viewport.name} card routes to knockout detail`)
    await noOverflow(page, `${viewport.name} detail`)

    const bodyText = (await page.locator('body').textContent()) ?? ''
    check(bodyText.includes('I’m Brazilian, and I would love to pretend Brazil is still good at soccer—even though it isn’t. This is my way of coping.'), `${viewport.name} detail contains the requested coping description`)
    const reference = page.getByRole('link', { name: /Skiper UI’s Knockout bracket/ })
    check((await reference.getAttribute('href')) === 'https://skiper-ui.com/v1/skiper107', `${viewport.name} detail credits the exact Skiper reference`)

    const stages = page.locator('.kb-stage')
    check((await stages.count()) === 2, `${viewport.name} detail renders preview and implementation brackets`)
    check((await stages.evaluateAll((elements) => elements.every((element) => element.getAttribute('data-appearance') === 'light'))), `${viewport.name} detail brackets match the light thumbnail appearance`)
    const implementation = stages.nth(1)
    const detailTheme = await implementation.evaluate((stage) => ({
      stage: getComputedStyle(stage).backgroundColor,
      page: getComputedStyle(document.body).backgroundColor,
      match: getComputedStyle(stage.querySelector('[data-match-card]')).backgroundColor,
      control: getComputedStyle(document.querySelector('button')).backgroundColor,
    }))
    check(detailTheme.stage === detailTheme.page && detailTheme.match === detailTheme.control, `${viewport.name} detail bracket uses the same page and surface tokens as its thumbnail`, JSON.stringify(detailTheme))
    const visibleRounds = async () => implementation.locator('[data-round][aria-hidden="false"]').evaluateAll((elements) => [...new Set(elements.map((element) => element.getAttribute('data-round')))])
    const initialVisibleRounds = await visibleRounds()
    check(
      viewport.width > 390 ? initialVisibleRounds.length === 3 : initialVisibleRounds.length === 2,
      `${viewport.name} implementation uses the expected round-window width`,
      JSON.stringify(initialVisibleRounds),
    )
    for (const [id, opponent] of [
      ['r32-9', 'Japan'],
      ['r16-5', 'Norway'],
      ['qf-3', 'England'],
      ['sf-2', 'Argentina'],
    ]) {
      const match = await readMatch(implementation, id)
      check(match.text.includes('Brazil') && match.text.includes(opponent), `${viewport.name} ${id} contains Brazil versus ${opponent}`, match.text)
      check(match.winners === 1 && match.winnerRowText.includes('Brazil'), `${viewport.name} Brazil wins ${id}`, match.winnerRowText)
    }
    const final = await readMatch(implementation, 'final')
    check(final.text.includes('UPCOMING') && final.winners === 0, `${viewport.name} final remains upcoming with no declared winner`, final.text)

    const implementationHeader = page.getByRole('heading', { name: 'Implementation' }).locator('..')
    const previous = implementationHeader.getByRole('button', { name: 'Previous' })
    const next = implementationHeader.getByRole('button', { name: 'Next' })
    const reset = implementationHeader.getByRole('button', { name: 'Reset' })

    await settle(page)
    const states = []
    const initialConnectorCount = await implementation.locator('.kb-line').count()
    states.push({ action: 'initial', page: await implementation.getAttribute('data-page'), height: await implementation.evaluate((el) => el.getBoundingClientRect().height), connectors: initialConnectorCount })
    await previous.click()
    await settle(page)
    states.push({ action: 'previous', page: await implementation.getAttribute('data-page'), height: await implementation.evaluate((el) => el.getBoundingClientRect().height), connectors: await implementation.locator('.kb-line').count() })
    await next.click()
    await settle(page)
    states.push({ action: 'next once', page: await implementation.getAttribute('data-page'), height: await implementation.evaluate((el) => el.getBoundingClientRect().height), connectors: await implementation.locator('.kb-line').count() })
    await next.click()
    await settle(page)
    states.push({ action: 'next twice', page: await implementation.getAttribute('data-page'), height: await implementation.evaluate((el) => el.getBoundingClientRect().height), connectors: await implementation.locator('.kb-line').count() })
    await reset.click()
    await settle(page)
    states.push({ action: 'reset', page: await implementation.getAttribute('data-page'), height: await implementation.evaluate((el) => el.getBoundingClientRect().height), connectors: await implementation.locator('.kb-line').count() })

    check(states.map((state) => state.page).join(',') === '1,0,1,2,1', `${viewport.name} Previous/Next/Reset reach expected page states`, JSON.stringify(states))
    const heights = states.map((state) => Math.round(state.height))
    check(heights[1] > heights[0] && heights[2] === heights[0] && heights[3] < heights[0] && heights[4] === heights[0], `${viewport.name} bracket height reflows and resets`, JSON.stringify(heights))
    check(states.every((state) => state.connectors === initialConnectorCount), `${viewport.name} connector elements stay mounted while paging`, JSON.stringify(states.map((state) => state.connectors)))
    check(runtimeErrors.length === 0, `${viewport.name} has no console or page errors`, runtimeErrors.join(' | '))

    await page.screenshot({ path: `/tmp/arlan-knockout-${viewport.width}.png`, fullPage: true })
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
