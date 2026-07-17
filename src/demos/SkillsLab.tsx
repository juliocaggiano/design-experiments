import { useState, type CSSProperties } from 'react'

const LIGHTNESS = [0.94, 0.79, 0.64, 0.49, 0.32]
const CHROMA_SCALE = [0.28, 0.62, 0.9, 1, 0.72]
const STEPS = ['100', '300', '500', '700', '900']

export interface BetterColorsDemoProps {
  hue?: number
  chroma?: number
  compact?: boolean
}

export function BetterColorsDemo({ hue = 264, chroma = 0.2, compact = false }: BetterColorsDemoProps) {
  const renderedHue = compact ? 'calc(var(--palette-hue-start) + var(--palette-hue-shift))' : hue

  return (
    <div
      className={`relative aspect-[1344/520] w-full select-none overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)] ${compact ? 'better-colors-cycle' : ''}`}
      style={compact ? { '--palette-hue-start': hue } as CSSProperties : undefined}
    >
      <div className="absolute inset-0 flex items-center justify-center p-[6%]">
        <div className={`w-[min(94%,520px)] rounded-xl border border-[var(--border-line)] bg-[var(--bg-surface)] ${compact ? 'p-2' : 'p-2 sm:p-3'}`}>
          <div className="flex items-center gap-3 px-1 pb-2">
            <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: `oklch(0.64 ${chroma * 0.9} ${renderedHue})` }} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[clamp(10px,1.3vw,13px)] font-medium text-[var(--text-primary)]">Perceptual palette</p>
              <p className={`${compact ? 'max-sm:hidden' : ''} truncate text-[clamp(9px,1vw,11px)] text-[var(--text-tertiary)]`}>One hue · even lightness</p>
            </div>
            <span className="rounded-lg border border-[var(--border-line)] bg-[var(--bg-page)] px-2 py-1 font-mono text-[clamp(9px,1vw,11px)] tabular-nums text-[var(--text-secondary)]">
              {compact ? 'Cycling' : `${Math.round(hue)}°`}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5 border-t border-[var(--border-line)] pt-2">
            {LIGHTNESS.map((lightness, index) => {
              const color = `oklch(${lightness} ${chroma * CHROMA_SCALE[index]} ${renderedHue})`
              return (
                <div key={lightness} className="min-w-0">
                  <div
                    aria-label={`Palette step ${STEPS[index]}`}
                    className="aspect-[1.2/1] rounded-lg shadow-[inset_0_0_0_1px_oklch(0_0_0/0.08)] transition-[background-color] duration-300 ease-[var(--ease-out)]"
                    style={{ backgroundColor: color }}
                  />
                  <span className={`${compact ? 'max-sm:hidden' : ''} mt-1 block text-center font-mono text-[clamp(8px,0.9vw,10px)] tabular-nums text-[var(--text-tertiary)]`}>
                    {STEPS[index]}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export interface BetterTypographyDemoProps {
  size?: number
  leading?: number
  measure?: number
  compact?: boolean
}

export function BetterTypographyDemo({ size = 52, leading = 1.08, measure = 520, compact = false }: BetterTypographyDemoProps) {
  const displaySize = compact ? Math.max(18, size - 8) : size

  return (
    <div className="relative aspect-[1344/520] w-full select-none overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)]">
      <div className="absolute inset-0 flex items-center justify-center p-[6%]">
        <div className={`w-[min(94%,520px)] rounded-xl border border-[var(--border-line)] bg-[var(--bg-surface)] ${compact ? 'p-2.5' : 'p-2 sm:p-3'}`}>
          <div className={`flex items-center gap-3 px-1 ${compact ? 'pb-2.5' : 'pb-2'}`}>
            <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-[var(--text-tertiary)]" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[clamp(10px,1.3vw,13px)] font-medium text-[var(--text-primary)]">Type study</p>
              <p className={`${compact ? 'max-sm:hidden' : ''} truncate text-[clamp(9px,1vw,11px)] text-[var(--text-tertiary)]`}>Scale · rhythm · measure</p>
            </div>
            <span className="rounded-lg border border-[var(--border-line)] bg-[var(--bg-page)] px-2 py-1 font-mono text-[clamp(9px,1vw,11px)] tabular-nums text-[var(--text-secondary)]">
              {Math.round(measure / 8)}ch
            </span>
          </div>

          <div className={`border-t border-[var(--border-line)] px-1 ${compact ? 'pt-2.5' : 'pt-2'}`}>
            <div className="min-w-0" style={{ width: `min(100%, ${measure}px)` }}>
              <p className="mb-[clamp(3px,0.7vw,7px)] text-[clamp(7px,0.8vw,10px)] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
                Form follows language
              </p>
              <h2
                className={`${compact ? '' : 'font-[writer]'} tracking-[-0.035em] text-pretty text-[var(--text-primary)]`}
                style={{ fontSize: `clamp(18px, ${displaySize / 14}vw, ${displaySize}px)`, lineHeight: leading }}
              >
                Type that knows its role.
              </h2>
              <p className={`${compact ? 'max-sm:hidden' : ''} mt-[clamp(4px,0.8vw,8px)] truncate text-[clamp(9px,1vw,11px)] leading-[1.55] text-[var(--text-secondary)]`}>
                A quiet scale, deliberate measure, and enough contrast.
              </p>
            </div>
            <div className={`${compact ? 'max-sm:hidden' : ''} mt-2 grid grid-cols-3 gap-1.5`}>
              {[
                ['Size', `${Math.round(size)}px`],
                ['Leading', leading.toFixed(2)],
                ['Measure', `${Math.round(measure / 8)}ch`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-[var(--bg-page)] px-2 py-1">
                  <span className="text-[clamp(8px,0.8vw,9px)] text-[var(--text-tertiary)]">{label}</span>
                  <span className="ml-1 font-mono text-[clamp(8px,0.9vw,10px)] tabular-nums text-[var(--text-secondary)]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <path d="M8 3.5v9M3.5 8h9" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m3.5 8.25 2.8 2.75 6.2-6" />
    </svg>
  )
}

export interface BetterUiDemoProps {
  compact?: boolean
  interactive?: boolean
}

export function BetterUiDemo({ compact = false, interactive = false }: BetterUiDemoProps) {
  const [saved, setSaved] = useState(false)
  const iconClass = `absolute inset-0 size-full duration-200 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none ${interactive ? 'transition-[opacity,transform,filter]' : 'transition-[opacity,transform]'}`
  const plusState = interactive
    ? (saved ? 'scale-25 opacity-0 blur-[4px]' : 'scale-100 opacity-100 blur-0')
    : 'scale-100 opacity-100 group-hover:scale-25 group-hover:opacity-0'
  const checkState = interactive
    ? (saved ? 'scale-100 opacity-100 blur-0' : 'scale-25 opacity-0 blur-[4px]')
    : 'scale-25 opacity-0 group-hover:scale-100 group-hover:opacity-100'

  const actionContents = (
    <>
      <span className="relative size-4 shrink-0" aria-hidden="true">
        <span className={`${iconClass} ${plusState}`}>
          <PlusIcon />
        </span>
        <span className={`${iconClass} ${checkState}`}>
          <CheckIcon />
        </span>
      </span>
      <span>{saved ? 'Saved' : 'Save'}</span>
    </>
  )

  const actionClass = `relative inline-flex h-7 shrink-0 select-none items-center justify-center gap-1.5 rounded-lg border border-[var(--border-line)] bg-[var(--bg-surface)] px-2.5 text-[12px] font-medium text-[var(--text-secondary)] transition-[border-color,background-color,color,transform] duration-150 ease-[var(--ease-out)] hover:border-[var(--border-ring)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] active:scale-[0.96] after:absolute after:left-1/2 after:top-1/2 after:size-10 after:-translate-x-1/2 after:-translate-y-1/2 after:content-['']`

  return (
    <div className="relative aspect-[1344/520] w-full select-none overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)]">
      <div className="absolute inset-0 flex items-center justify-center p-[6%]">
        <div className={`w-[min(94%,440px)] rounded-xl border border-[var(--border-line)] bg-[var(--bg-surface)] ${compact ? 'p-2' : 'p-2 sm:p-3'}`}>
          <div className="flex items-center gap-3 px-1 pb-2">
            <span
              aria-hidden="true"
              className={`size-1.5 shrink-0 rounded-full transition-colors duration-200 ${saved ? 'bg-[var(--copy-ok)]' : 'bg-[var(--text-tertiary)]'}`}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[clamp(10px,1.3vw,13px)] font-medium text-[var(--text-primary)]">Interface review</p>
              <p className={`${compact ? 'max-sm:hidden' : ''} truncate text-[clamp(9px,1vw,11px)] text-[var(--text-tertiary)]`}>
                {saved ? 'All details reviewed' : '12 details ready to polish'}
              </p>
            </div>
            {interactive ? (
              <button
                type="button"
                aria-pressed={saved}
                onClick={() => setSaved((value) => !value)}
                className={actionClass}
              >
                {actionContents}
              </button>
            ) : (
              <div className={actionClass}>{actionContents}</div>
            )}
          </div>
          <div className="grid grid-cols-3 gap-1.5 border-t border-[var(--border-line)] pt-2">
            {[
              ['Radius', '12px'],
              ['Motion', '200ms'],
              ['Hit area', '40px'],
            ].map(([label, value]) => (
              <div key={label} className="min-w-0 rounded-lg bg-[var(--bg-page)] px-2 py-1.5">
                <span className="block truncate text-[clamp(8px,0.9vw,10px)] text-[var(--text-tertiary)]">{label}</span>
                <span className="block truncate text-[clamp(9px,1vw,11px)] tabular-nums text-[var(--text-secondary)]">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
