import {
  ArrowCounterClockwise,
  Browser,
  Camera,
  CheckCircle,
  CursorClick,
  GlobeSimple,
  Play,
  TerminalWindow,
} from '@phosphor-icons/react'
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import './PlaywrightCliDemo.css'

type Step = {
  label: string
  command: (url: string) => string
  output: (url: string) => string
  Icon: typeof Browser
}

const normalizeUrl = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return 'https://example.com'
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

const STEPS: Step[] = [
  {
    label: 'Open',
    Icon: GlobeSimple,
    command: (url) => `playwright-cli open ${url}`,
    output: (url) => `✓ Browser opened at ${url}`,
  },
  {
    label: 'Snapshot',
    Icon: Camera,
    command: () => 'playwright-cli snapshot',
    output: () => '✓ Snapshot ready · button “Get started” [ref=e12]',
  },
  {
    label: 'Act',
    Icon: CursorClick,
    command: () => 'playwright-cli click e12',
    output: () => '✓ Clicked button “Get started”',
  },
  {
    label: 'Verify',
    Icon: CheckCircle,
    command: () => 'playwright-cli snapshot',
    output: () => '✓ Heading “Welcome” is visible [ref=e18]',
  },
]

export type PlaywrightCliControls = {
  reset?: () => void
}

export function PlaywrightCliDemo({
  compact = false,
  controls,
}: {
  compact?: boolean
  controls?: PlaywrightCliControls
}) {
  const [draftUrl, setDraftUrl] = useState('example.com')
  const [url, setUrl] = useState('https://example.com')
  const [activeStep, setActiveStep] = useState(0)
  const [running, setRunning] = useState(false)
  const timer = useRef<number | null>(null)
  const step = STEPS[activeStep]

  const clearTimer = () => {
    if (timer.current !== null) window.clearTimeout(timer.current)
    timer.current = null
  }

  const reset = useCallback(() => {
    clearTimer()
    setDraftUrl('example.com')
    setUrl('https://example.com')
    setActiveStep(0)
    setRunning(false)
  }, [])

  if (controls) controls.reset = reset

  useEffect(() => () => clearTimer(), [])

  const runStep = useCallback(() => {
    clearTimer()
    setRunning(true)
    timer.current = window.setTimeout(() => {
      setRunning(false)
      setActiveStep((current) => Math.min(current + 1, STEPS.length - 1))
      timer.current = null
    }, 520)
  }, [])

  const submitUrl = (event: FormEvent) => {
    event.preventDefault()
    const nextUrl = normalizeUrl(draftUrl)
    setUrl(nextUrl)
    setDraftUrl(nextUrl.replace(/^https?:\/\//i, ''))
    setActiveStep(0)
    runStep()
  }

  const output = useMemo(() => step.output(url), [step, url])

  return (
    <div className="pw-demo" data-compact={compact ? 'true' : 'false'}>
      <section className="pw-session" aria-label="Interactive Playwright CLI browser session">
        <header className="pw-session-header">
          <span className="pw-session-title">
            <span className="pw-session-icon" aria-hidden="true"><TerminalWindow size={16} weight="regular" /></span>
            <span><strong>Browser session</strong><small>playwright-cli</small></span>
          </span>
          <span className="pw-ready"><i aria-hidden="true" /> Ready</span>
        </header>

        <form className="pw-address" onSubmit={submitUrl}>
          <GlobeSimple size={15} weight="regular" aria-hidden="true" />
          <label className="pw-visually-hidden" htmlFor="pw-url">Page URL</label>
          <input
            id="pw-url"
            value={draftUrl}
            onChange={(event) => setDraftUrl(event.target.value)}
            autoComplete="url"
            spellCheck={false}
            aria-label="Page URL"
          />
          <button type="submit" aria-label="Open URL"><Play size={13} weight="fill" /></button>
        </form>

        <div className="pw-workflow" role="tablist" aria-label="Browser automation workflow">
          {STEPS.map(({ label, Icon }, index) => (
            <button
              key={label}
              type="button"
              role="tab"
              aria-selected={index === activeStep}
              data-complete={index < activeStep ? 'true' : 'false'}
              onClick={() => { clearTimer(); setRunning(false); setActiveStep(index) }}
            >
              <span aria-hidden="true"><Icon size={14} weight={index <= activeStep ? 'fill' : 'regular'} /></span>
              {label}
            </button>
          ))}
        </div>

        <div className="pw-terminal" aria-live="polite">
          <div className="pw-command">
            <span aria-hidden="true">$</span>
            <code>{step.command(url)}</code>
          </div>
          <p data-running={running ? 'true' : 'false'}>
            {running ? <><span className="pw-running-dot" aria-hidden="true" /> Running command…</> : output}
          </p>
        </div>

        <footer className="pw-session-footer">
          <span>Snapshot refs keep every action precise.</span>
          <span className="pw-session-actions">
            <button type="button" className="pw-reset" onClick={reset} aria-label="Reset browser session">
              <ArrowCounterClockwise size={13} weight="regular" /> Reset
            </button>
            <button type="button" className="pw-run" onClick={runStep} disabled={running}>
              <Play size={12} weight="fill" /> {activeStep === STEPS.length - 1 ? 'Run again' : 'Run step'}
            </button>
          </span>
        </footer>
      </section>
    </div>
  )
}
