import { DisplayConfig } from '../types';

/** Home Assistant's locale settings (hass.locale), as far as setup uses them. */
export interface LocaleLike {
  time_format?: string;
  first_weekday?: string;
}

/**
 * Calendar options for a new household (spec 14.7 leaves them out of setup):
 * Home Assistant's own time format and first day when they are set
 * explicitly, and the first weather entity when none is chosen. Every other
 * saved value stays.
 */
export function setupDisplayDefaults(
  display: DisplayConfig,
  locale: LocaleLike | undefined,
  weatherEntities: string[],
): DisplayConfig {
  const result = { ...display };
  if (locale?.time_format === '12') result.time_format = '12h';
  if (locale?.time_format === '24') result.time_format = '24h';
  if (locale?.first_weekday === 'monday' || locale?.first_weekday === 'sunday') {
    result.first_day = locale.first_weekday;
  }
  if (!result.weather_entity && weatherEntities.length > 0) {
    result.weather_entity = [...weatherEntities].sort()[0];
  }
  return result;
}
