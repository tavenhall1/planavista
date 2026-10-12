import type { CalendarConfig } from '../../types';
import { namesList } from './event-words';

/**
 * What the calendar shows (spec 11.6): a skeleton while the data is on its
 * way, a designed state when there is nothing to show or it can't load,
 * and the views otherwise.
 */
export type CalendarScreen = 'loading' | 'unavailable' | 'no-calendars' | 'all-hidden' | 'ready';

export interface ScreenInput {
  /** The config sensor's state; 'unavailable' or 'unknown' while it has no data. */
  sensorState: string | undefined;
  /** Whether Home Assistant has finished starting (hass.config.state is RUNNING). */
  running: boolean;
  /** The calendars this card shows. */
  calendars: Pick<CalendarConfig, 'entity_id'>[];
  /** How many calendars are set up, whether or not their entities exist yet (the sensor's calendars_configured). */
  configured?: number;
  /** The ones the filter hides. */
  hidden: ReadonlySet<string>;
}

export function screenOf({ sensorState, running, calendars, configured, hidden }: ScreenInput): CalendarScreen {
  if (sensorState === undefined || sensorState === 'unavailable' || sensorState === 'unknown') {
    return running ? 'unavailable' : 'loading';
  }
  if (calendars.length === 0) {
    // While Home Assistant starts, calendars arrive after PlanaVista; set up but missing once it runs means their integration is down.
    if (!running) return 'loading';
    return (configured ?? 0) > 0 ? 'unavailable' : 'no-calendars';
  }
  if (calendars.every(c => hidden.has(c.entity_id))) return 'all-hidden';
  return 'ready';
}

/** How a calendar is named in a sentence: "Alex's calendar", or "the Family calendar" when nobody owns it. */
export function calendarLabel(calendar: Pick<CalendarConfig, 'display_name' | 'member_id' | 'person_entity' | 'entity_id'>): string {
  const name = calendar.display_name || calendar.entity_id;
  return calendar.member_id || calendar.person_entity ? `${name}'s calendar` : `the ${name} calendar`;
}

function capitalized(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** The banner for calendars Home Assistant can't reach, or whose events didn't arrive: what happened and what to do. */
export function unreachableText(labels: string[]): string {
  if (labels.length === 1) {
    return `${capitalized(labels[0])} can't be reached, so its events may be missing. Check its integration in Settings, Devices and services.`;
  }
  return `${capitalized(namesList(labels))} can't be reached, so their events may be missing. Check their integrations in Settings, Devices and services.`;
}

export interface Banner {
  kind: 'offline' | 'unreachable';
  text: string;
}

export interface BannerInput {
  /** hass.connected: false while the browser can't reach Home Assistant. */
  connected: boolean;
  /** While Home Assistant starts, calendars report unavailable for a moment; nothing is called unreachable then. */
  running?: boolean;
  calendars: CalendarConfig[];
  hidden: ReadonlySet<string>;
}

/** The banners over the views: Home Assistant out of reach, and the shown calendars it can't read. */
export function bannersOf({ connected, running = true, calendars, hidden }: BannerInput): Banner[] {
  const banners: Banner[] = [];
  if (!connected) {
    banners.push({ kind: 'offline', text: "Can't reach Home Assistant. These are the last events it sent, and they update when it's back." });
  }
  const unreachable = running
    ? calendars.filter(c => !hidden.has(c.entity_id) && (c.state === 'unavailable' || c.fetch_failed === true))
    : [];
  if (unreachable.length) banners.push({ kind: 'unreachable', text: unreachableText(unreachable.map(calendarLabel)) });
  return banners;
}
