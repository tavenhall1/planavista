# Theme Customizer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let users pick a base theme then customize accent color, background, header style, corner roundness, and shadow depth via grouped controls in the settings panel, with live preview.

**Architecture:** Extend the existing theme system (`themes.ts`) with an override resolution layer. Add a collapsible "Customize" section to the Theme page in the onboarding wizard. Wire live preview via a new CustomEvent from wizard to calendar card host element.

**Tech Stack:** TypeScript, LitElement/Lit 3.x, CSS Custom Properties

---

### Task 1: Add ThemeOverrides type and update DisplayConfig

**Files:**
- Modify: `custom_components/planavista/frontend/src/types.ts`

**Step 1: Add ThemeOverrides interface and update DisplayConfig**

Add `ThemeOverrides` interface before `DisplayConfig`, then add `theme_overrides?` field to `DisplayConfig`:

```typescript
export interface ThemeOverrides {
  accent?: string;            // hex color for accent
  background?: string;        // hex color for bg override
  header_style?: string;      // preset key: 'gradient_purple' | 'gradient_teal' | 'gradient_sunset' | 'solid_accent' | 'solid_dark' | 'custom'
  header_custom?: string;     // hex color (only used when header_style='custom')
  corner_style?: string;      // 'sharp' | 'rounded' | 'pill'
  shadow_depth?: string;      // 'none' | 'subtle' | 'bold'
}

export interface DisplayConfig {
  time_format: '12h' | '24h';
  weather_entity: string;
  first_day: 'monday' | 'sunday';
  default_view: 'day' | 'week' | 'month' | 'agenda';
  theme: string;
  theme_overrides?: ThemeOverrides;
}
```

**Step 2: Commit**

```bash
git add custom_components/planavista/frontend/src/types.ts
git commit -m "feat(theme): add ThemeOverrides type to DisplayConfig"
```

---

### Task 2: Add override resolution engine to themes.ts

**Files:**
- Modify: `custom_components/planavista/frontend/src/styles/themes.ts`

This task adds the core logic: a function that merges base theme variables with user overrides, including auto-derived values for contrast and opacity variants.

**Step 1: Add luminance utility and override constants**

Add after the existing imports and before `CALENDAR_COLORS`:

```typescript
/** Relative luminance of a hex color (0–1). */
function luminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const toLinear = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** Returns '#FFFFFF' or '#1A1B1E' for best contrast against bg. */
function contrastText(bgHex: string): string {
  return luminance(bgHex) > 0.4 ? '#1A1B1E' : '#FFFFFF';
}

/** Convert hex to rgba string. */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Derive muted/secondary variants from a base text color. */
function deriveTextScale(textHex: string): { secondary: string; muted: string } {
  const isLight = luminance(textHex) > 0.5;
  if (isLight) {
    return { secondary: '#909296', muted: '#5C5F66' };
  }
  return { secondary: '#6B7280', muted: '#9CA3AF' };
}

/** Derive border colors from background. */
function deriveBorders(bgHex: string): { border: string; borderSubtle: string } {
  const isLight = luminance(bgHex) > 0.5;
  if (isLight) {
    return { border: '#E5E7EB', borderSubtle: '#F3F4F6' };
  }
  return { border: '#373A40', borderSubtle: '#2C2E33' };
}

// Corner style presets
const CORNER_PRESETS: Record<string, { radius: string; radiusLg: string; radiusSm: string }> = {
  sharp:   { radius: '4px',  radiusLg: '6px',  radiusSm: '2px' },
  rounded: { radius: '12px', radiusLg: '16px', radiusSm: '8px' },
  pill:    { radius: '20px', radiusLg: '24px', radiusSm: '14px' },
};

// Shadow depth presets
const SHADOW_PRESETS: Record<string, { shadow: string; shadowLg: string; shadowXl: string }> = {
  none: {
    shadow: 'none',
    shadowLg: 'none',
    shadowXl: 'none',
  },
  subtle: {
    shadow: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
    shadowLg: '0 10px 25px rgba(0, 0, 0, 0.08), 0 4px 10px rgba(0, 0, 0, 0.04)',
    shadowXl: '0 20px 40px rgba(0, 0, 0, 0.12)',
  },
  bold: {
    shadow: '0 2px 8px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)',
    shadowLg: '0 12px 32px rgba(0, 0, 0, 0.18), 0 6px 14px rgba(0, 0, 0, 0.1)',
    shadowXl: '0 24px 48px rgba(0, 0, 0, 0.24)',
  },
};

// Header gradient presets
const HEADER_PRESETS: Record<string, { gradient: string; text: string }> = {
  gradient_purple: { gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', text: '#FFFFFF' },
  gradient_teal:   { gradient: 'linear-gradient(135deg, #0D9488 0%, #2563EB 100%)', text: '#FFFFFF' },
  gradient_sunset: { gradient: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)', text: '#FFFFFF' },
  solid_accent:    { gradient: '', text: '#FFFFFF' },  // filled at resolve time from accent
  solid_dark:      { gradient: '#1A1B1E', text: '#FFFFFF' },
};
```

