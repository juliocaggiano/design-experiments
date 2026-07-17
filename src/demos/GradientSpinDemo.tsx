import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import './GradientSpinDemo.css'

/**
 * Adapted from gradient-spin by ziye.
 * Copyright (c) 2026 ziye — MIT License.
 * https://github.com/BIAsia/gradient-spin
 */

export type GradientPresetName =
  | 'sunrise'
  | 'bubble'
  | 'peach'
  | 'tonic'
  | 'mint'
  | 'spring'
  | 'twilight'
  | 'bay'

export type SpinPattern = 'arrow-up' | 'diagonal' | 'snake' | 'ripple'
type ColorBy = 'path' | 'row'

type GradientStop = {
  color: string
  position: number
}

type GradientSpinProps = {
  gradient: GradientPresetName
  pattern: SpinPattern
  rows: number
  cols: number
  cellSize: number
  cellGap: number
  period: number
  dim: number
  colorBy: ColorBy
  label?: string
}

type GradientSpinDemoProps = {
  compact?: boolean
}

type Oklab = {
  l: number
  a: number
  b: number
}

type CellStyle = CSSProperties & {
  '--gsd-phase': number
}

type GridStyle = CSSProperties & {
  '--gsd-period': string
  '--gsd-dim': number
}

const GRADIENT_PRESETS: Record<GradientPresetName, GradientStop[]> = {
  sunrise: [
    { color: '#B6D3EF', position: 0 },
    { color: '#CAD1D7', position: 0.153 },
    { color: '#D7CFC8', position: 0.252 },
    { color: '#E1CDB9', position: 0.341 },
    { color: '#EAC6A5', position: 0.424 },
    { color: '#EDB185', position: 0.505 },
    { color: '#EF9B62', position: 0.586 },
    { color: '#F18F60', position: 0.669 },
    { color: '#F48D7A', position: 0.758 },
    { color: '#F78A94', position: 0.857 },
    { color: '#F888A0', position: 1 },
  ],
  bubble: [
    { color: '#F5EBD9', position: 0 },
    { color: '#F2D4DB', position: 0.31 },
    { color: '#EBBDDE', position: 0.5 },
    { color: '#CCBAE3', position: 0.65 },
    { color: '#8CBFF0', position: 0.82 },
    { color: '#78B0FF', position: 1 },
  ],
  peach: [
    { color: '#D9F5FA', position: 0 },
    { color: '#FCD9D6', position: 0.31 },
    { color: '#FCBAC9', position: 0.61 },
    { color: '#F0B3F5', position: 1 },
  ],
  tonic: [
    { color: '#E3EDF0', position: 0 },
    { color: '#E8EBB8', position: 0.27 },
    { color: '#F0DEA3', position: 0.43 },
    { color: '#E8B078', position: 0.75 },
    { color: '#F29682', position: 1 },
  ],
  mint: [
    { color: '#DECEE8', position: 0 },
    { color: '#CBBAEE', position: 0.21 },
    { color: '#7DC0FB', position: 0.46 },
    { color: '#00C7A6', position: 1 },
  ],
  spring: [
    { color: '#F7D5C5', position: 0.07 },
    { color: '#46A8C0', position: 0.58 },
    { color: '#43AE7D', position: 1 },
  ],
  twilight: [
    { color: '#E3CCE6', position: 0 },
    { color: '#4E8CD5', position: 0.35 },
    { color: '#6068C2', position: 0.64 },
    { color: '#38364E', position: 1 },
  ],
  bay: [
    { color: '#DBE3D0', position: 0 },
    { color: '#8DB8A7', position: 0.23 },
    { color: '#2D8E9A', position: 0.42 },
    { color: '#076492', position: 0.59 },
    { color: '#154288', position: 0.79 },
    { color: '#262C81', position: 1 },
  ],
}

const PALETTES = Object.keys(GRADIENT_PRESETS) as GradientPresetName[]
const PATTERNS: readonly { id: SpinPattern; label: string }[] = [
  { id: 'arrow-up', label: 'Arrow' },
  { id: 'diagonal', label: 'Diagonal' },
  { id: 'snake', label: 'Snake' },
  { id: 'ripple', label: 'Ripple' },
]

const INITIAL = {
  gradient: 'spring' as GradientPresetName,
  pattern: 'snake' as SpinPattern,
  colorBy: 'path' as ColorBy,
  period: 750,
  dim: 0.1,
  rows: 7,
  cols: 7,
  cellSize: 12,
  cellGap: 4,
}

function hexChannel(hex: string, offset: number) {
  return Number.parseInt(hex.slice(offset, offset + 2), 16)
}

