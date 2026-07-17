import { useState } from 'react'
import { OverlayDemo } from '../demos/OverlayDemo'
import { ChipButton, CopyPromptChip, SliderChip, CodeTabs, CreditRows, DetailShell, assembleCopy } from './detail-kit'
import webDemoSrc from '../demos/OverlayDemo.tsx?raw'
import runPy from '../content/overlay/run.py?raw'
import configPy from '../content/overlay/config.py?raw'
import appPy from '../content/overlay/app.py?raw'
import overlayWindowPy from '../content/overlay/overlay_window.py?raw'
import spritesPy from '../content/overlay/sprites.py?raw'
import animationPy from '../content/overlay/animation_controller.py?raw'
import panelPy from '../content/overlay/notification_panel.py?raw'
import calendarPy from '../content/overlay/calendar_source.py?raw'
import schedulerPy from '../content/overlay/scheduler.py?raw'

/* The copy button ships the complete desktop app plus the web replay. */
const FULL_CODE = [
  { name: 'run.py', code: runPy },
  { name: 'config.py', code: configPy },
  { name: 'src/app.py', code: appPy },
  { name: 'src/overlay_window.py', code: overlayWindowPy },
  { name: 'src/sprites.py', code: spritesPy },
  { name: 'src/animation_controller.py', code: animationPy },
  { name: 'src/notification_panel.py', code: panelPy },
  { name: 'src/calendar_source.py', code: calendarPy },
  { name: 'src/scheduler.py', code: schedulerPy },
  { name: 'web/OverlayDemo.tsx (browser replay)', code: webDemoSrc },
]

/* Detail page in the vault house style: hero demo, prose, implementation
   playground, code with file tabs + copy prompt, credits, MIT footer. */

const BUILD_PROMPT = `Build this: a desktop "meeting detective" overlay. Five minutes before each calendar event, a small pixel-art character walks in along the bottom of the screen, stops at one-tenth of the screen width, and a speech bubble snaps open above him with the meeting name and start time. After ~10 seconds the bubble snaps away and he walks back out.

Core requirements:
- A transparent, always-on-top, click-through window spanning the screen bottom (on macOS: PySide6/Qt with WA_TranslucentBackground, WindowStaysOnTopHint, WindowTransparentForInput). It must never steal focus or block the mouse.
- Sprite animation from horizontal strip PNGs, scaled with nearest-neighbor so pixels stay crisp: a 4-frame walk cycle at 160ms per step with an occasional eyes-closed blink frame, and an idle set where he periodically raises a magnifying glass toward the bubble. Walking left is the same strip mirrored.
- A state machine: IDLE → WALK_IN → BUBBLE_POP → HOLD → BUBBLE_DISMISS → WALK_OUT → IDLE. Move at constant speed (~150 px/s) with x snapped to a 3px grid so the gait steps like 8-bit hardware instead of gliding. Add a subtle step-bob.
- The speech bubble is drawn in code, not a PNG: white body, thick black border with stepped pixel corners, gray drop shadow offset down-right, stepped tail pointing at the character's head. Pop-in is 3 discrete scale snaps (0.45 → 0.75 → 1.0), not a smooth tween. Text in "Press Start 2P" (SIL OFL): meeting name up to two lines plus a smaller time line.
- Calendar source: poll an iCal secret URL every few minutes (recurrence-aware), fire once per event N minutes before start. Include mock events so it demos without any setup, plus a menu-bar icon with "Test animation now" and "Quit".
- Autostart: register a launcher script as a login item; guard against double-launch.

For a personal website instead: same state machine and code-drawn bubble on a position:fixed, pointer-events:none canvas along the viewport bottom, driven by requestAnimationFrame, with events from any JSON feed.`

