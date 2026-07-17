import {
  ArrowLeft,
  ArrowClockwise,
  Bell,
  CaretDown,
  Check,
  CreditCard,
  DotsThree,
  List,
  MagnifyingGlass,
  Palette,
  Plus,
  User,
  X,
} from '@phosphor-icons/react'
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import type { TransitionId } from '../../transitions/catalog'
import './TransitionDemo.css'

export type TransitionDemoControls = {
  replay?: () => void
  reset?: () => void
}

type SpecimenProps = { controls?: TransitionDemoControls }

function exposeControls(
  controls: TransitionDemoControls | undefined,
  replay: () => void,
  reset: () => void,
) {
  if (!controls) return
  controls.replay = replay
  controls.reset = reset
}

function Specimen({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return (
    <section className={`td-specimen ${className}`} aria-label={label}>
      {children}
    </section>
  )
}

function CardResize({ controls }: SpecimenProps) {
  const [compact, setCompact] = useState(false)
  const replay = () => setCompact((value) => !value)
  const reset = () => setCompact(false)
  exposeControls(controls, replay, reset)

  return (
    <Specimen label="Smooth card resize transition" className="td-card-resize">
      <button type="button" className="td-resize-card" data-compact={compact ? 'true' : 'false'} onClick={replay} aria-label="Resize project brief card">
        <div className="td-resize-heading"><i /><span><b>Project brief</b><small>Updated just now</small></span><DotsThree size={16} /></div>
        <div className="td-resize-lines"><i /><i /><i /><i /></div>
        <div className="td-resize-footer"><span>4 tasks</span><span>Review</span></div>
      </button>
    </Specimen>
  )
}

const NUMBER_VALUES = [65.78, 18.42, 94.06, 37.91]

function NumberPopIn({ controls }: SpecimenProps) {
  const [index, setIndex] = useState(0)
  const [cycle, setCycle] = useState(0)
  const replay = () => {
    setIndex((value) => (value + 1) % NUMBER_VALUES.length)
    setCycle((value) => value + 1)
  }
  const reset = () => { setIndex(0); setCycle((value) => value + 1) }
  exposeControls(controls, replay, reset)

  return (
    <Specimen label="Digit flip with blur and stagger" className="td-number-pop">
      <button type="button" className="td-number" aria-live="polite" onClick={replay} aria-label="Show next number">
        {NUMBER_VALUES[index].toFixed(2).split('').map((character, position) => (
          <span key={`${cycle}-${position}`} style={{ '--td-i': position } as CSSProperties}>{character}</span>
        ))}
      </button>
    </Specimen>
  )
}

function NotificationBadge({ controls }: SpecimenProps) {
  const [visible, setVisible] = useState(true)
  const replay = () => setVisible((value) => !value)
  const reset = () => setVisible(true)
  exposeControls(controls, replay, reset)

  return (
    <Specimen label="Notification badge spring transition" className="td-notification">
      <button type="button" className="td-icon-button" onClick={replay} aria-label={visible ? 'Hide notification badge' : 'Show notification badge'}>
        <Bell size={21} weight="regular" />
        <span className="td-badge" data-visible={visible ? 'true' : 'false'}>3</span>
      </button>
    </Specimen>
  )
}

function TextStatesSwap({ controls }: SpecimenProps) {
  const [complete, setComplete] = useState(false)
  const [cycle, setCycle] = useState(0)
  const replay = () => { setComplete((value) => !value); setCycle((value) => value + 1) }
  const reset = () => { setComplete(false); setCycle((value) => value + 1) }
  exposeControls(controls, replay, reset)

  return (
    <Specimen label="Text state swap with blur" className="td-text-swap">
      <button type="button" className="td-status-line" aria-live="polite" onClick={replay} aria-label="Change transaction status">
        <span key={cycle} data-complete={complete ? 'true' : 'false'}>
          {complete ? <><Check size={15} weight="bold" /> Transaction completed</> : <><i /> Transaction processing…</>}
        </span>
      </button>
    </Specimen>
  )
}

function MenuDropdown({ controls }: SpecimenProps) {
  const [open, setOpen] = useState(false)
  const replay = () => setOpen((value) => !value)
  const reset = () => setOpen(false)
  exposeControls(controls, replay, reset)

  return (
    <Specimen label="Origin-aware dropdown transition" className="td-menu-demo">
      <div className="td-menu-anchor">
        <button type="button" className="td-product-trigger" onClick={replay} aria-expanded={open}>
          Menu <CaretDown size={13} weight="bold" />
        </button>
        <div className="td-menu" data-open={open ? 'true' : 'false'} aria-hidden={!open}>
          <button type="button"><User size={15} /> Profile</button>
          <button type="button"><Palette size={15} /> Appearance</button>
          <button type="button"><ArrowClockwise size={15} /> Activity</button>
        </div>
      </div>
    </Specimen>
  )
}

function ModalOpenClose({ controls }: SpecimenProps) {
  const [open, setOpen] = useState(false)
  const replay = () => setOpen((value) => !value)
  const reset = () => setOpen(false)
  exposeControls(controls, replay, reset)

  return (
    <Specimen label="Modal scale and fade transition" className="td-modal-demo">
      <button type="button" className="td-product-trigger" onClick={replay}><Plus size={13} /> New project</button>
      <div className="td-modal-layer" data-open={open ? 'true' : 'false'} aria-hidden={!open}>
        <button type="button" className="td-modal-scrim" aria-label="Close modal" onClick={() => setOpen(false)} />
        <div className="td-modal" role="dialog" aria-modal="true" aria-label="Create project">
          <span className="td-modal-icon"><Plus size={17} /></span>
          <strong>Create project?</strong>
          <small>Start with a clean workspace.</small>
          <div><button type="button" onClick={() => setOpen(false)}>Cancel</button><button type="button" onClick={() => setOpen(false)}>Create</button></div>
        </div>
      </div>
    </Specimen>
  )
}

function PanelReveal({ controls }: SpecimenProps) {
  const [open, setOpen] = useState(true)
  const replay = () => setOpen((value) => !value)
  const reset = () => setOpen(true)
  exposeControls(controls, replay, reset)

  return (
    <Specimen label="Panel open and close transition" className="td-panel-demo">
      <div className="td-panel-shell">
        <button type="button" className="td-panel-toolbar" data-open={open ? 'true' : 'false'} onClick={replay} aria-expanded={open}>
          <span><i />Analytics</span><CaretDown size={14} weight="bold" />
        </button>
        <div className="td-panel-clip" data-open={open ? 'true' : 'false'}>
          <div className="td-panel-content"><small>Weekly reach</small><strong>24,860</strong><span><i style={{ height: '45%' }} /><i style={{ height: '70%' }} /><i style={{ height: '55%' }} /><i style={{ height: '90%' }} /><i style={{ height: '78%' }} /></span></div>
        </div>
      </div>
    </Specimen>
  )
}

const ASSETS = [
  { symbol: 'E', name: 'Ethereum', code: 'ETH' },
  { symbol: 'A', name: 'Avalanche', code: 'AVAX' },
  { symbol: 'B', name: 'BNB', code: 'BNB' },
]

function PageSideBySide({ controls }: SpecimenProps) {
  const [selected, setSelected] = useState(0)
  const [detail, setDetail] = useState(false)
  const replay = () => setDetail((value) => !value)
  const reset = () => { setDetail(false); setSelected(0) }
  exposeControls(controls, replay, reset)

  return (
    <Specimen label="Forward and back page transition" className="td-page-demo">
      <div className="td-page-window" data-detail={detail ? 'true' : 'false'}>
        <div className="td-page td-page-list">
          <strong>Select asset</strong>
          {ASSETS.map((asset, index) => (
            <button type="button" key={asset.code} onClick={() => { setSelected(index); setDetail(true) }}>
              <i>{asset.symbol}</i><span>{asset.name}<small>{asset.code}</small></span><CaretDown size={14} />
            </button>
          ))}
        </div>
        <div className="td-page td-page-amount">
          <button type="button" className="td-back" onClick={() => setDetail(false)}><ArrowLeft size={14} /> Back</button>
          <span className="td-asset-chip"><i>{ASSETS[selected].symbol}</i>{ASSETS[selected].code}</span>
          <strong>$10</strong>
          <div><button type="button">25%</button><button type="button">50%</button><button type="button">Max</button></div>
          <small>$66.11 available</small>
        </div>
      </div>
    </Specimen>
  )
}

function IconSwap({ controls }: SpecimenProps) {
  const [close, setClose] = useState(false)
  const replay = () => setClose((value) => !value)
  const reset = () => setClose(false)
  exposeControls(controls, replay, reset)

  return (
    <Specimen label="Scale and blur icon swap" className="td-icon-swap">
      <button type="button" className="td-swap-button" data-close={close ? 'true' : 'false'} onClick={replay} aria-label={close ? 'Show menu icon' : 'Show close icon'}>
        <List className="td-swap-list" size={22} /><X className="td-swap-x" size={22} />
      </button>
    </Specimen>
  )
}

function SuccessCheck({ controls }: SpecimenProps) {
  const [visible, setVisible] = useState(true)
  const [cycle, setCycle] = useState(0)
  const timer = useRef<number | null>(null)
  const replay = () => {
    if (timer.current !== null) window.clearTimeout(timer.current)
    setVisible(false)
    setCycle((value) => value + 1)
    timer.current = window.setTimeout(() => {
      setVisible(true)
      setCycle((value) => value + 1)
    }, 140)
  }
  const reset = () => {
    if (timer.current !== null) window.clearTimeout(timer.current)
    setVisible(true)
    setCycle((value) => value + 1)
  }
  exposeControls(controls, replay, reset)
  useEffect(() => () => { if (timer.current !== null) window.clearTimeout(timer.current) }, [])

  return (
    <Specimen label="Success check draw transition" className="td-success">
      <button type="button" className="td-success-trigger" onClick={replay} aria-label="Replay success confirmation">
        <svg key={cycle} data-visible={visible ? 'true' : 'false'} viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="32" r="25" />
          <path d="M20 33.5 28.5 42 45 24" />
        </svg>
      </button>
    </Specimen>
  )
}

const AVATARS = [
  ['JL', '#e8d8cf'], ['MK', '#d8e3ea'], ['AN', '#e5e0c8'], ['RS', '#d9e7dd'], ['VC', '#ded8e9'], ['+2', '#ededed'],
] as const

function AvatarGroupHover({ controls }: SpecimenProps) {
  const [active, setActive] = useState<number | null>(null)
  const replay = () => setActive((value) => value === null ? 2 : null)
  const reset = () => setActive(null)
  exposeControls(controls, replay, reset)

  return (
    <Specimen label="Distance falloff avatar interaction" className="td-avatar-demo">
      <div className="td-avatars" onMouseLeave={() => setActive(null)}>
        {AVATARS.map(([initials, color], index) => {
          const distance = active === null ? 4 : Math.abs(active - index)
          const lift = active === null ? 0 : Math.pow(0.45, distance)
          return (
            <button
              type="button"
              key={initials}
              aria-label={initials === '+2' ? 'Two more collaborators' : `Collaborator ${initials}`}
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              onBlur={() => setActive(null)}
              style={{ '--td-avatar-bg': color, '--td-lift': lift } as CSSProperties}
            >{initials}</button>
          )
        })}
      </div>
      <small>Hover or focus a person</small>
    </Specimen>
  )
}

function ErrorStateShake({ controls }: SpecimenProps) {
  const [value, setValue] = useState('John')
  const [error, setError] = useState(false)
  const [cycle, setCycle] = useState(0)
  const timer = useRef<number | null>(null)
  const replay = () => {
    if (timer.current !== null) window.clearTimeout(timer.current)
    setError(true)
    setCycle((value) => value + 1)
    timer.current = window.setTimeout(() => setError(false), 3000)
  }
  const reset = () => { if (timer.current !== null) window.clearTimeout(timer.current); setValue('John'); setError(false) }
  exposeControls(controls, replay, reset)
  useEffect(() => () => { if (timer.current !== null) window.clearTimeout(timer.current) }, [])

  return (
    <Specimen label="Error state shake transition" className="td-error-demo">
      <label key={cycle} data-error={error ? 'true' : 'false'}>
        <span>Name</span>
        <input
          value={value}
          onFocus={replay}
          onKeyDown={(event) => { if (event.key === 'Enter') replay() }}
          onChange={(event) => { setValue(event.target.value); setError(false) }}
          aria-invalid={error}
          aria-describedby="td-name-help"
        />
        <small id="td-name-help" aria-live="polite">{error ? 'Please enter a valid name.' : 'Focus or press Enter to validate.'}</small>
      </label>
    </Specimen>
  )
}

function InputClear({ controls }: SpecimenProps) {
  const [cleared, setCleared] = useState(false)
  const replay = () => setCleared(true)
  const reset = () => setCleared(false)
  exposeControls(controls, replay, reset)

  return (
    <Specimen label="Input text dissolve transition" className="td-input-clear">
      <div className="td-search-field" data-cleared={cleared ? 'true' : 'false'}>
        <MagnifyingGlass size={16} />
        <span className="td-search-value" aria-hidden={cleared}>{['How', 'do', 'transitions', 'work?'].map((word, index) => <i key={word} style={{ '--td-i': index } as CSSProperties}>{word}</i>)}</span>
        <span className="td-search-placeholder" aria-hidden={!cleared}>Search</span>
        <button type="button" onClick={cleared ? reset : replay} aria-label={cleared ? 'Restore search text' : 'Clear search'}>
          {cleared ? <ArrowClockwise size={14} /> : <X size={14} />}
        </button>
      </div>
    </Specimen>
  )
}

function SkeletonReveal({ controls }: SpecimenProps) {
  const [loading, setLoading] = useState(false)
  const timer = useRef<number | null>(null)
  const replay = () => {
    if (timer.current !== null) window.clearTimeout(timer.current)
    setLoading(true)
    timer.current = window.setTimeout(() => setLoading(false), 1000)
  }
  const reset = () => { if (timer.current !== null) window.clearTimeout(timer.current); setLoading(false) }
  exposeControls(controls, replay, reset)
  useEffect(() => () => { if (timer.current !== null) window.clearTimeout(timer.current) }, [])

  return (
    <Specimen label="Skeleton loader and content reveal" className="td-skeleton-demo">
      <button type="button" className="td-profile" data-loading={loading ? 'true' : 'false'} aria-busy={loading} onClick={replay} aria-label="Refresh profile">
        <span className="td-profile-avatar">JC</span>
        <span className="td-profile-copy"><strong>Jane Cooper</strong><small>jane.cooper@example.com</small></span>
        <span className="td-skeleton-avatar" /><span className="td-skeleton-copy"><i /><i /></span>
      </button>
    </Specimen>
  )
}

function TextsReveal({ controls }: SpecimenProps) {
  const [visible, setVisible] = useState(true)
  const [cycle, setCycle] = useState(0)
  const timer = useRef<number | null>(null)
  const replay = () => {
    if (timer.current !== null) window.clearTimeout(timer.current)
    setVisible(false)
    timer.current = window.setTimeout(() => {
      setVisible(true)
      setCycle((value) => value + 1)
    }, 170)
  }
  const reset = () => {
    if (timer.current !== null) window.clearTimeout(timer.current)
    setVisible(true)
    setCycle((value) => value + 1)
  }
  exposeControls(controls, replay, reset)
  useEffect(() => () => { if (timer.current !== null) window.clearTimeout(timer.current) }, [])

  return (
    <Specimen label="Staggered text reveal" className="td-texts-reveal">
      <button type="button" key={cycle} data-visible={visible ? 'true' : 'false'} onClick={replay} aria-label="Replay text reveal">
        <strong>Pull request opened</strong>
        <span>Review requested from 3 teammates</span>
      </button>
    </Specimen>
  )
}

const TAB_LABELS = ['Plan', 'Debug', 'Ask'] as const

function TabsSliding({ controls }: SpecimenProps) {
  const [active, setActive] = useState(0)
  const replay = () => setActive((value) => (value + 1) % TAB_LABELS.length)
  const reset = () => setActive(0)
  exposeControls(controls, replay, reset)
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    if (event.key === 'Home') setActive(0)
    else if (event.key === 'End') setActive(TAB_LABELS.length - 1)
    else setActive((value) => (value + (event.key === 'ArrowRight' ? 1 : -1) + TAB_LABELS.length) % TAB_LABELS.length)
  }

  return (
    <Specimen label="Sliding tabs indicator" className="td-tabs-demo">
      <div className="td-tabs" role="tablist" aria-label="Mode" onKeyDown={onKeyDown} style={{ '--td-tab': active } as CSSProperties}>
        <i aria-hidden="true" />
        {TAB_LABELS.map((label, index) => <button type="button" role="tab" aria-selected={active === index} tabIndex={active === index ? 0 : -1} key={label} onClick={() => setActive(index)}>{label}</button>)}
      </div>
      <small>{active === 0 ? 'Planning next moves' : active === 1 ? 'Inspecting the interface' : 'Ask about this project'}</small>
    </Specimen>
  )
}

