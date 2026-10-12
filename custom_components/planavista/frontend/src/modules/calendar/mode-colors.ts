import type { Member } from '../../core/household';
import { memberColor } from '../../core/household';
import { darkTint, lightTint } from '../../core/color';
import type { PlanaVistaData } from '../../types';
import { Mode, personColors } from '../../styles/theme-pairs';

type Person = Pick<Member, 'id' | 'color' | 'color_dark'>;

/**
 * The data with each person's colors for the mode (spec 12.4; milestone 8,
 * spec 3.1). A calendar that belongs to someone draws their color, set in
 * People, with a tint made from it; in dark, their color brightened as the
 * board does (their own dark color first) on a dark tint. A calendar that
 * belongs to nobody keeps its own color. With nobody linked, light mode hands
 * back the same object, so nothing downstream recomputes.
 */
export function withModeColors(data: PlanaVistaData | null, mode: Mode, members: readonly Person[] = []): PlanaVistaData | null {
  if (!data) return data;
  const people = new Map(members.map(m => [m.id, m]));
  const linked = (data.calendars || []).some(cal => cal.member_id && people.has(cal.member_id));
  if (mode === 'light' && !linked) return data;
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
  const byCalendar = new Map<string, { color: string; colorLight: string }>();
  for (const cal of data.calendars || []) {
    const person = cal.member_id ? people.get(cal.member_id) : undefined;
    if (!person) continue;
    byCalendar.set(cal.entity_id, mode === 'light'
      ? { color: person.color, colorLight: lightTint(person.color) }
      : { color: memberColor(person, 'dark'), colorLight: darkTint(person.color) });
  }
  return {
    ...data,
    calendars: (data.calendars || []).map(cal => {
      const { color, colorLight } = byCalendar.get(cal.entity_id) ?? colors(cal.color, cal.color_light);
      return { ...cal, color, color_light: colorLight };
    }),
    events: (data.events || []).map(event => {
      const { color, colorLight } = byCalendar.get(event.calendar_entity_id) ?? colors(event.calendar_color, event.calendar_color_light);
      return { ...event, calendar_color: color, calendar_color_light: colorLight };
    }),
  };
}
