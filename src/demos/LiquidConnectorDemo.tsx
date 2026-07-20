/* Liquid Connector — React port of zanwei's liquid-connector-web-component
   (MIT, (c) 2026 Liquid Connector contributors — see
   src/content/liquid-connector/LICENSE). The SVG path math lives untouched in
   ./liquidPath.js; this file mirrors the upstream custom element's state
   machine (spring + measured keyframe transitions driving one generated SVG
   surface) as plain DOM + refs instead of shadow DOM.
   Deliberate port deviations:
   - No shadow DOM / custom element / CustomEvent API; no debug overlay and no
     liquid-frame event stream.
   - Connect closes the connector and submit clears the textarea (upstream
     only dispatches events and leaves DOM untouched); Skip keeps the upstream
     behavior (focus prompt + close).
   - White surfaces carry a soft drop shadow instead of the upstream hairline
     strokes; the blue outline appears only while the stage has focus within.
   - Vault lifecycle added: the 35% visibility gate pauses in-flight
     transitions offscreen and prefers-reduced-motion settles every change
     instantly. Like upstream, nothing moves on its own — only real
     interaction drives the surface. */

import { useEffect, useRef, useState } from 'react'
import {
  LiquidPath,
  type LiquidMode,
  type NormalizedPeelParameters,
  type PeelParameters,
} from './liquidPath.js'
import { SliderChip, SwitchChip } from '../pages/detail-kit'
import './LiquidConnectorDemo.css'

const {
  DEFAULT_PEEL_PARAMETERS,
  LIQUID_GEOMETRY,
  LIQUID_MOTION,
  clamp,
  createLiquidFrame,
  finiteNumber,
  normalizePeelParameters,
  openingTension,
  resolveLiquidMode,
  resolveScrubMode,
  sampleMeasuredTransition,
} = LiquidPath

export type LiquidConnectorSettings = {
  gap: number
  open: boolean
  detachGap: number
  transition: number
  couplingRadius: number
  pull: number
}

export const LIQUID_CONNECTOR_DEFAULTS: LiquidConnectorSettings = {
  gap: LIQUID_GEOMETRY.restGap ?? 10,
  open: true,
  detachGap: DEFAULT_PEEL_PARAMETERS.detachGap,
  transition: DEFAULT_PEEL_PARAMETERS.transition,
  couplingRadius: DEFAULT_PEEL_PARAMETERS.couplingRadius,
  pull: DEFAULT_PEEL_PARAMETERS.pull,
}

export type LiquidConnectorControls = {
  reset?: () => void
}

type Direction = 'idle' | 'opening' | 'closing' | 'scrub'
type MotionKind = 'idle' | 'opening' | 'closing' | 'spring'

type Engine = {
  gap: number
  targetGap: number
  velocity: number
  mode: LiquidMode
  tearAge: number
  tearStrength: number
  direction: Direction
  motionKind: MotionKind
  transitionAge: number
  peakOpeningTension: number
  restGap: number
  peelParameters: NormalizedPeelParameters
  open: boolean
  raf: number
  lastTime: number
  visible: boolean
}

type EngineApi = {
  toggle: (open?: boolean) => void
  setGap: (value: number, options?: { immediate?: boolean }) => void
  setPeelParameters: (parameters: PeelParameters) => void
  finishImmediately: () => void
}

/* Codex mark — an original vector interpretation of OpenAI's Codex icon
   (scalloped ring + terminal chevron/dash), constructed from arcs and line
   segments for this port. Not a copy of any shipped asset. */
