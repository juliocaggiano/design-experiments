import { useRef, useState } from 'react'
import { FluidSpringDemo, type SpringControls } from '../demos/FluidSpring'
import { ChipButton, CopyPromptChip, SliderChip, CodeTabs, CreditRows, DetailShell, assembleCopy } from './detail-kit'
import springSrc from '../demos/FluidSpring.tsx?raw'

/* Skill card: the apple-design skill's motion recipes as a demo you can grab. */

const BUILD_PROMPT = `Build this: a draggable card inside a bounded canvas that behaves like a fluid, physical object — Apple-style spring motion for the web, with no animation library.

Core requirements:
- Direct manipulation: on pointerdown, capture the pointer and track the card 1:1 with the cursor, respecting the offset where it was grabbed (never snap to center). Keep a short history of the last ~100ms of pointer positions for velocity.
- Springs, not tweens: animate position with a damped spring integrated in requestAnimationFrame. Parameterize it the way Apple does — damping ratio (1.0 = no overshoot, ~0.8 = slight bounce for momentum gestures) and response (seconds, ~0.3–0.4). Stiffness = (2π/response)²; damping coefficient = ratio × 2 × (2π/response), mass 1. Run X and Y as independent springs.
- Interruptibility: the card must be grabbable mid-flight. Springs make this natural because they always run from the current on-screen value — on grab, zero the velocity and hand control to the pointer; never lock input during motion.
- Velocity handoff: on release, compute velocity from the position history and pass it to the spring as its initial velocity, so the animation continues at the finger's exact speed with no seam.
- Momentum projection: don't snap to the nearest target from the release point — project where the flick is going with exponential decay, projectedOffset = (v/1000) × d / (1 − d) with d ≈ 0.998, then spring to the snap point nearest that projected endpoint.
- Rubber-banding: past the canvas bounds, resist progressively instead of stopping — offset = (overshoot × dimension × 0.55) / (dimension + 0.55 × |overshoot|).
- Reduced motion: under prefers-reduced-motion, skip the springs and place the card at its target directly.

Idle behavior: every ~3 seconds, flick the card programmatically to a random corner (inject an initial velocity toward it) so the demo reads alive without interaction. Pause the idle loop for a few seconds after any real interaction.`

const CODE_TABS = [
  {
    file: 'spring.ts',
    code: `// Apple's designer-facing params → physics: ω = 2π/response, mass 1
// damping 1.0 = critically damped (no overshoot); ~0.8 = momentum bounce
interface Axis { x: number; v: number; target: number }

function step(s: Axis, dt: number, zeta: number, response: number) {
  const w = (2 * Math.PI) / response
  const a = -(w * w) * (s.x - s.target) - zeta * 2 * w * s.v
  s.v += a * dt
  s.x += s.v * dt
}

// X and Y are independent springs — one spring on the 2D distance
// desyncs when the axes carry different velocities.
const render = (t: number) => {
  requestAnimationFrame(render)
  const dt = Math.min(0.032, (t - last) / 1000)
  step(sx, dt, damping, response)
  step(sy, dt, damping, response)
  chip.style.transform =
    \`translate3d(\${sx.x}px, \${sy.x}px, 0)\`
}`,
  },
  {
    file: 'projection.ts',
    code: `// Where is the flick GOING? Exponential-decay momentum projection —
// the same deceleration model as scroll, not the physics-textbook v²/2a.
function project(velocity: number, decel = 0.998) {
  return ((velocity / 1000) * decel) / (1 - decel)
}

// Snap to the corner nearest the PROJECTED endpoint, not the release point,
// then hand the spring the release velocity so there's no seam.
const [tx, ty] = nearestCorner(
  sx.x + project(vx, decel),
  sy.x + project(vy, decel),
)
sx.target = tx; sx.v = vx
sy.target = ty; sy.v = vy

// Soft boundaries: progressive resistance, never a hard stop.
function rubberband(overshoot: number, dimension: number, c = 0.55) {
  return (overshoot * dimension * c) / (dimension + c * Math.abs(overshoot))
}`,
  },
  {
    file: 'drag.ts',
    code: `chip.addEventListener('pointerdown', (e) => {
  chip.setPointerCapture(e.pointerId)   // tracking survives leaving bounds
  dragging = true
  // respect where they grabbed it — snapping to center breaks the illusion
  grabDX = e.clientX - box.left - sx.x
  grabDY = e.clientY - box.top - sy.x
  sx.v = 0; sy.v = 0                    // grab mid-flight: kill velocity,
  history = [{ t: now(), x: sx.x, y: sy.x }]  // spring resumes from HERE
})

chip.addEventListener('pointermove', (e) => {
  if (!dragging) return
  let x = e.clientX - box.left - grabDX  // 1:1 the whole way through
  if (x < min) x = min + rubberband(x - min, box.width)
  if (x > max) x = max + rubberband(x - max, box.width)
  sx.x = x
  history.push({ t: now(), x })          // last ~100ms → release velocity
})`,
  },
]

