import type { AppearanceSettings, SunState } from './appearance';

type States = Record<string, { state: string; attributes?: Record<string, unknown> } | undefined>;

/** sun.sun as the appearance reads it from hass.states; null when Home Assistant has no sun. */
export function sunOf(states: States | undefined): SunState | null {
  const sun = states?.['sun.sun'];
  if (!sun) return null;
  const text = (key: string) => {
    const value = sun.attributes?.[key];
    return typeof value === 'string' ? value : undefined;
  };
  return { state: sun.state, next_rising: text('next_rising'), next_setting: text('next_setting') };
}

/**
 * What else has to re-render the card for its appearance: sun.sun when
 * Automatic follows the sun, and this screen's Home Assistant dark mode
 * when it matches Home Assistant.
 */
export function appearanceDependencies(settings: AppearanceSettings): { entities: string[]; haDarkMode: boolean } {
  const automatic = settings.appearance === 'automatic';
  return {
    entities: automatic && settings.appearance_switch === 'sun' ? ['sun.sun'] : [],
    haDarkMode: automatic && settings.appearance_switch === 'home_assistant',
  };
}
