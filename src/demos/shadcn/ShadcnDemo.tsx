import 'react-day-picker/style.css'
import {
  Calculator,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileCode,
  MoreHorizontal,
  Search,
  Settings,
  Smile,
  User,
  X,
} from 'lucide-react'
import { Command as CommandPrimitive } from 'cmdk'
import useEmblaCarousel, { type UseEmblaCarouselType } from 'embla-carousel-react'
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
} from 'react-day-picker'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  type TooltipContentProps,
} from 'recharts'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ComponentProps,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import type { ShadcnId } from '../../shadcn/catalog'
import './ShadcnDemo.css'

export type ShadcnDemoControls = {
  replay?: () => void
  reset?: () => void
}

type DemoProps = {
  compact?: boolean
  controls?: ShadcnDemoControls
  id: ShadcnId
}

function exposeControls(
  controls: ShadcnDemoControls | undefined,
  replay: () => void,
  reset: () => void,
) {
  if (!controls) return
  controls.replay = replay
  controls.reset = reset
}

function ExactButton({
  children,
  className = '',
  variant = 'default',
  size = 'default',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: 'default' | 'outline' | 'ghost' | 'link'
  size?: 'default' | 'icon' | 'icon-sm' | 'icon-xs'
}) {
  return (
    <button
      type="button"
      className={`sx-button sx-button-${variant} sx-button-size-${size} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

const attachmentImages = [
  { name: 'workspace.png', meta: 'PNG · 820 KB', src: '/vault/shadcn/workspace.jpg', alt: 'Workspace' },
  { name: 'desk-reference.jpg', meta: 'JPG · 1.1 MB', src: '/vault/shadcn/desk-reference.jpg', alt: 'Desk' },
  { name: 'office-reference.jpg', meta: 'JPG · 940 KB', src: '/vault/shadcn/office-reference.jpg', alt: 'Office' },
]

function AttachmentDemo({ controls }: { controls?: ShadcnDemoControls }) {
  const [images, setImages] = useState(attachmentImages)
  const [uploadVisible, setUploadVisible] = useState(true)
  const [codeFileVisible, setCodeFileVisible] = useState(true)
  const [activePreview, setActivePreview] = useState<(typeof attachmentImages)[number] | null>(null)

  const reset = () => {
    setImages(attachmentImages)
    setUploadVisible(true)
    setCodeFileVisible(true)
    setActivePreview(null)
  }

  exposeControls(controls, reset, reset)

  useEffect(() => {
    if (!activePreview) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActivePreview(null)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [activePreview])

  return (
    <>
      <div className="sx-attachment-demo sx-rhea">
        <div className="sx-attachment-group" role="group" aria-label="Image attachments">
          {images.map((image) => (
            <div className="sx-attachment sx-attachment-vertical" data-state="done" key={image.name}>
              <button
                type="button"
                className="sx-attachment-open"
                aria-label={`Open ${image.name} preview`}
                onClick={(event) => {
                  event.stopPropagation()
                  setActivePreview(image)
                }}
              >
                <span className="sx-attachment-media sx-attachment-image">
                  <img src={image.src} alt={image.alt} />
                </span>
                <span className="sx-attachment-content">
                  <span className="sx-attachment-title">{image.name}</span>
                  <span className="sx-attachment-description">{image.meta}</span>
                </span>
              </button>
              <div className="sx-attachment-actions sx-attachment-image-actions">
                <ExactButton
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Remove ${image.name}`}
                  onClick={(event) => {
                    event.stopPropagation()
                    setImages((current) => current.filter((item) => item.name !== image.name))
                  }}
                >
                  <X />
                </ExactButton>
              </div>
            </div>
          ))}
        </div>

        <div className="sx-attachment-statuses" aria-live="polite">
          {uploadVisible ? (
            <div className="sx-attachment sx-attachment-horizontal" data-state="uploading">
              <div className="sx-attachment-media"><span className="sx-spinner" aria-label="Uploading" /></div>
              <div className="sx-attachment-content">
                <span className="sx-attachment-title sx-shimmer">sales-dashboard.pdf</span>
                <span className="sx-attachment-description">Uploading · 64%</span>
              </div>
              <div className="sx-attachment-actions">
                <ExactButton
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Cancel sales-dashboard.pdf upload"
                  onClick={(event) => {
                    event.stopPropagation()
                    setUploadVisible(false)
                  }}
                >
                  <X />
                </ExactButton>
              </div>
            </div>
          ) : null}

          {codeFileVisible ? (
            <div className="sx-attachment sx-attachment-horizontal" data-state="done">
              <div className="sx-attachment-media"><FileCode /></div>
              <div className="sx-attachment-content">
                <span className="sx-attachment-title">message-renderer.tsx</span>
                <span className="sx-attachment-description">TypeScript · 12 KB</span>
              </div>
              <div className="sx-attachment-actions">
                <ExactButton
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Remove message-renderer.tsx"
                  onClick={(event) => {
                    event.stopPropagation()
                    setCodeFileVisible(false)
                  }}
                >
                  <X />
                </ExactButton>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {activePreview ? createPortal(
        <div
          className="sx-attachment-lightbox sx-rhea"
          role="dialog"
          aria-modal="true"
          aria-label={`Preview ${activePreview.name}`}
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setActivePreview(null)
          }}
        >
          <div className="sx-attachment-lightbox-panel">
            <ExactButton
              className="sx-attachment-lightbox-close"
              variant="outline"
              size="icon-sm"
              aria-label="Close image preview"
              autoFocus
              onClick={() => setActivePreview(null)}
            >
              <X />
            </ExactButton>
            <img src={activePreview.src} alt={activePreview.alt} />
            <div className="sx-attachment-lightbox-caption">
              <strong>{activePreview.name}</strong>
              <span>{activePreview.meta}</span>
            </div>
          </div>
        </div>,
        document.body,
      ) : null}
    </>
  )
}

