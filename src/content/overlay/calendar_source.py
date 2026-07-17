"""
calendar_source.py — where meetings come from.

One small interface (CalendarSource) with three implementations:
  * MockCalendarSource   — fake events, no setup, for building/testing.
  * ICalCalendarSource   — your real calendar via its private iCal URL.
                           Simplest real setup: paste ONE url, done.
  * GoogleCalendarSource — your real Google Calendar via OAuth (most accurate,
                           but needs a one-time Google Cloud setup).

The rest of the app only ever sees `get_upcoming_events()` returning a list of
Event objects, so it never knows or cares which source is behind it. Swapping
mock <-> google is a one-line change in config.py.

NOTE: the Google connector available to Claude in chat is NOT reachable from a
standalone app. This module gives the running app its OWN Google access.
"""

from __future__ import annotations

import datetime as dt
from dataclasses import dataclass
from typing import List

import config


@dataclass
class Event:
    id: str
    name: str
    start: dt.datetime          # timezone-aware


class CalendarSource:
    """Abstract base. Return events starting within the next `horizon_minutes`."""

    def get_upcoming_events(self, now: dt.datetime, horizon_minutes: int) -> List[Event]:
        raise NotImplementedError


# ---------------------------------------------------------------------------
# Mock source — fires each event `fire_in_seconds` after launch
# ---------------------------------------------------------------------------
class MockCalendarSource(CalendarSource):
    """Builds events whose 5-minutes-before trigger lands `fire_in_seconds`
    after the app starts. So fire_in_seconds=8 => the animation plays ~8s in."""

    def __init__(self, created_at: dt.datetime):
        self._events: List[Event] = []
        for i, ev in enumerate(config.MOCK_EVENTS):
            # start = launch + fire_in + MINUTES_BEFORE, so (start - MINUTES_BEFORE)
            # == launch + fire_in == when we want the animation to play.
            start = (created_at
                     + dt.timedelta(seconds=ev["fire_in_seconds"])
                     + dt.timedelta(minutes=config.MINUTES_BEFORE))
            self._events.append(Event(id=f"mock-{i}", name=ev["name"], start=start))

    def get_upcoming_events(self, now: dt.datetime, horizon_minutes: int) -> List[Event]:
        horizon = now + dt.timedelta(minutes=horizon_minutes)
        return [e for e in self._events if now <= e.start <= horizon]


# ---------------------------------------------------------------------------
# iCal source — reads the calendar's private "Secret address in iCal format".
# No Google Cloud project, no OAuth: one pasted URL. Recurring events are
# expanded properly (Julio's calendar is mostly recurring blocks).
# ---------------------------------------------------------------------------
class ICalCalendarSource(CalendarSource):
    def __init__(self):
        self._calendar = None
        self._fetched_at: dt.datetime | None = None
        self._warned = False

    def _load(self, now: dt.datetime):
        """Return the parsed calendar, refetching at most every ICAL_REFRESH_S.
        On a network hiccup, keep serving the cached copy."""
        import icalendar

        url = config.ICAL_URL.strip()
        if not url:
            if not self._warned:
                print("[calendar] ICAL_URL is empty in config.py. Paste your "
                      "calendar's 'Secret address in iCal format' (Google "
                      "Calendar → Settings → your calendar → Integrate "
                      "calendar) to go live. No events until then.")
                self._warned = True
            return None

        fresh = (self._fetched_at is not None and
                 (now - self._fetched_at).total_seconds() < config.ICAL_REFRESH_S)
        if self._calendar is not None and fresh:
            return self._calendar
        try:
            if url.startswith(("/", "file://")):
                path = url[7:] if url.startswith("file://") else url
                with open(path, "rb") as f:
                    data = f.read()
            else:
                import urllib.request
                with urllib.request.urlopen(url, timeout=15) as resp:
                    data = resp.read()
            self._calendar = icalendar.Calendar.from_ical(data)
            self._fetched_at = now
        except Exception as exc:
            if self._calendar is None:
                raise               # nothing cached — let the scheduler log it
            print(f"[calendar] refresh failed, using cached copy: {exc}")
        return self._calendar

    def get_upcoming_events(self, now: dt.datetime, horizon_minutes: int) -> List[Event]:
        cal = self._load(now)
        if cal is None:
            return []
        import recurring_ical_events

        horizon = now + dt.timedelta(minutes=horizon_minutes)
        events: List[Event] = []
        for occ in recurring_ical_events.of(cal).between(now, horizon):
            start = occ.get("DTSTART").dt
            if not isinstance(start, dt.datetime):
                continue            # all-day events carry a date, not a time
            if start.tzinfo is None:
                start = start.astimezone()      # floating time → local
            events.append(Event(
                # uid + occurrence start so each RECURRENCE fires exactly once
                id=f"{occ.get('UID', 'ical')}-{start.isoformat()}",
                name=str(occ.get("SUMMARY", "(no title)")),
                start=start.astimezone(),
            ))
        return events


