# Theme Customizer Design

**Date:** 2026-02-25
**Status:** Approved
**Approach:** Grouped controls accordion below base theme cards

## Problem

Users can pick from 4 preset themes (light, dark, minimal, vibrant), but cannot customize individual aspects like accent color, corner radius, or header gradient. The current system is all-or-nothing.

## Solution

Add a "Customize" accordion section below the existing 4 theme cards on the Theme page (page 2) of the settings panel. Users pick a base theme, then override specific grouped controls. Changes preview live on the calendar behind the settings panel.

## Data Model

Theme overrides are stored as a `theme_overrides` object inside the existing `display` config:

```typescript
display: {
  theme: 'dark',               // base theme name (existing field)
  theme_overrides: {            // NEW — partial overrides on top of base
    accent?: string;            // hex color for accent
    background?: string;        // hex color for bg (null = use base)
    header_style?: string;      // preset key or 'custom'
    header_custom?: string;     // hex color (only if header_style='custom')
    corner_style?: string;      // 'sharp' | 'rounded' | 'pill'
    shadow_depth?: string;      // 'none' | 'subtle' | 'bold'
  }
}
```

**Backward compatible:** If `theme_overrides` is missing or empty, behavior is identical to current (pure base theme).

**Backend:** No Python changes needed. The `save_config` service passes the full `display` dict through to `entry.data`.

## UI Layout

The Theme page (page 2 of the onboarding wizard / settings panel):

1. **Theme grid** (existing) — 4 base theme cards in a 2x2 grid
2. **Customize divider** (new) — collapsible section header, starts collapsed unless overrides exist
3. **Override controls** (new) — 5 grouped control sections:

### Controls

| Control | UI Element | Default | Maps to CSS Variables |
|---------|-----------|---------|----------------------|
| Accent Color | Color swatch picker (reuse `pv-color-swatch-picker`) | From base theme | `--pv-accent`, `--pv-accent-text` (auto), `--pv-today-bg` (auto) |
| Background | Dropdown: Base Default / Light / Dark / Custom + hex input | Base default | `--pv-bg`, `--pv-card-bg`, `--pv-card-bg-elevated`, `--pv-backdrop` |
| Header Style | Pill buttons with gradient previews: Purple-Blue / Teal / Sunset / Solid Accent / Solid Dark / Custom | From base theme | `--pv-header-gradient`, `--pv-header-text` |
| Corners | 3 pill buttons: Sharp (4px) / Rounded (12px) / Pill (20px) | Rounded | `--pv-radius`, `--pv-radius-lg`, `--pv-radius-sm` |
| Shadows | 3 pill buttons: None / Subtle / Bold | Subtle | `--pv-shadow`, `--pv-shadow-lg`, `--pv-shadow-xl` |

4. **Reset button** — "Reset to Base Theme" clears all overrides

### Auto-derivation

When user sets accent color:
- `--pv-accent-text`: White or dark text based on luminance contrast
- `--pv-today-bg`: Accent at 6% opacity

When user sets background:
- `--pv-text`, `--pv-text-secondary`, `--pv-text-muted`: Auto-derived for contrast
- `--pv-border`, `--pv-border-subtle`: Auto-derived from background
- `--pv-event-hover`: Auto-derived from background

## Theme Resolution Pipeline

```
Base theme (e.g. 'dark')
  → Load 25 --pv-* vars from themeVars['dark']
  → Apply grouped overrides on top
  → Auto-derive dependent vars (accent-text, today-bg, etc.)
  → Set all merged vars on host element via style.setProperty()
```

### New API in themes.ts

```typescript
interface ThemeOverrides {
  accent?: string;
  background?: string;
  header_style?: string;
  header_custom?: string;
  corner_style?: string;
  shadow_depth?: string;
}

function applyThemeWithOverrides(
  element: HTMLElement,
  baseTheme: ThemeName,
  overrides?: ThemeOverrides
): void;
```

This replaces the current `applyTheme()` call in the calendar card's `updated()` lifecycle.

## Live Preview

- As user adjusts any control, immediately call `applyThemeWithOverrides()` on the calendar card host element behind the settings panel
- On cancel, revert to saved override values
- The settings panel itself uses its own fixed styling, unaffected by preview changes

## Files to Modify

1. **`types.ts`** — Add `ThemeOverrides` interface, add `theme_overrides` to `DisplayConfig`
2. **`themes.ts`** — Add `applyThemeWithOverrides()`, add override resolution logic, add luminance/contrast utilities
3. **`onboarding-wizard.ts`** — Add customize accordion UI to page 2, add `_themeOverrides` state, wire up live preview dispatch
4. **`planavista-calendar-card.ts`** — Use `applyThemeWithOverrides()` in `updated()`, handle live preview events from wizard, remove debug console.logs
