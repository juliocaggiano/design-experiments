import { useRef, useState } from 'react'
import {
  BORDER_BEAM_DEFAULTS,
  BorderBeamControlPanel,
  BorderBeamDemo,
  type BorderBeamControls,
  type BorderBeamSettings,
} from '../demos/BorderBeamDemo'
import { ChipButton, CodeTabs, ControlsSection, CopyPromptChip, CreditRows, DetailShell, assembleCopy } from './detail-kit'
import demoSrc from '../demos/BorderBeamDemo.tsx?raw'
import demoCss from '../demos/BorderBeamDemo.css?raw'

const BUILD_PROMPT = `Build a self-contained, switchable border beam playground in React and CSS.

Visual structure:
- Present the effect on a restrained light canvas, with a light 348 by 66 pixel field centered in the stage.
- Use a 22 pixel continuous/squircle radius, a subtle neutral border, soft inset depth, and an editable “Ask anything...” field.
- Keep layout padding on a 4 pixel grid, with 32 pixels of vertical stage padding and a compact icon control inside the field.
- Include the source playground's Large, Small, and Line type choices plus four grayscale palettes (Ink, Graphite, Stone, Mist).

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
  const [settings, setSettings] = useState<BorderBeamSettings>(BORDER_BEAM_DEFAULTS)

  return (
    <DetailShell title="Border beam">
      <div className="flex min-w-0 flex-col gap-14">
        <div className="flex min-w-0 flex-col gap-6">
        <section className="flex min-w-0 flex-col gap-4">
          <div className="relative z-10 overflow-hidden rounded-xl border border-[var(--border-line)] bg-[var(--bg-page)]">
            <BorderBeamDemo
              chrome="stage"
              settings={settings}
              onSettingsChange={setSettings}
              controls={controls}
            />
          </div>
          <p className="text-[12px] text-[var(--text-tertiary)]">
            Type a message and send it for the plane animation; switch palettes and beam types from the controls below.
          </p>
        </section>

        <ControlsSection actions={<ChipButton onClick={() => controls.reset?.()}>Reset</ChipButton>}>
          <BorderBeamControlPanel settings={settings} onChange={setSettings} />
        </ControlsSection>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-pretty text-[var(--text-primary)]">
            A thin line can carry more energy than a loud surface. The default is a quiet stone treatment at 8%
            strength, and the playground exposes the complete type and tone system: rotating large and small beams
            plus the focused line treatment, each in four grayscale palettes.
          </p>
          <p className="text-pretty text-[var(--text-primary)]">
            The effect is rebuilt locally with typed CSS properties, layered radial gradients, and a border mask —
            entirely in black and gray, so it sits natively in the vault's light system. The white “Ask anything...”
            field keeps the dark beam legible. Its Apple-like continuous corners, four-point spacing, and animated
            send control stay equally editable in the thumbnail and the implementation above while the beam
            itself loops continuously.
          </p>
        </div>

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
