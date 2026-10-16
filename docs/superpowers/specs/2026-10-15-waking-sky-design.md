# 0.13.0: new land each time, and a sky that wakes like a phone

Agreed with the owner on 2026-10-15. Builds on the screensaver (0.11.0) and the living sky and dimming (0.12.0).

## 1. Goals

- The living sky shows different land each time it opens, without losing the approved look.
- A shared screen behaves like a phone's lock screen: walking up lights it, only a touch opens the board, and when nobody has been near for a while it goes dark.
- Both waits are the household's to set.

## 2. New land each time (D1 to D3)

**D1. Seeds per sheet.** The land is six cut-paper sheets, each drawn from a seed (`Landscape {shapes, trees}` in `modules/screensaver/sky.ts`). `APPROVED_LANDSCAPE` is the land every screensaver drew before 0.13.0, and its shapes are pinned by a test.

**D2. Curated and random.** The two snowy ranges (sheet 1, the massif with the tallest peak, and sheet 2, the range in front of it) each pick from a short list the owner chose in the Mountain Picker (`TOP_SEEDS`, `SECOND_SEEDS`). The far hazy range, the tree-line range, the foothills, and the near hill take random seeds, and so do every sheet's trees. The rules that shape each sheet don't change: the number of peaks, the hero peak where the light sits (0.57 of the width), the snowlines, the seasons.

**D3. When.** `pickLandscape(random)` runs once when the screensaver opens (`pv-screensaver` makes its `SkyScene` with it). The land stays the same while it shows, through a rotation or a new season; the next showing picks again. Try it and Show it now pick too.

## 3. Waking like a phone (D4 to D10)

**D4. Stages.** While the screensaver shows it is in one of three stages (`SkyStage` in `core/screensaver.ts`):

| Stage | When | What shows |
|---|---|---|
| `rest` | the sky came on, nobody is in front of it, and the screen has a Motion sensor | the sky under a shade (`REST_SHADE`), about half as bright |
| `lit` | motion reads on, or the screen has no Motion sensor | the sky at the time of day's level (0.12.0's dimming) |
| `dark` | quiet for the screensaver wait plus the Dark wait | black: the Screen entity off where one is picked, else drawn black |

Quiet starts at the later of the last touch and motion going off (0.11.0's rule). The sky comes on at quiet + `after_minutes` (unchanged) and goes dark at quiet + `after_minutes` + `dark_minutes`; a walk-by while the sky shows starts only the dark wait over, from when they walk away (review m13 M2). Dark after Never (0) never goes dark. Once dark it stays dark until motion or a touch, whatever the settings do meanwhile (review m13 M1). A Motion sensor that drops out keeps its last reading, and someone in front of it when it dropped counts as having walked away then (review m13 I2); a new Motion pick starts from its own first reading.

**D5. Motion lights, touch opens.** Motion while the sky shows moves it to `lit` and never dismisses it (until 0.13.0 motion went straight to the board). When motion clears, the sky eases back to `rest`, and the dark wait counts from then. A touch anywhere, in any stage, opens the board at once and presses nothing (the 0.11.0 wake). Motion while the board shows keeps the sky away, as before.

**D6. Night.** The same stages at the night's level: lit is the night level (never full), rest is that under the shade, dark is dark. The Screen entity is no longer turned off as soon as the sky shows at night; it turns off at `dark`, day or night.

**D7. The Screen entity follows the stage.** Off (a light or switch) or its minimum (a number) once the fade to dark has played (`DARK_FADE_MS`); put back as it was on leaving dark (approach or touch) and on waking. The 0.11.0 rule that dimmed a light to 40% by day goes: the shade does that now, for every screen.

**D8. Eases.** The shade moves by opacity only (one layer over the scene and the info), so the frame loop doesn't redraw anything for it:
- rest to lit (someone walks up): `LIGHT_UP_MS` (0.8 s);
- lit to rest (they walk away): `SETTLE_MS` (4 s);
- to dark: `DARK_FADE_MS` (5 s), then the Screen goes off and the scene stops drawing;
- dark to lit with a Screen PlanaVista turned off: `PANEL_WAKE_MS` (6 s) on a slow-start curve from the turn_on, since a panel can take seconds to show a picture again (the kitchen's Planar 3.5 to 5 s, all at once); from a drawn dark, `LIGHT_UP_MS`;
- a touch: the board's 0.12.0 wake fade.

**D8a. A panel still waking.** A touch that wakes a dark whose Screen PlanaVista powered off (a light or switch, still off), or that comes within `PANEL_WAKE_MS` of someone walking up to one, keeps every press from the page until the panel has had time to show a picture (`blindMs`, `swallowWakingPress(..., atLeast)`), so nothing is pressed on a black screen (review m13 I1). The slow ease is for that panel only; a number at its minimum or a plug turned back on by hand eases quickly (review m13 M3).

**D9. The device's own sleep.** The wake lock is let go while the screen is dark (it used to be let go while the sky showed at night), so a tablet's own Auto-Lock may take over in the dark.

**D10. Previews.** Show it now and Try it show the sky lit and never rest or go dark while a parent is looking; once one becomes the real thing (left up for the wait, 0.11.0), the stages apply.

## 4. Settings (D11, D12)

**D11. Dark after.** Shared screens' Screensaver section gains Dark after under the screensaver wait: Never, 5, 10, 15, 30, or 60 minutes (`DARK_CHOICES`, default 10), counted from when the sky comes on, so any pair of waits works together. Stored as `security.screensaver.dark_minutes` (0 is Never), saved by settings/save `screensaver_dark`, sent in the view and diagnostics. The screensaver wait keeps its choices (1, 2, 5, 10, 15, 30).

**D12. Help.** New `screensaver_dark` (what it's for: a screen nobody is near goes dark; how it works: after the sky has shown this long it eases to dark and turns off the Screen if one is picked; walking up lights it again and a touch opens the board). `screensaver_motion` and `screensaver_screen` say what motion and the Screen do now.

## 5. Data and rollback

Adds one field, `dark_minutes`; unknown fields are kept; a step back to 0.12.0 ignores it and behaves as 0.12.0 did. No migration.

## 6. Testing

- `test/landscape.test.ts`: the approved land is unchanged; one seed changes one sheet; the hero stays put; trees move only with their own seed; `pickLandscape` takes the curated lists for sheets 1 and 2.
- `core/screensaver.ts` rules: `skyStage` table (rest, lit, dark; no motion sensor; Never; motion clearing restarts the dark wait); `screenAction` for dark and for waking.
- The controller: motion lights without waking; dark after the waits; the Screen goes off after the fade and comes back on approach and on a touch; the wake lock is let go in the dark; a preview never rests or goes dark.
- Backend: `dark_minutes` normalized and defaulted, `screensaver_dark` saved and refused when not a choice, view and diagnostics.
- On a review copy as Kitchen with a fake motion helper: the stages, eases, and Settings at phone width; the kitchen Pi after release.