function CalendarDayButton({
  day,
  modifiers,
  className,
  ...props
}: ComponentProps<typeof DayButton>) {
  const ref = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <button
      ref={ref}
      type="button"
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      className={`sx-calendar-day-button ${className ?? ''}`}
      {...props}
    />
  )
}

function CalendarDemo({ controls }: { controls?: ShadcnDemoControls }) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const defaultClassNames = getDefaultClassNames()
  const reset = () => setDate(new Date())
  const replay = () => setDate((current) => {
    const next = new Date(current ?? new Date())
    next.setDate(next.getDate() + 1)
    return next
  })
  exposeControls(controls, replay, reset)

  return (
    <div className="sx-calendar-frame">
      <DayPicker
        mode="single"
        selected={date}
        onSelect={setDate}
        showOutsideDays
        captionLayout="dropdown"
        className={`sx-calendar ${defaultClassNames.root}`}
        classNames={{
          root: `sx-calendar ${defaultClassNames.root}`,
          months: `sx-calendar-months ${defaultClassNames.months}`,
          month: `sx-calendar-month ${defaultClassNames.month}`,
          nav: `sx-calendar-nav ${defaultClassNames.nav}`,
          button_previous: `sx-calendar-nav-button ${defaultClassNames.button_previous}`,
          button_next: `sx-calendar-nav-button ${defaultClassNames.button_next}`,
          month_caption: `sx-calendar-caption ${defaultClassNames.month_caption}`,
          dropdowns: `sx-calendar-dropdowns ${defaultClassNames.dropdowns}`,
          dropdown_root: `sx-calendar-dropdown-root ${defaultClassNames.dropdown_root}`,
          dropdown: `sx-calendar-dropdown ${defaultClassNames.dropdown}`,
          caption_label: `sx-calendar-caption-label ${defaultClassNames.caption_label}`,
          month_grid: `sx-calendar-grid ${defaultClassNames.month_grid}`,
          weekdays: `sx-calendar-weekdays ${defaultClassNames.weekdays}`,
          weekday: `sx-calendar-weekday ${defaultClassNames.weekday}`,
          week: `sx-calendar-week ${defaultClassNames.week}`,
          day: `sx-calendar-day ${defaultClassNames.day}`,
          today: `sx-calendar-today ${defaultClassNames.today}`,
          outside: `sx-calendar-outside ${defaultClassNames.outside}`,
          disabled: `sx-calendar-disabled ${defaultClassNames.disabled}`,
          hidden: `sx-calendar-hidden ${defaultClassNames.hidden}`,
          selected: defaultClassNames.selected,
        }}
        components={{
          Chevron: ({ orientation, ...props }) => {
            const Icon = orientation === 'left'
              ? ChevronLeft
              : orientation === 'right'
                ? ChevronRight
                : ChevronDown
            return <Icon className="sx-calendar-chevron" {...props} />
          },
          DayButton: CalendarDayButton,
        }}
      />
    </div>
  )
}

