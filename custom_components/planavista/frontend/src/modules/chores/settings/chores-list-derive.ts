import type { Member } from '../../../core/household';
import { parseRule, ruleText, shortDate } from '../../../core/recurrence';
import type { Activity, Band, ChoresSettings } from '../chores-types';
import { pictureFor } from '../picture-words';
import { checkoffStars } from '../worth';

/** The Chores list's groups, by rhythm (spec 14.3). */
export type RhythmGroup = 'every_day' | 'every_week' | 'schedule' | 'once' | 'off_board';

export const GROUP_LABELS: Record<RhythmGroup, string> = {
  every_day: 'Every day',
  every_week: 'Every week',
  schedule: 'On a schedule',
  once: 'One time',
  off_board: 'Not on the board',
};
const ORDER: RhythmGroup[] = ['every_day', 'every_week', 'schedule', 'once', 'off_board'];

export interface ChoreRow {
  id: string;
  name: string;
  picture: string;
  rhythm: string;
  tags: string[];
  /** Stars each check-off earns; null for a chore that isn't checked off. */
  stars: number | null;
  people: Member[];
}

export interface ChoreList {
  /** Chores not yet finished. */
  total: number;
  onBoard: number;
  groups: Array<{ id: RhythmGroup; label: string; rows: ChoreRow[] }>;
  finished: ChoreRow[];
}

/** Whether a chore makes check-offs (the engine's on_board rule, spec 7.3). */
export function onTheBoard(activity: Activity): boolean {
  if (activity.on_board === false || !activity.assignees?.length || activity.finished_at) return false;
  return !(activity.schedule === 'plan' && activity.set_time);
}

export function planOnly(activity: Activity): boolean {
  return activity.schedule === 'plan' && (activity.on_board === false || !!activity.set_time);
}

export function groupOf(activity: Activity): RhythmGroup {
  if (planOnly(activity)) return 'off_board';
  if (activity.schedule === 'once') return 'once';
  if (activity.schedule === 'repeats') return 'schedule';
  return activity.minimum?.per === 'day' ? 'every_day' : 'every_week';
}

/** "5 min", "1 h", "1 h 30 min" (spec 14.7's way of saying how long). */
export function durationText(minutes: number): string {
  const rounded = Math.max(1, Math.round(minutes));
  if (rounded < 60) return `${rounded} min`;
  const hours = Math.floor(rounded / 60);
  const rest = rounded % 60;
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
}

const DAY_NAMES: Record<string, string> = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };
const BAND_PLURALS: Record<Band, string> = { morning: 'mornings', afternoon: 'afternoons', evening: 'evenings' };

function daysText(days: string[]): string {
  const set = days.join();
  if (set === 'mon,tue,wed,thu,fri') return 'school days';
  if (set === 'sat,sun') return 'weekends';
  return days.map(d => DAY_NAMES[d] ?? d).join(', ');
}

function bandsText(bands: Band[]): string {
  if (bands.length === 1) return BAND_PLURALS[bands[0]];
  return bands.join(' and ');
}

/** "5:30 PM", or "17:30" on a 24-hour calendar. */
export function clockText(at: string, timeFormat: string): string {
  const [hour, minute] = at.split(':').map(Number);
  if (timeFormat === '24h') return at;
  return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`;
}

/** "Friday" within the coming week, else "Oct 18" (Once chores' dates). */
export function dayText(iso: string, today: string): string {
  const days = Math.round((Date.parse(`${iso}T12:00:00`) - Date.parse(`${today}T12:00:00`)) / 86_400_000);
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days > 1 && days < 7) return new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long' });
  return shortDate(iso);
}

/** How a chore repeats in a line (spec 14.3): "2 h a week, split · any day", "By Sunday · 2 sessions". */
export function rhythmText(activity: Activity, today: string, timeFormat = '12h'): string {
  if (activity.schedule === 'once') {
    const once = activity.once;
    const on = once?.on ? dayText(once.on, today) : null;
    const when = on
      ? (on === 'today' || on === 'tomorrow' ? on[0].toUpperCase() + on.slice(1) : `On ${on}`)
      : once?.by ? `By ${dayText(once.by, today)}` : 'Any time';
    return once && once.sessions > 1 ? `${when} · ${once.sessions} sessions` : when;
  }
  if (activity.schedule === 'repeats') {
    const rule = activity.repeats ? parseRule(activity.repeats.rrule) : null;
    return rule ? ruleText(rule, activity.repeats!.window) : 'On a schedule';
  }
  const minimum = activity.minimum ?? { hours: 0, per: 'week' as const };
  const days = activity.days ?? [];
  const bands = activity.time_of_day ?? [];
  if (activity.set_time) {
    const on = days.length ? `${daysText(days)} at ` : 'At ';
    return `${on}${clockText(activity.set_time, timeFormat)} · set time`;
  }
  const amount = [`${durationText(minimum.hours * 60)} a ${minimum.per}`];
  if (minimum.per === 'day' && (activity.times ?? 1) > 1) amount.push(`${activity.times} times`);
  if (activity.split === 'shared') amount.push('split');
  if (activity.label) amount.push(activity.label);
  let when = '';
  if (days.length) when = bands.length ? `${daysText(days)} ${bandsText(bands)}` : daysText(days);
  else if (bands.length) when = bandsText(bands);
  else if (minimum.per === 'week') when = 'any day';
  return when ? `${amount.join(', ')} · ${when}` : amount.join(', ');
}

/** A chore as a row of the Chores list. */
export function choreRow(
  activity: Activity, members: Member[], settings: Pick<ChoresSettings, 'minutes_per_star'>, today: string, timeFormat = '12h',
): ChoreRow {
  const tags: string[] = [];
  if (planOnly(activity)) tags.push('Plan only');
  else if (!activity.assignees?.length) tags.push('No one yet');
  if (!planOnly(activity) && (activity.needs_ok || activity.needs_ok_always)) tags.push('Needs an OK');
  return {
    id: activity.id,
    name: activity.name,
    picture: activity.icon || pictureFor(activity.name),
    rhythm: rhythmText(activity, today, timeFormat),
    tags,
    stars: planOnly(activity) ? null : checkoffStars(activity, settings.minutes_per_star),
    people: members.filter(m => activity.assignees?.includes(m.id)),
  };
}

/**
 * The Chores list (spec 14.3): grouped by rhythm, filtered to one person
 * and by a search, with finished chores apart ("Show 3 finished").
 */
export function choresList(
  activities: Activity[],
  members: Member[],
  settings: Pick<ChoresSettings, 'minutes_per_star'>,
  options: { member?: string | null; search?: string; today: string; timeFormat?: string },
): ChoreList {
  const query = (options.search ?? '').trim().toLocaleLowerCase();
  const shown = activities.filter(a =>
    (!options.member || a.assignees?.includes(options.member)) && (!query || a.name.toLocaleLowerCase().includes(query)));
  const active = activities.filter(a => !a.finished_at);
  const row = (a: Activity) => choreRow(a, members, settings, options.today, options.timeFormat);
  const groups = ORDER.map(id => ({
    id,
    label: GROUP_LABELS[id],
    rows: shown.filter(a => !a.finished_at && groupOf(a) === id).map(row),
  })).filter(group => group.rows.length > 0);
  return {
    total: active.length,
    onBoard: active.filter(onTheBoard).length,
    groups,
    finished: shown.filter(a => a.finished_at).map(row),
  };
}
