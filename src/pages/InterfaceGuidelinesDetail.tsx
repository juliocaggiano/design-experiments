import { useRef } from 'react'
import {
  InterfaceGuidelinesDemo,
  type InterfaceGuidelinesControls,
} from '../demos/InterfaceGuidelinesDemo'
import { INTERFACE_GUIDELINE_CATEGORIES } from '../interface-guidelines'
import demoSrc from '../demos/InterfaceGuidelinesDemo.tsx?raw'
import demoCss from '../demos/InterfaceGuidelinesDemo.css?raw'
import principlesSrc from '../interface-guidelines.ts?raw'
import {
  ChipButton,
  CodeTabs,
  CopyPromptChip,
  CreditRows,
  DetailShell,
  assembleCopy,
} from './detail-kit'

const REFERENCE_URL = 'https://interfaces.rauno.me/'
const SOURCE_COMMIT = '81f523a5b469ba1ea877fef262588f3b4b65d31f'
const SOURCE_URL = `https://github.com/raunofreiberg/interfaces/tree/${SOURCE_COMMIT}`

const BUILD_PROMPT = `Build an interactive “Interface Craft Guidelines” card in React and CSS.

Concept:
- Present interface quality as a ship-readiness checklist rather than a passive article.
- Use one focused inline-copy interaction in the thumbnail to demonstrate immediate motion, visible focus, and feedback placed beside its trigger.
- In the expanded implementation, let users browse Interactivity, Typography, Motion, Touch, Optimizations, Accessibility, and Design, then mark individual principles reviewed.

Visual direction:
- Stay within a minimal light interface: warm-white canvas, black type, white paper surface, thin neutral borders, and a restrained shadow.
- Use cyan construction lines and a large stacked title behind the paper as a credited visual nod to interfaces.rauno.me.
- Keep the vault’s typography and card geometry. Do not copy the source font, icons, implementation, or prose.

Behavior:
- Preserve keyboard focus, semantic tabs, pressed states, touch-safe controls, inline success feedback, and reduced-motion handling.
- Keep the compact thumbnail, expanded hero, and implementation visually synchronized.
- Namespace every class with ig-.`

const WORKFLOW = [
  ['1', 'Inspect', 'Choose the category closest to the interface you are reviewing.'],
  ['2', 'Prioritize', 'Fix broken native behavior and accessibility before visual polish.'],
  ['3', 'Apply', 'Make the smallest local change that resolves the principle.'],
  ['4', 'Verify', 'Retest with keyboard, pointer, touch, narrow layouts, and reduced motion.'],
] as const

export function InterfaceGuidelinesDetail() {
  const controls = useRef<InterfaceGuidelinesControls>({}).current

  return (
    <DetailShell title="Interface Craft Guidelines">
      <div
        aria-label="Interface craft ship-readiness checklist preview"
        className="relative mx-auto aspect-[1344/520] w-full overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)]"
      >
        <InterfaceGuidelinesDemo compact />
      </div>

      <div className="flex min-w-0 flex-col gap-14">
        <div className="flex flex-col gap-3">
          <p className="text-pretty text-[var(--text-primary)]">
            Interface Craft Guidelines turns a long quality checklist into one direct review surface. The card’s copy
            action demonstrates the idea at the heart of the reference: interaction details should feel immediate,
            accessible, and attached to the thing that changed.
          </p>
          <p className="text-pretty text-[var(--text-primary)]">
            The expanded implementation organizes the reference’s recurring ideas into seven practical categories.
            The wording, component, and code are an original clean-room adaptation; the cyan construction lines and
            raised paper composition intentionally credit the visual character of Rauno Freiberg’s guide.
          </p>
        </div>

        <section className="flex min-w-0 flex-col gap-4">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-line)] pb-2">
            <h2 className="font-semibold text-[var(--text-primary)]">Implementation</h2>
            <ChipButton onClick={() => controls.reset?.()}>Reset review</ChipButton>
          </header>
          <div className="relative z-10 h-[560px] overflow-hidden rounded-xl border border-[var(--border-line)] bg-[var(--bg-page)] max-sm:h-[520px]">
            <InterfaceGuidelinesDemo controls={controls} />
          </div>
          <p className="text-[12px] text-[var(--text-tertiary)]">
            Browse the categories and click any principle to mark it reviewed.
          </p>
        </section>

        <section className="flex min-w-0 flex-col gap-5">
          <header className="border-b border-[var(--border-line)] pb-2">
            <h2 className="font-semibold text-[var(--text-primary)]">Complete guide</h2>
          </header>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {WORKFLOW.map(([number, title, description]) => (
              <article key={number} className="rounded-xl border border-[var(--border-line)] bg-[var(--bg-surface)] p-4">
                <span className="mb-3 grid size-6 place-items-center rounded-md bg-[var(--bg-hover)] text-[11px] font-semibold text-[var(--text-secondary)]">
                  {number}
                </span>
                <h3 className="font-semibold text-[var(--text-primary)]">{title}</h3>
                <p className="mt-1 text-[13px] leading-[1.55] text-[var(--text-secondary)]">{description}</p>
              </article>
            ))}
          </div>

          <div className="flex flex-col gap-8">
            {INTERFACE_GUIDELINE_CATEGORIES.map((category) => (
              <section className="flex min-w-0 flex-col gap-3" key={category.id}>
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)]">{category.label}</h3>
                  <p className="mt-1 text-[13px] text-[var(--text-secondary)]">{category.summary}</p>
                </div>
                <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
                  {category.rules.map((rule) => (
                    <article key={rule.id} className="border-b border-[var(--border-subtle)] py-3">
                      <h4 className="text-[13px] font-semibold text-[var(--text-primary)]">{rule.title}</h4>
                      <p className="mt-1 text-[12px] leading-[1.55] text-[var(--text-secondary)]">{rule.detail}</p>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>

        <section className="flex min-w-0 flex-col gap-3">
          <header className="flex items-center justify-between gap-3 border-b border-[var(--border-line)] pb-2">
            <h2 className="font-semibold text-[var(--text-primary)]">Code</h2>
            <CopyPromptChip text={assembleCopy(BUILD_PROMPT, [
              { name: 'InterfaceGuidelinesDemo.tsx', code: demoSrc },
              { name: 'InterfaceGuidelinesDemo.css', code: demoCss },
              { name: 'interface-guidelines.ts', code: principlesSrc },
            ])} />
          </header>
          <CodeTabs tabs={[
            { file: 'InterfaceGuidelinesDemo.tsx', code: demoSrc },
            { file: 'InterfaceGuidelinesDemo.css', code: demoCss },
            { file: 'interface-guidelines.ts', code: principlesSrc },
          ]} />
        </section>

        <CreditRows rows={[
          ['Company', 'CAGGIANO'],
          ['Date', 'Jul 16, 2026'],
          ['Tags', 'Interface craft, Accessibility, Review'],
          ['Reference', 'Rauno Freiberg'],
        ]} />

        <p className="mt-2 text-center text-[12px] text-[var(--text-tertiary)]">
          Reference:{' '}
          <a
            href={REFERENCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-[var(--border-line)] underline-offset-2 transition-colors duration-150 hover:text-[var(--text-secondary)]"
          >
            Web Interface Guidelines
          </a>
          {' · '}
          <a
            href={SOURCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-[var(--border-line)] underline-offset-2 transition-colors duration-150 hover:text-[var(--text-secondary)]"
          >
            source snapshot
          </a>
          {' · clean-room adaptation; upstream repository has no declared license'}
        </p>
      </div>
      <div aria-hidden="true" className="h-16" />
    </DetailShell>
  )
}
