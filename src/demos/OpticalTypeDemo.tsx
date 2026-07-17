import { useEffect, useRef } from 'react'

/* Optical typography, from the apple-design skill's type chapter: tracking
   and leading are size-specific, never one fixed value. Two copies of the
   same word breathe through the size range — the top one derives its
   letter-spacing and line-height from the current size, the bottom one keeps
   a single fixed tracking value. Watch the fixed line fall apart at display
   sizes. Scrub horizontally to drive the size yourself. */

const WORD = 'Caggiano'
const SIZE_MIN = 14
const SIZE_MAX = 88

// size-specific tracking: positive at caption sizes for legibility,
// increasingly negative as display sizes grow (letters drift apart optically)
export function opticalTracking(size: number) {
  return Math.max(-0.024, Math.min(0.02, -0.024 + 0.42 / size))
}

// leading runs inverse to size: roomy for body text, tight for display
export function opticalLeading(size: number) {
  return Math.max(1.05, Math.min(1.6, 1.1 + 6.4 / size))
}

export interface OpticalTypeControls {
  breathe?: () => void
  reset?: () => void
}

export interface OpticalTypeDemoProps {
  fixedTrack?: number // em — the single value the "fixed" line is stuck with
  sizeOverride?: number // px — set by the playground slider; NaN = ambient
  ambient?: boolean
  controls?: OpticalTypeControls
}

export function OpticalTypeDemo({
  fixedTrack = 0.02,
  sizeOverride = Number.NaN,
  ambient = true,
  controls,
}: OpticalTypeDemoProps) {
  const boxRef = useRef<HTMLDivElement>(null)
  const optRef = useRef<HTMLDivElement>(null)
  const fixRef = useRef<HTMLDivElement>(null)
  const readRef = useRef<HTMLDivElement>(null)
  const params = useRef({ fixedTrack, sizeOverride })
  params.current = { fixedTrack, sizeOverride }

  useEffect(() => {
    const box = boxRef.current!
    const opt = optRef.current!
    const fix = fixRef.current!
    const read = readRef.current!
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let manualUntil = -1e9
    let manualSize = 48
    let dragging = false
    let dragDist = 0
    let lastX = 0
    let raf = 0

    const render = (t: number) => {
      raf = requestAnimationFrame(render)
      const { fixedTrack: ft, sizeOverride: so } = params.current
      let size: number
      if (!Number.isNaN(so)) size = so
      else if (dragging || t < manualUntil || reduced) size = manualSize
      else size = (SIZE_MIN + SIZE_MAX) / 2 + ((SIZE_MAX - SIZE_MIN) / 2) * Math.sin(t / 2400)
      const track = opticalTracking(size)
      const lead = opticalLeading(size)
      // scale down if the tracked-out fixed line would overflow the box
      const fit = Math.min(1, (box.clientWidth - 32) / (WORD.length * size * (0.56 + Math.max(track, ft))))
      const s = size * fit
      opt.style.fontSize = `${s.toFixed(1)}px`
      opt.style.letterSpacing = `${track}em`
      opt.style.lineHeight = String(lead)
      fix.style.fontSize = `${s.toFixed(1)}px`
      fix.style.letterSpacing = `${ft}em`
      fix.style.lineHeight = '1.4' // the one-size-fits-nobody default
      read.textContent = `${Math.round(s)} px · ${track >= 0 ? '+' : '−'}${Math.abs(track).toFixed(3)} em · ${lead.toFixed(2)}`
    }
    raf = requestAnimationFrame(render)

    // horizontal scrub drives the size; a scrub is not a click
    const down = (e: PointerEvent) => {
      box.setPointerCapture(e.pointerId)
      dragging = true
      dragDist = 0
      lastX = e.clientX
    }
    const move = (e: PointerEvent) => {
      if (!dragging) return
      dragDist += Math.abs(e.clientX - lastX)
      lastX = e.clientX
      const r = box.getBoundingClientRect()
      const k = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
      manualSize = SIZE_MIN + k * (SIZE_MAX - SIZE_MIN)
    }
    const up = () => {
      if (!dragging) return
      dragging = false
      manualUntil = performance.now() + 4000
    }
    const click = (e: MouseEvent) => {
      if (dragDist > 6) { e.preventDefault(); e.stopPropagation() }
    }
    box.addEventListener('pointerdown', down)
    box.addEventListener('pointermove', move)
    box.addEventListener('pointerup', up)
    box.addEventListener('pointercancel', up)
    box.addEventListener('click', click)
    if (controls) {
      controls.breathe = () => { manualUntil = -1e9 }
      controls.reset = () => { manualSize = 48; manualUntil = performance.now() + 8000 }
    }
    return () => {
      cancelAnimationFrame(raf)
      box.removeEventListener('pointerdown', down)
      box.removeEventListener('pointermove', move)
      box.removeEventListener('pointerup', up)
      box.removeEventListener('pointercancel', up)
      box.removeEventListener('click', click)
    }
  }, [ambient, controls])

  return (
    <div ref={boxRef} className="absolute inset-0 flex cursor-ew-resize touch-none select-none flex-col items-start justify-center gap-4 overflow-hidden px-6">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">Optical</span>
        <div ref={optRef} className="whitespace-nowrap font-semibold text-[var(--text-primary)]">{WORD}</div>
      </div>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">Fixed</span>
        <div ref={fixRef} className="whitespace-nowrap font-semibold text-[var(--text-muted)]">{WORD}</div>
      </div>
      <div
        ref={readRef}
        className="absolute bottom-3 right-4 font-mono text-[11px] tabular-nums text-[var(--text-tertiary)]"
      />
    </div>
  )
}
