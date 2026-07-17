"""
app.py — bootstraps the QApplication and wires everything together.

Runs as a background agent with a macOS menu-bar icon (Test / Quit), so you can
preview the animation any time without waiting for a real meeting.

Run modes:
    python run.py              normal: menu-bar app, watches the calendar
    python run.py --selftest   headless: plays one sped-up sequence, then quits
                               (used for automated verification; works offscreen)
"""

from __future__ import annotations

import datetime as dt
import sys

from PySide6.QtCore import QTimer
from PySide6.QtGui import QAction, QIcon
from PySide6.QtWidgets import QApplication, QMenu, QSystemTrayIcon

import config
from . import sprites
from .animation_controller import AnimationController, State
from .calendar_source import build_calendar_source
from .overlay_window import OverlayWindow
from .scheduler import MeetingScheduler


def _tray_icon() -> QIcon:
    """The tiny detective for the menu bar."""
    from PySide6.QtCore import Qt
    pix = sprites.load_strip(config.WALK_FILE, config.WALK_FRAME_COUNT)[0].scaled(
        22, 22, Qt.AspectRatioMode.KeepAspectRatio,
        Qt.TransformationMode.FastTransformation)
    return QIcon(pix)


def main(argv: list[str]) -> int:
    selftest = "--selftest" in argv

    app = QApplication(argv)
    # Don't quit when the (frameless) window is hidden — we live in the menu bar.
    app.setQuitOnLastWindowClosed(False)

    window = OverlayWindow()

    def log_state(state: State) -> None:
        print(f"[state] {state.name}")

    hold = 600 if selftest else config.NOTIFICATION_HOLD_MS
    controller = AnimationController(window, hold_ms=hold, on_state=log_state)

    source = build_calendar_source(dt.datetime.now().astimezone())
    scheduler = MeetingScheduler(source)
    scheduler.meeting_due.connect(controller.play)

    window.show()

    if selftest:
        # Drive one full sequence, then quit when it returns to IDLE.
        started = {"v": False}
        completed = {"v": False}

        def watch(state: State) -> None:
            log_state(state)
            if state is not State.IDLE:
                started["v"] = True
            elif started["v"]:
                completed["v"] = True
                QTimer.singleShot(150, app.quit)

        controller._on_state = watch
        QTimer.singleShot(50, lambda: controller.play("Self Test Meeting", "12:34"))
        QTimer.singleShot(9000, app.quit)          # hard safety net
        rc = app.exec()
        if not completed["v"]:
            # The safety net fired — the sequence hung. Fail loudly, not silently.
            print("[selftest] FAILED: sequence did not return to IDLE")
            return 1
        return rc

    # --- Normal mode: menu-bar icon + live calendar polling ----------------
    if QSystemTrayIcon.isSystemTrayAvailable():
        tray = QSystemTrayIcon(_tray_icon(), app)
        tray.setToolTip("Claude Code Meeting Overlay")
        menu = QMenu()

        test_action = QAction("Test animation now", menu)

        def run_test() -> None:
            when = (dt.datetime.now() + dt.timedelta(minutes=config.MINUTES_BEFORE))
            controller.play("Test Meeting", when.strftime(config.TIME_FORMAT))

        test_action.triggered.connect(run_test)
        quit_action = QAction("Quit", menu)
        quit_action.triggered.connect(app.quit)
        menu.addAction(test_action)
        menu.addAction(quit_action)
        tray.setContextMenu(menu)
        tray.show()
        # Keep references alive for the app's lifetime.
        window._tray = tray
        window._menu = menu
    else:
        print("[app] No system tray available; running without a menu-bar icon.")

    scheduler.start()
    print(f"[app] Running. Calendar source: {config.CALENDAR_SOURCE}. "
          f"Firing {config.MINUTES_BEFORE} min before each meeting.")
    return app.exec()
