import { useRef, useState, type ReactNode } from 'react'
import { CaretLeft, CaretRight, X } from '@phosphor-icons/react'
import { navigate } from '../router'
import { categoryHref, getVaultItem, getVaultNeighbors } from '../vault-config'

/* Shared building blocks for vault detail pages — the cloned typer-page
   shell: header + close, chip buttons, copy-prompt swap, chip sliders,
   code tabs with the sliding pill, and hairline credit rows. */

/* Copy buttons ship the prompt AND the complete implementation, so people
   can paste working code without a round-trip through an AI tool. */
export function assembleCopy(prompt: string, files: { name: string; code: string }[]) {
  const blocks = files
    .map((f) => `### ${f.name}\n\n\`\`\`\n${f.code.trim()}\n\`\`\``)
    .join('\n\n')
  return `${prompt}\n\nThe complete implementation follows, one file per block — paste it as-is, or hand the whole thing to your AI tool to adapt.\n\n${blocks}`
}

export function DetailShell({ title, children }: { title: string; children: ReactNode }) {
  const path = window.location.pathname
  const item = getVaultItem(path)
  const neighbors = getVaultNeighbors(path)
  const displayTitle = item?.title ?? title
  const category = item?.category ?? 'Experiment'
  const go = (nextPath: string) => {
    navigate(nextPath)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }

  return (
    <article className="flex min-w-0 flex-col gap-10 text-[15px] leading-[1.7]">
      <div className="flex min-w-0 flex-col gap-7">
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-[13px] leading-none">
          <a
            href="/"
            onClick={(event) => { event.preventDefault(); go('/') }}
            className="shrink-0 text-[var(--text-secondary)] transition-colors duration-150 hover:text-[var(--text-primary)]"
          >
            Home
          </a>
          <span aria-hidden="true" className="text-[var(--text-tertiary)]">/</span>
          {item ? (
            <a
              href={categoryHref(item.category)}
              onClick={(event) => { event.preventDefault(); go(categoryHref(item.category)) }}
              className="shrink-0 text-[var(--text-secondary)] transition-colors duration-150 hover:text-[var(--text-primary)]"
            >
              {category}
            </a>
          ) : <span className="shrink-0 text-[var(--text-secondary)]">{category}</span>}
          <span aria-hidden="true" className="text-[var(--text-tertiary)]">/</span>
          <span aria-current="page" className="truncate font-medium text-[var(--text-primary)]">{displayTitle}</span>
        </nav>

        <header className="flex min-w-0 items-center justify-between gap-4">
          <h1 className="min-w-0 truncate font-semibold text-[var(--text-primary)]">{displayTitle}</h1>
          <div className="flex shrink-0 items-center gap-2">
            {neighbors ? (
              <nav aria-label="Browse experiments" className="grid grid-cols-2 overflow-hidden rounded-[10px] border border-[var(--border-line)] bg-[var(--bg-surface)]">
                <a
                  aria-label={`Previous experiment: ${neighbors.previous.title}`}
                  title={neighbors.previous.title}
                  href={neighbors.previous.path}
                  onClick={(event) => { event.preventDefault(); go(neighbors.previous.path) }}
                  className="grid size-8 place-items-center border-r border-[var(--border-line)] text-[var(--text-secondary)] transition-[background-color,color,transform] duration-150 hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] active:scale-[0.96] focus-visible:relative focus-visible:z-10 focus-visible:outline focus-visible:outline-1 focus-visible:outline-[var(--text-primary)] focus-visible:outline-offset-[-2px]"
                >
                  <CaretLeft size={15} weight="bold" aria-hidden="true" />
                </a>
                <a
                  aria-label={`Next experiment: ${neighbors.next.title}`}
                  title={neighbors.next.title}
                  href={neighbors.next.path}
                  onClick={(event) => { event.preventDefault(); go(neighbors.next.path) }}
                  className="grid size-8 place-items-center text-[var(--text-secondary)] transition-[background-color,color,transform] duration-150 hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] active:scale-[0.96] focus-visible:relative focus-visible:z-10 focus-visible:outline focus-visible:outline-1 focus-visible:outline-[var(--text-primary)] focus-visible:outline-offset-[-2px]"
                >
                  <CaretRight size={15} weight="bold" aria-hidden="true" />
                </a>
              </nav>
            ) : null}
            <a
              aria-label="Close"
              href="/"
              onClick={(event) => { event.preventDefault(); go('/') }}
              className="relative grid size-8 place-items-center rounded-[10px] text-[var(--text-secondary)] transition-[background-color,color,transform] duration-150 ease-[var(--ease-out)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] active:scale-[0.96] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[var(--text-primary)]"
            >
              <X size={15} weight="regular" aria-hidden="true" />
            </a>
          </div>
        </header>
      </div>
      {children}
    </article>
  )
}

export function ChipButton({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-7 shrink-0 items-center gap-1.5 self-start rounded-lg border border-[var(--border-line)] bg-[var(--bg-surface)] px-3 text-[12px] font-medium text-[var(--text-secondary)] transition-colors duration-150 ease-[var(--ease-out)] hover:border-[var(--border-ring)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] active:scale-[0.98]"
    >
      {children}
    </button>
  )
}

