import { useRef, useState } from 'react'
import {
  REACTIVE_DITHER_DEFAULTS,
  ReactiveDitherControlPanel,
  ReactiveDitherDemo,
  type ReactiveDitherControls,
  type ReactiveDitherSettings,
} from '../demos/ReactiveDitherDemo'
import demoSrc from '../demos/ReactiveDitherDemo.tsx?raw'
import demoCss from '../demos/ReactiveDitherDemo.css?raw'
import { ChipButton, CodeTabs, ControlsSection, CopyPromptChip, CreditRows, DetailShell, assembleCopy } from './detail-kit'

const BUILD_PROMPT = `Build a light-mode React card that renders a shaded cube-tile logo as a field of real canvas dots that react to the pointer.

Core behavior:
- Use a grayscale artwork image as the tone field: draw it full-bleed into an offscreen canvas, and for every grid point box-average the local neighborhood to descreen the artwork's own dot texture back into smooth shade. Each dot's radius follows the coverage law r = pitch × √((1 − W)/π) from the local white fraction W, quantized to a small set of pre-rendered sprite sizes — dark regions merge into near-solid black with light specks, light regions stay sparse pin dots, and gradients reproduce exactly. No SVG filter or CSS halftone: every visible dot is a real canvas dot that can move. Fall back to a flat vector approximation if the artwork fails to load.
- Track the pointer relative to the canvas in CSS pixels. An invisible circular influence field follows it with light smoothing.
- Push dots radially away from the field center: push = strength × (1 − d / R)^3, so displacement is strongest beside the pointer and decays to exactly zero at the boundary.
- Return every dot home with a damped spring (v = (v + (target − p) × stiffness) × damping) — soft, direct, and stable, never noisy or elastic.
- Render with requestAnimationFrame at devicePixelRatio-aware resolution (cap at 2), stamp dots from a pre-rendered sprite, and never touch React state inside the loop.

Behavior rules:
- The feed thumbnail and the expanded implementation share one engine and one set of visual defaults.
- The thumbnail idles with an extremely subtle drifting influence field, starts only when at least 35% visible, pauses offscreen, and yields immediately to the pointer.
- Support mouse, touch, and pen through pointer events; keep vertical page scrolling intact.
- With prefers-reduced-motion, render the settled mark once and skip the loop entirely.
- Expose dot spacing, a dot-size multiplier, interaction radius, displacement strength, return stiffness, damping, falloff intensity, invert, and reset as live light-mode controls.
- Clean up animation frames, observers, listeners, and timers on unmount, and namespace every class.`

const GUIDE_SECTIONS: readonly { title: string; body: string }[] = [
  {
    title: 'Sampling the source image',
    body: 'The mark is not redrawn — the dithered artwork itself becomes the tone field. It is drawn full-bleed into an offscreen 512 px canvas and read back with getImageData, so the implementation keeps the reference’s exact geometry, gradients, and shading instead of a vector approximation. A flat vector fallback renders only if the artwork cannot load.',
  },
  {
    title: 'Generating dot positions',
    body: 'An evenly spaced grid walks the mark’s bounding square at the chosen dot spacing. Each point box-averages its mask neighborhood — descreening the artwork’s own dot grid into a smooth local white fraction W — and takes the radius p·√((1−W)/π), quantized to one of sixteen sprite sizes. Dark regions merge into near-solid black with light specks; light regions stay sparse pin dots.',
  },
  {
    title: 'Normalizing pointer coordinates',
    body: 'Pointer events report clientX/clientY in viewport space. Subtracting the stage’s getBoundingClientRect() origin converts them to canvas CSS pixels — the same coordinate space the dots live in, and the same space the context uses after the DPR transform.',
  },
  {
    title: 'Radial displacement',
    body: 'Each frame, every dot measures its vector from the influence center. Dots inside the interaction radius R are pushed outward along that vector, so the field parts around the pointer like a bubble instead of sliding sideways.',
  },
  {
    title: 'The cubic falloff formula',
    body: 'push = strength × (1 − d / R)³. At the center (d = 0) displacement equals full strength; at the boundary (d = R) it reaches exactly zero, and the cubic curve keeps the middle gentle. The intensity control swaps the exponent — higher values concentrate motion in a tighter core.',
  },
  {
    title: 'How the spring return works',
    body: 'Displacement only moves each dot’s target; a spring does the travelling: v = (v + (target − position) × stiffness) × damping, then position += v. When the pointer leaves, targets become home positions again and the same spring glides every dot back. Damping stays high enough to settle without elastic wobble.',
  },
  {
    title: 'Canvas scaling and devicePixelRatio',
    body: 'The backing store is sized to stage × min(devicePixelRatio, 2) and the context is pre-scaled by that ratio, so all math stays in CSS pixels while dots render sharply on Retina displays. A ResizeObserver re-measures the stage and resamples the field on size changes — nothing ever stretches or blurs.',
  },
  {
    title: 'Performance safeguards',
    body: 'Dots are stamped with drawImage from a small set of pre-rendered sprites — one per quantized size — rather than thousands of arc() calls. The loop sleeps once every dot settles, an IntersectionObserver pauses it offscreen (35% visibility gate for thumbnails), integration is delta-time normalized, and no React state is touched per frame.',
  },
  {
    title: 'Reduced-motion behavior',
    body: 'Under prefers-reduced-motion the loop never starts: the field renders once in its fully settled state, the idle drift is disabled, and pointer input leaves the mark untouched. Every control still works — changes redraw the settled field immediately.',
  },
  {
    title: 'Reusable implementation example',
    body: 'The minimal engine below fits any mark: sample a mask into home positions, displace targets with the cubic falloff, then integrate the spring. Swap the artwork for your own image and tune the constants to taste.',
  },
]