function CardDemo({ controls }: { controls?: ShadcnDemoControls }) {
  const form = useRef<HTMLFormElement>(null)
  const reset = () => form.current?.reset()
  exposeControls(controls, reset, reset)

  return (
    <div className="sx-card-demo sx-nova">
      <div className="sx-card">
        <div className="sx-card-header">
          <div className="sx-card-title">Login to your account</div>
          <div className="sx-card-description">Enter your email below to login to your account</div>
          <div className="sx-card-action"><ExactButton variant="link">Sign Up</ExactButton></div>
        </div>
        <div className="sx-card-content">
          <form ref={form} onSubmit={(event) => event.preventDefault()}>
            <div className="sx-form-stack">
              <div className="sx-field">
                <label htmlFor="shadcn-email">Email</label>
                <input id="shadcn-email" type="email" placeholder="m@example.com" required />
              </div>
              <div className="sx-field">
                <div className="sx-password-label">
                  <label htmlFor="shadcn-password">Password</label>
                  <a href="#" onClick={(event) => event.preventDefault()}>Forgot your password?</a>
                </div>
                <input id="shadcn-password" type="password" required />
              </div>
            </div>
          </form>
        </div>
        <div className="sx-card-footer">
          <ExactButton type="submit" className="sx-full-button">Login</ExactButton>
          <ExactButton variant="outline" className="sx-full-button">Login with Google</ExactButton>
        </div>
      </div>
    </div>
  )
}

type CarouselApi = UseEmblaCarouselType[1]

