import { describe, expect, it } from 'vitest';
import { PLACE_MS, placeKey, readPlace, usablePlace, writePlace } from '../src/core/place';

const KEY = placeKey('/wall-calendar/chores', { type: 'custom:planavista-card', module: 'chores' });
const AT = 1_000_000_000;

describe('coming back where you were (milestone 8, spec 3.7)', () => {
  it('each card on each dashboard has its own place', () => {
    expect(placeKey('/wall-calendar/chores', { module: 'chores', type: 'custom:planavista-card' })).toBe(KEY);
    expect(placeKey('/wall-calendar/planavista', { type: 'custom:planavista-card', module: 'chores' })).not.toBe(KEY);
    expect(placeKey('/wall-calendar/chores', { type: 'custom:planavista-card' })).not.toBe(KEY);
  });

  it('comes back within an hour of being on screen, and not after', () => {
    const raw = writePlace(null, KEY, { module: 'chores', views: { chores: 'week', calendar: 'month' } }, AT);
    expect(readPlace(raw, KEY, AT + PLACE_MS - 1)).toEqual({ module: 'chores', views: { chores: 'week', calendar: 'month' }, at: AT });
    expect(readPlace(raw, KEY, AT + PLACE_MS)).toBeNull();
    expect(readPlace(raw, 'another card', AT)).toBeNull();
  });

  it('forgets places older than an hour when it writes, and survives anything odd in storage', () => {
    const old = writePlace(null, 'old card', { module: 'calendar', views: {} }, AT);
    const raw = writePlace(old, KEY, { module: 'chores', views: {} }, AT + PLACE_MS + 1);
    expect(Object.keys(JSON.parse(raw))).toEqual([KEY]);
    expect(readPlace('not json', KEY, AT)).toBeNull();
    expect(readPlace(JSON.stringify({ [KEY]: { module: 7 } }), KEY, AT)).toBeNull();
    expect(Object.keys(JSON.parse(writePlace('[1,2]', KEY, { module: 'chores', views: {} }, AT)))).toEqual([KEY]);
  });

  it('only a module the card still shows, and only views that module has (dates are never remembered)', () => {
    const modules = [
      { id: 'calendar', views: [{ id: 'day' }, { id: 'week' }] },
      { id: 'chores', views: [{ id: 'board' }, { id: 'week' }] },
    ];
    const place = { module: 'chores', views: { chores: 'week', calendar: 'agenda' }, at: AT };
    expect(usablePlace(place, modules)).toEqual({ module: 'chores', views: { chores: 'week' } });
    expect(usablePlace({ ...place, module: 'photos' }, modules)).toBeNull();
    expect(usablePlace(null, modules)).toBeNull();
  });
});
