# 0.12.0 Implementation Plan: the living sky, dimming, and help in Settings

> Executed natively on `feat/m12-living-sky`, test-first, one commit per task. The port's reference code is the mockup (scratchpad `screensaver/living-sky.html`, version 15) diffed against version 4, which `SkyScene` already mirrors.

**Goal:** ship spec `docs/superpowers/specs/2026-10-15-living-sky-dimming-design.md`.

**Tech:** Python 3.14 (pytest in Docker, `scripts/test-backend.sh`), TypeScript + Lit 3 (vitest, `npx vitest run`, `npx tsc --noEmit -p .`), Rollup bundle.

## Global constraints

- No em dashes anywhere (`python scripts/check_copy.py`).
- Rollback-safe across one release back: add fields only, keep unknown fields.
- Shared screens only for dimming, the screensaver, and kiosk mode.
- Every new control 44 to 48 px tall; plain words; "approval", never "OK", for a parent's OK.
- Version 0.12.0 in `manifest.json`, `frontend/package.json`, `const.py`.

## Review focus

1. A fade across midnight or a night from Sleep times that ends after 6:30 AM: the level follows the night that holds now.
2. A screen marked shared, or unmarked, mid-fade: the card dims or brightens at once, never stuck.
3. The preview ending while the real level changed meanwhile: the card lands on the real level.
4. A person's color reaching the screen by a path that skips `memberColor` (rings, avatars, chips, Day view rings): every one dims.
5. A Settings item without a ?: the help test fails.

## Tasks

1. **Backend levels.** `household/screensaver.py`: `DIM_DAY_CHOICES`, `DIM_NIGHT_CHOICES`, `dim` in default, normalize, view, diagnostics. `household/websocket.py`: `dim_day`, `dim_night`. Tests in `tests/test_screensaver.py`.
2. **The level, pure.** `frontend/src/core/dimming.ts` (`dimLevel`, `dimColor`, `dimTokens`, `mediaBrightness`, `DIM_STEP_MS`, choices); `test/dimming.test.ts`. Types: `ScreensaverSettings.dim`.
3. **Painting it.** `shell/appearance-controller.ts` (level source, dimmed tokens, `--pv-dim`, `--pv-dim-media`, 15 s steps, preview), `shell/planavista-card.ts` (shared, night, level, `dim` to modules, preview event), `core/household.ts` `memberColor(member, mode, dim)`, `styles/theme-pairs.ts` `personColors(..., dim)`, `modules/calendar/mode-colors.ts`, chores and calendar modules pass `dim`; pictures, photos, and weather icons take `--pv-dim-media`. Tests for the pure parts.
4. **Shared screens page.** `shell/settings/screens-page.ts`, `shell/definition.ts`, `shell/settings/pins-page.ts` trimmed, targets that opened `pins` for these; Dimming rows with the preview. Tests: summaries, targets.
5. **Help.** `core/help.ts`, `styles/help.ts`, `test/help.test.ts` (source scan), on the Shared screens and PIN pages first, then every Settings page with its copy.
6. **Living sky, entrance and life.** `modules/screensaver/sky-scene.ts`, `sky.ts`, `sky-styles.ts`, `shell/pv-screensaver.ts`.
7. **Living sky, weather and seasons.** Windy, the rainbow (`planavista.rainAt`), seasons on the land, fireflies; `sky.ts` pure parts tested (`seasonAt`, `rainbowFor`).
8. **The moon.** `moonImage`, the backing disc, cloud dimming by color.
9. **The screensaver dims, and Try it.** Light model times the level; `preview(now, trial)`; Settings' Try it row.
10. **Docs and version.** README, DESIGN_SYSTEM (help, dimming), version 0.12.0, bundle.

Then: dev HA and a review copy, browser checks, two Opus reviewers (rules and data; screens), fixes, demo, option 1.
