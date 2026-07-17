import { useCallback, useEffect, useRef, useState } from 'react'
import './ReactiveDitherDemo.css'

/*
 * Reactive Dither — a rounded-square mark rendered as a field of real canvas
 * dots. An invisible circular influence field follows the pointer and pushes
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
}

type DitherSettings = {
  spacing: number // grid gap between dots, CSS px
  dotRadius: number // dot radius, CSS px
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
  spacing: 5.8,
  dotRadius: 1.7,
  interactionRadius: 92,
  strength: 30,
  stiffness: 0.11,
  damping: 0.83,
  falloff: 3,
  invert: false,
}

/* The mark is drawn once into this offscreen mask and sampled by alpha. */
const MARK_SOURCE_SIZE = 512
const MARK_FILL = 0.62 // mark side as a fraction of the stage's smaller edge
const ALPHA_THRESHOLD = 110
const IDLE_DELAY_MS = 4500 // pointer absence before the idle drift resumes
const IDLE_GAIN = 0.55 // the idle drift stays noticeably subtler than a pointer

const RANGE_CONTROLS: readonly {
  key: keyof Omit<DitherSettings, 'invert'>
  label: string
  min: number
  max: number
  step: number
  format: (value: number) => string
}[] = [
  { key: 'spacing', label: 'Dot spacing', min: 3.6, max: 10, step: 0.2, format: (v) => `${v.toFixed(1)} px` },
  { key: 'dotRadius', label: 'Dot radius', min: 0.8, max: 3.2, step: 0.1, format: (v) => `${v.toFixed(1)} px` },
  { key: 'interactionRadius', label: 'Interaction radius', min: 36, max: 200, step: 2, format: (v) => `${Math.round(v)} px` },
  { key: 'strength', label: 'Displacement strength', min: 0, max: 80, step: 1, format: (v) => `${Math.round(v)} px` },
  { key: 'stiffness', label: 'Return stiffness', min: 0.03, max: 0.26, step: 0.005, format: (v) => v.toFixed(3) },
  { key: 'damping', label: 'Damping', min: 0.7, max: 0.96, step: 0.005, format: (v) => v.toFixed(3) },
  { key: 'falloff', label: 'Falloff intensity', min: 1, max: 5, step: 0.25, format: (v) => (v === 3 ? '3 · cubic' : v.toFixed(2)) },
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

/* Abstract mark: a rounded-square ring with a solid center dot. Drawn in
 * vector so the sampled silhouette stays crisp at every stage size. */
function drawSourceMark(context: CanvasRenderingContext2D, size: number) {
  const u = size / 100
  context.clearRect(0, 0, size, size)
  context.fillStyle = '#000'
  roundedRectPath(context, 16 * u, 16 * u, 68 * u, 68 * u, 19 * u)
  context.fill()
  context.globalCompositeOperation = 'destination-out'
  roundedRectPath(context, 28.5 * u, 28.5 * u, 43 * u, 43 * u, 11.5 * u)
  context.fill()
  context.globalCompositeOperation = 'source-over'
  context.beginPath()
  context.arc(50 * u, 50 * u, 10.5 * u, 0, Math.PI * 2)
  context.fill()
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
}: {
  compact?: boolean
  controls?: ReactiveDitherControls
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<DitherEngine | null>(null)
  const reduced = usePrefersReducedMotion()
  const [settings, setSettings] = useState<DitherSettings>(DEFAULT_SETTINGS)
  const settingsRef = useRef(settings)
  const previousSettingsRef = useRef(settings)

  const reset = useCallback(() => setSettings(DEFAULT_SETTINGS), [])

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
    let sprite: { canvas: HTMLCanvasElement; half: number } | null = null
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
    if (sourceContext) {
      drawSourceMark(sourceContext, MARK_SOURCE_SIZE)
      sourcePixels = sourceContext.getImageData(0, 0, MARK_SOURCE_SIZE, MARK_SOURCE_SIZE).data
    }

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
          if (sourcePixels[(sy * MARK_SOURCE_SIZE + sx) * 4 + 3] > ALPHA_THRESHOLD) {
            dots.push({ hx: x, hy: y, x, y, vx: 0, vy: 0 })
          }
        }
      }
    }

    /* Dots are stamped from one pre-rendered sprite — far cheaper than an
     * arc() call per dot per frame. */
    const rebuildSprite = () => {
      const current = settingsRef.current
      const radius = Math.max(0.4, current.dotRadius)
      const pad = 1
      const cssSize = (radius + pad) * 2
      const spriteCanvas = document.createElement('canvas')
      spriteCanvas.width = Math.max(2, Math.ceil(cssSize * dpr))
      spriteCanvas.height = spriteCanvas.width
      const spriteContext = spriteCanvas.getContext('2d')
      if (!spriteContext) return
      spriteContext.scale(dpr, dpr)
      spriteContext.fillStyle = current.invert ? '#f5f5f3' : '#26262a'
      spriteContext.beginPath()
      spriteContext.arc(cssSize / 2, cssSize / 2, radius, 0, Math.PI * 2)
      spriteContext.fill()
      sprite = { canvas: spriteCanvas, half: cssSize / 2 }
    }

    const draw = () => {
      if (!sprite || width < 2 || height < 2) return
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      context.clearRect(0, 0, width, height)
      const { canvas: spriteCanvas, half } = sprite
      for (let index = 0; index < dots.length; index += 1) {
        const dot = dots[index]
        context.drawImage(spriteCanvas, dot.x - half, dot.y - half)
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
      resample()
      rebuildSprite()
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
        if (request.resample) resample()
        if (request.sprite) rebuildSprite()
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
      sprite: previous.dotRadius !== settings.dotRadius || previous.invert !== settings.invert,
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
          aria-label="A rounded-square mark built from thousands of small canvas dots that part around the pointer and spring back into place"
        />
      </div>

      {!compact ? (
        <div className="rd-controls" aria-label="Reactive dither settings">
          <div className="rd-ranges">
            {RANGE_CONTROLS.map((control) => (
              <label className="rd-range" key={control.key}>
                <span className="rd-range-copy">
                  <span>{control.label}</span>
                  <output>{control.format(settings[control.key])}</output>
                </span>
                <input
                  aria-label={control.label}
                  type="range"
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  value={settings[control.key]}
                  onChange={(event) => {
                    const value = Number(event.currentTarget.value)
                    setSettings((current) => ({ ...current, [control.key]: value }))
                  }}
                />
              </label>
            ))}
            <fieldset className="rd-control-group">
              <legend>Color</legend>
              <div className="rd-segmented">
                <button
                  type="button"
                  aria-pressed={!settings.invert}
                  onClick={() => setSettings((current) => ({ ...current, invert: false }))}
                >
                  Normal
                </button>
                <button
                  type="button"
                  aria-pressed={settings.invert}
                  onClick={() => setSettings((current) => ({ ...current, invert: true }))}
                >
                  Inverted
                </button>
              </div>
            </fieldset>
          </div>
        </div>
      ) : null}
    </div>
  )
}
