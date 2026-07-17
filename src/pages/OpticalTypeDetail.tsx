import { useRef, useState } from 'react'
import { OpticalTypeDemo, type OpticalTypeControls } from '../demos/OpticalTypeDemo'
import { ChipButton, CopyPromptChip, SliderChip, CodeTabs, CreditRows, DetailShell, assembleCopy } from './detail-kit'
import typeSrc from '../demos/OpticalTypeDemo.tsx?raw'

/* Skill card #4: the apple-design skill's typography chapter. */

const BUILD_PROMPT = `Build this: an optical-typography demo that proves tracking and leading are size-specific — one fixed letter-spacing value is wrong somewhere, always.

Core requirements:
- Two copies of the same word, stacked. The top ("optical") line derives its letter-spacing and line-height from the current font size every frame; the bottom ("fixed") line keeps a single constant letter-spacing, the way most stylesheets ship.
- The size breathes on its own through the full range (~14 → 88px) on a slow sine, so the failure is visible without any interaction: at caption sizes both lines read fine, but as the type grows the fixed line drifts apart while the optical line tightens and holds together.
- The derivations (tune to taste, the shape is what matters):
  tracking(em) = clamp(−0.024 + 0.42 / sizePx, −0.024, +0.02) — positive at small sizes for legibility, increasingly negative at display sizes.
  leading = clamp(1.1 + 6.4 / sizePx, 1.05, 1.6) — roomy for body, tight for display.
- Horizontal scrub: dragging across the canvas maps pointer x to size 1:1, pausing the breathing for a few seconds after release. A scrub must not count as a click.
- A live readout (tabular numerals) showing the current size, derived tracking, and derived leading.
- Fit-guard: scale the rendered size down if the tracked-out fixed line would overflow the container, so the comparison never clips.
- Also apply the web hygiene the demo teaches: font-optical-sizing: auto where the face supports it, spacing in rem/em so layouts scale with the user's text size, and the platform's system font unless there's a reason not to.
- Under prefers-reduced-motion, hold a static mid-range size instead of breathing.`

const CODE_TABS = [
  {
    file: 'optical.ts',
    code: `// Tracking is size-specific — never one value for all sizes.
// Small text wants slightly POSITIVE tracking for legibility;
// large display text wants NEGATIVE tracking (letters read too far
// apart as they grow). One fixed letter-spacing is wrong somewhere.
export function opticalTracking(size: number) {
  return Math.max(-0.024, Math.min(0.02, -0.024 + 0.42 / size))
}
// 14px → +0.006em   17px → ±0   28px → −0.009em   88px → −0.019em

// Leading runs INVERSE to size: roomy for body copy,
// tight for display headings.
export function opticalLeading(size: number) {
  return Math.max(1.05, Math.min(1.6, 1.1 + 6.4 / size))
}
// 14px → 1.56   28px → 1.33   88px → 1.17

// Apply both wherever the size changes — a slider, a clamp() headline,
// a user's Dynamic Type setting:
el.style.fontSize = size + 'px'
el.style.letterSpacing = opticalTracking(size) + 'em'
el.style.lineHeight = String(opticalLeading(size))`,
  },
  {
    file: 'scrub.ts',
    code: `// The size breathes through the range on a slow sine, so the
// comparison tells its story without any interaction at all.
const mid = (MIN + MAX) / 2
const amp = (MAX - MIN) / 2
size = mid + amp * Math.sin(t / 2400)

// Horizontal scrub: pointer x maps to size 1:1. Direct manipulation —
// the value lives under the finger, no widget in between.
box.addEventListener('pointermove', (e) => {
  if (!dragging) return
  const k = clamp((e.clientX - box.left) / box.width, 0, 1)
  manualSize = MIN + k * (MAX - MIN)
})

// Releasing hands control back to the breathing after a beat.
box.addEventListener('pointerup', () => {
  manualUntil = performance.now() + 4000
})

// A scrub is not a click — don't let it trigger the card link.
box.addEventListener('click', (e) => {
  if (dragDist > 6) { e.preventDefault(); e.stopPropagation() }
})`,
  },
  {
    file: 'type.css',
    code: `/* Body: system font, comfortable leading. The platform face already
   ships optical sizing and tracking tables — override with a reason. */
:root { font: 100%/1.5 system-ui, sans-serif; }

/* Display text: tight leading, negative tracking, optical sizing on.
   The em unit keeps tracking proportional as the size scales. */
.display {
  font-size: clamp(2rem, 5vw, 4rem);
  line-height: 1.05;
  letter-spacing: -0.02em;
  font-optical-sizing: auto;
}

/* Respect the user's text-size setting: spacing in rem/em, never
   fixed px, so a larger font setting scales the layout WITH it. */
.stack { gap: 1rem; padding: 1.5rem; }

/* Hierarchy = weight + size + leading as a set, not size alone.
   Weight adds presence without taking more space. */
.headline { font-weight: 600; }`,
  },
]

