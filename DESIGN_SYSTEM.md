# PlanaVista Design System

The authoritative reference for all visual and interaction design decisions in PlanaVista. Every UI change must comply with these standards. No exceptions without documented rationale.

---

## 1. Design Principles

### 1.1 Calm Premium
The UI should feel like a high-end appliance, not a software tool. Generous whitespace, restrained color, no visual noise. If a border, shadow, or element doesn't serve a clear purpose, remove it.

### 1.2 Content Over Chrome
Events, times, and people are the content. Everything else (gridlines, borders, toolbars) recedes. The calendar color and typography do the heavy lifting.

### 1.3 Pastel Palette, Not Saturated
Calendar colors live in a curated pastel range. Every primary color has a paired light variant. Event blocks use the light variant as background with the primary as a left-edge accent. Never solid saturated blocks.

### 1.4 Touch-First, Keyboard-Accessible
Minimum 44px touch targets (Apple HIG standard). Every interactive element must have visible focus states for keyboard navigation.

### 1.5 Responsive Is Mandatory
Every component must render correctly from 320px (phone) to 2560px (ultrawide). No component ships without responsive behavior defined.

### 1.6 Motion With Purpose
Animations signal state changes: view transitions, dialog open/close, hover feedback. No decorative animation. Duration: 150–250ms. Easing: ease-out for entrances, ease-in for exits.

---

## 2. Color Palette

### 2.1 Curated Presets

Ten named color pairs. Primary is used for accent borders, avatar rings, and calendar identity marks. Light is used for event block backgrounds, all-day banners, and month view pills.

| #  | Name         | Primary   | Light     |
|----|--------------|-----------|-----------|
| 1  | **Ocean**    | `#4A90D9` | `#DCE8F5` |
| 2  | **Fire**     | `#FC6A05` | `#FEE6D1` |
| 3  | **Sage**     | `#6BA368` | `#E2F0E1` |
| 4  | **Lavender** | `#9B8EC4` | `#EDEBF5` |
| 5  | **Amber**    | `#D9A52B` | `#F7EDCF` |
| 6  | **Honey**    | `#CDCB2E` | `#F3F3DA` |
| 7  | **Rose**     | `#D4728C` | `#F5E4EA` |
| 8  | **Teal**     | `#4A9E9E` | `#DDF0F0` |
| 9  | **Slate**    | `#6B7A8D` | `#E8EAED` |
| 10 | **Graphite** | `#505050` | `#E8E8E8` |

### 2.2 Custom Colors

Users may choose a custom color via RGB picker. The "Custom..." option appears after the preset swatches in the config UI.

- Presets store both `color` and `color_light` explicitly (hand-tuned pairs).
- Custom colors auto-generate `color_light` via `color-mix(in srgb, [color] 12%, white)`.
- Dark theme adjusts to 15% mix for sufficient contrast on dark backgrounds.

### 2.3 Color Usage Rules

- All color references in CSS must use `--event-color` and `--event-color-light` variables. Never raw hex in component styles.
- Primary is used for: left accent border (3px), avatar ring, calendar dot in filter, event text contrast when needed.
- Light is used for: event block background fill, all-day banner fill, month view pill background.

---

## 3. Component Standards

### 3.1 Event Blocks

**Visual treatment (all views):**
- Left accent border: 3px, primary color, the calendar identity mark.
- Background fill: light variant, never the primary at full saturation.
- Text: `--pv-text` (dark), not the primary color. Readability first.
- No outer border or box shadow on event blocks.
- Border radius: 4px (subtle rounding, not pill-shaped).
- Hover: light variant darkens to 16% mix, subtle `translateY(-1px)`.
- Active: `scale(0.98)`.

**Event block anatomy:**
```
┌─────────────────────────────┐
│▌ Event Title                │   ▌ = 3px primary color accent
│▌ 2:00 PM – 3:00 PM         │   Background = light variant
│▌                    👤👤    │   Avatars for shared events (week only)
└─────────────────────────────┘
```

- Title: `--pv-text`, Body size (0.9375rem), weight 500.
- Time: `--pv-text-secondary`, Caption size (0.8125rem), weight 400.
- Padding: 6px 10px.

### 3.2 Grid and Visual Structure

- **No visible gridlines** in day or week view.
- Hour orientation: alternating subtle background tint on odd hours, `rgba(0,0,0,0.015)` on light themes, `rgba(255,255,255,0.02)` on dark.
- Now indicator: 2px line in `--pv-now-color` (`#EF4444`) with 10px circle at left edge, pulse animation (3s infinite).
- Column separators: 4px transparent gap, no border lines.
- Month view: thin 1px `--pv-border-subtle` cell borders are acceptable (grid structure is the content).
- Agenda view: no gridlines; date group headers with sticky positioning provide structure.