const CODEX_RING_PATH =
  'M 12 2.7 A 2.45 2.45 0 0 1 15.02 4.7 A 2.45 2.45 0 0 1 18.58 5.42 A 2.45 2.45 0 0 1 19.3 8.98 A 2.45 2.45 0 0 1 21.3 12 A 2.45 2.45 0 0 1 19.3 15.02 A 2.45 2.45 0 0 1 18.58 18.58 A 2.45 2.45 0 0 1 15.02 19.3 A 2.45 2.45 0 0 1 12 21.3 A 2.45 2.45 0 0 1 8.98 19.3 A 2.45 2.45 0 0 1 5.42 18.58 A 2.45 2.45 0 0 1 4.7 15.02 A 2.45 2.45 0 0 1 2.7 12 A 2.45 2.45 0 0 1 4.7 8.98 A 2.45 2.45 0 0 1 5.42 5.42 A 2.45 2.45 0 0 1 8.98 4.7 A 2.45 2.45 0 0 1 12 2.7 Z'

/* The output card content renders three times: the interactive card plus two
   aria-hidden "smear" clones that stretch ±2 px during fast closes, exactly
   like the upstream element clones its output content. */
function OutputCardContent({
  contentRef,
  smearOffset,
  onSkip,
  onConnect,
}: {
  contentRef?: (node: HTMLDivElement | null) => void
  smearOffset?: number
  onSkip?: () => void
  onConnect?: () => void
}) {
  const smear = smearOffset !== undefined
  return (
    <div
      ref={contentRef}
      className={`lc-content lc-output-content${smear ? ' lc-output-smear' : ''}`}
      aria-hidden={smear ? true : undefined}
      data-offset={smear ? String(smearOffset) : undefined}
    >
      <div className="lc-identity">
        <svg className="lc-codex-mark" viewBox="0 0 24 24" aria-hidden="true">
          <g fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
            <path d={CODEX_RING_PATH} />
            <path d="M 8.2 8.3 L 11.5 12 L 8.2 15.7" />
            <path d="M 13.7 15.3 H 18" />
          </g>
        </svg>
        <span className="lc-provider-copy">
          <span className="lc-eyebrow">MCP Connector</span>
          <span className="lc-provider-name">Codex</span>
        </span>
      </div>
      <div className="lc-actions">
        <button className="lc-skip" type="button" tabIndex={smear ? -1 : undefined} disabled={smear || undefined} onClick={onSkip}>
          Skip
        </button>
        <button className="lc-connect" type="button" tabIndex={smear ? -1 : undefined} disabled={smear || undefined} onClick={onConnect}>
          Connect
        </button>
      </div>
    </div>
  )
}

