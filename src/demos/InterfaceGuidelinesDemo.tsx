import {
  ArrowCounterClockwise,
  Check,
  Circle,
  Copy,
  CursorClick,
  Gauge,
  HandTap,
  Intersect,
  PersonArmsSpread,
  Pulse,
  TextT,
} from '@phosphor-icons/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  INTERFACE_GUIDELINE_CATEGORIES,
  getInterfaceGuidelineCategory,
  type InterfaceGuidelineCategoryId,
} from '../interface-guidelines'
import './InterfaceGuidelinesDemo.css'

const ICONS = {
  interactivity: CursorClick,
  typography: TextT,
  motion: Pulse,
  touch: HandTap,
  optimizations: Gauge,
  accessibility: PersonArmsSpread,
  design: Intersect,
} as const

const COMPACT_RULES = [
  { id: 'motion-speed', title: 'Immediate motion', detail: 'Interaction feedback stays under 200ms.' },
  { id: 'focus-ring', title: 'Visible focus', detail: 'The focus ring follows the control radius.' },
  { id: 'local-feedback', title: 'Local feedback', detail: 'Copy success replaces the original action.' },
] as const

export type InterfaceGuidelinesControls = {
  reset?: () => void
}

export function InterfaceGuidelinesDemo({
  compact = false,
  controls,
}: {
  compact?: boolean
  controls?: InterfaceGuidelinesControls
}) {
  const [categoryId, setCategoryId] = useState<InterfaceGuidelineCategoryId>('design')
  const [completed, setCompleted] = useState(() => new Set<string>(['motion-speed', 'focus-ring']))
  const [copied, setCopied] = useState(false)
  const copyTimer = useRef<number | undefined>(undefined)
  const category = getInterfaceGuidelineCategory(categoryId)
  const visibleRules = compact ? COMPACT_RULES : category.rules

  const reset = useCallback(() => {
    window.clearTimeout(copyTimer.current)
    setCategoryId('design')
    setCompleted(new Set(['motion-speed', 'focus-ring']))
    setCopied(false)
  }, [])

  if (controls) controls.reset = reset

  useEffect(() => () => window.clearTimeout(copyTimer.current), [])

  const completeCount = useMemo(
    () => visibleRules.filter((rule) => completed.has(rule.id)).length,
    [completed, visibleRules],
  )

  const toggleRule = (id: string) => {
    setCompleted((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const demonstrateCopy = () => {
    if (copied) return
    setCopied(true)
    setCompleted((current) => new Set(current).add('local-feedback'))
    window.clearTimeout(copyTimer.current)
    copyTimer.current = window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="ig-demo" data-compact={compact ? 'true' : 'false'}>
      <div className="ig-construction" aria-hidden="true">
        <i data-axis="vertical" data-side="left" />
        <i data-axis="vertical" data-side="right" />
        <i data-axis="horizontal" data-line="1" />
        <i data-axis="horizontal" data-line="2" />
        <i data-axis="horizontal" data-line="3" />
        <i data-axis="horizontal" data-line="4" />
        <i data-axis="horizontal" data-line="5" />
        <i data-axis="horizontal" data-line="6" />
      </div>

      <div className="ig-display-title" aria-hidden="true">
        Interface<br />Craft<br />Checklist
      </div>

      <section className="ig-sheet" aria-label="Interactive interface quality checklist">
        <header className="ig-sheet-header">
          <span>
            <strong>{compact ? 'Ship readiness' : category.label}</strong>
            <small>{compact ? 'One interaction, three principles' : category.summary}</small>
          </span>
          <span className="ig-score" aria-live="polite">
            <b>{completeCount}</b> / {visibleRules.length}
          </span>
        </header>

        {!compact ? (
          <div className="ig-category-tabs" role="tablist" aria-label="Guideline categories">
            {INTERFACE_GUIDELINE_CATEGORIES.map((item) => {
              const Icon = ICONS[item.id]
              return (
                <button
                  type="button"
                  role="tab"
                  aria-selected={categoryId === item.id}
                  key={item.id}
                  onClick={() => setCategoryId(item.id)}
                >
                  <Icon size={14} weight="regular" aria-hidden="true" />
                  {item.label}
                </button>
              )
            })}
          </div>
        ) : null}

        <div className="ig-rule-list">
          {visibleRules.map((rule) => {
            const isComplete = completed.has(rule.id)
            const content = (
              <>
                <span className="ig-rule-icon" data-complete={isComplete ? 'true' : 'false'} aria-hidden="true">
                  {isComplete ? <Check size={12} weight="bold" /> : <Circle size={9} weight="regular" />}
                </span>
                <span>
                  <strong>{rule.title}</strong>
                  <small>{rule.detail}</small>
                </span>
              </>
            )

            return compact ? (
              <div className="ig-rule" data-complete={isComplete ? 'true' : 'false'} key={rule.id}>{content}</div>
            ) : (
              <button
                type="button"
                className="ig-rule"
                data-complete={isComplete ? 'true' : 'false'}
                aria-pressed={isComplete}
                key={rule.id}
                onClick={() => toggleRule(rule.id)}
              >
                {content}
              </button>
            )
          })}
        </div>

        {compact ? (
          <footer className="ig-sheet-footer">
            <span>Feedback should live beside its trigger.</span>
            <button
              type="button"
              className="ig-copy"
              data-copied={copied ? 'true' : 'false'}
              onClick={demonstrateCopy}
            >
              <span><Copy size={13} aria-hidden="true" /> Copy token</span>
              <span><Check size={13} weight="bold" aria-hidden="true" /> Copied</span>
            </button>
          </footer>
        ) : (
          <footer className="ig-sheet-footer">
            <span>Click any principle to mark it reviewed.</span>
            <button type="button" className="ig-reset" onClick={reset}>
              <ArrowCounterClockwise size={13} aria-hidden="true" /> Reset
            </button>
          </footer>
        )}
      </section>
    </div>
  )
}
