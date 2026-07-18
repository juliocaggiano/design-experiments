/* Reactive Dither tone audit — normalizes the reference render and the
   implementation's settled capture to the same tile-relative frame (crop to
   the detected tile bounding box, resample onto a shared grid) and reports
   overall mean-absolute luminance error plus a coarse delta grid, so the
   comparison no longer depends on hand-placed regions tied to one specific
   artwork. Run: node scripts/audit-reactive-dither-tones.mjs [capture.png] */
import fs from 'node:fs'
import { PNG } from 'pngjs'

const REFERENCE = 'artifacts/design-qa/reactive-dither-2026-07-18/symbol-reference-3.png'
const CAPTURE = process.argv[2] ?? 'artifacts/design-qa/reactive-dither-2026-07-18/detail-settled-1440.png'
const CAPTURE_ROW_LIMIT = 400 // the playground controls sit below the stage
const GRID = 256 // normalized comparison resolution
const CELLS = 8 // coarse delta grid is CELLS × CELLS

/* Named patches in tile-normalized coordinates (u, v, half-size). */
const PATCHES = [
  ['field corner', [0.12, 0.12, 0.05]],
  ['white triangle', [0.5, 0.3, 0.05]],
  ['left fold', [0.27, 0.62, 0.05]],
  ['right fold', [0.73, 0.62, 0.05]],
  ['center band', [0.5, 0.72, 0.04]],
]

const load = (path) => PNG.sync.read(fs.readFileSync(path))
const luminanceAt = (png, index) =>
  0.2126 * png.data[index] + 0.7152 * png.data[index + 1] + 0.0722 * png.data[index + 2]

function tileBBox(png, rowLimit) {
  const rows = Math.min(png.height, rowLimit)
  let minX = png.width, minY = rows, maxX = -1, maxY = -1
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      if (luminanceAt(png, (y * png.width + x) * 4) < 235) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }
  return { minX, minY, maxX, maxY }
}

/* Box-average the source region that maps to normalized cell (u, v). */
function normalizedLuminance(png, bbox, u, v) {
  const x0 = bbox.minX + u * (bbox.maxX - bbox.minX)
  const y0 = bbox.minY + v * (bbox.maxY - bbox.minY)
  const x1 = bbox.minX + (u + 1 / GRID) * (bbox.maxX - bbox.minX)
  const y1 = bbox.minY + (v + 1 / GRID) * (bbox.maxY - bbox.minY)
  let sum = 0, count = 0
  for (let y = Math.floor(y0); y < Math.ceil(y1); y += 1) {
    for (let x = Math.floor(x0); x < Math.ceil(x1); x += 1) {
      if (x < 0 || y < 0 || x >= png.width || y >= png.height) continue
      sum += luminanceAt(png, (y * png.width + x) * 4)
      count += 1
    }
  }
  return count ? sum / count : 255
}

function normalize(png, rowLimit) {
  const bbox = tileBBox(png, rowLimit)
  const grid = new Float64Array(GRID * GRID)
  for (let gy = 0; gy < GRID; gy += 1) {
    for (let gx = 0; gx < GRID; gx += 1) {
      grid[gy * GRID + gx] = normalizedLuminance(png, bbox, gx / GRID, gy / GRID)
    }
  }
  return { bbox, grid }
}

function patchMean(grid, u, v, half) {
  let sum = 0, count = 0
  const x0 = Math.max(0, Math.round((u - half) * GRID))
  const x1 = Math.min(GRID - 1, Math.round((u + half) * GRID))
  const y0 = Math.max(0, Math.round((v - half) * GRID))
  const y1 = Math.min(GRID - 1, Math.round((v + half) * GRID))
  for (let y = y0; y <= y1; y += 1) {
    for (let x = x0; x <= x1; x += 1) {
      sum += grid[y * GRID + x]
      count += 1
    }
  }
  return count ? sum / count : -1
}

const referencePng = load(REFERENCE)
const capturePng = load(CAPTURE)
const reference = normalize(referencePng, Number.POSITIVE_INFINITY)
const mine = normalize(capturePng, CAPTURE_ROW_LIMIT)

console.log(`REFERENCE:      tile ${reference.bbox.maxX - reference.bbox.minX}×${reference.bbox.maxY - reference.bbox.minY} px at (${reference.bbox.minX}, ${reference.bbox.minY})`)
console.log(`IMPLEMENTATION: tile ${mine.bbox.maxX - mine.bbox.minX}×${mine.bbox.maxY - mine.bbox.minY} px at (${mine.bbox.minX}, ${mine.bbox.minY})`)

let mae = 0
for (let index = 0; index < GRID * GRID; index += 1) {
  mae += Math.abs(mine.grid[index] - reference.grid[index])
}
mae /= GRID * GRID
console.log(`\nOVERALL mean absolute luminance error: ${mae.toFixed(1)} / 255`)

console.log('\nPATCHES (reference → implementation, luminance):')
for (const [name, [u, v, half]] of PATCHES) {
  const ref = patchMean(reference.grid, u, v, half)
  const got = patchMean(mine.grid, u, v, half)
  const delta = got - ref
  console.log(`  ${name.padEnd(15)} ${ref.toFixed(1)} → ${got.toFixed(1)}  (${delta >= 0 ? '+' : ''}${delta.toFixed(1)})`)
}

console.log(`\nDELTA GRID ${CELLS}×${CELLS} (implementation − reference):`)
const cell = GRID / CELLS
for (let cy = 0; cy < CELLS; cy += 1) {
  const row = []
  for (let cx = 0; cx < CELLS; cx += 1) {
    let sum = 0, count = 0
    for (let y = cy * cell; y < (cy + 1) * cell; y += 1) {
      for (let x = cx * cell; x < (cx + 1) * cell; x += 1) {
        sum += mine.grid[y * GRID + x] - reference.grid[y * GRID + x]
        count += 1
      }
    }
    row.push((sum / count).toFixed(0).padStart(5))
  }
  console.log(`  ${row.join(' ')}`)
}
