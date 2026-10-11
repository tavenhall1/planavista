import type { ChoresSettings } from '../chores-types';
import { clockText } from './chores-list-derive';

/** The missed-chore rules (spec 14.5, 8.10), as the Rules page offers them. */
export const POLICIES: Array<{ id: ChoresSettings['missed']; label: string; short: string; description: string }> = [
  {
    id: 'make_up',
    label: 'Make it up within the week',
    short: 'Make it up',
    description: 'Missed on its day? It moves to This week, and only counts as missed if the week ends first.',
  },
  { id: 'strict', label: 'Strict days', short: 'Strict days', description: 'A chore not done on its day is missed.' },
  {
    id: 'carry_over',
    label: 'Carry it over until done',
    short: 'Carry it over',
    description: "Nothing is missed. It stays on the board, marked overdue, until it's done or excused.",
  },
];

/** The Rules row's value in Settings ("Make it up"). */
export function rulesSummary(settings: Pick<ChoresSettings, 'missed'>): string {
  return POLICIES.find(p => p.id === settings.missed)?.short ?? POLICIES[0].short;
}

/** When a chore day may start: midnight to 6:00 AM in half hours (the engine allows up to 6:00). */
export function dayStartChoices(timeFormat = '12h'): Array<{ value: string; label: string }> {
  const choices: Array<{ value: string; label: string }> = [];
  for (let half = 0; half <= 12; half++) {
    const value = `${String(Math.floor(half / 2)).padStart(2, '0')}:${half % 2 ? '30' : '00'}`;
    choices.push({ value, label: clockText(value, timeFormat) });
  }
  return choices;
}

/** Evening check times: 4:00 PM to 10:00 PM in half hours, and the saved one if it's another. */
export function eveningChoices(current: string | null, timeFormat = '12h'): Array<{ value: string; label: string }> {
  const choices: Array<{ value: string; label: string }> = [];
  for (let half = 32; half <= 44; half++) {
    const value = `${String(Math.floor(half / 2)).padStart(2, '0')}:${half % 2 ? '30' : '00'}`;
    choices.push({ value, label: clockText(value, timeFormat) });
  }
  if (current && !choices.some(c => c.value === current)) {
    choices.push({ value: current, label: clockText(current, timeFormat) });
    choices.sort((a, b) => a.value.localeCompare(b.value));
  }
  return choices;
}

/** Minutes per star: 5-minute steps from 5 to 60, then 15-minute steps to 240 (the engine allows 1 to 240). */
export function nextMinutesPerStar(current: number, up: boolean): number {
  if (up) return Math.min(240, current < 60 ? Math.floor(current / 5) * 5 + 5 : current + 15);
  return Math.max(5, current <= 60 ? Math.ceil(current / 5) * 5 - 5 : current - 15);
}
