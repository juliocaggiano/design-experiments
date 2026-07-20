import { useCallback, useEffect, useRef, useState } from 'react'
import { SliderChip, SwitchChip } from '../pages/detail-kit'
import './ReactiveDitherDemo.css'

/*
 * Reactive Dither — a shaded cube-tile mark rendered as a field of real
 * canvas dots. An invisible circular influence field follows the pointer and pushes
 * nearby dots radially outward with a cubic falloff; a damped spring returns
 * every dot home. The same engine and defaults power the feed thumbnail, the
 * expanded hero, and the playground implementation.
 *
 * Clean-room recreation of the behavior in Emil Kowalski's reference post:
 * https://x.com/emilkowalski/status/2036778116748542220
 */

type Dot = {
  hx: number // home x (CSS px)
  hy: number // home y
  x: number
  y: number
  vx: number
  vy: number
  tone: number // quantized dot-size level, 0..TONE_LEVELS-1 — indexes the sprite set
}

type DitherSettings = {
  spacing: number // grid gap between dots, CSS px
  dotRadius: number // dot size multiplier — scales every quantized dot radius together
  interactionRadius: number // influence field radius, CSS px
  strength: number // maximum displacement at the field center, CSS px
  stiffness: number // spring pull toward the target per 60 fps frame
  damping: number // velocity retention per 60 fps frame
  falloff: number // displacement exponent — 3 is the reference's cubic curve
  invert: boolean
}

export type ReactiveDitherControls = {
  reset?: () => void
}

type SyncRequest = {
  resample: boolean
  sprite: boolean
}

type DitherEngine = {
  pointerMove: (x: number, y: number) => void
  pointerLeave: () => void
  syncSettings: (request: SyncRequest) => void
}

const DEFAULT_SETTINGS: DitherSettings = {
  spacing: 2.4,
  dotRadius: 0.65,
  interactionRadius: 100,
  strength: 16,
  stiffness: 0.08,
  damping: 0.77,
  falloff: 2,
  invert: false,
}

/* The artwork is drawn once into this offscreen mask and sampled by tone. */
const MARK_SOURCE_SIZE = 512
const MARK_FILL = 0.62 // mark side as a fraction of the stage's smaller edge
const IDLE_DELAY_MS = 4500 // pointer absence before the idle drift resumes
const IDLE_GAIN = 0.55 // the idle drift stays noticeably subtler than a pointer

export type ReactiveDitherSettings = DitherSettings

export const REACTIVE_DITHER_DEFAULTS: DitherSettings = DEFAULT_SETTINGS

const RANGE_CONTROLS: readonly {
  key: keyof Omit<DitherSettings, 'invert'>
  label: string
  min: number
  max: number
  step: number
  round: (value: number) => number
  format: (value: number) => string
}[] = [
  { key: 'spacing', label: 'Dot spacing', min: 2.4, max: 10, step: 0.2, round: (v) => Math.round(v * 10) / 10, format: (v) => `${v.toFixed(1)} px` },
  { key: 'dotRadius', label: 'Dot size', min: 0.6, max: 1.5, step: 0.05, round: (v) => Math.round(v * 100) / 100, format: (v) => `×${v.toFixed(2)}` },
  { key: 'interactionRadius', label: 'Interaction radius', min: 36, max: 200, step: 2, round: Math.round, format: (v) => `${Math.round(v)} px` },
  { key: 'strength', label: 'Displacement strength', min: 0, max: 80, step: 1, round: Math.round, format: (v) => `${Math.round(v)} px` },
  { key: 'stiffness', label: 'Return stiffness', min: 0.03, max: 0.26, step: 0.005, round: (v) => Math.round(v * 1000) / 1000, format: (v) => v.toFixed(3) },
  { key: 'damping', label: 'Damping', min: 0.7, max: 0.96, step: 0.005, round: (v) => Math.round(v * 1000) / 1000, format: (v) => v.toFixed(3) },
  { key: 'falloff', label: 'Falloff intensity', min: 1, max: 5, step: 0.25, round: (v) => Math.round(v * 100) / 100, format: (v) => (v === 3 ? '3 · cubic' : v.toFixed(2)) },
]

function roundedRectPath(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath()
  context.moveTo(x + radius, y)
  context.arcTo(x + width, y, x + width, y + height, radius)
  context.arcTo(x + width, y + height, x, y + height, radius)
  context.arcTo(x, y + height, x, y, radius)
  context.arcTo(x, y, x + width, y, radius)
  context.closePath()
}

