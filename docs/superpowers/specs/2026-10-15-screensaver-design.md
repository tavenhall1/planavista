# The screensaver (milestone 11)

**Date:** 2026-10-15
**Release:** 0.11.0, with PlanaVista's own dashboard (onboarding)
**Status:** approved in conversation with the owner (decisions 1 to 3, the look in mockup v4, and the placement; section 2). The owner doesn't read specs; this one records what was agreed and the choices made from it.

## 1. Why

A shared family screen (the kitchen tablet, a Planar 27-inch touch monitor on a Raspberry Pi 4, an Android tablet) shows PlanaVista all day. When nobody is using it, it should become something worth looking at from across the room: a living sky over paper mountains, lit by the real sun and the real weather, with the time, today's next events, and how the family's chores are going. At night it goes dark and still, and turns the screen down or off where Home Assistant can.

## 2. Decisions

- **D1. Both (owner).** The drawn display works on every screen. Real dimming and screen-off are optional, through a Home Assistant entity the household picks for that screen (a Pi companion such as LNXlink, Fully Kiosk on Android, a smart plug). With nothing picked everything still works; an iPad relies on the drawn display and its own Auto-Lock.
- **D2. When (owner: "1").** The screensaver comes on after **5 minutes** without a touch (2, 5, 10, 15, or 30). A touch wakes it and only wakes it: the waking tap never presses what is under it. An optional **motion** entity wakes it too, and while it reads on the screen counts as watched (the idle clock starts when it turns off). PlanaVista never reads video; a camera becomes a motion sensor on the device that has it.
- **D3. Night (owner: "1").** Night runs from the **latest bedtime** to the **earliest wake-up** in the household's Sleep times (a bedtime plus that person's hours of sleep; Friday and Saturday nights use weekend bedtimes), so it never dims while someone is still up. Settings can set night's own times instead. With no Sleep times anywhere and no times set, night runs 10:00 PM to 6:30 AM. At night the scene is darker and stiller, shows only the clock, and the Screen entity is turned down or off; in the morning it comes back.
- **D4. The look (owner: approved mockup v4).** Living sky in BRAND.md's layered paper style: six cut-paper ridges (a distant range, a massif with snowfields, its shoulders, an alpine range with a tree line, forested foothills, the nearest hill) with shadows between sheets, paper clouds of varying thickness, fog as tall see-through vellum patches whose feet hide behind the next ridge, rain and snow, a gentle storm. No long thin clouds or mist bands. Over it: a large clock, the date with the temperature and conditions, and the Today card (the calendar card with pegs) with the next events and a ring per person for today's chores.
- **D5. Where (owner).** Only on shared screens, never on personal phones: one household switch, **Screensaver**, in Settings, PINs and parent mode, in the **Shared screens** section beside Kiosk mode, which appears once a shared screen exists. It works with kiosk mode on or off.
- **D6. Who may change it.** Parent level, like the other household settings (it hides nothing and locks nothing, unlike kiosk mode's admin rule).

## 3. Design

### 3.1 Storage and commands (backend)

- The household's security settings gain `screensaver: {enabled: bool, after_minutes: 2|5|10|15|30, night: {from: "HH:MM", to: "HH:MM"} | null, screens: {<user id>: {screen: entity_id | null, motion: entity_id | null}}}`, default `{enabled: false, after_minutes: 5, night: null, screens: {}}` (`household/screensaver.py`: default, normalize, keeping unknown fields; rollback-safe, since 0.10.x ignores it). `night: null` means from Sleep times. `screens` is keyed by the shared account, since each shared screen signs in with its own account; two devices on one account share its entities (Settings says so).
- `planavista/household/settings/save` takes `screensaver_enabled`, `screensaver_after`, `screensaver_night` (`{from, to}` or null), and `screensaver_screen` `{user, screen, motion}` (parent level). Enabling it while no shared screen exists is refused `no_shared_screen`. A screen entity must be `light`, `switch`, `input_boolean`, `number`, or `input_number`; a motion entity `binary_sensor` or `input_boolean`; anything else is refused `invalid_entity`. A user that isn't a shared screen is refused `not_shared`.
- Unmarking a screen as shared drops its `screens` entry; unmarking the last one turns the screensaver off.
- The household view's `security` gains `screensaver`. Diagnostics show it with entity ids replaced by their domains.

### 3.2 The page-wide controller (card bundle)

Like kiosk mode, the screensaver belongs to the page, not the card: `shell/screensaver-controller.ts`, started from `main.ts`, follows `<home-assistant>`'s `hass` and the household subscription (shared with the kiosk controller's subscription, one per page).

