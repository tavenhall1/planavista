import { css, CSSResult } from 'lit';

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

/**
 * Get CSS custom properties for a given theme as a CSSResult.
 */
export function getThemeStyles(theme: ThemeName = 'light'): string {
  const vars = themeVars[theme] || themeVars.light;
  return Object.entries(vars).map(([k, v]) => `${k}: ${v};`).join('\n  ');
}

// Cache to avoid re-applying the same theme to the same element
const _appliedThemeCache = new WeakMap<HTMLElement, ThemeName>();

/**
 * Apply theme CSS variables to a host element dynamically.
 * Skips if the same theme is already applied (performance optimization).
 */
export function applyTheme(element: HTMLElement, theme: ThemeName = 'light'): void {
  const cached = _appliedThemeCache.get(element);
  if (cached === theme) {
    return;
  }
  console.log('[PlanaVista] applyTheme:', theme, '(was:', cached, ')');
  const vars = themeVars[theme] || themeVars.light;
  for (const [key, value] of Object.entries(vars)) {
    element.style.setProperty(key, value);
  }
  _appliedThemeCache.set(element, theme);
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
