import { css, CSSResult } from 'lit';
import { ThemeOverrides } from '../types';

// ============================================================================
// Color Utility Functions
// ============================================================================

/** Relative luminance of a hex color (0-1). */
function luminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const toLinear = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** Returns '#FFFFFF' or '#1A1B1E' for best contrast against bg. */
export function contrastText(bgHex: string): string {
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

// ============================================================================
// Override Preset Constants
// ============================================================================

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

export { HEADER_PRESETS, CORNER_PRESETS, SHADOW_PRESETS };

// ============================================================================
// Calendar Colors & Theme Definitions
// ============================================================================

export const CALENDAR_COLORS = [
  '#6366F1', '#F59E0B', '#10B981', '#3B82F6',
  '#EC4899', '#8B5CF6', '#14B8A6', '#F97316',
  '#EF4444', '#06B6D4',
];

export type ThemeName = 'light' | 'dark' | 'minimal' | 'vibrant';

const themeVars: Record<ThemeName, Record<string, string>> = {
  light: {
    '--pv-bg': '#FAFAF8',
    '--pv-card-bg': '#FFFFFF',
    '--pv-card-bg-elevated': '#FFFFFF',
    '--pv-text': '#1A1B1E',
    '--pv-text-secondary': '#6B7280',
    '--pv-text-muted': '#9CA3AF',
    '--pv-border': '#E5E7EB',
    '--pv-border-subtle': '#F3F4F6',
    '--pv-accent': '#6366F1',
    '--pv-accent-text': '#FFFFFF',
    '--pv-today-bg': 'rgba(99, 102, 241, 0.06)',
    '--pv-now-color': '#EF4444',
    '--pv-event-hover': 'rgba(0, 0, 0, 0.03)',
    '--pv-shadow': '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
    '--pv-shadow-lg': '0 10px 25px rgba(0, 0, 0, 0.08), 0 4px 10px rgba(0, 0, 0, 0.04)',
    '--pv-shadow-xl': '0 20px 40px rgba(0, 0, 0, 0.12)',
    '--pv-radius': '12px',
    '--pv-radius-lg': '16px',
    '--pv-radius-sm': '8px',
    '--pv-transition': '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    '--pv-font-family': "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
    '--pv-header-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    '--pv-header-text': '#FFFFFF',
    '--pv-backdrop': 'rgba(0, 0, 0, 0.3)',
  },
  dark: {
    '--pv-bg': '#1A1B1E',
    '--pv-card-bg': '#25262B',
    '--pv-card-bg-elevated': '#2C2E33',
    '--pv-text': '#E4E5E7',
    '--pv-text-secondary': '#909296',
    '--pv-text-muted': '#5C5F66',
    '--pv-border': '#373A40',
    '--pv-border-subtle': '#2C2E33',
    '--pv-accent': '#818CF8',
    '--pv-accent-text': '#FFFFFF',
    '--pv-today-bg': 'rgba(129, 140, 248, 0.08)',
    '--pv-now-color': '#F87171',
    '--pv-event-hover': 'rgba(255, 255, 255, 0.04)',
    '--pv-shadow': '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
    '--pv-shadow-lg': '0 10px 25px rgba(0, 0, 0, 0.3), 0 4px 10px rgba(0, 0, 0, 0.2)',
    '--pv-shadow-xl': '0 20px 40px rgba(0, 0, 0, 0.4)',
    '--pv-radius': '12px',
    '--pv-radius-lg': '16px',
    '--pv-radius-sm': '8px',
    '--pv-transition': '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    '--pv-font-family': "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
    '--pv-header-gradient': 'linear-gradient(135deg, #3730A3 0%, #581C87 100%)',
    '--pv-header-text': '#FFFFFF',
    '--pv-backdrop': 'rgba(0, 0, 0, 0.6)',
  },
  minimal: {
    '--pv-bg': '#FFFFFF',
    '--pv-card-bg': '#FFFFFF',
    '--pv-card-bg-elevated': '#FFFFFF',
    '--pv-text': '#111827',
    '--pv-text-secondary': '#6B7280',
    '--pv-text-muted': '#D1D5DB',
    '--pv-border': '#F3F4F6',
    '--pv-border-subtle': '#F9FAFB',
    '--pv-accent': '#111827',
    '--pv-accent-text': '#FFFFFF',
    '--pv-today-bg': 'rgba(17, 24, 39, 0.03)',
    '--pv-now-color': '#EF4444',
    '--pv-event-hover': 'rgba(0, 0, 0, 0.02)',
    '--pv-shadow': '0 0 0 1px rgba(0, 0, 0, 0.05)',
    '--pv-shadow-lg': '0 4px 12px rgba(0, 0, 0, 0.05)',
    '--pv-shadow-xl': '0 8px 24px rgba(0, 0, 0, 0.08)',
    '--pv-radius': '8px',
    '--pv-radius-lg': '12px',
    '--pv-radius-sm': '6px',
    '--pv-transition': '150ms ease',
    '--pv-font-family': "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
    '--pv-header-gradient': '#111827',
    '--pv-header-text': '#FFFFFF',
    '--pv-backdrop': 'rgba(0, 0, 0, 0.2)',
  },
  vibrant: {
    '--pv-bg': '#FAFAF8',
    '--pv-card-bg': '#FFFFFF',
    '--pv-card-bg-elevated': '#FFFFFF',
    '--pv-text': '#1A1B1E',
    '--pv-text-secondary': '#6B7280',
    '--pv-text-muted': '#9CA3AF',
    '--pv-border': '#E5E7EB',
    '--pv-border-subtle': '#F3F4F6',
    '--pv-accent': '#7C3AED',
    '--pv-accent-text': '#FFFFFF',
    '--pv-today-bg': 'rgba(124, 58, 237, 0.06)',
    '--pv-now-color': '#F43F5E',
    '--pv-event-hover': 'rgba(0, 0, 0, 0.03)',
    '--pv-shadow': '0 1px 3px rgba(124, 58, 237, 0.1), 0 1px 2px rgba(0, 0, 0, 0.04)',
    '--pv-shadow-lg': '0 10px 25px rgba(124, 58, 237, 0.15), 0 4px 10px rgba(0, 0, 0, 0.04)',
    '--pv-shadow-xl': '0 20px 40px rgba(124, 58, 237, 0.2)',
    '--pv-radius': '14px',
    '--pv-radius-lg': '20px',
    '--pv-radius-sm': '10px',
    '--pv-transition': '250ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    '--pv-font-family': "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
    '--pv-header-gradient': 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
    '--pv-header-text': '#FFFFFF',
    '--pv-backdrop': 'rgba(124, 58, 237, 0.2)',
  },
};

// ============================================================================
// Theme Application Functions
// ============================================================================

/**
 * Get CSS custom properties for a given theme as a CSSResult.
 */
export function getThemeStyles(theme: ThemeName = 'light'): string {
  const vars = themeVars[theme] || themeVars.light;
  return Object.entries(vars).map(([k, v]) => `${k}: ${v};`).join('\n  ');
}

// Cache to avoid re-applying the same theme to the same element
const _appliedThemeCache = new WeakMap<HTMLElement, string>();

/**
 * Apply theme CSS variables to a host element dynamically.
 * Skips if the same theme is already applied (performance optimization).
 */
export function applyTheme(element: HTMLElement, theme: ThemeName = 'light'): void {
  const cached = _appliedThemeCache.get(element);
  if (cached === theme) {
    return;
  }
  const vars = themeVars[theme] || themeVars.light;
  for (const [key, value] of Object.entries(vars)) {
    element.style.setProperty(key, value);
  }
  _appliedThemeCache.set(element, theme);
}

/**
 * Apply theme with optional overrides. Merges base theme + grouped overrides,
 * auto-deriving dependent variables.
 */
export function applyThemeWithOverrides(
  element: HTMLElement,
  baseTheme: ThemeName,
  overrides?: ThemeOverrides | null,
): void {
  // Build cache key to skip redundant applications
  const cacheKey = `${baseTheme}:${JSON.stringify(overrides || {})}`;
  const cached = _appliedThemeCache.get(element);
  if (cached === cacheKey) {
    return;
  }

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
      const bgLum = luminance(overrides.background);
      if (bgLum > 0.5) {
        merged['--pv-card-bg'] = '#FFFFFF';
        merged['--pv-card-bg-elevated'] = '#FFFFFF';
      } else {
        const r = parseInt(overrides.background.slice(1, 3), 16);
        const g = parseInt(overrides.background.slice(3, 5), 16);
        const b = parseInt(overrides.background.slice(5, 7), 16);
        const lighten = (v: number, amt: number) => Math.min(255, v + amt);
        merged['--pv-card-bg'] = `#${lighten(r, 12).toString(16).padStart(2, '0')}${lighten(g, 12).toString(16).padStart(2, '0')}${lighten(b, 12).toString(16).padStart(2, '0')}`;
        merged['--pv-card-bg-elevated'] = `#${lighten(r, 20).toString(16).padStart(2, '0')}${lighten(g, 20).toString(16).padStart(2, '0')}${lighten(b, 20).toString(16).padStart(2, '0')}`;
      }
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

    // Avatar border: only set CSS var for custom hex colors
    // 'primary' and 'light' modes are handled per-avatar in view-day.ts
    if (overrides.avatar_border && overrides.avatar_border !== 'primary' && overrides.avatar_border !== 'light') {
      merged['--pv-avatar-border'] = overrides.avatar_border;
    }

    // Now indicator color
    if (overrides.now_color) {
      merged['--pv-now-color'] = overrides.now_color;
    }
  }

  // Apply all merged vars
  for (const [key, value] of Object.entries(merged)) {
    element.style.setProperty(key, value);
  }
  _appliedThemeCache.set(element, cacheKey);
}

/**
 * Clear theme cache for an element so the next applyTheme call always applies.
 */
export function clearThemeCache(element: HTMLElement): void {
  _appliedThemeCache.delete(element);
}

/**
 * Get all CSS variables for a theme as a plain CSS string (for use in <style>).
 */
export function getThemeCSSText(theme: ThemeName = 'light'): string {
  const vars = themeVars[theme] || themeVars.light;
  return Object.entries(vars).map(([k, v]) => `${k}: ${v};`).join('\n  ');
}

/**
 * Resolve theme name from config with fallback.
 */
export function resolveTheme(configTheme?: string, displayTheme?: string): ThemeName {
  const theme = configTheme || displayTheme || 'light';
  // Map legacy/backend theme names to frontend theme names
  if (theme === 'planavista') return 'light';
  if (theme === 'modern') return 'vibrant';
  if (theme in themeVars) return theme as ThemeName;
  return 'light';
}
