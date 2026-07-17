import { useEffect, useRef } from 'react'
import { LinkCard, Caption } from '../components/Card'

/* "ab" spelled as a halftone of tiny symbols: dense maroon dots inside the
   letterforms with red hearts and dark rings sprinkled in, and a sparse
   orange dot halo breathing around them. The original runs in three.js;
   a sampled 2D canvas reads the same. */

export function SymbolsCard() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let raf = 0
    let inside: Uint8Array = new Uint8Array(0)
    let gw = 0
    let gh = 0
    const CELL = 7

    const hash = (x: number, y: number) => {
      const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
      return s - Math.floor(s)
    }

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
      octx.font = `400 ${Math.floor(h * 0.62)}px "writer", serif`
      octx.fillText('ab', w / 2, h * 0.52)
      const img = octx.getImageData(0, 0, w, h).data
      gw = Math.ceil(w / CELL)
      gh = Math.ceil(h / CELL)
      inside = new Uint8Array(gw * gh)
      for (let gy = 0; gy < gh; gy++) {
        for (let gx = 0; gx < gw; gx++) {
          const x = gx * CELL + CELL / 2
          const y = gy * CELL + CELL / 2
          if (x < w && y < h && img[((y | 0) * w + (x | 0)) * 4 + 3] > 100) inside[gy * gw + gx] = 1
        }
      }
    }

    const render = (t: number) => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      ctx.clearRect(0, 0, w, h)
      const time = t / 1000
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const cx = w / 2
      const cy = h / 2
      for (let gy = 0; gy < gh; gy++) {
        for (let gx = 0; gx < gw; gx++) {
          const x = gx * CELL + CELL / 2
          const y = gy * CELL + CELL / 2
          const rnd = hash(gx, gy)
          const isIn = inside[gy * gw + gx] === 1
          if (isIn) {
            const tw = 0.5 + 0.5 * Math.sin(time * 2 + rnd * 6.28)
            if (rnd < 0.08) {
              // occasional symbol: heart or ring
              ctx.font = '8px "neueMono", monospace'
              ctx.fillStyle = rnd < 0.03 ? '#3b3b3b' : '#e33d2b'
              ctx.fillText(rnd < 0.03 ? 'O' : '♥', x, y)
            } else {
              ctx.fillStyle = `rgba(74, 26, 24, ${0.55 + 0.35 * tw})`
              ctx.fillRect(x - 1, y - 1, 2, 2)
            }
          } else {
            // sparse breathing halo around the word
            const ex = (x - cx) / (w * 0.34)
            const ey = (y - cy) / (h * 0.42)
            const d = ex * ex + ey * ey
            if (d < 1 && rnd > 0.72) {
              const breathe = 0.5 + 0.5 * Math.sin(time * 1.5 + rnd * 6.28 + d * 3)
              ctx.fillStyle = `rgba(240, 120, 60, ${(1 - d) * 0.55 * breathe})`
              ctx.fillRect(x - 0.75, y - 0.75, 1.5, 1.5)
            }
          }
        }
      }
      raf = requestAnimationFrame(render)
    }

    document.fonts.load('400 60px "writer"').finally(build)
    raf = requestAnimationFrame(render)
    const ro = new ResizeObserver(build)
    ro.observe(canvas)
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [])

  return (
    <LinkCard href="/vault/sandbox">
      <div className="aspect-video w-full overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-white">
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>
      <Caption title="Symbols effect" category="Motion" />
    </LinkCard>
  )
}