**Step 2: Add `applyThemeWithOverrides` function**

Add after the existing `applyTheme` function:

```typescript
import { ThemeOverrides } from '../types';

/**
 * Apply theme with optional overrides. Merges base theme + grouped overrides,
 * auto-deriving dependent variables.
 */
export function applyThemeWithOverrides(
  element: HTMLElement,
  baseTheme: ThemeName,
  overrides?: ThemeOverrides | null,
): void {
  // Start with base theme
  const base = themeVars[baseTheme] || themeVars.light;
  const merged: Record<string, string> = { ...base };

  if (overrides) {
    // Accent color
    if (overrides.accent) {
      merged['--pv-accent'] = overrides.accent;
      merged['--pv-accent-text'] = contrastText(overrides.accent);
      merged['--pv-today-bg'] = hexToRgba(overrides.accent, 0.06);
    }

    // Background
    if (overrides.background) {
      merged['--pv-bg'] = overrides.background;
      // Derive card-bg as slightly elevated
      const bgLum = luminance(overrides.background);
      if (bgLum > 0.5) {
        merged['--pv-card-bg'] = '#FFFFFF';
        merged['--pv-card-bg-elevated'] = '#FFFFFF';
      } else {
        // Dark: lighten slightly for cards
        const r = parseInt(overrides.background.slice(1, 3), 16);
        const g = parseInt(overrides.background.slice(3, 5), 16);
        const b = parseInt(overrides.background.slice(5, 7), 16);
        const lighten = (v: number, amt: number) => Math.min(255, v + amt);
        merged['--pv-card-bg'] = `#${lighten(r, 12).toString(16).padStart(2, '0')}${lighten(g, 12).toString(16).padStart(2, '0')}${lighten(b, 12).toString(16).padStart(2, '0')}`;
        merged['--pv-card-bg-elevated'] = `#${lighten(r, 20).toString(16).padStart(2, '0')}${lighten(g, 20).toString(16).padStart(2, '0')}${lighten(b, 20).toString(16).padStart(2, '0')}`;
      }
      // Derive text and border colors
      merged['--pv-text'] = contrastText(overrides.background);
      const textScale = deriveTextScale(merged['--pv-text']);
      merged['--pv-text-secondary'] = textScale.secondary;
      merged['--pv-text-muted'] = textScale.muted;
      const borders = deriveBorders(overrides.background);
      merged['--pv-border'] = borders.border;
      merged['--pv-border-subtle'] = borders.borderSubtle;
      merged['--pv-event-hover'] = luminance(overrides.background) > 0.5
        ? 'rgba(0, 0, 0, 0.03)'
        : 'rgba(255, 255, 255, 0.04)';
      merged['--pv-backdrop'] = luminance(overrides.background) > 0.5
        ? 'rgba(0, 0, 0, 0.3)'
        : 'rgba(0, 0, 0, 0.6)';
    }

    // Header style
    if (overrides.header_style) {
      if (overrides.header_style === 'custom' && overrides.header_custom) {
        merged['--pv-header-gradient'] = overrides.header_custom;
        merged['--pv-header-text'] = contrastText(overrides.header_custom);
      } else if (overrides.header_style === 'solid_accent') {
        const accent = overrides.accent || merged['--pv-accent'];
        merged['--pv-header-gradient'] = accent;
        merged['--pv-header-text'] = contrastText(accent);
      } else {
        const preset = HEADER_PRESETS[overrides.header_style];
        if (preset) {
          merged['--pv-header-gradient'] = preset.gradient;
          merged['--pv-header-text'] = preset.text;
        }
      }
    }

    // Corner style
    if (overrides.corner_style && CORNER_PRESETS[overrides.corner_style]) {
      const corners = CORNER_PRESETS[overrides.corner_style];
      merged['--pv-radius'] = corners.radius;
      merged['--pv-radius-lg'] = corners.radiusLg;
      merged['--pv-radius-sm'] = corners.radiusSm;
    }

    // Shadow depth
    if (overrides.shadow_depth && SHADOW_PRESETS[overrides.shadow_depth]) {
      const shadows = SHADOW_PRESETS[overrides.shadow_depth];
      merged['--pv-shadow'] = shadows.shadow;
      merged['--pv-shadow-lg'] = shadows.shadowLg;
      merged['--pv-shadow-xl'] = shadows.shadowXl;
    }
  }

  // Apply all merged vars
  for (const [key, value] of Object.entries(merged)) {
    element.style.setProperty(key, value);
  }
  _appliedThemeCache.set(element, `${baseTheme}:${JSON.stringify(overrides || {})}` as any);
}
```

**Step 3: Update the cache to handle overrides**

The `_appliedThemeCache` currently stores `ThemeName` but we need it to detect override changes too. Change the cache type:

```typescript
// Replace the existing cache line:
const _appliedThemeCache = new WeakMap<HTMLElement, string>();
```

And update `applyTheme` to stringify its cache key:

```typescript
export function applyTheme(element: HTMLElement, theme: ThemeName = 'light'): void {
  const cacheKey = theme;
  const cached = _appliedThemeCache.get(element);
  if (cached === cacheKey) {
    return;
  }
  const vars = themeVars[theme] || themeVars.light;
  for (const [key, value] of Object.entries(vars)) {
    element.style.setProperty(key, value);
  }
  _appliedThemeCache.set(element, cacheKey);
}
```

**Step 4: Export the new functions and presets for use by wizard**

```typescript
export { HEADER_PRESETS, CORNER_PRESETS, SHADOW_PRESETS };
```

**Step 5: Remove debug console.log statements**

Remove the `console.log('[PlanaVista] applyTheme:', ...)` line from `applyTheme`.

**Step 6: Commit**

```bash
git add custom_components/planavista/frontend/src/styles/themes.ts
git commit -m "feat(theme): add override resolution engine with auto-derived colors"
```

---

### Task 3: Wire calendar card to use overrides

**Files:**
- Modify: `custom_components/planavista/frontend/src/cards/planavista-calendar-card.ts`

**Step 1: Update imports**

Change the import line from:
```typescript
import { applyTheme, resolveTheme, clearThemeCache } from '../styles/themes';
```
to:
```typescript
import { applyTheme, resolveTheme, clearThemeCache, applyThemeWithOverrides } from '../styles/themes';
```

Also add import for `ThemeOverrides`:
```typescript
import { CalendarEvent, CalendarConfig, DisplayConfig, WeatherCondition, PlanaVistaCardConfig, ThemeOverrides } from '../types';
```

**Step 2: Update `updated()` to use overrides**

Replace the current `updated()` method. Remove the debug `console.log` line and use `applyThemeWithOverrides`:

```typescript
updated(changedProps: PropertyValues) {
  super.updated(changedProps);
  if (changedProps.has('hass') || changedProps.has('_config') || changedProps.has('_settingsOpen')) {
    const data = getPlanaVistaData(this.hass, this._config?.entity);
    const theme = resolveTheme(this._config?.theme, data?.display?.theme);
    const overrides = data?.display?.theme_overrides || null;
    applyThemeWithOverrides(this, theme, overrides);
  }
}
```

**Step 3: Add live preview event handler**

Add a handler for a new `theme-preview` event from the wizard that applies overrides in real-time without saving:

```typescript
private _onThemePreview(e: CustomEvent<{ theme: string; overrides: ThemeOverrides }>) {
  const { theme, overrides } = e.detail;
  const resolved = resolveTheme(theme);
  applyThemeWithOverrides(this, resolved, overrides);
}
```

**Step 4: Wire the preview event on the wizard element**

In the render method where `<pv-onboarding-wizard>` is rendered, add the event listener:

Find the wizard rendering block and add `@theme-preview`:

```typescript
<pv-onboarding-wizard
  .hass=${this.hass}
  mode="settings"
  .config=${data}
  @settings-save=${this._onSettingsSave}
  @settings-close=${this._onSettingsClose}
  @theme-preview=${this._onThemePreview}
