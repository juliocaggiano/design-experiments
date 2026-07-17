import {
  CaretDown,
  Check,
  CheckCircle,
  Circle,
  CircleNotch,
  Copy,
  FileCode,
  GlobeHemisphereWest,
  ImageSquare,
  LinkSimple,
  ListChecks,
  MagnifyingGlass,
  Minus,
  Sparkle,
} from '@phosphor-icons/react'
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
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

function ThinkingState({ controls }: SpecimenProps) {
  const [cycle, setCycle] = useState(0)
  const replay = () => setCycle((value) => value + 1)
  const reset = replay
  exposeControls(controls, replay, reset)

  return (
    <Specimen label="Assistant thinking state" className="ac-thinking-state">
      <span key={cycle} className="ac-thinking-label"><Sparkle size={14} weight="fill" /> Thinking</span>
    </Specimen>
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

const DIFF_LINES = [
  { kind: 'same', number: '18', text: 'const session = await getSession(request)' },
  { kind: 'remove', number: '19', text: 'if (!session) return null' },
  { kind: 'add', number: '19', text: 'if (!session) {' },
  { kind: 'add', number: '20', text: "  throw new AuthError('Sign in required')" },
  { kind: 'add', number: '21', text: '}' },
  { kind: 'same', number: '22', text: 'return session.user' },
] as const

function FileDiff({ controls }: SpecimenProps) {
  const [cycle, setCycle] = useState(0)
  const replay = () => setCycle((value) => value + 1)
  const reset = replay
  exposeControls(controls, replay, reset)

  return (
    <Specimen label="Proposed file diff" className="ac-file-diff">
      <div key={cycle} className="ac-diff-card">
        <header><span><FileCode size={14} /> auth.ts</span><span className="ac-diff-counts"><b>+4</b><i>−1</i></span></header>
        <div className="ac-diff-code">
          {DIFF_LINES.map((line, index) => (
            <div key={`${line.number}-${index}`} data-kind={line.kind} style={{ '--ac-i': index } as CSSProperties}>
              <span>{line.number}</span><i>{line.kind === 'add' ? '+' : line.kind === 'remove' ? '−' : ' '}</i><code>{line.text}</code>
            </div>
          ))}
        </div>
      </div>
    </Specimen>
  )
}

function ImageGeneration({ controls, compact }: SpecimenProps) {
  const [run, setRun] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDone(false)
    const timer = window.setTimeout(() => setDone(true), compact ? 1800 : 2600)
    return () => window.clearTimeout(timer)
  }, [compact, run])

  const replay = () => setRun((value) => value + 1)
  const reset = replay
  exposeControls(controls, replay, reset)

  return (
    <Specimen label="Image generation loading state" className="ac-image-generation">
      <div className="ac-image-card" data-done={done ? 'true' : 'false'} aria-live="polite">
        <div className="ac-generated-art" aria-label={done ? 'Generated abstract landscape' : 'Generating image'}>
          <span className="ac-art-sun" /><span className="ac-art-hill ac-art-hill-one" /><span className="ac-art-hill ac-art-hill-two" />
          <span className="ac-image-shimmer" />
          <span className="ac-image-status">{done ? <><CheckCircle size={14} weight="fill" /> Generated</> : <><ImageSquare size={14} /> Generating…</>}</span>
        </div>
        <p>A quiet landscape made of paper and morning light</p>
      </div>
    </Specimen>
  )
}

function TextResponse({ controls }: SpecimenProps) {
  const [cycle, setCycle] = useState(0)
  const replay = () => setCycle((value) => value + 1)
  const reset = replay
  exposeControls(controls, replay, reset)

  return (
    <Specimen label="Formatted assistant response" className="ac-text-response">
      <article key={cycle}>
        <p>A useful loading state does two things: it <strong>confirms the request</strong> and sets an honest expectation.</p>
        <p>Keep the existing layout stable, use <code>aria-live</code> for meaningful updates, and let the final content replace the placeholder in place.</p>
      </article>
    </Specimen>
  )
}

const STREAM_TEXT = 'A good interface explains what is happening, preserves context, and makes the next action feel obvious.'