function ShimmerText({ controls }: SpecimenProps) {
  const [running, setRunning] = useState(true)
  const replay = () => setRunning((value) => !value)
  const reset = () => setRunning(true)
  exposeControls(controls, replay, reset)

  return (
    <Specimen label="Masked gradient shimmer text" className="td-shimmer-demo">
      <button type="button" className="td-shimmer" data-running={running ? 'true' : 'false'} onClick={replay} aria-label={running ? 'Pause shimmer' : 'Play shimmer'}>
        Planning next moves
      </button>
    </Specimen>
  )
}

function TooltipOpenClose({ controls }: SpecimenProps) {
  const [forced, setForced] = useState(false)
  const replay = () => setForced((value) => !value)
  const reset = () => setForced(false)
  exposeControls(controls, replay, reset)

  return (
    <Specimen label="Tooltip open and close transition" className="td-tooltip-demo">
      <div className="td-tooltip-anchor" data-forced={forced ? 'true' : 'false'}>
        <button type="button" onClick={replay} aria-describedby="td-tooltip-copy">Hover me</button>
        <span role="tooltip" id="td-tooltip-copy">Tooltip text</span>
      </div>
    </Specimen>
  )
}

function CardTilt({ controls }: SpecimenProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0, gx: 50, gy: 50 })
  const replay = () => setTilt((value) => value.x === 0 ? { x: -9, y: 12, gx: 72, gy: 28 } : { x: 0, y: 0, gx: 50, gy: 50 })
  const reset = () => setTilt({ x: 0, y: 0, gx: 50, gy: 50 })
  exposeControls(controls, replay, reset)

  return (
    <Specimen label="Pointer-responsive 3D card tilt" className="td-tilt-demo">
      <div
        className="td-tilt-track"
        onPointerMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect()
          const px = (event.clientX - rect.left) / rect.width
          const py = (event.clientY - rect.top) / rect.height
          setTilt({ x: (0.5 - py) * 28, y: (px - 0.5) * 28, gx: px * 100, gy: py * 100 })
        }}
        onPointerDown={(event) => event.currentTarget.setPointerCapture(event.pointerId)}
        onPointerLeave={reset}
        style={{ '--td-rx': `${tilt.x}deg`, '--td-ry': `${tilt.y}deg`, '--td-gx': `${tilt.gx}%`, '--td-gy': `${tilt.gy}%` } as CSSProperties}
      >
        <div className="td-credit-card">
          <span>Credit</span><strong>VISA</strong><i /><b>John Smith</b><small>4111 · 1111 · 1111 · 1111</small>
        </div>
      </div>
    </Specimen>
  )
}

