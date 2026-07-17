import { useEffect, useRef } from 'react'
import { CopyPromptButton } from '../components/Card'
import { PROMPTS } from './prompts'

/* Wordmark as a dense grid of square tiles, barely visible at rest. A slow
   color wave wanders across lighting tiles up; the cursor brushes a soft
   light blob. Word rasterized offscreen and sampled per tile. */

export function TilesCard() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    let raf = 0
    let tiles: { x: number; y: number }[] = []
    const mouse = { x: -9999, y: -9999 }
    const CELL = 4

    const build = () => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      canvas.width = w
      canvas.height = h
      const off = document.createElement('canvas')
      off.width = w
      off.height = h
      const octx = off.getContext('2d')!
      octx.fillStyle = '#000'
      octx.textAlign = 'center'
      octx.textBaseline = 'middle'
      octx.font = `500 ${Math.floor(h * 0.42)}px "pangram", sans-serif`
      octx.fillText('humandelta <3', w / 2, h * 0.5)
      const img = octx.getImageData(0, 0, w, h).data
      tiles = []
      for (let y = 0; y < h; y += CELL) {
        for (let x = 0; x < w; x += CELL) {
          if (img[(y * w + x) * 4 + 3] > 100) tiles.push({ x, y })
        }
      }
    }

    const render = (t: number) => {
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)
      const time = t / 1000
      // wandering light blob
      const bx = w * (0.5 + 0.38 * Math.sin(time * 0.4))
      const by = h * (0.5 + 0.25 * Math.cos(time * 0.53))
      for (const tile of tiles) {
        // resting tiles: extremely light gray, just visible on #fcfcfc
        let l = 0.055
        let hue = 230
        let sat = 6
        const dWave = Math.hypot(tile.x - bx, tile.y - by)
        if (dWave < 90) {
          const k = 1 - dWave / 90
          l += k * 0.5
          hue = 230 + Math.sin(time + tile.x * 0.02) * 30
          sat = 45
        }
        const dm = Math.hypot(tile.x - mouse.x, tile.y - mouse.y)
        if (dm < 70) {
          const k = 1 - dm / 70
          l += k * 0.55
          sat = 55
        }
        ctx.fillStyle = `hsla(${hue}, ${sat}%, ${45}%, ${Math.min(0.9, l)})`
        ctx.fillRect(tile.x, tile.y, CELL - 1, CELL - 1)
      }
      raf = requestAnimationFrame(render)
    }

    document.fonts.load('500 40px "pangram"').finally(build)
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
      <div className="relative mx-auto aspect-[1344/420] w-full select-none overflow-hidden rounded-[12px] bg-[var(--bg-page)]">
        <canvas ref={canvasRef} className="pointer-events-auto absolute inset-0 block h-full w-full" style={{ imageRendering: 'pixelated' }} />
      </div>
      <div className="absolute right-4 top-4 z-20">
        <CopyPromptButton prompt={PROMPTS.tiles} />
      </div>
    </div>
  )
}
