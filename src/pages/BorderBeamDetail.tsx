import { useRef } from 'react'
import { BorderBeamDemo, type BorderBeamControls } from '../demos/BorderBeamDemo'
import { ChipButton, CodeTabs, CopyPromptChip, CreditRows, DetailShell, assembleCopy } from './detail-kit'
import demoSrc from '../demos/BorderBeamDemo.tsx?raw'
import demoCss from '../demos/BorderBeamDemo.css?raw'

const BUILD_PROMPT = `Build a self-contained, switchable border beam playground in React and CSS.

Visual structure:
- Present the effect on a restrained light canvas, with a graphite 348 by 66 pixel field centered in the stage.
- Use a 22 pixel continuous/squircle radius, a subtle cool border, soft inset depth, and an editable “Ask anything...” field.
- Keep layout padding on a 4 pixel grid, with 32 pixels of vertical stage padding and a compact icon control inside the field.
- Include the source playground's Large, Small, and Line type choices plus Colorful, Mono, Ocean, and Sunset palettes.

Border effect:
- Use the source's 1.96 second rotating conic treatment for Large and Small.
- For Line, move the focal point from 6% to 94% over 3.1 seconds, widening through the center and fading near both edges.
- Keep every palette on the same one-pixel masked edge, inner glow, and blurred bloom system.
- Default to 60% strength, expose a 0–100 strength control, and keep the beam motion looping continuously without pause controls.
- Submit the field locally and animate a paper-plane send icon as restrained feedback.
- Keep the thumbnail, expanded hero, and implementation equally editable while preserving thumbnail navigation outside the field.
- Respect reduced motion with a static centered beam.

Keep every class namespaced so the component can live inside an existing design system.`

export function BorderBeamDetail() {
  const controls = useRef<BorderBeamControls>({}).current

  return (
    <DetailShell title="Border beam">
      <div
        aria-label="Ocean line border beam preview"
        className="relative mx-auto aspect-[1344/520] w-full overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)]"
      >
        <BorderBeamDemo compact />
      </div>

      <div className="flex min-w-0 flex-col gap-14">
        <div className="flex flex-col gap-3">
          <p className="text-pretty text-[var(--text-primary)]">
            A thin line can carry more energy than a loud surface. The default remains Beam’s Ocean treatment, but the
            playground now exposes its complete type and color system: rotating large and small beams plus the focused
            line treatment.
          </p>
          <p className="text-pretty text-[var(--text-primary)]">
            The effect is rebuilt locally with typed CSS properties, layered radial gradients, and a border mask. The
            surrounding page stays in the vault’s light system while a softer graphite “Ask anything...” field gives
            each palette enough contrast to read clearly. Its Apple-like continuous corners, four-point spacing, and
            animated send control now stay equally editable in the thumbnail, expanded hero, and implementation while
            the beam itself loops continuously.
          </p>
        </div>

        <section className="flex min-w-0 flex-col gap-4">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-line)] pb-2">
            <h2 className="font-semibold text-[var(--text-primary)]">Implementation</h2>
            <div className="flex items-center gap-2">
              <ChipButton onClick={() => controls.reset?.()}>Reset</ChipButton>
            </div>
          </header>
          <div className="relative z-10 min-h-[430px] overflow-hidden rounded-xl border border-[var(--border-line)] bg-[var(--bg-page)]">
            <BorderBeamDemo controls={controls} />
          </div>
        </section>

        <section className="flex min-w-0 flex-col gap-3">
          <header className="flex items-center justify-between gap-3 border-b border-[var(--border-line)] pb-2">
            <h2 className="font-semibold text-[var(--text-primary)]">Code</h2>
            <CopyPromptChip text={assembleCopy(BUILD_PROMPT, [
              { name: 'BorderBeamDemo.tsx', code: demoSrc },
              { name: 'BorderBeamDemo.css', code: demoCss },
            ])} />
          </header>
          <CodeTabs tabs={[
            { file: 'BorderBeamDemo.tsx', code: demoSrc },
            { file: 'BorderBeamDemo.css', code: demoCss },
          ]} />
        </section>

        <CreditRows
          rows={[
            ['Company', 'CAGGIANO'],
            ['Date', 'Jul 14, 2026'],
            ['Tags', 'Border, Motion, CSS'],
            ['Reference', 'beam.jakubantalik.com — Jakub Antalik'],
          ]}
        />

        <p className="mt-2 text-center text-[12px] text-[var(--text-tertiary)]">
          Visual and interaction reference:{' '}
          <a
            href="https://beam.jakubantalik.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-[var(--border-line)] underline-offset-2 transition-colors duration-150 hover:text-[var(--text-secondary)]"
          >
            Border beam by Jakub Antalik
          </a>
        </p>
      </div>
      <div aria-hidden="true" className="h-16" />
    </DetailShell>
  )
}
