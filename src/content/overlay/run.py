#!/usr/bin/env python3
"""
run.py — entry point.

    python run.py              # normal menu-bar app
    python run.py --selftest   # headless single-run for verification

Computes its own path (so a ':' or space in the folder name is harmless) and
hands off to src.app.main.
"""

import os
import sys

# Make the project root importable regardless of where you launch from.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.app import main  # noqa: E402

if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
