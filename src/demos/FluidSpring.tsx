import { useEffect, useRef } from 'react'

/* Fluid-springs demo, straight from the apple-design skill's playbook:
   a small card you can grab mid-flight (springs always run from the current
   on-screen value), drag 1:1 with rubber-banding past the bounds, and flick —
   release velocity is handed to the spring and momentum is projected to pick
   the landing corner. Left alone, it flicks itself so the card reads alive. */

const CHIP_W = 96
const CHIP_H = 64
const PAD = 18

interface Axis { x: number; v: number; target: number }

function step(s: Axis, dt: number, zeta: number, response: number) {
  // Apple's designer-facing params → physics: ω = 2π/response, mass 1
  const w = (2 * Math.PI) / response
  const a = -(w * w) * (s.x - s.target) - zeta * 2 * w * s.v
  s.v += a * dt
  s.x += s.v * dt
}

// momentum projection (exponential decay, not v²/2a) — where a flick lands
function project(velocity: number, decel = 0.998) {
  return ((velocity / 1000) * decel) / (1 - decel)
}

// progressive resistance past a boundary — real things slow before they stop
function rubberband(overshoot: number, dimension: number, c = 0.55) {
  return (overshoot * dimension * c) / (dimension + c * Math.abs(overshoot))
}

export interface SpringControls {
  flick?: () => void
  reset?: () => void
}

export interface FluidSpringProps {
  damping?: number
  response?: number
  decel?: number
  ambient?: boolean
  controls?: SpringControls
}

