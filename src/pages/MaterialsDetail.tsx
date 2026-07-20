import { useRef, useState } from 'react'
import { MaterialsDemo, type MaterialsControls } from '../demos/MaterialsDemo'
import { ChipButton, ControlsSection, CopyPromptChip, SliderChip, CodeTabs, CreditRows, DetailShell, assembleCopy } from './detail-kit'
import materialsSrc from '../demos/MaterialsDemo.tsx?raw'

/* Skill card: the apple-design skill's materials chapter, in the minimal
   register — one glossy sky-blue pill on a quiet gray surface. */

const BUILD_PROMPT = `Build this: a minimal glass pill button — one glossy sky-blue capsule with a white up-arrow, centered on a quiet light-gray surface, the way Apple crops a single control in close-up.

Core requirements:
- The scene is almost nothing: a light gray ground (#e2e3e6), the corner of a big white-stroked card (4px white border, one large rounded corner visible bottom-right, interior #eceded), and a 3px white hairline divider near the top with a slightly cooler band above it. No other content.
- The pill, layered on one capsule element (roughly 152x96, fully rounded):
  1. Fill: stacked radial gradients — a saturated sky-blue core (#5cb1e6 to #79c3f0) with two soft white blooms at the lower-left and upper-right ends, so the surface reads curved.
  2. Rim: a 3px gradient ring (conic white-to-pale-blue, masked to the border with mask-composite: exclude) — bright white arcs at the top-left and bottom-right curves where the glass edge catches light.
  3. Depth: a 1px soft blue outline plus one gentle drop shadow (0 12px 28px, low-opacity blue-gray). It floats, barely.
  4. Sheen: a soft white radial glow (~120px) positioned under the pointer on every pointermove, fading in on hover.
  5. A "blue" veil control: a near-white overlay whose opacity runs inverse to the blue intensity, so one variable fades the pill from vivid azure to powder.
- The icon: a white up-arrow, stroked ~3px with round caps and joins, centered, with a faint blue drop shadow for lift.
- It behaves like something physical, with real springs integrated in requestAnimationFrame (stiffness = (2π/response)², mass 1):
  - Press: scale springs to 0.94 (damping ~0.6, response ~0.22) and back on release — a quick, liquid give.
  - Drag: the capsule tracks the pointer 1:1 from the grab point; on release it springs back to center (damping ~0.75, response ~0.45) inheriting the release velocity, so a throw overshoots and settles.
  - A drag must not fire the button's click.
- Fallbacks: under prefers-reduced-transparency, a flat solid blue fill; under prefers-contrast, a defined outline; under prefers-reduced-motion, no springs — states snap.

Idle behavior: the pill gives a soft press pulse every few seconds, pausing after real interaction. Nothing else moves — the design is the restraint.`

const CODE_TABS = [
  {
    file: 'pill.css',
    code: `/* The fill: a saturated core with two soft white blooms at the
   ends, so the flat capsule reads as a curved glass surface. */
.gl-btn {
  border-radius: 999px;
  background:
    radial-gradient(90% 150% at 18% 88%,
      rgba(255, 255, 255, 0.5), transparent 58%),
    radial-gradient(90% 150% at 84% 12%,
      rgba(255, 255, 255, 0.42), transparent 58%),
    radial-gradient(130% 170% at 50% 45%,
      #79c3f0 0%, #5cb1e6 55%, #9ed4f4 100%);
  box-shadow:
    0 0 0 1px rgba(110, 175, 220, 0.4),  /* soft blue outline */
    0 12px 28px rgba(120, 170, 210, 0.25); /* it floats, barely */
}

/* One variable fades vivid azure toward powder: a near-white veil
   whose opacity runs INVERSE to the blue intensity. */
.gl-btn::after {
  content: "";
  position: absolute; inset: 0; border-radius: inherit;
  background: #eaf4fb;
  opacity: calc((1 - var(--gl-blue)) * 0.75);
}`,
  },
  {
    file: 'rim.css',
    code: `/* The rim: a 3px gradient ring, masked so only the border shows.
   The conic gradient puts bright white arcs at the top-left and
   bottom-right curves — where a real glass edge catches light.
   This ring is what separates "glass" from "blue pill". */
.gl-rim {
  position: absolute; inset: 0; border-radius: inherit;
  padding: 3px; /* ring thickness */
  background: conic-gradient(
    from 210deg,
    rgba(255, 255, 255, 0.98) 0deg,
    rgba(140, 200, 240, 0.35) 80deg,
    rgba(255, 255, 255, 0.95) 170deg,
    rgba(140, 200, 240, 0.3) 260deg,
    rgba(255, 255, 255, 0.98) 360deg
  );
  /* keep only the 3px border of the gradient */
  mask: linear-gradient(#fff 0 0) content-box,
        linear-gradient(#fff 0 0);
  mask-composite: exclude;
  opacity: var(--gl-edge);
}

/* The sheen lives under the pointer — the glass responds to where
   you are before you even press it. */
.gl-btn:hover .gl-spec { opacity: var(--gl-gloss); }`,
  },
  {
    file: 'springs.ts',
    code: `// Three springs make the pill feel physical:
// x/y bring a dragged capsule home; ss is the press "give".
const sx = { x: 0, v: 0, target: 0 }
const sy = { x: 0, v: 0, target: 0 }
const ss = { x: 1, v: 0, target: 1 }

// press: quick and liquid (damping 0.6, response 0.22)
btn.addEventListener('pointerdown', (e) => {
  btn.setPointerCapture(e.pointerId)
  ss.target = 0.94          // the glass gives under the finger
  grabDX = e.clientX - sx.x // respect where they grabbed
  sx.v = 0; sy.v = 0        // grab mid-flight: spring resumes from HERE
})

// release: spring home with the throw's velocity (damping 0.75)
btn.addEventListener('pointerup', () => {
  ss.target = 1
  sx.target = 0; sy.target = 0
  sx.v = releaseVX          // velocity handoff — a throw overshoots
  sy.v = releaseVY          // and settles, like something with mass
})

// every frame
step(sx, dt, 0.75, 0.45)
step(sy, dt, 0.75, 0.45)
step(ss, dt, 0.6, 0.22)
btn.style.transform =
  \`translate3d(\${sx.x}px, \${sy.x}px, 0) scale(\${ss.x})\``,
  },
]