const CODE_TABS = [
  {
    file: 'src/animation_controller.py',
    code: `"""
animation_controller.py — THE STATE MACHINE.

The sequence:
    IDLE
     -> WALK_IN         the detective walks in along the bottom, from off the
                        left edge to one-tenth of the screen width
     -> BUBBLE_POP      he stops; the speech bubble pops up over him
                        (3 discrete retro steps) with meeting name + time
     -> HOLD            he stands there for NOTIFICATION_HOLD_MS
     -> BUBBLE_DISMISS  bubble pops back out
     -> WALK_OUT        he turns around (mirrored sprite) and walks back out
                        to the left
     -> IDLE

How motion works: each walk leg is ONE linear QVariantAnimation driving
progress 0->1; the tick computes x at constant WALK_SPEED (duration is derived
from the real distance, so the pace is the same on any screen) plus a small
step-bob on y. X snaps to MOTION_GRID so the gait steps like real 8-bit
hardware instead of gliding.
"""

class State(Enum):
    IDLE = auto()
    WALK_IN = auto()
    BUBBLE_POP = auto()
    HOLD = auto()
    BUBBLE_DISMISS = auto()
    WALK_OUT = auto()


def _grid(v: float) -> int:
    """Snap to the motion grid — the stepped 8-bit gait."""
    g = config.MOTION_GRID
    return int(round(v / g) * g)`,
  },
  {
    file: 'src/notification_panel.py',
    code: `"""
notification_panel.py — the pixel speech bubble (SpeechBubble).

White body, thick black outline with stepped (pixel-rounded) corners, a small
stepped tail pointing at the sprite, and a gray drop shadow offset down-right.
Drawn entirely in code so the bubble stretches to fit any meeting name — a PNG
couldn't do that crisply.

Everything is built from BUBBLE_UNIT-sized "fat pixels" (rect fills only, no
curves, no anti-aliasing), so it stays authentically 8-bit at any size.

Pop-in is 3 DISCRETE scale steps (small -> mid -> full) instead of a smooth
tween — that stepped snap is what makes it read retro.
"""

INK = "#111111"
WHITE = "#FFFFFF"
SHADOW = "#C9C9C9"
TIME_INK = "#555555"

# Discrete pop steps: (progress threshold, scale). Crossing a threshold snaps
# the bubble to the next size — no smooth in-between.
_POP_STEPS = [(0.0, 0.45), (0.45, 0.75), (0.85, 1.0)]


class SpeechBubble(QWidget):
    def __init__(self, font_family: str, parent=None):
        super().__init__(parent)
        # Click-through like everything else; the bubble is purely visual.
        self.setAttribute(Qt.WidgetAttribute.WA_TransparentForMouseEvents, True)`,
  },
  {
    file: 'config.py',
    code: `SPRITE_TARGET_H = 50         # on-screen height (px)
IDLE_FRAME_COUNT = 3
BLINK_EVERY_MS = 3000        # blink roughly every 3 seconds while walking

WALK_STOP_FRAC = 0.10        # he stops at this fraction of the screen width
WALK_SPEED = 150             # walking speed (px/s) — ~24px stride per 160ms

BUBBLE_UNIT = 3              # the bubble's "fat pixel" size
BUBBLE_MIN_W = 90            # bubble body width bounds (px)
BUBBLE_MAX_W = 210
BUBBLE_GAP = 6               # gap between the tail tip and the sprite's head
BUBBLE_TITLE_PX = 10         # meeting-name font size
BUBBLE_TIME_PX = 8           # meeting-time font size

DUR_BUBBLE_POP = 220         # bubble pops in (3 discrete retro steps)
DUR_BUBBLE_DISMISS = 160     # bubble pops back out
NOTIFICATION_HOLD_MS = 10000 # how long he stands with the bubble up

MINUTES_BEFORE = 5           # fire this many minutes before each event
CALENDAR_SOURCE = "ical"     # "ical" | "google" | "mock"`,
  },
]

const SAMPLE_MEETINGS: [string, string][] = [
  ['Work Session: New Portfolio', 'Tomorrow 06:00'],
  ['Design Crit — Tokyo Studio', 'Today 14:30'],
  ['CP192 Mini-Capstone Check-in', 'Today 09:00'],
  ['SP Invisível — Content Review', 'Fri 11:00'],
]

