"""
notification_panel.py — the pixel speech bubble (SpeechBubble).

Styled after the classic "I LOVE YOU" pixel bubble: white body, thick black
outline with stepped (pixel-rounded) corners, a small stepped tail pointing at
Kirby, and a gray drop shadow offset down-right. Drawn entirely in code so the
bubble stretches to fit any meeting name — a PNG couldn't do that crisply.

Everything is built from BUBBLE_UNIT-sized "fat pixels" (rect fills only, no
curves, no anti-aliasing), so it stays authentically 8-bit at any size.

Pop-in is 3 DISCRETE scale steps (small → mid → full) instead of a smooth
tween — that stepped snap is what makes it read retro.
"""

from __future__ import annotations

from PySide6.QtCore import Qt, QPoint, QRect
from PySide6.QtGui import QColor, QFont, QFontMetrics, QPainter
from PySide6.QtWidgets import QWidget

import config

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
        self.setAttribute(Qt.WidgetAttribute.WA_TransparentForMouseEvents, True)
        self._font_family = font_family
        self._title_lines: list[str] = []
        self._time_text = ""
        self._pop = 0.0
        self._body_w = config.BUBBLE_MIN_W
        self._body_h = 60
        self._tail_x = 0
        self.set_text("", "")

    # ------------------------------------------------------------------ fonts
    def _font(self, px: int) -> QFont:
        f = QFont(self._font_family)
        f.setPixelSize(px)
        f.setStyleStrategy(QFont.StyleStrategy.NoAntialias)  # crisp glyph edges
        return f

    # ------------------------------------------------------------------ layout
    def set_text(self, title: str, time_text: str) -> None:
        """Set the meeting name + time and resize the bubble to fit."""
        u = config.BUBBLE_UNIT
        pad = 4 * u
        fm_title = QFontMetrics(self._font(config.BUBBLE_TITLE_PX))
        fm_time = QFontMetrics(self._font(config.BUBBLE_TIME_PX))

        avail = config.BUBBLE_MAX_W - 2 * pad
        self._title_lines = self._wrap(title, fm_title, avail, max_lines=2)
        self._time_text = time_text

        title_w = max((fm_title.horizontalAdvance(l) for l in self._title_lines),
                      default=0)
        time_w = fm_time.horizontalAdvance(time_text)
        self._body_w = max(config.BUBBLE_MIN_W,
                           min(config.BUBBLE_MAX_W,
                               max(title_w, time_w) + 2 * pad))

        line_h = fm_title.height() + 2
        self._body_h = (pad + line_h * max(1, len(self._title_lines))
                        + 2 * u + fm_time.height() + pad)
        self._tail_x = 4 * u          # tail sits bottom-LEFT (points at Kirby,
                                      # who flies on the bubble's left side)

        # widget = body + tail rows below + shadow offset
        self.setFixedSize(self._body_w + 2 * u, self._body_h + 3 * u + 2 * u)
        self.update()

    @staticmethod
    def _wrap(text: str, fm: QFontMetrics, avail: int, max_lines: int) -> list[str]:
        """Greedy word wrap; the last line gets elided if it still overflows."""
        words = text.split()
        if not words:
            return [""]
        # Pre-split any "word" wider than the line — URLs and CJK titles have no
        # spaces and would otherwise render past the bubble edge, clipped.
        pieces: list[str] = []
        for w in words:
            while len(w) > 1 and fm.horizontalAdvance(w) > avail:
                cut = len(w) - 1
                while cut > 1 and fm.horizontalAdvance(w[:cut]) > avail:
                    cut -= 1
                pieces.append(w[:cut])
                w = w[cut:]
            pieces.append(w)
        words = pieces
        lines, cur = [], words[0]
        for w in words[1:]:
            trial = cur + " " + w
            if fm.horizontalAdvance(trial) <= avail:
                cur = trial
            else:
                lines.append(cur)
                cur = w
                if len(lines) == max_lines - 1:
                    break
        lines.append(cur)
        if len(lines) > max_lines:
            lines = lines[:max_lines]
        used = len(lines) - 1
        rest = " ".join(words[sum(len(l.split()) for l in lines[:used]):])
        lines[-1] = fm.elidedText(rest if used else lines[-1],
                                  Qt.TextElideMode.ElideRight, avail)
        return lines

    def tail_tip(self) -> QPoint:
        """Widget-local point of the tail's tip — the window aims this at Kirby."""
        u = config.BUBBLE_UNIT
        return QPoint(self._tail_x, self._body_h + 3 * u)

    # ------------------------------------------------------------------ pop
    def set_pop(self, p: float) -> None:
        """0 = hidden, 1 = fully shown. Quantized to 3 retro steps in paint."""
        self._pop = max(0.0, min(1.0, p))
        self.update()

    def _pop_scale(self) -> float:
        s = 0.0
        for threshold, scale in _POP_STEPS:
            if self._pop >= threshold and self._pop > 0.0:
                s = scale
        return s

    # ------------------------------------------------------------------ paint
    def paintEvent(self, event) -> None:  # noqa: N802 (Qt naming)
        s = self._pop_scale()
        if s <= 0.0:
            return
        u = config.BUBBLE_UNIT
        p = QPainter(self)
        p.setRenderHint(QPainter.RenderHint.Antialiasing, False)
        p.setRenderHint(QPainter.RenderHint.TextAntialiasing, False)

        # Scale around the tail tip so the bubble grows OUT of Kirby's head.
        tip = self.tail_tip()
        p.translate(tip)
        p.scale(s, s)
        p.translate(-tip)

        bw, bh, tx = self._body_w, self._body_h, self._tail_x

        # Drop shadow first (body + tail), offset down-right by 2 units.
        p.translate(2 * u, 2 * u)
        self._draw_stepped_rect(p, 0, 0, bw, bh, SHADOW)
        self._draw_tail(p, tx, bh, SHADOW, SHADOW)
        p.translate(-2 * u, -2 * u)

        # Black outline body, then white face inset by one unit.
        self._draw_stepped_rect(p, 0, 0, bw, bh, INK)
        self._draw_stepped_rect(p, u, u, bw - 2 * u, bh - 2 * u, WHITE)
        self._draw_tail(p, tx, bh, INK, WHITE)

        # Text: meeting name (up to 2 lines), then time below in gray.
        pad = 4 * u
        p.setPen(QColor(INK))
        p.setFont(self._font(config.BUBBLE_TITLE_PX))
        fm = QFontMetrics(p.font())
        line_h = fm.height() + 2
        y = pad
        for line in self._title_lines:
            p.drawText(QRect(pad, y, bw - 2 * pad, line_h),
                       int(Qt.AlignmentFlag.AlignLeft | Qt.AlignmentFlag.AlignVCenter),
                       line)
            y += line_h
        p.setPen(QColor(TIME_INK))
        p.setFont(self._font(config.BUBBLE_TIME_PX))
        fm_time = QFontMetrics(p.font())
        p.drawText(QRect(pad, y + 2 * u, bw - 2 * pad, fm_time.height()),
                   int(Qt.AlignmentFlag.AlignLeft | Qt.AlignmentFlag.AlignVCenter),
                   self._time_text)
        p.end()

    # ------------------------------------------------------- pixel primitives
    @staticmethod
    def _draw_stepped_rect(p: QPainter, x: int, y: int, w: int, h: int,
                           color: str) -> None:
        """A rectangle with 2-step pixel-rounded corners (all rect fills)."""
        u = config.BUBBLE_UNIT
        c = QColor(color)
        p.fillRect(QRect(x + 2 * u, y, w - 4 * u, h), c)
        p.fillRect(QRect(x + u, y + u, w - 2 * u, h - 2 * u), c)
        p.fillRect(QRect(x, y + 2 * u, w, h - 4 * u), c)

    @staticmethod
    def _draw_tail(p: QPainter, tx: int, body_h: int, ink: str, face: str) -> None:
        """Small stepped tail under the body pointing down-LEFT (at Kirby)."""
        u = config.BUBBLE_UNIT
        p.fillRect(QRect(tx, body_h, 5 * u, u), QColor(ink))
        p.fillRect(QRect(tx, body_h + u, 3 * u, u), QColor(ink))
        p.fillRect(QRect(tx, body_h + 2 * u, 2 * u, u), QColor(ink))
        # white core joins the tail to the bubble interior (punch the border)
        p.fillRect(QRect(tx + u, body_h - u, 3 * u, u), QColor(face))
        p.fillRect(QRect(tx + u, body_h, 3 * u, u), QColor(face))
        p.fillRect(QRect(tx + u, body_h + u, u, u), QColor(face))