**Time gutter:**
- 60px width, fixed.
- Labels at hour marks only, right-aligned.
- Font: Overline size (0.6875rem), `--pv-text-muted`.
- No half-hour labels.

### 3.3 Typography Hierarchy

| Level    | Size      | Weight | Line Height | Use                                      |
|----------|-----------|--------|-------------|------------------------------------------|
| Display  | 3.5rem    | 300    | 1.1         | Clock only                               |
| H1       | 1.5rem    | 600    | 1.3         | Current date in header                   |
| H2       | 1.125rem  | 600    | 1.4         | Dialog titles, section headers           |
| Body     | 0.9375rem | 400    | 1.5         | Event titles, descriptions               |
| Caption  | 0.8125rem | 400    | 1.4         | Event times, secondary info              |
| Overline | 0.6875rem | 600    | 1.2         | Time gutter labels, weekday headers (uppercase, letterspaced) |

**Rules:**
- Never use more than 3 type levels in a single view.
- Use font weight for emphasis, not font size. Avoid size-based hierarchy within the same context.
- Font family: `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`.

### 3.4 Touch Targets and Spacing

- Minimum touch target: 44x44px (Apple HIG).
- Minimum spacing between interactive targets: 8px.
- Button padding: min 8px vertical, 16px horizontal.
- Input fields: 48px min-height.
- Icon buttons: 40x40px minimum (acceptable for secondary actions).
- Spacing scale: 4, 8, 12, 16, 24px. All gaps and padding should use these values.

### 3.5 Design Review Gate

Every UI change passes through three layers before committing.

**Layer 1 (Automated Checks):**
A design review agent scans changed files against measurable standards:
- Color tokens: Is every color using a `--pv-*` variable or palette preset? Flag raw hex.
- Touch targets: Are all interactive elements >= 44px?
- Typography: Is every font-size using one of the 6 defined levels? Flag arbitrary sizes.
- Responsive: Does every new/changed component have breakpoint rules?
- Event blocks: Is `color-mix` or `color_light` used for backgrounds? Flag raw primary fills.
- Spacing: Are gaps/padding using the spacing scale (4, 8, 12, 16, 24px)?

Pass/fail: failures block the commit with specific fix instructions.

