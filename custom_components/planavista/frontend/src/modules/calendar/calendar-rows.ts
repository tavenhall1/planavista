import { Member } from '../../core/household';

export interface Preset {
  color: string;
  light: string;
}

/** A calendar on the Calendars page: a saved row, or one Home Assistant offers. */
export interface CalendarRow {
  /** The saved row with every key it had (minus what the sensor adds), or null. */
  saved: Record<string, unknown> | null;
  entity_id: string;
  display_name: string;
  color: string;
  color_light: string;
  person_entity: string;
  member_id: string | null;
  include: boolean;
}

/** Keys the sensor adds to each row that aren't settings. */
const SENSOR_ONLY = new Set(['state', 'attributes']);

/** Saved calendars in their order, then Home Assistant's other calendars, sorted and left out. */
export function buildCalendarRows(
  saved: Array<Record<string, any>>,
  entityIds: string[],
  friendlyName: (entityId: string) => string | undefined,
  presets: Preset[],
): CalendarRow[] {
  const rows: CalendarRow[] = [];
  const seen = new Set<string>();
  for (const cal of saved) {
    const preset = presets[rows.length % presets.length];
    seen.add(cal.entity_id);
    rows.push({
      saved: Object.fromEntries(Object.entries(cal).filter(([key]) => !SENSOR_ONLY.has(key))),
      entity_id: cal.entity_id,
      display_name: cal.display_name || cal.entity_id,
      color: cal.color || preset.color,
      color_light: cal.color_light || preset.light,
      person_entity: cal.person_entity || '',
      member_id: cal.member_id ?? null,
      include: true,
    });
  }
  for (const entityId of entityIds.filter(id => !seen.has(id)).sort()) {
    const preset = presets[rows.length % presets.length];
    rows.push({
      saved: null,
      entity_id: entityId,
      display_name: friendlyName(entityId) || entityId,
      color: preset.color,
      color_light: preset.light,
      person_entity: '',
      member_id: null,
      include: false,
    });
  }
  return rows;
}

/** The calendars to save: included rows in order, each keeping every key it had. */
export function toSavedCalendars(rows: CalendarRow[]): Array<Record<string, unknown>> {
  return rows
    .filter(row => row.include)
    .map(row => ({
      icon: 'mdi:calendar',
      visible: true,
      ...(row.saved ?? {}),
      entity_id: row.entity_id,
      display_name: row.display_name,
      color: row.color,
      color_light: row.color_light,
      person_entity: row.person_entity,
      member_id: row.member_id,
    }));
}

/**
 * Who a calendar belongs to. A calendar linked to a person whose member
 * exists belongs to that member (and the choice is fixed); otherwise it is
 * the calendar's own choice, while that member exists.
 */
export function belongsTo(
  row: Pick<CalendarRow, 'person_entity' | 'member_id'>,
  members: Array<Pick<Member, 'id' | 'person'>>,
): { memberId: string | null; viaPerson: boolean } {
  if (row.person_entity) {
    const member = members.find(m => m.person === row.person_entity);
    if (member) return { memberId: member.id, viaPerson: true };
  }
  const chosen = members.some(m => m.id === row.member_id) ? row.member_id : null;
  return { memberId: chosen, viaPerson: false };
}