export function CopyPromptChip({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  const onClick = () => {
    navigator.clipboard?.writeText(text).catch(() => {})
    setCopied(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), 1600)
  }
  return (
    <button
      type="button"
      aria-live="polite"
      onClick={onClick}
      className="inline-flex h-7 shrink-0 items-center self-start rounded-lg border border-[var(--border-line)] bg-[var(--bg-surface)] px-3 text-[12px] font-medium text-[var(--text-secondary)] transition-colors duration-150 ease-[var(--ease-out)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-ring)] hover:text-[var(--text-primary)] active:scale-[0.98]"
    >
      <span className="relative inline-flex h-[1.2em] items-center whitespace-nowrap align-middle ease-[var(--ease-out)] transition-[width] duration-200" style={{ width: copied ? 48 : 68 }}>
        <span aria-hidden={copied} className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-[opacity,filter] duration-200 ease-[var(--ease-out)] ${copied ? 'opacity-0 blur-[3px]' : 'opacity-100 blur-0'}`}>Copy prompt</span>
        <span aria-hidden={!copied} className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-[opacity,filter] duration-200 ease-[var(--ease-out)] ${copied ? 'opacity-100 blur-0 text-[var(--copy-ok)]' : 'opacity-0 blur-[3px]'}`}>Copied</span>
      </span>
    </button>
  )
}

export function SliderChip({
  label, min, max, value, format, onChange,
}: { label: string; min: number; max: number; value: number; format: (v: number) => string; onChange: (v: number) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const pct = ((value - min) / (max - min)) * 100
  const formattedValue = format(value)
  let keyboardStep = (max - min) / 100
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const up = Math.min(max, value + keyboardStep)
    const down = Math.max(min, value - keyboardStep)
    if (format(up) !== formattedValue || format(down) !== formattedValue) break
    keyboardStep *= 2
  }
  const fromEvent = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect()
    const k = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
    onChange(min + k * (max - min))
  }
  const fromKey = (e: React.KeyboardEvent) => {
    const clamp = (next: number) => Math.min(max, Math.max(min, next))
    const next = {
      ArrowLeft: value - keyboardStep,
      ArrowDown: value - keyboardStep,
      ArrowRight: value + keyboardStep,
      ArrowUp: value + keyboardStep,
      PageDown: value - keyboardStep * 10,
      PageUp: value + keyboardStep * 10,
      Home: min,
      End: max,
    }[e.key]
    if (next === undefined) return
    e.preventDefault()
    onChange(clamp(next))
  }
  return (
    <label className="flex min-w-[9rem] flex-1 flex-col">
      <div
        ref={ref}
        role="slider"
        tabIndex={0}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={formattedValue}
        aria-label={label}
        onKeyDown={fromKey}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); fromEvent(e) }}
        onPointerMove={(e) => { if (e.buttons) fromEvent(e) }}
        className="relative flex h-8 w-full cursor-pointer touch-none select-none items-center overflow-hidden rounded-lg border border-[var(--border-line)] bg-[var(--bg-page)] outline-none ring-[var(--border-ring)] focus-visible:ring-1"
      >
        <span className="pointer-events-none absolute inset-y-0 left-0 bg-[var(--bg-hover)]" style={{ width: `${pct}%` }} />
        <span className="pointer-events-none absolute top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-[var(--text-primary)] transition-opacity duration-150 opacity-40" style={{ left: `max(3px, calc(${pct}% - 1.5px))` }} />
        <span className="pointer-events-none relative z-10 pl-3 text-[12px] text-[var(--text-secondary)]">{label}</span>
        <span className="pointer-events-none relative z-10 ml-auto mr-3 text-[12px] tabular-nums text-[var(--text-secondary)]">{format(value)}</span>
      </div>
    </label>
  )
}

export function CodeTabs({ tabs }: { tabs: { file: string; code: string }[] }) {
  const [tab, setTab] = useState(0)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null)

  const select = (i: number) => {
    setTab(i)
    const el = tabRefs.current[i]
    if (el) setPill({ x: el.offsetLeft, w: el.offsetWidth })
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border-line)] bg-[var(--bg-surface)]">
      <div className="flex items-center border-b border-[var(--border-line)] p-1">
        <div role="tablist" className="relative flex min-w-0 flex-1 flex-nowrap gap-0 overflow-x-auto">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 rounded-md border border-[var(--border-line)] bg-[var(--bg-hover)]"
            style={{
              transform: `translateX(${pill?.x ?? 0}px)`,
              width: pill?.w ?? tabRefs.current[0]?.offsetWidth ?? 0,
              transition: 'transform 0.34s var(--ease-out), width 0.34s var(--ease-out)',
            }}
          />
          {tabs.map((t, i) => (
            <button
              key={t.file}
              ref={(el) => { tabRefs.current[i] = el }}
              type="button"
              role="tab"
              aria-selected={tab === i}
              onClick={() => select(i)}
              className={`relative z-10 shrink-0 whitespace-nowrap rounded-md px-2 py-1 text-[12px] font-medium transition-colors duration-150 ${tab === i ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}`}
            >
              {t.file}
            </button>
          ))}
        </div>
      </div>
      <pre className="max-h-96 overflow-auto overscroll-none p-4 font-mono text-[13px] leading-[1.7] tracking-[-0.01em] text-[var(--text-body)]">
        {tabs[tab].code}
      </pre>
    </div>
  )
}

export function CreditRows({ rows }: { rows: readonly (readonly [string, string])[] }) {
  return (
    <section className="flex flex-col gap-3">
      <header className="flex items-center justify-between gap-3 pb-2 border-b border-[var(--border-line)]">
        <h2 className="font-semibold text-[var(--text-primary)]">Credits</h2>
      </header>
      <div>
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between border-b border-[var(--border-subtle)] py-2 last:border-b-0">
            <span className="text-[var(--text-secondary)]">{k}</span>
            <span className="text-[var(--text-primary)]">{v}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
