import { useEffect, useRef } from 'react'

/* Web replay of the Meeting Overlay's state machine, driven by the project's
   real sprite strips (clawd_walk.png: 4 walk + 4 blink frames; clawd_idle.png:
   3 standing/glass-raise frames; 410x414 each). Same sequence as the desktop
   app: WALK_IN → BUBBLE_POP (3 discrete steps) → HOLD (glass raise) →
   BUBBLE_DISMISS → WALK_OUT. The bubble is drawn in code from fat pixels so
   it stretches to any meeting name. */

const FRAME_W = 410
const FRAME_H = 414
const STEP_MS = 160 // walk cadence from the reference video
const BLINK_EVERY_MS = 3000
const BLINK_MS = 150
const POP_MS = 220
const DISMISS_MS = 160
const MOTION_GRID = 3
const STOP_FRAC = 0.1
// discrete pop steps: crossing a threshold snaps the bubble to the next scale
const POP_STEPS: [number, number][] = [[0, 0.45], [0.45, 0.75], [0.85, 1]]

const U = 3 // the bubble's fat-pixel unit
const INK = '#111111'
const WHITE = '#ffffff'
const SHADOW = '#c9c9c9'
const TIME_INK = '#555555'

export interface OverlayDemoProps {
  title: string
  time: string
  holdMs?: number
  speed?: number // px/s
  spriteH?: number
  loop?: boolean
  replayKey?: number
}

type Phase = 'walkIn' | 'pop' | 'hold' | 'dismiss' | 'walkOut' | 'pause'

