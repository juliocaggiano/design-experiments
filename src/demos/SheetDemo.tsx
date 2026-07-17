import { useEffect, useRef } from 'react'

/* Bottom sheet, per the apple-design skill's drawer recipe: one spring on Y
   (damping ~0.8, response ~0.3), snap points at peek / half / full, commit
   decided by the release velocity's SIGN (a fast flick wins even from far
   away; a slow drag snaps back), scrim + background push-back derived
   continuously from the live sheet position, rubber-band above full. */

interface Axis { x: number; v: number; target: number }

function step(s: Axis, dt: number, zeta: number, response: number) {
  const w = (2 * Math.PI) / response
  const a = -(w * w) * (s.x - s.target) - zeta * 2 * w * s.v
  s.v += a * dt
  s.x += s.v * dt
}

function project(velocity: number, decel = 0.998) {
  return ((velocity / 1000) * decel) / (1 - decel)
}

function rubberband(overshoot: number, dimension: number, c = 0.55) {
  return (overshoot * dimension * c) / (dimension + c * Math.abs(overshoot))
}

// commit in the flick's direction above this speed; otherwise snap to nearest
const VELOCITY_COMMIT = 260 // px/s

export interface SheetControls {
  open?: () => void
  dismiss?: () => void
}

export interface SheetDemoProps {
  damping?: number
  response?: number
  dim?: number
  controls?: SheetControls
}

