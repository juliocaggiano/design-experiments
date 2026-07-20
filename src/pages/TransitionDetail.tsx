import { useRef } from 'react'
import {
  TransitionDemo,
  type TransitionDemoControls,
} from '../demos/transitions/TransitionDemo'
import type { TRANSITION_DEFINITIONS } from '../transitions/catalog'
import { ChipButton, CodeTabs, CopyPromptChip, CreditRows, DetailShell, assembleCopy } from './detail-kit'
import demoSrc from '../demos/transitions/TransitionDemo.tsx?raw'
import demoCss from '../demos/transitions/TransitionDemo.css?raw'
import catalogSrc from '../transitions/catalog.ts?raw'

type TransitionRecord = (typeof TRANSITION_DEFINITIONS)[number]

export function TransitionDetail({ definition }: { definition: TransitionRecord }) {
  const controls = useRef<TransitionDemoControls>({}).current
  const buildPrompt = `Build the “${definition.title}” interaction as a self-contained React and CSS component.

Behavior:
- ${definition.summary}
- ${definition.detail}
- Use asymmetric entrance and exit timing where the supplied implementation does.
- Keep the state replayable, interruptible, keyboard accessible, and safe for pointer and touch input.
- Respect prefers-reduced-motion without removing the underlying state change.

Visual system:
- Use a light editorial canvas, white surfaces, neutral hairlines, inherited sans-serif type, and compact squircle-like corners.
- Keep the prototype centered and legible in both a fixed 16:9 thumbnail and a taller implementation stage.
- Namespace every class with td- so the component can be embedded in another design system.

The complete shared transition catalog follows. Render the specimen with id="${definition.id}".`

  return (
    <DetailShell title={definition.title}>
      <div className="flex min-w-0 flex-col gap-14">
        <section className="flex min-w-0 flex-col gap-4">
          <div className="flex items-center justify-end gap-2">
            <ChipButton onClick={() => controls.reset?.()}>Reset</ChipButton>
            <ChipButton onClick={() => controls.replay?.()}>Replay</ChipButton>
          </div>
          <div className="relative z-10 h-[440px] overflow-hidden rounded-xl border border-[var(--border-line)] bg-[var(--bg-page)] max-sm:h-[400px]">
            <TransitionDemo id={definition.id} controls={controls} />
          </div>
          <p className="text-[12px] text-[var(--text-tertiary)]">
            Interact directly with the specimen. Reset returns its source state; Replay advances or repeats the transition.
          </p>
        </section>

        <div className="flex flex-col gap-3">
          <p className="text-pretty text-[var(--text-primary)]">{definition.summary}</p>
          <p className="text-pretty text-[var(--text-primary)]">
            {definition.detail} The visual treatment has been rebuilt for the vault’s light design system while the
            transition’s trigger, direction, timing hierarchy, and state semantics stay faithful to the reference.
          </p>
        </div>

        <section className="flex min-w-0 flex-col gap-3">
          <header className="flex items-center justify-between gap-3 border-b border-[var(--border-line)] pb-2">
            <h2 className="font-semibold text-[var(--text-primary)]">Code</h2>
            <CopyPromptChip text={assembleCopy(buildPrompt, [
              { name: 'TransitionDemo.tsx', code: demoSrc },
              { name: 'TransitionDemo.css', code: demoCss },
              { name: 'catalog.ts', code: catalogSrc },
            ])} />
          </header>
          <CodeTabs tabs={[
            { file: 'TransitionDemo.tsx', code: demoSrc },
            { file: 'TransitionDemo.css', code: demoCss },
            { file: 'catalog.ts', code: catalogSrc },
          ]} />
        </section>

        <CreditRows rows={[
          ['Company', 'CAGGIANO'],
          ['Date', definition.date],
          ['Tags', definition.tags],
          ['Reference', 'Transitions.dev — Jakub Antalik'],
        ]} />

        <p className="mt-2 text-center text-[12px] text-[var(--text-tertiary)]">
          Motion and interaction reference:{' '}
          <a
            href="https://transitions.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-[var(--border-line)] underline-offset-2 transition-colors duration-150 hover:text-[var(--text-secondary)]"
          >
            Transitions.dev by Jakub Antalik
          </a>
        </p>
      </div>
      <div aria-hidden="true" className="h-16" />
    </DetailShell>
  )
}
