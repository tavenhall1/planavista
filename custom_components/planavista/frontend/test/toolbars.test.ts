import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { weekRangeLabel } from '../src/utils/date-utils';
import { showsToday } from '../src/modules/calendar/view-words';

const read = (path: string) => readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf-8');

describe('one toolbar grammar for both Week views (milestone 8, spec 3.11)', () => {
  it('names a week by its range, the same way in both', () => {
    expect(weekRangeLabel(new Date(2026, 9, 12), new Date(2026, 9, 18))).toBe('October 12 – 18');
    expect(weekRangeLabel(new Date(2026, 8, 28), new Date(2026, 9, 4))).toBe('September 28 – October 4');
  });

  it('knows when a view already shows today, so Today goes quiet', () => {
    const today = new Date(2026, 9, 12, 15, 0);
    expect(showsToday('day', new Date(2026, 9, 12, 9), today, 'sunday')).toBe(true);
    expect(showsToday('day', new Date(2026, 9, 13), today, 'sunday')).toBe(false);
    expect(showsToday('week', new Date(2026, 9, 17), today, 'sunday')).toBe(true);
    expect(showsToday('week', new Date(2026, 9, 18), today, 'sunday')).toBe(false);
    expect(showsToday('month', new Date(2026, 9, 31), today, 'sunday')).toBe(true);
    expect(showsToday('month', new Date(2026, 10, 1), today, 'sunday')).toBe(false);
    expect(showsToday('agenda', new Date(2026, 9, 12), today, 'sunday')).toBe(true);
    expect(showsToday('agenda', new Date(2026, 9, 11), today, 'sunday')).toBe(false);
  });

  it('chores Week has round arrows and a This week that is always there, quiet on this week', () => {
    const week = read('modules/chores/pv-chores-week.ts');
    expect(week).toMatch(/class="nav"[^>]*aria-label="Last week"[\s\S]{0,200}mdi:chevron-left/);
    expect(week).toMatch(/class="pv-btn pv-btn-secondary this-week" type="button" \?disabled=\$\{this\.current\}/);
    expect(read('modules/calendar/calendar-module.ts')).toMatch(/class="pvc-today-btn" type="button" \?disabled=\$\{onToday\}/);
  });

  it('Month\'s title is left aligned like Week\'s', () => {
    const rule = /\.month-name \{([^}]*)\}/.exec(read('modules/calendar/components/view-month.ts'))?.[1] ?? '';
    expect(rule).toMatch(/text-align:\s*left/);
  });

  it('time ranges use an en dash everywhere, My day included', () => {
    expect(read('modules/chores/my-day-derive.ts')).not.toMatch(/\} to \$\{/);
  });
});