/* The mark is Julio's dithered cube-tile render, used directly as the tone
 * field: drawn full-bleed into the mask, then each grid point box-averages
 * its neighborhood to descreen the artwork's own dot grid back into smooth
 * shade. Dot sizes come from an empirically calibrated coverage table (each
 * sprite level is stamped on a test grid and measured), so dark regions merge
 * into near-solid black with light specks and light regions stay sparse pin
 * dots — the reference's exact geometry, gradients, and shading with no
 * redrawn approximation. */
const MASK_ARTWORK_URL = '/vault/reactive-dither/cube-tone.png'
const MASK_SAMPLE_RADIUS = 7 // descreen window in mask px — one full dot pitch of the artwork
const TONE_LEVELS = 16 // quantized dot sizes between empty and the merging maximum
const MAX_RADIUS_RATIO = 1.5 // of the grid pitch — matches the render Julio approved: dark fields merge into near-solid black with light specks, like the reference
const MIN_DOT_RADIUS = 0.3 // CSS px; smaller dots are invisible and skipped

/* Fallback when the artwork cannot load: the same composition approximated
 * with flat regions at the luminances measured from the reference. */
const TILE = { x: 12, y: 12, size: 76, radius: 13 }
const CUBE = {
  apex: [50, 22.6],
  left: [26.8, 35.7],
  right: [73.2, 35.7],
  center: [50, 48.3],
  leftBottom: [26.8, 63.7],
  rightBottom: [73.2, 63.7],
  bottomApex: [50, 77.5],
} as const
const CARVE_WIDTH = 2.6

function fillPolygon(
  context: CanvasRenderingContext2D,
  points: readonly (readonly [number, number])[],
  u: number,
) {
  context.beginPath()
  points.forEach(([x, y], index) => {
    if (index === 0) context.moveTo(x * u, y * u)
    else context.lineTo(x * u, y * u)
  })
  context.closePath()
  context.fill()
}

function drawArtworkMask(context: CanvasRenderingContext2D, image: HTMLImageElement, size: number) {
  context.clearRect(0, 0, size, size)
  context.fillStyle = '#fff'
  context.fillRect(0, 0, size, size)
  context.drawImage(image, 0, 0, size, size)
}

function drawVectorFallback(context: CanvasRenderingContext2D, size: number) {
  const u = size / 100
  context.clearRect(0, 0, size, size)
  context.fillStyle = 'rgb(13, 13, 13)'
  roundedRectPath(context, TILE.x * u, TILE.y * u, TILE.size * u, TILE.size * u, TILE.radius * u)
  context.fill()
  context.fillStyle = 'rgb(179, 179, 179)'
  fillPolygon(context, [CUBE.right, CUBE.center, CUBE.bottomApex, CUBE.rightBottom], u)
  context.fillStyle = 'rgb(38, 38, 38)'
  fillPolygon(context, [CUBE.left, CUBE.center, CUBE.bottomApex, CUBE.leftBottom], u)
  context.fillStyle = 'rgb(110, 110, 110)'
  fillPolygon(context, [CUBE.apex, CUBE.left, CUBE.center, CUBE.right], u)
  context.globalCompositeOperation = 'destination-out'
  const edges = [
    [CUBE.apex, CUBE.left],
    [CUBE.apex, CUBE.right],
    [CUBE.left, CUBE.center],
    [CUBE.center, CUBE.right],
    [CUBE.left, CUBE.leftBottom],
    [CUBE.right, CUBE.rightBottom],
    [CUBE.center, CUBE.bottomApex],
    [CUBE.leftBottom, CUBE.bottomApex],
    [CUBE.rightBottom, CUBE.bottomApex],
  ] as const
  context.beginPath()
  for (const [[fx, fy], [tx, ty]] of edges) {
    context.moveTo(fx * u, fy * u)
    context.lineTo(tx * u, ty * u)
  }
  context.lineWidth = CARVE_WIDTH * u
  context.lineJoin = 'round'
  context.lineCap = 'round'
  context.stroke()
  context.globalCompositeOperation = 'source-over'
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])
  return reduced
}

