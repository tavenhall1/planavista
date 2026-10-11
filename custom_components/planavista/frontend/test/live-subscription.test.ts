import { afterEach, describe, expect, it, vi } from 'vitest';
import { LiveConnection, LiveStatus, LiveSubscription } from '../src/core/live-subscription';

type Listener = () => void;

function fakeConnection() {
  const callbacks: Array<(event: string) => void> = [];
  const pending: Array<{ resolve: () => void; reject: (err: unknown) => void }> = [];
  const listeners = new Map<string, Listener[]>();
  const connection: LiveConnection<string> = {
    subscribeMessage: vi.fn((callback: (event: string) => void) => {
      callbacks.push(callback);
      return new Promise<() => void>((resolve, reject) => {
        pending.push({ resolve: () => resolve(() => undefined), reject });
      });
    }),
    addEventListener: (event, listener) => listeners.set(event, [...(listeners.get(event) ?? []), listener]),
    removeEventListener: (event, listener) => listeners.set(event, (listeners.get(event) ?? []).filter(l => l !== listener)),
  };
  return {
    connection,
    callbacks,
    resolveAll: () => pending.splice(0).forEach(p => p.resolve()),
    failAll: (err: unknown) => pending.splice(0).forEach(p => p.reject(err)),
    fire: (event: string) => (listeners.get(event) ?? []).forEach(listener => listener()),
  };
}

async function settle(): Promise<void> {
  for (let i = 0; i < 4; i++) await Promise.resolve();
}

afterEach(() => {
  vi.useRealTimers();
});

describe('LiveSubscription status', () => {
  it('goes from connecting to live, offline on a drop, and live again after the reconnect', async () => {
    const statuses: LiveStatus[] = [];
    const fake = fakeConnection();
    const sub = new LiveSubscription<string>({ type: 'x' }, () => undefined, status => statuses.push(status));
    sub.update(fake.connection);
    fake.resolveAll();
    await settle();
    fake.fire('disconnected');
    fake.fire('ready');
    fake.resolveAll();
    await settle();
    expect(statuses).toEqual(['connecting', 'live', 'offline', 'live']);
  });

  it('is offline while refused and tries again, now when asked', async () => {
    vi.useFakeTimers();
    const statuses: LiveStatus[] = [];
    const events: Array<string | null> = [];
    const fake = fakeConnection();
    const sub = new LiveSubscription<string>({ type: 'x' }, event => events.push(event), status => statuses.push(status));
    sub.update(fake.connection);
    fake.failAll({ code: 'not_loaded' });
    await settle();
    expect(statuses).toEqual(['connecting', 'offline']);
    expect(events).toEqual([null]);
    sub.retry();
    fake.resolveAll();
    await settle();
    expect(statuses.at(-1)).toBe('live');
    fake.callbacks.at(-1)?.('board');
    expect(events.at(-1)).toBe('board');
  });

  it('is idle once stopped', async () => {
    const statuses: LiveStatus[] = [];
    const fake = fakeConnection();
    const sub = new LiveSubscription<string>({ type: 'x' }, () => undefined, status => statuses.push(status));
    sub.update(fake.connection);
    sub.stop();
    expect(statuses).toEqual(['connecting', 'idle']);
  });
});