export function FluidSpringDemo({
  damping = 0.8,
  response = 0.4,
  decel = 0.998,
  ambient = true,
  controls,
}: FluidSpringProps) {
  const boxRef = useRef<HTMLDivElement>(null)
  const chipRef = useRef<HTMLDivElement>(null)
  const params = useRef({ damping, response, decel })
  params.current = { damping, response, decel }

  useEffect(() => {
    const box = boxRef.current!
    const chip = chipRef.current!
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const sx: Axis = { x: PAD, v: 0, target: PAD }
    const sy: Axis = { x: PAD, v: 0, target: PAD }
    let dragging = false
    let grabDX = 0
    let grabDY = 0
    let dragDist = 0
    let history: { t: number; x: number; y: number }[] = []
    let lastInteraction = -1e9
    let lastAmbient = 0
    let last = performance.now()
    let raf = 0

    const corners = () => {
      const w = box.clientWidth - CHIP_W - PAD
      const h = box.clientHeight - CHIP_H - PAD
      return [
        [PAD, PAD], [w, PAD], [PAD, h], [w, h],
      ] as [number, number][]
    }

    const nearestCorner = (x: number, y: number) => {
      let best: [number, number] = [PAD, PAD]
      let bd = Infinity
      for (const [cx, cy] of corners()) {
        const d = (cx - x) ** 2 + (cy - y) ** 2
        if (d < bd) { bd = d; best = [cx, cy] }
      }
      return best
    }

    const flick = (speed = 700) => {
      const cs = corners()
      const from = nearestCorner(sx.x, sy.x)
      const others = cs.filter(([cx, cy]) => cx !== from[0] || cy !== from[1])
      const [tx, ty] = others[(Math.random() * others.length) | 0]
      const d = Math.hypot(tx - sx.x, ty - sy.x) || 1
      // hand the spring an initial velocity, as if a real flick released here
      sx.v = ((tx - sx.x) / d) * speed
      sy.v = ((ty - sy.x) / d) * speed
      sx.target = tx
      sy.target = ty
    }

    const render = (t: number) => {
      raf = requestAnimationFrame(render)
      const dt = Math.min(0.032, (t - last) / 1000)
      last = t
      if (!dragging) {
        const { damping: z, response: r } = params.current
        if (reduced) {
          sx.x = sx.target; sy.x = sy.target
          sx.v = 0; sy.v = 0
        } else {
          // X and Y are independent springs — a 2D spring desyncs on unequal velocity
          step(sx, dt, z, r)
          step(sy, dt, z, r)
        }
        if (ambient && !reduced && t - lastInteraction > 6000 && t - lastAmbient > 2800) {
          lastAmbient = t
          flick(520 + Math.random() * 480)
        }
      }
      chip.style.transform = `translate3d(${sx.x.toFixed(2)}px, ${sy.x.toFixed(2)}px, 0)`
    }
    raf = requestAnimationFrame(render)

    const down = (e: PointerEvent) => {
      e.preventDefault()
      chip.setPointerCapture(e.pointerId)
      dragging = true
      lastInteraction = performance.now()
      const br = box.getBoundingClientRect()
      // respect where they grabbed it — snapping to center breaks the illusion
      grabDX = e.clientX - br.left - sx.x
      grabDY = e.clientY - br.top - sy.x
      dragDist = 0
      history = [{ t: performance.now(), x: sx.x, y: sy.x }]
      sx.v = 0
      sy.v = 0
      chip.style.cursor = 'grabbing'
    }
    const move = (e: PointerEvent) => {
      if (!dragging) return
      const br = box.getBoundingClientRect()
      const maxX = box.clientWidth - CHIP_W - PAD
      const maxY = box.clientHeight - CHIP_H - PAD
      let x = e.clientX - br.left - grabDX
      let y = e.clientY - br.top - grabDY
      // soft boundaries: track 1:1 inside, resist progressively outside
      if (x < PAD) x = PAD + rubberband(x - PAD, box.clientWidth)
      if (x > maxX) x = maxX + rubberband(x - maxX, box.clientWidth)
      if (y < PAD) y = PAD + rubberband(y - PAD, box.clientHeight)
      if (y > maxY) y = maxY + rubberband(y - maxY, box.clientHeight)
      sx.x = x
      sy.x = y
      const now = performance.now()
      const prev = history[history.length - 1]
      dragDist += Math.hypot(x - prev.x, y - prev.y)
      history.push({ t: now, x, y })
      while (history.length > 2 && now - history[0].t > 100) history.shift()
    }
    const up = () => {
      if (!dragging) return
      dragging = false
      lastInteraction = performance.now()
      chip.style.cursor = 'grab'
      // velocity over the last ~100ms of the gesture
      const a = history[0]
      const b = history[history.length - 1]
      const dt = Math.max(0.008, (b.t - a.t) / 1000)
      const vx = (b.x - a.x) / dt
      const vy = (b.y - a.y) / dt
      const { decel: d } = params.current
      // project momentum, snap to the corner nearest where the flick is GOING
      const [tx, ty] = nearestCorner(sx.x + project(vx, d), sy.x + project(vy, d))
      sx.target = tx
      sy.target = ty
      // velocity handoff — the spring continues at the finger's exact speed
      sx.v = vx
      sy.v = vy
    }
    // a drag must not fire the surrounding link card's navigation
    const click = (e: MouseEvent) => {
      if (dragDist > 6) { e.preventDefault(); e.stopPropagation() }
    }
    chip.addEventListener('pointerdown', down)
    chip.addEventListener('pointermove', move)
    chip.addEventListener('pointerup', up)
    chip.addEventListener('pointercancel', up)
    chip.addEventListener('click', click)
    if (controls) {
      controls.flick = () => { lastInteraction = performance.now(); flick(750 + Math.random() * 350) }
      controls.reset = () => { lastInteraction = performance.now(); sx.target = PAD; sy.target = PAD }
    }
    return () => {
      cancelAnimationFrame(raf)
      chip.removeEventListener('pointerdown', down)
      chip.removeEventListener('pointermove', move)
      chip.removeEventListener('pointerup', up)
      chip.removeEventListener('pointercancel', up)
      chip.removeEventListener('click', click)
    }
  }, [ambient, controls])

  return (
    <div ref={boxRef} className="absolute inset-0 touch-none">
      <div
        ref={chipRef}
        className="absolute left-0 top-0 will-change-transform select-none"
        style={{ width: CHIP_W, height: CHIP_H, cursor: 'grab' }}
      >
        <div className="flex h-full w-full flex-col justify-between rounded-[10px] border border-[var(--border-line)] bg-white p-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <span className="block h-2.5 w-2.5 rounded-full bg-[#0d99ff]" />
          <span className="flex flex-col gap-1">
            <span className="block h-1.5 w-3/4 rounded-full bg-[var(--border-line)]" />
            <span className="block h-1.5 w-1/2 rounded-full bg-[var(--border-line)]" />
          </span>
        </div>
      </div>
    </div>
  )
}
