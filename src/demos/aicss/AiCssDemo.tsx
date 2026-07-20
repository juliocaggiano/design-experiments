import {
  CaretDown,
  Check,
  Circle,
  CircleNotch,
  GlobeHemisphereWest,
  LinkSimple,
  ListChecks,
  MagnifyingGlass,
} from '@phosphor-icons/react'
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { AiCssId } from '../../aicss/catalog'
import './AiCssDemo.css'

export type AiCssDemoControls = {
  replay?: () => void
  reset?: () => void
}

type SpecimenProps = {
  controls?: AiCssDemoControls
  compact?: boolean
}

function exposeControls(
  controls: AiCssDemoControls | undefined,
  replay: () => void,
  reset: () => void,
) {
  if (!controls) return
  controls.replay = replay
  controls.reset = reset
}

function Specimen({
  label,
  className = '',
  children,
}: {
  label: string
  className?: string
  children: ReactNode
}) {
  return (
    <section className={`ac-specimen ${className}`} aria-label={label}>
      {children}
    </section>
  )
}

const REASONING_STEPS = [
  'Reviewing the request and its constraints',
  'Looking for the most relevant signals',
  'Comparing the strongest approaches',
  'Checking edge cases and assumptions',
  'Organizing the response clearly',
  'Preparing the final answer',
]

function ThinkingReasoning({ controls, compact }: SpecimenProps) {
  const root = useRef<HTMLDivElement>(null)
  const [run, setRun] = useState(0)
  const [visible, setVisible] = useState(0)
  const [done, setDone] = useState(false)
  const [open, setOpen] = useState(true)
  const [inView, setInView] = useState(!compact)

  useEffect(() => {
    if (!compact) {
      setInView(true)
      return
    }

    const node = root.current
    if (!node || !('IntersectionObserver' in window)) {
      setInView(true)
      return
    }

    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting && entry.intersectionRatio >= 0.35)
    }, { threshold: [0, 0.35, 0.75] })
    observer.observe(node)
    return () => observer.disconnect()
  }, [compact])

  useEffect(() => {
    setVisible(0)
    setDone(false)
    setOpen(true)

    if (compact && !inView) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(REASONING_STEPS.length)
      setDone(true)
      setOpen(false)
      return
    }

    const stepMs = compact ? 360 : 560
    const timers = REASONING_STEPS.map((_, index) => window.setTimeout(() => {
      setVisible(index + 1)
    }, 360 + stepMs * index))
    timers.push(window.setTimeout(() => {
      setDone(true)
      setOpen(false)
    }, 660 + stepMs * REASONING_STEPS.length))
    return () => timers.forEach(window.clearTimeout)
  }, [compact, inView, run])

  const replay = () => setRun((value) => value + 1)
  const reset = replay
  exposeControls(controls, replay, reset)

  return (
    <Specimen label="Streaming and collapsible reasoning" className="ac-reasoning">
      <div
        ref={root}
        className="ac-reasoning-card"
        data-open={open ? 'true' : 'false'}
        data-done={done ? 'true' : 'false'}
        data-in-view={inView ? 'true' : 'false'}
      >
        <button type="button" className="ac-reasoning-trigger" onClick={() => done && setOpen((value) => !value)} aria-expanded={open}>
          <span className={done ? '' : 'ac-shimmer'}>{done ? 'Thought for 5s' : 'Thinking…'}</span>
          <CaretDown size={14} weight="bold" />
        </button>
        <div className="ac-reasoning-clip">
          <ol>
            {REASONING_STEPS.map((step, index) => (
              <li key={step} data-visible={index < visible ? 'true' : 'false'}>
                {index < visible ? <Check size={12} weight="bold" /> : <Circle size={10} />}
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Specimen>
  )
}

const SEARCH_SOURCES = [
  ['Interaction Design Foundation', 'Designing useful system feedback'],
  ['Nielsen Norman Group', 'Visibility of system status'],
  ['Apple Developer', 'Human Interface Guidelines'],
] as const

function WebSearch({ controls, compact }: SpecimenProps) {
  const [run, setRun] = useState(0)
  const [resolved, setResolved] = useState(0)

  useEffect(() => {
    setResolved(0)
    const speed = compact ? 420 : 640
    const timers = SEARCH_SOURCES.map((_, index) => window.setTimeout(() => {
      setResolved(index + 1)
    }, 500 + index * speed))
    return () => timers.forEach(window.clearTimeout)
  }, [compact, run])

  const replay = () => setRun((value) => value + 1)
  const reset = replay
  exposeControls(controls, replay, reset)

  return (
    <Specimen label="Live web search sources" className="ac-web-search">
      <div className="ac-search-card">
        <header>
          {resolved < SEARCH_SOURCES.length
            ? <CircleNotch className="ac-spin" size={15} weight="bold" />
            : <MagnifyingGlass size={15} weight="bold" />}
          <span className={resolved < SEARCH_SOURCES.length ? 'ac-shimmer' : ''}>designing better loading states</span>
        </header>
        <div className="ac-source-list" aria-live="polite">
          {SEARCH_SOURCES.map(([name, title], index) => (
            <div key={name} data-resolved={index < resolved ? 'true' : 'false'}>
              <span className="ac-source-icon">
                {index < resolved ? <Check size={11} weight="bold" /> : <GlobeHemisphereWest size={13} />}
              </span>
              <span><b>{name}</b><small>{title}</small></span>
            </div>
          ))}
        </div>
      </div>
    </Specimen>
  )
}

const STREAM_TEXT = 'A good interface explains what is happening, preserves context, and makes the next action feel obvious.'

function StreamingText({ controls, compact }: SpecimenProps) {
  const root = useRef<HTMLParagraphElement>(null)
  const [run, setRun] = useState(0)
  const [length, setLength] = useState(0)
  const [inView, setInView] = useState(!compact)

  useEffect(() => {
    if (!compact) {
      setInView(true)
      return
    }

    const node = root.current
    if (!node || !('IntersectionObserver' in window)) {
      setInView(true)
      return
    }

    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting && entry.intersectionRatio >= 0.35)
    }, { threshold: [0, 0.35, 0.75] })
    observer.observe(node)
    return () => observer.disconnect()
  }, [compact])

  useEffect(() => {
    setLength(0)

    if (compact && !inView) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setLength(STREAM_TEXT.length)
      return
    }

    const speed = compact ? 20 : 30
    const timer = window.setInterval(() => {
      setLength((value) => {
        if (value >= STREAM_TEXT.length) {
          window.clearInterval(timer)
          return value
        }
        const character = STREAM_TEXT[value]
        return Math.min(STREAM_TEXT.length, value + (character === ' ' ? 2 : 1))
      })
    }, speed)
    return () => window.clearInterval(timer)
  }, [compact, inView, run])

  const replay = () => setRun((value) => value + 1)
  const reset = replay
  exposeControls(controls, replay, reset)

  return (
    <Specimen label="Streaming text response" className="ac-streaming-text">
      <p ref={root} data-in-view={inView ? 'true' : 'false'} aria-live="polite">{STREAM_TEXT.slice(0, length)}<span data-done={length >= STREAM_TEXT.length ? 'true' : 'false'} className="ac-caret" /></p>
    </Specimen>
  )
}

