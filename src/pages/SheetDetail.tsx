import { useRef, useState } from 'react'
import { SheetDemo, type SheetControls } from '../demos/SheetDemo'
import { ChipButton, CopyPromptChip, CodeTabs, CreditRows, DetailShell, SliderChip, assembleCopy } from './detail-kit'
import sheetSrc from '../demos/SheetDemo.tsx?raw'

/* Skill card #2: the apple-design skill's drawer/sheet recipe. */

const BUILD_PROMPT = `Build this: a bottom sheet that feels like iOS — draggable between snap points, where the speed of the gesture decides the outcome, not the position.

Core requirements:
- One spring on the sheet's Y position (damping ~0.8, response ~0.3s — Apple's shipped drawer values; stiffness = (2π/response)², damping coefficient = ratio × 2 × (2π/response), mass 1), integrated in requestAnimationFrame. Never use CSS transitions for the sheet — it must be grabbable mid-flight, and springs always animate from the current on-screen value.
- Snap points: full (near the top), half, and peek (a sliver above the bottom edge). Dragging tracks the pointer 1:1 with the grab offset respected.
- Velocity decides: on release, if |velocity| exceeds ~260 px/s, commit in the flick's direction — the next snap point that way; a fast downward flick below peek dismisses the sheet entirely, even if it barely moved. Under the threshold, project the momentum (offset = (v/1000) × d / (1 − d), d ≈ 0.998) and snap to the point nearest the projected endpoint. Hand the release velocity to the spring either way so there is no seam.
- Rubber-band above the top snap: past full, apply progressive resistance — offset = (overshoot × height × 0.55) / (height + 0.55 × |overshoot|). Downward is free; that's the dismiss zone.
- The background dims and pushes back as the sheet rises: derive a progress value from the sheet's LIVE position each frame (0 at peek, 1 at full) and map it to a scrim opacity (~0.18 max) and a background scale (1 → 0.95, transform-origin top). Never animate the scrim separately from the sheet — they are one motion.
- Spatial consistency: the sheet enters and leaves along the same path (bottom edge), and a dismissed sheet reopens from where it left.
- Reduced motion: under prefers-reduced-motion, jump between snap points without the spring.

Idle behavior: left alone, walk the sheet through peek → half → full → dismiss → reopen every few seconds so the demo reads alive; pause the loop for a few seconds after any real interaction.`

const CODE_TABS = [
  {
    file: 'sheet.ts',
    code: `// Snap points from the container height — full / half / peek.
const snaps = () => {
  const H = box.clientHeight
  return { full: H * 0.14, half: H * 0.48, peek: H - 56, closed: H + 12 }
}

// On release: the SIGN of the velocity decides, not the position.
// A fast flick commits in its direction; slow releases project momentum
// and snap to whatever is nearest the projected endpoint.
const VELOCITY_COMMIT = 260 // px/s

if (Math.abs(v) > VELOCITY_COMMIT) {
  if (v > 0) {
    const below = order.filter((s) => s > y)
    target = below.length ? below[0] : closed  // flick past peek = dismiss
  } else {
    const above = order.filter((s) => s < y)
    target = above.length ? above[above.length - 1] : full
  }
} else {
  const projected = y + project(v)             // (v/1000)·d/(1−d)
  target = nearestSnap(projected)
}
spring.target = target
spring.v = v  // velocity handoff — no seam between finger and spring`,
  },
  {
    file: 'scrim.ts',
    code: `// The scrim and push-back are DERIVED from the sheet's live position,
// every frame — never animated as separate transitions. One gesture,
// one source of truth, three surfaces moving as a unit.
const render = (t: number) => {
  requestAnimationFrame(render)
  step(sy, dt, damping, response)   // the one spring

  const p = clamp((peek - sy.x) / (peek - full), 0, 1)

  sheet.style.transform = \`translate3d(0, \${sy.x}px, 0)\`
  scrim.style.opacity = String(maxDim * p)          // dim to focus
  bg.style.transform = \`scale(\${1 - 0.05 * p})\`   // push the page back
}

// Modal task → scrim + push-back. A parallel, non-blocking panel would
// use translucency and offset WITHOUT a scrim, so the flow isn't broken.`,
  },
  {
    file: 'gesture.ts',
    code: `sheet.addEventListener('pointerdown', (e) => {
  sheet.setPointerCapture(e.pointerId)
  dragging = true
  grabDY = e.clientY - sy.x       // respect where they grabbed
  history = [{ t: now(), y: sy.x }]
  sy.v = 0                        // grab mid-flight, spring resumes from HERE
})

sheet.addEventListener('pointermove', (e) => {
  if (!dragging) return
  let y = e.clientY - grabDY      // 1:1 the whole way through
  // rubber-band above full; downward is free — that's the dismiss zone
  if (y < full) y = full + rubberband(y - full, box.height)
  sy.x = y
  history.push({ t: now(), y })   // last ~100ms → release velocity
})`,
  },
]