function srgbToLinear(value: number) {
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

function linearToSrgb(value: number) {
  const clamped = Math.min(Math.max(value, 0), 1)
  return clamped <= 0.0031308 ? clamped * 12.92 : 1.055 * clamped ** (1 / 2.4) - 0.055
}

function hexToOklab(hex: string): Oklab {
  const normalized = hex.replace(/^#/, '')
  const expanded = normalized.length === 3
    ? normalized.split('').map((channel) => channel + channel).join('')
    : normalized
  const red = srgbToLinear(hexChannel(expanded, 0) / 255)
  const green = srgbToLinear(hexChannel(expanded, 2) / 255)
  const blue = srgbToLinear(hexChannel(expanded, 4) / 255)
  const lmsL = Math.cbrt(0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue)
  const lmsM = Math.cbrt(0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue)
  const lmsS = Math.cbrt(0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue)
  return {
    l: 0.2104542553 * lmsL + 0.793617785 * lmsM - 0.0040720468 * lmsS,
    a: 1.9779984951 * lmsL - 2.428592205 * lmsM + 0.4505937099 * lmsS,
    b: 0.0259040371 * lmsL + 0.7827717662 * lmsM - 0.808675766 * lmsS,
  }
}

function oklabToRgbString({ l, a, b }: Oklab) {
  const lmsL = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const lmsM = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const lmsS = (l - 0.0894841775 * a - 1.291485548 * b) ** 3
  const red = linearToSrgb(4.0767416621 * lmsL - 3.3077115913 * lmsM + 0.2309699292 * lmsS)
  const green = linearToSrgb(-1.2684380046 * lmsL + 2.6097574011 * lmsM - 0.3413193965 * lmsS)
  const blue = linearToSrgb(-0.0041960863 * lmsL - 0.7034186147 * lmsM + 1.707614701 * lmsS)
  return `rgb(${Math.round(red * 255)}, ${Math.round(green * 255)}, ${Math.round(blue * 255)})`
}

function sampleGradient(stops: readonly GradientStop[], value: number) {
  const sorted = [...stops].sort((a, b) => a.position - b.position)
  const clamped = Math.min(Math.max(value, sorted[0].position), sorted[sorted.length - 1].position)
  let lower = sorted[0]
  let upper = sorted[sorted.length - 1]
  for (let index = 0; index < sorted.length - 1; index += 1) {
    if (clamped >= sorted[index].position && clamped <= sorted[index + 1].position) {
      lower = sorted[index]
      upper = sorted[index + 1]
      break
    }
  }
  const span = upper.position - lower.position
  const mix = span === 0 ? 0 : (clamped - lower.position) / span
  const from = hexToOklab(lower.color)
  const to = hexToOklab(upper.color)
  return oklabToRgbString({
    l: from.l + (to.l - from.l) * mix,
    a: from.a + (to.a - from.a) * mix,
    b: from.b + (to.b - from.b) * mix,
  })
}

function cellWaveOrder(pattern: SpinPattern, row: number, col: number, rows: number, cols: number) {
  const centerCol = (cols - 1) / 2
  if (pattern === 'arrow-up') {
    return { d: rows - 1 - row + Math.abs(col - centerCol), max: rows - 1 + centerCol }
  }
  if (pattern === 'diagonal') return { d: (row + col) % 4, max: 3 }
  if (pattern === 'snake') {
    const rowFromBottom = rows - 1 - row
    const leftToRight = rowFromBottom % 2 === 0
    const path = rowFromBottom * cols + (leftToRight ? col : cols - 1 - col)
    return { d: path % 4, max: 3 }
  }
  const centerRow = (rows - 1) / 2
  return {
    d: Math.max(Math.abs(row - centerRow), Math.abs(col - centerCol)),
    max: Math.max(centerRow, centerCol),
  }
}

function GradientSpin({
  gradient,
  pattern,
  rows,
  cols,
  cellSize,
  cellGap,
  period,
  dim,
  colorBy,
  label = 'Loading',
}: GradientSpinProps) {
  const stops = GRADIENT_PRESETS[gradient]
  const cells = useMemo(() => {
    const seeds: Array<{ row: number; col: number; d: number; max: number }> = []
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        seeds.push({ row, col, ...cellWaveOrder(pattern, row, col, rows, cols) })
      }
    }
    const pathRank = new Map<string, number>()
    if (colorBy === 'path') {
      const ordered = [...seeds].sort((a, b) => a.d - b.d || a.row - b.row || a.col - b.col)
      ordered.forEach((seed, index) => pathRank.set(`${seed.row}-${seed.col}`, index))
    }
    return seeds.map((seed) => {
      const key = `${seed.row}-${seed.col}`
      const phase = seed.max === 0 ? 0 : seed.d / (seed.max + 1)
      const colorT = colorBy === 'path'
        ? (seeds.length > 1 ? (pathRank.get(key) ?? 0) / (seeds.length - 1) : 0)
        : (rows > 1 ? seed.row / (rows - 1) : 0)
      return { key, phase, color: sampleGradient(stops, colorT) }
    })
  }, [colorBy, cols, pattern, rows, stops])

  const style: GridStyle = {
    gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
    gridAutoRows: `${cellSize}px`,
    gap: `${cellGap}px`,
    '--gsd-period': `${period}ms`,
    '--gsd-dim': dim,
  }

  return (
    <span className="gsd-grid" role="status" aria-label={label} style={style}>
      {cells.map((cell) => (
        <span
          aria-hidden="true"
          className="gsd-cell"
          key={cell.key}
          style={{ backgroundColor: cell.color, '--gsd-phase': cell.phase } as CellStyle}
        />
      ))}
    </span>
  )
}

