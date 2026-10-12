import type { Member } from '../../../core/household';
import { RecurrenceValue, happens, longDate, recurrenceValue, toRRule } from '../../../core/recurrence';
import { starsFor } from '../../../core/stars';
import type { Activity, Band, ChoresSettings } from '../chores-types';
import { checkoffMinutes } from '../worth';
import { dayText, durationText } from './chores-list-derive';

export type Schedule = 'plan' | 'once' | 'repeats';
export type OnceWhen = 'on' | 'by' | 'any';

/** What the chore editor edits (spec 14.4). Times are whole minutes; they're saved as the engine's hours. */
export interface ChoreDraft {
  name: string;
  icon: string | null;
  category: string;
  schedule: Schedule;
  assignees: string[];
  on_board: boolean;
  needs_ok: boolean;
  /** Added from a to-do list by someone who isn't a parent: every check-off waits (spec 10.3). */
  needs_ok_always: boolean;
  /** null works them out from the time. */
  stars: number | null;
  label: string;
  // Plan
  minutes: number;
  per: 'day' | 'week';
  split: 'shared' | 'each';
  /** Each person's share in minutes, when the time is split. */
  shares: Record<string, number>;
  times: number;
  days: string[];
  time_of_day: Band[];
  // Once
  once_when: OnceWhen;
  date: string;
  /** HH:MM, or null for the end of the day. */
  by_time: string | null;
  sessions: number;
  /** About how long: a Once chore in all, a Repeats chore each time. */
  estimate: number;
  // Repeats
  recurrence: RecurrenceValue;
  window: 'day' | 'period';
}

/** An edit in progress, kept on the card like a person's (spec 14.1, 9.4). */
export interface ChoreRecord {
  draft: ChoreDraft;
  start: ChoreDraft;
  /** The revision the edit began from; null for a new chore. */
  rev: number | null;
}

export const CATEGORIES: Array<{ id: string; label: string }> = [
  { id: 'kitchen', label: 'Kitchen' },
  { id: 'cleaning', label: 'Cleaning' },
  { id: 'home', label: 'Home and yard' },
  { id: 'personal', label: 'Personal' },
  { id: 'school', label: 'School' },
  { id: 'work', label: 'Work' },
  { id: 'family', label: 'Family' },
  { id: 'other', label: 'Other' },
];

export const DAY_CODES = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

