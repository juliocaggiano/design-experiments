import { useRef, useState } from 'react'
import {
  LIQUID_CONNECTOR_DEFAULTS,
  LiquidConnectorControlPanel,
  LiquidConnectorDemo,
  type LiquidConnectorControls,
  type LiquidConnectorSettings,
} from '../demos/LiquidConnectorDemo'
import demoSrc from '../demos/LiquidConnectorDemo.tsx?raw'
import demoCss from '../demos/LiquidConnectorDemo.css?raw'
import pathSrc from '../demos/liquidPath.js?raw'
import licenseSrc from '../content/liquid-connector/LICENSE?raw'
import noticeSrc from '../content/liquid-connector/NOTICE?raw'
import { ChipButton, CodeTabs, ControlsSection, CopyPromptChip, CreditRows, DetailShell, assembleCopy } from './detail-kit'

const BUILD_PROMPT = `Build a light-mode React card where an output card peels off a prompt card with a liquid coupling seam, rendered as one real SVG path — no masks, canvas, or shaders.

Core behavior:
- Render both cards and the gap between them as a single generated SVG path (viewBox 520×300, output card 444×68 at y=57, prompt card 444×134 at y=135, rest gap 10, hidden gap −54). The path solver produces the coupled seam, corner tangencies, waist, peel, and the merged↔detached topology change from one gap scalar plus four peel parameters (detach gap 6, transition 6.5, coupling radius 5, pull 2.5).
- Drive the gap with a damped spring (stiffness 1200, damping 38) for interrupted motion, measured keyframe transitions (~0.39 s) for full opens and closes, and immediate jumps for gap scrubs. Track merge/detach mode with direction-aware hysteresis, tear age/strength for the peel, and close age for strain.
- The output card keeps fixed dimensions while peeling; the prompt content and its send button take independent scaleY strain; the output card blurs and spawns two ±2 px smear clones during fast closes. Gate pointer events, inert, and aria-hidden on the output card at 88% opacity.
- Keep the white surface borderless and lift it off the #f2f2f2 stage with a soft drop shadow on the fill path; draw a blue focus outline over the same geometry only while the stage has focus within.

Behavior rules:
- The feed thumbnail and the expanded implementation share one engine and one set of defaults.
- Nothing moves on its own — only real interaction drives the surface. In-flight transitions pause while the card is offscreen.
- With prefers-reduced-motion, every transition jumps straight to its settled state.
- Skip focuses the prompt and closes the connector; Connect closes it too; the send button enables only when the prompt has text and clears it on submit (Enter without Shift submits).
- Expose rest gap, the four peel parameters, and an open switch as live light-mode controls, plus a reset chip.
- Clean up animation frames, observers, listeners, and timers on unmount, and namespace every class.`

export function LiquidConnectorDetail() {
  const controls = useRef<LiquidConnectorControls>({}).current
  const [settings, setSettings] = useState<LiquidConnectorSettings>(LIQUID_CONNECTOR_DEFAULTS)

  return (
    <DetailShell title="Liquid Connector">
      <div className="flex min-w-0 flex-col gap-14">
        <div className="flex min-w-0 flex-col gap-6">
        <section className="flex min-w-0 flex-col gap-4">
          <div className="min-w-0 overflow-hidden rounded-xl border border-[var(--border-line)] bg-[var(--bg-page)]">
            <LiquidConnectorDemo settings={settings} onSettingsChange={setSettings} controls={controls} />
          </div>
          <p className="text-[12px] text-[var(--text-tertiary)]">
            Nothing moves on its own — drag the rest-gap slider to scrub the peel, flip the switch to collapse or
            bring the card back, type in the prompt, or use Skip and Connect. Every control updates the live surface
            immediately.
          </p>
        </section>

        <ControlsSection actions={<ChipButton onClick={() => controls.reset?.()}>Reset</ChipButton>}>
          <LiquidConnectorControlPanel settings={settings} onChange={setSettings} />
        </ControlsSection>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-pretty text-[var(--text-primary)]">
            A connector card that peels off a prompt like a liquid film. The whole white surface — both cards, the
            coupled seam, the stretching waist, and the final tear — is one SVG path recomputed every frame from a
            single gap value, so the topology change from merged to detached stays perfectly smooth. No masks,
            canvas, or shaders anywhere; the borderless surface just lifts off the page with a soft drop shadow.
          </p>
          <p className="text-pretty text-[var(--text-primary)]">
            This is a React port of zanwei&apos;s MIT-licensed Web Component, itself an independent path-math
            recreation of a motion reference by Mikk Martin. The port keeps the upstream geometry, springs, measured
            keyframe transitions, smear clones, and colors untouched; the custom element and its event API become
            plain DOM driven from refs, and the demo content is a Codex MCP connector sample whose mark is an
            original vector redraw (see NOTICE).
          </p>
        </div>

        <section className="flex min-w-0 flex-col gap-3">
          <header className="flex items-center justify-between gap-3 border-b border-[var(--border-line)] pb-2">
            <h2 className="font-semibold text-[var(--text-primary)]">Code</h2>
            <CopyPromptChip text={assembleCopy(BUILD_PROMPT, [
              { name: 'LiquidConnectorDemo.tsx', code: demoSrc },
              { name: 'LiquidConnectorDemo.css', code: demoCss },
              { name: 'liquidPath.js', code: pathSrc },
            ])} />
          </header>
          <CodeTabs tabs={[
            { file: 'LiquidConnectorDemo.tsx', code: demoSrc },
            { file: 'LiquidConnectorDemo.css', code: demoCss },
            { file: 'liquidPath.js', code: pathSrc },
            { file: 'LICENSE', code: licenseSrc },
            { file: 'NOTICE', code: noticeSrc },
          ]} />
        </section>

        <CreditRows
          rows={[
            ['Company', 'CAGGIANO'],
            ['Date', 'Jul 18, 2026'],
            ['Tags', 'SVG path math, Physics, Web Component port'],
            ['Author', 'zanwei — liquid-connector-web-component (MIT)'],
            ['Inspiration', 'Mikk Martin — x.com/mikkmartin (independent recreation)'],
            ['Sample content', 'Codex name — trademark of OpenAI; mark redrawn as an original vector'],
          ]}
        />

        <p className="mt-2 text-center text-[12px] text-[var(--text-tertiary)]">
          Source and license:{' '}
          <a
            href="https://github.com/zanwei/liquid-connector-web-component"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-[var(--border-line)] underline-offset-2 transition-colors duration-150 hover:text-[var(--text-secondary)]"
          >
            github.com/zanwei/liquid-connector-web-component
          </a>
          {' · MIT, path solver vendored — corner radii tuned 24/22'}
        </p>
      </div>
      <div aria-hidden="true" className="h-16" />
    </DetailShell>
  )
}