function StreamingText({ controls, compact }: SpecimenProps) {
  const [run, setRun] = useState(0)
  const [length, setLength] = useState(0)

  useEffect(() => {
    setLength(0)
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
  }, [compact, run])

  const replay = () => setRun((value) => value + 1)
  const reset = replay
  exposeControls(controls, replay, reset)

  return (
    <Specimen label="Streaming text response" className="ac-streaming-text">
      <p aria-live="polite">{STREAM_TEXT.slice(0, length)}<span data-done={length >= STREAM_TEXT.length ? 'true' : 'false'} className="ac-caret" /></p>
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

const CODE_LINES = [
  ['keyword', 'export'],
  ['plain', ' function '],
  ['function', 'formatStatus'],
  ['plain', '(state: '],
  ['type', 'State'],
  ['plain', ') {\n  '],
  ['keyword', 'return'],
  ['plain', " state === 'done' ? "],
  ['string', "'Ready'"],
  ['plain', " : "],
  ['string', "'Working…'"],
  ['plain', '\n}'],
] as const

function CodeBlock({ controls }: SpecimenProps) {
  const [copied, setCopied] = useState(false)
  const replay = () => {
    navigator.clipboard?.writeText("export function formatStatus(state: State) {\n  return state === 'done' ? 'Ready' : 'Working…'\n}").catch(() => {})
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }
  const reset = () => setCopied(false)
  exposeControls(controls, replay, reset)

  return (
    <Specimen label="Copyable code block" className="ac-code-block">
      <div>
        <header><span><FileCode size={13} /> utils.ts</span><button type="button" onClick={replay}>{copied ? <Check size={12} weight="bold" /> : <Copy size={12} />}{copied ? 'Copied' : 'Copy'}</button></header>
        <pre><code>{CODE_LINES.map(([kind, text], index) => <span key={index} data-token={kind}>{text}</span>)}</code></pre>
      </div>
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

const TABLE_ROWS = [
  { model: 'gpt-4o', context: 128, price: 2.5 },
  { model: 'claude-3.5', context: 200, price: 3 },
  { model: 'llama-3.1', context: 128, price: 0.9 },
] as const

function DataTable({ controls }: SpecimenProps) {
  const [sort, setSort] = useState<'model' | 'context' | 'price'>('model')
  const [ascending, setAscending] = useState(true)
  const chooseSort = (next: typeof sort) => {
    if (sort === next) setAscending((value) => !value)
    else { setSort(next); setAscending(true) }
  }
  const replay = () => chooseSort(sort === 'model' ? 'context' : sort === 'context' ? 'price' : 'model')
  const reset = () => { setSort('model'); setAscending(true) }
  exposeControls(controls, replay, reset)
  const rows = [...TABLE_ROWS].sort((a, b) => {
    const left = a[sort]
    const right = b[sort]
    const result = typeof left === 'string' ? left.localeCompare(String(right)) : Number(left) - Number(right)
    return ascending ? result : -result
  })

  return (
    <Specimen label="Sortable model data table" className="ac-data-table">
      <div className="ac-table-scroll">
        <table>
          <thead><tr>
            <th><button type="button" onClick={() => chooseSort('model')}>Model <span>{sort === 'model' ? ascending ? '↑' : '↓' : ''}</span></button></th>
            <th><button type="button" onClick={() => chooseSort('context')}>Context <span>{sort === 'context' ? ascending ? '↑' : '↓' : ''}</span></button></th>
            <th><button type="button" onClick={() => chooseSort('price')}>$/1M in <span>{sort === 'price' ? ascending ? '↑' : '↓' : ''}</span></button></th>
          </tr></thead>
          <tbody>{rows.map((row) => <tr key={row.model}><td><span className="ac-model-dot" />{row.model}</td><td>{row.context}K</td><td>${row.price.toFixed(2)}</td></tr>)}</tbody>
        </table>
      </div>
    </Specimen>
  )
}

const FEATURES = [
  ['Projects', '3', 'Unlimited'],
  ['Team members', '1', 'Unlimited'],
  ['Private workspaces', false, true],
  ['Priority support', false, true],
] as const

function ComparisonTable({ controls }: SpecimenProps) {
  const [selected, setSelected] = useState<'personal' | 'enterprise'>('enterprise')
  const replay = () => setSelected((value) => value === 'personal' ? 'enterprise' : 'personal')
  const reset = () => setSelected('enterprise')
  exposeControls(controls, replay, reset)

  return (
    <Specimen label="Selectable plan comparison table" className="ac-comparison-table">
      <div className="ac-table-scroll">
        <table data-selected={selected}>
          <thead><tr><th>Feature</th><th><button type="button" onClick={() => setSelected('personal')}>Personal</button></th><th><button type="button" onClick={() => setSelected('enterprise')}>Enterprise</button></th></tr></thead>
          <tbody>{FEATURES.map(([feature, personal, enterprise]) => <tr key={feature}>
            <td>{feature}</td>
            <td>{typeof personal === 'boolean' ? personal ? <Check size={13} weight="bold" /> : <Minus size={13} /> : personal}</td>
            <td>{typeof enterprise === 'boolean' ? enterprise ? <Check size={13} weight="bold" /> : <Minus size={13} /> : enterprise}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </Specimen>
  )
}

const COMPONENTS: Record<AiCssId, (props: SpecimenProps) => ReactNode> = {
  'thinking-state': ThinkingState,
  'thinking-reasoning': ThinkingReasoning,
  'web-search': WebSearch,
  'file-diff': FileDiff,
  'image-generation': ImageGeneration,
  'text-response': TextResponse,
  'streaming-text': StreamingText,
  'inline-citations': InlineCitations,
  'code-block': CodeBlock,
  'task-list': TaskList,
  'data-table': DataTable,
  'comparison-table': ComparisonTable,
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
