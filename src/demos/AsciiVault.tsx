import { useEffect, useRef } from 'react'
import { CopyPromptButton } from '../components/Card'
import { PROMPTS } from './prompts'

/* "VAULT" spelled by a field of ASCII glyphs. The word is rasterized to an
   offscreen canvas, sampled on a grid, and each hit cell becomes a glyph
   particle that jitters and is pushed away by the cursor. The original runs
   this as a GPGPU three.js sim; a 2D canvas gives the same visual. */

const GLYPHS = 'YT+|/\\-_=!;:.\'"^*'

export function AsciiVaultCard() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let raf = 0
    let particles: { x: number; y: number; ox: number; oy: number; g: string; a: number }[] = []
    const mouse = { x: -9999, y: -9999 }

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
      octx.font = `900 ${Math.floor(h * 0.72)}px "neueMontreal", sans-serif`
      // wide tracking so the five letters span the card like the original
      const word = 'VAULT'
      const track = w * 0.155
      const startX = w / 2 - track * ((word.length - 1) / 2)
      word.split('').forEach((ch, i) => octx.fillText(ch, startX + i * track, h / 2))

      const img = octx.getImageData(0, 0, w, h).data
      particles = []
      const step = 6
      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          if (img[(y * w + x) * 4 + 3] > 128 && Math.random() < 0.6) {
            particles.push({
              x, y, ox: x, oy: y,
              g: GLYPHS[(Math.random() * GLYPHS.length) | 0],
              a: 0.3 + Math.random() * 0.45,
            })
          }
        }
      }
    }

    const render = (t: number) => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      ctx.clearRect(0, 0, w, h)
      ctx.font = '8px "neueMono", monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      for (const p of particles) {
        // drift + cursor repulsion, easing home
        const jx = Math.sin(t / 900 + p.oy * 0.05) * 1.2
        const jy = Math.cos(t / 1100 + p.ox * 0.04) * 1.2
        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const d2 = dx * dx + dy * dy
        if (d2 < 3600) {
          const f = (3600 - d2) / 3600
          p.x += (dx / Math.sqrt(d2 + 0.01)) * f * 6
          p.y += (dy / Math.sqrt(d2 + 0.01)) * f * 6
        }
        p.x += (p.ox - p.x) * 0.08
        p.y += (p.oy - p.y) * 0.08
        ctx.fillStyle = `rgba(38, 40, 68, ${p.a})`
        ctx.fillText(p.g, p.x + jx, p.y + jy)
      }
      raf = requestAnimationFrame(render)
    }

    build()
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
        aria-label="VAULT, rendered as a live ASCII particle field"
        className="relative mx-auto aspect-[1344/520] w-full select-none overflow-hidden rounded-[12px] bg-[var(--bg-page)]"
      >
        <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" style={{ touchAction: 'pan-y' }} />
      </div>
      <div className="absolute right-4 top-4 z-20">
        <CopyPromptButton prompt={PROMPTS.asciiVault} />
      </div>
    </div>
  )
}
