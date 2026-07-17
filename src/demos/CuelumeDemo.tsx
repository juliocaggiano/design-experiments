import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import {
  ArrowUp,
  Bell,
  CaretDown,
  Check,
  CheckCircle,
  CheckSquare,
  Drop,
  FileText,
  Flower,
  HandTap,
  PlayCircle,
  Sparkle,
  SpeakerSlash,
  SpinnerGap,
  ToggleLeft,
  WarningCircle,
} from '@phosphor-icons/react'
import { bind, play, sounds, type SoundName } from 'cuelume'
import './CuelumeDemo.css'

type CueMeta = {
  color: string
  description: string
  action: string
}

const CUE_META: Record<SoundName, CueMeta> = {
  chime: { color: '#79c9e8', description: 'Soft two-note bell', action: 'Send notification' },
  sparkle: { color: '#ffcd6c', description: 'Quick four-note twinkle', action: 'Add a little magic' },
  droplet: { color: '#62bdf1', description: 'Single descending glide', action: 'Add one drop' },
  bloom: { color: '#ef69b0', description: 'Warm, slow swell', action: 'Open details' },
  whisper: { color: '#d8d5d0', description: 'Breathy quiet texture', action: 'Quiet mode' },
  tick: { color: '#d5ab45', description: 'Crisp instant tick', action: 'Include updates' },
  press: { color: '#858585', description: 'Dull muted knock', action: 'Press and hold' },
  release: { color: '#65c76f', description: 'Bright springy tick', action: 'Release to finish' },
  toggle: { color: '#a968e8', description: 'Mechanical click-clack', action: 'Notifications' },
  success: { color: '#5bcf9a', description: 'Three-note confirmation', action: 'Save changes' },
  error: { color: '#eb7468', description: 'Soft descending refusal', action: 'Try again' },
  page: { color: '#c9aa84', description: 'Papery flick and tick', action: 'Next page' },
  loading: { color: '#6f9fe7', description: 'Unresolved rising shimmer', action: 'Generate preview' },
  ready: { color: '#55aa97', description: 'Focus tick and bloom', action: 'Start session' },
}

const SHORTCUT_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'q', 'w', 'e', 'r'] as const
const KEY_CUES = Object.fromEntries(
  SHORTCUT_KEYS.map((key, index) => [key, sounds[index]]),
) as Record<string, SoundName>
const SHORTCUT_BY_CUE = Object.fromEntries(
  SHORTCUT_KEYS.map((key, index) => [sounds[index], key.toUpperCase()]),
) as Record<SoundName, string>

const CUES = sounds.map((name) => ({ name, ...CUE_META[name] }))
const INITIAL_CUE_STATE = Object.fromEntries(sounds.map((name) => [name, false])) as Record<SoundName, boolean>

function label(name: SoundName) {
  return name.charAt(0).toUpperCase() + name.slice(1)
}

function CueIcon({ name, active, loading }: { name: SoundName; active: boolean; loading: boolean }) {
  const props = { size: 19, weight: 'regular' as const }

  if (name === 'chime') return <Bell {...props} />
  if (name === 'sparkle') return <Sparkle {...props} />
  if (name === 'droplet') return <Drop {...props} />
  if (name === 'bloom') return <Flower {...props} />
  if (name === 'whisper') return <SpeakerSlash {...props} />
  if (name === 'tick') return <CheckSquare {...props} />
  if (name === 'press') return <HandTap {...props} />
  if (name === 'release') return <ArrowUp {...props} />
  if (name === 'toggle') return <ToggleLeft {...props} />
  if (name === 'success') return <CheckCircle {...props} />
  if (name === 'error') return <WarningCircle {...props} />
  if (name === 'page') return <FileText {...props} />
  if (name === 'loading') return <SpinnerGap {...props} className={loading ? 'cl-spin' : undefined} />
  return active ? <CheckCircle {...props} /> : <PlayCircle {...props} />
}

