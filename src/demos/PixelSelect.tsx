import { useEffect, useRef } from 'react'
import { CopyPromptButton } from '../components/Card'
import { PROMPTS } from './prompts'

/* Cycle through images on a 200x250 canvas: pixelize out (chunky), swap with
   a slide + scale + skew, then pixelize back in to sharp. The pixelize trick
   is drawing into a tiny offscreen canvas and scaling it back up with
   smoothing off. */

const IMAGES = [
  '/vault/pixel/minecraft-steve.webp',
  '/vault/pixel/crafty-ideas-printable.webp',
  '/vault/pixel/minion.webp',
  '/vault/pixel/noob.webp',
  '/vault/pixel/draw-pin.webp',
  '/vault/pixel/desenho-animado-pin.webp',
]

const W = 200
const H = 250
const HOLD_MS = 2200
const PHASE_MS = 900

export function PixelSelectCard() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const off = document.createElement('canvas')
    const octx = off.getContext('2d')!
    let raf = 0
    let images: HTMLImageElement[] = []
    let idx = 0
    let phaseStart = performance.now()
    let phase: 'hold' | 'out' | 'in' = 'hold'

    const load = (src: string) =>
      new Promise<HTMLImageElement>((res) => {
        const im = new Image()
        im.onload = () => res(im)
        im.onerror = () => res(im)
        im.src = src
      })

    Promise.all(IMAGES.map(load)).then((ims) => { images = ims })

    const drawPixelated = (im: HTMLImageElement, pix: number, slide: number) => {
      ctx.clearRect(0, 0, W, H)
      if (!im.naturalWidth) return
      const scale = Math.min(W / im.naturalWidth, H / im.naturalHeight)
      const dw = im.naturalWidth * scale
      const dh = im.naturalHeight * scale
      const dx = (W - dw) / 2
      const dy = (H - dh) / 2
      ctx.save()
      // swap motion: slide + scale + skew for a hint of 3D
      ctx.translate(W / 2 + slide * W * 0.6, H / 2)
      ctx.transform(1 - Math.abs(slide) * 0.25, 0, slide * 0.35, 1 - Math.abs(slide) * 0.15, 0, 0)
      ctx.translate(-W / 2, -H / 2)
      if (pix <= 1) {
        ctx.imageSmoothingEnabled = true
        ctx.drawImage(im, dx, dy, dw, dh)
      } else {
        const tw = Math.max(2, Math.floor(dw / pix))
        const th = Math.max(2, Math.floor(dh / pix))
        off.width = tw
        off.height = th
        octx.imageSmoothingEnabled = true
        octx.clearRect(0, 0, tw, th)
        octx.drawImage(im, 0, 0, tw, th)
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(off, dx, dy, dw, dh)
      }
      ctx.restore()
    }

    const render = (t: number) => {
      raf = requestAnimationFrame(render)
      if (!images.length) return
      const el = t - phaseStart
      const im = images[idx % images.length]
      if (phase === 'hold') {
        drawPixelated(im, 1, 0)
        if (el > HOLD_MS) { phase = 'out'; phaseStart = t }
      } else if (phase === 'out') {
        const k = Math.min(1, el / PHASE_MS)
        drawPixelated(im, 1 + k * 24, k * k)
        if (k >= 1) { idx += 1; phase = 'in'; phaseStart = t }
      } else {
        const k = Math.min(1, el / PHASE_MS)
        drawPixelated(images[idx % images.length], 25 - k * 24, -(1 - k) * (1 - k))
        if (k >= 1) { phase = 'hold'; phaseStart = t }
      }
    }
    raf = requestAnimationFrame(render)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="relative block rounded-xl border border-[var(--border-line)] bg-[var(--bg-surface)] p-2 text-left">
      <div className="pixel-select relative flex items-center justify-center overflow-hidden rounded-[12px] border border-[var(--border-line)] px-4 py-4 sm:py-6 select-none">
        <div className="relative z-10 my-[-1.25rem] aspect-[.8] w-full max-w-[150px] sm:max-w-[200px]">
          <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
        </div>
      </div>
      <div className="absolute right-4 top-4 z-20">
        <CopyPromptButton prompt={PROMPTS.pixelSelect} />
      </div>
    </div>
  )
}
