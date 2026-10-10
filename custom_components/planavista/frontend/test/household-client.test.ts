import { afterEach, describe, expect, it, vi } from 'vitest';
import { HouseholdApi, HouseholdConnection, HouseholdSubscription, errorCode, retryDelayMs } from '../src/core/household-client';
import { HouseholdView } from '../src/core/household';

type Listener = () => void;

/** A connection whose subscribes stay pending until resolveAll() or failAll(), and that can reconnect. */
function fakeConnection() {
  const callbacks: Array<(view: HouseholdView) => void> = [];
  const options: Array<Record<string, unknown> | undefined> = [];
  const unsubscribed: number[] = [];
  const pending: Array<{ resolve: () => void; reject: (err: unknown) => void }> = [];
  const listeners = new Map<string, Listener[]>();
  const subscribeMessage = vi.fn((
    callback: (view: HouseholdView) => void,
    _message: Record<string, unknown>,
    opts?: Record<string, unknown>,
  ) => {
    const index = callbacks.push(callback) - 1;
    options.push(opts);
    return new Promise<() => void>((resolve, reject) => {
      pending.push({ resolve: () => resolve(() => { unsubscribed.push(index); }), reject });
    });
  });
  const connection: HouseholdConnection = {
    subscribeMessage,
    addEventListener: (event, listener) => listeners.set(event, [...(listeners.get(event) ?? []), listener]),
    removeEventListener: (event, listener) => listeners.set(event, (listeners.get(event) ?? []).filter(l => l !== listener)),
  };
  return {
    connection,
    subscribeMessage,
    callbacks,
    options,
    unsubscribed,
    listeners,
    resolveAll: () => pending.splice(0).forEach(p => p.resolve()),
    failAll: (err: unknown) => pending.splice(0).forEach(p => p.reject(err)),
    fire: (event: string) => (listeners.get(event) ?? []).forEach(listener => listener()),
  };
}

const VIEW = { available: true, members: [] } as unknown as HouseholdView;
const LATER = { available: true, members: [{ id: 'alex' }] } as unknown as HouseholdView;

async function settle(): Promise<void> {
  for (let i = 0; i < 4; i++) await Promise.resolve();
}

afterEach(() => {
  vi.useRealTimers();
});

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
    vi.useFakeTimers();
    const views: Array<HouseholdView | null> = [];
    const fake = fakeConnection();
    new HouseholdSubscription(view => views.push(view)).update(fake.connection);
    fake.failAll({ code: 'unknown_command' });
    await settle();
    expect(views).toEqual([null]);
  });

  it('subscribes again after a reconnect, since the socket library would drop a failed resubscribe', async () => {
    const views: Array<HouseholdView | null> = [];
    const fake = fakeConnection();
    new HouseholdSubscription(view => views.push(view)).update(fake.connection);
    expect(fake.options[0]).toEqual({ resubscribe: false });
    fake.resolveAll();
    await settle();
    fake.callbacks[0](VIEW);

    fake.fire('ready');
    expect(fake.subscribeMessage).toHaveBeenCalledTimes(2);
    expect(fake.options[1]).toEqual({ resubscribe: false });
    fake.resolveAll();
    await settle();
    // The old subscription died with the old socket; its id may belong to a new command now.
    expect(fake.unsubscribed).toEqual([]);
    fake.callbacks[0](VIEW);
    fake.callbacks[1](LATER);
    expect(views).toEqual([VIEW, LATER]);
  });

  it('keeps trying after a reconnect until PlanaVista answers, keeping the last view meanwhile', async () => {
    vi.useFakeTimers();
    const views: Array<HouseholdView | null> = [];
    const fake = fakeConnection();
    new HouseholdSubscription(view => views.push(view)).update(fake.connection);
    fake.resolveAll();
    await settle();
    fake.callbacks[0](VIEW);

    // Home Assistant restarted: the socket is back before PlanaVista's commands are.
    fake.fire('ready');
    fake.failAll({ code: 'unknown_command' });
    await settle();
    expect(views).toEqual([VIEW]);
    await vi.advanceTimersByTimeAsync(retryDelayMs(0) - 1);
    expect(fake.subscribeMessage).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(1);
    expect(fake.subscribeMessage).toHaveBeenCalledTimes(3);
    fake.failAll({ code: 'not_loaded' });
    await settle();
    await vi.advanceTimersByTimeAsync(retryDelayMs(1));
    expect(fake.subscribeMessage).toHaveBeenCalledTimes(4);
    fake.resolveAll();
    await settle();
    fake.callbacks[3](LATER);
    expect(views).toEqual([VIEW, LATER]);
  });

  it('waits longer after each failed try, up to 30 seconds', () => {
    expect([0, 1, 2, 3, 4, 5, 6, 9].map(retryDelayMs)).toEqual([1000, 2000, 4000, 8000, 16000, 30000, 30000, 30000]);
  });

  it('stops following reconnects and cancels a waiting try when stopped', async () => {
    vi.useFakeTimers();
    const fake = fakeConnection();
    const subscription = new HouseholdSubscription(() => undefined);
    subscription.update(fake.connection);
    fake.failAll({ code: 'not_loaded' });
    await settle();
    subscription.stop();
    expect(fake.listeners.get('ready')).toEqual([]);
    await vi.advanceTimersByTimeAsync(60_000);
    fake.fire('ready');
    expect(fake.subscribeMessage).toHaveBeenCalledTimes(1);
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

  it('tells the card when the backend no longer knows its session', async () => {
    const refusal = { code: 'parent_mode_required', message: "A parent's PIN is needed on this screen." };
    const ws = { callWS: <T>(_message: Record<string, unknown>) => Promise.reject(refusal) as Promise<T> };
    const ended: string[] = [];
    let token: string | null = 'abc';
    const api = new HouseholdApi(ws, () => token, ended.push.bind(ended));
    await expect(api.saveConfig({ display: { time_format: '24h' } })).rejects.toBe(refusal);
    expect(ended).toEqual(['abc']);

    // Without a session there is nothing to end.
    token = null;
    await expect(api.reorder(['dana'])).rejects.toBe(refusal);
    expect(ended).toEqual(['abc']);
  });

  it('reads the code of a failed command', () => {
    expect(errorCode({ code: 'parent_mode_required', message: 'x' })).toBe('parent_mode_required');
    expect(errorCode(new Error('boom'))).toBe('unknown');
    expect(errorCode(undefined)).toBe('unknown');
  });
});