function same(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Shares split evenly, in 5-minute steps while everyone gets at least 5 and
 * by the minute for shorter chores (the backend refuses a share of 0);
 * what's left over goes to the first person.
 */
export function evenShares(assignees: string[], minutes: number): Record<string, number> {
  if (!assignees.length) return {};
  const step = minutes / assignees.length >= 5 ? 5 : 1;
  const each = Math.floor(minutes / assignees.length / step) * step;
  const shares: Record<string, number> = {};
  for (const id of assignees) shares[id] = each;
  shares[assignees[0]] += minutes - each * assignees.length;
  return shares;
}

/** The editor's starting point: the chore as saved, or a new one (spec 14.4). */
export function draftOf(activity: Activity | null, today: string, assignees: string[] = []): ChoreDraft {
  const recurrence = recurrenceValue(activity?.repeats?.rrule ?? null, activity?.repeats?.start ?? today);
  const draft: ChoreDraft = {
    name: '', icon: null, category: 'other', schedule: 'plan', assignees, on_board: true, needs_ok: false,
    needs_ok_always: false, stars: null, label: '', minutes: 15, per: 'day', split: 'each', shares: {}, times: 1,
    days: [], time_of_day: [], once_when: 'by', date: today, by_time: null, sessions: 1, estimate: 30, recurrence,
    window: 'day',
  };
  if (!activity) return draft;
  draft.name = activity.name;
  draft.icon = activity.icon;
  draft.category = activity.category || 'other';
  draft.schedule = activity.schedule;
  draft.assignees = [...(activity.assignees ?? [])];
  draft.on_board = activity.on_board !== false;
  draft.needs_ok = !!activity.needs_ok;
  draft.needs_ok_always = !!activity.needs_ok_always;
  draft.stars = activity.stars ?? null;
  draft.label = activity.label ?? '';
  if (activity.minimum) {
    draft.minutes = Math.round(activity.minimum.hours * 60);
    draft.per = activity.minimum.per;
  }
  draft.split = activity.split === 'shared' ? 'shared' : 'each';
  if (activity.shares) {
    draft.shares = Object.fromEntries(Object.entries(activity.shares).map(([id, hours]) => [id, Math.round(hours * 60)]));
  }
  draft.times = activity.times ?? 1;
  draft.days = [...(activity.days ?? [])];
  draft.time_of_day = [...(activity.time_of_day ?? [])];
  if (activity.once) {
    draft.once_when = activity.once.on ? 'on' : activity.once.by ? 'by' : 'any';
    draft.date = activity.once.on ?? activity.once.by ?? today;
    draft.by_time = activity.once.by_time;
    draft.sessions = activity.once.sessions;
    draft.estimate = activity.once.estimate_minutes;
  }
  if (activity.repeats) {
    draft.window = activity.repeats.window;
    draft.estimate = activity.repeats.estimate_minutes;
  }
  return draft;
}

export function beginChoreDraft(activity: Activity | null, today: string, assignees: string[] = []): ChoreRecord {
  const start = draftOf(activity, today, assignees);
  return { draft: start, start, rev: activity ? activity.rev ?? 1 : null };
}

export function isDirty(record: ChoreRecord): boolean {
  return !same(record.draft, record.start);
}

/**
 * Keep editing after "This changed on another screen": this screen's own
 * changes on top of the version saved there, saved with its revision.
 */
export function rebaseChore(record: ChoreRecord, activity: Activity, today: string): ChoreRecord {
  const start = draftOf(activity, today);
  const draft: Record<string, unknown> = { ...start };
  for (const key of Object.keys(record.draft) as Array<keyof ChoreDraft>) {
    if (!same(record.draft[key], record.start[key])) draft[key] = record.draft[key];
  }
  return { draft: draft as unknown as ChoreDraft, start, rev: activity.rev ?? 1 };
}

/** What Save sends: the chore's fields for its schedule; anything the editor doesn't show is kept (spec 14.4). */
export function choreChanges(record: ChoreRecord): Partial<Activity> {
  const d = record.draft;
  const shared = d.split === 'shared' && d.assignees.length > 1;
  const changes: Partial<Activity> = {
    name: d.name.trim(), icon: d.icon, category: d.category, schedule: d.schedule, assignees: d.assignees,
    needs_ok: d.needs_ok, stars: d.stars, label: d.label.trim() || null,
  };
  if (record.start.needs_ok_always && !d.needs_ok_always) changes.needs_ok_always = false;
  if (d.schedule === 'plan') {
    Object.assign(changes, {
      on_board: d.on_board,
      minimum: { hours: d.minutes / 60, per: d.per },
      split: shared ? 'shared' : 'each',
      shares: shared ? Object.fromEntries(d.assignees.map(id => [id, (d.shares[id] ?? 0) / 60])) : null,
      times: d.times,
      days: DAY_CODES.filter(day => d.days.includes(day)),
      time_of_day: (['morning', 'afternoon', 'evening'] as Band[]).filter(band => d.time_of_day.includes(band)),
    });
  } else if (d.schedule === 'once') {
    changes.on_board = true;
    changes.once = {
      on: d.once_when === 'on' ? d.date : null,
      by: d.once_when === 'by' ? d.date : null,
      by_time: d.once_when === 'by' ? d.by_time : null,
      sessions: d.sessions,
      estimate_minutes: d.estimate,
    };
  } else {
    changes.on_board = true;
    changes.repeats = {
      rrule: toRRule(d.recurrence),
      start: d.recurrence.start,
      window: d.recurrence.freq === 'DAILY' ? 'day' : d.window,
      estimate_minutes: d.estimate,
    };
  }
  return changes;
}

/** How the shares stand (spec 14.4: "✓ The shares add up to 2 h."). */
export function sharesStatus(d: ChoreDraft): { ok: boolean; text: string } {
  if (d.assignees.some(id => (d.shares[id] ?? 0) <= 0)) return { ok: false, text: 'Give everyone some of the time.' };
  const total = d.assignees.reduce((sum, id) => sum + (d.shares[id] ?? 0), 0);
  const left = d.minutes - total;
  if (left === 0) return { ok: true, text: `✓ The shares add up to ${durationText(d.minutes)}.` };
  return left > 0
    ? { ok: false, text: `${durationText(left)} still unassigned.` }
    : { ok: false, text: `${durationText(-left)} over the time.` };
}

/** A problem to fix before saving, or null. The backend checks again. */
export function choreProblem(d: ChoreDraft, today: string, startDate: string | null = null): string | null {
  if (!d.name.trim()) return 'Add a name.';
  if (d.schedule === 'plan') {
    if (d.minutes <= 0) return 'Add how long it takes.';
    if (d.split === 'shared' && d.assignees.length > 1) {
      if (d.assignees.some(id => (d.shares[id] ?? 0) <= 0)) return 'Give everyone some of the time, or pick Each does it all.';
      if (!sharesStatus(d).ok) return 'Everyone\'s share has to add up to the time.';
    }
  }
  if (d.schedule === 'once' && d.once_when !== 'any') {
    if (!d.date) return 'Pick a date.';
    if (d.date < today && d.date !== startDate) return 'Pick today or a later day.';
  }
  if (d.schedule !== 'plan' && d.estimate <= 0) return 'Add about how long it takes.';
  if (d.schedule === 'repeats' && !happens(d.recurrence)) return 'This never happens. Pick another day or a later end date.';
  return null;
}

function names(list: string[]): string {
  if (list.length <= 1) return list.join('');
  return `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}`;
}

/** The draft as a chore, for the worth rule. */
export function asActivity(d: ChoreDraft): Partial<Activity> {
  return choreChanges({ draft: d, start: d, rev: null });
}

/** The worth line (spec 14.4): "Each check-off is worth about 1 h and ★ 4." */
export function worthText(d: ChoreDraft, settings: Pick<ChoresSettings, 'minutes_per_star'>, members: Member[]): string {
  const activity = asActivity(d);
  const each = d.schedule === 'once'
    ? (d.sessions > 1 ? 'Each session is' : 'It\'s')
    : d.schedule === 'repeats' ? 'Each time is' : 'Each check-off is';
  const worth = (memberId?: string) => {
    const minutes = checkoffMinutes(activity, memberId);
    return `${durationText(minutes)} and ★ ${starsFor(minutes, settings.minutes_per_star, d.stars)}`;
  };
  const people = d.assignees.length ? d.assignees : [undefined];
  const values = people.map(id => worth(id));
  if (new Set(values).size <= 1) return `${each} worth about ${values[0]}.`;
  const byName = d.assignees.map((id, index) => `${values[index]} for ${members.find(m => m.id === id)?.name ?? id}`);
  return `${each} worth about ${names(byName)}.`;
}

/** Who waits for an OK on this chore, and who doesn't (spec 14.4's hint under Needs a parent's OK). */
export function okText(d: ChoreDraft, members: Member[]): string {
  const people = members.filter(m => d.assignees.includes(m.id));
  const marked = d.needs_ok || d.needs_ok_always;
  if (!people.length) return marked ? 'Check-offs wait for an OK for people whose setting is marked chores.' : '';
  const waits = (m: Member) => !m.parent
    && (d.needs_ok_always || m.needs_ok_for === 'all' || (m.needs_ok_for === 'marked' && d.needs_ok));
  const waiting = people.filter(waits).map(m => m.name);
  if (!marked) {
    if (!waiting.length) return '';
    return waiting.length === 1
      ? `${waiting[0]}'s check-offs still wait for an OK: every chore of ${waiting[0]}'s needs one.`
      : `Check-offs by ${names(waiting)} still wait for an OK: every chore of theirs needs one.`;
  }
  const parents = people.filter(m => m.parent).map(m => m.name);
  const others = people.filter(m => !m.parent && !waits(m)).map(m => m.name);
  const parts: string[] = [];
  if (waiting.length === 1) parts.push(`${waiting[0]}'s check-offs wait for an OK.`);
  else if (waiting.length) parts.push(`Check-offs by ${names(waiting)} wait for an OK.`);
  if (parents.length === 1) parts.push(`${parents[0]} is a parent, so ${parents[0]}'s count right away.`);
  else if (parents.length) parts.push(`${names(parents)} are parents, so theirs count right away.`);
  if (others.length) parts.push(`Check-offs by ${names(others)} count right away.`);
  return parts.join(' ');
}

/** The hint under When (spec 14.4). */
export function whenText(d: ChoreDraft): string {
  if (d.per === 'week' && !d.days.length && !d.time_of_day.length) {
    return 'No days or times picked, so any time this week works. It waits under This week on the board.';
  }
  if (d.per === 'week' && d.days.length > 1) return `${durationText(d.minutes)} split across ${d.days.length} days.`;
  if (d.per === 'day' && d.days.length) return 'Only on the days picked.';
  return '';
}

/** The hint under a Once chore's dates. */
export function onceText(d: ChoreDraft, today: string): string {
  const sessions = d.sessions > 1 ? ' Each session is its own check-off.' : '';
  if (d.once_when === 'on') return `On the board on ${longDate(d.date)}.${sessions}`;
  if (d.once_when === 'by') {
    return d.date === today ? `On the board today.${sessions}` : `On the board from today until ${dayText(d.date, today)}.${sessions}`;
  }
  return `On the board until it's done.${sessions}`;
}

const POLICY_WORDS: Record<string, string> = {
  make_up: 'make it up within the week',
  strict: 'strict days, so it counts as missed',
  carry_over: 'carry it over until done',
};

/** The hint under Each time, with the house rule (spec 14.4). */
export function windowText(policy: string): string {
  return `Not done on the day? The house rule decides. Right now that's: ${POLICY_WORDS[policy] ?? POLICY_WORDS.make_up}.`;
}

/** The ready-to-copy example (spec 14.4: Use in automations). */
export function automationExample(choreId: string, memberId: string | undefined): string {
  return `action: planavista.complete_chore\ndata:\n  member: ${memberId ?? 'casey'}\n  chore: ${choreId}`;
}
