import { useRef } from 'react'
import type { AICSS_DEFINITIONS } from '../aicss/catalog'
import {
  AiCssDemo,
  type AiCssDemoControls,
} from '../demos/aicss/AiCssDemo'
import { ChipButton, CodeTabs, CopyPromptChip, CreditRows, DetailShell, assembleCopy } from './detail-kit'
import demoSrc from '../demos/aicss/AiCssDemo.tsx?raw'
import demoCss from '../demos/aicss/AiCssDemo.css?raw'
import catalogSrc from '../aicss/catalog.ts?raw'

type AiCssRecord = (typeof AICSS_DEFINITIONS)[number]

export function AiCssDetail({ definition }: { definition: AiCssRecord }) {
  const controls = useRef<AiCssDemoControls>({}).current
  const buildPrompt = `Build the “${definition.title}” AI-interface component as a self-contained React and CSS specimen.

Behavior:
- ${definition.summary}
- ${definition.detail}
- Keep every meaningful control usable with a pointer and keyboard.
- Announce progressive or copied states where appropriate.
- Preserve the state change when prefers-reduced-motion is enabled.

Visual system:
- Use a light editorial canvas, white surfaces, neutral hairlines, inherited sans-serif type, and compact squircle-like corners.
- Keep the same component responsive inside a fixed-ratio thumbnail and a taller implementation stage.
- Namespace every class with ac- so it can be embedded safely in another product.

The complete shared AI component collection follows. Render the specimen with id="${definition.id}".`

  return (
    <DetailShell title={definition.title}>
      <div className="flex min-w-0 flex-col gap-14">
        <section className="flex min-w-0 flex-col gap-4">
          <div className="flex items-center justify-end gap-2">
            <ChipButton onClick={() => controls.reset?.()}>Reset</ChipButton>
            <ChipButton onClick={() => controls.replay?.()}>Replay</ChipButton>
          </div>
          <div className="relative z-10 h-[440px] overflow-hidden rounded-xl border border-[var(--border-line)] bg-[var(--bg-page)] max-sm:h-[400px]">
            <AiCssDemo id={definition.id} controls={controls} />
          </div>
          <p className="text-[12px] text-[var(--text-tertiary)]">
            The feed thumbnail and this implementation render the same stateful component. Replay restarts or advances its primary behavior.
          </p>
        </section>

        <div className="flex flex-col gap-3">
          <p className="text-pretty text-[var(--text-primary)]">{definition.summary}</p>
          <p className="text-pretty text-[var(--text-primary)]">
            {definition.detail} The interaction model follows the AI CSS reference, while the surfaces, typography,
            spacing, and motion restraint have been rebuilt for the vault’s light design system.
          </p>
        </div>

        <section className="flex min-w-0 flex-col gap-3">
          <header className="flex items-center justify-between gap-3 border-b border-[var(--border-line)] pb-2">
            <h2 className="font-semibold text-[var(--text-primary)]">Code</h2>
            <CopyPromptChip text={assembleCopy(buildPrompt, [
              { name: 'AiCssDemo.tsx', code: demoSrc },
              { name: 'AiCssDemo.css', code: demoCss },
              { name: 'catalog.ts', code: catalogSrc },
            ])} />
          </header>
          <CodeTabs tabs={[
            { file: 'AiCssDemo.tsx', code: demoSrc },
            { file: 'AiCssDemo.css', code: demoCss },
            { file: 'catalog.ts', code: catalogSrc },
          ]} />
        </section>

        <CreditRows rows={[
          ['Company', 'CAGGIANO'],
          ['Date', definition.date],
          ['Source group', definition.sourceGroup],
          ['Tags', definition.tags],
          ['Reference', 'AI CSS — Kevin'],
        ]} />

        <p className="mt-2 text-center text-[12px] text-[var(--text-tertiary)]">
          Component behavior reference:{' '}
          <a
            href={`https://www.aicss.dev/components/${definition.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-[var(--border-line)] underline-offset-2 transition-colors duration-150 hover:text-[var(--text-secondary)]"
          >
            AI CSS by Kevin
          </a>
        </p>
      </div>
      <div aria-hidden="true" className="h-16" />
    </DetailShell>
  )
}
