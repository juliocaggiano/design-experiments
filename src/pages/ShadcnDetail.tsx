import { ShadcnDemo } from '../demos/shadcn/ShadcnDemo'
import type { ShadcnDefinition } from '../shadcn/catalog'
import {
  CodeTabs,
  CopyPromptChip,
  CreditRows,
  DetailShell,
  assembleCopy,
} from './detail-kit'
import demoSrc from '../demos/shadcn/ShadcnDemo.tsx?raw'
import demoCss from '../demos/shadcn/ShadcnDemo.css?raw'
import commandGuideDemoSrc from '../demos/shadcn/CommandGuideDemo.tsx?raw'
import catalogSrc from '../shadcn/catalog.ts?raw'
import { ShadcnCommandGuide } from './ShadcnCommandGuide'
import commandGuidePageSrc from './ShadcnCommandGuide.tsx?raw'

const SOURCE_COMMIT = 'c49c3061b5b86b130736d36bf20008349f89b416'

export function ShadcnDetail({ definition }: { definition: ShadcnDefinition }) {
  const sourceFiles = [
    { name: 'ShadcnDemo.tsx', code: demoSrc },
    { name: 'ShadcnDemo.css', code: demoCss },
    ...(definition.id === 'command'
      ? [
          { name: 'CommandGuideDemo.tsx', code: commandGuideDemoSrc },
          { name: 'ShadcnCommandGuide.tsx', code: commandGuidePageSrc },
        ]
      : []),
    { name: 'catalog.ts', code: catalogSrc },
  ]
  const buildPrompt = `Build a self-contained “${definition.title}” component in React and CSS.

Behavior:
- ${definition.summary}
- ${definition.detail}
- Reproduce the official primary shadcn/ui documentation demo at commit ${SOURCE_COMMIT}.
- Keep the component directly interactive and preserve its original labels, content, dimensions, states, and keyboard behavior.

Visual system:
- Match the exact base-nova or base-rhea light-mode component style used by the source demo, including its Geist or Inter typeface, spacing, borders, radii, colors, and responsive behavior.
- Keep the thumbnail, expanded hero, and implementation on the same canonical specimen.
${definition.id === 'command'
    ? '- Keep Basic, Shortcuts, Groups, Scrollable, and RTL as separate examples in the expanded complete guide; do not crowd them into the thumbnail.'
    : definition.id === 'attachment'
      ? '- Keep the official attachment anatomy, then add direct image preview, upload cancellation, and file removal without adding a separate control bar.'
      : '- Do not add alternate examples, wrapper controls, decorative styling, or vault-specific reinterpretations inside the demo.'}

The complete shared component collection follows. Render the specimen with id="${definition.id}".`

  return (
    <DetailShell title={definition.title}>
      <div
        aria-label={`${definition.title} expanded preview`}
        className="relative mx-auto aspect-[1344/520] w-full overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)]"
      >
        <ShadcnDemo id={definition.id} />
      </div>

      <div className="flex min-w-0 flex-col gap-14">
        <div className="flex flex-col gap-3">
          <p className="text-pretty text-[var(--text-primary)]">{definition.summary}</p>
          <p className="text-pretty text-[var(--text-primary)]">
            {definition.detail} The behavior, typography, spacing, and light-mode component treatment follow the
            official base-nova or base-rhea source across the feed, hero, and implementation.
          </p>
        </div>

        <section className="flex min-w-0 flex-col gap-4">
          <header className="flex items-center justify-between gap-3 border-b border-[var(--border-line)] pb-2">
            <h2 className="font-semibold text-[var(--text-primary)]">Implementation</h2>
          </header>

          <div className={`relative z-10 overflow-hidden rounded-xl border border-[var(--border-line)] bg-[var(--bg-page)] ${
            definition.id === 'attachment' ? 'h-[360px] max-sm:h-[300px]' : 'h-[480px] max-sm:h-[420px]'
          }`}>
            <ShadcnDemo id={definition.id} />
          </div>
          <p className="text-[12px] text-[var(--text-tertiary)]">
            {definition.id === 'attachment'
              ? 'The official attachment anatomy is preserved, with local preview, cancel, and remove behavior added directly to the specimen.'
              : 'This is the canonical primary demo from the official shadcn/ui source, reproduced in place so it remains interactive without leaving the vault.'}
          </p>
        </section>

        {definition.id === 'command' ? <ShadcnCommandGuide /> : null}

        <section className="flex min-w-0 flex-col gap-3">
          <header className="flex items-center justify-between gap-3 border-b border-[var(--border-line)] pb-2">
            <h2 className="font-semibold text-[var(--text-primary)]">Code</h2>
            <CopyPromptChip text={assembleCopy(buildPrompt, sourceFiles)} />
          </header>
          <CodeTabs tabs={sourceFiles.map(({ name, code }) => ({ file: name, code }))} />
        </section>

        <CreditRows rows={[
          ['Company', 'CAGGIANO'],
          ['Date', definition.date],
          ['Tags', definition.tags],
          ['Reference', definition.id === 'command' ? 'shadcn/ui + cmdk' : 'shadcn/ui'],
        ]} />

        <p className="mt-2 text-center text-[12px] text-[var(--text-tertiary)]">
          Component and light-mode reference:{' '}
          <a
            href={definition.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-[var(--border-line)] underline-offset-2 transition-colors duration-150 hover:text-[var(--text-secondary)]"
          >
            shadcn/ui documentation
          </a>
          {' · '}
          <a
            href={`https://github.com/shadcn-ui/ui/tree/${SOURCE_COMMIT}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-[var(--border-line)] underline-offset-2 transition-colors duration-150 hover:text-[var(--text-secondary)]"
          >
            GitHub source
          </a>
          {' · MIT'}
        </p>
      </div>
      <div aria-hidden="true" className="h-16" />
    </DetailShell>
  )
}
