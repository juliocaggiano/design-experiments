import { useEffect, useRef, useState } from 'react'
import { LinkCard, Caption } from '../components/Card'

/* Figma-style canvas: the wordmark sits selected inside a selection rect with
   corner handles, vector nodes scattered along the letter outlines, and a
   blue dimension chip underneath. Nodes are found by edge-sampling a raster
   of the word. */

export function VectorEditorCard() {
  const boxRef = useRef<HTMLDivElement>(null)
  const [nodes, setNodes] = useState<{ x: number; y: number }[]>([])
  const W = 380
  const H = 179

  useEffect(() => {
    // rasterize the word, then collect sparse outline points for the nodes
    const off = document.createElement('canvas')
    off.width = W
    off.height = H
    const ctx = off.getContext('2d', { willReadFrequently: true })!
    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#000'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = `600 ${Math.floor(H * 0.62)}px "neueMontreal", sans-serif`
      ctx.fillText('Arlan', W / 2, H / 2 + 4)
      const img = ctx.getImageData(0, 0, W, H).data
      const pts: { x: number; y: number }[] = []
      const solid = (x: number, y: number) =>
        x >= 0 && y >= 0 && x < W && y < H && img[(y * W + x) * 4 + 3] > 128
      for (let y = 2; y < H - 2; y += 6) {
        for (let x = 2; x < W - 2; x += 6) {
          if (!solid(x, y)) continue
          // boundary cell: solid with at least one empty 4-neighbour
          if (!solid(x - 3, y) || !solid(x + 3, y) || !solid(x, y - 3) || !solid(x, y + 3)) {
            pts.push({ x, y })
          }
        }
      }
      // thin out to roughly the density Figma shows
      setNodes(pts.filter((_, i) => i % 4 === 0))
    }
    document.fonts.load('600 100px "neueMontreal"').finally(draw)
  }, [])

  return (
    <LinkCard href="/vault/vector-editor">
      <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[#f7f7f7]">
        <div style={{ transform: 'scale(1)', transformOrigin: 'center' }}>
          <div ref={boxRef} className="relative inline-block" style={{ width: W, height: H }}>
            {/* selection rectangle */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{ border: '1px solid #0d99ff', transformOrigin: 'left top' }}
            />
            {/* corner handles */}
            {(['-4px -4px auto auto', '-4px auto auto -4px', 'auto -4px -4px auto', 'auto auto -4px -4px'] as const).map((pos, i) => {
              const [top, right, bottom, left] = pos.split(' ')
              return (
                <span
                  key={i}
                  style={{
                    position: 'absolute', zIndex: 10, width: 8, height: 8,
                    backgroundColor: '#fff', border: '1px solid #0d99ff', borderRadius: 1,
                    top: top === 'auto' ? undefined : top,
                    right: right === 'auto' ? undefined : right,
                    bottom: bottom === 'auto' ? undefined : bottom,
                    left: left === 'auto' ? undefined : left,
                  }}
                />
              )
            })}
            {/* dimension chip */}
            <span
              className="pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-[2px] px-1.5 py-0.5 text-[11px] tabular-nums"
              style={{ bottom: -30, backgroundColor: '#0d99ff', color: '#fff' }}
            >
              380 × 179
            </span>
            {/* the wordmark, light blue fill with a blue outline */}
            <div
              className="flex h-full w-full items-center justify-center font-semibold"
              style={{
                fontSize: H * 0.66,
                color: '#eaf5ff',
                WebkitTextStroke: '1px #9fcdf2',
                letterSpacing: '-0.02em',
              }}
            >
              Arlan
            </div>
            {/* vector nodes along letter outlines */}
            {nodes.map((n, i) => (
              <span key={i} className="vec-node" style={{ left: n.x, top: n.y }} />
            ))}
          </div>
        </div>
      </div>
      <Caption title="Figma vector editor" category="Interfaces" />
    </LinkCard>
  )
}
