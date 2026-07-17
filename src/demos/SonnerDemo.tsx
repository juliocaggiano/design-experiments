import {
  CheckCircle,
  Info,
  SpinnerGap,
  Warning,
  X,
  XCircle,
} from '@phosphor-icons/react'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from 'react'
import './SonnerDemo.css'

export type SonnerToastType =
  | 'default'
  | 'description'
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'action'
  | 'promise'

export type SonnerPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

export type SonnerStackMode = 'stacked' | 'expanded'

export interface SonnerControls {
  replay?: () => void
  reset?: () => void
  show?: () => void
}

type SonnerDemoProps = {
  compact?: boolean
  controls?: SonnerControls
  position?: SonnerPosition
  stackMode?: SonnerStackMode
  toastType?: SonnerToastType
  closeButton?: boolean
}

type ToastRecord = {
  id: number
  type: Exclude<SonnerToastType, 'promise'> | 'loading'
  title: string
  description?: string
  mounted: boolean
  removing: boolean
  swiping: boolean
  swipeX: number
  swipeY: number
  exitX: number
  exitY: number
}

type ToastStyle = CSSProperties & {
  '--expanded-y': string
  '--stack-scale': string
  '--stack-y': string
  '--swipe-x': string
  '--swipe-y': string
  '--exit-x': string
  '--exit-y': string
}

