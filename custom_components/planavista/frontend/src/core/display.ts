import type { DisplayConfig, PlanaVistaCardConfig, PlanaVistaData, ThemeOverrides } from '../types';

/** Display settings for one card: its YAML wins, then the saved settings, then defaults. */
export function resolveDisplay(config: PlanaVistaCardConfig | undefined, data: PlanaVistaData | null): DisplayConfig {
  const saved = data?.display;
  return {
    time_format: config?.time_format || saved?.time_format || '12h',
    weather_entity: config?.weather_entity || saved?.weather_entity || '',
    first_day: config?.first_day || saved?.first_day || 'sunday',
    default_view: config?.default_view || config?.view || saved?.default_view || 'week',
    theme: config?.theme || saved?.theme || 'light',
    theme_overrides: saved?.theme_overrides,
    location_autocomplete: saved?.location_autocomplete === true,
  };
}

/**
 * The display settings a theme choice saves. Settings saves merge into the
 * saved display, so no customizations is sent as null, which removes them.
 */
export function themeDisplayChange(
  theme: string,
  overrides: ThemeOverrides,
): { theme: string; theme_overrides: ThemeOverrides | null } {
  return { theme, theme_overrides: Object.keys(overrides).length > 0 ? overrides : null };
}
