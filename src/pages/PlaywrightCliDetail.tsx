import { useRef } from 'react'
import { PlaywrightCliDemo, type PlaywrightCliControls } from '../demos/PlaywrightCliDemo'
import demoSrc from '../demos/PlaywrightCliDemo.tsx?raw'
import demoCss from '../demos/PlaywrightCliDemo.css?raw'
import skillSrc from '../content/skills/playwright-cli/SKILL.md?raw'
import playwrightTestsSrc from '../content/skills/playwright-cli/references/playwright-tests.md?raw'
import requestMockingSrc from '../content/skills/playwright-cli/references/request-mocking.md?raw'
import runningCodeSrc from '../content/skills/playwright-cli/references/running-code.md?raw'
import sessionManagementSrc from '../content/skills/playwright-cli/references/session-management.md?raw'
import storageStateSrc from '../content/skills/playwright-cli/references/storage-state.md?raw'
import testGenerationSrc from '../content/skills/playwright-cli/references/test-generation.md?raw'
import tracingSrc from '../content/skills/playwright-cli/references/tracing.md?raw'
import videoRecordingSrc from '../content/skills/playwright-cli/references/video-recording.md?raw'
import elementAttributesSrc from '../content/skills/playwright-cli/references/element-attributes.md?raw'
import licenseSrc from '../content/skills/playwright-cli/LICENSE?raw'
import sourceSrc from '../content/skills/playwright-cli/SOURCE.md?raw'
import { ChipButton, CodeTabs, CopyPromptChip, CreditRows, DetailShell, assembleCopy } from './detail-kit'

const REFERENCE_URL = 'http://www.ui-skills.com/skills/microsoft/playwright-cli'
const UPSTREAM_URL = 'https://github.com/microsoft/playwright-cli/blob/main/skills/playwright-cli/SKILL.md'

const BUILD_PROMPT = `Build a compact, interactive Playwright CLI browser-session card in React and CSS.

Visual structure:
- Stay inside a restrained light design system: white surface, warm-white page, hairline gray borders, compact sans typography, and a quiet layered shadow.
- Show a browser-session header, editable URL bar, four workflow steps, CLI command output, and reset/run controls.
- Use a real icon library for terminal, browser, snapshot, pointer, and verification icons.
- Let container queries compress the same component into a fixed 1344:520 card without creating a separate static thumbnail.

Interaction:
- Make the URL editable and normalize entries without a protocol.
- Let users jump directly to Open, Snapshot, Act, or Verify, then run each simulated command.
- Show realistic playwright-cli commands and snapshot refs so the interface also teaches the operating model.
- Keep every input and button keyboard accessible, with visible focus and reduced-motion support.

Namespace every class so the component can live safely inside a larger design system.`

const WORKFLOW = [
  ['1', 'Open a page', 'Start a named or default browser session with playwright-cli open <url>.'],
  ['2', 'Read a snapshot', 'Run playwright-cli snapshot and find the semantic element you need, including its stable ref.'],
  ['3', 'Act on the ref', 'Click, fill, hover, press, select, upload, or drag using the ref returned by the latest snapshot.'],
  ['4', 'Verify the result', 'Take another snapshot or inspect text, URL, cookies, storage, requests, console messages, or a screenshot.'],
] as const

const COMMAND_GROUPS = [
  ['Navigate', 'open · goto · back · forward · reload', 'Move through the browser history or load a specific URL.'],
  ['Inspect', 'snapshot · screenshot · pdf', 'Read the accessibility tree first; capture pixels or a PDF when the visual result matters.'],
  ['Interact', 'click · dblclick · fill · type · hover', 'Target snapshot refs for precise, replayable page actions.'],
  ['Keyboard', 'press · keydown · keyup', 'Send shortcuts, navigation keys, or explicit key-down and key-up events.'],
  ['Forms', 'select · check · uncheck · upload', 'Operate native controls and file inputs using their current snapshot refs.'],
  ['Mouse', 'mousemove · mousedown · mouseup · wheel', 'Use coordinates only when semantic element targeting is not enough.'],
  ['Sessions', '-s=<name> · list · close-all · kill-all', 'Keep independent browser contexts and clean them up deliberately.'],
  ['Debug', 'console · network · tracing · video', 'Inspect failures and preserve evidence for a test or handoff.'],
] as const