></pv-onboarding-wizard>
```

**Step 5: Commit**

```bash
git add custom_components/planavista/frontend/src/cards/planavista-calendar-card.ts
git commit -m "feat(theme): wire calendar card to use theme overrides + live preview"
```

---

### Task 4: Add Customize accordion UI to onboarding wizard

**Files:**
- Modify: `custom_components/planavista/frontend/src/components/onboarding-wizard.ts`

This is the largest task — adds the customize section to theme page 2.

**Step 1: Add state properties for overrides**

Add after the existing `_theme` state:

```typescript
// Page 2 — Theme customization overrides
@state() private _themeOverrides: ThemeOverrides = {};
@state() private _customizeOpen = false;
```

Add the import for ThemeOverrides at top of file:
```typescript
import { ThemeOverrides } from '../types';
```

**Step 2: Update `_initFromConfig()` to load saved overrides**

Add to the end of `_initFromConfig()`:

```typescript
this._themeOverrides = display.theme_overrides ? { ...display.theme_overrides } : {};
this._customizeOpen = Object.keys(this._themeOverrides).length > 0;
```

**Step 3: Add live preview dispatch method**

```typescript
private _dispatchThemePreview() {
  this.dispatchEvent(new CustomEvent('theme-preview', {
    detail: {
      theme: this._theme,
      overrides: Object.keys(this._themeOverrides).length > 0 ? this._themeOverrides : null,
    },
    bubbles: true,
    composed: true,
  }));
}
```

**Step 4: Update theme card click to also dispatch preview**

In `_renderPage2()`, change the theme card click handler from:
```typescript
@click=${() => { this._theme = t.key; }}
```
to:
```typescript
@click=${() => { this._theme = t.key; this._dispatchThemePreview(); }}
```

**Step 5: Add override handler methods**

```typescript
private _setOverride(key: keyof ThemeOverrides, value: string | undefined) {
  if (value === undefined || value === '') {
    const { [key]: _, ...rest } = this._themeOverrides;
    this._themeOverrides = rest as ThemeOverrides;
  } else {
    this._themeOverrides = { ...this._themeOverrides, [key]: value };
  }
  this._dispatchThemePreview();
}

