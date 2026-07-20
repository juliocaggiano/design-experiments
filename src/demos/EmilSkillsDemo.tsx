import {
  CaretDown,
  Check,
  Plus,
} from '@phosphor-icons/react'
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type RefObject,
} from 'react'
import type {
  EmilSkillId,
  EmilSkillVariantId,
} from '../emilskills/catalog'
import './EmilSkillsDemo.css'

export interface EmilSkillsControls {
  replay?: () => void
  reset?: () => void
}

export interface EmilSkillsDemoProps {
  id: EmilSkillId
  variant?: EmilSkillVariantId
  compact?: boolean
  controls?: EmilSkillsControls
}

type DemoProps = {
  active: boolean
  compact: boolean
  controls?: EmilSkillsControls
  variant: EmilSkillVariantId
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function useViewportActive(compact: boolean) {
  const root = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(!compact)

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

  return { root, active }
}

function useAutoplay({
  active,
  compact,
  controls,
  interval,
  replay,
  reset,
  settle,
  variant,
}: {
  active: boolean
  compact: boolean
  controls?: EmilSkillsControls
  interval: number
  replay: () => void
  reset: () => void
  settle: () => void
  variant: EmilSkillVariantId
}) {
  const replayRef = useRef(replay)
  const resetRef = useRef(reset)
  const settleRef = useRef(settle)
  const startedVariant = useRef<EmilSkillVariantId | null>(null)
  replayRef.current = replay
  resetRef.current = reset
  settleRef.current = settle

  if (controls) {
    controls.replay = () => replayRef.current()
    controls.reset = () => resetRef.current()
  }

  useEffect(() => {
    if (!active) {
      startedVariant.current = null
      resetRef.current()
      return
    }
    if (prefersReducedMotion()) {
      startedVariant.current = variant
      settleRef.current()
      return
    }
    if (startedVariant.current !== variant) {
      startedVariant.current = variant
      replayRef.current()
    }
    if (!compact) return
    const timer = window.setInterval(() => replayRef.current(), interval)
    return () => window.clearInterval(timer)
  }, [active, compact, interval, variant])
}

function clearTimers(timers: RefObject<number[]>) {
  timers.current.forEach(window.clearTimeout)
  timers.current = []
}

function DesignEngineeringDemo({ active, compact, controls, variant }: DemoProps) {
  const [saved, setSaved] = useState(false)
  const [open, setOpen] = useState(false)
  const [count, setCount] = useState(12408)
  const [cycle, setCycle] = useState(0)
  const timers = useRef<number[]>([])

  const reset = () => {
    clearTimers(timers)
    setSaved(false)
    setOpen(false)
    setCount(12408)
  }
  const settle = () => {
    clearTimers(timers)
    setSaved(variant === 'button-feedback')
    setOpen(variant === 'popover-origin')
    setCount(variant === 'tabular-numbers' ? 12864 : 12408)
  }
  const replay = () => {
    clearTimers(timers)
    setCycle((value) => value + 1)
    if (variant === 'popover-origin') {
      setOpen(false)
      timers.current.push(window.setTimeout(() => setOpen(true), 130))
      timers.current.push(window.setTimeout(() => setOpen(false), 1700))
      return
    }
    if (variant === 'tabular-numbers') {
      setCount((value) => value === 12408 ? 12864 : 12408)
      return
    }
    setSaved(false)
    timers.current.push(window.setTimeout(() => setSaved(true), 520))
  }

  useAutoplay({ active, compact, controls, interval: 3300, replay, reset, settle, variant })
  useEffect(() => () => clearTimers(timers), [])

  if (variant === 'popover-origin') {
    return (
      <section className="ek-stage ek-origin-demo" aria-label="Origin-aware popover">
        <div className="ek-origin-anchor">
          <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
            Options <CaretDown size={13} weight="bold" />
          </button>
          <div key={cycle} className="ek-origin-popover" data-open={open ? 'true' : 'false'}>
            <span>Duplicate</span><span>Move to folder</span><span>Archive</span>
          </div>
        </div>
      </section>
    )
  }

  if (variant === 'tabular-numbers') {
    return (
      <section className="ek-stage" aria-label="Stable tabular number change">
        <button type="button" className="ek-number-card" onClick={replay}>
          <small>Weekly downloads</small>
          <strong key={cycle}>{count.toLocaleString()}</strong>
        </button>
      </section>
    )
  }

  return (
    <section className="ek-stage" aria-label="Responsive button feedback">
      <button type="button" className="ek-save-button" data-saved={saved ? 'true' : 'false'} onClick={replay}>
        <span key={cycle}>{saved ? <><Check size={14} weight="bold" /> Saved</> : 'Save changes'}</span>
      </button>
    </section>
  )
}

/* Feed-only thumbnail (batch 11): the Pinterest banking-UI reference
   (artifacts/design-qa/batch11-2026-07-20/ref/pinterest-banking-app.jpg)
   translated to the vault's light grayscale. Static by design — the
   reference is a still UI frame, so there is no autoplay loop and reduced
   motion is trivially satisfied. The detail page keeps the interactive
   button-feedback specimen; the divergence is documented in PROJECT.md. */
function DesignEngineeringThumb() {
  return (
    <section className="ek-stage" aria-label="Banking UI composition">
      <div className="de-thumb" aria-hidden="true">
        <div className="de-head">
          <span className="de-avatar"><i /></span>
          <span className="de-id">
            <strong>Matango Inc</strong>
            <small>hello@matango.co</small>
          </span>
          <strong className="de-balance">$11,000.00</strong>
        </div>
        <div className="de-card">
          <div className="de-seg">
            <span>Bank</span><span>Card</span><span className="de-pill">Pay Later</span>
          </div>
          <div className="de-seg">
            <span className="de-pill">30</span><span>60</span><span>90</span><span>Days</span>
          </div>
          <div className="de-row"><span>Fee 1.6%</span><span>$176.00</span></div>
          <div className="de-row de-total"><span>Total</span><span>$11,176.00</span></div>
        </div>
      </div>
    </section>
  )
}

const VOCAB_LABELS: Partial<Record<EmilSkillVariantId, string>> = {
  'pop-in': 'Pop in',
  'rubber-band': 'Rubber-banding',
  stagger: 'Stagger',
  shimmer: 'Shimmer',
}

function VocabularyDemo({ active, compact, controls, variant }: DemoProps) {
  const [cycle, setCycle] = useState(0)
  const replay = () => setCycle((value) => value + 1)
  const reset = () => setCycle(0)
  const settle = reset
  useAutoplay({ active, compact, controls, interval: 2900, replay, reset, settle, variant })

  return (
    <section className="ek-stage" aria-label={`${VOCAB_LABELS[variant] ?? 'Animation'} example`}>
      <button type="button" className="ek-vocabulary-action" onClick={replay}>
        {variant === 'stagger' ? (
          <span key={cycle} className="ek-stagger-dots"><i /><i /><i /><i /></span>
        ) : (
          <span key={cycle} className={`ek-motion-chip ek-motion-${variant}`}>{VOCAB_LABELS[variant] ?? 'Motion'}</span>
        )}
      </button>
    </section>
  )
}

function AppleDemo({ active, compact, controls, variant }: DemoProps) {
  const [on, setOn] = useState(false)
  const [open, setOpen] = useState(false)
  const [pulled, setPulled] = useState(false)
  const [drag, setDrag] = useState(22)
  const knob = useRef<HTMLSpanElement>(null)
  const spring = useRef({ x: 0, v: 0, target: 0 })
  const timers = useRef<number[]>([])

  useEffect(() => {
    if (variant !== 'interruptible-toggle' || !active) return
    const state = spring.current
    let previous = performance.now()
    let frame = 0
    const tick = (time: number) => {
      const dt = Math.min(0.032, (time - previous) / 1000)
      previous = time
      if (prefersReducedMotion()) {
        state.x = state.target
        state.v = 0
      } else {
        const frequency = (2 * Math.PI) / 0.34
        const acceleration = -(frequency ** 2) * (state.x - state.target) - 1.6 * frequency * state.v
        state.v += acceleration * dt
        state.x += state.v * dt
      }
      if (knob.current) knob.current.style.transform = `translateX(${(state.x * 40).toFixed(2)}px)`
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [active, variant])

  const reset = () => {
    clearTimers(timers)
    setOn(false)
    setOpen(false)
    setPulled(false)
    setDrag(22)
    spring.current.target = 0
  }
  const settle = () => {
    clearTimers(timers)
    setOn(variant === 'interruptible-toggle')
    setOpen(variant === 'spatial-origin')
    setPulled(false)
    setDrag(variant === 'direct-drag' ? 78 : 22)
    spring.current.target = variant === 'interruptible-toggle' ? 1 : 0
  }
  const replay = () => {
    clearTimers(timers)
    if (variant === 'rubber-band') {
      setPulled(true)
      timers.current.push(window.setTimeout(() => setPulled(false), 580))
      return
    }
    if (variant === 'direct-drag') {
      setDrag((value) => value < 50 ? 78 : 22)
      return
    }
    if (variant === 'spatial-origin') {
      setOpen((value) => !value)
      return
    }
    setOn((value) => {
      const next = !value
      spring.current.target = next ? 1 : 0
      return next
    })
  }

  useAutoplay({ active, compact, controls, interval: 2800, replay, reset, settle, variant })
  useEffect(() => () => clearTimers(timers), [])

  const moveDrag = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setDrag(Math.max(8, Math.min(92, ((event.clientX - rect.left) / rect.width) * 100)))
  }

  if (variant === 'rubber-band') {
    return (
      <section className="ek-stage" aria-label="Rubber-band boundary">
        <button type="button" className="ek-rubber-control" data-pulled={pulled ? 'true' : 'false'} onClick={replay}>
          <span>Pull</span>
        </button>
      </section>
    )
  }

  if (variant === 'direct-drag') {
    return (
      <section className="ek-stage" aria-label="Direct manipulation slider">
        <div
          className="ek-direct-track"
          role="slider"
          tabIndex={0}
          aria-label="Direct manipulation position"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(drag)}
          onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); moveDrag(event) }}
          onPointerMove={(event) => { if (event.buttons) moveDrag(event) }}
          onKeyDown={(event) => {
            if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
            event.preventDefault()
            setDrag((value) => Math.max(8, Math.min(92, value + (event.key === 'ArrowRight' ? 8 : -8))))
          }}
        >
          <span style={{ left: `${drag}%` }} />
        </div>
      </section>
    )
  }

  if (variant === 'spatial-origin') {
    return (
      <section className="ek-stage ek-spatial-demo" aria-label="Origin-aware expanding surface">
        <div className="ek-spatial-anchor">
          <button type="button" onClick={replay} aria-expanded={open} aria-label={open ? 'Close actions' : 'Open actions'}><Plus size={17} /></button>
          <div className="ek-spatial-panel" data-open={open ? 'true' : 'false'}><span>New note</span><span>New task</span></div>
        </div>
      </section>
    )
  }

  return (
    <section className="ek-stage" aria-label="Interruptible spring toggle">
      <button type="button" className="ek-spring-toggle" data-on={on ? 'true' : 'false'} onClick={replay} aria-pressed={on}>
        <span ref={knob} />
      </button>
    </section>
  )
}

const DEFAULT_VARIANTS: Record<EmilSkillId, EmilSkillVariantId> = {
  'emil-design-eng': 'button-feedback',
  'animation-vocabulary': 'pop-in',
  'apple-design': 'interruptible-toggle',
}

export function EmilSkillsDemo({
  id,
  variant = DEFAULT_VARIANTS[id],
  compact = false,
  controls,
}: EmilSkillsDemoProps) {
  const { root, active } = useViewportActive(compact)
  const props = { active, compact, controls, variant }

  return (
    <div
      ref={root}
      className="ek-box"
      data-compact={compact ? 'true' : 'false'}
      data-active={active ? 'true' : 'false'}
      data-skill={id}
      data-variant={variant}
    >
      {id === 'emil-design-eng' ? (compact ? <DesignEngineeringThumb /> : <DesignEngineeringDemo {...props} />) : null}
      {id === 'animation-vocabulary' ? <VocabularyDemo {...props} /> : null}
      {id === 'apple-design' ? <AppleDemo {...props} /> : null}
    </div>
  )
}
