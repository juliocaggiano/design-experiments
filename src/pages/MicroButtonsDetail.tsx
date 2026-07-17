import { useRef, useState } from 'react'
import { MicroButtonsDemo, type MicroButtonsControls } from '../demos/MicroButtonsDemo'
import { ChipButton, CopyPromptChip, SliderChip, CodeTabs, CreditRows, DetailShell, assembleCopy } from './detail-kit'
import buttonsSrc from '../demos/MicroButtonsDemo.tsx?raw'

/* Card: Amicro's button micro-interaction families, matched 1:1 in behavior,
   on the vault's light surfaces. */

const BUILD_PROMPT = `Build this: nine pill buttons matching the classic micro-interaction families — all HOVER-driven, plain React + CSS, no animation library.

Shared behavior:
- The pill: 36px tall, fully rounded, 13px medium label with -0.01em tracking. On hover the surface tints slightly and the button scales to 1.02; pressing scales to 0.96.
- Every icon swap rides a stiff spring feel — approximate spring(stiffness 600, damping 25) with a ~0.3s transition on cubic-bezier(0.3, 1.25, 0.5, 1) (fast, slight overshoot).
- Icons live in a fixed 16px slot as two absolutely-stacked layers; hover crossfades/transforms between them, and everything reverses on leave along the same path.
- Drive all states from one \`.hot\` class instead of :hover directly, so touch (tap = 700ms of hover), keyboard focus, an idle demo loop, and a "play all" control reuse the exact same CSS.
- Guard mouseenter behind matchMedia('(hover: hover)') so touch devices never get sticky hover states.

The families, one button each:
1. Morph ("Account") — the user silhouette crossfades to a user-with-check (emerald): outgoing scales to 0.5 and fades, incoming scales up from 0.5.
2. Sparkle ("Star on GitHub") — the idle icon lifts away (y:-15, scale 0.8) as a filled yellow star drops in from below (y:+15 → 0), then two mini stars pop in at the top corners with 0.05s and 0.1s delays, rotating from ∓45° to 0.
3. Morph ("Deploy App") — the cloud crossfades to a blue cloud-upload: outgoing scales to 0.5 and fades, incoming scales up from 0.5.
4. Morph + label ("Copy Hash") — copy icon morphs to a green check AND the label crossfades to "Copied"; the state lingers 500ms after the pointer leaves before reversing.
5. Pulse ("Sponsor") — one heartbeat on hover: scale keyframes 1 → ~1.25 → 1 over 0.4s ease-in-out, while the heart fills pink (color transition ~0.3s).
6. Rotate ("Settings") — the gear turns 180° while hovered (springy curve) and turns back on leave.
7. Shake ("Delete") — one 0.4s jiggle: y bobs 0/-2/0/-2/0 while rotating 0/-10/10/-10/0 degrees; icon and label read red while hovered.
8. Ring ("Subscribe") — the bell swaps to a ringing bell (orange) rotating in from -15° at scale 0.8, exits at +15°, and a 6px red notification dot pops in at the icon's top-right with a bouncier spring and 0.1s delay.
9. Morph ("Theme") — moon crossfades to a yellow sun, same 0.5-scale morph.

Feel knobs: expose two CSS custom properties — one that divides every duration (a global speed dial) and one added to the pulse peak. Respect prefers-reduced-motion by collapsing all transitions and animations to near-zero.

Idle demo mode: ghost-hover one button (add .hot for ~1.4s) every ~2.6s, pausing for 6s after any real interaction.`

const CODE_TABS = [
  {
    file: 'swap.css',
    code: `/* One overshoot curve approximates the spring(600, 25) feel. */
.bt-box { --bt-spring: cubic-bezier(0.3, 1.25, 0.5, 1); }

/* Icons live in a fixed 16px slot as two stacked layers; .hot swaps
   them. Everything reverses on leave along the same path. */
.bt-ic { position: relative; width: 16px; height: 16px; }
.bt-ic .i1, .bt-ic .i2 {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  transition:
    opacity calc(0.3s / var(--bt-speed)) var(--bt-spring),
    transform calc(0.3s / var(--bt-speed)) var(--bt-spring);
}

/* morph: outgoing shrinks to 0.5 and fades, incoming scales up */
.bt-morph .i2 { opacity: 0; transform: scale(0.5); }
.bt-morph.hot .i1 { opacity: 0; transform: scale(0.5); }
.bt-morph.hot .i2 { opacity: 1; transform: scale(1); }

/* copy: same morph, plus the label crossfades to "Copied" —
   both labels stacked, so the button's width never changes */
.bt-lswap .l2 { position: absolute; left: 50%; transform: translateX(-50%); opacity: 0; }
.bt.hot .bt-lswap .l1 { opacity: 0; }
.bt.hot .bt-lswap .l2 { opacity: 1; }`,
  },
  {
    file: 'families.css',
    code: `/* sparkle: star drops in from below; mini stars pop at offset
   delays, rotating from ∓45° to rest */
.bt-sparkle .i2 { opacity: 0; transform: translateY(15px) scale(0.8); }
.bt-sparkle.hot .i1 { opacity: 0; transform: translateY(-15px) scale(0.8); }
.bt-sparkle.hot .i2 { opacity: 1; transform: none; color: #eab308; }
.bt-mini.m1 { top: -12px; right: -8px; transition-delay: 0.05s; }
.bt-mini.m2 { top: -4px; left: -12px; transition-delay: 0.1s; }

/* pulse: ONE heartbeat per hover, heart fills pink */
@keyframes bt-beat { 50% { transform: scale(calc(1.13 + var(--bt-pop))); } }
.bt-pulse.hot .i1 { animation: bt-beat 0.4s ease-in-out; color: #ec4899; }
.bt-pulse.hot .i1 svg { fill: currentColor; }

/* rotate: half turn while hot, springs back on leave */
.bt-rotate.hot .bt-ic { transform: rotate(180deg); }

/* shake: one 0.4s jiggle — bob and wiggle together, red while hot */
@keyframes bt-jiggle {
  20% { transform: translateY(-2px) rotate(-10deg); }
  45% { transform: translateY(0) rotate(10deg); }
  70% { transform: translateY(-2px) rotate(-10deg); }
}
.bt-shake.hot .i1 { animation: bt-jiggle 0.4s; color: #ef4444; }
.bt-shake.hot .bt-label { color: #ef4444; }

/* ring: ringing bell rotates in from -15°, red dot pops in late
   on a bouncier curve */
.bt-ring .i2 { opacity: 0; transform: rotate(-15deg) scale(0.8); }
.bt-ring.hot .i2 { opacity: 1; transform: none; color: #f97316; }
.bt-dot {
  transform: scale(0);
  transition: transform 0.35s cubic-bezier(0.2, 1.6, 0.4, 1) 0.1s;
}
.bt-ring.hot .bt-dot { transform: scale(1); }`,
  },
  {
    file: 'hot.ts',
    code: `// One .hot class stands in for hover, so touch, keyboard focus,
// the idle loop, and Play-all all drive the SAME css states.
const enter = (n: Name) => add(n)
const leave = (n: Name) => {
  // Copy's "Copied" state lingers half a second after leave
  if (n === 'copy') later(() => remove(n), 500)
  else remove(n)
}

<button
  onMouseEnter={() => {
    // never give touch devices sticky hover states
    if (matchMedia('(hover: hover)').matches) enter(name)
  }}
  onMouseLeave={() => {
    if (matchMedia('(hover: hover)').matches) leave(name)
  }}
  onFocus={() => enter(name)}
  onBlur={() => leave(name)}
  onTouchStart={() => { enter(name); later(() => leave(name), 700) }}
/>

// idle: ghost-hover one button every ~2.6s so the card reads alive,
// standing down for 6s after any real interaction
setInterval(() => {
  if (performance.now() - lastInteraction < 6000) return
  add(next())
  later(() => remove(current), 1400)
}, 2600)`,
  },
]