export function OverlayDemo({
  title,
  time,
  holdMs = 3800,
  speed = 150,
  spriteH = 50,
  loop = true,
  replayKey = 0,
}: OverlayDemoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const propsRef = useRef({ title, time, holdMs, speed, spriteH })
  propsRef.current = { title, time, holdMs, speed, spriteH }

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let raf = 0
    let phase: Phase = 'walkIn'
    let phaseStart = 0
    let ready = false

    const walkSheet = new Image()
    walkSheet.src = '/vault/overlay/clawd_walk.png'
    const idleSheet = new Image()
    idleSheet.src = '/vault/overlay/clawd_idle.png'

    const resize = () => {
      canvas.width = canvas.clientWidth * dpr
      canvas.height = canvas.clientHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    Promise.all([
      document.fonts.load('10px "Press Start 2P"'),
      new Promise((r) => (walkSheet.complete ? r(0) : (walkSheet.onload = () => r(0)))),
      new Promise((r) => (idleSheet.complete ? r(0) : (idleSheet.onload = () => r(0)))),
    ]).finally(() => {
      ready = true
      phaseStart = performance.now()
    })

    const grid = (v: number) => Math.round(v / MOTION_GRID) * MOTION_GRID

    const wrapTitle = (text: string, maxW: number): string[] => {
      ctx.font = '10px "Press Start 2P", monospace'
      const words = text.split(' ')
      const lines: string[] = []
      let cur = ''
      for (const w of words) {
        const probe = cur ? `${cur} ${w}` : w
        if (ctx.measureText(probe).width <= maxW || !cur) cur = probe
        else { lines.push(cur); cur = w }
      }
      if (cur) lines.push(cur)
      // the bubble holds two title lines max, like the desktop app
      if (lines.length > 2) {
        lines.length = 2
        let last = lines[1]
        while (ctx.measureText(`${last}…`).width > maxW && last.length > 1) last = last.slice(0, -1)
        lines[1] = `${last}…`
      }
      return lines
    }

    /* white cross-shaped silhouette with stepped corners; drawn twice —
       shadow first (offset one unit down-right), then body + black border */
    const bubbleSilhouette = (x: number, y: number, w: number, h: number, color: string) => {
      ctx.fillStyle = color
      ctx.fillRect(x + U, y, w - 2 * U, h)
      ctx.fillRect(x, y + U, w, h - 2 * U)
    }

    const drawBubble = (headX: number, headY: number, scale: number) => {
      const { title: t, time: tm } = propsRef.current
      ctx.font = '10px "Press Start 2P", monospace'
      const maxTextW = 210 - 4 * U
      const lines = wrapTitle(t, maxTextW)
      const titleW = Math.max(...lines.map((l) => ctx.measureText(l).width), 0)
      ctx.font = '8px "Press Start 2P", monospace'
      const timeW = ctx.measureText(tm).width
      const bodyW = Math.min(210, Math.max(90, Math.max(titleW, timeW) + 4 * U))
      const lineH = 14
      const bodyH = 3 * U + lines.length * lineH + 12 + U

      const w = Math.round(bodyW * scale)
      const h = Math.round(bodyH * scale)
      const gap = 6
      const tailH = 3 * U
      const bx = Math.max(U, Math.min(headX - w * 0.28, ctx.canvas.clientWidth - w - U))
      const by = headY - gap - tailH - h

      // shadow → border → body, all from unit rects (no curves, no AA)
      bubbleSilhouette(bx + U, by + U, w + 2 * U, h + 2 * U, SHADOW)
      bubbleSilhouette(bx - U, by - U, w + 2 * U, h + 2 * U, INK)
      bubbleSilhouette(bx, by, w, h, WHITE)

      // stepped tail pointing down at the sprite's head
      const tx = grid(headX - 2 * U)
      ctx.fillStyle = INK
      ctx.fillRect(tx - U, by + h, 5 * U, U)
      ctx.fillRect(tx, by + h + U, 3 * U, U)
      ctx.fillRect(tx + U, by + h + 2 * U, U, U)
      ctx.fillStyle = WHITE
      ctx.fillRect(tx, by + h - U, 3 * U, U)
      ctx.fillRect(tx, by + h, U, U) // hollow the tail rows
      ctx.fillRect(tx + U, by + h + U, U, U)

      if (scale === 1) {
        ctx.fillStyle = INK
        ctx.font = '10px "Press Start 2P", monospace'
        ctx.textBaseline = 'top'
        ctx.textAlign = 'left'
        lines.forEach((l, i) => ctx.fillText(l, bx + 2 * U, by + 2 * U + i * lineH))
        ctx.fillStyle = TIME_INK
        ctx.font = '8px "Press Start 2P", monospace'
        ctx.fillText(tm, bx + 2 * U, by + 2 * U + lines.length * lineH + 4)
      }
    }

    const drawSprite = (sheet: HTMLImageElement, frame: number, x: number, y: number, h: number, flip: boolean) => {
      const w = h * (FRAME_W / FRAME_H)
      ctx.imageSmoothingEnabled = false
      ctx.save()
      if (flip) {
        ctx.translate(Math.round(x + w / 2), 0)
        ctx.scale(-1, 1)
        ctx.translate(-Math.round(x + w / 2), 0)
      }
      ctx.drawImage(sheet, frame * FRAME_W, 0, FRAME_W, FRAME_H, Math.round(x), Math.round(y), Math.round(w), Math.round(h))
      ctx.restore()
    }

    const render = (t: number) => {
      raf = requestAnimationFrame(render)
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      ctx.clearRect(0, 0, w, h)
      if (!ready || !walkSheet.naturalWidth) return

      const { holdMs: hold, speed: spd, spriteH: sh } = propsRef.current
      const sw = sh * (FRAME_W / FRAME_H)
      const stopX = Math.max(U, w * STOP_FRAC)
      const groundY = h - sh
      const walkDist = stopX + sw
      const walkMs = (walkDist / spd) * 1000
      const el = t - phaseStart

      const advance = (next: Phase) => { phase = next; phaseStart = t }

      let x = stopX
      let sheet = walkSheet
      let frame = 0
      let flip = false
      let bubbleScale = -1

      if (phase === 'walkIn') {
        x = grid(-sw + Math.min(1, el / walkMs) * walkDist)
        frame = Math.floor(t / STEP_MS) % 4
        if (t % BLINK_EVERY_MS < BLINK_MS) frame += 4 // blink variant of the same step
        if (el >= walkMs) advance('pop')
      } else if (phase === 'pop') {
        const p = Math.min(1, el / POP_MS)
        bubbleScale = POP_STEPS.filter(([th]) => p >= th).pop()![1]
        sheet = idleSheet
        if (el >= POP_MS) advance('hold')
      } else if (phase === 'hold') {
        bubbleScale = 1
        sheet = idleSheet
        // mostly still; raises the magnifying glass toward the bubble on a beat
        const beat = el % 2400
        frame = beat < 1600 ? 0 : beat < 1800 ? 1 : beat < 2200 ? 2 : 1
        if (el >= hold) advance('dismiss')
      } else if (phase === 'dismiss') {
        const p = Math.min(1, el / DISMISS_MS)
        bubbleScale = POP_STEPS.filter(([th]) => 1 - p >= th).pop()?.[1] ?? -1
        sheet = idleSheet
        if (el >= DISMISS_MS) advance('walkOut')
      } else if (phase === 'walkOut') {
        x = grid(stopX - Math.min(1, el / walkMs) * walkDist)
        frame = Math.floor(t / STEP_MS) % 4
        flip = true
        if (el >= walkMs) advance('pause')
      } else {
        // between runs; restart only when looping
        if (loop && el >= 1400) advance('walkIn')
        return
      }

      // small step-bob while walking
      const bob = phase === 'walkIn' || phase === 'walkOut' ? (Math.floor(t / STEP_MS) % 2) * -2 : 0
      drawSprite(sheet, frame, x, groundY + bob, sh, flip)
      if (bubbleScale > 0) drawBubble(x + sw * 0.5, groundY, bubbleScale)
    }
    raf = requestAnimationFrame(render)
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [loop, replayKey])

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
}
