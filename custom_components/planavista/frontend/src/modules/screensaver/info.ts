import type { Member } from '../../core/household';
import type { Board } from '../chores/chores-types';
import { type DayEvent, clockTime } from '../chores/calendar-ties';

/** What the screensaver writes over the sky (spec 3.3): the time, the day, and today. */
export interface ScreensaverInfo {
  time: string;
  /** "AM" or "PM" in 12-hour time, else null. */
  ampm: string | null;
  /** "Thursday, October 15". */
  date: string;
  /** "60° Cloudy", or null without weather. */
  weather: string | null;
  /** The next events today, soonest first: what's on now, then what's next. */
  events: Array<{ key: string; when: string; title: string; member: string | null; now: boolean }>;
  /** True when the day has events but none are left. */
  nothingElse: boolean;
  /** One ring per person with chores today (waiting for approval counts as done, as the rings do). */
  rings: Array<{ id: string; initial: string; name: string; done: number; due: number }>;
}

const WORDS: Record<string, string> = {
  sunny: 'Sunny', 'clear-night': 'Clear', partlycloudy: 'Partly cloudy', cloudy: 'Cloudy', fog: 'Fog',
  rainy: 'Rain', pouring: 'Heavy rain', snowy: 'Snow', 'snowy-rainy': 'Sleet', hail: 'Hail',
  lightning: 'Thunderstorms', 'lightning-rainy': 'Thunderstorms', windy: 'Windy', 'windy-variant': 'Windy',
  exceptional: 'Unusual weather',
};

/** The condition in words; an unknown one as Home Assistant writes it, capitalized. */
export function conditionWords(state: string): string {
  if (WORDS[state]) return WORDS[state];
  const plain = state.replace(/-/g, ' ');
  return plain ? plain[0].toUpperCase() + plain.slice(1) : '';
}

/** How many events the Today card lists. */
export const EVENTS_SHOWN = 3;

export interface InfoInput {
  now: Date;
  format: '12h' | '24h';
  weather?: { state: string; attributes: Record<string, unknown> };
  /** Today's timed events (calendar-ties `eventsOn`). */
  events: DayEvent[];
  /** The household's members, in their order. */
  members: Member[];
  /** The chores feed, or null while chores are off or not heard yet. */
  board: Board | null;
}

export function screensaverInfo(input: InfoInput): ScreensaverInfo {
  const { now, format } = input;
  const hour = now.getHours();
  const time = format === '24h'
    ? `${String(hour).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    : clockTime(now, '12h');
  const date = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const w = input.weather;
  const usable = w && w.state !== 'unavailable' && w.state !== 'unknown';
  const temperature = usable ? Number(w.attributes.temperature) : NaN;
  const weather = usable
    ? [Number.isFinite(temperature) ? `${Math.round(temperature)}°` : '', conditionWords(w.state)].filter(Boolean).join(' ')
    : null;
  // An event on two people's calendars is one event, as the calendar draws it (sameEventKey).
  const seen = new Set<string>();
  const unique = input.events.filter(e => {
    const key = `${e.title}|${e.start.getTime()}|${e.end.getTime()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const left = unique.filter(e => e.end > now);
  const events = left.slice(0, EVENTS_SHOWN).map(e => ({
    key: `${e.calendar}|${e.start.getTime()}|${e.title}`,
    // What's on now says when it ends; its badge says Now.
    when: e.start <= now ? `Until ${clockTime(e.end, format, format === '12h')}` : clockTime(e.start, format, format === '12h'),
    title: e.title,
    member: e.member,
    now: e.start <= now,
  }));
  const rings: ScreensaverInfo['rings'] = [];
  for (const member of input.members) {
    const today = input.board?.members[member.id]?.today;
    if (!today || today.due <= 0) continue;
    rings.push({
      id: member.id, initial: (member.name.trim()[0] ?? '?').toUpperCase(), name: member.name,
      done: Math.min(today.due, today.done + today.pending), due: today.due,
    });
  }
  return {
    time, ampm: format === '12h' ? (hour >= 12 ? 'PM' : 'AM') : null, date, weather,
    events, nothingElse: unique.length > 0 && left.length === 0, rings,
  };
}
