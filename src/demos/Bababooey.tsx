import { useEffect, useRef } from 'react'
import { CopyPromptButton } from '../components/Card'
import { PROMPTS } from './prompts'

/* A word assembled from a spray of tiny colored blocks by a diagonal sweep,
   resting as solid serif text; the cursor lights a pool of blocks with a
   fading wake. Word rasterized offscreen, sampled to block cells. */

export function BababooeyCard() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let raf = 0
    let cells: { x: number; y: number; heat: number }[] = []
    let start = performance.now()
    let sweptOnce = false
    const mouse = { x: -9999, y: -9999 }
    const CELL = 3

    const build = () => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const off = document.createElement('canvas')
      off.width = w
      off.height = h
      const octx = off.getContext('2d')!
      octx.fillStyle = '#000'
      octx.textAlign = 'center'
      octx.textBaseline = 'middle'
      octx.font = `400 ${Math.floor(h * 0.42)}px "writer", serif`
      octx.fillText('bababooey', w / 2, h * 0.52)
      const img = octx.getImageData(0, 0, w, h).data
      cells = []
      for (let y = 0; y < h; y += CELL) {
        for (let x = 0; x < w; x += CELL) {
          if (img[(y * w + x) * 4 + 3] > 100) cells.push({ x, y, heat: 0 })
        }
      }
      // only the very first build animates the sweep; rebuilds (resize) render settled
      start = sweptOnce ? -1e9 : performance.now()
      sweptOnce = true
    }

    const SWEEP_MS = 1800
    const render = (t: number) => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      ctx.clearRect(0, 0, w, h)
      const sweep = Math.min(1.4, (t - start) / SWEEP_MS)
      for (const c of cells) {
        // diagonal assembly: cells left of the sweep band are settled
        const band = (c.x + c.y) / (w + h)
        const rel = sweep * 1.4 - band
        let color = '#1c2033'
        if (rel < 0) continue
        if (rel < 0.12) {
          // inside the band: scattered colored blocks
          const hue = (c.x * 7 + c.y * 13) % 360
          color = `hsl(${hue}, 85%, 60%)`
          ctx.fillStyle = color
          const jx = (Math.sin(c.x * 12.9 + t / 90) * (0.12 - rel)) * 90
          const jy = (Math.cos(c.y * 7.7 + t / 110) * (0.12 - rel)) * 90
          ctx.fillRect(c.x + jx, c.y + jy, CELL - 0.5, CELL - 0.5)
          continue
        }
        // cursor wake: heat lights the block, then decays slowly
        const d = Math.hypot(c.x - mouse.x, c.y - mouse.y)
        if (d < 34) c.heat = Math.min(1, c.heat + 0.5)
        c.heat *= 0.985
        if (c.heat > 0.02) {
          const hue = (c.x * 3 + c.y * 5 + t / 30) % 360
          ctx.fillStyle = `hsl(${hue}, 85%, ${45 + c.heat * 25}%)`
        } else {
          ctx.fillStyle = color
        }
        ctx.fillRect(c.x, c.y, CELL - 0.4, CELL - 0.4)
      }
      raf = requestAnimationFrame(render)
    }

    // wait for the serif face so the rasterized word uses it
    document.fonts.load('400 40px "writer"').finally(() => build())
    raf = requestAnimationFrame(render)
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      mouse.x = e.clientX - r.left
      mouse.y = e.clientY - r.top
    }
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999 }
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerleave', onLeave)
    const ro = new ResizeObserver(build)
    ro.observe(canvas)
    return () => {
      cancelAnimationFrame(raf)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
      ro.disconnect()
    }
  }, [])

  return (
    <div className="relative block rounded-xl border border-[var(--border-line)] bg-[var(--bg-surface)] p-2 text-left">
      <div
        aria-label="bababooey (pixel scan effect)"
        className="relative mx-auto flex aspect-[1344/420] w-full select-none items-center justify-center overflow-hidden rounded-[12px] bg-[#fafdff]"
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      </div>
      <div className="absolute right-4 top-4 z-20">
        <CopyPromptButton prompt={PROMPTS.bababooey} />
      </div>
    </div>
  )
}
