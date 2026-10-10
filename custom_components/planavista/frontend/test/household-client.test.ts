import { describe, expect, it, vi } from 'vitest';
import { HouseholdApi, HouseholdConnection, HouseholdSubscription, errorCode } from '../src/core/household-client';
import { HouseholdView } from '../src/core/household';

/** A connection whose subscribes stay pending until resolveAll(). */
function fakeConnection() {
  const callbacks: Array<(view: HouseholdView) => void> = [];
  const unsubscribed: number[] = [];
  const pending: Array<() => void> = [];
  const subscribeMessage = vi.fn((callback: (view: HouseholdView) => void, _message: Record<string, unknown>) => {
    const index = callbacks.push(callback) - 1;
    return new Promise<() => void>(resolve => {
      pending.push(() => resolve(() => { unsubscribed.push(index); }));
    });
  });
  const connection: HouseholdConnection = { subscribeMessage };
  return { connection, subscribeMessage, callbacks, unsubscribed, resolveAll: () => pending.splice(0).forEach(run => run()) };
}

const VIEW = { available: true, members: [] } as unknown as HouseholdView;

async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe('HouseholdSubscription', () => {
  it('subscribes once per connection and passes views on', async () => {
    const views: Array<HouseholdView | null> = [];
    const fake = fakeConnection();
    const subscription = new HouseholdSubscription(view => views.push(view));
    subscription.update(fake.connection);
    subscription.update(fake.connection);
    expect(fake.subscribeMessage).toHaveBeenCalledTimes(1);
    fake.resolveAll();
    await settle();
    fake.callbacks[0](VIEW);
    expect(views).toEqual([VIEW]);
  });

  it('drops a subscription that resolves after it was stopped', async () => {
    const views: Array<HouseholdView | null> = [];
    const fake = fakeConnection();
    const subscription = new HouseholdSubscription(view => views.push(view));
    subscription.update(fake.connection);
    subscription.stop();
    fake.resolveAll();
    await settle();
    expect(fake.unsubscribed).toEqual([0]);
    fake.callbacks[0](VIEW);
    expect(views).toEqual([]);
  });

  it('reports null when the backend has no household (an older PlanaVista)', async () => {
    const views: Array<HouseholdView | null> = [];
    const connection: HouseholdConnection = { subscribeMessage: () => Promise.reject({ code: 'unknown_command' }) };
    new HouseholdSubscription(view => views.push(view)).update(connection);
    await settle();
    expect(views).toEqual([null]);
  });
});

describe('HouseholdApi', () => {
  it('adds the session token to commands, except unlock and lock', async () => {
    const sent: Array<Record<string, unknown>> = [];
    const ws = { callWS: async <T>(message: Record<string, unknown>) => { sent.push(message); return {} as T; } };
    let token: string | null = 'abc';
    const api = new HouseholdApi(ws, () => token);
    await api.saveConfig({ display: { time_format: '24h' } });
    await api.saveMember({ name: 'Erin' }, { id: 'erin', rev: 3 });
    await api.unlock('blair', '4826');
    await api.lock('abc');
    token = null;
    await api.reorder(['dana', 'alex']);
    expect(sent).toEqual([
      { type: 'planavista/config/save', display: { time_format: '24h' }, session: 'abc' },
      { type: 'planavista/household/member/save', member: { name: 'Erin' }, member_id: 'erin', rev: 3, session: 'abc' },
      { type: 'planavista/pin/unlock', member_id: 'blair', pin: '4826' },
      { type: 'planavista/pin/lock', session: 'abc' },
      { type: 'planavista/household/member/reorder', order: ['dana', 'alex'] },
    ]);
  });

  it('reads the code of a failed command', () => {
    expect(errorCode({ code: 'parent_mode_required', message: 'x' })).toBe('parent_mode_required');
    expect(errorCode(new Error('boom'))).toBe('unknown');
    expect(errorCode(undefined)).toBe('unknown');
  });
});
