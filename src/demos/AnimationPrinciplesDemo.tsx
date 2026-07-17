import { ArrowClockwise, CheckCircle, Stack, Timer, WaveSine } from '@phosphor-icons/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import './AnimationPrinciplesDemo.css'

const PRINCIPLES = [
  {
    id: 'timing',
    label: 'Timing',
    value: '220 ms',
    description: 'Direct and consistent',
    Icon: Timer,
  },
  {
    id: 'easing',
    label: 'Easing',
    value: 'Ease out',
    description: 'Arrive fast, settle gently',
    Icon: WaveSine,
  },
  {
    id: 'physics',
    label: 'Physics',
    value: 'Spring',
    description: 'Overshoot, then settle',
    Icon: ArrowClockwise,
  },
  {
    id: 'staging',
    label: 'Staging',
    value: 'One focus',
    description: 'Direct the eye clearly',
    Icon: Stack,
  },
] as const

type PrincipleId = (typeof PRINCIPLES)[number]['id']

export type AnimationPrinciplesControls = {
  replay?: () => void
}

export function AnimationPrinciplesDemo({
  compact = false,
  controls,
}: {
  compact?: boolean
  controls?: AnimationPrinciplesControls
}) {
  const [principle, setPrinciple] = useState<PrincipleId>('easing')
  const [active, setActive] = useState(false)
  const timeout = useRef<number | null>(null)
  const interval = useRef<number | null>(null)
  const selected = PRINCIPLES.find((item) => item.id === principle) ?? PRINCIPLES[1]

  const clearTimers = useCallback(() => {
    if (timeout.current !== null) window.clearTimeout(timeout.current)
    if (interval.current !== null) window.clearInterval(interval.current)
    timeout.current = null
    interval.current = null
  }, [])

  const replay = useCallback(() => {
    if (timeout.current !== null) window.clearTimeout(timeout.current)
    setActive(false)
    timeout.current = window.setTimeout(() => {
      setActive(true)
      timeout.current = null
    }, 90)
  }, [])

  if (controls) controls.replay = replay

  useEffect(() => {
    clearTimers()
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      setActive(true)
      return clearTimers
    }

    timeout.current = window.setTimeout(() => {
      setActive(true)
      timeout.current = null
    }, 180)
    interval.current = window.setInterval(replay, 2400)
    return clearTimers
  }, [clearTimers, principle, replay])

  const selectPrinciple = (next: PrincipleId) => {
    setActive(false)
    setPrinciple(next)
  }

  return (
    <div className="ap-demo" data-compact={compact ? 'true' : 'false'}>
      <section className="ap-panel" aria-label="Interactive web animation principles inspector">
        <header className="ap-header">
          <span className="ap-title">
            <span className="ap-title-icon" aria-hidden="true"><WaveSine size={16} weight="regular" /></span>
            <span><strong>Motion review</strong><small>12 principles · web adaptation</small></span>
          </span>
          <span className="ap-score"><CheckCircle size={13} weight="fill" aria-hidden="true" /> 12 / 12</span>
        </header>

        <div className="ap-tabs" role="tablist" aria-label="Animation rule categories">
          {PRINCIPLES.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={principle === id}
              onClick={() => selectPrinciple(id)}
            >
              <Icon size={13} weight={principle === id ? 'fill' : 'regular'} aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="ap-stage" data-principle={principle} data-active={active ? 'true' : 'false'} aria-live="polite">
          <span className="ap-stage-label">{selected.description}</span>
          {principle === 'staging' ? (
            <div className="ap-staging-scene" aria-hidden="true">
              <div className="ap-scene-lines"><i /><i /><i /></div>
              <div className="ap-backdrop" />
              <div className="ap-dialog"><span /><span /></div>
            </div>
          ) : (
            <div className="ap-motion-rail" aria-hidden="true">
              <span className="ap-rail-line" />
              <span className="ap-rail-start" />
              <span className="ap-rail-end" />
              <span className="ap-token" />
            </div>
          )}
        </div>

        <footer className="ap-footer">
          <span className="ap-readout">
            <strong>{selected.label}</strong>
            <small>{selected.value}</small>
          </span>
          <button type="button" className="ap-replay" onClick={replay} aria-label={`Replay ${selected.label.toLowerCase()} example`}>
            <ArrowClockwise size={13} weight="regular" aria-hidden="true" />
            <span>Replay</span>
          </button>
        </footer>
      </section>
    </div>
  )
}
