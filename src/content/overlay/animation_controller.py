"""
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
progress 0→1; the tick computes x at constant WALK_SPEED (duration is derived
from the real distance, so the pace is the same on any screen) plus a small
step-bob on y. X snaps to MOTION_GRID so the gait steps like real 8-bit
hardware instead of gliding.

Important Qt detail: an animation that goes out of scope gets garbage collected
and silently stops. Every animation is kept alive in self._live until the run
finishes.
"""

from __future__ import annotations

from enum import Enum, auto

from PySide6.QtCore import QObject, QTimer, QVariantAnimation

import config


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
    return int(round(v / g) * g)


class AnimationController(QObject):
    def __init__(self, window, hold_ms: int = config.NOTIFICATION_HOLD_MS,
                 on_state=None, parent=None):
        super().__init__(parent)
        self.win = window
        self.hold_ms = hold_ms
        self._on_state = on_state          # optional callback(State) for logging/tests
        self.state = State.IDLE
        self._playing = False
        self._live: list = []              # keeps animations from being GC'd

    # -------------------------------------------------------- small builders
    def _keep(self, anim):
        self._live.append(anim)
        return anim

    def _progress_anim(self, dur: int, on_tick, on_done=None) -> QVariantAnimation:
        """A linear 0→1 float animation; on_tick(t) computes the actual motion."""
        a = QVariantAnimation(self)
        a.setStartValue(0.0)
        a.setEndValue(1.0)
        a.setDuration(max(1, dur))
        a.valueChanged.connect(on_tick)
        if on_done:
            a.finished.connect(on_done)
        return self._keep(a)

    def _set_state(self, state: State) -> None:
        self.state = state
        if self._on_state:
            self._on_state(state)

    def _walk_dur(self) -> int:
        """Constant pace: duration derived from the real walk distance."""
        dist = self.win.stop_x - self.win.actor_hidden_x
        return int(dist / config.WALK_SPEED * 1000)

    def _bob(self, elapsed_ms: float) -> int:
        """Step bob: up on every other step beat."""
        return config.WALK_BOB_PX if int(elapsed_ms // config.WALK_BOB_MS) % 2 else 0

    # ------------------------------------------------------------- public API
    def play(self, meeting_name: str, meeting_time: str) -> None:
        """Trigger the full sequence. Ignored if one is already running."""
        if self._playing:
            return
        self._playing = True
        self._live = []
        self.win.refresh_placement()       # displays may have changed since launch
        self.win.reset_sprites()
        self.win.bubble.set_text(meeting_name, meeting_time)

        self._set_state(State.WALK_IN)
        self.win.actor.show()
        self._start_walk_frames()
        self._dur_in = self._walk_dur()
        self._progress_anim(self._dur_in, self._walk_in_tick, self._arrived).start()

    def _start_walk_frames(self) -> None:
        """Cycle walk frames with the periodic blink (ms → frame ticks)."""
        every = max(2, round(config.BLINK_EVERY_MS / config.SPRITE_FRAME_MS))
        length = max(1, round(config.BLINK_MS / config.SPRITE_FRAME_MS))
        self.win.actor.start_animation(config.SPRITE_FRAME_MS, every, length)

    # ------------------------------------------------------------- 1. walk in
    def _walk_in_tick(self, t: float) -> None:
        x = self.win.actor_hidden_x + (self.win.stop_x - self.win.actor_hidden_x) * t
        y = self.win.actor_y - self._bob(t * self._dur_in)
        self.win.actor.move(_grid(x), y)

    def _arrived(self) -> None:
        # Switch to the standing pose; gestures fire as one-shots during HOLD.
        self.win.actor.stop_animation()
        self.win.set_idle()
        self.win.actor.move(self.win.stop_x, self.win.actor_y)   # land exact
        self._set_state(State.BUBBLE_POP)
        self.win.position_bubble()
        self.win.bubble.show()
        self._progress_anim(config.DUR_BUBBLE_POP, self.win.bubble.set_pop,
                            self._after_pop).start()

    # ---------------------------------------------------------------- 2. hold
    def _after_pop(self) -> None:
        self._set_state(State.HOLD)
        QTimer.singleShot(self.hold_ms, self._dismiss_bubble)
        # One-shot gestures: glass raise once, hat tip once. Each shows its
        # pose briefly, then returns to standing. Guarded so a timer landing
        # after the hold ended (or in a later run) does nothing.
        self._gesture_at(config.GESTURE_GLASS_AT_MS, 1)
        self._gesture_at(config.GESTURE_TIP_AT_MS, 2)

    def _gesture_at(self, at_ms: int, frame: int) -> None:
        QTimer.singleShot(at_ms, lambda: self._gesture(frame))
        QTimer.singleShot(at_ms + config.GESTURE_LEN_MS, lambda: self._gesture(0))

    def _gesture(self, frame: int) -> None:
        if self._playing and self.state is State.HOLD:
            self.win.actor.show_frame(frame)

    # ------------------------------------------------------------- 3. dismiss
    def _dismiss_bubble(self) -> None:
        self._set_state(State.BUBBLE_DISMISS)
        self._progress_anim(config.DUR_BUBBLE_DISMISS,
                            lambda t: self.win.bubble.set_pop(1.0 - t),
                            self._walk_out).start()

    # ------------------------------------------------------------ 4. walk out
    def _walk_out(self) -> None:
        self.win.bubble.hide()
        self.win.actor.stop_animation()
        self.win.set_walking("left")       # turn around
        self._start_walk_frames()          # legs (and blinks) go again
        self._set_state(State.WALK_OUT)
        self._dur_out = self._walk_dur()
        self._progress_anim(self._dur_out, self._walk_out_tick, self._finalize).start()

    def _walk_out_tick(self, t: float) -> None:
        x = self.win.stop_x + (self.win.actor_hidden_x - self.win.stop_x) * t
        y = self.win.actor_y - self._bob(t * self._dur_out)
        self.win.actor.move(_grid(x), y)

    def _finalize(self) -> None:
        self.win.reset_sprites()
        self._live = []
        self._playing = False
        self._set_state(State.IDLE)
