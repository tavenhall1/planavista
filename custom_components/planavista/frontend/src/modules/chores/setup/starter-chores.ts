import { Member, inOrder } from '../../../core/household';
import type { Activity, Band } from '../chores-types';
import { durationText } from '../settings/chores-list-derive';

/** Who a starter chore suits (spec 14.7's table). */
export type Suits = 'young_child' | 'kid' | 'teen' | 'adult';

export interface Starter {
  id: string;
  name: string;
  icon: string;
  category: string;
  /** daily, or weekly (on `days` when it has them). */
  rhythm: 'daily' | 'weekly';
  days: string[];
  /** About how long each time. */
  minutes: number;
  band: Band | null;
  suits: Suits;
  /** Picked to start with when someone it suits lives here (the approved setup screen picks eight). */
  picked: boolean;
}

/** The common chores starter list (spec 14.7). */
export const STARTERS: Starter[] = [
  { id: 'make_your_bed', name: 'Make your bed', icon: '🛏️', category: 'personal', rhythm: 'daily', days: [], minutes: 5, band: 'morning', suits: 'young_child', picked: true },
  { id: 'set_the_table', name: 'Set the table', icon: '🍴', category: 'kitchen', rhythm: 'daily', days: [], minutes: 10, band: 'evening', suits: 'young_child', picked: true },
  { id: 'tidy_toys', name: 'Tidy toys', icon: '🧸', category: 'cleaning', rhythm: 'daily', days: [], minutes: 15, band: 'evening', suits: 'young_child', picked: true },
  { id: 'unload_the_dishwasher', name: 'Unload the dishwasher', icon: '🍽️', category: 'kitchen', rhythm: 'daily', days: [], minutes: 10, band: 'morning', suits: 'kid', picked: true },
  { id: 'take_out_the_trash', name: 'Take out the trash', icon: '🗑️', category: 'home', rhythm: 'weekly', days: ['tue', 'fri'], minutes: 10, band: 'evening', suits: 'kid', picked: true },
  { id: 'feed_the_pet', name: 'Feed the pet', icon: '🐾', category: 'home', rhythm: 'daily', days: [], minutes: 5, band: 'morning', suits: 'kid', picked: false },
  { id: 'laundry', name: 'Laundry', icon: '🧺', category: 'cleaning', rhythm: 'weekly', days: [], minutes: 120, band: null, suits: 'adult', picked: true },
  { id: 'kitchen_cleanup', name: 'Kitchen cleanup', icon: '🧽', category: 'kitchen', rhythm: 'daily', days: [], minutes: 30, band: 'evening', suits: 'adult', picked: true },
  { id: 'vacuum', name: 'Vacuum', icon: '🧹', category: 'cleaning', rhythm: 'weekly', days: [], minutes: 60, band: null, suits: 'adult', picked: false },
  { id: 'clean_the_bathroom', name: 'Clean the bathroom', icon: '🛁', category: 'cleaning', rhythm: 'weekly', days: [], minutes: 60, band: null, suits: 'teen', picked: true },
  { id: 'yard_work', name: 'Yard work', icon: '🌿', category: 'home', rhythm: 'weekly', days: [], minutes: 60, band: null, suits: 'teen', picked: false },
  { id: 'groceries', name: 'Groceries', icon: '🛒', category: 'home', rhythm: 'weekly', days: [], minutes: 90, band: null, suits: 'adult', picked: false },
];

/** A starter as the parent set it up: who does it, how often, and about how long. */
export interface Pick {
  id: string;
  member: string | null;
  rhythm: 'daily' | 'weekly';
  days: string[];
  minutes: number;
  on: boolean;
}

function fits(member: Member, suits: Suits): boolean {
  if (suits === 'young_child') return member.age_group === 'young_child';
  if (suits === 'kid') return member.age_group === 'older_child' || member.age_group === 'teen';
  if (suits === 'teen') return member.age_group === 'teen' || member.age_group === 'older_child';
  return member.age_group === 'adult';
}

/**
 * Who each starter goes to (spec 14.7: suggested by age group, so young
 * children get quick, simple ones): the first person it suits, sharing the
 * grown-ups' chores out in turn. A chore nobody suits starts unpicked, with
 * no one, until the parent picks someone.
 */
export function suggestPicks(members: Member[]): Pick[] {
  const people = inOrder(members);
  const turns = new Map<Suits, number>();
  return STARTERS.map(starter => {
    const suited = people.filter(m => fits(m, starter.suits));
    const turn = turns.get(starter.suits) ?? 0;
    turns.set(starter.suits, turn + 1);
    const member = suited.length ? suited[turn % suited.length].id : null;
    return { id: starter.id, member, rhythm: starter.rhythm, days: starter.days, minutes: starter.minutes, on: starter.picked && member !== null };
  });
}

export function starterOf(id: string): Starter {
  return STARTERS.find(s => s.id === id)!;
}

/** A tile's line: "Daily · 5 min", "Tue, Fri · 10 min", "Weekly · 2 h". */
export function pickLine(pick: Pick): string {
  const names: Record<string, string> = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };
  const when = pick.rhythm === 'daily' ? 'Daily' : pick.days.length ? pick.days.map(d => names[d]).join(', ') : 'Weekly';
  return `${when} · ${durationText(pick.minutes)}`;
}

/** The main button: "Add 8 chores". */
export function addLabel(picks: Pick[]): string {
  const n = picks.filter(p => p.on && p.member).length;
  return n === 0 ? 'Add chores' : `Add ${n} ${n === 1 ? 'chore' : 'chores'}`;
}

/** Each pick as a normal Plan chore (spec 14.7: each pick becomes a normal chore). */
export function pickActivity(pick: Pick): Partial<Activity> {
  const starter = starterOf(pick.id);
  const each = pick.rhythm === 'weekly' && pick.days.length ? pick.days.length : 1;
  return {
    name: starter.name,
    icon: starter.icon,
    category: starter.category,
    schedule: 'plan',
    assignees: pick.member ? [pick.member] : [],
    on_board: true,
    needs_ok: false,
    stars: null,
    minimum: { hours: (pick.minutes * each) / 60, per: pick.rhythm === 'daily' ? 'day' : 'week' },
    split: 'each',
    times: 1,
    days: pick.rhythm === 'weekly' ? pick.days : [],
    time_of_day: starter.band ? [starter.band] : [],
  };
}