const TOAST_PRESETS: Record<SonnerToastType, Pick<ToastRecord, 'title' | 'description'>> = {
  default: { title: 'Event has been created' },
  description: { title: 'Event has been created', description: 'Monday, January 3rd at 6:00pm' },
  success: { title: 'Event has been created' },
  info: { title: 'Be at the area 10 minutes before the event time' },
  warning: { title: 'Event start time cannot be earlier than 8am' },
  error: { title: 'Event has not been created' },
  action: { title: 'Event has been created' },
  promise: { title: 'Loading…' },
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function ToastIcon({ type }: { type: ToastRecord['type'] }) {
  if (type === 'success') return <CheckCircle size={16} weight="fill" aria-hidden="true" />
  if (type === 'info') return <Info size={16} weight="fill" aria-hidden="true" />
  if (type === 'warning') return <Warning size={16} weight="fill" aria-hidden="true" />
  if (type === 'error') return <XCircle size={16} weight="fill" aria-hidden="true" />
  if (type === 'loading') return <SpinnerGap className="sv-spinner" size={16} weight="bold" aria-hidden="true" />
  return null
}

export function SonnerDemo({
  compact = false,
  controls,
  position = 'bottom-center',
  stackMode = 'stacked',
  toastType = 'default',
  closeButton = false,
}: SonnerDemoProps) {
  const root = useRef<HTMLDivElement>(null)
  const nextId = useRef(1)
  const timers = useRef<number[]>([])
  const drag = useRef<{ id: number; x: number; y: number; dx: number; dy: number } | null>(null)
  const [active, setActive] = useState(!compact)
  const [toasts, setToasts] = useState<ToastRecord[]>([])

  const pushTimer = (callback: () => void, delay: number) => {
    const timer = window.setTimeout(callback, delay)
    timers.current.push(timer)
    return timer
  }

  const clearTimers = () => {
    timers.current.forEach(window.clearTimeout)
    timers.current = []
  }

  const removeToast = useCallback((id: number, exit?: { x: number; y: number }) => {
    setToasts((current) => current.map((toast) => (
      toast.id === id
        ? {
            ...toast,
            removing: true,
            swiping: false,
            exitX: exit?.x ?? 0,
            exitY: exit?.y ?? (position.startsWith('top') ? -120 : 120),
          }
        : toast
    )))
    pushTimer(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 230)
  }, [position])

  const scheduleRemoval = useCallback((id: number, delay = 4600) => {
    pushTimer(() => removeToast(id), delay)
  }, [removeToast])

  const showToast = useCallback((settled = false) => {
    const id = nextId.current
    nextId.current += 1
    const preset = TOAST_PRESETS[toastType]
    const initialType = toastType === 'promise' ? 'loading' : toastType
    const nextToast: ToastRecord = {
      id,
      type: initialType,
      title: preset.title,
      description: preset.description,
      mounted: settled,
      removing: false,
      swiping: false,
      swipeX: 0,
      swipeY: 0,
      exitX: 0,
      exitY: 0,
    }

    setToasts((current) => compact ? [nextToast] : [nextToast, ...current].slice(0, 3))
    if (!settled) {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setToasts((current) => current.map((toast) => toast.id === id ? { ...toast, mounted: true } : toast))
        })
      })
    }

    if (toastType === 'promise') {
      pushTimer(() => {
        setToasts((current) => current.map((toast) => (
          toast.id === id
            ? { ...toast, type: 'success', title: 'Sonner toast has been added', mounted: true }
            : toast
        )))
        scheduleRemoval(id, 3600)
      }, 1350)
      return
    }

    scheduleRemoval(id)
  }, [compact, scheduleRemoval, toastType])

  const reset = useCallback(() => {
    clearTimers()
    drag.current = null
    setToasts([])
  }, [])

  const replay = useCallback(() => {
    reset()
    pushTimer(() => showToast(prefersReducedMotion()), 40)
  }, [reset, showToast])

  const showRef = useRef(showToast)
  const resetRef = useRef(reset)
  showRef.current = showToast
  resetRef.current = reset

  if (controls) {
    controls.replay = replay
    controls.reset = reset
    controls.show = () => showToast(prefersReducedMotion())
  }

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

  const experienceKey = `${toastType}-${position}-${stackMode}-${closeButton}`
  const startedKey = useRef<string | null>(null)

  useEffect(() => {
    if (!active) {
      startedKey.current = null
      resetRef.current()
      return
    }

    const reduced = prefersReducedMotion()
    if (startedKey.current !== experienceKey) {
      startedKey.current = experienceKey
      resetRef.current()
      showRef.current(reduced)
    }

    if (!compact || reduced) return
    const interval = window.setInterval(() => showRef.current(false), 5200)
    return () => window.clearInterval(interval)
  }, [active, compact, experienceKey])

  useEffect(() => () => clearTimers(), [])

  const onPointerDown = (event: PointerEvent<HTMLLIElement>, id: number) => {
    if ((event.target as Element).closest('button')) return
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = { id, x: event.clientX, y: event.clientY, dx: 0, dy: 0 }
    setToasts((current) => current.map((toast) => toast.id === id ? { ...toast, swiping: true } : toast))
  }

  const onPointerMove = (event: PointerEvent<HTMLLIElement>, id: number) => {
    if (!drag.current || drag.current.id !== id) return
    const dx = event.clientX - drag.current.x
    const dy = event.clientY - drag.current.y
    drag.current = { ...drag.current, dx, dy }
    setToasts((current) => current.map((toast) => (
      toast.id === id ? { ...toast, swipeX: dx, swipeY: dy } : toast
    )))
  }

  const onPointerUp = (event: PointerEvent<HTMLLIElement>, id: number) => {
    if (!drag.current || drag.current.id !== id) return
    const { dx, dy } = drag.current
    drag.current = null
    const horizontal = Math.abs(dx) > Math.abs(dy)
    const amount = horizontal ? dx : dy
    if (Math.abs(amount) >= 45) {
      removeToast(id, {
        x: horizontal ? Math.sign(dx || 1) * 380 : 0,
        y: horizontal ? 0 : Math.sign(dy || 1) * 240,
      })
      return
    }
    setToasts((current) => current.map((toast) => (
      toast.id === id ? { ...toast, swiping: false, swipeX: 0, swipeY: 0 } : toast
    )))
    event.currentTarget.releasePointerCapture(event.pointerId)
  }

  const [yPosition, xPosition] = position.split('-') as ['top' | 'bottom', 'left' | 'center' | 'right']
  const stackDirection = yPosition === 'top' ? 1 : -1

  return (
    <div
      ref={root}
      className="sv-demo"
      data-active={active ? 'true' : 'false'}
      data-compact={compact ? 'true' : 'false'}
    >
      <button type="button" className="sv-trigger" onClick={() => showToast(prefersReducedMotion())}>
        Render a toast
      </button>

      <ol
        className="sv-toaster"
        data-mode={stackMode}
        data-x={xPosition}
        data-y={yPosition}
        aria-label="Toast notifications"
      >
        {toasts.map((toast, index) => {
          const style: ToastStyle = {
            '--stack-y': `${stackDirection * index * 8}px`,
            '--expanded-y': `${stackDirection * index * 72}px`,
            '--stack-scale': `${1 - index * 0.05}`,
            '--swipe-x': `${toast.swipeX}px`,
            '--swipe-y': `${toast.swipeY}px`,
            '--exit-x': `${toast.exitX}px`,
            '--exit-y': `${toast.exitY}px`,
            zIndex: toasts.length - index,
          }
          return (
            <li
              key={toast.id}
              className="sv-toast"
              data-front={index === 0 ? 'true' : 'false'}
              data-mounted={toast.mounted ? 'true' : 'false'}
              data-removing={toast.removing ? 'true' : 'false'}
              data-swiping={toast.swiping ? 'true' : 'false'}
              data-type={toast.type}
              data-y={yPosition}
              role={toast.type === 'error' ? 'alert' : 'status'}
              tabIndex={0}
              style={style}
              onPointerDown={(event) => onPointerDown(event, toast.id)}
              onPointerMove={(event) => onPointerMove(event, toast.id)}
              onPointerUp={(event) => onPointerUp(event, toast.id)}
              onPointerCancel={() => {
                drag.current = null
                setToasts((current) => current.map((item) => (
                  item.id === toast.id ? { ...item, swiping: false, swipeX: 0, swipeY: 0 } : item
                )))
              }}
            >
              {closeButton && toast.type !== 'loading' ? (
                <button
                  type="button"
                  className="sv-close"
                  aria-label="Close toast"
                  onClick={() => removeToast(toast.id)}
                >
                  <X size={11} weight="bold" aria-hidden="true" />
                </button>
              ) : null}
              <span className="sv-toast-inner">
                <span className="sv-icon"><ToastIcon type={toast.type} /></span>
                <span className="sv-content">
                  <strong>{toast.title}</strong>
                  {toast.description ? <small>{toast.description}</small> : null}
                </span>
                {toastType === 'action' ? (
                  <button type="button" className="sv-action" onClick={() => removeToast(toast.id)}>Undo</button>
                ) : null}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
