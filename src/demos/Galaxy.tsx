import { useEffect, useRef } from 'react'
import { CopyPromptButton } from '../components/Card'
import { PROMPTS } from './prompts'

/* Perspective field of small images: each sits at a fixed left/top with a
   depth z; all drift vertically (parallax by depth), wrap around, fade toward
   the page background the deeper they sit. Drag pans the field. */

const IMAGES = Array.from({ length: 12 }, (_, i) => `/vault/grid/grid-${i + 1}.webp`)

// measured from the live DOM: left/top %, z depth (px under perspective)
const SLOTS: { left: number; top: number; z: number }[] = [
  { left: 5.6, top: 8.3, z: -200 },
  { left: 32.0, top: 15.1, z: -150 },
  { left: 10.4, top: 86.8, z: -100 },
  { left: 55.2, top: 12.4, z: -240 },
  { left: 74.8, top: 24.6, z: -60 },
  { left: 22.5, top: 40.2, z: -30 },
  { left: 48.9, top: 55.7, z: -120 },
  { left: 84.1, top: 62.3, z: -180 },
  { left: 64.3, top: 78.9, z: -90 },
  { left: 14.7, top: 63.5, z: -260 },
  { left: 38.6, top: 82.1, z: -40 },
  { left: 90.2, top: 42.8, z: -140 },
]

export function GalaxyCard() {
  const fieldRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const field = fieldRef.current!
    const items = Array.from(field.children) as HTMLElement[]
    let offset = 0
    let dragY = 0
    let dragging = false
    let lastY = 0
    let raf = 0

    const H = () => field.clientHeight || 1

    const render = () => {
      const h = H()
      items.forEach((el, i) => {
        const slot = SLOTS[i % SLOTS.length]
        const depth = slot.z
        // deeper images drift slower (parallax) and read smaller/dimmer
        const speed = 1 + depth / 400
        let y = (offset * speed + dragY * speed) % h
        if (y < -h / 2) y += h
        if (y > h / 2) y -= h
        el.style.transform = `translate3d(0px, ${y.toFixed(2)}px, ${depth}px) scale(${(1 + depth / 700).toFixed(3)})`
      })
      offset += 0.35
      raf = requestAnimationFrame(render)
    }
    raf = requestAnimationFrame(render)

    const down = (e: PointerEvent) => { dragging = true; lastY = e.clientY; field.style.cursor = 'grabbing' }
    const move = (e: PointerEvent) => { if (dragging) { dragY += (e.clientY - lastY) * 1.4; lastY = e.clientY } }
    const up = () => { dragging = false; field.style.cursor = 'grab' }
    field.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      cancelAnimationFrame(raf)
      field.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [])

  return (
    <div className="relative block rounded-xl border border-[var(--border-line)] bg-[var(--bg-surface)] p-2 text-left">
      <div
        aria-label="Images drifting in a depth field"
        className="galaxy-card relative mx-auto aspect-[1344/620] w-full touch-pan-y select-none overflow-hidden rounded-[10px] bg-[var(--bg-page)]"
        style={{ cursor: 'grab' }}
      >
        <div
          ref={fieldRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-[-25%] h-[150%] [perspective:600px] [transform-style:preserve-3d]"
        >
          {SLOTS.map((slot, i) => (
            <div
              key={i}
              className="absolute aspect-square w-[64px] overflow-hidden will-change-transform"
              style={{ left: `${slot.left}%`, top: `${slot.top}%` }}
            >
              <img src={IMAGES[i % IMAGES.length]} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
              <div
                className="pointer-events-none absolute inset-0 bg-[var(--bg-page)]"
                style={{ opacity: Math.min(0.55, Math.abs(slot.z) / 500) }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="absolute right-4 top-4 z-20">
        <CopyPromptButton prompt={PROMPTS.galaxy} />
      </div>
    </div>
  )
}