export function OpticalTypeDetail() {
  const [size, setSize] = useState(Number.NaN) // NaN = breathing
  const [fixedTrack, setFixedTrack] = useState(0.02)
  const controls = useRef<OpticalTypeControls>({}).current

  return (
    <DetailShell title="Optical typography">
      {/* hero */}
      <div
        aria-label="The same word twice: size-derived tracking versus one fixed value"
        className="relative mx-auto flex aspect-[1344/520] w-full select-none items-center justify-center overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)]"
      >
        <OpticalTypeDemo />
      </div>

      <div className="flex min-w-0 flex-col gap-14">
        <div className="flex flex-col gap-3">
          <p className="text-pretty text-[var(--text-primary)]">
            The quietest chapter of the apple-design skill, and the one type people care most about: tracking and
            leading are size-specific. Above, the same word twice — the top line derives its letter-spacing and
            line-height from the current size every frame; the bottom line is stuck with one fixed letter-spacing, the
            way most stylesheets ship. Watch the size breathe: at caption sizes both read fine, but as the type grows
            the fixed line drifts apart while the optical line tightens and holds together. A fixed value is wrong
            somewhere, always.
          </p>
          <p className="text-pretty text-[var(--text-primary)]">
            Drag horizontally across the canvas to drive the size yourself. Below, the slider pins an exact size, and
            you can change which fixed tracking value the bottom line is stuck with — try a "safe" 0 and watch it go
            loose anyway.
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <header className="flex items-center justify-between gap-3 pb-2 border-b border-[var(--border-line)]">
            <h2 className="font-semibold text-[var(--text-primary)]">Implementation</h2>
            <div className="flex items-center gap-2">
              <ChipButton onClick={() => { setSize(Number.NaN); controls.breathe?.() }}>Breathe</ChipButton>
              <ChipButton onClick={() => { setSize(Number.NaN); controls.reset?.() }}>Reset</ChipButton>
            </div>
          </header>
          <div className="relative z-10 overflow-hidden rounded-xl border border-[var(--border-line)] min-h-[160px] sm:min-h-[190px] bg-[var(--bg-page)]">
            <OpticalTypeDemo sizeOverride={size} fixedTrack={fixedTrack} controls={controls} />
          </div>
          <div className="-mt-5 flex min-w-0 flex-col rounded-b-xl border border-t-0 border-[var(--border-line)] bg-[var(--bg-surface)] p-4 pt-8 gap-3.5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <SliderChip
                label="Size"
                min={14}
                max={88}
                value={Number.isNaN(size) ? 48 : size}
                format={(v) => `${Math.round(v)} px`}
                onChange={(v) => setSize(Math.round(v))}
              />
              <SliderChip
                label="Fixed track"
                min={-0.02}
                max={0.05}
                value={fixedTrack}
                format={(v) => `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(3)} em`}
                onChange={(v) => setFixedTrack(Math.round(v * 1000) / 1000)}
              />
            </div>
          </div>
        </div>

        <section className="flex min-w-0 flex-col gap-3">
          <header className="flex items-center justify-between gap-3 pb-2 border-b border-[var(--border-line)]">
            <h2 className="font-semibold text-[var(--text-primary)]">Code</h2>
            <CopyPromptChip text={assembleCopy(BUILD_PROMPT, [{ name: 'OpticalTypeDemo.tsx', code: typeSrc }])} />
          </header>
          <CodeTabs tabs={CODE_TABS} />
        </section>

        <CreditRows
          rows={[
            ['Company', 'CAGGIANO'],
            ['Date', 'Jul 12, 2026'],
            ['Tags', 'Typography, Tracking, Leading'],
          ]}
        />

        <p className="mt-2 text-center text-[12px] text-[var(--text-tertiary)]">
          <a
            href="https://opensource.org/licenses/MIT"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-[var(--border-line)] underline-offset-2 transition-colors duration-150 hover:text-[var(--text-secondary)]"
          >
            MIT
          </a>{' '}
          → free to copy
        </p>
      </div>
      <div aria-hidden="true" className="h-16" />
    </DetailShell>
  )
}
