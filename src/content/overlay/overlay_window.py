"""
overlay_window.py — the transparent, always-on-top, click-through window.

This is the stage. It:
  * is a short strip pinned to the BOTTOM-LEFT of the active screen (above the
    Dock), wide enough for the walk-in + the speech bubble,
  * stays visible even when another app (Chrome) is focused (macOS gotcha),
  * holds the walker + the speech bubble and computes their key positions so
    the controller can just animate between them.

It is ALWAYS click-through: WA_TransparentForMouseEvents (in-app) plus
WindowTransparentForInput (OS-level), so your mouse always reaches whatever is
underneath — even on drawn pixels.
"""

from __future__ import annotations

from PySide6.QtCore import Qt
from PySide6.QtGui import QCursor, QGuiApplication
from PySide6.QtWidgets import QWidget

import config
from . import sprites
from .notification_panel import SpeechBubble


class OverlayWindow(QWidget):
    def __init__(self):
        super().__init__()

        # --- Window behavior flags ------------------------------------------
        self.setWindowFlags(
            Qt.WindowType.FramelessWindowHint        # no title bar / chrome
            | Qt.WindowType.WindowStaysOnTopHint     # always-on-top
            | Qt.WindowType.Tool                     # keep out of Dock / app switcher
            | Qt.WindowType.WindowDoesNotAcceptFocus  # never steal keyboard focus
            # OS-level input transparency: WA_TransparentForMouseEvents below
            # only reroutes events INSIDE this app; this flag tells the window
            # system itself to pass clicks through — even on drawn pixels.
            | Qt.WindowType.WindowTransparentForInput
        )
        # Translucent canvas: empty areas are fully transparent.
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground, True)
        # Click-through: clicks fall to the app beneath the overlay.
        self.setAttribute(Qt.WidgetAttribute.WA_TransparentForMouseEvents, True)
        # macOS: a Qt.Tool window hides itself when our app is inactive by
        # default. This attribute keeps it visible while you work elsewhere.
        self.setAttribute(Qt.WidgetAttribute.WA_MacAlwaysShowToolWindow, True)

        # --- Font + widgets ---------------------------------------------------
        self.font_family = sprites.load_pixel_font()
        # Walk strip: 4 walk frames (+ 4 eyes-closed blink variants appended).
        n = config.WALK_FRAME_COUNT
        walk_all = sprites.load_strip(
            config.WALK_FILE, n * 2 if config.WALK_HAS_BLINK else n)
        self.walk_r = walk_all[:n]
        self.blink_r = walk_all[n:] if len(walk_all) == 2 * n else None
        self.walk_l = sprites.mirrored(self.walk_r)
        self.blink_l = sprites.mirrored(self.blink_r) if self.blink_r else None
        # Idle strip: standing + periodic glass-raise ("inspecting" the bubble).
        self.idle_frames = sprites.load_strip(
            config.IDLE_FILE, config.IDLE_FRAME_COUNT)

        self.actor = sprites.SpriteLabel(self.walk_r, self)
        self.bubble = SpeechBubble(self.font_family, self)
        self.bubble.raise_()

        self.refresh_placement()
        self.reset_sprites()

    def set_walking(self, direction: str) -> None:
        """Walk frames facing 'right' or 'left', with their blink variants."""
        if direction == "right":
            self.actor.set_frames(self.walk_r, self.blink_r)
        else:
            self.actor.set_frames(self.walk_l, self.blink_l)

    def set_idle(self) -> None:
        """Standing frames: mostly still, raising the glass every few seconds."""
        self.actor.set_frames(self.idle_frames)

    def refresh_placement(self) -> None:
        """(Re)anchor to the CURRENT active screen — called at construction and
        again before every trigger, so display changes / the cursor being on
        another monitor can't leave the overlay on a stale screen.
        availableGeometry: the strip sits ABOVE the Dock, so he walks along the
        visible bottom edge of the workspace."""
        geo = self._active_screen().availableGeometry()
        aw = self.actor.width()
        # He stops at one-tenth of the SCREEN width (not the window's).
        self.stop_x = int(geo.width() * config.WALK_STOP_FRAC)
        # Window just wide enough: walk range + sprite + bubble to his right.
        self.win_w = min(geo.width(),
                         self.stop_x + aw + config.BUBBLE_MAX_W + 60)
        self.setFixedSize(self.win_w, config.WIN_H)
        self._compute_layout()
        self.move(geo.left(), geo.bottom() - config.WIN_H + 1)

    # ------------------------------------------------------------------ layout
    def _compute_layout(self) -> None:
        """The walker's key positions, in window-local coords."""
        aw, ah = self.actor.width(), self.actor.height()
        self.actor_y = config.WIN_H - ah - 4        # feet on the bottom edge
        self.actor_hidden_x = -aw - 8               # parked past the left edge

    def position_bubble(self) -> None:
        """Aim the bubble's tail tip at the walker's hat, above-right of him.
        Call AFTER set_text() — the bubble resizes to fit its text."""
        aw, ah = self.actor.width(), self.actor.height()
        tip = self.bubble.tail_tip()
        head_x = self.actor.x() + int(aw * 0.80)
        head_y = self.actor.y() + int(ah * 0.06) - config.BUBBLE_GAP
        x = head_x - tip.x()
        y = head_y - tip.y()
        # Keep the bubble fully inside the window.
        x = max(4, min(x, self.win_w - self.bubble.width() - 4))
        y = max(4, min(y, config.WIN_H - self.bubble.height() - 4))
        self.bubble.move(x, y)

    def reset_sprites(self) -> None:
        """Return everything to its start-of-sequence state (all hidden)."""
        self.actor.stop_animation()
        self.set_walking("right")
        self.actor.move(self.actor_hidden_x, self.actor_y)
        self.actor.hide()
        self.bubble.set_pop(0.0)
        self.bubble.hide()

    # ------------------------------------------------------------------ screen
    def _active_screen(self):
        """Prefer the screen the cursor is on (multi-monitor friendly)."""
        screen = QGuiApplication.screenAt(QCursor.pos())
        return screen or QGuiApplication.primaryScreen()