function CarouselDemo({ controls }: { controls?: ShadcnDemoControls }) {
  const [carouselRef, api] = useEmblaCarousel()
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const update = useCallback((nextApi: CarouselApi) => {
    if (!nextApi) return
    setCanScrollPrev(nextApi.canScrollPrev())
    setCanScrollNext(nextApi.canScrollNext())
  }, [])

  useEffect(() => {
    if (!api) return
    update(api)
    api.on('reInit', update)
    api.on('select', update)
    return () => {
      api.off('reInit', update)
      api.off('select', update)
    }
  }, [api, update])

  const reset = () => api?.scrollTo(0)
  const replay = () => api?.scrollNext()
  exposeControls(controls, replay, reset)

  return (
    <div
      className="sx-carousel sx-nova"
      role="region"
      aria-roledescription="carousel"
      onKeyDownCapture={(event) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault()
          api?.scrollPrev()
        } else if (event.key === 'ArrowRight') {
          event.preventDefault()
          api?.scrollNext()
        }
      }}
    >
      <div className="sx-carousel-viewport" ref={carouselRef}>
        <div className="sx-carousel-content">
          {Array.from({ length: 5 }).map((_, index) => (
            <div className="sx-carousel-item" role="group" aria-roledescription="slide" key={index}>
              <div className="sx-carousel-item-pad">
                <div className="sx-carousel-card">
                  <div className="sx-carousel-card-content"><span>{index + 1}</span></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <ExactButton
        variant="outline"
        size="icon-sm"
        className="sx-carousel-previous"
        disabled={!canScrollPrev}
        onClick={() => api?.scrollPrev()}
        aria-label="Previous slide"
      >
        <ChevronLeft />
      </ExactButton>
      <ExactButton
        variant="outline"
        size="icon-sm"
        className="sx-carousel-next"
        disabled={!canScrollNext}
        onClick={() => api?.scrollNext()}
        aria-label="Next slide"
      >
        <ChevronRight />
      </ExactButton>
    </div>
  )
}

const chartData = [
  { date: '2024-04-01', desktop: 222, mobile: 150 },
  { date: '2024-04-02', desktop: 97, mobile: 180 },
  { date: '2024-04-03', desktop: 167, mobile: 120 },
  { date: '2024-04-04', desktop: 242, mobile: 260 },
  { date: '2024-04-05', desktop: 373, mobile: 290 },
  { date: '2024-04-06', desktop: 301, mobile: 340 },
  { date: '2024-04-07', desktop: 245, mobile: 180 },
  { date: '2024-04-08', desktop: 409, mobile: 320 },
  { date: '2024-04-09', desktop: 59, mobile: 110 },
  { date: '2024-04-10', desktop: 261, mobile: 190 },
  { date: '2024-04-11', desktop: 327, mobile: 350 },
  { date: '2024-04-12', desktop: 292, mobile: 210 },
  { date: '2024-04-13', desktop: 342, mobile: 380 },
  { date: '2024-04-14', desktop: 137, mobile: 220 },
  { date: '2024-04-15', desktop: 120, mobile: 170 },
  { date: '2024-04-16', desktop: 138, mobile: 190 },
  { date: '2024-04-17', desktop: 446, mobile: 360 },
  { date: '2024-04-18', desktop: 364, mobile: 410 },
  { date: '2024-04-19', desktop: 243, mobile: 180 },
  { date: '2024-04-20', desktop: 89, mobile: 150 },
  { date: '2024-04-21', desktop: 137, mobile: 200 },
  { date: '2024-04-22', desktop: 224, mobile: 170 },
  { date: '2024-04-23', desktop: 138, mobile: 230 },
  { date: '2024-04-24', desktop: 387, mobile: 290 },
  { date: '2024-04-25', desktop: 215, mobile: 250 },
  { date: '2024-04-26', desktop: 75, mobile: 130 },
  { date: '2024-04-27', desktop: 383, mobile: 420 },
  { date: '2024-04-28', desktop: 122, mobile: 180 },
  { date: '2024-04-29', desktop: 315, mobile: 240 },
  { date: '2024-04-30', desktop: 454, mobile: 380 },
]

type ChartKind = 'desktop' | 'mobile'

function ExactChartTooltip({
  active,
  payload,
  label,
}: TooltipContentProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="sx-chart-tooltip">
      <strong>
        {new Date(String(label)).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </strong>
      {payload.map((item) => (
        <span key={String(item.dataKey)}>
          <i style={{ backgroundColor: item.color }} />
          Page Views
          <b>{Number(item.value).toLocaleString()}</b>
        </span>
      ))}
    </div>
  )
}

function ChartDemo({ controls }: { controls?: ShadcnDemoControls }) {
  const [activeChart, setActiveChart] = useState<ChartKind>('desktop')
  const total = useMemo(() => ({
    desktop: chartData.reduce((sum, item) => sum + item.desktop, 0),
    mobile: chartData.reduce((sum, item) => sum + item.mobile, 0),
  }), [])
  const reset = () => setActiveChart('desktop')
  const replay = () => setActiveChart((value) => value === 'desktop' ? 'mobile' : 'desktop')
  exposeControls(controls, replay, reset)

  return (
    <div className="sx-chart-card sx-nova">
      <div className="sx-chart-header">
        <div className="sx-chart-heading">
          <strong>Bar Chart - Interactive</strong>
          <span>Showing total visitors for the last 3 months</span>
        </div>
        <div className="sx-chart-totals">
          {(['desktop', 'mobile'] as const).map((chart) => (
            <button
              type="button"
              key={chart}
              data-active={activeChart === chart}
              onClick={() => setActiveChart(chart)}
            >
              <span>{chart === 'desktop' ? 'Desktop' : 'Mobile'}</span>
              <strong>{total[chart].toLocaleString()}</strong>
            </button>
          ))}
        </div>
      </div>
      <div className="sx-chart-content">
        <div className="sx-chart-container">
          <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 620, height: 250 }}>
            <BarChart accessibilityLayer data={chartData} margin={{ left: 12, right: 12 }}>
              <CartesianGrid vertical={false} stroke="#e5e5e5" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tick={{ fill: '#737373', fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              />
              <Tooltip
                content={(props) => <ExactChartTooltip {...props} />}
                cursor={{ fill: '#f5f5f5' }}
              />
              <Bar
                dataKey={activeChart}
                fill={activeChart === 'desktop' ? '#2b7fff' : '#8ec5ff'}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function BreadcrumbDemo({ controls }: { controls?: ShadcnDemoControls }) {
  const [open, setOpen] = useState(false)
  const reset = () => setOpen(false)
  const replay = () => setOpen((value) => !value)
  exposeControls(controls, replay, reset)

  return (
    <nav className="sx-breadcrumb sx-nova" aria-label="breadcrumb">
      <ol>
        <li><a href="#" onClick={(event) => event.preventDefault()}>Home</a></li>
        <li aria-hidden="true"><ChevronRight /></li>
        <li className="sx-breadcrumb-menu">
          <ExactButton variant="ghost" size="icon-sm" aria-expanded={open} onClick={replay}>
            <MoreHorizontal />
            <span className="sr-only">Toggle menu</span>
          </ExactButton>
          <div className="sx-dropdown" data-open={open}>
            <button type="button">Documentation</button>
            <button type="button">Themes</button>
            <button type="button">GitHub</button>
          </div>
        </li>
        <li aria-hidden="true"><ChevronRight /></li>
        <li><a href="#" onClick={(event) => event.preventDefault()}>Components</a></li>
        <li aria-hidden="true"><ChevronRight /></li>
        <li aria-current="page">Breadcrumb</li>
      </ol>
    </nav>
  )
}

function CommandDemo({ controls }: { controls?: ShadcnDemoControls }) {
  const [query, setQuery] = useState('')
  const reset = () => setQuery('')
  exposeControls(controls, reset, reset)

  return (
    <CommandPrimitive className="sx-command sx-nova">
      <div className="sx-command-input-wrapper">
        <Search aria-hidden="true" />
        <CommandPrimitive.Input
          value={query}
          onValueChange={setQuery}
          placeholder="Type a command or search..."
        />
      </div>
      <CommandPrimitive.List className="sx-command-list">
        <CommandPrimitive.Empty className="sx-command-empty">No results found.</CommandPrimitive.Empty>
        <CommandPrimitive.Group className="sx-command-group" heading="Suggestions">
          <CommandPrimitive.Item className="sx-command-item"><Calendar /><span>Calendar</span></CommandPrimitive.Item>
          <CommandPrimitive.Item className="sx-command-item"><Smile /><span>Search Emoji</span></CommandPrimitive.Item>
          <CommandPrimitive.Item className="sx-command-item" disabled><Calculator /><span>Calculator</span></CommandPrimitive.Item>
        </CommandPrimitive.Group>
        <CommandPrimitive.Separator className="sx-command-separator" />
        <CommandPrimitive.Group className="sx-command-group" heading="Settings">
          <CommandPrimitive.Item className="sx-command-item"><User /><span>Profile</span><kbd>⌘P</kbd></CommandPrimitive.Item>
          <CommandPrimitive.Item className="sx-command-item"><CreditCard /><span>Billing</span><kbd>⌘B</kbd></CommandPrimitive.Item>
          <CommandPrimitive.Item className="sx-command-item"><Settings /><span>Settings</span><kbd>⌘S</kbd></CommandPrimitive.Item>
        </CommandPrimitive.Group>
      </CommandPrimitive.List>
    </CommandPrimitive>
  )
}

export function ShadcnDemo({
  id,
  compact = false,
  controls,
}: DemoProps) {
  const demo = {
    attachment: <AttachmentDemo controls={controls} />,
    calendar: <CalendarDemo controls={controls} />,
    card: <CardDemo controls={controls} />,
    carousel: <CarouselDemo controls={controls} />,
    chart: <ChartDemo controls={controls} />,
    breadcrumb: <BreadcrumbDemo controls={controls} />,
    command: <CommandDemo controls={controls} />,
  }[id]

  return (
    <div className="sh-demo" data-compact={compact} data-id={id}>
      <div className="sx-preview" data-id={id}>
        <div className="sx-native">{demo}</div>
      </div>
    </div>
  )
}