- **Runs** when `account.shared && security.screensaver.enabled`. Otherwise it does nothing and holds nothing.
- **Idle clock:** `pointerdown`, `keydown`, and `wheel` anywhere on the document (capture) are touches. The motion entity's state is read from `hass.states`: `on` holds the clock; the change to `off` starts it. After `after_minutes`, the screensaver shows. The rule is pure (`core/screensaver.ts`: `idleUntil`, `shouldShow`).
- **Showing:** a full-screen `pv-screensaver` element is appended to `document.body` (outside `ha-card`, like the goal surprise's reveal), above everything, so Home Assistant's own header and sidebar are covered too when kiosk mode is off. Parent mode is locked as it shows (nobody is there). Open sheets and editors stay underneath, with their drafts.
- **Waking:** the first `pointerdown` or key on the screensaver closes it; the page then ignores that burst (`guardPageTaps()`), so a tap or its lifting click never presses what was beneath. A motion `on` closes it too. Waking at night turns the Screen entity back to what it was.
- **Wake Lock:** while it runs on a visible page the controller holds a Screen Wake Lock where the browser has one, so the device's own sleep doesn't cut in; released when the page hides or the setting goes off.
- **The Screen entity** (`core/screensaver.ts screenAction(domain, phase, before)`): while the day's screensaver shows, a `light` or `number`/`input_number` is dimmed to 40% of its range, a `switch` or `input_boolean` left on; at night a `light`, `switch`, or `input_boolean` is turned off and a `number`/`input_number` set to its minimum. On waking, the state it had before (on or off, its brightness or value) is restored. Calls go through `hass.callService` from the screen's own account; an unavailable entity or a refused call is skipped, and the drawn display carries on. Nothing is called when no entity is picked.

### 3.3 The scene (`pv-screensaver`)

Ported from mockup v4 (scratchpad screensaver/living-sky.html), as modules with pure rules under vitest:

- **Light** (`screensaver/sky.ts`): the sky's gradient, the ridges' tones, and the sun's or moon's glow from the minute of the day and the cloud cover (`lightAt`), between real sunrise and sunset from `sun.sun`'s `next_rising` and `next_setting` (the appearance's `sunOf`); without `sun.sun`, 7:00 AM and 7:00 PM. Re-lit once a minute, in steps too small to see.
- **Sun and moon** glide every frame from the clock to the second (`sunPos`); the moon's phase from the date.
- **Ridges** (`screensaver/ridges.ts`): six sheets drawn once to canvases (fractal edges from a fixed seed, fiber texture, lit and shaded faces, snowfields, tree line), redrawn only when the minute's light changes, in four groups that drift by transforms only (no blur, no filters), so a Pi 4 at 1920 by 1080 keeps its frame rate.
- **Weather** (`screensaver/weather.ts weatherScene(condition, coverage)`): from the PlanaVista weather entity's state and its `cloud_coverage` when given (else by condition): clear, partly cloudy, cloudy (more paper clouds, a flatter light), fog (two or three vellum patches), rain and pouring (streaks, one fog patch in the far valley), snow, sleet, hail, wind (clouds drift faster, still slow), and storms (lightning-rainy, lightning). Lightning is a soft flash with one faint bolt, never a strobe: at least 9 seconds apart, and none under Reduced motion.
- **Info:** the clock (12 or 24 hours, as the household's time format), "Thursday, October 15 · 60° Cloudy", and the Today card: the next three events today from the calendars this card's settings show (now, then next; "Nothing else today" when none) and one ring per person with chores today (their done of due, from the chores feed while chores are on). Without weather, events, or chores, their line or part is left out. The info sits in a safe corner and moves to another every 10 minutes, so nothing stays in one place on the screen for hours.
- **Night:** the scene dims to a near-black, warm sky with stars; drifting slows to a quarter; the card goes and only the clock stays, dimmer.
- **Motion and cost:** one `requestAnimationFrame` loop capped at 30 frames a second, stopped while the page is hidden; Reduced motion keeps the light and the clock and drops drifting, particles, and lightning.

### 3.4 Settings

Settings, PINs and parent mode, Shared screens:
- **Screensaver** switch, with the line "When nobody has touched a shared screen for a while, it shows the sky, the time, and today. A touch wakes it." Turning it on needs a shared screen (the section only shows once one exists).
- While it is on: **Comes on after** (2, 5, 10, 15, 30 min, as a segmented control); **Night** ("From Sleep times: 10:30 PM to 6:15 AM" with **Set its own times**, a pair of time fields, and back to From Sleep times); then one row per shared account ("Kitchen · No screen picked"), each pushing a page with **Screen** (an entity picker of the domains above, with a line on what it does by day and at night) and **Motion** (binary_sensor or input_boolean), and the note that devices signed in with one account share these.
- **Preview** ("Show it now") shows the screensaver on this screen at once, for a check; the same touch closes it.

## 4. Testing

- **Backend (pytest):** the normalizer (missing, partial, unknown values, a bad `after_minutes`, a night with bad times), settings save (each key, parent level, `no_shared_screen`, `invalid_entity` per domain, `not_shared`), unmarking a screen drops its entry and the last one turns it off, the view, diagnostics without entity ids.
- **Card (vitest):** `idleUntil` and `shouldShow` (touches, motion on and off, the setting off, a non-shared account), the night window (bedtimes past midnight, weekend nights, sleep hours, nobody with Sleep times, set times), `screenAction` for each domain by day, at night, and on waking (restoring off, a brightness, a value), `weatherScene` for every Home Assistant condition and coverage, `lightAt` against the mockup's values at dawn, noon, dusk, and midnight, `sunPos`, the moon's phase on known dates, lightning spacing, the info's corner steps; source checks that the scene uses only transforms and opacity for motion and that the waking tap goes through `guardPageTaps`.
- **Dev HA, scripted, red then green:** as Kitchen at 1920 by 1080 (the Planar), 1032 by 1376 (iPad), and 800 by 1280 (Android portrait), light and dark, Reduced motion; the idle clock and a touch that wakes without pressing a tile beneath; a motion `input_boolean` holding it off and waking it; a Screen `input_number` and `input_boolean` dimmed, turned off at night (night set to now), and restored; every weather condition through a template weather entity; frame time with CPU throttled four times (the Pi's budget: under 33 ms a frame); Dev's own login never shows it.

## 5. Out of scope

- Photos and slideshows (the roadmap's photo frame).
- Reading cameras or video; a camera becomes a motion sensor on its own device.
- Per-device settings beyond the shared account; controlling the device's own sleep or the iPad's Auto-Lock.
- Sounds.
