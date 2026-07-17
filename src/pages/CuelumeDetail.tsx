import { useRef } from 'react'
import { CuelumeDemo, type CuelumeControls } from '../demos/CuelumeDemo'
import { ChipButton, CodeTabs, CopyPromptChip, CreditRows, DetailShell, assembleCopy } from './detail-kit'
import demoSrc from '../demos/CuelumeDemo.tsx?raw'
import demoCss from '../demos/CuelumeDemo.css?raw'

const installCommand = 'npm install cuelume@0.1.2'

const BUILD_PROMPT = `Build a vault-native interaction-sound selector in React and CSS, using Cuelume 0.1.2 for exact audio behavior.

Visual structure:
- Present one polished system-fill split control, only about 5% darker than the host product's white canvas.
- The main interaction changes to match the selected cue: switch for toggle/whisper, checkbox for tick, press/release behavior, confirmation, pagination, loading, and other semantically matched actions.
- The adjacent dropdown trigger opens a vault-native menu with all fourteen sound-and-control pairs.
- Give each cue an SF Symbols-like rounded icon with consistent optical size and stroke weight, plus a color marker, short character description, keyboard shortcut, selected state, and visible focus state.
- Let container queries compress the same component into the fixed-ratio thumbnail without creating a separate static preview.

Interaction:
- Install and call the official MIT-licensed cuelume@0.1.2 package so the recipes, envelopes, shimmer tails, hover throttling, pointer rules, and shared AudioContext match the reference exactly.
- Use play() for selected cues and bind() for the source's declarative hover and toggle semantics.
- Support the 1–0 and Q–R shortcuts while the palette is focused.
- Keep the dropdown operable with Arrow keys, Home, End, Escape, Enter, pointer, and touch.
- Use the host design system for appearance and respect reduced-motion preferences.

Keep every class namespaced so the component can live inside another design system.`

export function CuelumeDetail() {
  const controls = useRef<CuelumeControls>({}).current

  return (
    <DetailShell title="Interaction Sounds">
      <div
        aria-label="Cuelume interaction sound palette preview"
        className="relative mx-auto aspect-[1344/520] w-full overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)]"
      >
        <CuelumeDemo />
      </div>

      <div className="flex min-w-0 flex-col gap-14">
        <div className="flex flex-col gap-3">
          <p className="text-pretty text-[var(--text-primary)]">
            The operation and the visualization now have separate jobs. Cuelume 0.1.2 itself handles every oscillator,
            filtered-noise layer, gain envelope, shimmer tail, hover guard, and shared audio context, so playback is the
            exact engine used by the reference rather than a visual imitation of it.
          </p>
          <p className="text-pretty text-[var(--text-primary)]">
            The visible execution is intentionally different: a vault-native pale-gray control changes shape and behavior
            to fit the chosen cue—a real switch for Toggle, a checkbox for Tick, press/release controls, confirmation,
            pagination, loading, and more. Its dropdown exposes all fourteen sound-and-control pairs with shortcuts and
            selected states. The same component powers the thumbnail, expanded hero, and full implementation.
          </p>
        </div>

        <section className="flex min-w-0 flex-col gap-4">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-line)] pb-2">
            <h2 className="font-semibold text-[var(--text-primary)]">Implementation</h2>
            <ChipButton onClick={() => controls.reset?.()}>Reset</ChipButton>
          </header>
          <div className="relative z-10 h-[520px] overflow-hidden rounded-xl border border-[var(--border-line)] bg-[var(--bg-page)] max-sm:h-[560px]">
            <CuelumeDemo controls={controls} />
          </div>
          <p className="text-[12px] text-[var(--text-tertiary)]">
            Tip: choose a sound-and-control pair from the selector, then interact with it; 1–0 and Q–R provide quick cue previews.
          </p>
        </section>

        <section className="flex min-w-0 flex-col gap-3">
          <header className="flex items-center justify-between gap-3 border-b border-[var(--border-line)] pb-2">
            <h2 className="font-semibold text-[var(--text-primary)]">Code</h2>
            <CopyPromptChip text={assembleCopy(BUILD_PROMPT, [
              { name: 'CuelumeDemo.tsx', code: demoSrc },
              { name: 'CuelumeDemo.css', code: demoCss },
              { name: 'install.sh', code: installCommand },
            ])} />
          </header>
          <CodeTabs tabs={[
            { file: 'CuelumeDemo.tsx', code: demoSrc },
            { file: 'CuelumeDemo.css', code: demoCss },
            { file: 'install.sh', code: installCommand },
          ]} />
        </section>

        <CreditRows
          rows={[
            ['Company', 'CAGGIANO'],
            ['Date', 'Jul 15, 2026'],
            ['Tags', 'Sound, Controls, Web Audio'],
            ['Reference', 'Cuelume — Daniel Belyi'],
          ]}
        />

        <p className="mt-2 text-center text-[12px] text-[var(--text-tertiary)]">
          Visual and interaction reference:{' '}
          <a
            href="https://cuelume-site.pages.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-[var(--border-line)] underline-offset-2 transition-colors duration-150 hover:text-[var(--text-secondary)]"
          >
            Cuelume by Daniel Belyi
          </a>
        </p>
      </div>
      <div aria-hidden="true" className="h-16" />
    </DetailShell>
  )
}