export function ReactiveDitherDemo({
  compact = false,
  controls,
  settings: settingsProp,
  onSettingsChange,
  chrome = 'full',
}: {
  compact?: boolean
  controls?: ReactiveDitherControls
  /* Controlled mode lets a detail page mount the stage and the control panel
     as separate siblings while one engine keeps running. */
  settings?: DitherSettings
  onSettingsChange?: (next: DitherSettings) => void
  chrome?: 'full' | 'stage'
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<DitherEngine | null>(null)
  const reduced = usePrefersReducedMotion()
  const [internalSettings, setInternalSettings] = useState<DitherSettings>(DEFAULT_SETTINGS)
  const settings = settingsProp ?? internalSettings
  const updateSettings = useCallback((recipe: (current: DitherSettings) => DitherSettings) => {
    if (onSettingsChange) onSettingsChange(recipe(settingsProp ?? internalSettings))
    else setInternalSettings((current) => recipe(current))
  }, [onSettingsChange, settingsProp, internalSettings])
  const settingsRef = useRef(settings)
  const previousSettingsRef = useRef(settings)

  const reset = useCallback(() => updateSettings(() => DEFAULT_SETTINGS), [updateSettings])

  useEffect(() => {
    if (!controls) return
    controls.reset = reset
    return () => {
      delete controls.reset
    }
  }, [controls, reset])

  /* Engine lifecycle. Owns every mutable value the loop needs so the frame
   * callback never touches React state. */
  useEffect(() => {
    const stage = stageRef.current
    const canvas = canvasRef.current
    if (!stage || !canvas) return
    const context = canvas.getContext('2d')
    if (!context) return

    let disposed = false
    let raf = 0
    let sleepTimer = 0
    let running = false
    let lastTime = 0
    let width = 0
    let height = 0
    let dpr = 1
    let dots: Dot[] = []
    let sprites: ({ canvas: HTMLCanvasElement; half: number; size: number } | null)[] = []
    let spriteCoverage: number[] = []
    let visible = false
    let gain = 0
    let pointer: { x: number; y: number } | null = null
    let lastInteraction = Number.NEGATIVE_INFINITY
    const influence = { x: 0, y: 0, placed: false }

    const source = document.createElement('canvas')
    source.width = MARK_SOURCE_SIZE
    source.height = MARK_SOURCE_SIZE
    const sourceContext = source.getContext('2d', { willReadFrequently: true })
    let sourcePixels: Uint8ClampedArray | null = null
    const applyMask = (paint: (mask: CanvasRenderingContext2D) => void) => {
      if (!sourceContext || disposed) return
      paint(sourceContext)
      sourcePixels = sourceContext.getImageData(0, 0, MARK_SOURCE_SIZE, MARK_SOURCE_SIZE).data
      resample()
      if (!running) draw()
    }
    const artwork = new Image()
    artwork.onload = () => applyMask((mask) => drawArtworkMask(mask, artwork, MARK_SOURCE_SIZE))
    artwork.onerror = () => applyMask((mask) => drawVectorFallback(mask, MARK_SOURCE_SIZE))
    artwork.src = MASK_ARTWORK_URL

    const markMetrics = () => {
      const side = Math.min(width, height) * MARK_FILL
      return { cx: width / 2, cy: height / 2, side }
    }

    const resample = () => {
      dots = []
      if (!sourcePixels || width < 2 || height < 2) return
      const step = Math.max(3, settingsRef.current.spacing)
      const mark = markMetrics()
      const x0 = mark.cx - mark.side / 2
      const y0 = mark.cy - mark.side / 2
      for (let y = y0 + step / 2; y < y0 + mark.side; y += step) {
        const sy = Math.min(
          MARK_SOURCE_SIZE - 1,
          Math.max(0, Math.floor(((y - y0) / mark.side) * MARK_SOURCE_SIZE)),
        )
        for (let x = x0 + step / 2; x < x0 + mark.side; x += step) {
          const sx = Math.min(
            MARK_SOURCE_SIZE - 1,
            Math.max(0, Math.floor(((x - x0) / mark.side) * MARK_SOURCE_SIZE)),
          )
          // Box-average the neighborhood: descreens the artwork's own dot
          // grid into the local white fraction for this dot.
          let sum = 0
          let count = 0
          for (let oy = -MASK_SAMPLE_RADIUS; oy <= MASK_SAMPLE_RADIUS; oy += 1) {
            const yy = sy + oy
            if (yy < 0 || yy >= MARK_SOURCE_SIZE) continue
            for (let ox = -MASK_SAMPLE_RADIUS; ox <= MASK_SAMPLE_RADIUS; ox += 1) {
              const xx = sx + ox
              if (xx < 0 || xx >= MARK_SOURCE_SIZE) continue
              const pixel = (yy * MARK_SOURCE_SIZE + xx) * 4
              const alpha = sourcePixels[pixel + 3] / 255
              sum += 1 - alpha * (1 - sourcePixels[pixel] / 255)
              count += 1
            }
          }
          const white = count > 0 ? sum / count : 1
          // Target ink coverage for this cell; pick the sprite level whose
          // EMPIRICALLY measured coverage is closest. Theory (area law)
          // undershoots because antialiasing and overlap bleed coverage, so
          // the calibration table in spriteCoverage is the source of truth.
          const target = 1 - white
          if (target < 0.02) continue
          let level = -1
          let best = Number.POSITIVE_INFINITY
          for (let candidate = 0; candidate < sprites.length; candidate += 1) {
            if (!sprites[candidate]) continue
            const delta = Math.abs(spriteCoverage[candidate] - target)
            if (delta < best) {
              best = delta
              level = candidate
            }
          }
          if (level < 0) continue
          dots.push({ hx: x, hy: y, x, y, vx: 0, vy: 0, tone: level })
        }
      }
    }

    /* Dots are stamped from pre-rendered sprites — one per quantized size
     * level — far cheaper than an arc() call per dot per frame. Every level
     * is then calibrated empirically: stamped on a test grid and measured, so
     * sampling can pick dot sizes by the coverage the browser ACTUALLY
     * renders — theory undersizes dark tones because antialiasing and sprite
     * overlap always bleed coverage away. */
    const calibration = document.createElement('canvas')
    const measureCoverage = (sprite: { canvas: HTMLCanvasElement; half: number; size: number }, pitch: number) => {
      // Stamp a 6×6 dot grid and measure ONLY the inner 3×3 cells: dots near
      // the canvas edge clip ink that a real grid would spill into the next
      // cell, and an unstamped border would dilute the average — both bias
      // the calibration and crush every tone darker.
      const cells = 6
      const cssSize = pitch * cells
      const pixels = Math.max(8, Math.ceil(cssSize * dpr))
      calibration.width = pixels
      calibration.height = pixels
      const bench = calibration.getContext('2d', { willReadFrequently: true })
      if (!bench) return 0
      bench.setTransform(dpr, 0, 0, dpr, 0, 0)
      bench.fillStyle = '#fff'
      bench.fillRect(0, 0, cssSize, cssSize)
      for (let gy = 0; gy < cells; gy += 1) {
        for (let gx = 0; gx < cells; gx += 1) {
          bench.drawImage(sprite.canvas, (gx + 0.5) * pitch - sprite.half, (gy + 0.5) * pitch - sprite.half, sprite.size, sprite.size)
        }
      }
      const inset = Math.round(1.5 * pitch * dpr)
      const span = Math.max(1, Math.round(3 * pitch * dpr))
      const data = bench.getImageData(inset, inset, span, span).data
      let sum = 0
      for (let index = 0; index < data.length; index += 4) sum += data[index]
      return 1 - sum / (data.length / 4) / 255
    }

    const rebuildSprites = () => {
      const current = settingsRef.current
      const step = Math.max(3, current.spacing)
      sprites = []
      spriteCoverage = []
      for (let level = 0; level < TONE_LEVELS; level += 1) {
        const radius = (level / (TONE_LEVELS - 1)) * step * MAX_RADIUS_RATIO * current.dotRadius
        if (radius < MIN_DOT_RADIUS * 0.5) {
          sprites.push(null)
          spriteCoverage.push(0)
          continue
        }
        const pad = 1
        const cssSize = (radius + pad) * 2
        const spriteCanvas = document.createElement('canvas')
        spriteCanvas.width = Math.max(2, Math.ceil(cssSize * dpr))
        spriteCanvas.height = spriteCanvas.width
        const spriteContext = spriteCanvas.getContext('2d')
        if (!spriteContext) {
          sprites.push(null)
          spriteCoverage.push(0)
          continue
        }
        spriteContext.scale(dpr, dpr)
        spriteContext.fillStyle = current.invert ? '#f5f5f3' : '#000'
        spriteContext.beginPath()
        spriteContext.arc(cssSize / 2, cssSize / 2, radius, 0, Math.PI * 2)
        spriteContext.fill()
        const sprite = { canvas: spriteCanvas, half: cssSize / 2, size: cssSize }
        sprites.push(sprite)
        spriteCoverage.push(measureCoverage(sprite, step))
      }
    }

    const draw = () => {
      if (width < 2 || height < 2) return
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      context.clearRect(0, 0, width, height)
      for (let index = 0; index < dots.length; index += 1) {
        const dot = dots[index]
        const sprite = sprites[dot.tone]
        if (!sprite) continue
        context.drawImage(sprite.canvas, dot.x - sprite.half, dot.y - sprite.half, sprite.size, sprite.size)
      }
    }

    const stop = () => {
      running = false
      if (raf) {
        window.cancelAnimationFrame(raf)
        raf = 0
      }
    }

    const wake = () => {
      window.clearTimeout(sleepTimer)
      if (disposed || reduced || running || !visible) return
      running = true
      lastTime = 0
      raf = window.requestAnimationFrame(frame)
    }

    const snapHome = () => {
      for (let index = 0; index < dots.length; index += 1) {
        const dot = dots[index]
        dot.x = dot.hx
        dot.y = dot.hy
        dot.vx = 0
        dot.vy = 0
      }
    }

    const step = (now: number, dt: number) => {
      const current = settingsRef.current

      // Choose the influence target: the live pointer, or a slow Lissajous
      // drift once the pointer has been absent for a while.
      let targetX: number | null = null
      let targetY = 0
      let targetGain = 0
      if (pointer) {
        targetX = pointer.x
        targetY = pointer.y
        targetGain = 1
        lastInteraction = now
      } else if (now - lastInteraction > IDLE_DELAY_MS && width > 2) {
        const t = now / 1000
        const mark = markMetrics()
        targetX = mark.cx + Math.sin(t * 0.6) * mark.side * 0.34
        targetY = mark.cy + Math.cos(t * 0.83 + 1.2) * mark.side * 0.26
        targetGain = IDLE_GAIN
      }

      gain += (targetGain - gain) * Math.min(1, 0.14 * dt)
      if (targetX !== null) {
        if (!influence.placed) {
          influence.x = targetX
          influence.y = targetY
          influence.placed = true
        }
        const follow = Math.min(1, 0.32 * dt)
        influence.x += (targetX - influence.x) * follow
        influence.y += (targetY - influence.y) * follow
      }

      const radius = Math.max(1, current.interactionRadius)
      const radiusSquared = radius * radius
      const dampingFactor = Math.pow(current.damping, dt)
      const stiffness = current.stiffness * dt
      const active = gain > 0.004
      let maxOffset = 0
      let maxVelocity = 0

      for (let index = 0; index < dots.length; index += 1) {
        const dot = dots[index]
        let targetHomeX = dot.hx
        let targetHomeY = dot.hy
        if (active) {
          const dx = dot.hx - influence.x
          const dy = dot.hy - influence.y
          const distanceSquared = dx * dx + dy * dy
          if (distanceSquared < radiusSquared && distanceSquared > 1e-6) {
            const distance = Math.sqrt(distanceSquared)
            const push = current.strength * gain * Math.pow(1 - distance / radius, current.falloff)
            targetHomeX += (dx / distance) * push
            targetHomeY += (dy / distance) * push
          }
        }
        dot.vx = (dot.vx + (targetHomeX - dot.x) * stiffness) * dampingFactor
        dot.vy = (dot.vy + (targetHomeY - dot.y) * stiffness) * dampingFactor
        dot.x += dot.vx * dt
        dot.y += dot.vy * dt
        const offset = Math.abs(dot.x - dot.hx) + Math.abs(dot.y - dot.hy)
        if (offset > maxOffset) maxOffset = offset
        const velocity = Math.abs(dot.vx) + Math.abs(dot.vy)
        if (velocity > maxVelocity) maxVelocity = velocity
      }

      draw()

      // Everything settled with no pointer: snap home, stop the loop, and
      // schedule a wake for the next idle-drift window.
      if (!pointer && targetGain === 0 && maxOffset < 0.06 && maxVelocity < 0.06) {
        snapHome()
        draw()
        stop()
        const remaining = IDLE_DELAY_MS - (now - lastInteraction) + 60
        if (remaining > 0 && visible) {
          window.clearTimeout(sleepTimer)
          sleepTimer = window.setTimeout(wake, remaining)
        }
      }
    }

    const frame = (now: number) => {
      if (disposed) return
      raf = window.requestAnimationFrame(frame)
      const dt = lastTime === 0 ? 1 : Math.min(2.5, Math.max(0.25, (now - lastTime) / 16.667))
      lastTime = now
      step(now, dt)
    }

    const resize = () => {
      const rect = stage.getBoundingClientRect()
      if (rect.width < 2 || rect.height < 2) return
      width = rect.width
      height = rect.height
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      const pixelWidth = Math.max(1, Math.round(width * dpr))
      const pixelHeight = Math.max(1, Math.round(height * dpr))
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth
        canvas.height = pixelHeight
      }
      rebuildSprites()
      resample()
      if (!running) draw()
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(stage)
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(entry?.isIntersecting && (!compact || entry.intersectionRatio >= 0.35))
        if (visible) wake()
        else {
          stop()
          window.clearTimeout(sleepTimer)
        }
      },
      { threshold: [0, 0.35, 1] },
    )
    intersectionObserver.observe(stage)
    resize()

    engineRef.current = {
      pointerMove: (x, y) => {
        if (reduced) return
        pointer = { x, y }
        wake()
      },
      pointerLeave: () => {
        if (reduced) return
        pointer = null
        lastInteraction = performance.now()
      },
      syncSettings: (request) => {
        if (request.sprite) rebuildSprites()
        if (request.resample) resample()
        if (!running) draw()
      },
    }

    return () => {
      disposed = true
      stop()
      window.clearTimeout(sleepTimer)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      engineRef.current = null
    }
  }, [compact, reduced])

  /* Forward control-panel settings into the engine outside the render loop. */
  useEffect(() => {
    const previous = previousSettingsRef.current
    previousSettingsRef.current = settings
    settingsRef.current = settings
    engineRef.current?.syncSettings({
      resample: previous.spacing !== settings.spacing,
      sprite: previous.spacing !== settings.spacing || previous.dotRadius !== settings.dotRadius || previous.invert !== settings.invert,
    })
  }, [settings])

  const updatePointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    engineRef.current?.pointerMove(event.clientX - rect.left, event.clientY - rect.top)
  }

  return (
    <div
      ref={rootRef}
      className={`rd-demo ${compact ? 'rd-demo--compact' : 'rd-demo--playground'}`}
      data-invert={settings.invert ? 'true' : 'false'}
    >
      <div
        ref={stageRef}
        className="rd-stage"
        onPointerMove={updatePointer}
        onPointerDown={updatePointer}
        onPointerLeave={() => engineRef.current?.pointerLeave()}
        onPointerCancel={() => engineRef.current?.pointerLeave()}
      >
        <canvas
          ref={canvasRef}
          className="rd-canvas"
          role="img"
          aria-label="A shaded app tile with a cube logo built from thousands of small canvas dots that part around the pointer and spring back into place"
        />
      </div>

      {!compact && chrome === 'full' ? (
        <ReactiveDitherControlPanel settings={settings} onChange={(next) => updateSettings(() => next)} embedded />
      ) : null}
    </div>
  )
}

/* Control panel: shared SliderChip / SwitchChip bars from detail-kit (same
   look and interaction as every other detail page); the invert setting is a
   switch bar. Values are rounded per control so the formatted readouts and
   QA-facing aria-valuetext stay stable. */
export function ReactiveDitherControlPanel({
  settings,
  onChange,
  embedded = false,
}: {
  settings: DitherSettings
  onChange: (next: DitherSettings) => void
  embedded?: boolean
}) {
  return (
    <div
      className={`rd-controls${embedded ? ' rd-controls--embedded' : ''} grid grid-cols-1 gap-3 sm:grid-cols-2`}
      aria-label="Liquid dither effect settings"
    >
      {RANGE_CONTROLS.map((control) => (
        <SliderChip
          key={control.key}
          label={control.label}
          min={control.min}
          max={control.max}
          value={settings[control.key]}
          format={control.format}
          onChange={(v) => onChange({ ...settings, [control.key]: control.round(v) })}
        />
      ))}
      <SwitchChip
        label="Inverted"
        checked={settings.invert}
        onChange={(next) => onChange({ ...settings, invert: next })}
      />
    </div>
  )
}