const PRACTICES = [
  'Snapshot before acting; refs are only meaningful in the current page state.',
  'Prefer semantic refs to screen coordinates so interactions survive layout changes.',
  'Use a named session when separate tasks, users, or authentication states must not mix.',
  'Save storage state only when reusing authentication is intentional; never commit sensitive state.',
  'Mock or block requests before navigation when the initial page load depends on them.',
  'Start tracing or video before reproducing a bug, then stop and save the artifact immediately after.',
  'Use raw-output mode when another script needs to parse the CLI result.',
  'Close sessions when finished so background browsers do not linger.',
] as const

const SKILL_FILES = [
  { file: 'SKILL.md', code: skillSrc },
  { file: 'playwright-tests.md', code: playwrightTestsSrc },
  { file: 'request-mocking.md', code: requestMockingSrc },
  { file: 'running-code.md', code: runningCodeSrc },
  { file: 'session-management.md', code: sessionManagementSrc },
  { file: 'storage-state.md', code: storageStateSrc },
  { file: 'test-generation.md', code: testGenerationSrc },
  { file: 'tracing.md', code: tracingSrc },
  { file: 'video-recording.md', code: videoRecordingSrc },
  { file: 'element-attributes.md', code: elementAttributesSrc },
  { file: 'LICENSE', code: licenseSrc },
  { file: 'SOURCE.md', code: sourceSrc },
]

function CommandLine({ children }: { children: string }) {
  return (
    <code className="block overflow-x-auto rounded-lg border border-[var(--border-line)] bg-[var(--bg-hover)] px-3 py-2 font-mono text-[12px] leading-[1.6] text-[var(--text-body)]">
      {children}
    </code>
  )
}

