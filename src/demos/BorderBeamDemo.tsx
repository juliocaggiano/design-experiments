import { useEffect, useState, type CSSProperties, type FormEvent } from 'react'
import { PaperPlaneTilt } from '@phosphor-icons/react'
import './BorderBeamDemo.css'

type BeamType = 'large' | 'small' | 'line'
type BeamColor = 'colorful' | 'mono' | 'ocean' | 'sunset'

const TYPE_OPTIONS: Array<{ label: string; value: BeamType }> = [
  { label: 'Large', value: 'large' },
  { label: 'Small', value: 'small' },
  { label: 'Line', value: 'line' },
]

const COLOR_OPTIONS: Array<{ label: string; value: BeamColor }> = [
  { label: 'Colorful', value: 'colorful' },
  { label: 'Mono', value: 'mono' },
  { label: 'Ocean', value: 'ocean' },
  { label: 'Sunset', value: 'sunset' },
]

const TYPE_CODE: Record<BeamType, string> = {
  large: 'md',
  small: 'sm',
  line: 'line',
}

export type BorderBeamControls = {
  reset?: () => void
}

export function BorderBeamDemo({
  compact = false,
  controls,
}: {
  compact?: boolean
  controls?: BorderBeamControls
}) {
  const [beamType, setBeamType] = useState<BeamType>('line')
  const [color, setColor] = useState<BeamColor>('ocean')
  const [strength, setStrength] = useState(60)
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (!sent) return

    const timer = window.setTimeout(() => setSent(false), 560)
    return () => window.clearTimeout(timer)
  }, [sent])

  const reset = () => {
    setBeamType('line')
    setColor('ocean')
    setStrength(60)
    setMessage('')
    setSent(false)
  }

  const submitMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!message.trim()) return
    setSent(true)
  }

  if (controls) {
    controls.reset = reset
  }

  const beamStyle = { '--bb-strength': strength / 100 } as CSSProperties

  return (
    <div className={`bb-shell ${compact ? 'bb-compact' : ''}`}>
      {!compact ? (
        <div className="bb-controls" aria-label="Border beam settings">
          <div className="bb-control-group" role="radiogroup" aria-label="Effect type">
            <span className="bb-control-label">Type</span>
            <div className="bb-control-options">
              {TYPE_OPTIONS.map((option) => (
                <button
                  type="button"
                  className="bb-choice"
                  role="radio"
                  aria-checked={beamType === option.value}
                  key={option.value}
                  onClick={() => setBeamType(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="bb-control-group" role="radiogroup" aria-label="Color variant">
            <span className="bb-control-label">Color</span>
            <div className="bb-control-options">
              {COLOR_OPTIONS.map((option) => (
                <button
                  type="button"
                  className="bb-choice"
                  role="radio"
                  aria-checked={color === option.value}
                  key={option.value}
                  onClick={() => setColor(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <label className="bb-control-group bb-strength-control">
            <span className="bb-control-label">Strength</span>
            <span className="bb-strength-track" style={{ '--bb-fill': `${strength}%` } as CSSProperties}>
              <span>{strength}%</span>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={strength}
                aria-label="Effect strength"
                onChange={(event) => setStrength(Number(event.target.value))}
                onPointerDown={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect()
                  const nextStrength = Math.round(((event.clientX - rect.left) / rect.width) * 100)
                  setStrength(Math.max(0, Math.min(100, nextStrength)))
                }}
                onKeyDown={(event) => {
                  const direction = event.key === 'ArrowRight' || event.key === 'ArrowUp'
                    ? 1
                    : event.key === 'ArrowLeft' || event.key === 'ArrowDown'
                      ? -1
                      : 0

                  if (direction !== 0) {
                    event.preventDefault()
                    setStrength((value) => Math.max(0, Math.min(100, value + direction)))
                  } else if (event.key === 'Home' || event.key === 'End') {
                    event.preventDefault()
                    setStrength(event.key === 'Home' ? 0 : 100)
                  }
                }}
              />
            </span>
          </label>
        </div>
      ) : null}

      <div className="bb-stage">
        <div
          className="bb-beam"
          data-beam={`${color}-${beamType}`}
          data-type={beamType}
          data-color={color}
          style={beamStyle}
        >
          {beamType === 'small' ? null : (
            <form className="bb-field-content" onSubmit={submitMessage}>
              <input
                className="bb-field-input"
                type="text"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ask anything..."
                aria-label="Ask anything"
                autoComplete="off"
              />
              <button
                type="submit"
                className={`bb-send-button ${sent ? 'is-sent' : ''}`}
                aria-label={sent ? 'Message sent' : 'Send message'}
              >
                <PaperPlaneTilt size={14} weight="fill" />
              </button>
            </form>
          )}
          <span className="bb-bloom" aria-hidden="true" />
        </div>
      </div>

      {!compact ? (
        <div className="bb-live-code" aria-live="polite">
          <code>{`<BorderBeam size="${TYPE_CODE[beamType]}" colorVariant="${color}" strength={${Number((strength / 100).toFixed(2))}}>
  <Input placeholder="Ask anything..." />
</BorderBeam>`}</code>
        </div>
      ) : null}
    </div>
  )
}
