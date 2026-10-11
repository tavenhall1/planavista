# PlanaVista Design System

The reference for how PlanaVista looks, moves, and reads, in every module. The calendar follows it today, and chores is built on it. When a change needs to break a rule here, change the rule here first and say why.

---

## 1. Principles

- **Warm, calm, encouraging.** It reads from across a kitchen, and it feels friendly to a 6-year-old without boring a teenager.
- **The signature is closing rings and rounded headings.** Each person's ring fills as their day gets done and closes with a check (rings arrive with chores). All the boldness is spent there; everything else stays quiet.
- **Content over chrome.** Events, times, and people are the content. Gridlines, borders, and toolbars recede; people's colors and the type do the work.
- **Apple-like, calm, and functional.** Design directives are guidance, not limits. When a directive would remove something useful, function wins and the design resolves the tension.

---

## 2. Layout

### 2.1 The card measures itself

The shell watches the card's own box, not the window or the device, and sets a `layout` attribute that every part styles against. The same card works full screen on a wall, in a dashboard column, or on a phone.

| Layout | Rule |
|---|---|
| Phone | narrower than 600 px |
| Portrait | 600 px or wider, and taller than wide |
| Landscape | 600 px or wider, and wider than tall |

- **Dead band:** while the aspect ratio is between 0.95 and 1.05, the previous layout is kept (the first measurement picks landscape), so split-screen sizes don't flip back and forth.
- **Keyboards:** while a text field in the card has focus, height-only shrinks are ignored. Kiosk browsers shrink the page when the keyboard opens, which would otherwise flip portrait to landscape mid-word.
- **Rotating keeps your place:** the view, the person, and the time at the top of the Day view stay put. The header, the module, and the bar are the same elements in every layout; only their order changes.
- **Reference sizes:** 1280 × 800 (landscape), 800 × 1280 (portrait, a typical 10-inch tablet), and 390 × 844 (phone).
- The calendar views still have a few window-width media queries for type sizes; they move to the card's own size in milestone 7.

### 2.2 Header and bar

| | Header | Bar |
|---|---|---|
| Landscape | One row: weather at the left, the date in the middle, the time at the right | Under the header: the module switcher, the module's views, and the gear |
| Portrait | A lock-screen clock and the date at the left; the weather with today's high and low at the right | Along the bottom edge, where hands already are |
| Phone | One compact row: the time, a short date, the temperature | Along the bottom edge |

- Switching modules never moves the controls. With only one module there is no switcher.
- `hide_header` hides the clock and weather header; the bar stays, because it holds the views and Settings.
- The header's type scales with the card's width (container query units), not the window's.

### 2.3 The calendar in each layout

