import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import './ScribbleIndexDemo.css'

type Entry = {
  title: string
  date: string
  year?: string
  isLastInGroup?: boolean
  isNew?: boolean
}

type Point = { x: number; y: number }
type Stroke = { points: Point[] }

export type ScribbleIndexControls = {
  clear?: () => void
  reset?: () => void
  undo?: () => void
}

const ENTRIES: readonly Entry[] = [
  { title: 'Liveline', date: '16/02', year: '2026', isNew: true },
  { title: 'Agentation', date: '21/01' },
  { title: 'Annotating for agents', date: '16/01' },
  { title: 'Morphing icons with Claude', date: '13/01', isLastInGroup: true },
  { title: 'Honkish', date: '23/05', year: '2025', isLastInGroup: true },
  { title: 'Family Values', date: '08/07', year: '2024', isLastInGroup: true },
] as const

const MAGENTA = '#ff00aa'

function grain(index: number, seed: number) {
  const value = Math.sin(index * 12.9898 + seed * 78.233) * 43758.5453
  return (value - Math.floor(value)) * 2 - 1
}

function densify(points: readonly Point[]) {
  if (points.length < 2) return [...points]
  const dense: Point[] = [points[0]]
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1]
    const current = points[index]
    const distance = Math.hypot(current.x - previous.x, current.y - previous.y)
    const steps = Math.max(1, Math.ceil(distance / 2.25))
    for (let step = 1; step <= steps; step += 1) {
      const progress = step / steps
      dense.push({
        x: previous.x + (current.x - previous.x) * progress,
        y: previous.y + (current.y - previous.y) * progress,
      })
    }
  }
  return dense
}

function drawPencilPath(
  context: CanvasRenderingContext2D,
  points: readonly Point[],
  strokeWidth: number,
  seed: number,
) {
  if (points.length < 2) return
  const dense = densify(points)

  const drawFiber = (
    pass: number,
    alpha: number,
    lineWidth: number,
    roughness: number,
    dash: number[],
  ) => {
    context.beginPath()
    dense.forEach((point, index) => {
      const previous = dense[Math.max(0, index - 1)]
      const next = dense[Math.min(dense.length - 1, index + 1)]
      const length = Math.hypot(next.x - previous.x, next.y - previous.y) || 1
      const normalX = -(next.y - previous.y) / length
      const normalY = (next.x - previous.x) / length
      const offset = grain(index, seed + pass * 3.17) * roughness
      const x = point.x + normalX * offset
      const y = point.y + normalY * offset
      if (index === 0) context.moveTo(x, y)
      else context.lineTo(x, y)
    })
    context.globalAlpha = alpha
    context.lineWidth = lineWidth
    context.setLineDash(dash)
    context.lineDashOffset = grain(pass, seed) * 1.8
    context.stroke()
  }

  context.save()
  context.strokeStyle = MAGENTA
  context.fillStyle = MAGENTA
  context.lineCap = 'round'
  context.lineJoin = 'round'

  // The outer envelope stays the same width; opacity gaps and fine interior
  // fibers create the dry, graphite-like texture instead of pressure changes.
  const coreRoughness = Math.min(0.22, strokeWidth * 0.1)
  const coreWidth = Math.max(0.54, strokeWidth - coreRoughness * 2)
  drawFiber(0, 0.78, coreWidth, coreRoughness, [4.4, 0.58, 1.2, 0.38])
  drawFiber(1, 0.44, Math.max(0.42, strokeWidth * 0.25), Math.min(0.38, strokeWidth * 0.17), [1.1, 1.35, 3.2, 0.62])
  drawFiber(2, 0.3, Math.max(0.34, strokeWidth * 0.19), Math.min(0.31, strokeWidth * 0.14), [0.62, 1.65, 2.1, 0.75])

  context.setLineDash([])
  context.globalAlpha = 0.18
  dense.forEach((point, index) => {
    if (index % 4 !== 0 || grain(index, seed + 9.4) < -0.18) return
    const previous = dense[Math.max(0, index - 1)]
    const next = dense[Math.min(dense.length - 1, index + 1)]
    const length = Math.hypot(next.x - previous.x, next.y - previous.y) || 1
    const normalX = -(next.y - previous.y) / length
    const normalY = (next.x - previous.x) / length
    const offset = grain(index, seed + 12.6) * strokeWidth * 0.28
    const size = 0.32 + Math.abs(grain(index, seed + 17.8)) * 0.24
    context.fillRect(point.x + normalX * offset, point.y + normalY * offset, size, size)
  })
  context.restore()
}

