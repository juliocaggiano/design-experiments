import { useEffect, useRef, useState } from 'react'
import { LinkCard, Caption } from '../components/Card'

/* Character-by-character reveal. While typing, a sliding accent window
   highlights the trailing run of revealed chars (reads as one orange bar,
   cream card). Once the phrase completes, the preset flips to green and only
   "by me" keeps an accent pill. Adjacent same-state chars merge into one
   pill by rounding only the run's outer corners. */

const TEXT = 'design engineered by me :)'
const BY_ME: [number, number] = [18, 22] // "by me"

const TYPING_PRESET = { fg: '#3a2415', bg: '#fdf3e3', accent: '#ee7c17', accentInk: '#fdf3e3', card: '#fdf3e3' }
const DONE_PRESET = { fg: '#1b1b1b', bg: '#fcfcfc', accent: '#12a150', accentInk: '#fcfcfc', card: '#f4faf5' }

export function TyperCard() {
  const [shown, setShown] = useState(0)
  const [done, setDone] = useState(false)
  const timer = useRef(0)

  useEffect(() => {
    let i = 0
    const tick = () => {
      i += 1
      setShown(i)
      if (i < TEXT.length) {
        timer.current = window.setTimeout(tick, 55 + Math.random() * 60)
      } else {
        timer.current = window.setTimeout(() => setDone(true), 350)
      }
    }
    timer.current = window.setTimeout(tick, 500)
    return () => window.clearTimeout(timer.current)
  }, [])

  const preset = done ? DONE_PRESET : TYPING_PRESET

  const stateOf = (i: number): 'plain' | 'accent' => {
    if (done) return i >= BY_ME[0] && i <= BY_ME[1] ? 'accent' : 'plain'
    // sliding window over the trailing revealed chars, skipping the first char
    return i >= Math.max(1, shown - 11) && i < shown ? 'accent' : 'plain'
  }

  return (
    <LinkCard href="/vault/typer">
      <div
        aria-label="design engineered by me :), revealed character by character"
        className="relative mx-auto flex aspect-[1344/520] w-full select-none items-center justify-center overflow-hidden rounded-[12px] border border-[var(--border-line)] transition-colors duration-500"
        style={{ background: preset.card }}
      >
        <div className="flex flex-col items-center gap-1 text-center">
          <div
            className="typer"
            style={{
              ['--typer-fg' as string]: preset.fg,
              ['--typer-bg' as string]: preset.bg,
              ['--typer-accent' as string]: preset.accent,
              ['--typer-accent-ink' as string]: preset.accentInk,
            }}
          >
            {TEXT.split('').map((c, i) => {
              const on = i < shown
              const s = stateOf(i)
              const runStart = s === 'accent' && stateOf(i - 1) !== 'accent'
              const runEnd = s === 'accent' && stateOf(i + 1) !== 'accent'
              return (
                <span
                  key={i}
                  className={`ch ${on ? 'on' : ''} ${s === 'accent' ? 'accent' : ''} ${runStart ? 'run-start' : ''} ${runEnd ? 'run-end' : ''}`}
                >
                  {c === ' ' ? ' ' : c}
                </span>
              )
            })}
            {!done && shown < TEXT.length && <span className="caret" />}
          </div>
        </div>
      </div>
      <Caption title="The typer" category="Motion" />
    </LinkCard>
  )
}