function DropdownMenuMorph({ controls }: SpecimenProps) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const replay = () => setOpen((value) => !value)
  const reset = () => setOpen(false)
  exposeControls(controls, replay, reset)
  useEffect(() => {
    const onPointer = (event: PointerEvent) => { if (open && root.current && !root.current.contains(event.target as Node)) setOpen(false) }
    const onKey = (event: globalThis.KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('pointerdown', onPointer); document.removeEventListener('keydown', onKey) }
  }, [open])

  return (
    <Specimen label="Button to dropdown surface morph" className="td-morph-demo">
      <div ref={root} className="td-morph-menu" data-open={open ? 'true' : 'false'}>
        <button type="button" className="td-morph-trigger" onClick={replay} aria-label={open ? 'Close menu' : 'Open menu'}><Plus size={18} /></button>
        <div className="td-morph-content" aria-hidden={!open}>
          <button type="button"><User size={15} /> New profile</button>
          <button type="button"><CreditCard size={15} /> Add payment</button>
          <button type="button"><Palette size={15} /> Appearance</button>
        </div>
      </div>
    </Specimen>
  )
}

function Accordion({ controls }: SpecimenProps) {
  const [open, setOpen] = useState(false)
  const replay = () => setOpen((value) => !value)
  const reset = () => setOpen(false)
  exposeControls(controls, replay, reset)

  return (
    <Specimen label="Grid row accordion transition" className="td-accordion-demo">
      <div className="td-accordion" data-open={open ? 'true' : 'false'}>
        <button type="button" onClick={replay} aria-expanded={open}><span><User size={16} /> best spider man</span><CaretDown size={15} /></button>
        <div className="td-accordion-track"><div className="td-accordion-panel">
          <label><span><User size={14} /> Tom Holland</span><input type="radio" name="td-spider-man" defaultChecked /></label>
          <label><span><User size={14} /> Andrew Garfield</span><input type="radio" name="td-spider-man" /></label>
          <label><span><User size={14} /> Toby Maguire</span><input type="radio" name="td-spider-man" /></label>
        </div></div>
      </div>
    </Specimen>
  )
}

