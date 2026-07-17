import { useRef, useState, type ReactNode } from 'react'
import { navigate } from '../router'

export function Caption({ title, category }: { title: string; category?: string }) {
  return (
    <div data-card-caption className="flex items-center justify-between gap-3 px-1 pt-2.5 pb-1">
      <span className="min-w-0 truncate text-[14px] text-[var(--text-primary)]">{title}</span>
      {category ? <span data-card-category className="shrink-0 text-[12px] text-[var(--text-tertiary)]">{category}</span> : null}
    </div>
  )
}

/* Link cards open the demo's detail page via the in-app router. */
export function LinkCard({
  href,
  children,
  interactive = false,
  label,
}: {
  href: string
  children: ReactNode
  interactive?: boolean
  label?: string
}) {
  const cardClassName = 'group block rounded-xl border border-[var(--border-line)] bg-[var(--bg-surface)] p-2 text-left transition-colors duration-150 ease-[var(--ease-out)] hover:border-[var(--border-ring)]'
  const open = () => {
    navigate(href)
    window.scrollTo(0, 0)
  }

  if (interactive) {
    return (
      <article
        className={`relative ${cardClassName}`}
        onClick={(event) => {
          const target = event.target as Element
          if (target.closest('input, button, textarea, select, a, [role="button"]')) return
          open()
        }}
      >
        <a
          aria-label={label ?? 'Open project'}
          className="sr-only"
          href={href}
          onClick={(event) => {
            event.preventDefault()
            open()
          }}
        >
          {label ?? 'Open project'}
        </a>
        <div>{children}</div>
      </article>
    )
  }

  return (
    <a
      className={cardClassName}
      href={href}
      onClick={(e) => {
        e.preventDefault()
        open()
      }}
    >
      {children}
    </a>
  )
}

export function DemoCard({ children, prompt }: { children: ReactNode; prompt: string }) {
  return (
    <div className="relative block rounded-xl border border-[var(--border-line)] bg-[var(--bg-surface)] p-2 text-left">
      {children}
      <div className="absolute right-4 top-4 z-20">
        <CopyPromptButton prompt={prompt} />
      </div>
    </div>
  )
}

export function CopyPromptButton({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  const onClick = () => {
    navigator.clipboard?.writeText(prompt).catch(() => {})
    setCopied(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), 1600)
  }
  return (
    <button
      type="button"
      aria-live="polite"
      onClick={onClick}
      className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md border border-[var(--border-line)] bg-[var(--bg-page)] px-2 text-[12px] font-medium text-[var(--text-secondary)] transition-colors duration-150 ease-[var(--ease-out)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-ring)] hover:text-[var(--text-primary)] active:scale-[0.98] justify-center max-sm:aspect-square max-sm:!gap-0 max-sm:!px-0"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="9" y="9" width="11" height="11" rx="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
      <span className="hidden sm:inline-flex">
        <span
          className="relative inline-flex h-[1.2em] items-center whitespace-nowrap align-middle ease-[var(--ease-out)] transition-[width] duration-200"
          style={{ width: copied ? 48 : 68 }}
        >
          <span
            aria-hidden={copied}
            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-[opacity,filter] duration-200 ease-[var(--ease-out)] motion-reduce:transition-none ${copied ? 'opacity-0 blur-[3px]' : 'opacity-100 blur-0'}`}
          >
            Copy prompt
          </span>
          <span
            aria-hidden={!copied}
            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-[opacity,filter] duration-200 ease-[var(--ease-out)] motion-reduce:transition-none ${copied ? 'opacity-100 blur-0 text-[var(--copy-ok)]' : 'opacity-0 blur-[3px]'}`}
          >
            Copied
          </span>
        </span>
      </span>
    </button>
  )
}
