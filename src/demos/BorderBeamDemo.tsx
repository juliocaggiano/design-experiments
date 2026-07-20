import { useEffect, useState, type CSSProperties, type FormEvent } from 'react'
import { PaperPlaneTilt } from '@phosphor-icons/react'
import { SliderChip } from '../pages/detail-kit'
import './BorderBeamDemo.css'

export type BeamType = 'large' | 'small' | 'line'
export type BeamColor = 'ink' | 'graphite' | 'stone' | 'mist'

export type BorderBeamSettings = {
  beamType: BeamType
  color: BeamColor
  strength: number
}

export const BORDER_BEAM_DEFAULTS: BorderBeamSettings = {
  beamType: 'line',
  color: 'graphite',
  strength: 60,
}

const TYPE_OPTIONS: Array<{ label: string; value: BeamType }> = [
  { label: 'Large', value: 'large' },
  { label: 'Small', value: 'small' },
  { label: 'Line', value: 'line' },
]

const COLOR_OPTIONS: Array<{ label: string; value: BeamColor }> = [
  { label: 'Ink', value: 'ink' },
  { label: 'Graphite', value: 'graphite' },
  { label: 'Stone', value: 'stone' },
  { label: 'Mist', value: 'mist' },
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
  settings: settingsProp,
  onSettingsChange,
  chrome = 'full',
}: {
  compact?: boolean
  controls?: BorderBeamControls
  settings?: BorderBeamSettings
  onSettingsChange?: (next: BorderBeamSettings) => void
  chrome?: 'full' | 'stage'
}) {
  const [internalSettings, setInternalSettings] = useState<BorderBeamSettings>(BORDER_BEAM_DEFAULTS)
  const settings = settingsProp ?? internalSettings
  const { beamType, color, strength } = settings
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  const updateSettings = (next: BorderBeamSettings) => {
    if (onSettingsChange) onSettingsChange(next)
    else setInternalSettings(next)
  }

  useEffect(() => {
    if (!sent) return

    const timer = window.setTimeout(() => setSent(false), 560)
    return () => window.clearTimeout(timer)
  }, [sent])

  const reset = () => {
    updateSettings(BORDER_BEAM_DEFAULTS)
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
    <div className={`bb-shell ${compact ? 'bb-compact' : ''} ${!compact && chrome === 'stage' ? 'bb-stage-only' : ''}`}>
      {!compact && chrome === 'full' ? (
        <BorderBeamControlPanel settings={settings} onChange={updateSettings} embedded />
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

      {!compact && chrome === 'full' ? (
        <div className="bb-live-code" aria-live="polite">
          <code>{`<BorderBeam size="${TYPE_CODE[beamType]}" colorVariant="${color}" strength={${Number((strength / 100).toFixed(2))}}>
  <Input placeholder="Ask anything..." />
</BorderBeam>`}</code>
        </div>
      ) : null}
    </div>
  )
}

/* Reference-style control panel: chip rows and the strength slider share one
   rounded 44px row shape — label on the left, control on the right. The
   slider row paints a solid light-gray fill block anchored to the left edge,
   a thin vertical handle at the fill's right edge, and the value right-aligned
   in the unfilled area; a real range input overlays the row as the
   interaction, keyboard, and accessibility layer. */
export function BorderBeamControlPanel({
  settings,
  onChange,
  embedded = false,
}: {
  settings: BorderBeamSettings
  onChange: (next: BorderBeamSettings) => void
  embedded?: boolean
}) {
  return (
    <div className={`bb-panel${embedded ? ' bb-panel--embedded' : ''}`} aria-label="Border beam settings">
      <div className="bb-row" role="radiogroup" aria-label="Effect type">
        <span className="bb-row-label">Type</span>
        <div className="bb-row-options">
          {TYPE_OPTIONS.map((option) => (
            <button
              type="button"
              className="bb-choice"
              role="radio"
              aria-checked={settings.beamType === option.value}
              key={option.value}
              onClick={() => onChange({ ...settings, beamType: option.value })}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <SliderChip
        label="Strength"
        min={0}
        max={100}
        value={settings.strength}
        format={(v) => `${Math.round(v)}%`}
        onChange={(v) => onChange({ ...settings, strength: Math.round(v) })}
      />

      <div className="bb-row" role="radiogroup" aria-label="Color variant">
        <span className="bb-row-label">Color</span>
        <div className="bb-row-options">
          {COLOR_OPTIONS.map((option) => (
            <button
              type="button"
              className="bb-choice"
              role="radio"
              aria-checked={settings.color === option.value}
              key={option.value}
              onClick={() => onChange({ ...settings, color: option.value })}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
