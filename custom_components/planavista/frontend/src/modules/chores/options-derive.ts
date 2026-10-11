import type { Member } from '../../core/household';
import type { Access, ParentAccess } from '../../core/access';
import { dayDate, daysBetween, minutesText } from '../../core/status-map';
import type { Activity, Band, ChoreHistory, ItemView } from './chores-types';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CODES = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export type OptionId =
  | 'plan_day' | 'more_time' | 'skip' | 'done_by' | 'history' | 'undo'
  | 'change_due' | 'hand_off' | 'excuse' | 'edit' | 'delete' | 'approve' | 'send_back';

/** A day to pick in a sheet ("Tomorrow", "Sat", "Next Sat"). */
export interface DayChip {
  day: string;
  label: string;
  on?: boolean;
}

export interface OptionModel {
  id: OptionId;
  label: string;
  hint?: string;
  /** Says what unlocks it ("🔒 parent", "🔒 Casey's PIN"), or that it asks the parents ("needs OK"). */
  tag?: string;
  chips?: DayChip[];
  /** A date picker for anything the chips don't offer. */
  pick?: { min: string; max?: string };
  destructive?: boolean;
  disabled?: boolean;
}

export interface OptionsContext {
  item: ItemView;
  activity: Activity | undefined;
  owner: Member;
  members: Member[];
  /** Today's chore day, YYYY-MM-DD. */
  today: string;
  member: Access;
  parent: ParentAccess;
}

export interface OptionsModel {
  title: string;
  /** "Alex · Once · by Saturday · 30 min". */
  meta: string;
  /** "Added by Blair on Sunday". */
  added: string | null;
  /** "Sent back: edges", or a request still waiting. */
  note: string | null;
  member: OptionModel[];
  parent: OptionModel[];
}

