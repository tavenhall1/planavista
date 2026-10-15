# 0.11.0: PlanaVista's own dashboard and the screensaver (plan record)

**Goal:** a household installs PlanaVista and lands in setup without building a dashboard; a shared family screen shows a living sky when nobody is using it, and turns its own screen down at night.

**Designs:** `docs/superpowers/specs/2026-10-14-onboarding-design.md` and `docs/superpowers/specs/2026-10-15-screensaver-design.md` (both updated after review).

**How it was built:** each feature was prototyped first and checked on a dev copy, then replayed onto main 27dcd8b as the commits below. This file records the tasks, their commits, and how each was checked, in place of a generated step-by-step plan.

## Global constraints

- Version 0.11.0 in `manifest.json`, `frontend/package.json`, and `const.py` (a test keeps them equal).
- Rollback-safe across one release step back: new fields only, unknown fields kept (0.10.x ignores `security.screensaver` and `planavista.dashboard`).
- PINs never pass through services; the screensaver settings are parent level, the dashboard switch admin only.
- No em dashes in tracked text (`python scripts/check_copy.py`).

## Tasks

| # | Task | Commits | Checked by |
|---|---|---|---|
| 1 | Onboarding design | a24482f | |
| 2 | The dashboard: made when the integration is added, shown or hidden, removed with it | df393a5 | tests/test_dashboard.py; a fresh-install copy |
| 3 | The card opens setup by itself; Settings, About's sidebar switch | 4c5f8db, d871ba3 | test/onboarding.test.ts |
| 4 | Screensaver design | 53563ee | |
| 5 | The household setting, settings/save keys, refusals, diagnostics | f0f99bf | tests/test_screensaver.py |
| 6 | The rules: idle clock, motion, night, the Screen entity, weather, corners | a7c5aa0 | test/screensaver-rules.test.ts |
| 7 | The sky and the info (ported from mockup v4) | 12d96ff | test/screensaver-sky.test.ts, screensaver-info.test.ts |
| 8 | The page-wide controller and the element | d6f4791 | test/screensaver-controller.test.ts; review copy, real 2-minute wait |
| 9 | Settings' Shared screens section, Show it now, the Motion filter | c44b930, 9b3f9f4 | test/screensaver-rules.test.ts (the filter); review copy (the section); after review, test/screensaver-element.test.ts |
| 10 | Version, README, design system; the bundle | 52fb6a5, 37614ab | both suites |

## Review and fixes

Two Opus reviewers (rules and data on review copy 1; screens on copy 2): 2 Critical, 16 Important, 17 Minor. Fixed test-first:

- 9058fe6: hiding the dashboard keeps it at its address; out of Home Assistant's Dashboards list; its own layout file name; `taken`; removal forgets it; settings/save checks before changing; `invalid_night`.
- 405b5b1, 4a8e0ee: the Screen's state before is kept (also across a reload) and put back in every way the screensaver can end, and in the morning; never brighter; a modal dialog above Home Assistant's dialogs; the waking key presses nothing; Show it now keeps parent mode; the wake lock at night; night from bedtimes without hours; motion on the page's clock; the household's Motion setting; real corners; one row per shared event; Settings' selects and stored picks; setup for admins only.
- 33abafb, fd5b57b: the designs, README, and design system.

Checked on review copy 2 as the Kitchen account, with the page's clock moved: a reload at night puts the screen back; morning brings it back while the sky shows; the sky covers an open more-info dialog; Enter, Space, a letter, and Escape press nothing beneath; the info moves 270 by 452 px between corners in portrait; a kiosk screen keeps the hidden dashboard. Backend 1275 tests, card 1709.

A re-review on fd5b57b (one Opus reviewer, copy 2): 0 Critical, 3 Important, 5 Minor, fixed at 2697d2d and bundle d8d23d6: a hold waits until its Screen's state is known (Home Assistant skips a call to an unavailable entity and answers it as done); one record per browser for the login's pages, which share their touches, and no screensaver on a hidden page; a reload while it shows comes back up; the rest of the waking touch and key kept from the page until they lift; "Until tomorrow 5:00 PM"; a refused night turned back in its field. Checked on copy 2: woken while the Screen read unavailable, the hold stayed and the switch came back on once it read off; a reload at night came back up with the switch off; a second finger 30 ms after the waking one left Dana's tile open, where the same hold without the screensaver checked it off.

From the kitchen screen (a Raspberry Pi 4, production 0.10.0; 266a304 and bundle 3c81858): switching to the Chores board took about half a second, mostly rings reading the Motion setting one by one. The card now paints how rings fill (`ringTokens`), and the bar measures from its ResizeObserver. With the CPU slowed 4x: the Chores tab 526 to 179 ms, Board 204 to 97 ms. Backend 1275 tests, card 1722.

Accepted: devices on different browsers signed in with one account each keep their own record of the Screen; a renamed shared login shows its old name until a restart; after PlanaVista is removed, an open page keeps its screensaver until it reloads.
