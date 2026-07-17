"""
scheduler.py — polls the calendar and fires the animation 5 minutes before.

Deliberately single-threaded and all-Qt: a QTimer ticks on the GUI thread, so
when we decide to trigger, we're already on the right thread to touch widgets —
no cross-thread marshaling, no Qt threading bugs.

For each event we compute trigger_time = start - MINUTES_BEFORE. Once `now`
crosses it, we emit `meeting_due` exactly once (tracked by event id).
"""

from __future__ import annotations

import datetime as dt

from PySide6.QtCore import QObject, QTimer, Signal

import config


class MeetingScheduler(QObject):
    # Carries (meeting_name, formatted_time) to the animation controller.
    meeting_due = Signal(str, str)

    def __init__(self, source, parent=None):
        super().__init__(parent)
        self._source = source
        self._fired: set = set()        # event ids we've already animated
        self._timer = QTimer(self)
        self._timer.setInterval(config.POLL_INTERVAL_S * 1000)
        self._timer.timeout.connect(self._poll)

    def start(self) -> None:
        self._timer.start()
        self._poll()                    # check immediately, don't wait one interval

    def _poll(self) -> None:
        now = dt.datetime.now().astimezone()
        # Look a bit beyond the trigger window so we never miss an event.
        horizon = config.MINUTES_BEFORE + max(2, config.POLL_INTERVAL_S // 60 + 1)
        try:
            events = self._source.get_upcoming_events(now, horizon)
        except Exception as exc:        # a calendar hiccup shouldn't kill the app
            print(f"[scheduler] calendar fetch failed: {exc}")
            return

        for ev in events:
            if ev.id in self._fired:
                continue
            trigger_time = ev.start - dt.timedelta(minutes=config.MINUTES_BEFORE)
            # Fire if we're past the trigger but the meeting hasn't long started.
            if trigger_time <= now and ev.start >= now - dt.timedelta(seconds=60):
                self._fired.add(ev.id)
                self.meeting_due.emit(ev.name, ev.start.strftime(config.TIME_FORMAT))
