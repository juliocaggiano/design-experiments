import { useEffect, useRef } from 'react'
import { CopyPromptButton } from '../components/Card'
import { PROMPTS } from './prompts'

/* Minecraft fire: a 16x16, 32-frame flipbook (sprite sheet) drawn as crisp
   blocks on top of a netherrack block, image-rendering pixelated. The cursor
   shoves lit pixels; the buffer heals back toward the animation. */

const FIRE_PX = 16
const FRAMES = 32
const FPS = 12

export function FireCard() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    let raf = 0
    const sheet = new Image()
    sheet.src = '/vault/fire/fire_sheet.png'
    const rack = new Image()
    rack.src = '/vault/fire/netterack.png'
    const off = document.createElement('canvas')
    off.width = FIRE_PX
    off.height = FIRE_PX
    const octx = off.getContext('2d', { willReadFrequently: true })!
    const mouse = { x: -9999, y: -9999 }
    // displacement buffer the cursor writes into; decays each frame
    const shove = new Float32Array(FIRE_PX * FIRE_PX * 2)

    const resize = () => {
      canvas.width = canvas.clientWidth
      canvas.height = canvas.clientHeight
      ctx.imageSmoothingEnabled = false
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const render = (t: number) => {
      raf = requestAnimationFrame(render)
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)
      if (!sheet.complete || !sheet.naturalWidth) return
      // block sits centered, resting on the bottom edge like the original
      const block = Math.min(w, h) * 0.58
      const px = block / FIRE_PX
      const bx = (w - block) / 2
      const rackH = block * 0.42
      // fire block bottom sits exactly on the netherrack top
      const by = h - rackH - block + px

      const frame = Math.floor((t / 1000) * FPS) % FRAMES
      // sheet is a vertical strip of 16x16 frames
      const perRow = Math.max(1, Math.floor(sheet.naturalWidth / FIRE_PX))
      const sx = (frame % perRow) * FIRE_PX
      const sy = Math.floor(frame / perRow) * FIRE_PX
      octx.clearRect(0, 0, FIRE_PX, FIRE_PX)
      octx.drawImage(sheet, sx, sy, FIRE_PX, FIRE_PX, 0, 0, FIRE_PX, FIRE_PX)
      const img = octx.getImageData(0, 0, FIRE_PX, FIRE_PX)

      // netherrack base
      if (rack.complete && rack.naturalWidth) {
        ctx.drawImage(rack, bx, h - rackH, block, rackH)
      }

      // fire pixels as crisp blocks, displaced by the cursor buffer
      const d = img.data
      for (let y = 0; y < FIRE_PX; y++) {
        for (let x = 0; x < FIRE_PX; x++) {
          const i = (y * FIRE_PX + x) * 4
          const a = d[i + 3]
          if (a < 24) continue
          const si = (y * FIRE_PX + x) * 2
          const cx = bx + x * px
          const cy = by + y * px
          const gx = cx + px / 2
          const gy = cy + px / 2
          const dist = Math.hypot(gx - mouse.x, gy - mouse.y)
          if (dist < px * 2.4) {
            shove[si] += ((gx - mouse.x) / (dist + 0.01)) * px * 0.55
            shove[si + 1] += ((gy - mouse.y) / (dist + 0.01)) * px * 0.55
          }
          shove[si] *= 0.86
          shove[si + 1] *= 0.86
          ctx.fillStyle = `rgba(${d[i]}, ${d[i + 1]}, ${d[i + 2]}, ${a / 255})`
          ctx.fillRect(Math.round(cx + shove[si]), Math.round(cy + shove[si + 1]), Math.ceil(px), Math.ceil(px))
        }
      }
    }
    raf = requestAnimationFrame(render)
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      mouse.x = (e.clientX - r.left) * (canvas.width / r.width)
      mouse.y = (e.clientY - r.top) * (canvas.height / r.height)
    }
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999 }
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <div className="relative block rounded-xl border border-[var(--border-line)] bg-[var(--bg-surface)] p-2 text-left">
      <div className="relative mx-auto aspect-[1344/520] w-full select-none overflow-hidden rounded-[12px] bg-[#f0f7ee]">
        <canvas
          ref={canvasRef}
          className="pointer-events-auto absolute inset-0 block h-full w-full"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
      <div className="absolute right-4 top-4 z-20">
        <CopyPromptButton prompt={PROMPTS.fire} />
      </div>
    </div>
  )
}