function drawPencilStroke(
  context: CanvasRenderingContext2D,
  points: readonly Point[],
  width: number,
  height: number,
  seed: number,
) {
  if (points.length < 2) return
  drawPencilPath(
    context,
    points.map((point) => ({ x: point.x * width, y: point.y * height })),
    2.1,
    seed,
  )
}

export function ScribbleIndexDemo({
  compact = false,
  controls,
}: {
  compact?: boolean
  controls?: ScribbleIndexControls
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const newLabelRef = useRef<HTMLSpanElement>(null)
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])
  const strokesRef = useRef<Stroke[]>([])
  const currentStrokeRef = useRef<Stroke | null>(null)
  const drawingPointerRef = useRef<number | null>(null)
  const hoverRef = useRef<number | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [autoIndex, setAutoIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(!compact)
  const seedVisibleRef = useRef(true)
  const [canvasRevision, setCanvasRevision] = useState(0)
  const [strokeCount, setStrokeCount] = useState(0)

  const renderCanvas = useCallback(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    if (!root || !canvas) return

    const rect = root.getBoundingClientRect()
    if (!rect.width || !rect.height) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const pixelWidth = Math.max(1, Math.round(rect.width * dpr))
    const pixelHeight = Math.max(1, Math.round(rect.height * dpr))
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth
      canvas.height = pixelHeight
    }

    const context = canvas.getContext('2d')
    if (!context) return
    context.setTransform(dpr, 0, 0, dpr, 0, 0)
    context.clearRect(0, 0, rect.width, rect.height)
    context.strokeStyle = MAGENTA
    context.lineCap = 'round'
    context.lineJoin = 'round'

    if (seedVisibleRef.current && newLabelRef.current) {
      const labelRect = newLabelRef.current.getBoundingClientRect()
      const centerX = labelRect.left - rect.left + labelRect.width / 2
      const centerY = labelRect.top - rect.top + labelRect.height / 2
      const radiusX = labelRect.width / 2 + (compact ? 5 : 8)
      const radiusY = labelRect.height / 2 + (compact ? 3 : 5)

      for (let pass = 0; pass < 2; pass += 1) {
        const outline: Point[] = []
        for (let index = 0; index <= 42; index += 1) {
          const angle = (Math.PI * 2 * index) / 42
          const wobble = Math.sin(index * 1.74 + pass * 2.3) * (compact ? 0.8 : 1.15)
          const x = centerX + Math.cos(angle) * (radiusX + wobble) + pass * 0.75
          const y = centerY + Math.sin(angle) * (radiusY + wobble * 0.46) - pass * 0.35
          outline.push({ x, y })
        }
        drawPencilPath(
          context,
          outline,
          compact ? (pass === 0 ? 1.65 : 0.9) : (pass === 0 ? 2.15 : 1.15),
          21 + pass * 13,
        )
      }
    }

    strokesRef.current.forEach((stroke, index) => drawPencilStroke(context, stroke.points, rect.width, rect.height, 47 + index * 19))
  }, [compact])

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const observer = new ResizeObserver(() => renderCanvas())
    observer.observe(root)
    const frame = window.requestAnimationFrame(renderCanvas)
    return () => {
      window.cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [renderCanvas])

  useEffect(() => {
    if (!compact || !rootRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(Boolean(entry?.isIntersecting && entry.intersectionRatio >= 0.35)),
      { threshold: [0, 0.35, 1] },
    )
    observer.observe(rootRef.current)
    return () => observer.disconnect()
  }, [compact])

  useEffect(() => {
    if (!compact || !isVisible || hoveredIndex !== null) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const interval = window.setInterval(() => setAutoIndex((index) => (index + 1) % ENTRIES.length), 1450)
    return () => window.clearInterval(interval)
  }, [compact, hoveredIndex, isVisible])

  const clear = useCallback(() => {
    strokesRef.current = []
    currentStrokeRef.current = null
    seedVisibleRef.current = false
    setStrokeCount(0)
    setCanvasRevision((revision) => revision + 1)
  }, [])

  const reset = useCallback(() => {
    strokesRef.current = []
    currentStrokeRef.current = null
    seedVisibleRef.current = true
    setStrokeCount(0)
    setCanvasRevision((revision) => revision + 1)
    setAutoIndex(0)
    hoverRef.current = null
    setHoveredIndex(null)
  }, [])

  const undo = useCallback(() => {
    if (strokesRef.current.length > 0) {
      strokesRef.current = strokesRef.current.slice(0, -1)
      setStrokeCount(strokesRef.current.length)
      setCanvasRevision((revision) => revision + 1)
      return
    }
    seedVisibleRef.current = false
    setCanvasRevision((revision) => revision + 1)
  }, [])

  useEffect(() => {
    if (!controls) return
    controls.clear = clear
    controls.reset = reset
    controls.undo = undo
    return () => {
      delete controls.clear
      delete controls.reset
      delete controls.undo
    }
  }, [clear, controls, reset, undo])

  useEffect(() => {
    renderCanvas()
  }, [canvasRevision, renderCanvas])

  const setHover = (index: number | null) => {
    if (hoverRef.current === index) return
    hoverRef.current = index
    setHoveredIndex(index)
  }

  const pointFromEvent = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const rect = rootRef.current!.getBoundingClientRect()
    return {
      x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
    }
  }

  const updateHoverFromPointer = (clientY: number) => {
    const index = rowRefs.current.findIndex((row) => {
      if (!row) return false
      const rect = row.getBoundingClientRect()
      return clientY >= rect.top && clientY <= rect.bottom
    })
    setHover(index >= 0 ? index : null)
  }

  const onPointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (event.button !== 0) return
    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    drawingPointerRef.current = event.pointerId
    const stroke = { points: [pointFromEvent(event)] }
    currentStrokeRef.current = stroke
    strokesRef.current = [...strokesRef.current, stroke]
    setStrokeCount(strokesRef.current.length)
    renderCanvas()
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    updateHoverFromPointer(event.clientY)
    if (drawingPointerRef.current !== event.pointerId || !currentStrokeRef.current) return
    event.preventDefault()
    const point = pointFromEvent(event)
    const previous = currentStrokeRef.current.points.at(-1)
    if (previous) {
      const root = rootRef.current!.getBoundingClientRect()
      const distance = Math.hypot((point.x - previous.x) * root.width, (point.y - previous.y) * root.height)
      if (distance < 1.25) return
    }
    currentStrokeRef.current.points.push(point)
    renderCanvas()
  }

  const endStroke = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (drawingPointerRef.current !== event.pointerId) return
    event.preventDefault()
    event.stopPropagation()
    drawingPointerRef.current = null
    currentStrokeRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }

  const activeIndex = hoveredIndex ?? (compact ? autoIndex : 0)

  return (
    <div
      ref={rootRef}
      data-testid={compact ? 'scribble-index-compact' : 'scribble-index-full'}
      data-stroke-count={strokeCount}
      data-seed-visible={seedVisibleRef.current}
      className={`si-demo${compact ? ' si-demo--compact' : ''}`}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="si-heading">Writing</div>
      <div className="si-list" aria-label="Writing index">
        {ENTRIES.map((entry, index) => (
          <div
            key={`${entry.title}-${entry.date}`}
            ref={(element) => { rowRefs.current[index] = element }}
            className={`si-row${entry.year && index > 0 ? ' si-row--group-start' : ''}${entry.isLastInGroup ? ' si-row--last-in-group' : ''}${activeIndex === index ? ' is-active' : ' is-muted'}`}
          >
            <span className="si-year" aria-hidden={!entry.year}>{entry.year ?? ''}</span>
            <button
              type="button"
              className="si-entry"
              aria-pressed={activeIndex === index}
              onFocus={() => setHover(index)}
              onBlur={() => setHover(null)}
              onClick={() => setHover(index)}
            >
              <span className="si-title">
                {entry.title}
                {entry.isNew ? <span ref={newLabelRef} className="si-new">New</span> : null}
              </span>
              <time className="si-date">{entry.date}</time>
            </button>
          </div>
        ))}
      </div>
      <canvas
        ref={canvasRef}
        className="si-canvas"
        aria-label="Drawing surface. Drag with a mouse, pen, or finger to add a magenta scribble."
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endStroke}
        onPointerCancel={endStroke}
        onPointerLeave={() => { if (drawingPointerRef.current === null) setHover(null) }}
      />
    </div>
  )
}