# ---------------------------------------------------------------------------
# Google source — real calendar via OAuth (lazy imports so mock mode never
# needs the google libraries installed)
# ---------------------------------------------------------------------------
class GoogleCalendarSource(CalendarSource):
    def __init__(self):
        self._service = self._build_service()

    def _build_service(self):
        import os
        from google.oauth2.credentials import Credentials
        from google_auth_oauthlib.flow import InstalledAppFlow
        from google.auth.transport.requests import Request
        from googleapiclient.discovery import build

        creds = None
        if os.path.exists(config.GOOGLE_TOKEN_FILE):
            creds = Credentials.from_authorized_user_file(
                config.GOOGLE_TOKEN_FILE, config.GOOGLE_SCOPES)

        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                if not os.path.exists(config.GOOGLE_CLIENT_SECRET_FILE):
                    raise FileNotFoundError(
                        "Missing credentials/client_secret.json. See the README "
                        "for the one-time Google Cloud setup, or set "
                        "CALENDAR_SOURCE='mock' in config.py.")
                flow = InstalledAppFlow.from_client_secrets_file(
                    config.GOOGLE_CLIENT_SECRET_FILE, config.GOOGLE_SCOPES)
                creds = flow.run_local_server(port=0)
            with open(config.GOOGLE_TOKEN_FILE, "w") as f:
                f.write(creds.to_json())

        return build("calendar", "v3", credentials=creds, cache_discovery=False)

    def get_upcoming_events(self, now: dt.datetime, horizon_minutes: int) -> List[Event]:
        time_min = now.astimezone(dt.timezone.utc).isoformat()
        time_max = (now + dt.timedelta(minutes=horizon_minutes)) \
            .astimezone(dt.timezone.utc).isoformat()
        resp = self._service.events().list(
            calendarId=config.GOOGLE_CALENDAR_ID,
            timeMin=time_min, timeMax=time_max,
            singleEvents=True, orderBy="startTime", maxResults=20,
        ).execute()

        events: List[Event] = []
        for item in resp.get("items", []):
            start_raw = item.get("start", {}).get("dateTime")
            if not start_raw:        # all-day events have only "date"; skip them
                continue
            start = dt.datetime.fromisoformat(start_raw.replace("Z", "+00:00"))
            events.append(Event(
                id=item["id"],
                name=item.get("summary", "(no title)"),
                start=start.astimezone(),   # to local time for display
            ))
        return events


# ---------------------------------------------------------------------------
# Factory
# ---------------------------------------------------------------------------
def build_calendar_source(created_at: dt.datetime) -> CalendarSource:
    if config.CALENDAR_SOURCE == "google":
        return GoogleCalendarSource()
    if config.CALENDAR_SOURCE == "ical":
        return ICalCalendarSource()
    return MockCalendarSource(created_at)
