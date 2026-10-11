import type { PlanaVistaData } from '../../types';
import { Mode, personColors } from '../../styles/theme-pairs';

/**
 * The data with each person's colors for the mode: as saved in light, and
 * in dark their color brightened and their events on a dark tint (spec 12.4).
 * Light mode hands back the same object, so nothing downstream recomputes.
 */
export function withModeColors(data: PlanaVistaData | null, mode: Mode): PlanaVistaData | null {
  if (!data || mode === 'light') return data;
  const cache = new Map<string, { color: string; colorLight: string }>();
  const colors = (color: string, light: string | undefined) => {
    const key = `${color}|${light ?? ''}`;
    let found = cache.get(key);
    if (!found) {
      found = personColors(color, light, mode);
      cache.set(key, found);
    }
    return found;
  };
  return {
    ...data,
    calendars: (data.calendars || []).map(cal => {
      const { color, colorLight } = colors(cal.color, cal.color_light);
      return { ...cal, color, color_light: colorLight };
    }),
    events: (data.events || []).map(event => {
      const { color, colorLight } = colors(event.calendar_color, event.calendar_color_light);
      return { ...event, calendar_color: color, calendar_color_light: colorLight };
    }),
  };
}