/** A day `n` days after `day` (YYYY-MM-DD). */
export function addDays(day: string, n: number): string {
  const date = dayDate(day);
  date.setDate(date.getDate() + n);
  const pad = (v: number) => String(v).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** "Tomorrow", "Sat" within the week, "Next Sat" the week after, then "Oct 31". */
export function chipLabel(day: string, today: string): string {
  const days = daysBetween(today, day);
  const date = dayDate(day);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days > 1 && days <= 6) return SHORT[date.getDay()];
  if (days >= 7 && days <= 13) return `Next ${SHORT[date.getDay()]}`;
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

/** "Saturday" within a week, else "October 31" (sentences: "Shows on Saturday"). */
export function dayWords(day: string, today: string): string {
  const days = daysBetween(today, day);
  const date = dayDate(day);
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (Math.abs(days) <= 6) return WEEKDAYS[date.getDay()];
  return `${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][date.getMonth()]} ${date.getDate()}`;
}

function listDays(codes: string[]): string {
  const names = codes.map(code => SHORT[CODES.indexOf(code)] ?? code);
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/** How often a chore comes ("Every day", "Mon and Thu", "Once · by Saturday", "Repeats"). */
export function rhythmText(activity: Activity | undefined, item: ItemView, today: string): string {
  if (!activity) return '';
  if (activity.schedule === 'plan') {
    const days = activity.days ?? [];
    if (activity.minimum?.per === 'day') return days.length ? listDays(days) : 'Every day';
    return days.length ? listDays(days) : 'Every week';
  }
  if (activity.schedule === 'once') {
    const once = activity.once;
    if (once?.on) return `Once · on ${dayWords(once.on, today)}`;
    if (item.dated && item.due_day) return `Once · by ${dayWords(item.due_day, today)}`;
    return 'Once · any time';
  }
  const rule = activity.repeats?.rrule ?? '';
  if (rule.includes('FREQ=DAILY')) return 'Repeats daily';
  if (rule.includes('FREQ=MONTHLY')) return 'Repeats monthly';
  return 'Repeats weekly';
}

/** Days it may be shown on instead (Plan it for a day): tomorrow up to the day it's due, at most a week. */
export function planChips(item: ItemView, today: string): DayChip[] {
  if (!item.due_day || item.window === 'day') return [];
  const last = Math.min(daysBetween(today, item.due_day), 6);
  const chips: DayChip[] = [];
  for (let n = 1; n <= last; n++) {
    const day = addDays(today, n);
    chips.push({ day, label: chipLabel(day, today) });
  }
  return chips;
}

/** New due dates a parent can pick: the day after, and a week later; tomorrow and the week's end for one with none. */
export function dueChips(item: ItemView, today: string): DayChip[] {
  const base = item.due_day && daysBetween(today, item.due_day) >= 0 ? item.due_day : today;
  const days = item.due_day ? [addDays(base, 1), addDays(base, 7)] : [addDays(today, 1), addDays(today, 7)];
  return days.map(day => ({ day, label: chipLabel(day, today) }));
}

/** Days to ask for (Ask for more time): later than it's due now. */
export function moreTimeChips(item: ItemView, today: string): DayChip[] {
  const base = item.due_day && daysBetween(today, item.due_day) >= 0 ? item.due_day : today;
  return [addDays(base, 1), addDays(base, 2), addDays(base, 7)].map(day => ({ day, label: chipLabel(day, today) }));
}

function names(people: Member[]): string {
  const list = people.map(p => p.name);
  if (list.length <= 1) return list.join('');
  return `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}`;
}

function addedLine(activity: Activity | undefined, members: Member[], today: string): string | null {
  const created = activity?.created;
  if (!created?.at) return null;
  const who = members.find(m => m.id === created.by)?.name ??
    (created.by === 'automation' ? 'an automation' : created.by === 'admin' ? 'an admin' : null);
  const day = created.at.slice(0, 10);
  const when = daysBetween(day, today) === 0 ? 'today' : `on ${dayWords(day, today)}`;
  return who ? `Added by ${who} ${when}` : `Added ${when}`;
}

/** What the options sheet offers, depending on who's looking (spec 13.3). */
export function itemOptions(ctx: OptionsContext): OptionsModel {
  const { item, activity, owner, members, today } = ctx;
  const parents = members.filter(m => m.parent && m.id !== owner.id);
  const ownerIsParent = owner.parent;
  const memberTag = ctx.member === 'pin' ? `🔒 ${owner.name}'s PIN` : undefined;
  const parentTag = ctx.parent === 'pin' ? '🔒 parent' : ctx.parent === 'no_pin' ? 'needs a parent\'s PIN' : undefined;
  const status = item.status;
  const open = status === 'open' || status === 'sent_back';
  const member: OptionModel[] = [];
  const parent: OptionModel[] = [];
  const due = item.due_day;
  const memberMay = ctx.member !== 'no';

  if (open && memberMay) {
    const chips = planChips(item, today);
    if (chips.length) {
      member.push({
        id: 'plan_day', label: 'Plan it for a day', tag: memberTag, chips,
        hint: due ? `Shows on that day, and it's still due ${dayWords(due, today)}.` : 'Shows on that day.',
      });
    }
    if (!ownerIsParent && due && !item.request) {
      member.push({
        id: 'more_time', label: 'Ask for more time', tag: 'needs OK', chips: moreTimeChips(item, today),
        pick: { min: addDays(due, 1), max: addDays(today, 60) },
        hint: parents.length ? `Sends a request to ${names(parents)}.` : 'Sends a request to the parents.',
      });
      member.push({ id: 'skip', label: 'Ask to skip this week', tag: 'needs OK', hint: 'Sick, away, rained out…' });
    }
    member.push({ id: 'done_by', label: 'Done by someone else…', tag: memberTag, hint: 'They get the credit.' });
  }
  if ((status === 'done' || status === 'pending') && memberMay) {
    member.push({ id: 'undo', label: 'Uncheck it', tag: memberTag, hint: 'It goes back on the list.' });
    if (status === 'done') member.push({ id: 'done_by', label: 'Done by someone else…', tag: memberTag, hint: 'Change who gets the credit.' });
  }
  member.push({ id: 'history', label: 'History', hint: 'The streak, recent check-offs, and when it usually gets done.' });

  if (ctx.parent !== 'no') {
    if (status === 'pending') {
      parent.push({ id: 'approve', label: 'Looks good', tag: parentTag, hint: 'Approves it, and the stars are earned.' });
      parent.push({ id: 'send_back', label: 'Send back', tag: parentTag, hint: 'It goes back on the list with a note.' });
    }
    if (open) {
      parent.push({
        id: 'change_due', label: 'Change the due date', tag: parentTag, chips: dueChips(item, today),
        pick: { min: today }, hint: due ? `Due ${dayWords(due, today)} now.` : 'It has no due date now.',
      });
      parent.push({ id: 'hand_off', label: 'Hand it to someone else', tag: parentTag, hint: 'Just this time.' });
      parent.push({ id: 'excuse', label: 'Excuse it', tag: parentTag, hint: 'A sick day: nothing is missed, and the streak holds.' });
    }
    parent.push({ id: 'edit', label: 'Edit the chore', tag: parentTag, hint: 'Opens it in Settings.' });
    parent.push({ id: 'delete', label: 'Delete the chore', tag: parentTag, destructive: true, hint: 'It leaves the board for everyone.' });
  }

  const minutes = item.window === 'once' && activity?.once ? activity.once.estimate_minutes : item.credit_minutes;
  const metaParts = [owner.name, rhythmText(activity, item, today), minutesText(minutes)];
  if (owner.stars && item.stars > 0) metaParts.push(`★ ${item.stars}`);
  const request = item.request
    ? item.request.kind === 'more_time' && item.request.until
      ? `Waiting for a parent: more time, until ${dayWords(item.request.until, today)}.`
      : 'Waiting for a parent: skip this week.'
    : null;
  return {
    title: item.name,
    meta: metaParts.filter(Boolean).join(' · '),
    added: addedLine(activity, members, today),
    note: status === 'sent_back' ? (item.note ? `Sent back: ${item.note}` : 'Sent back') : request,
    member,
    parent,
  };
}

const BAND_WORDS: Record<Band, string> = { morning: 'in the morning', afternoon: 'in the afternoon', evening: 'in the evening' };
const PLURAL: Record<string, string> = {
  mon: 'Mondays', tue: 'Tuesdays', wed: 'Wednesdays', thu: 'Thursdays', fri: 'Fridays', sat: 'Saturdays', sun: 'Sundays',
};

/** The History lines (spec 13.3): the streak, how often lately, the last time, and when it usually gets done. */
export function historyLines(history: ChoreHistory, today: string, members: Member[], timeFormat: '12h' | '24h'): string[] {
  const lines: string[] = [];
  if (history.streak.days) lines.push(`🔥 ${history.streak.days} ${history.streak.days === 1 ? 'day' : 'days'} in a row`);
  if (history.streak.weeks) lines.push(`🔥 ${history.streak.weeks} ${history.streak.weeks === 1 ? 'week' : 'weeks'} in a row`);
  if (history.weeks.of > 0 && history.streak.days === undefined) {
    lines.push(`Done ${history.weeks.done} of the last ${history.weeks.of} ${history.weeks.of === 1 ? 'week' : 'weeks'}`);
  }
  const last = history.recent[0];
  if (last) {
    const at = new Date(last.at);
    const day = last.at.slice(0, 10);
    const hour = timeFormat === '24h'
      ? `${at.getHours()}:${String(at.getMinutes()).padStart(2, '0')}`
      : `${at.getHours() % 12 || 12}:${String(at.getMinutes()).padStart(2, '0')} ${at.getHours() >= 12 ? 'PM' : 'AM'}`;
    const by = last.done_by !== history.member ? members.find(m => m.id === last.done_by)?.name : null;
    lines.push(`Last done ${dayWords(day, today)} at ${hour}${by ? ` by ${by}` : ''}`);
  } else {
    lines.push('Not done yet');
  }
  const { band, day } = history.usual;
  if (day && band) lines.push(`Usually ${PLURAL[day]} ${BAND_WORDS[band]}`);
  else if (band) lines.push(`Usually ${BAND_WORDS[band]}`);
  return lines;
}
