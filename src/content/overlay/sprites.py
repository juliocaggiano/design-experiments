"""
sprites.py — turns art into crisp QPixmaps, with a procedural fallback.

Two jobs:
  1. Load the character sprite from assets/ and scale it with NEAREST-NEIGHBOR
     so it stays hard-edged 8-bit (never blurry). If the PNG is missing, draw a
     placeholder so the app still runs and the animation is testable.
  2. Provide SpriteLabel, a QLabel that can cycle through frames on a timer and
     swap frame sets (used to mirror the walker when he turns around).
"""

from __future__ import annotations

import os

from PySide6.QtCore import Qt, QTimer, QRect
from PySide6.QtGui import QColor, QFontDatabase, QPainter, QPixmap, QTransform
from PySide6.QtWidgets import QLabel

import config


# ---------------------------------------------------------------------------
# Low-level helpers
# ---------------------------------------------------------------------------
_FAST = Qt.TransformationMode.FastTransformation   # nearest-neighbor = crisp, no blur


def _scale_h(pix: QPixmap, target_h: int) -> QPixmap:
    """Scale to a target HEIGHT, preserving aspect ratio (width follows)."""
    if pix.height() == 0:
        return pix
    w = max(1, round(pix.width() * target_h / pix.height()))
    return pix.scaled(w, target_h, Qt.AspectRatioMode.IgnoreAspectRatio, _FAST)


def _blank(native_w: int, native_h: int) -> QPixmap:
    """A transparent native-resolution canvas to draw a placeholder onto."""
    pix = QPixmap(native_w, native_h)
    pix.fill(Qt.GlobalColor.transparent)
    return pix


def _fill(p: QPainter, x: int, y: int, w: int, h: int, color: str) -> None:
    p.fillRect(QRect(x, y, w, h), QColor(color))


# ---------------------------------------------------------------------------
# Procedural placeholder (used only when the sprite PNG is missing)
# ---------------------------------------------------------------------------
def _draw_actor() -> QPixmap:
    """A blocky orange fellow with a dark hat — enough to test the walk."""
    nw, nh = 20, 18
    pix = _blank(nw, nh)
    p = QPainter(pix)
    p.setRenderHint(QPainter.RenderHint.Antialiasing, False)
    ORANGE, DARK, HAT = "#E8825A", "#2B2B2B", "#4A3A30"
    _fill(p, 5, 0, 10, 2, HAT)      # hat crown
    _fill(p, 3, 2, 14, 2, HAT)      # hat brim
    _fill(p, 2, 4, 16, 10, ORANGE)  # body
    _fill(p, 6, 6, 2, 2, DARK)      # eyes
    _fill(p, 12, 6, 2, 2, DARK)
    _fill(p, 4, 14, 3, 3, ORANGE)   # feet
    _fill(p, 13, 14, 3, 3, ORANGE)
    p.end()
    return pix


# ---------------------------------------------------------------------------
# Public loaders
# ---------------------------------------------------------------------------
def load_strip(filename: str, count: int) -> list[QPixmap]:
    """Slice a horizontal strip into `count` frames, each scaled to
    SPRITE_TARGET_H (aspect kept). Missing file → placeholder frames."""
    path = os.path.join(config.ASSETS_DIR, filename)
    count = max(1, count)
    if not os.path.exists(path):
        pix = _scale_h(_draw_actor(), config.SPRITE_TARGET_H)
        return [pix] * count
    sheet = QPixmap(path)
    fw = sheet.width() // count
    fh = sheet.height()
    return [_scale_h(sheet.copy(QRect(i * fw, 0, fw, fh)), config.SPRITE_TARGET_H)
            for i in range(count)]


def mirrored(frames: list[QPixmap]) -> list[QPixmap]:
    """Horizontally flipped copies — the walker facing the other way."""
    return [f.transformed(QTransform().scale(-1, 1)) for f in frames]


def load_pixel_font() -> str:
    """Register the bundled pixel font and return its family name.
    Falls back to a system monospace if PressStart2P.ttf isn't present."""
    path = os.path.join(config.ASSETS_DIR, config.FONT_FILE)
    if os.path.exists(path):
        font_id = QFontDatabase.addApplicationFont(path)
        families = QFontDatabase.applicationFontFamilies(font_id)
        if families:
            return families[0]
    # Fallback: a concrete macOS monospace (avoids the generic "Monospace"
    # alias, which triggers a slow font lookup and a console warning).
    for candidate in ("Menlo", "Monaco", "Courier New"):
        if candidate in QFontDatabase.families():
            return candidate
    return QFontDatabase.systemFont(QFontDatabase.SystemFont.FixedFont).family()


# ---------------------------------------------------------------------------
# SpriteLabel — a QLabel that can flip through frames on a timer
# ---------------------------------------------------------------------------
class SpriteLabel(QLabel):
    """A pixel sprite. Holds one or more frames; can animate by cycling them.

    Optionally carries a parallel set of BLINK variants: while animating, the
    blink frame is shown instead of the normal one for a short window every
    `blink_every` ticks — a periodic eyes-closed moment on top of any cycle.
    """

    def __init__(self, frames: list[QPixmap], parent=None):
        super().__init__(parent)
        self._blink = None
        self._blink_every = 0
        self._blink_len = 0
        self._tick = 0
        self.set_frames(frames)
        self.setFixedSize(self._frames[0].size())
        self.setScaledContents(False)            # we pre-scaled; don't let Qt blur
        self.setAttribute(Qt.WidgetAttribute.WA_TransparentForMouseEvents, True)
        self._timer = QTimer(self)
        self._timer.timeout.connect(self._advance)

    def set_frames(self, frames: list[QPixmap],
                   blink: list[QPixmap] | None = None) -> None:
        """Swap the frame set (walk right/left, idle) + optional blink set.
        All frame sets share one canvas size, so no resize is needed."""
        self._frames = frames or [QPixmap()]
        self._blink = blink if blink and len(blink) == len(self._frames) else None
        self._index = 0
        self.setPixmap(self._frames[0])

    def show_frame(self, i: int) -> None:
        """Statically show one frame (used for one-shot gesture poses)."""
        if 0 <= i < len(self._frames):
            self._index = i
            self.setPixmap(self._frames[i])

    def _advance(self) -> None:
        self._tick += 1
        self._index = (self._index + 1) % len(self._frames)
        blinking = (self._blink is not None and self._blink_every > 0
                    and self._tick % self._blink_every < self._blink_len)
        self.setPixmap((self._blink if blinking else self._frames)[self._index])

    def start_animation(self, interval_ms: int,
                        blink_every: int = 0, blink_len: int = 0) -> None:
        """Cycle frames every interval_ms. blink_every/blink_len are in TICKS
        (the caller converts from ms so cadences stay frame-locked)."""
        self._blink_every = blink_every
        self._blink_len = blink_len
        self._tick = 0
        if len(self._frames) > 1 or self._blink:
            self._timer.start(interval_ms)

    def stop_animation(self) -> None:
        self._timer.stop()
        self._index = 0
        self._tick = 0
        self.setPixmap(self._frames[0])