const CITATION_SOURCES = [
  { id: 1, name: 'Nielsen Norman Group', detail: 'Visibility of system status keeps users informed.' },
  { id: 2, name: 'W3C WAI', detail: 'Status messages should be exposed without moving focus.' },
] as const

function InlineCitations({ controls }: SpecimenProps) {
  const [selected, setSelected] = useState(1)
  const replay = () => setSelected((value) => value === 1 ? 2 : 1)
  const reset = () => setSelected(1)
  exposeControls(controls, replay, reset)

  return (
    <Specimen label="Assistant response with inline citations" className="ac-citations">
      <article>
        <p>
          Interfaces feel faster when they acknowledge an action immediately
          <button type="button" aria-label="View citation 1" data-active={selected === 1 ? 'true' : 'false'} onClick={() => setSelected(1)}>1</button>.
          Status updates should also be available to assistive technology
          <button type="button" aria-label="View citation 2" data-active={selected === 2 ? 'true' : 'false'} onClick={() => setSelected(2)}>2</button>.
        </p>
        <footer>
          {CITATION_SOURCES.map((source) => (
            <button type="button" key={source.id} data-active={selected === source.id ? 'true' : 'false'} onClick={() => setSelected(source.id)}>
              <span>{source.id}</span><span><b>{source.name}</b><small>{source.detail}</small></span><LinkSimple size={13} />
            </button>
          ))}
        </footer>
      </article>
    </Specimen>
  )
}

const TASKS = [
  'Inspect the current interface',
  'Map the component states',
  'Build the shared structure',
  'Check keyboard interactions',
  'Verify the responsive layout',
] as const

function TaskList({ controls }: SpecimenProps) {
  const [complete, setComplete] = useState(2)
  const [open, setOpen] = useState(true)
  const replay = () => setComplete((value) => value >= TASKS.length ? 0 : value + 1)
  const reset = () => { setComplete(2); setOpen(true) }
  exposeControls(controls, replay, reset)

  return (
    <Specimen label="Collapsible agent task list" className="ac-task-list">
      <div data-open={open ? 'true' : 'false'}>
        <button type="button" className="ac-task-header" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
          <span><ListChecks size={15} /><b>Tasks</b><small>{complete}/{TASKS.length}</small></span><CaretDown size={14} weight="bold" />
        </button>
        <div className="ac-task-clip">
          <ul>
            {TASKS.map((task, index) => {
              const state = index < complete ? 'done' : index === complete ? 'active' : 'pending'
              return (
                <li key={task} data-state={state}>
                  <button type="button" aria-label={`${state === 'done' ? 'Mark incomplete' : 'Mark complete'}: ${task}`} onClick={() => setComplete(state === 'done' ? index : index + 1)}>
                    {state === 'done' ? <Check size={10} weight="bold" /> : state === 'active' ? <CircleNotch className="ac-spin" size={12} weight="bold" /> : <Circle size={11} />}
                  </button>
                  <span>{task}</span>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </Specimen>
  )
}

const COMPONENTS: Record<AiCssId, (props: SpecimenProps) => ReactNode> = {
  'thinking-reasoning': ThinkingReasoning,
  'web-search': WebSearch,
  'streaming-text': StreamingText,
  'inline-citations': InlineCitations,
  'task-list': TaskList,
}

export function AiCssDemo({
  id,
  compact = false,
  controls,
}: {
  id: AiCssId
  compact?: boolean
  controls?: AiCssDemoControls
}) {
  const Component = COMPONENTS[id]
  return (
    <div className="ac-demo" data-compact={compact ? 'true' : 'false'} data-component={id}>
      <div className="ac-canvas">
        <Component controls={controls} compact={compact} />
      </div>
    </div>
  )
}
