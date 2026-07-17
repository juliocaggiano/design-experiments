"""
config.py — every knob for the Meeting Overlay in one place.

This is the file you (Julio) will touch most. Nothing here is clever; it's just
named numbers. Change a value, restart the app, see the difference.

The sequence: the Claude Code detective walks in along the BOTTOM of the screen
from the left edge, stops at one-tenth of the screen width, a pixel speech
bubble pops up over him with the meeting name + time, then he turns around and
walks back out to the left.
"""

import os

# ---------------------------------------------------------------------------
# Paths (computed relative to this file, so the app is portable)
# ---------------------------------------------------------------------------
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
ASSETS_DIR = os.path.join(PROJECT_ROOT, "assets")
CREDENTIALS_DIR = os.path.join(PROJECT_ROOT, "credentials")

# ---------------------------------------------------------------------------
# Sprite
# ---------------------------------------------------------------------------
WALK_FILE = "clawd_walk.png"     # walk strip built from clawd.png
WALK_FRAME_COUNT = 4         # walk cycle: contact / R-step / contact / L-step
WALK_HAS_BLINK = True        # the strip carries 4 more frames: eyes-closed
                             # variants, swapped in periodically (see BLINK_*)
SPRITE_FRAME_MS = 80         # 80ms/frame = one step every 160ms — the exact
                             # cadence measured from the reference video
SPRITE_TARGET_H = 50         # on-screen height (px); width follows the art's
                             # aspect ratio, scaled nearest-neighbor = crisp

IDLE_FILE = "clawd_idle.png"     # gesture poses: stand / glass raised / hat tip
IDLE_FRAME_COUNT = 3
# One-shot gestures while he stands with the bubble (ms into the hold; each
# fires once, only if the hold is still running at that moment):
GESTURE_GLASS_AT_MS = 1500   # raises the magnifying glass toward the bubble
GESTURE_TIP_AT_MS = 5200     # tips his hat (eyes close)
GESTURE_LEN_MS = 900         # how long each gesture pose is held

BLINK_EVERY_MS = 3000        # blink roughly every 3 seconds while walking
BLINK_MS = 160               # eyes stay closed this long
FONT_FILE = "PressStart2P.ttf"   # bundled pixel font

# ---------------------------------------------------------------------------
# Overlay window geometry
# ---------------------------------------------------------------------------
# A short strip pinned to the BOTTOM-LEFT of the active screen (above the Dock).
# Its width is computed at runtime: walk range + sprite + bubble.
WIN_H = 300

# ---------------------------------------------------------------------------
# The walk
# ---------------------------------------------------------------------------
WALK_STOP_FRAC = 0.10        # he stops at this fraction of the screen width
WALK_SPEED = 150             # walking speed (px/s) — ~24px stride per 160ms
                             # step, coherent with the frame cadence
WALK_BOB_PX = 2              # slight body rise per step (legs do the real work)
WALK_BOB_MS = 160            # bob beat = the step cadence
MOTION_GRID = 4              # x positions snap to this grid = stepped 8-bit gait

# ---------------------------------------------------------------------------
# Speech bubble (drawn in code so it stretches to any meeting name)
# ---------------------------------------------------------------------------
BUBBLE_UNIT = 3              # the bubble's "fat pixel" size — border thickness,
                             # corner steps, and tail are all multiples of this
BUBBLE_MIN_W = 90            # bubble body width bounds (px)
BUBBLE_MAX_W = 210
BUBBLE_GAP = 6               # gap between the tail tip and the sprite's head
BUBBLE_TITLE_PX = 10         # meeting-name font size
BUBBLE_TIME_PX = 8           # meeting-time font size (Press Start 2P native grid)

# ---------------------------------------------------------------------------
# Animation timings (milliseconds). Walk durations are derived from WALK_SPEED
# and the actual distance, so the pace stays constant on any screen.
# ---------------------------------------------------------------------------
DUR_BUBBLE_POP = 220         # bubble pops in (3 discrete retro steps)
DUR_BUBBLE_DISMISS = 160     # bubble pops back out

NOTIFICATION_HOLD_MS = 10000  # how long he stands with the bubble up

# ---------------------------------------------------------------------------
# Scheduling
# ---------------------------------------------------------------------------
MINUTES_BEFORE = 5           # fire the animation this many minutes before start
POLL_INTERVAL_S = 30         # how often to check the calendar

# ---------------------------------------------------------------------------
# Calendar source: "ical" (real, simplest — one pasted URL), "google" (real,
# OAuth), or "mock" (fake events for testing).
# ---------------------------------------------------------------------------
CALENDAR_SOURCE = "ical"

# Your calendar's PRIVATE iCal address. Where to find it:
#   Google Calendar (web) → gear → Settings → click your calendar in the left
#   sidebar (julio@uni.minerva.edu) → "Integrate calendar" →
#   copy "Secret address in iCal format" (ends in .ics) → paste here.
# Keep it secret — anyone with this URL can read your calendar.
ICAL_URL = "https://calendar.google.com/calendar/ical/julio%40uni.minerva.edu/private-cc79a4f16d79092f77a356d8b2269fd8/basic.ics"

ICAL_REFRESH_S = 300         # refetch the .ics at most every 5 minutes
                             # (Google's secret feed itself can lag a few min
                             # on freshly created events)

# Mock events: each fires its 5-minutes-before animation `fire_in_seconds` after
# the app launches. Great for testing the full sequence without a real meeting.
MOCK_EVENTS = [
    {"name": "Design Sync", "fire_in_seconds": 8},
    {"name": "Capstone Review", "fire_in_seconds": 25},
]

# Google Calendar settings (only used when CALENDAR_SOURCE == "google").
GOOGLE_CALENDAR_ID = "primary"
GOOGLE_CLIENT_SECRET_FILE = os.path.join(CREDENTIALS_DIR, "client_secret.json")
GOOGLE_TOKEN_FILE = os.path.join(CREDENTIALS_DIR, "token.json")
GOOGLE_SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"]

# Time format shown in the bubble.
TIME_FORMAT = "%H:%M"        # 24h. Use "%I:%M %p" for 12h.
