import { describe, expect, it } from 'vitest';
import { pinBeforeSharing, previewColumns, previewTotal } from '../src/modules/chores/setup/setup-derive';
import type { HouseholdView } from '../src/core/household';
import type { Session } from '../src/core/session';
import { MEMBERS, board, column, item } from './chores-fixtures';

describe('the board as setup shows it', () => {
  const sample = board({
    alex: column([item('kitchen_cleanup|alex|day:2026-10-13|0', { name: 'Kitchen cleanup' })]),
    blair: column([item('laundry|blair|week:2026-10-12|0', { name: 'Laundry', section: 'week' })]),
    casey: column([]),
    dana: column([]),
  });

  it('lists each person\'s chores today and this week', () => {
    const columns = previewColumns(MEMBERS, sample);
    expect(columns.map(c => [c.member.id, c.today, c.week, c.summary])).toEqual([
      ['alex', ['Kitchen cleanup'], [], '0 of 1 today'],
      ['blair', [], ['Laundry'], '1 this week'],
      ['casey', [], [], 'Nothing yet'],
      ['dana', [], [], 'Nothing yet'],
    ]);
  });

  it('adds what the parent just picked, before it is saved', () => {
    const columns = previewColumns(MEMBERS, null, [
      { member: 'casey', name: 'Take out the trash', week: false },
      { member: 'casey', name: 'Clean the bathroom', week: true },
    ]);
    expect(columns[2]).toMatchObject({ today: ['Take out the trash'], week: ['Clean the bathroom'], summary: '0 of 1 today' });
    expect(previewTotal(columns, null)).toBe('0 of 1 chore done today');
    expect(previewTotal(previewColumns(MEMBERS, sample, [{ member: 'dana', name: 'Tidy toys', week: false }]), sample)).toBe(
      '0 of 2 chores done today',
    );
  });
});

describe('marking this screen as shared during setup (spec 9.7, 14.7)', () => {
  const view = (kind: string, shared: boolean) => ({ account: { kind, shared } } as unknown as HouseholdView);
  const parent = { memberId: 'blair', parent: true } as unknown as Session;

  it("asks for a parent's PIN first, so the rest of setup still saves", () => {
    expect(pinBeforeSharing(view('admin', false), true, null)).toBe(true);
    expect(pinBeforeSharing(view('parent', false), true, null)).toBe(true);
  });

  it('needs nothing more in parent mode, for a screen already shared, or for No', () => {
    expect(pinBeforeSharing(view('admin', false), true, parent)).toBe(false);
    expect(pinBeforeSharing(view('shared', true), true, null)).toBe(false);
    expect(pinBeforeSharing(view('admin', false), false, null)).toBe(false);
  });
});