export function MicroButtonsDetail() {
  const [speed, setSpeed] = useState(1)
  const [pop, setPop] = useState(0.12)
  const controls = useRef<MicroButtonsControls>({}).current

  return (
    <DetailShell title="Micro buttons">
      {/* hero */}
      <div
        aria-label="Nine pill buttons, one per micro-interaction family"
        className="relative mx-auto flex aspect-[1344/520] w-full select-none items-center justify-center overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)]"
      >
        <MicroButtonsDemo />
      </div>

      <div className="flex min-w-0 flex-col gap-14">
        <div className="flex flex-col gap-3">
          <p className="text-pretty text-[var(--text-primary)]">
            The nine ways a button can react to your pointer, matched one-to-one to Amicro — Syed Subhan's catalogue of
            micro-transitions — and rebuilt from scratch on the vault's light surfaces. Everything answers to hover:
            the account silhouette earns its check, the star drops in with two sparkles
            popping behind it, clouds and moons morph, the heart beats once and fills, the gear half-turns, the trash
            jiggles red, the bell starts ringing with a notification dot. Leave, and every one reverses along the same
            path it came in.
          </p>
          <p className="text-pretty text-[var(--text-primary)]">
            All of it is plain CSS riding one overshoot curve that stands in for the original's stiff spring, driven by
            a single class so touch, keyboard focus, and the idle loop share the exact states. Speed divides every
            duration at once; Pop raises the heartbeat's peak. Left alone, the set demos itself.
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <header className="flex items-center justify-between gap-3 pb-2 border-b border-[var(--border-line)]">
            <h2 className="font-semibold text-[var(--text-primary)]">Implementation</h2>
            <div className="flex items-center gap-2">
              <ChipButton onClick={() => controls.playAll?.()}>Play all</ChipButton>
              <ChipButton onClick={() => controls.reset?.()}>Reset</ChipButton>
            </div>
          </header>
          <div className="relative z-10 overflow-hidden rounded-xl border border-[var(--border-line)] min-h-[160px] sm:min-h-[190px] bg-[var(--bg-page)]">
            <MicroButtonsDemo speed={speed} pop={pop} controls={controls} />
          </div>
          <div className="-mt-5 flex min-w-0 flex-col rounded-b-xl border border-t-0 border-[var(--border-line)] bg-[var(--bg-surface)] p-4 pt-8 gap-3.5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <SliderChip label="Speed" min={0.4} max={2} value={speed} format={(v) => `${v.toFixed(1)}×`} onChange={(v) => setSpeed(Math.round(v * 10) / 10)} />
              <SliderChip label="Pop" min={0} max={0.3} value={pop} format={(v) => v.toFixed(2)} onChange={(v) => setPop(Math.round(v * 100) / 100)} />
            </div>
          </div>
        </div>

        <section className="flex min-w-0 flex-col gap-3">
          <header className="flex items-center justify-between gap-3 pb-2 border-b border-[var(--border-line)]">
            <h2 className="font-semibold text-[var(--text-primary)]">Code</h2>
            <CopyPromptChip text={assembleCopy(BUILD_PROMPT, [{ name: 'MicroButtonsDemo.tsx', code: buttonsSrc }])} />
          </header>
          <CodeTabs tabs={CODE_TABS} />
        </section>

        <CreditRows
          rows={[
            ['Company', 'CAGGIANO'],
            ['Date', 'Jul 14, 2026'],
            ['Tags', 'Buttons, Micro-interactions, CSS'],
            ['Reference', 'amicro.vercel.app — Syed Subhan'],
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
