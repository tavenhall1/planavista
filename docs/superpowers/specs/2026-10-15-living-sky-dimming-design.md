# The living sky, dimming, and help in Settings (0.12.0)

Status: approved in chat, 2026-10-15, through three mockups (the living sky, dimming, and the Shared screens page). This document records the decisions; the mockups are the visual reference.

## 1. Why

The screensaver (0.11.0) works, but it comes in all at once and sits still on a calm day. Wall screens can't dim themselves (the kitchen's Planar has only on and off), so at night a lit screen lights up the room. Settings has grown: the screensaver lives inside PINs and parent mode, and many settings have no word on what they do.

## 2. Decisions

- D1. The living sky follows the approved mockup (version 15): a slow entrance, calm-day life, more weather, seasons on the land, fireflies, and the moon as a lit sphere.
- D2. Drawn dimming on shared screens only: PlanaVista draws its own colors darker and warmer. No layer over the card, no filter over the card, no hardware.
- D3. Two levels: Brightness by day (100, 85, 70%) and Brightness at night (100, 50, 30, 15, 8%), defaults 100% and 30%. 100% at night means no dimming.
- D4. The evening fade runs 30 minutes and ends as night begins; the morning comes back up over 10 minutes as night ends. Night is the screensaver's night (Sleep times, or its own times).
- D5. A touch at night keeps the night level.
- D6. A Shared screens page of its own, after Appearance: This screen, Night, Kiosk mode, Screensaver, Dimming. PINs and parent mode keeps PINs, Shuffle the keypad, and the lock times.
- D7. Try it: show the screensaver now at another time of day, in other weather, or in another season. Nothing is saved; a touch ends it. Tapping a brightness level shows it on this screen for a few seconds.
- D8. No on and off switches for the sky's parts. The household's Motion setting is the one dial.
- D9. A ? on every Settings item opens a short explainer in place under it: What it's for, and How it works.
- D10. The clock may pass in front of the sun or moon (the owner likes it); the corners keep moving every 10 minutes as before.

## 3. Design

### 3.1 Storage (backend)

`security.screensaver.dim = {day, night}`, whole percents. `normalize_screensaver` resets an unknown level to the default and keeps unknown fields, so 0.11.2 keeps the field on a step back. `planavista/household/settings/save` takes `dim_day` (100, 85, 70) and `dim_night` (100, 50, 30, 15, 8) at parent level, checked with everything else before anything changes. The view and diagnostics carry `dim`.

### 3.2 The level (card, `core/dimming.ts`, pure)

- `dimLevel(now, members, night, dim)` gives the level as a fraction: the day level, the night level in the night window (last night's or tonight's), and the fades between. Fades run evenly by eye: interpolated in the cube root of the level, eased with smoothstep.
- `dimColor(hex, level, text)` scales a color in linear light by the level; text scales by the square root of the level, so it stays readable (5:1 at 8% in the dark PlanaVista look). It turns warmer as it dims: green down to 87% and blue to 58% at the darkest, nothing at full.
- `dimTokens(tokens, level)` dims every color in the theme's tokens (hex and rgba, inside gradients too); the text tokens use the text rule.
- `mediaBrightness(level)` is the CSS brightness that scales a picture's light by the level (photos, emoji pictures, weather icons).
- `DIM_STEP_MS` (15 s): during a fade the card repaints this often; each step is too small to see.

### 3.3 Painting it

`AppearanceController` takes the level from the card on a shared screen (1 elsewhere) and paints `dimTokens(themeTokens(...))`, `--pv-dim` and `--pv-dim-media`. During a fade it looks again every 15 s. Modules get `dim` beside `mode`, and people's colors come from `memberColor(member, mode, dim)` and `withModeColors(data, mode, members, dim)`. A preview (`pv-dim-preview` from Settings, level and milliseconds) overrides the level on that card until it ends. The screensaver multiplies its light model's colors by the level and dims its words by the text rule.

### 3.4 The living sky (`modules/screensaver/`)

The changes between mockup versions 4 and 15, ported into `SkyScene`:
- Entrance (PACE 1.6, about 4.5 s): the sky fades over the card, ranges rise far to near on springs with their mist, the sun or moon swings up, clouds slide in, the clock drops with a bounce and the day's words follow, the card drops and swings on its pegs, a rainbow already out comes last. Waking is a 260 ms fade. Reduced motion: one fade.
- Calm-day life (Motion Full only): the sun's rays turn once in 4 minutes, the sun and its glow breathe over 7 s, at least three puffs drift, ranges sway 6 to 28 px on 95 to 120 s cycles, paper birds every few minutes by day, rare shooting stars at night.
- Weather: Windy (Home Assistant's windy and windy-variant) races the clouds in gusts and birds glide; after rain (the page remembers when it last rained, `planavista.rainAt`) a paper rainbow shows by day for about 20 minutes.
- Seasons on the land by month and hemisphere (Home Assistant's latitude): broadleaf trees among the pines on the two nearer sheets (38% and 46%), fresh green and blossom in spring, deep green in summer, orange, red, and gold in autumn, bare in winter with snow on the pines, the near ground, and more on the peaks; the ground tints by season.
- Fireflies: 14 small lights low among the near trees on dry summer evenings; CSS animations only, moving with the near hill.
- The moon: one sphere lit from the sun's side for tonight's phase, its terminator soft and its rim sharp, on a solid disc of night sky with a soft edge so no star shows through; clouds dim it by its colors.

### 3.5 Try it

`screensaver.preview(now, trial)` with `trial = {time?, weather?, season?}`: time is morning (sunrise plus an hour), afternoon (3 PM), evening (sunset), or night (11 PM); weather is a Home Assistant condition (`after_rain` shows the rainbow); season replaces the month's. The scene takes the trial in place of the facts until it closes.

### 3.6 Settings

- `shell/settings/screens-page.ts` (`pv-settings-screens`, id `screens`, group `appearance`, order 450): This screen (the shared switch, which still asks a parent's PIN), Night, Kiosk mode and Top bar (admins), Screensaver (Comes on after, each screen's Screen and Motion, Try it, Show it now), Dimming. Its summary names this screen and the screensaver. The PIN page keeps PINs, Shuffle, and the lock times; everything that opened `pins` for these opens `screens`.
- Help: `core/help.ts` holds one entry per setting (`HELP[id] = {what, how}`); `HelpState` (a controller per page) remembers which are open; `helpButton(state, id, name)` draws the ? (a 24 px circle in a 44 px target, `aria-expanded`, `aria-controls`, "About {name}"), `helpBox(state, id)` the explainer under the row. A test reads every Settings source file and checks that each id it uses has an entry and each entry is used. Hints that describe the current setting stay visible; explanations move into the ?.

## 4. Testing

Backend: normalizing and saving the levels, refusals, a refused save changes nothing, the view and diagnostics. Card (vitest): `dimLevel` across the evening fade, night, the morning, midnight and Sleep-time nights; `dimColor` and `dimTokens` (text floor, warmth, rgba and gradients, contrast at 8%); trial inputs; the season by hemisphere; the rainbow window; the help table against the source. On the dev HA: the Kitchen account at 1280 by 800 and 800 by 1280 through an evening fade (clock skewed), the screensaver's entrance, Try it, and the ? on every page.

## 5. Out of scope

Per-feature switches (D8), dimming on devices that aren't shared screens, hardware dimming, keeping each view's DOM alive (task 125).
