import { useRef, useState } from 'react'
import {
  SonnerDemo,
  type SonnerControls,
  type SonnerPosition,
  type SonnerStackMode,
  type SonnerToastType,
} from '../demos/SonnerDemo'
import { ChipButton, CodeTabs, CopyPromptChip, CreditRows, DetailShell, assembleCopy } from './detail-kit'
import demoSrc from '../demos/SonnerDemo.tsx?raw'
import demoCss from '../demos/SonnerDemo.css?raw'

const SOURCE_COMMIT = '45d894085af8ca8421912789a8f5a4ac4ac3d0ea'

const TOAST_TYPES: readonly { value: SonnerToastType; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'description', label: 'Description' },
  { value: 'success', label: 'Success' },
  { value: 'info', label: 'Info' },
  { value: 'warning', label: 'Warning' },
  { value: 'error', label: 'Error' },
  { value: 'action', label: 'Action' },
  { value: 'promise', label: 'Promise' },
]

const POSITIONS: readonly { value: SonnerPosition; label: string }[] = [
  { value: 'top-left', label: 'Top left' },
  { value: 'top-center', label: 'Top center' },
  { value: 'top-right', label: 'Top right' },
  { value: 'bottom-left', label: 'Bottom left' },
  { value: 'bottom-center', label: 'Bottom center' },
  { value: 'bottom-right', label: 'Bottom right' },
]

const SELECT_CLASS = 'h-9 w-full rounded-[10px] border border-[var(--border-line)] bg-[var(--bg-surface)] px-3 text-[12px] text-[var(--text-primary)] outline-none transition-colors duration-150 hover:border-[var(--border-ring)] focus:border-[var(--border-ring)]'

const BUILD_PROMPT = `Build a self-contained Sonner-inspired toast playground in React and CSS.

Visual system:
- Keep the host product's restrained light design system, inherited typography, white surfaces, gray hairlines, compact radii, and one dark primary trigger.
- Use one 306px toast surface with a subtle border, 10px radius, 12px padding, and a soft 0 4px 12px shadow.
- The feed thumbnail should show one default toast only. Put type, position, stack behavior, and close-button options in the expanded implementation.

Behavior:
- Support Default, Description, Success, Info, Warning, Error, Action, and Promise states.
- Support all six top/bottom and left/center/right positions.
- Stack up to three toasts with 8px depth steps and 5% scale steps. Expand the stack on hover or focus, or keep it expanded through a control.
- Use interruptible CSS transitions for enter, stack movement, and removal instead of restarting keyframes.
- Allow pointer or touch swipe dismissal after a 45px threshold.
- Promise toasts update in place from loading to success. Action toasts expose an Undo control.
- Start compact autoplay only when 35% of the thumbnail is visible, reset it offscreen, and keep reduced-motion states meaningful.
- Keep all classes namespaced so the component can live inside an existing design system.

Credit the Sonner website and emilkowalski/sonner repository as behavior references.`

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: readonly { value: string; label: string }[]
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-[11px] text-[var(--text-tertiary)]">{label}</span>
      <select className={SELECT_CLASS} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  )
}

