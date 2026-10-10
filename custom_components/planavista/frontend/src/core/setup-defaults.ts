import { DisplayConfig } from '../types';

/** Home Assistant's locale settings (hass.locale), as far as setup uses them. */
export interface LocaleLike {
  time_format?: string;
  first_weekday?: string;
}

/**
 * Calendar options for a new household (spec 14.7 leaves them out of setup),
 * as changes to the saved ones: Home Assistant's own time format and first
 * day when they are set explicitly, and the first weather entity when none
 * is chosen. Saves merge, so every other saved value (the theme picked a
 * moment ago included) stays.
 */
export function setupDisplayDefaults(
  display: DisplayConfig,
  locale: LocaleLike | undefined,
  weatherEntities: string[],
): Partial<DisplayConfig> {
  const changes: Partial<DisplayConfig> = {};
  if (locale?.time_format === '12') changes.time_format = '12h';
  if (locale?.time_format === '24') changes.time_format = '24h';
  if (locale?.first_weekday === 'monday' || locale?.first_weekday === 'sunday') {
    changes.first_day = locale.first_weekday;
  }
  if (!display.weather_entity && weatherEntities.length > 0) {
    changes.weather_entity = [...weatherEntities].sort()[0];
  }
  return changes;
}