export function PlaywrightCliDetail() {
  const controls = useRef<PlaywrightCliControls>({}).current

  return (
    <DetailShell title="Playwright CLI">
      <div
        aria-label="Interactive Playwright CLI browser session preview"
        className="relative mx-auto aspect-[1344/520] w-full overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)]"
      >
        <PlaywrightCliDemo compact />
      </div>

      <div className="flex min-w-0 flex-col gap-14">
        <div className="flex flex-col gap-3">
          <p className="text-pretty text-[var(--text-primary)]">
            Playwright CLI turns browser work into a short, inspectable loop: open a page, read its accessibility
            snapshot, act on the returned element refs, and verify the new state. This vault version makes that loop
            tangible without requiring a terminal just to understand the skill.
          </p>
          <p className="text-pretty text-[var(--text-primary)]">
            The card, expanded hero, and implementation share one light-mode browser-session component. Its URL field,
            step controls, commands, and outputs are interactive; the complete upstream Microsoft skill and every linked
            reference are also stored below as a pinned local snapshot.
          </p>
        </div>

        <section className="flex min-w-0 flex-col gap-4">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-line)] pb-2">
            <h2 className="font-semibold text-[var(--text-primary)]">Implementation</h2>
            <ChipButton onClick={() => controls.reset?.()}>Reset session</ChipButton>
          </header>
          <div className="relative z-10 h-[520px] overflow-hidden rounded-xl border border-[var(--border-line)] bg-[var(--bg-page)] max-sm:h-[500px]">
            <PlaywrightCliDemo controls={controls} />
          </div>
          <p className="text-[12px] text-[var(--text-tertiary)]">
            Try editing the URL, pressing Enter, selecting any workflow step, and running its command.
          </p>
        </section>

        <section className="flex min-w-0 flex-col gap-5">
          <header className="flex items-center justify-between gap-3 border-b border-[var(--border-line)] pb-2">
            <h2 className="font-semibold text-[var(--text-primary)]">Complete guide</h2>
          </header>

          <div className="flex flex-col gap-2">
            <span className="text-[12px] font-medium text-[var(--text-secondary)]">Install</span>
            <CommandLine>npm install -g @playwright/cli@latest</CommandLine>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {WORKFLOW.map(([number, title, description]) => (
              <article key={number} className="rounded-xl border border-[var(--border-line)] bg-[var(--bg-surface)] p-4">
                <span className="mb-3 grid size-6 place-items-center rounded-md bg-[var(--bg-hover)] text-[11px] font-semibold text-[var(--text-secondary)]">{number}</span>
                <h3 className="font-semibold text-[var(--text-primary)]">{title}</h3>
                <p className="mt-1 text-[13px] leading-[1.55] text-[var(--text-secondary)]">{description}</p>
              </article>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <CommandLine>playwright-cli open https://example.com</CommandLine>
            <CommandLine>playwright-cli snapshot</CommandLine>
            <CommandLine>playwright-cli click e12</CommandLine>
            <CommandLine>playwright-cli snapshot</CommandLine>
          </div>

          <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
            {COMMAND_GROUPS.map(([title, commands, description]) => (
              <article key={title} className="border-b border-[var(--border-subtle)] py-4">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-semibold text-[var(--text-primary)]">{title}</h3>
                  <code className="text-right font-mono text-[10px] text-[var(--text-tertiary)]">{commands}</code>
                </div>
                <p className="mt-1 text-[13px] leading-[1.55] text-[var(--text-secondary)]">{description}</p>
              </article>
            ))}
          </div>

          <article className="rounded-xl border border-[var(--border-line)] bg-[var(--bg-hover)] p-4">
            <h3 className="font-semibold text-[var(--text-primary)]">How snapshot refs work</h3>
            <p className="mt-1 text-[13px] leading-[1.6] text-[var(--text-secondary)]">
              A snapshot returns a semantic representation of the page and assigns refs such as <code className="font-mono text-[12px] text-[var(--text-body)]">e12</code> to actionable elements. Use that ref in the next command. After navigation, a modal, or any meaningful page change, take a fresh snapshot before acting again.
            </p>
          </article>

          <div>
            <h3 className="font-semibold text-[var(--text-primary)]">Working checklist</h3>
            <ul className="mt-2 divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)]">
              {PRACTICES.map((practice) => (
                <li key={practice} className="flex gap-3 py-3 text-[13px] leading-[1.55] text-[var(--text-secondary)]">
                  <span aria-hidden="true" className="mt-[0.6em] size-1 shrink-0 rounded-full bg-[var(--text-tertiary)]" />
                  {practice}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="flex min-w-0 flex-col gap-3">
          <header className="flex items-center justify-between gap-3 border-b border-[var(--border-line)] pb-2">
            <div>
              <h2 className="font-semibold text-[var(--text-primary)]">Local skill archive</h2>
              <p className="mt-1 text-[12px] text-[var(--text-tertiary)]">Pinned upstream snapshot · complete and readable offline</p>
            </div>
          </header>
          <CodeTabs tabs={SKILL_FILES} />
        </section>

        <section className="flex min-w-0 flex-col gap-3">
          <header className="flex items-center justify-between gap-3 border-b border-[var(--border-line)] pb-2">
            <h2 className="font-semibold text-[var(--text-primary)]">Code</h2>
            <CopyPromptChip text={assembleCopy(BUILD_PROMPT, [
              { name: 'PlaywrightCliDemo.tsx', code: demoSrc },
              { name: 'PlaywrightCliDemo.css', code: demoCss },
            ])} />
          </header>
          <CodeTabs tabs={[
            { file: 'PlaywrightCliDemo.tsx', code: demoSrc },
            { file: 'PlaywrightCliDemo.css', code: demoCss },
          ]} />
        </section>

        <CreditRows
          rows={[
            ['Company', 'CAGGIANO'],
            ['Date', 'Jul 15, 2026'],
            ['Tags', 'Browser automation, Testing, CLI'],
            ['Upstream', 'Microsoft Playwright CLI'],
          ]}
        />

        <p className="mt-2 text-center text-[12px] text-[var(--text-tertiary)]">
          Reference:{' '}
          <a href={REFERENCE_URL} target="_blank" rel="noopener noreferrer" className="underline decoration-[var(--border-line)] underline-offset-2 transition-colors duration-150 hover:text-[var(--text-secondary)]">UI Skills</a>
          {' · '}
          <a href={UPSTREAM_URL} target="_blank" rel="noopener noreferrer" className="underline decoration-[var(--border-line)] underline-offset-2 transition-colors duration-150 hover:text-[var(--text-secondary)]">Microsoft source</a>
          {' · Apache 2.0'}
        </p>
      </div>
      <div aria-hidden="true" className="h-16" />
    </DetailShell>
  )
}