**Layer 2 (Devil's Advocate Review):**
A separate agent reviews visual design decisions with a hostile eye:
- "Does this change add visual noise? Could it be simpler?"
- "Is this consistent with how the same pattern is handled elsewhere?"
- "Would this look good next to 5 other calendars in different colors?"
- "Does removing gridlines here make the view harder to scan?"
- "Is there sufficient contrast for accessibility (WCAG AA minimum)?"
- "On a 320px screen, does this still work?"

Verdict: **Approved**, **Approved with notes**, or **Needs revision** with specific reasons. Must find at least one concern or explicitly state why there are none.

**Layer 3 (Design Changelog):**
Every UI change gets an entry appended to `docs/design/CHANGELOG.md`:
```
## YYYY-MM-DD
### Changed: [component or area]
- Description of what changed and why
- Standards checked: [list]
- Review: [verdict]
```

---

## 4. Responsive Design

### 4.1 Width Breakpoints

| Name   | Width        | Typical Device                 |
|--------|--------------|--------------------------------|
| **xs** | 0–479px      | Phone portrait                 |
| **sm** | 480–767px    | Phone landscape, small tablet  |
| **md** | 768–1023px   | Tablet portrait                |
| **lg** | 1024–1439px  | Tablet landscape, small desktop|
| **xl** | 1440px+      | Desktop, ultrawide, wall display|

### 4.2 Height Breakpoints

| Name       | Height   | Behavior                                                                 |
|------------|----------|--------------------------------------------------------------------------|
| **short**  | 0–500px  | Collapse header to single compact row, time labels every 2 hours, 32px avatars |
| **medium** | 501–900px| Standard header, full hour labels, default avatar size                   |
| **tall**   | 901px+   | More time slots visible, larger event blocks, potential side panels      |

### 4.3 Combined Scenarios

| Scenario             | Width × Height | Example      | Adaptation                                                              |
|----------------------|---------------|--------------|-------------------------------------------------------------------------|
| Phone portrait       | xs + medium   | 390×844      | Single column, stacked list, icon-only tabs                             |
| Phone landscape      | sm + short    | 844×390      | Compact header (one row, no weather), max calendar space, swipe nav     |
| Tablet portrait      | md + tall     | 834×1194     | Full person lanes, expanded time view, more hours visible without scroll|
| Tablet landscape     | lg + medium   | 1194×834     | Full lanes, wider time gutter, standard header                          |
| Desktop              | xl + medium   | 1920×1080    | Full layout, generous spacing                                           |
| Wall display portrait| lg + tall     | 1080×1920    | Full lanes, show 16+ hours without scrolling, larger event blocks       |
| Wall display landscape| xl + short   | 2560×1080    | Use horizontal space for side-by-side panels (calendar + agenda)        |

### 4.4 View Behavior by Width

| View       | xs                                | sm                          | md                    | lg                       | xl                          |
|------------|-----------------------------------|-----------------------------|-----------------------|--------------------------|-----------------------------|
| **Day**    | Single column, no lanes: stacked list with color accent | Single column, swipe between people | Full person lanes with avatars | Full lanes, wider gutter | Full lanes, comfortable spacing |
| **Week**   | 3-day view, swipeable             | 5-day work week             | Full 7-day grid       | Full 7-day, larger blocks| Full 7-day, generous spacing|
| **Month**  | Dots for events, tap to expand    | Count + first event title   | Full pills with titles| Full pills, +N overflow  | Full pills, all visible     |
| **Agenda** | Full width, compact padding       | Full width                  | Max-width 720px centered | 720px centered         | 720px centered              |

### 4.5 Component Scaling

**Header:**
- xs/sm: Stack vertically, weather on top, date + nav below, tabs as icons only.
- xs + short / sm + short: Single compact row, no weather, icon-only tabs.
- md: Single row, compressed, 32px weather icon, abbreviated date.
- lg/xl: Full row, 48px weather icon, full date, labeled tabs.

**Event blocks:**
- xs: Title only, no time shown in block.
- sm: Title + time on same line if space allows.
- md+: Title on first line, time on second line.
- tall: Blocks can expand to show description preview.

**Typography scaling:**
- xs: Body 0.8125rem, H1 1.25rem, Display 2.5rem.
- sm: Body 0.875rem, H1 1.375rem, Display 3rem.
- md+: Standard scale per Section 3.3.

**Touch targets:**
- xs/sm: 48px minimum (phone fat-finger safety).
- md+: 44px minimum.

**Avatars:**
- short: 32px.
- medium: 48px.
- tall: 64px.

### 4.6 Mandatory Rules

1. **No horizontal scroll**: ever, at any breakpoint.
2. **No fixed-width containers**: flex and grid with relative units. The time gutter (60px) is the sole exception.
3. **Test at boundaries**: must look correct at exact breakpoint values (479px, 480px, 767px, 768px, etc.).
4. **Content over chrome**: at smaller breakpoints, remove UI elements before content. Hide labels before events. Collapse toolbars before shrinking the calendar.
5. **Height-aware layouts**: never assume viewport height. Use `dvh` (dynamic viewport height) where available, fall back to `vh`. Account for HA's 56px header.
6. **Orientation changes**: layout must reflow smoothly on device rotation without requiring a page reload.

---

## 5. PlanaVista-Specific Rules

### 5.1 Day View: Person Lanes

- Each visible calendar gets its own lane (column).
- Events are strictly contained within their lane: zero bleed into adjacent columns.
- Lanes separated by a 4px transparent gap, not a border.
- Overlapping events within the same lane stack side-by-side using fractional width of that lane only.
- Lane minimum width: 120px. Below this threshold, the view switches to single-column mode with swipe navigation between people.
- Column headers: avatar (or initial circle in calendar color) above person name.
- If a calendar has no `person_entity`, the header shows the calendar icon + display name.

### 5.2 Week View: Shared Events

- When the same event exists on multiple visible calendars (matched by `summary` + `start` + `end`), render it once.
- The single event block uses the source calendar's color for the accent.
- Small stacked avatars (24px, overlapping by 8px) in the bottom-right corner show all PlanaVista participants.
- More than 3 participants: show 2 avatars + a "+N" badge.
- Clicking the shared event opens the detail popup showing all linked calendars.
- If the user hides a participant's calendar via the filter, the avatar disappears but the event stays (as long as at least one linked calendar is visible).

### 5.3 Dialogs and Overlays

- All dropdowns and pickers use `position: fixed` to escape parent overflow.
- Smart placement: measure available space, flip above/below as needed.
- Modal overlay: `backdrop-filter: blur(4px)` with semi-transparent background.
- Dialog max-width: 480px, centered.
- Dialog entrance: `scale(0.95)` + fade in, 200ms.
- Dialogs must be fully usable at xs breakpoint (full-width, bottom-sheet style on phones).

### 5.4 Weather Widget

- Reads from `hass.states[weather_entity]`: `state`, `attributes.temperature`, `attributes.temperature_unit`.
- Animated SVG icons sized per breakpoint: 32px at md, 48px at lg+, hidden at xs+short.
- Condition text: capitalize, replace hyphens with spaces.
- If no weather entity configured, the space collapses: no placeholder or error shown.

### 5.5 State and Navigation

- View transitions: horizontal slide (left/right for day/week navigation), fade for view type changes.
- "Today" button always visible in toolbar: one tap to return to current date.
- Date banner appears when viewing any day other than today (non-clickable, informational).
- Auto-advance: at midnight, the view rolls forward to the new day.
- Swipe gestures: left/right for day navigation (xs/sm only), with momentum and snap.

### 5.6 Onboarding and Setup Flow

**HA Integration Step (minimal):**
The HA config flow performs zero configuration. A single confirmation step displays clear instructions:

```
PlanaVista has been installed successfully.

To complete setup:

1. Navigate to the dashboard where you want your calendar
2. Click the pencil icon (Edit Dashboard) in the top right
3. Click "+ Add Card" at the bottom
4. Search for "PlanaVista" and select it
5. Save the dashboard

The first time the card loads, a setup wizard will walk you through
choosing your calendars, colors, theme, and preferences.

That's it: click Submit to finish installation.
```

No form fields, no dropdowns. Click Submit → config entry created with empty defaults.

**First-Launch Onboarding Wizard (LitElement, in-card):**
The card detects `onboarding_complete !== true` and opens the wizard automatically.

- **Page 0, Reuse Config (conditional):** If existing PlanaVista configs are detected, offer a choice: "Start fresh" or "Use existing config" with a dropdown of available configs. Selecting an existing config skips the wizard entirely, card renders immediately. If no existing configs exist, this page is skipped.
- **Page 1 (Preferences):** Time format (12h/24h), weather entity, first day of week, default calendar view.
- **Page 2 (Calendars):** Auto-discovers all `calendar.*` entities. User selects which to include, assigns color from swatch grid (10 presets + "Custom..." picker), links to a person entity.
- **Page 3 (Theme):** Visual previews of each theme. Click to select, live preview updates behind the wizard.
- **Finish:** Config saved, wizard closes, card renders.

**Wizard UX rules:**
- Progress indicator at top (dots or step labels: 1 · 2 · 3).
- Back button on every page except the first.
- Each page validates before allowing Next (e.g., at least one calendar selected on Page 2).
- Smooth slide transitions between pages.
- Must be fully usable at xs breakpoint (phone).
- Follows all design standards in this document: typography, touch targets, spacing, colors.

### 5.7 Settings Access

**Gear icon in the card header** opens a settings panel built with the same LitElement components as onboarding:
- Pre-populated with current settings.
- Same pages: Preferences, Calendars, Theme.
- Changes save on close.
- Accessible at all breakpoints.

### 5.8 Card-Level Overrides

Global config is set during onboarding and accessible via the gear icon. Per-card overrides are optional and set in the card's YAML config:

```yaml
type: custom:planavista-calendar-card
# Overrides (optional, falls back to global config)
theme: dark
default_view: day
calendars:
  - calendar.work
hide_weather: true
hide_header: false
```

**Override behavior:**
- Any setting not specified in YAML falls back to global config.
- Gear icon shows which settings are overridden vs inherited.
- "Reset to default" option per setting.

---

## 6. Design Changelog

All UI changes are logged in `docs/design/CHANGELOG.md` with the following format:

```markdown
## YYYY-MM-DD
### [Added|Changed|Removed|Fixed]: [component or area]
- Description of what changed and why
- Standards checked: [list of relevant sections]
- Review verdict: [Approved | Approved with notes | Needs revision]
- Notes: [any reviewer comments]
```

---

## References

- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Fantastical](https://flexibits.com/fantastical): Premium calendar design inspiration
- [Linear](https://linear.app): Modern SaaS design reference
- [Notion Calendar](https://www.notion.so/product/calendar): Minimal calendar design reference
- [WCAG 2.1 AA](https://www.w3.org/WAI/WCAG21/quickref/): Accessibility contrast requirements
