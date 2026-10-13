import { describe, expect, it } from 'vitest';
import { dayRing } from '../src/modules/calendar/components/view-day';

describe('dayRing (spec 13.9)', () => {
  it('fills with today\'s chores, Waiting for approval counted as done', () => {
    expect(dayRing('Casey', { done: 1, pending: 1, due: 4 })).toEqual({
      fraction: 0.5, closed: false, label: 'Casey, 2 of 4 done today. Open Casey\'s day',
    });
  });

  it('closes when everything due is done', () => {
    expect(dayRing('Blair', { done: 5, pending: 0, due: 5 })).toMatchObject({ fraction: 1, closed: true, label: 'Blair, ring closed for today. Open Blair\'s day' });
  });

  it('draws no ring for someone with nothing due, or without chores', () => {
    expect(dayRing('Alex', { done: 0, pending: 0, due: 0 })).toBeNull();
    expect(dayRing('Alex', null)).toBeNull();
  });
});