- **Day:** person lanes in every layout. Landscape and phones keep 80 px an hour; portrait fits about 14 hours on screen (48 to 80 px an hour, from the view's own height). On a phone, the person chips at the top choose who shows.
- **Week:** days across: four in landscape, two in portrait, one on a phone.
- **Month:** each day shows as many whole events as its cell holds, measured from what the grid draws, then "+N more". Taller portrait cells show more.
- **Agenda** is already a portrait shape.

### 2.4 Sheets

- In portrait and on phones a sheet rises from the bottom, only as tall as its content, with a grab handle. A finger drags it down; letting go past 90 px, or flicking faster than 0.6 px per ms, closes it, and anything less springs back.
- In landscape a sheet is a centered card that pops in.
- A sheet leaves before it reports why it closed, so whatever happens next never fights the exit.
- The same sheets take both shapes; no screen gets a portrait-only version.

---

## 3. Type

- **Headings and numbers** use a rounded face: `ui-rounded` (SF Pro Rounded) on Apple devices, and everywhere else Nunito, bundled as a Latin-subset variable `woff2` in `frontend/dist/fonts` under the SIL Open Font License 1.1 (`OFL.txt` beside it). The face is declared once on the page, because a shadow root ignores `@font-face`. No web fonts are fetched.
- **Body text** uses the system font stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif`.
- Clocks, temperatures, and counters use tabular figures.
- Correction: earlier versions of this document named Inter, but no Inter file was ever bundled, so the card always rendered in the system font.

| Level | Use |
|---|---|
| Display | The portrait header's clock (scales with the card, 40 to 60 px) |
| Heading | Page titles, the date in the header, sheet headings (rounded, 700 to 800) |
| Body | Event titles, rows, descriptions (system, 0.9375rem) |
| Caption | Event times, summaries, help text (system, 0.8125 to 0.875rem) |
| Overline | Weekday names and hour labels (system, small, muted) |

---

## 4. Color

### 4.1 Every color has one job

| Color | Job |
|---|---|
| A person's color | who |
| Indigo (the accent) | something to act on: the chosen view, the main button, items waiting for an OK |
| Amber | time pressure |
| Red | overdue, missed, or sent back; destructive actions |

- **Color is never alone.** Every state also has words or a glyph, so the card still reads in grayscale.
- **Chroma shrinks as area grows.** Full color on avatars, the edge of an event, rings, and checks; rows, event fills, and done states use a pale tint.
- **Neutrals do most of the work:** plain surfaces, hairline borders, few shadows.

### 4.2 People's colors

Twenty presets in two palettes. Each has a color and a light fill for its events.

| Name | Color | Fill | Name | Color | Fill |
|---|---|---|---|---|---|
| Ink Black | `#001219` | `#A6ACAF` | Strawberry Red | `#F94144` | `#FDBDBE` |
| Dark Teal | `#005F73` | `#A6C7CE` | Pumpkin Spice | `#F3722C` | `#FBCEB5` |
| Dark Cyan | `#0A9396` | `#A9D9DA` | Carrot Orange | `#F8961E` | `#FDDAB0` |
| Pearl Aqua | `#94D2BD` | `#DAEFE8` | Atomic Tangerine | `#F9844A` | `#FDD4C0` |
| Wheat | `#E9D8A6` | `#F7F1E0` | Tuscan Sun | `#F9C74F` | `#FDEBC1` |
| Golden Orange | `#EE9B00` | `#F9DCA6` | Willow Green | `#90BE6D` | `#D8E8CC` |
| Burnt Caramel | `#CA6702` | `#ECCAA6` | Seaweed | `#43AA8B` | `#BDE1D6` |
| Rusty Spice | `#BB3E03` | `#E7BBA7` | Ocean Cyan | `#4D908E` | `#C1D8D7` |
| Oxidized Iron | `#AE2012` | `#E3B1AC` | Blue Slate | `#577590` | `#C4CFD8` |
| Brown Red | `#9B2226` | `#DCB2B3` | Cerulean | `#277DA1` | `#B3D2DE` |

A custom color gets its fill computed for it. In dark mode both are derived in OKLCH (section 5.3), so contrast is measured rather than eyeballed.

### 4.3 Text on color

`contrastText()` measures the WCAG contrast of white and of near-black `#1A1B1E` against the color and picks the higher one. The crossover sits near a relative luminance of 0.2. Letters on a person's color (initials, check marks, selected chips), on event fills, and on accent buttons all use it. Some mid-tone colors can't reach 4.5:1 with either; they get the better of the two.

### 4.4 Tokens

Every theme version sets the same custom properties on the card (`styles/theme-pairs.ts`); components use them and never raw colors.

| Token | Job |
|---|---|
| `--pv-bg`, `--pv-card-bg`, `--pv-card-bg-elevated` | The page, the card, and surfaces that come forward |
| `--pv-text`, `--pv-text-secondary`, `--pv-text-muted` | Text, quieter text, labels |
| `--pv-border`, `--pv-border-subtle` | Hairlines |
| `--pv-track`, `--pv-chip`, `--pv-seg`, `--pv-seg-on` | Ring tracks, chips, a segmented control and its chosen segment |
| `--pv-accent` | The accent as a fill (the chosen view, the main button) |
| `--pv-accent-text` | Text on an accent fill |
| `--pv-accent-ink` | The accent as text or a mark (links, back controls, focus rings): the same color in light, brighter in dark |
| `--pv-accent-tint`, `--pv-accent-tint-ink` | A pale accent fill and its text |
| `--pv-warn-bg`, `--pv-warn-ink` | Amber: time pressure, hard-to-read warnings |
| `--pv-bad-bg`, `--pv-bad-ink`, `--pv-danger` | Red: overdue, sent back, destructive |
| `--pv-star` | Stars |
| `--pv-today-bg`, `--pv-now-color`, `--pv-event-hover` | Today's highlight, the now line, an event under the pointer |
| `--pv-header-gradient`, `--pv-header-text`, `--pv-header-muted` | The header's fill and its text |
| `--pv-shadow`, `--pv-shadow-lg`, `--pv-shadow-xl` | Shadows, from the shape settings |
| `--pv-radius`, `--pv-radius-lg`, `--pv-radius-sm` | Corners, from the shape settings |
| `--pv-font-family`, `--pv-font-heading` | Body and heading faces |
| `--pv-backdrop`, `--pv-transition` | Sheet backdrops, the default transition |
| `--pv-motion` | `full` or `reduced` (section 7) |

---

## 5. Day and night

### 5.1 Light, Dark, and Automatic

Appearance is Light, Dark, or Automatic. Automatic switches:

- **At sunset and sunrise,** from Home Assistant's `sun.sun`, so every screen in the house changes at the same moment ("Dark at 6:31 PM tonight, light again at 7:12 AM"). Without the Sun integration it uses the schedule's times until Sun is set up, and says so.
- **On a schedule** ("Light from 7:00 AM", "Dark from 9:00 PM"), either way round midnight.
- **Matching Home Assistant:** each screen follows its own Home Assistant theme setting. Handy for phones.

`select.planavista_appearance` (Light, Dark, Automatic) lets an automation or a voice assistant change it.

### 5.2 The change itself

It uses the browser's View Transitions on the page itself. Home Assistant draws every card inside shadow roots, where a `view-transition-name` is never captured; only the cards change, so only they visibly move. A tiny page-level stylesheet, scoped by an attribute that exists only while a change runs, styles the transition's pseudo-elements, and the animations are taken away when it ends.

| Change | What you see |
|---|---|
| Automatic, toward night | Night falls from the top like the sky darkening, in about 2 seconds |
| Automatic, toward day | Day rises from the bottom like a sunrise, in about 2 seconds |
| By hand | The new look spreads out from the finger, in about half a second |
| Reduced motion | A quick fade (250 ms) |
| A hidden page, a page that just loaded or woke, a browser without View Transitions | It just switches |

- The sweep's mask is 210% tall with its edge between 47.6% and 52.4%, so the edge stays on screen for the whole sweep.
- **Never mid-touch:** an automatic change waits until nobody has touched the card for 10 seconds and no sheet, dialog, Settings, or setup is open.
- **Asleep screens just switch:** a screen that was dark at sunset wakes up already changed, and a page loaded after sunset starts dark with no replay.

### 5.3 Dark is designed, not inverted

- Surfaces get lighter as they come forward, instead of relying on shadows.
- People's colors keep their hue and brighten a little (OKLCH lightness at least 0.69), and the letters on them turn dark.
- Event fills become dark tints of the person's color (lightness 0.255, low chroma), with light text.
- Text drawn in the accent uses `--pv-accent-ink`, a brighter version that reads on dark surfaces.
- Tints, chips, warnings, and badges all have dark versions.

### 5.4 Themes come in pairs

- **PlanaVista** (1.1.0's Clean Light and Deep Dark as one theme), **Minimal**, and **Vibrant**, each with a light and a dark version. Each theme's picture shows both halves.
- **Customize** has a Light and a Dark color for the accent, the background, the header, and the now line. A dark color starts as **Matched**: derived from the light one in OKLCH, so it follows it. Setting it by hand overrides that; choosing Matched again goes back.
- **The contrast guard** flags a chosen color that would be hard to read, with a one-tap fix that brightens or darkens it just enough: 3:1 for lines and controls (the accent, the now line), 4.5:1 for text (on the background, on a solid header). The 1.1.0 header gradients were drawn for their white text and aren't judged.
- **Shape** is shared by both versions: corners (Sharp, Rounded, Pill), shadows (None, Subtle, Bold), events (Stripes, Solid), avatar border (Their color, White, Custom). Left unset, corners and shadows are the theme's own. "Reset to its original colors" restores a theme's colors and keeps the shape.

### 5.5 Upgrading from 1.1.0

| 1.1.0 | Becomes |
|---|---|
| Clean Light (`planavista`) | PlanaVista, Light |
| Deep Dark (`dark`) | PlanaVista, Dark |
| Minimal (`minimal`) | Minimal, Light |
| Vibrant (`modern`) | Vibrant, Light |

Customizations move to the version they were made for. The 1.1.0 keys (`theme`, `theme_overrides`) are rewritten beside the new ones on every save, so going back to 1.1.0 still draws a sensible card.

---

## 6. Status map

One map, used by every view, sensor description, and notification:

| State | Glyph | Words | Color |
|---|---|---|---|
| To do | empty circle | the estimate ("15 min") | neutral |
| Done | check in the member's color; title struck through | moves to "Done today" | member color |
| Waiting for OK | ⏳ | "Waiting for OK" (everywhere, even on picture tiles) | indigo |
| Sent back | ↩ | "Sent back: {note}" | red |
| Running out of days | dot | "2 days left" | amber |
| Last day, overdue | dot | "Last day", "Overdue since Mon" | red |
| Make-up | none | "From Mon" | neutral |
| Due date | none | "Due Sat" | neutral; amber on the day |
| Missed (history) | × | "Missed" | muted red |
| Excused | none | "Excused" | muted |
| Away | 🧳 | "Away · At Grandma's" | neutral |
| Ring closed | check badge on the ring | "Ring closed for today" | member color |

---

## 7. Motion

Motion is part of the product, Apple style, in every module.

- **It tracks the finger.** Hold to complete fills at a steady rate over 550 ms while the finger stays down, and rewinds on release or on a move of more than 12 px; a press shorter than 200 ms is a tap. Pointer capture keeps a gesture alive if a finger drifts off a small target, and the movement rule hands an intended scroll back to the page. The calendar's date swipe uses the same rule, so the gestures never fight.
- **Springs, not timers.** `spring(response, damping)` solves the damped-spring equation and samples it into CSS `linear()` easing, with SwiftUI's parameters:

| Preset | Spring | Settles in | For |
|---|---|---|---|
| Smooth | `spring(0.5, 0.86)` | 639 ms | glides: sheets rising, the reveal |
| Bouncy | `spring(0.45, 0.55)` | 900 ms | pops: a sheet springing back |
| Gentle | `spring(0.6, 0.9)` | 733 ms | large moves |

  Browsers without `linear()` get a plain ease of the same length.
- **Every animation answers "what just happened?"** A check draws itself, a title strikes through, numbers roll, rows glide to where they went.
- **Celebrations are earned.** The glow and burst play once, when a person's ring closes for the day, plus a family celebration when every ring closes.
- **Haptics** where the device allows (a light tick on completion, a richer one when a ring closes). **Sound** is an optional setting, off by default.
- **Reduced motion keeps the meaning.** A ring still fills, because it is the feedback, but pops, flights, glides, and sweeps become quick fades, and a wrong PIN fades instead of shaking. It follows PlanaVista's Motion setting (Follow the device, Full, Reduced), because kiosk tablets often hide the system setting. The card sets `--pv-motion`, which reaches into every shadow root.
- **Cheap to run.** Only transform, opacity, clip paths, masks, and stroke offsets animate, so older wall tablets stay smooth.
- **Keyboard.** Space or Enter does what a hold does, with the same feedback.

---

## 8. States

- **Skeletons, not spinners,** in the shape of what is loading.
- **Optimistic changes.** A check-off or an appearance change shows at once; if saving fails, it goes back, with a message that says what to do.
- **Designed empty and error states** that say what to do next.

---

## 9. Copy

- Sentence case. One name per thing ("Waiting for OK" is the only name for pending).
- No em dashes in product copy or public docs. The CI copy check (`scripts/check_copy.py`) enforces it.
- Destructive actions are confirmed by name ("Remove Casey's PIN?", "Reset PlanaVista to its original colors?").
- Every sub-screen has a back control naming its parent ("‹ Settings", "‹ Appearance"). A kiosk has no browser back button.
- Errors say what happened and what to do next, in plain words.

---

## 10. Accessibility

- Touch targets are at least 48 px, even where the drawn control is smaller.
- Rings and progress have text labels for screen readers ("Casey, 1 of 3 done today").
- Sheets are dialogs with a focus trap, Escape to close, and focus returned to where it came from.
- Choices are real radio groups: Tab reaches the chosen one, the arrow keys move the choice, and focus follows.
- Every hold has a keyboard equivalent, and reduced motion is respected.
- Text aims for WCAG AA against its own background (4.5:1, or 3:1 for large text and controls); `contrastText()` and the contrast guard measure it rather than guess. Muted labels (hours, weekday names) sit near 3:1 today and are the known exception.

---

## 11. Components

### 11.1 The glance header

`pv-glance-header`: the clock, the date, and the weather, laid out per section 2.2. Tapping the weather opens Home Assistant's own details for the weather entity. The minute changes without re-rendering anything else. Glance chips ("9 of 17 chores done today") arrive with chores.

### 11.2 The bar

`pv-nav-bar`: the module switcher (when there is more than one module), the module's views, and the gear. Every control is at least 48 px to the touch, with a smaller pill drawn inside. The gear fires from itself, so focus returns to it when a sheet it opened closes.

### 11.3 Sheets

`pv-pin-sheet` (the keypad: tap your face, then your PIN; digits never reach the page) and `pv-notice-sheet` (a short message with buttons). Both move per section 2.4 and section 7, and fire their events after they've left.

### 11.4 Event blocks

```
┌─────────────────────────────┐
│▌ Event title                │   ▌ = a 3 px edge in the person's color
│▌ 2:00 PM – 3:00 PM          │   fill = the person's tint
│▌                    👤👤    │   avatars for shared events
└─────────────────────────────┘
```

- The edge is the person's color; the fill is their tint, never the full color; the text is `contrastText()` of the fill.
- Shared events (Stripes) fill with each person's tint in turn; Solid draws the card's surface with the edge.
- No outer border or shadow. Hover lifts by 1 px; pressing scales to 0.98.
- In Month, titles are one line with an ellipsis, so every row is the same height and a day can count how many fit.

### 11.5 The Day view's person lanes

- Each visible calendar gets its own lane. Events stay inside their lane; overlapping events share the lane's width.
- Lanes are separated by a gap, not a border. No gridlines: odd hours get a faint band.
- Column headers show the avatar (or an initial in the person's color) above the name.
- The now line is 2 px in `--pv-now-color`.
- A date banner shows when the view isn't today.

### 11.6 Week's shared events

- The same event on several visible calendars (the same title, start, and end) renders once, with the organizer's color on the edge.
- Small stacked avatars show every PlanaVista participant; past four, a "+N" badge.
- Tapping it opens the details with every linked calendar. Hiding one person's calendar removes their avatar but keeps the event while another linked calendar shows.

### 11.7 The weather

- From `hass.states[weather_entity]`: the condition and the temperature; the forecast (today's high and low, the days in Week and Agenda) from one subscription per card, which comes back after Home Assistant restarts.
- Fifteen animated icons. The condition text is capitalized, with hyphens as spaces.
- Without a weather entity the space collapses, with no placeholder.

### 11.8 Card options

Settings are saved for the whole household; a card's YAML can override some for that card:

```yaml
type: custom:planavista-card
default_view: day
modules: [calendar]
theme: minimal
hide_weather: true
hide_header: false
```

- `planavista-card` is the card's newer name; `planavista-calendar-card` keeps working.
- `theme`: `light` or `dark` fixes the card to PlanaVista Light or Dark; a theme name (`planavista`, `minimal`, `vibrant`) picks the theme and follows the household's Light, Dark, or Automatic.
- `hide_header` hides the clock and weather header; the bar stays.
- Anything not set in YAML follows the household's settings.

---

## 12. Design changelog

### 2026-10-10: Changed: the new look (1.2.0)

- The header and the bar: one row in landscape; a lock-screen clock and a bottom bar in portrait and on phones; the card lays itself out by its own size.
- Day and night: Light, Dark, and Automatic (sun, schedule, or Home Assistant), with night falling from the top, day rising from the bottom, and a reveal from the finger; themes in pairs with Customize, Matched dark colors, and the contrast guard; `select.planavista_appearance`.
- The rounded face: Nunito bundled for headings and numbers where SF Pro Rounded isn't available.
- The `contrastText()` fix: it measures contrast instead of switching at a luminance of 0.4.
- Sheet motion: springs, drag to dismiss, and Reduced motion.
- The calendar in portrait: Day fits about 14 hours, Month fits what its cells hold, Week shows two days across.

---

## References

- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [WCAG 2.2](https://www.w3.org/WAI/WCAG22/quickref/): contrast and target-size requirements
- [View Transitions](https://developer.mozilla.org/docs/Web/API/View_Transition_API)
- [OKLCH and OKLab](https://bottosson.github.io/posts/oklab/)
