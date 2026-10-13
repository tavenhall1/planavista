import type { Member } from '../../core/household';
import { dayDate } from '../../core/status-map';
import { perStarText, starsFor } from '../../core/stars';
import type { Activity } from './chores-types';
import { DayChip, addDays, chipLabel } from './options-derive';
import { pictureFor } from './picture-words';

export type When = 'today' | 'by' | 'repeats';
export type Every = 'daily' | 'weekly' | 'monthly';

/** Quick add's answers so far (spec 13.8). */
export interface QuickAddDraft {
  name: string;
  who: string[];
  when: When;
  /** The date to finish by. */
  by: string | null;
  every: Every;
  minutes: number;
  needsOk: boolean;
  /** A parent switched Needs a parent's approval themselves: it stops following the people picked. */
  needsOkSet: boolean;
  /** null: automatic (1 per the household's minutes per star). */
  stars: number | null;
}

/** About how long (spec 13.8): 5 min, 15 min, 30 min, 1 h, 2 h, or Other. */
export const MINUTE_CHOICES = [5, 15, 30, 60, 120];

export function newDraft(): QuickAddDraft {
  return { name: '', who: [], when: 'today', by: null, every: 'weekly', minutes: 15, needsOk: false, needsOkSet: false, stars: null };
}

/** Needs a parent's approval is on automatically for young children (spec 13.8). */
export function autoNeedsOk(who: string[], members: Member[]): boolean {
  return who.some(id => members.find(m => m.id === id)?.age_group === 'young_child');
}

/** The draft after picking people: Needs approval follows them until a parent sets it. */
export function withWho(draft: QuickAddDraft, who: string[], members: Member[]): QuickAddDraft {
  return { ...draft, who, needsOk: draft.needsOkSet ? draft.needsOk : autoNeedsOk(who, members) };
}

const SAT = 6;
const SUN = 0;

/** By a date: Tomorrow, the coming Saturday and Sunday (spec 13.8), and Pick a date. */
export function byChips(today: string): DayChip[] {
  const days = [addDays(today, 1)];
  for (const target of [SAT, SUN]) {
    const now = dayDate(today).getDay();
    const ahead = (target - now + 7) % 7 || 7;
    const day = addDays(today, ahead);
    if (!days.includes(day)) days.push(day);
  }
  return days.map(day => {
    const weekday = dayDate(day).getDay();
    const label = chipLabel(day, today);
    return { day, label: label === 'Tomorrow' ? label : weekday === SAT ? 'Saturday' : weekday === SUN ? 'Sunday' : label };
  });
}

const CODES = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function ordinal(n: number): string {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  return `${n}${['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;
}

/** The repeat choices, worded from today: Every day, Every Tuesday, Every month on the 13th. */
export function everyChoices(today: string): Array<{ id: Every; label: string }> {
  const date = dayDate(today);
  return [
    { id: 'daily', label: 'Every day' },
    { id: 'weekly', label: `Every ${WEEKDAY_NAMES[date.getDay()]}` },
    { id: 'monthly', label: `Every month on the ${ordinal(Math.min(28, date.getDate()))}` },
  ];
}

/** "Earns ★ 4 (1 per 15 minutes)" from the formula the engine uses (spec 8.3). */
export function worthLine(draft: QuickAddDraft, minutesPerStar: number): string {
  const stars = starsFor(draft.minutes, minutesPerStar, draft.stars);
  if (draft.stars !== null) return `Earns ★ ${stars} each time`;
  return `Earns ★ ${stars} (${perStarText(minutesPerStar)})`;
}

/** What's still missing, in plain words; null when it can be added. */
export function quickAddProblem(draft: QuickAddDraft, today: string): string | null {
  if (!draft.name.trim()) return 'Add what needs doing.';
  if (draft.who.length === 0) return 'Pick who does it.';
  if (draft.when === 'by' && (!draft.by || draft.by < today)) return 'Pick a day to finish by.';
  if (!Number.isFinite(draft.minutes) || draft.minutes < 1 || draft.minutes > 1440) return 'About how long is from 1 minute to 24 hours.';
  return null;
}

/** The chore quick add saves (planavista/chores/activity/save): a Once chore, or a simple Repeats one. */
export function activityFrom(draft: QuickAddDraft, today: string): Partial<Activity> {
  const name = draft.name.trim();
  const base: Partial<Activity> = {
    name,
    icon: pictureFor(name),
    category: 'other',
    assignees: [...draft.who],
    on_board: true,
    needs_ok: draft.needsOk,
    stars: draft.stars,
  };
  const minutes = Math.round(draft.minutes);
  if (draft.when === 'repeats') {
    const date = dayDate(today);
    const rrule = draft.every === 'daily'
      ? 'FREQ=DAILY'
      : draft.every === 'weekly'
        ? `FREQ=WEEKLY;BYDAY=${CODES[date.getDay()]}`
        : `FREQ=MONTHLY;BYMONTHDAY=${Math.min(28, date.getDate())}`;
    return { ...base, schedule: 'repeats', repeats: { rrule, start: today, window: 'day', estimate_minutes: minutes } };
  }
  return {
    ...base,
    schedule: 'once',
    once: {
      on: draft.when === 'today' ? today : null,
      by: draft.when === 'by' ? draft.by : null,
      by_time: null,
      sessions: 1,
      estimate_minutes: minutes,
    },
  };
}
