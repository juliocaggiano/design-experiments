import { useRef } from 'react'
import {
  ScribbleIndexDemo,
  type ScribbleIndexControls,
} from '../demos/ScribbleIndexDemo'
import demoSrc from '../demos/ScribbleIndexDemo.tsx?raw'
import demoCss from '../demos/ScribbleIndexDemo.css?raw'
import {
  ChipButton,
  CodeTabs,
  CopyPromptChip,
  CreditRows,
  DetailShell,
  assembleCopy,
} from './detail-kit'

const REFERENCE_URL = 'https://benji.org/'

const BUILD_PROMPT = `Build an interactive editorial index in React and CSS.

Visual direction:
- Use a white surface, restrained gray type, hairline dividers, a fixed year column, titles in the middle, and tabular dates aligned to the right.
- Make the hovered row fully black while every sibling row fades to 30 percent opacity over 140 ms.
- Place a vivid magenta rough circle around the word “New”.

Interaction:
- In compact previews, advance the active hover state automatically only while the card is visible.
- Add a real canvas above the list so people can draw rough magenta circles, arrows, and underlines with mouse, touch, or pen.
- Preserve the initial “New” annotation, expose undo/reset controls outside the specimen, support keyboard focus, and respect reduced motion.
- Keep the feed thumbnail, expanded hero, and implementation on the same stateful component.

Implementation constraints:
- Store points as normalized coordinates so drawings survive responsive resizing.
- Render a subtle second pass beside each stroke to create a hand-drawn line without a raster asset.
- Keep every CSS class namespaced with si-.`

export function ScribbleIndexDetail() {
  const controls = useRef<ScribbleIndexControls>({}).current

  return (
    <DetailShell title="Scribble Index">
      <div
        aria-label="Interactive writing index preview"
        className="relative mx-auto aspect-[1344/520] w-full overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)]"
      >
        <ScribbleIndexDemo compact />
      </div>

      <div className="flex min-w-0 flex-col gap-14">
        <div className="flex flex-col gap-3">
          <p className="text-pretty text-[var(--text-primary)]">
            Scribble Index recreates the quiet writing list from Benji Taylor’s portfolio: one row comes forward while
            the rest recede, dates stay fixed to the right, and year changes create the only full-width dividers.
          </p>
          <p className="text-pretty text-[var(--text-primary)]">
            The pink annotation is a real drawing surface rather than a decorative image. Drag anywhere in the specimen
            with a mouse, finger, or pen to add rough circles, arrows, and underlines; the strokes remain aligned as the
            layout resizes.
          </p>
        </div>

        <section className="flex min-w-0 flex-col gap-4">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-line)] pb-2">
            <h2 className="font-semibold text-[var(--text-primary)]">Implementation</h2>
            <div className="flex flex-wrap gap-2">
              <ChipButton onClick={() => controls.undo?.()}>Undo stroke</ChipButton>
              <ChipButton onClick={() => controls.reset?.()}>Reset canvas</ChipButton>
            </div>
          </header>
          <div className="relative h-[420px] overflow-hidden rounded-xl border border-[var(--border-line)] bg-[var(--bg-page)] max-sm:h-[360px]">
            <ScribbleIndexDemo controls={controls} />
          </div>
          <p className="text-[12px] text-[var(--text-tertiary)]">
            Hover a row to isolate it, then drag directly over the list to annotate it.
          </p>
        </section>

        <section className="flex min-w-0 flex-col gap-3">
          <header className="flex items-center justify-between gap-3 border-b border-[var(--border-line)] pb-2">
            <h2 className="font-semibold text-[var(--text-primary)]">Code</h2>
            <CopyPromptChip text={assembleCopy(BUILD_PROMPT, [
              { name: 'ScribbleIndexDemo.tsx', code: demoSrc },
              { name: 'ScribbleIndexDemo.css', code: demoCss },
            ])} />
          </header>
          <CodeTabs tabs={[
            { file: 'ScribbleIndexDemo.tsx', code: demoSrc },
            { file: 'ScribbleIndexDemo.css', code: demoCss },
          ]} />
        </section>

        <CreditRows rows={[
          ['Company', 'CAGGIANO'],
          ['Date', 'Jul 16, 2026'],
          ['Tags', 'Hover, Canvas, Annotation'],
          ['Reference', 'Benji Taylor'],
        ]} />

        <p className="mt-2 text-center text-[12px] text-[var(--text-tertiary)]">
          Interaction and layout reference:{' '}
          <a
            href={REFERENCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-[var(--border-line)] underline-offset-2 transition-colors duration-150 hover:text-[var(--text-secondary)]"
          >
            benji.org
          </a>
          {' · original React and canvas implementation'}
        </p>
      </div>
      <div aria-hidden="true" className="h-16" />
    </DetailShell>
  )
}