export function SheetDetail() {
  const [damping, setDamping] = useState(0.8)
  const [response, setResponse] = useState(0.3)
  const [dim, setDim] = useState(0.18)
  const controls = useRef<SheetControls>({}).current

  return (
    <DetailShell title="The sheet">
      {/* hero */}
      <div
        aria-label="A draggable bottom sheet with snap points and velocity-based dismissal"
        className="relative mx-auto flex aspect-[1344/520] w-full select-none items-center justify-center overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)]"
      >
        <SheetDemo />
      </div>

      <div className="flex min-w-0 flex-col gap-14">
        <div className="flex flex-col gap-3">
          <p className="text-pretty text-[var(--text-primary)]">
            The interaction everyone knows from iOS, rebuilt from the apple-design skill's drawer recipe. Drag the sheet
            and it tracks your cursor 1:1; release, and the <em>speed</em> of your gesture decides what happens — a fast
            downward flick dismisses it even from near the top, while a slow drag to the same spot springs back to the
            nearest resting point. As the sheet rises, the content behind it dims and pushes back, all derived from one
            position so the three layers move as a single object. Past the top it rubber-bands.
          </p>
          <p className="text-pretty text-[var(--text-primary)]">
            Below you can tune Apple's shipped drawer values — damping 0.8, response 0.3s — and how hard the background
            dims. Grab the sheet mid-flight anytime; it never locks you out.
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <header className="flex items-center justify-between gap-3 pb-2 border-b border-[var(--border-line)]">
            <h2 className="font-semibold text-[var(--text-primary)]">Implementation</h2>
            <div className="flex items-center gap-2">
              <ChipButton onClick={() => controls.open?.()}>Open</ChipButton>
              <ChipButton onClick={() => controls.dismiss?.()}>Dismiss</ChipButton>
            </div>
          </header>
          <div className="relative z-10 overflow-hidden rounded-xl border border-[var(--border-line)] min-h-[160px] sm:min-h-[190px] bg-[var(--bg-page)]">
            <SheetDemo damping={damping} response={response} dim={dim} controls={controls} />
          </div>
          <div className="-mt-5 flex min-w-0 flex-col rounded-b-xl border border-t-0 border-[var(--border-line)] bg-[var(--bg-surface)] p-4 pt-8 gap-3.5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <SliderChip label="Damping" min={0.5} max={1} value={damping} format={(v) => v.toFixed(2)} onChange={(v) => setDamping(Math.round(v * 100) / 100)} />
              <SliderChip label="Response" min={0.15} max={0.6} value={response} format={(v) => `${v.toFixed(2)}s`} onChange={(v) => setResponse(Math.round(v * 100) / 100)} />
              <SliderChip label="Dim" min={0} max={0.4} value={dim} format={(v) => v.toFixed(2)} onChange={(v) => setDim(Math.round(v * 100) / 100)} />
            </div>
          </div>
        </div>

        <section className="flex min-w-0 flex-col gap-3">
          <header className="flex items-center justify-between gap-3 pb-2 border-b border-[var(--border-line)]">
            <h2 className="font-semibold text-[var(--text-primary)]">Code</h2>
            <CopyPromptChip text={assembleCopy(BUILD_PROMPT, [{ name: 'SheetDemo.tsx', code: sheetSrc }])} />
          </header>
          <CodeTabs tabs={CODE_TABS} />
        </section>

        <CreditRows
          rows={[
            ['Company', 'CAGGIANO'],
            ['Date', 'Jul 12, 2026'],
            ['Tags', 'Sheet, Gestures, Springs'],
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