export function SonnerDetail() {
  const controls = useRef<SonnerControls>({}).current
  const [toastType, setToastType] = useState<SonnerToastType>('default')
  const [position, setPosition] = useState<SonnerPosition>('bottom-center')
  const [stackMode, setStackMode] = useState<SonnerStackMode>('stacked')
  const [closeButton, setCloseButton] = useState(false)

  return (
    <DetailShell title="Toast Notifications">
      <div
        aria-label="Sonner toast notification preview"
        className="relative mx-auto aspect-[1344/520] w-full overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)]"
      >
        <SonnerDemo />
      </div>

      <div className="flex min-w-0 flex-col gap-14">
        <div className="flex flex-col gap-3">
          <p className="text-pretty text-[var(--text-primary)]">
            Sonner makes transient feedback feel calm instead of disposable. A toast enters from its eventual dismissal
            edge, keeps a consistent width so stacks remain coherent, and retargets smoothly when new notifications
            arrive instead of restarting its motion.
          </p>
          <p className="text-pretty text-[var(--text-primary)]">
            The thumbnail stays focused on one default notification. The implementation below exposes the reference’s
            useful dimensions—toast type, all six positions, compact or expanded stacks, actions, promise updates, a
            close control, and swipe dismissal—inside the vault’s light visual system.
          </p>
        </div>

        <section className="flex min-w-0 flex-col gap-4">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-line)] pb-2">
            <h2 className="font-semibold text-[var(--text-primary)]">Implementation</h2>
            <div className="flex items-center gap-2">
              <ChipButton onClick={() => controls.reset?.()}>Reset</ChipButton>
              <ChipButton onClick={() => controls.replay?.()}>Replay</ChipButton>
            </div>
          </header>

          <div className="grid min-w-0 grid-cols-2 gap-3 max-sm:grid-cols-1">
            <SelectField
              label="Toast type"
              value={toastType}
              onChange={(value) => setToastType(value as SonnerToastType)}
              options={TOAST_TYPES}
            />
            <SelectField
              label="Position"
              value={position}
              onChange={(value) => setPosition(value as SonnerPosition)}
              options={POSITIONS}
            />
            <SelectField
              label="Stack"
              value={stackMode}
              onChange={(value) => setStackMode(value as SonnerStackMode)}
              options={[
                { value: 'stacked', label: 'Stacked · expand on hover' },
                { value: 'expanded', label: 'Always expanded' },
              ]}
            />
            <SelectField
              label="Dismiss control"
              value={closeButton ? 'visible' : 'swipe'}
              onChange={(value) => setCloseButton(value === 'visible')}
              options={[
                { value: 'swipe', label: 'Swipe only' },
                { value: 'visible', label: 'Close button' },
              ]}
            />
          </div>

          <div className="relative z-10 min-h-[380px] overflow-hidden rounded-xl border border-[var(--border-line)] bg-[var(--bg-page)] max-sm:min-h-[330px]">
            <SonnerDemo
              controls={controls}
              toastType={toastType}
              position={position}
              stackMode={stackMode}
              closeButton={closeButton}
            />
          </div>
          <p className="text-[12px] text-[var(--text-tertiary)]">
            Trigger several notifications to build a stack. Hover or focus a compact stack to expand it, or drag a toast
            at least 45px to dismiss it.
          </p>
        </section>

        <section className="flex min-w-0 flex-col gap-3">
          <header className="flex items-center justify-between gap-3 border-b border-[var(--border-line)] pb-2">
            <h2 className="font-semibold text-[var(--text-primary)]">Code</h2>
            <CopyPromptChip text={assembleCopy(BUILD_PROMPT, [
              { name: 'SonnerDemo.tsx', code: demoSrc },
              { name: 'SonnerDemo.css', code: demoCss },
            ])} />
          </header>
          <CodeTabs tabs={[
            { file: 'SonnerDemo.tsx', code: demoSrc },
            { file: 'SonnerDemo.css', code: demoCss },
          ]} />
        </section>

        <CreditRows
          rows={[
            ['Company', 'CAGGIANO'],
            ['Date', 'Jul 16, 2026'],
            ['Tags', 'Toasts, Feedback, Motion'],
            ['Reference', 'Sonner — Emil Kowalski'],
          ]}
        />

        <p className="mt-2 text-center text-[12px] text-[var(--text-tertiary)]">
          Behavior reference:{' '}
          <a
            href="https://sonner.emilkowal.ski/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-[var(--border-line)] underline-offset-2 transition-colors duration-150 hover:text-[var(--text-secondary)]"
          >
            Sonner
          </a>
          {' · '}
          <a
            href={`https://github.com/emilkowalski/sonner/tree/${SOURCE_COMMIT}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-[var(--border-line)] underline-offset-2 transition-colors duration-150 hover:text-[var(--text-secondary)]"
          >
            GitHub source
          </a>
          {' · MIT'}
        </p>
      </div>
      <div aria-hidden="true" className="h-16" />
    </DetailShell>
  )
}