function paletteBackground(name: GradientPresetName) {
  return `linear-gradient(135deg, ${GRADIENT_PRESETS[name]
    .map((stop) => `${stop.color} ${Math.round(stop.position * 100)}%`)
    .join(', ')})`
}

function RangeControl({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  suffix?: string
  onChange: (value: number) => void
}) {
  return (
    <label className="gsd-range">
      <span className="gsd-range-copy">
        <span>{label}</span>
        <output>{Number.isInteger(step) ? value : value.toFixed(2)}{suffix}</output>
      </span>
      <input
        aria-label={label}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
      />
    </label>
  )
}

export function GradientSpinDemo({ compact = false }: GradientSpinDemoProps) {
  const root = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(!compact)
  const [gradient, setGradient] = useState<GradientPresetName>(INITIAL.gradient)
  const [pattern, setPattern] = useState<SpinPattern>(INITIAL.pattern)
  const [colorBy, setColorBy] = useState<ColorBy>(INITIAL.colorBy)
  const [period, setPeriod] = useState(INITIAL.period)
  const [dim, setDim] = useState(INITIAL.dim)
  const [rows, setRows] = useState(INITIAL.rows)
  const [cols, setCols] = useState(INITIAL.cols)
  const [cellSize, setCellSize] = useState(INITIAL.cellSize)
  const [cellGap, setCellGap] = useState(INITIAL.cellGap)

  useEffect(() => {
    if (!compact) {
      setActive(true)
      return
    }
    const node = root.current
    if (!node || !('IntersectionObserver' in window)) {
      setActive(true)
      return
    }
    const observer = new IntersectionObserver(([entry]) => {
      setActive(entry.isIntersecting && entry.intersectionRatio >= 0.35)
    }, { threshold: [0, 0.35, 0.75] })
    observer.observe(node)
    return () => observer.disconnect()
  }, [compact])

  return (
    <div
      ref={root}
      className={`gsd-demo ${compact ? 'gsd-demo--compact' : 'gsd-demo--playground'}`}
      data-active={active ? 'true' : 'false'}
    >
      <div className="gsd-stage">
        <div className="gsd-specimen">
          <GradientSpin
            gradient={gradient}
            pattern={pattern}
            rows={rows}
            cols={cols}
            cellSize={cellSize}
            cellGap={cellGap}
            period={period}
            dim={dim}
            colorBy={colorBy}
            label={`${gradient} ${pattern} loading animation`}
          />
          <span aria-hidden="true" className="gsd-loading-label">Loading older messages</span>
        </div>
      </div>

      {!compact ? (
        <div className="gsd-controls">
          <fieldset className="gsd-control-group gsd-palette-group">
            <legend>Palette</legend>
            <div className="gsd-palettes">
              {PALETTES.map((name) => (
                <button
                  type="button"
                  key={name}
                  aria-label={`${name} palette`}
                  aria-pressed={gradient === name}
                  className="gsd-palette"
                  onClick={() => setGradient(name)}
                >
                  <span aria-hidden="true" className="gsd-palette-swatch" style={{ background: paletteBackground(name) }} />
                  <span>{name}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="gsd-button-groups">
            <fieldset className="gsd-control-group">
              <legend>Pattern</legend>
              <div className="gsd-segmented">
                {PATTERNS.map(({ id, label }) => (
                  <button type="button" key={id} aria-pressed={pattern === id} onClick={() => setPattern(id)}>
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset className="gsd-control-group">
              <legend>Gradient axis</legend>
              <div className="gsd-segmented">
                <button type="button" aria-pressed={colorBy === 'path'} onClick={() => setColorBy('path')}>Along path</button>
                <button type="button" aria-pressed={colorBy === 'row'} onClick={() => setColorBy('row')}>Top down</button>
              </div>
            </fieldset>
          </div>

          <div className="gsd-ranges">
            <RangeControl label="Period" value={period} min={350} max={1600} step={50} suffix="ms" onChange={setPeriod} />
            <RangeControl label="Dim" value={dim} min={0.05} max={0.5} step={0.05} onChange={setDim} />
            <RangeControl label="Rows" value={rows} min={3} max={10} step={1} onChange={setRows} />
            <RangeControl label="Columns" value={cols} min={3} max={10} step={1} onChange={setCols} />
            <RangeControl label="Cell size" value={cellSize} min={5} max={16} step={1} suffix="px" onChange={setCellSize} />
            <RangeControl label="Cell gap" value={cellGap} min={1} max={7} step={1} suffix="px" onChange={setCellGap} />
          </div>
        </div>
      ) : null}
    </div>
  )
}