export function LiquidConnectorDemo({
  compact = false,
  controls,
  settings = LIQUID_CONNECTOR_DEFAULTS,
  onSettingsChange,
}: {
  compact?: boolean
  controls?: LiquidConnectorControls
  settings?: LiquidConnectorSettings
  onSettingsChange?: (next: LiquidConnectorSettings) => void
}) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const fillRef = useRef<SVGPathElement | null>(null)
  const outlineRef = useRef<SVGPathElement | null>(null)
  const surfaceRef = useRef<SVGPathElement | null>(null)
  const outputObjectRef = useRef<SVGForeignObjectElement | null>(null)
  const inputObjectRef = useRef<SVGForeignObjectElement | null>(null)
  const outputContentRef = useRef<HTMLDivElement | null>(null)
  const inputContentRef = useRef<HTMLDivElement | null>(null)
  const smearRefs = useRef<(HTMLDivElement | null)[]>([])
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const sendRef = useRef<HTMLButtonElement | null>(null)

  const engineApiRef = useRef<EngineApi | null>(null)
  const settingsRef = useRef(settings)
  const previousSettingsRef = useRef(settings)
  const reducedRef = useRef(false)
  const [open, setOpen] = useState(settings.open)
  const [hasText, setHasText] = useState(false)

  useEffect(() => {
    settingsRef.current = settings
  }, [settings])

  useEffect(() => {
    const root = rootRef.current
    const fill = fillRef.current
    const outline = outlineRef.current
    const surface = surfaceRef.current
    const outputObject = outputObjectRef.current
    const inputObject = inputObjectRef.current
    const outputContent = outputContentRef.current
    const inputContent = inputContentRef.current
    const textarea = textareaRef.current
    const send = sendRef.current
    const connect = outputContent?.querySelector<HTMLButtonElement>('.lc-connect') ?? null
    const skip = outputContent?.querySelector<HTMLButtonElement>('.lc-skip') ?? null
    if (!root || !fill || !outline || !surface || !outputObject || !inputObject || !outputContent || !inputContent || !textarea || !send || !connect || !skip) return

    const initial = settingsRef.current
    const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)')
    reducedRef.current = reducedQuery.matches

    const engine: Engine = {
      gap: initial.open ? initial.gap : LIQUID_GEOMETRY.hiddenGap ?? -54,
      targetGap: initial.open ? initial.gap : LIQUID_GEOMETRY.hiddenGap ?? -54,
      velocity: 0,
      mode: 'merged',
      tearAge: -1,
      tearStrength: 0,
      direction: 'idle',
      motionKind: 'idle',
      transitionAge: 0,
      peakOpeningTension: 0,
      restGap: initial.gap,
      peelParameters: normalizePeelParameters({
        detachGap: initial.detachGap,
        transition: initial.transition,
        couplingRadius: initial.couplingRadius,
        pull: initial.pull,
      }),
      open: initial.open,
      raf: 0,
      lastTime: 0,
      visible: true,
    }
    engine.mode = resolveLiquidMode(undefined, engine.gap, 0, engine.peelParameters)

    const targetGapValue = (value: unknown, fallback = engine.restGap) =>
      clamp(finiteNumber(value, fallback), LIQUID_GEOMETRY.minGap ?? -60, LIQUID_GEOMETRY.maxGap ?? 10)

    const setAnimating = (on: boolean) => {
      root.toggleAttribute('data-animating', on)
    }

    const moveFocusFromOutput = () => {
      const active = document.activeElement
      if (active && outputContent.contains(active)) {
        textarea.focus({ preventScroll: true })
      }
    }

    /* Upstream LiquidConnector._render, minus the debug layer and the
       liquid-frame event emission. */
    const render = () => {
      const previousMode = engine.mode
      if (engine.direction === 'opening') {
        engine.peakOpeningTension = Math.max(engine.peakOpeningTension, openingTension(engine.velocity))
      }

      let nextMode: LiquidMode
      if (engine.direction === 'scrub') {
        nextMode = resolveScrubMode(previousMode, engine.gap, engine.peelParameters)
      } else {
        nextMode = resolveLiquidMode(previousMode, engine.gap, engine.velocity, engine.peelParameters)
      }
      if (engine.motionKind === 'opening' && previousMode === 'merged') {
        const detachTimeOffset = (engine.peelParameters.detachGap - DEFAULT_PEEL_PARAMETERS.detachGap) / 240
        const autoDetachTime = clamp(
          (LIQUID_MOTION.openTearTime ?? 0.105) + detachTimeOffset,
          (LIQUID_MOTION.openBridgeStart ?? 0.073333) + 0.004,
          0.14,
        )
        nextMode = engine.transitionAge >= autoDetachTime ? 'detached' : 'merged'
      }
      if (previousMode === 'merged' && nextMode === 'detached') {
        engine.tearStrength = Math.max(openingTension(engine.velocity), engine.peakOpeningTension)
        engine.tearAge = engine.tearStrength > 0 ? 0 : -1
      } else if (previousMode === 'detached' && nextMode === 'merged') {
        engine.tearStrength = 0
        engine.tearAge = -1
      }
      engine.mode = nextMode

      const frame = createLiquidFrame(engine.gap, engine.velocity, {
        mode: engine.mode,
        scrub: engine.direction === 'scrub',
        tearAge: engine.tearAge,
        tearStrength: engine.tearStrength,
        closeAge: engine.direction === 'closing' ? engine.transitionAge : -1,
        openAge: engine.motionKind === 'opening' ? engine.transitionAge : -1,
        openStrength: engine.direction === 'opening' ? engine.peakOpeningTension : 0,
        peelParameters: engine.peelParameters,
      })

      fill.setAttribute('d', frame.d)
      outline.setAttribute('d', frame.edgeD)
      surface.setAttribute('d', frame.edgeD)
      outputObject.setAttribute('y', frame.outputY.toFixed(3))
      outputObject.style.setProperty('--output-blur', `${frame.outputBlur.toFixed(3)}px`)
      inputObject.setAttribute('y', frame.inputVisualY.toFixed(3))
      inputObject.setAttribute('height', frame.inputVisualHeight.toFixed(3))
      inputContent.style.height = `${frame.inputContentHeight.toFixed(3)}px`
      inputContent.style.transform =
        `translateY(${(frame.inputContentY - frame.inputVisualY).toFixed(3)}px) ` +
        `scaleY(${frame.inputContentScaleY.toFixed(3)})`
      const mainOpacity = frame.outputOpacity * (1 - 0.35 * frame.outputSmear)
      outputContent.style.opacity = mainOpacity.toFixed(3)
      outputContent.style.transform = `scaleY(${frame.outputScaleY.toFixed(3)})`
      for (const smear of smearRefs.current) {
        if (!smear) continue
        smear.style.opacity = (frame.outputOpacity * 0.04 * frame.outputSmear).toFixed(3)
        smear.style.transform = `translateX(${smear.dataset.offset ?? '0'}px) scaleY(${frame.outputScaleY.toFixed(3)})`
        smear.style.visibility = frame.outputOpacity > 0.08 ? 'visible' : 'hidden'
      }
      send.style.setProperty('--send-height', `${frame.sendHeight.toFixed(3)}px`)
      send.style.setProperty('--send-offset-y', `${frame.sendOffsetY.toFixed(3)}px`)
      send.style.setProperty('--send-radius-y', `${frame.sendRadiusY.toFixed(3)}px`)
      send.style.setProperty('--send-arrow-scale-y', frame.sendArrowScaleY.toFixed(4))

      if (frame.outputOpacity < 0.88) moveFocusFromOutput()
      const interactive = engine.open && frame.outputOpacity > 0.88
      outputObject.style.pointerEvents = interactive ? 'auto' : 'none'
      outputObject.setAttribute('aria-hidden', engine.open && frame.outputOpacity > 0.1 ? 'false' : 'true')
      outputContent.style.visibility = frame.outputOpacity > 0.08 ? 'visible' : 'hidden'
      outputContent.inert = !interactive
      connect.disabled = !interactive
      skip.disabled = !interactive
      root.setAttribute('data-mode', frame.mode)
      root.setAttribute('data-phase', frame.phase)
    }

    /* Upstream _advance: measured keyframe transitions for full open/close,
       damped spring for everything else. */
    const advance = (delta: number) => {
      engine.transitionAge += delta
      if (engine.motionKind === 'opening' || engine.motionKind === 'closing') {
        const sample = sampleMeasuredTransition(
          engine.motionKind,
          engine.transitionAge,
          LIQUID_GEOMETRY.hiddenGap ?? -54,
          engine.restGap,
        )
        engine.gap = sample.gap
        engine.velocity = sample.velocity
        if (engine.tearAge >= 0) engine.tearAge += delta

        if (sample.done) {
          engine.gap = engine.targetGap
          engine.velocity = 0
          engine.raf = 0
          engine.direction = 'idle'
          engine.motionKind = 'idle'
          engine.transitionAge = 0
          setAnimating(false)
        }
        return
      }

      const steps = Math.max(1, Math.ceil(delta / (1 / 120)))
      const dt = delta / steps
      for (let index = 0; index < steps; index += 1) {
        const acceleration =
          (LIQUID_MOTION.stiffness ?? 1200) * (engine.targetGap - engine.gap) -
          (LIQUID_MOTION.damping ?? 38) * engine.velocity
        engine.velocity += acceleration * dt
        engine.gap += engine.velocity * dt
      }
      if (engine.tearAge >= 0) engine.tearAge += delta

      if (
        Math.abs(engine.targetGap - engine.gap) < (LIQUID_MOTION.settleDistance ?? 0.08) &&
        Math.abs(engine.velocity) < (LIQUID_MOTION.settleVelocity ?? 1)
      ) {
        engine.gap = engine.targetGap
        engine.velocity = 0
        engine.raf = 0
        engine.direction = 'idle'
        engine.motionKind = 'idle'
        engine.transitionAge = 0
        setAnimating(false)
      }
    }

    const tick = (now: number) => {
      const delta = Math.min(0.032, Math.max(0.001, (now - engine.lastTime) / 1000))
      engine.lastTime = now
      advance(delta)
      render()
      if (engine.raf) engine.raf = requestAnimationFrame(tick)
    }

    const finishImmediately = () => {
      cancelAnimationFrame(engine.raf)
      engine.raf = 0
      setAnimating(false)
      engine.gap = engine.targetGap
      engine.velocity = 0
      engine.tearAge = -1
      engine.tearStrength = 0
      engine.direction = 'idle'
      engine.motionKind = 'idle'
      engine.transitionAge = 0
      engine.peakOpeningTension = 0
      engine.mode = resolveLiquidMode(engine.mode, engine.gap, 0, engine.peelParameters)
      render()
    }

    const setTarget = (value: number) => {
      engine.targetGap = targetGapValue(value, engine.targetGap)
      if (reducedRef.current) {
        finishImmediately()
        return
      }

      engine.direction = engine.targetGap < engine.gap ? 'closing' : 'opening'
      const startsAtHidden = Math.abs(engine.gap - (LIQUID_GEOMETRY.hiddenGap ?? -54)) < 1.5
      const startsAtRest = Math.abs(engine.gap - engine.restGap) < 1.5
      const targetsHidden = Math.abs(engine.targetGap - (LIQUID_GEOMETRY.hiddenGap ?? -54)) < 0.1
      const targetsRest = Math.abs(engine.targetGap - engine.restGap) < 0.1
      engine.motionKind =
        engine.direction === 'opening' && startsAtHidden && targetsRest
          ? 'opening'
          : engine.direction === 'closing' && startsAtRest && targetsHidden
            ? 'closing'
            : 'spring'
      engine.transitionAge = 0
      engine.peakOpeningTension = 0
      if (!engine.raf) {
        engine.lastTime = performance.now()
        engine.raf = requestAnimationFrame(tick)
        setAnimating(true)
      }
    }

    const applyOpen = (next: boolean) => {
      if (next === engine.open) return
      engine.open = next
      setOpen(next)
      if (!next) {
        moveFocusFromOutput()
        outputObject.style.pointerEvents = 'none'
        outputObject.setAttribute('aria-hidden', 'true')
        outputContent.inert = true
        connect.disabled = true
        skip.disabled = true
      }
      setTarget(next ? engine.restGap : (LIQUID_GEOMETRY.hiddenGap ?? -54))
    }

    const api: EngineApi = {
      toggle: (force) => {
        applyOpen(force === undefined ? !engine.open : Boolean(force))
      },
      /* Upstream setGap: scrubs land immediately without starting the spring
         (the demo's range input passes { immediate: true }); anything else
         eases toward the new rest gap. */
      setGap: (value, { immediate = false } = {}) => {
        const next = targetGapValue(value)
        engine.restGap = next
        if (!engine.open) applyOpen(true)
        setOpen(engine.open)

        if (immediate || reducedRef.current) {
          cancelAnimationFrame(engine.raf)
          engine.raf = 0
          setAnimating(false)
          engine.gap = next
          engine.targetGap = next
          engine.velocity = 0
          engine.tearAge = -1
          engine.tearStrength = 0
          engine.direction = 'scrub'
          engine.motionKind = 'idle'
          engine.transitionAge = 0
          engine.peakOpeningTension = 0
          render()
        } else {
          setTarget(next)
        }
      },
      setPeelParameters: (parameters = {}) => {
        engine.peelParameters = normalizePeelParameters({ ...engine.peelParameters, ...parameters })
        engine.mode = engine.gap > engine.peelParameters.detachGap ? 'detached' : 'merged'
        engine.tearAge = -1
        engine.tearStrength = 0
        render()
      },
      finishImmediately,
    }
    engineApiRef.current = api

    /* Vault lifecycle: pause in-flight transitions while offscreen. Like
       upstream, nothing moves on its own — only real interaction does. */
    const wake = () => {
      if (engine.raf || engine.motionKind === 'idle') return
      engine.lastTime = performance.now()
      engine.raf = requestAnimationFrame(tick)
      setAnimating(true)
    }
    const sleep = () => {
      cancelAnimationFrame(engine.raf)
      engine.raf = 0
      setAnimating(false)
    }
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        engine.visible = Boolean(entry?.isIntersecting && (!compact || entry.intersectionRatio >= 0.35))
        if (engine.visible) wake()
        else sleep()
      },
      { threshold: [0, 0.35, 1] },
    )
    intersectionObserver.observe(root)

    const onReducedMotionChange = (event: MediaQueryListEvent) => {
      reducedRef.current = event.matches
      if (event.matches) finishImmediately()
    }
    reducedQuery.addEventListener('change', onReducedMotionChange)

    render()

    return () => {
      intersectionObserver.disconnect()
      reducedQuery.removeEventListener('change', onReducedMotionChange)
      cancelAnimationFrame(engine.raf)
      engine.raf = 0
      engineApiRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compact])

  /* Forward control-panel settings into the engine outside the render loop. */
  useEffect(() => {
    const previous = previousSettingsRef.current
    previousSettingsRef.current = settings
    const api = engineApiRef.current
    if (!api || previous === settings) return
    /* Gap slider scrubs land immediately, exactly like the upstream demo's
       range input. */
    if (previous.gap !== settings.gap) api.setGap(settings.gap, { immediate: true })
    const peelChanged =
      previous.detachGap !== settings.detachGap ||
      previous.transition !== settings.transition ||
      previous.couplingRadius !== settings.couplingRadius ||
      previous.pull !== settings.pull
    if (peelChanged) {
      api.setPeelParameters({
        detachGap: settings.detachGap,
        transition: settings.transition,
        couplingRadius: settings.couplingRadius,
        pull: settings.pull,
      })
    }
    if (previous.open !== settings.open) api.toggle(settings.open)
  }, [settings])

  /* Header chips: Reset restores every default through the parent. */
  useEffect(() => {
    if (!controls) return
    controls.reset = () => onSettingsChange?.({ ...LIQUID_CONNECTOR_DEFAULTS })
    return () => {
      delete controls.reset
    }
  }, [controls, onSettingsChange])

  const syncOpenToParent = (next: boolean) => {
    const current = settingsRef.current
    if (current.open !== next) onSettingsChange?.({ ...current, open: next })
  }

  const handleSkip = () => {
    const api = engineApiRef.current
    textareaRef.current?.focus({ preventScroll: true })
    api?.toggle(false)
    syncOpenToParent(false)
  }

  /* Deviation from upstream: Connect closes the card instead of only firing
     an event, so the button never feels dead. */
  const handleConnect = () => {
    const api = engineApiRef.current
    api?.toggle(false)
    syncOpenToParent(false)
  }

  /* Deviation from upstream: submit clears the prompt (upstream only fires an
     event). The send button's disabled flag is React state. */
  const handleSubmit = () => {
    const textarea = textareaRef.current
    if (!textarea || !hasText) return
    textarea.value = ''
    setHasText(false)
  }

  return (
    <div
      ref={rootRef}
      className={`lc-demo ${compact ? 'lc-demo--compact' : 'lc-demo--playground'}`}
      data-open={open ? 'true' : 'false'}
    >
      <svg className="lc-stage" viewBox="0 0 520 300" role="group" aria-label="Liquid connector prompt">
        <path ref={fillRef} className="lc-surface-fill" />
        <path ref={outlineRef} className="lc-outline-edge" />
        <path ref={surfaceRef} className="lc-surface" />

        <foreignObject ref={outputObjectRef} className="lc-output-object" x={40} y={57} width={440} height={68}>
          <OutputCardContent contentRef={(node) => { outputContentRef.current = node }} onSkip={handleSkip} onConnect={handleConnect} />
          {[-2, 2].map((offset, index) => (
            <OutputCardContent
              key={offset}
              smearOffset={offset}
              contentRef={(node) => { smearRefs.current[index] = node; if (node) node.inert = true }}
            />
          ))}
        </foreignObject>

        <foreignObject ref={inputObjectRef} className="lc-input-object" x={40} y={135} width={440} height={134}>
          <div ref={inputContentRef} className="lc-content lc-input-content">
            <textarea
              ref={textareaRef}
              rows={2}
              aria-label="Prompt"
              placeholder="Ask anything..."
              onInput={(event) => setHasText(event.currentTarget.value.trim().length > 0)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault()
                  handleSubmit()
                }
              }}
            />
            <button ref={sendRef} className="lc-send" type="button" aria-label="Send prompt" disabled={!hasText} onClick={handleSubmit}>
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M8 13V3M8 3 4.5 6.5M8 3l3.5 3.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
              </svg>
            </button>
          </div>
        </foreignObject>
      </svg>
    </div>
  )
}