function TransitionSpecimen({ id, controls }: { id: TransitionId; controls?: TransitionDemoControls }) {
  switch (id) {
    case 'card-resize': return <CardResize controls={controls} />
    case 'number-pop-in': return <NumberPopIn controls={controls} />
    case 'notification-badge': return <NotificationBadge controls={controls} />
    case 'text-states-swap': return <TextStatesSwap controls={controls} />
    case 'menu-dropdown': return <MenuDropdown controls={controls} />
    case 'modal-open-close': return <ModalOpenClose controls={controls} />
    case 'panel-reveal': return <PanelReveal controls={controls} />
    case 'page-side-by-side': return <PageSideBySide controls={controls} />
    case 'icon-swap': return <IconSwap controls={controls} />
    case 'success-check': return <SuccessCheck controls={controls} />
    case 'avatar-group-hover': return <AvatarGroupHover controls={controls} />
    case 'error-state-shake': return <ErrorStateShake controls={controls} />
    case 'input-clear': return <InputClear controls={controls} />
    case 'skeleton-loader-reveal': return <SkeletonReveal controls={controls} />
    case 'texts-reveal': return <TextsReveal controls={controls} />
    case 'tabs-sliding': return <TabsSliding controls={controls} />
    case 'shimmer-text': return <ShimmerText controls={controls} />
    case 'tooltip-open-close': return <TooltipOpenClose controls={controls} />
    case '3d-tilt': return <CardTilt controls={controls} />
    case 'dropdown-menu-morph': return <DropdownMenuMorph controls={controls} />
    case 'accordion': return <Accordion controls={controls} />
  }
}

export function TransitionDemo({
  id,
  compact = false,
  controls,
}: {
  id: TransitionId
  compact?: boolean
  controls?: TransitionDemoControls
}) {
  return (
    <div className="td-demo" data-compact={compact ? 'true' : 'false'} data-transition={id}>
      <div className="td-canvas">
        <TransitionSpecimen id={id} controls={controls} />
      </div>
    </div>
  )
}
