import { describe, expect, it } from 'vitest';
import { ConnectionEvents, ConnectionWatch } from '../src/core/connection-watch';

type Listener = () => void;

function fakeConnection() {
  const listeners = new Map<string, Listener[]>();
  const connection: ConnectionEvents = {
    addEventListener: (event, listener) => listeners.set(event, [...(listeners.get(event) ?? []), listener]),
    removeEventListener: (event, listener) => listeners.set(event, (listeners.get(event) ?? []).filter(l => l !== listener)),
  };
  const count = () => [...listeners.values()].reduce((sum, list) => sum + list.length, 0);
  const fire = (event: string) => (listeners.get(event) ?? []).forEach(listener => listener());
  return { connection, count, fire };
}

describe('ConnectionWatch', () => {
  it('calls back when the connection drops and when it comes back', () => {
    let drops = 0;
    const fake = fakeConnection();
    new ConnectionWatch(() => { drops++; }).follow(fake.connection);
    fake.fire('disconnected');
    expect(drops).toBe(1);
    fake.fire('ready');
    expect(drops).toBe(2);
  });

  it('follows one connection at a time and lets go when stopped', () => {
    let drops = 0;
    const first = fakeConnection();
    const second = fakeConnection();
    const watch = new ConnectionWatch(() => { drops++; });
    watch.follow(first.connection);
    watch.follow(first.connection);
    expect(first.count()).toBe(2);
    watch.follow(second.connection);
    expect(first.count()).toBe(0);
    first.fire('disconnected');
    expect(drops).toBe(0);
    watch.stop();
    expect(second.count()).toBe(0);
    second.fire('ready');
    expect(drops).toBe(0);
    watch.follow(undefined);
    expect(drops).toBe(0);
  });
});