export function SheetDemo({
  damping = 0.8,
  response = 0.3,
  dim = 0.18,
  controls,
}: SheetDemoProps) {
  const boxRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const scrimRef = useRef<HTMLDivElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const params = useRef({ damping, response, dim })
  params.current = { damping, response, dim }
  // tapping a background row summons the sheet back — assigned by the effect
  const openHalfRef = useRef<() => void>(() => {})

  useEffect(() => {
    const box = boxRef.current!
    const bg = bgRef.current!
    const scrim = scrimRef.current!
    const sheet = sheetRef.current!
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const snaps = () => {
      const H = box.clientHeight
      return { full: H * 0.14, half: H * 0.48, peek: H - 56, closed: H + 12 }
    }

    // rests at half, always — but geometry may not be laid out on the very
    // first frames, so the real position is set once the box measures
    const sy: Axis = { x: 0, v: 0, target: 0 }
    let initialized = false
    let dragging = false
    let grabDY = 0
    let dragDist = 0
    let history: { t: number; y: number }[] = []
    let lastInteraction = -1e9
    let last = performance.now()
    let raf = 0

    const render = (t: number) => {
      raf = requestAnimationFrame(render)
      const dt = Math.min(0.032, (t - last) / 1000)
      last = t
      if (!box.clientHeight) return // not laid out yet: no valid geometry
      const s = snaps()
      if (!initialized) {
        initialized = true
        sy.x = s.half
        sy.target = s.half
      }
      const { damping: z, response: r, dim: d } = params.current
      if (!dragging) {
        if (reduced) { sy.x = sy.target; sy.v = 0 }
        else { step(sy, dt, z, r) }
      }
      // scrim + push-back derive from the LIVE position, never animated apart
      const p = Math.max(0, Math.min(1, (s.peek - sy.x) / (s.peek - s.full)))
      sheet.style.transform = `translate3d(0, ${sy.x.toFixed(2)}px, 0)`
      scrim.style.opacity = String(d * p)
      bg.style.transform = `scale(${(1 - 0.05 * p).toFixed(4)})`
    }
    raf = requestAnimationFrame(render)

    const down = (e: PointerEvent) => {
      e.preventDefault()
      sheet.setPointerCapture(e.pointerId)
      dragging = true
      dragDist = 0
      lastInteraction = performance.now()
      grabDY = e.clientY - sy.x // respect where they grabbed
      history = [{ t: performance.now(), y: sy.x }]
      sy.v = 0
    }
    const move = (e: PointerEvent) => {
      if (!dragging) return
      const s = snaps()
      let y = e.clientY - grabDY
      // rubber-band above full; downward is free — that's the dismiss zone
      if (y < s.full) y = s.full + rubberband(y - s.full, box.clientHeight)
      const prev = history[history.length - 1]
      dragDist += Math.abs(y - prev.y)
      sy.x = y
      const now = performance.now()
      history.push({ t: now, y })
      while (history.length > 2 && now - history[0].t > 100) history.shift()
    }
    const up = () => {
      if (!dragging) return
      dragging = false
      lastInteraction = performance.now()
      const s = snaps()
      const a = history[0]
      const b = history[history.length - 1]
      const dt = Math.max(0.008, (b.t - a.t) / 1000)
      const v = (b.y - a.y) / dt
      const order = [s.full, s.half, s.peek]
      let target: number
      if (Math.abs(v) > VELOCITY_COMMIT) {
        // the SIGN of the velocity decides, not the position
        if (v > 0) {
          const below = order.filter((sn) => sn > sy.x + 1)
          target = below.length ? below[0] : s.closed // flick down past peek = dismiss
        } else {
          const above = order.filter((sn) => sn < sy.x - 1)
          target = above.length ? above[above.length - 1] : s.full
        }
      } else {
        // slow release: momentum projection, then nearest snap
        const proj = sy.x + project(v)
        target = order.reduce((best, sn) => (Math.abs(sn - proj) < Math.abs(best - proj) ? sn : best), order[0])
      }
      sy.target = target
      sy.v = v // velocity handoff
    }
    // a drag must not fire the surrounding link card's navigation
    const click = (e: MouseEvent) => {
      if (dragDist > 6) { e.preventDefault(); e.stopPropagation() }
    }
    sheet.addEventListener('pointerdown', down)
    sheet.addEventListener('pointermove', move)
    sheet.addEventListener('pointerup', up)
    sheet.addEventListener('pointercancel', up)
    sheet.addEventListener('click', click)
    if (controls) {
      controls.open = () => { lastInteraction = performance.now(); sy.target = snaps().half }
      controls.dismiss = () => { lastInteraction = performance.now(); sy.target = snaps().closed }
    }
    openHalfRef.current = () => { lastInteraction = performance.now(); sy.target = snaps().half }
    return () => {
      cancelAnimationFrame(raf)
      sheet.removeEventListener('pointerdown', down)
      sheet.removeEventListener('pointermove', move)
      sheet.removeEventListener('pointerup', up)
      sheet.removeEventListener('pointercancel', up)
      sheet.removeEventListener('click', click)
    }
  }, [controls])

  return (
    <div ref={boxRef} className="absolute inset-0 touch-none overflow-hidden">
      {/* background "app" content that pushes back as the sheet rises */}
      <div ref={bgRef} className="absolute inset-0 origin-top p-4 will-change-transform">
        <div className="flex flex-col gap-2.5">
          {[0.9, 0.65, 0.8, 0.5].map((w, i) => (
            <div
              key={i}
              className="flex cursor-pointer items-center gap-2.5 rounded-[10px] border border-[var(--border-line)] bg-white p-2.5 transition-colors duration-150 hover:border-[var(--border-ring)]"
              onClick={(e) => {
                // tapping a row brings the sheet back — and must not navigate the card
                e.preventDefault()
                e.stopPropagation()
                openHalfRef.current()
              }}
            >
              <span className="block h-6 w-6 shrink-0 rounded-full bg-[var(--bg-hover)]" />
              <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="block h-1.5 rounded-full bg-[var(--border-line)]" style={{ width: `${w * 100}%` }} />
                <span className="block h-1.5 w-1/3 rounded-full bg-[var(--bg-hover)]" />
              </span>
            </div>
          ))}
        </div>
      </div>
      <div ref={scrimRef} className="pointer-events-none absolute inset-0 bg-black opacity-0" />
      {/* the sheet */}
      <div
        ref={sheetRef}
        className="absolute inset-x-3 top-0 h-full cursor-grab touch-none select-none will-change-transform"
      >
        <div className="h-full rounded-t-[14px] border border-b-0 border-[var(--border-line)] bg-white shadow-[0_-6px_24px_rgba(0,0,0,0.08)]">
          <div className="mx-auto mt-2 h-1 w-9 rounded-full bg-[var(--border-line)]" />
          <div className="flex flex-col gap-2 p-4 pt-3">
            <span className="block h-2 w-1/3 rounded-full bg-[var(--text-tertiary)] opacity-40" />
            <span className="block h-1.5 w-3/4 rounded-full bg-[var(--border-line)]" />
            <span className="block h-1.5 w-2/3 rounded-full bg-[var(--border-line)]" />
            <span className="block h-1.5 w-1/2 rounded-full bg-[var(--border-line)]" />
          </div>
        </div>
      </div>
    </div>
  )
}