const REUSABLE_EXAMPLE = `type Dot = { hx: number; hy: number; x: number; y: number; vx: number; vy: number }

// dots: sampled from an alpha mask — hx/hy is each dot's home position.
// pointer: stage-relative CSS pixels, or null when the pointer is gone.

const R = 92          // interaction radius
const strength = 30   // displacement at the field center
const stiffness = 0.08
const damping = 0.77

function frame() {
  for (const d of dots) {
    let tx = d.hx
    let ty = d.hy
    if (pointer) {
      const dx = d.hx - pointer.x
      const dy = d.hy - pointer.y
      const dist = Math.hypot(dx, dy)
      if (dist < R && dist > 0) {
        const push = strength * Math.pow(1 - dist / R, 3) // cubic falloff
        tx += (dx / dist) * push
        ty += (dy / dist) * push
      }
    }
    d.vx = (d.vx + (tx - d.x) * stiffness) * damping
    d.vy = (d.vy + (ty - d.y) * stiffness) * damping
    d.x += d.vx
    d.y += d.vy
    ctx.drawImage(dotSprite, d.x - half, d.y - half)
  }
  requestAnimationFrame(frame)
}`

export function ReactiveDitherDetail() {
  const controls = useRef<ReactiveDitherControls>({}).current
  const [settings, setSettings] = useState<ReactiveDitherSettings>(REACTIVE_DITHER_DEFAULTS)

  return (
    <DetailShell title="Liquid Dither Effect">
      <div className="flex min-w-0 flex-col gap-14">
        <div className="flex min-w-0 flex-col gap-6">
        <section className="flex min-w-0 flex-col gap-4">
          <div className="min-w-0 overflow-hidden rounded-xl border border-[var(--border-line)] bg-[var(--bg-page)]">
            <ReactiveDitherDemo chrome="stage" settings={settings} onSettingsChange={setSettings} controls={controls} />
          </div>
          <p className="text-[12px] text-[var(--text-tertiary)]">
            Move across the mark to displace it; leave and the dots settle home. Every control updates the live canvas
            immediately.
          </p>
        </section>

        <ControlsSection actions={<ChipButton onClick={() => controls.reset?.()}>Reset</ChipButton>}>
          <ReactiveDitherControlPanel settings={settings} onChange={setSettings} />
        </ControlsSection>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-pretty text-[var(--text-primary)]">
            A mark made of thousands of individual dots feels alive when it reacts to you. Move the pointer across the
            tile and the field parts around it — fast beside the pointer, gentle at the edges — then every
            dot springs home without a wobble.
          </p>
          <p className="text-pretty text-[var(--text-primary)]">
            The effect is rebuilt locally as a real canvas particle system: an offscreen mask sampled into a dot grid,
            a radial push with cubic falloff, and a damped spring return. The thumbnail and the implementation
            above run the same engine with the same visual defaults.
          </p>
        </div>

        <section className="flex min-w-0 flex-col gap-5">
          <header className="flex items-center justify-between gap-3 border-b border-[var(--border-line)] pb-2">
            <h2 className="font-semibold text-[var(--text-primary)]">How it works</h2>
          </header>

          <div className="flex flex-col gap-6">
            {GUIDE_SECTIONS.map((section, index) => (
              <article key={section.title} className="min-w-0">
                <h3 className="flex items-baseline gap-2 font-semibold text-[var(--text-primary)]">
                  <span className="font-mono text-[10px] font-normal text-[var(--text-tertiary)]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {section.title}
                </h3>
                <p className="mt-1.5 text-[13px] leading-[1.65] text-[var(--text-secondary)]">{section.body}</p>
                {index === GUIDE_SECTIONS.length - 1 ? (
                  <pre className="mt-3 overflow-x-auto rounded-xl border border-[var(--border-line)] bg-[var(--bg-surface)] p-4 font-mono text-[12px] leading-[1.7] tracking-[-0.01em] text-[var(--text-body)]">
                    {REUSABLE_EXAMPLE}
                  </pre>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className="flex min-w-0 flex-col gap-3">
          <header className="flex items-center justify-between gap-3 border-b border-[var(--border-line)] pb-2">
            <h2 className="font-semibold text-[var(--text-primary)]">Code</h2>
            <CopyPromptChip text={assembleCopy(BUILD_PROMPT, [
              { name: 'ReactiveDitherDemo.tsx', code: demoSrc },
              { name: 'ReactiveDitherDemo.css', code: demoCss },
            ])} />
          </header>
          <CodeTabs tabs={[
            { file: 'ReactiveDitherDemo.tsx', code: demoSrc },
            { file: 'ReactiveDitherDemo.css', code: demoCss },
          ]} />
        </section>

        <CreditRows
          rows={[
            ['Company', 'CAGGIANO'],
            ['Date', 'Jul 18, 2026'],
            ['Tags', 'Canvas, Particles, Motion'],
            ['Mark artwork', 'Julio Caggiano — dithered cube render'],
            ['Reference', 'Emil Kowalski — x.com/emilkowalski'],
          ]}
        />

        <p className="mt-2 text-center text-[12px] text-[var(--text-tertiary)]">
          Behavioral and visual reference:{' '}
          <a
            href="https://x.com/emilkowalski/status/2036778116748542220"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-[var(--border-line)] underline-offset-2 transition-colors duration-150 hover:text-[var(--text-secondary)]"
          >
            Reactive dither post by Emil Kowalski
          </a>
          {' · clean-room implementation, no source copied'}
        </p>
      </div>
      <div aria-hidden="true" className="h-16" />
    </DetailShell>
  )
}
