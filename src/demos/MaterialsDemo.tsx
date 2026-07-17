import { useEffect, useRef } from 'react'

/* The glass pill — minimal and light: a gray surface with a hairline divider
   and the white corner of a card, and one glossy sky-blue capsule centered
   on it, white up-arrow inside. The material is layered — soft blue gradient
   fill, a bright rim ring where the glass edge catches light, a sheen that
   follows the pointer. Press it and it gives like something physical; drag
   it anywhere and it springs back to center at the speed you threw it. */

interface Axis { x: number; v: number; target: number }

function step(s: Axis, dt: number, zeta: number, response: number) {
  const w = (2 * Math.PI) / response
  const a = -(w * w) * (s.x - s.target) - zeta * 2 * w * s.v
  s.v += a * dt
  s.x += s.v * dt
}

export interface MaterialsControls {
  pulse?: () => void
  reset?: () => void
}

export interface MaterialsDemoProps {
  blue?: number // fill intensity 0..1
  edge?: number // rim opacity 0..1
  gloss?: number // pointer sheen strength 0..1
  ambient?: boolean
  controls?: MaterialsControls
}

export function MaterialsDemo({
  blue = 0.75,
  edge = 0.9,
  gloss = 0.8,
  ambient = true,
  controls,
}: MaterialsDemoProps) {
  const boxRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const specRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const box = boxRef.current!
    const btn = btnRef.current!
    const spec = specRef.current!
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // three springs: x/y bring the dragged pill home, ss is the press give
    const sx: Axis = { x: 0, v: 0, target: 0 }
    const sy: Axis = { x: 0, v: 0, target: 0 }
    const ss: Axis = { x: 1, v: 0, target: 1 }
    let dragging = false
    let grabDX = 0
    let grabDY = 0
    let dragDist = 0
    let history: { t: number; x: number; y: number }[] = []
    let lastInteraction = -1e9
    let lastAmbient = 0
    let last = performance.now()
    let raf = 0

    const render = (t: number) => {
      raf = requestAnimationFrame(render)
      const dt = Math.min(0.032, (t - last) / 1000)
      last = t
      if (!reduced) {
        if (!dragging) {
          step(sx, dt, 0.75, 0.45) // going home carries a little bounce
          step(sy, dt, 0.75, 0.45)
        }
        step(ss, dt, 0.6, 0.22) // the press give is quick and springy
        // idle: a soft press pulse so the feed card reads alive
        if (ambient && t - lastInteraction > 6000 && t - lastAmbient > 3600) {
          lastAmbient = t
          ss.x = 0.95
          ss.v = 0.5
        }
      } else {
        sx.x = sx.target; sy.x = sy.target; ss.x = ss.target
        sx.v = 0; sy.v = 0; ss.v = 0
      }
      btn.style.transform = `translate3d(${sx.x.toFixed(2)}px, ${sy.x.toFixed(2)}px, 0) scale(${ss.x.toFixed(4)})`
    }
    raf = requestAnimationFrame(render)

    const down = (e: PointerEvent) => {
      e.preventDefault()
      btn.setPointerCapture(e.pointerId)
      dragging = true
      dragDist = 0
      lastInteraction = performance.now()
      grabDX = e.clientX - sx.x // respect where they grabbed
      grabDY = e.clientY - sy.x
      history = [{ t: performance.now(), x: sx.x, y: sy.x }]
      sx.v = 0
      sy.v = 0
      ss.target = 0.94 // the glass gives under the finger
      btn.style.cursor = 'grabbing'
    }
    const move = (e: PointerEvent) => {
      // the sheen follows the pointer whether or not we're dragging
      const br = btn.getBoundingClientRect()
      spec.style.left = `${e.clientX - br.left}px`
      spec.style.top = `${e.clientY - br.top}px`
      if (!dragging) return
      const x = e.clientX - grabDX
      const y = e.clientY - grabDY
      const prev = history[history.length - 1]
      dragDist += Math.hypot(x - prev.x, y - prev.y)
      sx.x = x
      sy.x = y
      const now = performance.now()
      history.push({ t: now, x, y })
      while (history.length > 2 && now - history[0].t > 100) history.shift()
    }
    const up = () => {
      if (!dragging) return
      dragging = false
      lastInteraction = performance.now()
      ss.target = 1
      btn.style.cursor = 'grab'
      // spring home from wherever it is, at the speed it was released
      const a = history[0]
      const b = history[history.length - 1]
      const dt = Math.max(0.008, (b.t - a.t) / 1000)
      sx.target = 0
      sy.target = 0
      sx.v = (b.x - a.x) / dt
      sy.v = (b.y - a.y) / dt
    }
    const click = (e: MouseEvent) => {
      if (dragDist > 6) { e.preventDefault(); e.stopPropagation() } // a drag is not a click
    }
    btn.addEventListener('pointerdown', down)
    box.addEventListener('pointermove', move)
    btn.addEventListener('pointerup', up)
    btn.addEventListener('pointercancel', up)
    btn.addEventListener('click', click)
    if (controls) {
      controls.pulse = () => { lastInteraction = performance.now(); ss.x = 0.92; ss.v = 0.8 }
      controls.reset = () => { lastInteraction = performance.now(); sx.target = 0; sy.target = 0 }
    }
    return () => {
      cancelAnimationFrame(raf)
      btn.removeEventListener('pointerdown', down)
      box.removeEventListener('pointermove', move)
      btn.removeEventListener('pointerup', up)
      btn.removeEventListener('pointercancel', up)
      btn.removeEventListener('click', click)
    }
  }, [ambient, controls])

  return (
    <div
      ref={boxRef}
      className="gl-box"
      style={{
        ['--gl-blue' as string]: blue,
        ['--gl-edge' as string]: edge,
        ['--gl-gloss' as string]: gloss,
      }}
    >
      {/* the minimal scene: a card corner and a hairline divider */}
      <div className="gl-card" aria-hidden="true">
        <div className="gl-topband" />
      </div>
      <button ref={btnRef} type="button" className="gl-btn" aria-label="Scroll to top">
        <span ref={specRef} className="gl-spec" aria-hidden="true" />
        <span className="gl-rim" aria-hidden="true" />
        <svg className="gl-arrow" width="38" height="38" viewBox="0 0 34 34" fill="none" stroke="#fff" strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M17 27V8" />
          <path d="M8.5 16 17 7.5 25.5 16" />
        </svg>
      </button>
    </div>
  )
}