export function MeetingOverlayDetail() {
  const [title, setTitle] = useState(SAMPLE_MEETINGS[0][0])
  const [time, setTime] = useState(SAMPLE_MEETINGS[0][1])
  const [holdMs, setHoldMs] = useState(4000)
  const [speed, setSpeed] = useState(150)
  const [spriteH, setSpriteH] = useState(50)
  const [replayKey, setReplayKey] = useState(0)

  const remix = () => {
    const [t, tm] = SAMPLE_MEETINGS[(Math.random() * SAMPLE_MEETINGS.length) | 0]
    setTitle(t)
    setTime(tm)
    setReplayKey((k) => k + 1)
  }

  return (
    <DetailShell title="Meeting overlay">
      {/* hero: the overlay running on a clean strip of "screen" */}
      <div
        aria-label="Pixel detective announcing a meeting"
        className="relative mx-auto flex aspect-[1344/520] w-full select-none items-center justify-center overflow-hidden rounded-[12px] border border-[var(--border-line)] bg-[var(--bg-page)]"
      >
        <OverlayDemo title="Work Session: New Portfolio" time="Tomorrow 06:00" holdMs={3800} />
      </div>

      <div className="flex min-w-0 flex-col gap-14">
        <div className="flex flex-col gap-3">
          <p className="text-pretty text-[var(--text-primary)]">
            Five minutes before a meeting, a pixel detective walks in along the bottom of the screen. He stops, a speech
            bubble snaps open with the meeting name and time, he raises his magnifying glass at it, and after ten seconds
            he walks back out. The window is transparent, always on top, and click-through — it floats over whatever
            you're doing and never blocks the mouse.
          </p>
          <p className="text-pretty text-[var(--text-primary)]">
            Below you can change the meeting, how long he holds, how fast he walks, and his size. The desktop app reads
            your real calendar from one iCal URL; the copy button gives you the full build prompt for your own setup.
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <header className="flex items-center justify-between gap-3 pb-2 border-b border-[var(--border-line)]">
            <h2 className="font-semibold text-[var(--text-primary)]">Implementation</h2>
            <div className="flex items-center gap-2">
              <ChipButton onClick={remix}>Remix</ChipButton>
              <ChipButton onClick={() => setReplayKey((k) => k + 1)}>Replay</ChipButton>
            </div>
          </header>
          <div className="relative z-10 overflow-hidden rounded-xl border border-[var(--border-line)] flex min-h-[160px] items-center justify-center px-6 py-8 transition-colors duration-500 ease-[var(--ease-out)] sm:min-h-[190px] bg-[var(--bg-page)]">
            <div className="absolute inset-0">
              <OverlayDemo title={title} time={time} holdMs={holdMs} speed={speed} spriteH={spriteH} replayKey={replayKey} />
            </div>
          </div>
          <div className="-mt-5 flex min-w-0 flex-col rounded-b-xl border border-t-0 border-[var(--border-line)] bg-[var(--bg-surface)] p-4 pt-8 gap-3.5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="text"
                spellCheck={false}
                placeholder="Meeting name…"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-8 w-full min-w-0 flex-1 rounded-lg border border-[var(--border-line)] bg-[var(--bg-page)] px-3 text-[13px] text-[var(--text-body)] outline-none transition-colors duration-150 placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-ring)]"
              />
              <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
                <div className="min-w-0 sm:w-[124px]">
                  <input
                    type="text"
                    spellCheck={false}
                    placeholder="Time…"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="h-8 w-full min-w-0 rounded-lg border border-[var(--border-line)] bg-[var(--bg-page)] px-2.5 text-[12px] text-[var(--text-body)] outline-none transition-colors duration-150 placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-ring)]"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <SliderChip label="Hold" min={1500} max={10000} value={holdMs} format={(v) => `${(v / 1000).toFixed(1)}s`} onChange={(v) => setHoldMs(Math.round(v / 100) * 100)} />
              <SliderChip label="Speed" min={60} max={320} value={speed} format={(v) => `${Math.round(v)} px/s`} onChange={(v) => setSpeed(Math.round(v))} />
              <SliderChip label="Sprite" min={34} max={90} value={spriteH} format={(v) => `${Math.round(v)} px`} onChange={(v) => setSpriteH(Math.round(v))} />
            </div>
          </div>
        </div>

        <section className="flex min-w-0 flex-col gap-3">
          <header className="flex items-center justify-between gap-3 pb-2 border-b border-[var(--border-line)]">
            <h2 className="font-semibold text-[var(--text-primary)]">Code</h2>
            <CopyPromptChip text={assembleCopy(BUILD_PROMPT, FULL_CODE)} />
          </header>
          <CodeTabs tabs={CODE_TABS} />
        </section>

        <CreditRows
          rows={[
            ['Company', 'CAGGIANO'],
            ['Date', 'Jul 8, 2026'],
            ['Tags', 'Python, PySide6, macOS'],
          ]}
        />

        <p className="mt-2 text-center text-[12px] text-[var(--text-tertiary)]">
          <a
            href="https://opensource.org/licenses/MIT"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-[var(--border-line)] underline-offset-2 transition-colors duration-150 hover:text-[var(--text-secondary)]"
          >
            MIT
          </a>{' '}
          → free to copy
        </p>
      </div>
      <div aria-hidden="true" className="h-16" />
    </DetailShell>
  )
}