function CueFeedback({
  name,
  active,
  loading,
  page,
}: {
  name: SoundName
  active: boolean
  loading: boolean
  page: number
}) {
  if (name === 'toggle' || name === 'whisper') {
    return <span className="cl-toggle-ui" aria-hidden="true"><i /></span>
  }

  if (name === 'tick') {
    return <span className="cl-check-ui" aria-hidden="true"><Check size={12} weight="bold" /></span>
  }

  const feedback = name === 'press' ? 'Hold'
    : name === 'release' ? 'Lift'
      : name === 'success' ? (active ? 'Saved' : 'Save')
        : name === 'error' ? 'Retry'
          : name === 'page' ? `Page ${page}`
            : name === 'loading' ? (loading ? 'Loading' : 'Run')
              : name === 'ready' ? (active ? 'Ready' : 'Start')
                : name === 'bloom' ? (active ? 'Close' : 'Open')
                  : name === 'chime' ? 'Notify'
                    : name === 'sparkle' ? 'Apply'
                      : 'Add'

  return <span className="cl-cue-feedback" aria-hidden="true">{feedback}</span>
}

export type CuelumeControls = {
  reset?: () => void
}

export function CuelumeDemo({ controls }: { controls?: CuelumeControls }) {
  const [selected, setSelected] = useState<SoundName>('chime')
  const [lastPlayed, setLastPlayed] = useState<SoundName | null>(null)
  const [playSequence, setPlaySequence] = useState(0)
  const [cueState, setCueState] = useState<Record<SoundName, boolean>>({ ...INITIAL_CUE_STATE })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])
  const loadingTimerRef = useRef<number | null>(null)
  const listboxId = useId()
  const selectedCue = CUES.find((cue) => cue.name === selected) ?? CUES[0]
  const selectedActive = cueState[selected]

  const playCue = useCallback((name: SoundName) => {
    play(name)
    setLastPlayed(name)
    setPlaySequence((value) => value + 1)
  }, [])

  const activateCue = useCallback((name: SoundName) => {
    playCue(name)

    if (name === 'page') {
      setPage((value) => value === 3 ? 1 : value + 1)
      return
    }

    if (name === 'loading') {
      if (loadingTimerRef.current) window.clearTimeout(loadingTimerRef.current)
      setLoading(true)
      loadingTimerRef.current = window.setTimeout(() => setLoading(false), 1200)
      return
    }

    setCueState((current) => ({ ...current, [name]: !current[name] }))
  }, [playCue])

  const reset = useCallback(() => {
    if (loadingTimerRef.current) window.clearTimeout(loadingTimerRef.current)
    setSelected('chime')
    setLastPlayed(null)
    setPlaySequence(0)
    setCueState({ ...INITIAL_CUE_STATE })
    setPage(1)
    setLoading(false)
    setMenuOpen(false)
  }, [])

  if (controls) controls.reset = reset

  useEffect(() => {
    if (rootRef.current) bind(rootRef.current)
    return () => {
      if (loadingTimerRef.current) window.clearTimeout(loadingTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const onOutsidePointer = (event: PointerEvent) => {
      const target = event.target
      if (target instanceof Node && !rootRef.current?.contains(target)) setMenuOpen(false)
    }
    document.addEventListener('pointerdown', onOutsidePointer)
    return () => document.removeEventListener('pointerdown', onOutsidePointer)
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return
    const index = CUES.findIndex((cue) => cue.name === selected)
    const frame = window.requestAnimationFrame(() => optionRefs.current[index]?.focus())
    return () => window.cancelAnimationFrame(frame)
  }, [menuOpen, selected])

  const selectCue = (name: SoundName) => {
    setSelected(name)
    setMenuOpen(false)
    playCue(name)
    window.requestAnimationFrame(() => triggerRef.current?.focus())
  }

  const onOptionKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') nextIndex = (index + 1) % CUES.length
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') nextIndex = (index - 1 + CUES.length) % CUES.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = CUES.length - 1
    if (event.key === 'Escape') {
      event.preventDefault()
      setMenuOpen(false)
      triggerRef.current?.focus()
      return
    }
    if (nextIndex === null) return
    event.preventDefault()
    optionRefs.current[nextIndex]?.focus()
  }

  const cueStyle = { '--cl-cue-color': selectedCue.color } as CSSProperties
  const toggleLike = selected === 'toggle' || selected === 'whisper'

  return (
    <div
      ref={rootRef}
      className="cl-shell"
      data-menu-open={menuOpen || undefined}
      role="region"
      aria-label="Interaction sound selector"
      tabIndex={0}
      style={cueStyle}
      onKeyDown={(event) => {
        if (menuOpen || event.altKey || event.ctrlKey || event.metaKey) return
        const cue = KEY_CUES[event.key.toLowerCase()]
        if (!cue) return
        event.preventDefault()
        setSelected(cue)
        playCue(cue)
      }}
    >
      <div className="cl-stage">
        <div className="cl-control-card">
          <div className="cl-eyebrow">
            <span>Interaction sound</span>
            <span>{label(selected)} · {SHORTCUT_BY_CUE[selected]}</span>
          </div>

          <div className="cl-split-control">
            <button
              type="button"
              className="cl-cue-button"
              role={toggleLike ? 'switch' : selected === 'tick' ? 'checkbox' : undefined}
              aria-checked={toggleLike || selected === 'tick' ? selectedActive : undefined}
              aria-busy={selected === 'loading' ? loading : undefined}
              aria-label={`${selectedCue.action}. ${selectedCue.description}. Plays ${selected} cue`}
              data-cue={selected}
              data-active={selectedActive || undefined}
              data-loading={selected === 'loading' && loading ? true : undefined}
              data-cuelume-hover="tick"
              onPointerDown={() => {
                if (selected === 'press') activateCue(selected)
              }}
              onPointerUp={() => {
                if (selected === 'release') activateCue(selected)
              }}
              onClick={(event) => {
                if (selected === 'press' || selected === 'release') {
                  if (event.detail === 0) activateCue(selected)
                  return
                }
                activateCue(selected)
              }}
            >
              <span
                key={playSequence}
                className="cl-cue-icon"
                data-played={lastPlayed ? true : undefined}
                aria-hidden="true"
              >
                <CueIcon name={selected} active={selectedActive} loading={loading} />
              </span>
              <span className="cl-cue-copy">
                <strong>{selectedCue.action}</strong>
                <span>{selectedCue.description}</span>
              </span>
              <CueFeedback name={selected} active={selectedActive} loading={loading} page={page} />
            </button>

            <button
              ref={triggerRef}
              type="button"
              className="cl-menu-trigger"
              aria-label="Choose a sound and control"
              aria-haspopup="listbox"
              aria-expanded={menuOpen}
              aria-controls={listboxId}
              data-cuelume-toggle
              onClick={() => setMenuOpen((open) => !open)}
            >
              <CaretDown size={16} weight="bold" />
            </button>
          </div>

          <div className="cl-status" aria-live="polite">
            <span><i aria-hidden="true" />{lastPlayed ? `${label(lastPlayed)} played` : 'Choose a control, then interact'}</span>
            <span>Keys 1–0 · Q–R</span>
          </div>
        </div>

        {menuOpen ? (
          <>
            <div
              className="cl-menu-scrim"
              aria-hidden="true"
              onPointerDown={(event) => {
                event.stopPropagation()
                setMenuOpen(false)
                triggerRef.current?.focus()
              }}
            />
            <div id={listboxId} className="cl-sound-menu" role="listbox" aria-label="Choose a Cuelume cue and control">
              <div className="cl-menu-heading">
                <strong>Choose a sound + control</strong>
                <span>Exact Cuelume 0.1.2 audio</span>
              </div>
              <div className="cl-menu-grid">
                {CUES.map((cue, index) => (
                  <button
                    key={cue.name}
                    ref={(element) => { optionRefs.current[index] = element }}
                    type="button"
                    role="option"
                    aria-selected={selected === cue.name}
                    aria-label={`${label(cue.name)}: ${cue.action} ${SHORTCUT_BY_CUE[cue.name]}`}
                    className="cl-sound-option"
                    data-cuelume-hover="tick"
                    onClick={() => selectCue(cue.name)}
                    onKeyDown={(event) => onOptionKeyDown(event, index)}
                  >
                    <span className="cl-option-dot" style={{ backgroundColor: cue.color }} aria-hidden="true" />
                    <span className="cl-option-copy">
                      <strong>{label(cue.name)}</strong>
                      <span>{cue.action}</span>
                    </span>
                    <kbd>{SHORTCUT_BY_CUE[cue.name]}</kbd>
                    <Check className="cl-option-check" size={13} weight="bold" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