export function FluidSpringsDetail() {
  const [damping, setDamping] = useState(0.8)
  const [response, setResponse] = useState(0.4)
  const [decel, setDecel] = useState(0.998)
  const controls = useRef<SpringControls>({}).current

  return (
    <DetailShell title="Fluid springs">
      {/* hero */}
      <div
        aria-label="A draggable card that springs, flicks, and rubber-bands"
        className="relative mx-auto flex aspect-[1344/520] w-full select-none items-center justify-center overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)]"
      >
        <FluidSpringDemo />
      </div>

      <div className="flex min-w-0 flex-col gap-14">
        <div className="flex flex-col gap-3">
          <p className="text-pretty text-[var(--text-primary)]">
            Apple's fluid-interface motion, rebuilt with no animation library. The card above is a real physical object:
            grab it — even mid-flight — and it tracks your cursor 1:1 from the exact point you grabbed. Flick it and the
            spring inherits your release velocity, projects the momentum forward, and lands on the corner the flick was
            heading to. Drag past the edges and it rubber-bands instead of stopping.
          </p>
          <p className="text-pretty text-[var(--text-primary)]">
            The recipes come from the apple-design skill — WWDC's "Designing Fluid Interfaces," translated to pointer
            events and requestAnimationFrame. Below you can tune the two parameters Apple designs with: damping
            (overshoot) and response (speed), plus the deceleration rate that decides how far a flick throws.
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <header className="flex items-center justify-between gap-3 pb-2 border-b border-[var(--border-line)]">
            <h2 className="font-semibold text-[var(--text-primary)]">Implementation</h2>
            <div className="flex items-center gap-2">
              <ChipButton onClick={() => controls.flick?.()}>Flick</ChipButton>
              <ChipButton onClick={() => controls.reset?.()}>Reset</ChipButton>
            </div>
          </header>
          <div className="relative z-10 overflow-hidden rounded-xl border border-[var(--border-line)] min-h-[160px] sm:min-h-[190px] bg-[var(--bg-page)]">
            <FluidSpringDemo damping={damping} response={response} decel={decel} controls={controls} />
          </div>
          <div className="-mt-5 flex min-w-0 flex-col rounded-b-xl border border-t-0 border-[var(--border-line)] bg-[var(--bg-surface)] p-4 pt-8 gap-3.5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <SliderChip label="Damping" min={0.5} max={1} value={damping} format={(v) => v.toFixed(2)} onChange={(v) => setDamping(Math.round(v * 100) / 100)} />
              <SliderChip label="Response" min={0.15} max={0.6} value={response} format={(v) => `${v.toFixed(2)}s`} onChange={(v) => setResponse(Math.round(v * 100) / 100)} />
              <SliderChip label="Decel" min={0.99} max={0.999} value={decel} format={(v) => v.toFixed(3)} onChange={(v) => setDecel(Math.round(v * 1000) / 1000)} />
            </div>
          </div>
        </div>

        <section className="flex min-w-0 flex-col gap-3">
          <header className="flex items-center justify-between gap-3 pb-2 border-b border-[var(--border-line)]">
            <h2 className="font-semibold text-[var(--text-primary)]">Code</h2>
            <CopyPromptChip text={assembleCopy(BUILD_PROMPT, [{ name: 'FluidSpring.tsx', code: springSrc }])} />
          </header>
          <CodeTabs tabs={CODE_TABS} />
        </section>

        <CreditRows
          rows={[
            ['Company', 'CAGGIANO'],
            ['Date', 'Jul 12, 2026'],
            ['Tags', 'Springs, Gestures, Motion'],
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
