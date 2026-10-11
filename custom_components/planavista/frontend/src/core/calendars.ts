import type { CalendarConfig, PlanaVistaCardConfig, PlanaVistaData } from '../types';

/** Calendars a card shows: visible in Settings, narrowed by the card's `calendars` list (every module uses this). */
export function selectCalendars(data: PlanaVistaData | null, config: PlanaVistaCardConfig | undefined): CalendarConfig[] {
  const all = (data?.calendars || []).filter(c => c.visible !== false);
  const cardFilter = config?.calendars;
  return Array.isArray(cardFilter) && cardFilter.length > 0
    ? all.filter(c => cardFilter.includes(c.entity_id))
    : all;
}