export function MaterialsDetail() {
  const [blue, setBlue] = useState(0.75)
  const [edge, setEdge] = useState(0.9)
  const [gloss, setGloss] = useState(0.8)
  const controls = useRef<MaterialsControls>({}).current

  return (
    <DetailShell title="Frosted materials">
      <div className="flex min-w-0 flex-col gap-14">
        <div className="flex min-w-0 flex-col gap-6">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="relative z-10 overflow-hidden rounded-xl border border-[var(--border-line)] min-h-[160px] sm:min-h-[190px]">
            <MaterialsDemo blue={blue} edge={edge} gloss={gloss} controls={controls} />
          </div>
        </div>

        <ControlsSection actions={(
          <>
            <ChipButton onClick={() => controls.pulse?.()}>Pulse</ChipButton>
            <ChipButton onClick={() => controls.reset?.()}>Reset</ChipButton>
          </>
        )}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <SliderChip label="Blue" min={0} max={1} value={blue} format={(v) => v.toFixed(2)} onChange={(v) => setBlue(Math.round(v * 100) / 100)} />
            <SliderChip label="Edge" min={0} max={1} value={edge} format={(v) => v.toFixed(2)} onChange={(v) => setEdge(Math.round(v * 100) / 100)} />
            <SliderChip label="Gloss" min={0} max={1} value={gloss} format={(v) => v.toFixed(2)} onChange={(v) => setGloss(Math.round(v * 100) / 100)} />
          </div>
        </ControlsSection>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-pretty text-[var(--text-primary)]">
            The minimal register of the materials chapter: one control, cropped close, on a surface that's almost
            nothing — a gray ground, a hairline divider, the white corner of a card. All the design lives in the pill:
            a sky-blue gradient that reads curved because of two soft white blooms, a bright rim ring where the glass
            edge catches light, and a sheen that follows your pointer. Press it and it gives; drag it anywhere and it
            springs back to center at the speed you threw it.
          </p>
          <p className="text-pretty text-[var(--text-primary)]">
            The controls above retune the three qualities that define the look — how vivid the blue is, how hard the
            edge catches light, and how strong the hover sheen glows. Everything else is restraint.
          </p>
        </div>

        <section className="flex min-w-0 flex-col gap-3">
          <header className="flex items-center justify-between gap-3 pb-2 border-b border-[var(--border-line)]">
            <h2 className="font-semibold text-[var(--text-primary)]">Code</h2>
            <CopyPromptChip text={assembleCopy(BUILD_PROMPT, [{ name: 'MaterialsDemo.tsx', code: materialsSrc }])} />
          </header>
          <CodeTabs tabs={CODE_TABS} />
        </section>

        <CreditRows
          rows={[
            ['Company', 'CAGGIANO'],
            ['Date', 'Jul 13, 2026'],
            ['Tags', 'Materials, Glass, Springs'],
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