const RANGE_CONTROLS = [
  { key: 'gap', label: 'Rest gap', min: -60, max: 10, round: (v: number) => Math.round(v), format: (v: number) => `${Math.round(v)} px` },
  { key: 'detachGap', label: 'Detach gap', min: 6, max: 9.8, round: (v: number) => Math.round(v * 20) / 20, format: (v: number) => `${v.toFixed(1)} px` },
  { key: 'transition', label: 'Peel transition', min: 1.5, max: 8, round: (v: number) => Math.round(v * 20) / 20, format: (v: number) => `${v.toFixed(1)} px` },
  { key: 'couplingRadius', label: 'Coupling radius', min: 4, max: 48, round: (v: number) => Math.round(v * 2) / 2, format: (v: number) => `${Math.round(v)} px` },
  { key: 'pull', label: 'Peel pull', min: 0, max: 8, round: (v: number) => Math.round(v * 10) / 10, format: (v: number) => v.toFixed(1) },
] as const

type RangeKey = (typeof RANGE_CONTROLS)[number]['key']

/* Control panel in the shared SliderChip bar style (detail-kit): 32 px gray
   bars — fill block left, thin thumb, label left, value right — plus a
   matching switch row. Gap scrubs stay immediate via the settings effect. */
export function LiquidConnectorControlPanel({
  settings,
  onChange,
}: {
  settings: LiquidConnectorSettings
  onChange: (next: LiquidConnectorSettings) => void
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" aria-label="Liquid connector settings">
      {RANGE_CONTROLS.map((control) => (
        <SliderChip
          key={control.key}
          label={control.label}
          min={control.min}
          max={control.max}
          value={settings[control.key as RangeKey]}
          format={control.format}
          onChange={(v) => onChange({ ...settings, [control.key]: control.round(v) })}
        />
      ))}
      <SwitchChip
        label="Connector open"
        checked={settings.open}
        onChange={(open) => onChange({ ...settings, open })}
      />
    </div>
  )
}