private _resetOverrides() {
  this._themeOverrides = {};
  this._dispatchThemePreview();
}
```

**Step 6: Add `_renderCustomize()` method**

Add this method to render the customize accordion below the theme grid:

```typescript
private _renderCustomize() {
  const ov = this._themeOverrides;
  const hasOverrides = Object.keys(ov).length > 0;

  return html`
    <!-- Customize toggle -->
    <button
      class="customize-toggle"
      type="button"
      @click=${() => { this._customizeOpen = !this._customizeOpen; }}
    >
      <span class="customize-toggle-label">Customize</span>
      <svg class="customize-toggle-chevron ${this._customizeOpen ? 'open' : ''}" viewBox="0 0 24 24" width="18" height="18">
        <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" fill="currentColor"/>
      </svg>
    </button>

    ${this._customizeOpen ? html`
      <div class="customize-section">

        <!-- Accent Color -->
        <div class="customize-group">
          <label class="pv-label">Accent Color</label>
          <pv-color-swatch-picker
            .value=${ov.accent || ''}
            @color-change=${(e: CustomEvent<{ color: string }>) => this._setOverride('accent', e.detail.color)}
          ></pv-color-swatch-picker>
        </div>

        <!-- Background -->
        <div class="customize-group">
          <label class="pv-label">Background</label>
          <div class="bg-options">
            <button class="pill-btn ${!ov.background ? 'pill-btn--active' : ''}" type="button"
              @click=${() => this._setOverride('background', undefined)}>Base Default</button>
            <div class="bg-custom-row">
              <label class="bg-custom-label">Custom:</label>
              <input type="color" class="bg-color-input"
                .value=${ov.background || '#FFFFFF'}
                @input=${(e: Event) => this._setOverride('background', (e.target as HTMLInputElement).value)}
              />
              ${ov.background ? html`
                <span class="bg-color-hex">${ov.background}</span>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Header Style -->
        <div class="customize-group">
          <label class="pv-label">Header Style</label>
          <div class="header-style-grid">
            ${([
              { key: 'gradient_purple', label: 'Purple', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
              { key: 'gradient_teal', label: 'Teal', gradient: 'linear-gradient(135deg, #0D9488, #2563EB)' },
              { key: 'gradient_sunset', label: 'Sunset', gradient: 'linear-gradient(135deg, #F59E0B, #EF4444)' },
              { key: 'solid_accent', label: 'Accent', gradient: ov.accent || '#6366F1' },
              { key: 'solid_dark', label: 'Dark', gradient: '#1A1B1E' },
            ] as Array<{ key: string; label: string; gradient: string }>).map(h => html`
              <button
                class="header-style-btn ${ov.header_style === h.key ? 'header-style-btn--active' : ''}"
                type="button"
                @click=${() => this._setOverride('header_style', h.key)}
              >
                <div class="header-style-preview" style="background: ${h.gradient};"></div>
                <span class="header-style-label">${h.label}</span>
              </button>
            `)}
            <button
              class="header-style-btn ${ov.header_style === 'custom' ? 'header-style-btn--active' : ''}"
              type="button"
              @click=${() => this._setOverride('header_style', 'custom')}
            >
              <div class="header-style-preview" style="background: ${ov.header_custom || '#333'};"></div>
              <span class="header-style-label">Custom</span>
            </button>
          </div>
          ${ov.header_style === 'custom' ? html`
            <div class="header-custom-row">
              <input type="color" class="bg-color-input"
                .value=${ov.header_custom || '#333333'}
                @input=${(e: Event) => {
                  this._themeOverrides = { ...this._themeOverrides, header_custom: (e.target as HTMLInputElement).value };
                  this._dispatchThemePreview();
                }}
              />
              <span class="bg-color-hex">${ov.header_custom || '#333333'}</span>
            </div>
          ` : ''}
        </div>

        <!-- Corners -->
        <div class="customize-group">
          <label class="pv-label">Corners</label>
          <div class="pill-group">
            ${(['sharp', 'rounded', 'pill'] as const).map(style => html`
              <button
                class="pill-btn ${(ov.corner_style || 'rounded') === style ? 'pill-btn--active' : ''}"
                type="button"
                @click=${() => this._setOverride('corner_style', style)}
              >${style.charAt(0).toUpperCase() + style.slice(1)}</button>
            `)}
          </div>
        </div>

        <!-- Shadows -->
        <div class="customize-group">
          <label class="pv-label">Shadows</label>
          <div class="pill-group">
            ${(['none', 'subtle', 'bold'] as const).map(depth => html`
              <button
                class="pill-btn ${(ov.shadow_depth || 'subtle') === depth ? 'pill-btn--active' : ''}"
                type="button"
                @click=${() => this._setOverride('shadow_depth', depth)}
              >${depth.charAt(0).toUpperCase() + depth.slice(1)}</button>
            `)}
          </div>
        </div>

        <!-- Reset -->
        ${hasOverrides ? html`
          <button class="reset-btn" type="button" @click=${this._resetOverrides}>
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="currentColor"/>
            </svg>
            Reset to Base Theme
          </button>
        ` : ''}

      </div>
    ` : ''}
  `;
}
```

**Step 7: Wire `_renderCustomize()` into `_renderPage2()`**

In `_renderPage2()`, add the customize section after the `</div>` that closes `.theme-grid`:

```typescript
// After the theme-grid closing div, before the page-content closing div:
${this._renderCustomize()}
```

**Step 8: Update `_finish()` to include overrides in payload**

In the `_finish()` method, update the `display` object to include `theme_overrides`:

```typescript
display: {
  time_format: this._timeFormat,
  weather_entity: this._weatherEntity,
  first_day: this._firstDay,
  default_view: this._defaultView,
  theme: this._theme,
  theme_overrides: Object.keys(this._themeOverrides).length > 0 ? this._themeOverrides : undefined,
},
```

**Step 9: Commit**

```bash
git add custom_components/planavista/frontend/src/components/onboarding-wizard.ts
git commit -m "feat(theme): add customize accordion UI with live preview"
```

---

### Task 5: Add CSS styles for the customize section

**Files:**
- Modify: `custom_components/planavista/frontend/src/components/onboarding-wizard.ts`

**Step 1: Add CSS for customize section**

Add to the `static styles` block, after the `.theme-check` styles and before the save error banner styles:

```css
/* ── Customize accordion (page 2) ─────────────────────── */

.customize-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: 1.5rem;
  padding: 0.75rem 0;
  border: none;
  border-top: 1px solid var(--pv-border-subtle, #E5E7EB);
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  -webkit-tap-highlight-color: transparent;
}

.customize-toggle-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--pv-text-secondary, #6B7280);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.customize-toggle-chevron {
  fill: var(--pv-text-secondary, #6B7280);
  transition: transform var(--pv-transition, 200ms ease);
}

.customize-toggle-chevron.open {
  transform: rotate(180deg);
}

.customize-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-top: 0.5rem;
  animation: pv-fadeIn 200ms ease forwards;
}

.customize-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Background options */
.bg-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.bg-custom-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.bg-custom-label {
  font-size: 0.8125rem;
  color: var(--pv-text-secondary, #6B7280);
  font-weight: 500;
}

.bg-color-input {
  width: 36px;
  height: 36px;
  border: 2px solid var(--pv-border-subtle, #E5E7EB);
  border-radius: 8px;
  padding: 2px;
  cursor: pointer;
  background: transparent;
}

.bg-color-hex {
  font-size: 0.75rem;
  font-family: monospace;
  color: var(--pv-text-muted, #9CA3AF);
}

/* Header style grid */
.header-style-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

@media (max-width: 400px) {
  .header-style-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.header-style-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px;
  border: 2px solid var(--pv-border-subtle, #E5E7EB);
  border-radius: var(--pv-radius-sm, 8px);
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  transition: all var(--pv-transition, 200ms ease);
  -webkit-tap-highlight-color: transparent;
}

.header-style-btn:hover {
  border-color: var(--pv-accent, #6366F1);
}

.header-style-btn--active {
  border-color: var(--pv-accent, #6366F1);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--pv-accent, #6366F1) 25%, transparent);
}

.header-style-preview {
  width: 100%;
  height: 24px;
  border-radius: 4px;
}

.header-style-label {
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--pv-text-secondary, #6B7280);
}

.header-custom-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

/* Reset button */
.reset-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--pv-border-subtle, #E5E7EB);
  border-radius: 9999px;
  background: transparent;
  color: var(--pv-text-secondary, #6B7280);
  font-size: 0.8125rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all var(--pv-transition, 200ms ease);
  align-self: flex-start;
  -webkit-tap-highlight-color: transparent;
}

.reset-btn svg {
  fill: currentColor;
}

.reset-btn:hover {
  border-color: var(--pv-accent, #6366F1);
  color: var(--pv-accent, #6366F1);
}
```

**Step 2: Commit**

```bash
git add custom_components/planavista/frontend/src/components/onboarding-wizard.ts
git commit -m "style(theme): add CSS for customize accordion controls"
```

---

### Task 6: Build, test, and push

**Files:**
- Modify: `custom_components/planavista/frontend/dist/planavista-cards.js` (build output)

**Step 1: Build the frontend**

```bash
cd custom_components/planavista/frontend && npx rollup -c
```

Expected: Build succeeds with `created dist/planavista-cards.js in ~3s`

**Step 2: Verify no TypeScript errors**

If the build fails, fix any type errors and rebuild.

**Step 3: Commit build output**

```bash
git add custom_components/planavista/frontend/dist/planavista-cards.js
git commit -m "build: compile theme customizer"
```

**Step 4: Push**

```bash
git push
```

---

### Task 7: Add drag-to-reorder calendars in settings

**Files:**
- Modify: `custom_components/planavista/frontend/src/components/onboarding-wizard.ts`

This adds drag handles to each calendar row on page 1, allowing users to reorder calendars by dragging. The saved order (array position in the `calendars` array) is used everywhere calendars appear: day view columns, filter dropdown, avatar strip.

**Step 1: Add drag state**

Add state for tracking drag operations:

```typescript
@state() private _dragIdx: number | null = null;
@state() private _dragOverIdx: number | null = null;
```

**Step 2: Add drag handlers**

```typescript
private _onDragStart(idx: number, e: DragEvent) {
  this._dragIdx = idx;
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(idx));
  }
}

private _onDragOver(idx: number, e: DragEvent) {
  e.preventDefault();
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
  this._dragOverIdx = idx;
}

private _onDragLeave() {
  this._dragOverIdx = null;
}

private _onDrop(idx: number, e: DragEvent) {
  e.preventDefault();
  if (this._dragIdx !== null && this._dragIdx !== idx) {
    const updated = [...this._calendarConfigs];
    const [moved] = updated.splice(this._dragIdx, 1);
    updated.splice(idx, 0, moved);
    this._calendarConfigs = updated;
  }
  this._dragIdx = null;
  this._dragOverIdx = null;
}

private _onDragEnd() {
  this._dragIdx = null;
  this._dragOverIdx = null;
}
```

**Step 3: Update `_renderCalendarRow` to add drag handle and attributes**

Modify the `.cal-row` div to be draggable and add a grip icon:

```typescript
private _renderCalendarRow(cal: CalendarEntry, idx: number) {
  const isDragging = this._dragIdx === idx;
  const isDragOver = this._dragOverIdx === idx && this._dragIdx !== idx;

  return html`
    <div class="cal-row ${isDragging ? 'cal-row--dragging' : ''} ${isDragOver ? 'cal-row--dragover' : ''}"
      draggable="true"
      @dragstart=${(e: DragEvent) => this._onDragStart(idx, e)}
      @dragover=${(e: DragEvent) => this._onDragOver(idx, e)}
      @dragleave=${this._onDragLeave}
      @drop=${(e: DragEvent) => this._onDrop(idx, e)}
      @dragend=${this._onDragEnd}
    >
      <div class="cal-header">
        <!-- Drag handle -->
        <div class="cal-drag-handle" aria-label="Drag to reorder">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
        </div>
        <!-- existing checkbox + info -->
        ...
      </div>
      ...
    </div>
  `;
}
```

**Step 4: Add CSS for drag handle and drag states**

```css
.cal-drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  cursor: grab;
  color: var(--pv-text-muted, #9CA3AF);
  border-radius: 4px;
  transition: color var(--pv-transition, 200ms ease);
}

.cal-drag-handle:hover {
  color: var(--pv-text-secondary, #6B7280);
}

.cal-drag-handle:active {
  cursor: grabbing;
}

.cal-row--dragging {
  opacity: 0.4;
}

.cal-row--dragover {
  border-color: var(--pv-accent, #6366F1);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--pv-accent, #6366F1) 20%, transparent);
}
```

**Step 5: No backend changes needed**

The calendar order is determined by array position in the `calendars` array passed to `save_config`. The existing save flow already preserves array order. All views that render calendars (day view columns, filter dropdown, avatar strip) iterate the `calendars` array in order, so reordering in the settings panel automatically reflects everywhere.

**Step 6: Build and commit**

```bash
cd custom_components/planavista/frontend && npx rollup -c
git add custom_components/planavista/frontend/
git commit -m "feat(settings): add drag-to-reorder for calendars"
```
