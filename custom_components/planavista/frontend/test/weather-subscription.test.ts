import { describe, expect, it, vi } from 'vitest';
import {
  ForecastSubscription,
  buildForecastMap,
  type ForecastConnection,
  type ForecastEntry,
  todayHighLow,
} from '../src/utils/weather-subscription';

/** A connection whose subscribe calls resolve only when the test says so. */
function fakeConnection() {
  const pending: Array<{
    message: Record<string, unknown>;
    callback: (msg: { forecast?: ForecastEntry[] }) => void;
    resolve: (unsub: () => void) => void;
    reject: (err: unknown) => void;
    unsub: ReturnType<typeof vi.fn>;
  }> = [];
  const connection: ForecastConnection = {
    subscribeMessage: (callback, message) =>
      new Promise((resolve, reject) => {
        pending.push({ message, callback, resolve, reject, unsub: vi.fn() });
      }),
  };
  return { connection, pending };
}

const flush = async () => {
  for (let i = 0; i < 5; i++) await Promise.resolve();
};

const sunny: ForecastEntry[] = [{ datetime: '2026-10-09T12:00:00-05:00', condition: 'sunny', temperature: 72, templow: 55 }];
const rainy: ForecastEntry[] = [{ datetime: '2026-10-09T12:00:00-05:00', condition: 'rainy', temperature: 60, templow: 50 }];

describe('ForecastSubscription', () => {
  it('subscribes once per entity even while the first subscribe is in flight', async () => {
    const { connection, pending } = fakeConnection();
    const sub = new ForecastSubscription(() => {});
    sub.update(connection, 'weather.home');
    sub.update(connection, 'weather.home'); // hass changed again before the subscribe resolved
    expect(pending).toHaveLength(1);
    expect(pending[0].message).toEqual({ type: 'weather/subscribe_forecast', forecast_type: 'daily', entity_id: 'weather.home' });
    pending[0].resolve(pending[0].unsub);
    await flush();
    sub.update(connection, 'weather.home');
    expect(pending).toHaveLength(1);
  });

  it('delivers forecasts and unsubscribes on stop', async () => {
    const { connection, pending } = fakeConnection();
    const onForecast = vi.fn();
    const sub = new ForecastSubscription(onForecast);
    sub.update(connection, 'weather.home');
    pending[0].resolve(pending[0].unsub);
    await flush();
    pending[0].callback({ forecast: sunny });
    expect(onForecast).toHaveBeenLastCalledWith(sunny);
    sub.stop();
    expect(pending[0].unsub).toHaveBeenCalledTimes(1);
  });

  it('unsubscribes a subscription that resolves after stop (no leak)', async () => {
    const { connection, pending } = fakeConnection();
    const onForecast = vi.fn();
    const sub = new ForecastSubscription(onForecast);
    sub.update(connection, 'weather.home');
    sub.stop(); // view disconnected before the server answered
    pending[0].resolve(pending[0].unsub);
    await flush();
    expect(pending[0].unsub).toHaveBeenCalledTimes(1);
    pending[0].callback({ forecast: sunny });
    expect(onForecast).not.toHaveBeenCalledWith(sunny);
  });

  it('replaces the subscription when the entity changes', async () => {
    const { connection, pending } = fakeConnection();
    const sub = new ForecastSubscription(() => {});
    sub.update(connection, 'weather.home');
    pending[0].resolve(pending[0].unsub);
    await flush();
    sub.update(connection, 'weather.cabin');
    expect(pending[0].unsub).toHaveBeenCalledTimes(1);
    expect(pending).toHaveLength(2);
    expect(pending[1].message.entity_id).toBe('weather.cabin');
  });

  it('falls back to the legacy forecast attribute when subscribing fails', async () => {
    const { connection, pending } = fakeConnection();
    const onForecast = vi.fn();
    const sub = new ForecastSubscription(onForecast);
    sub.update(connection, 'weather.home', sunny);
    pending[0].reject(new Error('unknown command'));
    await flush();
    expect(onForecast).toHaveBeenLastCalledWith(sunny);
    sub.update(connection, 'weather.home', sunny); // next hass update: no retry storm
    expect(pending).toHaveLength(1);
    sub.stop();
  });

  it('stops and clears the forecast when the entity is removed', async () => {
    const { connection, pending } = fakeConnection();
    const onForecast = vi.fn();
    const sub = new ForecastSubscription(onForecast);
    sub.update(connection, 'weather.home');
    pending[0].resolve(pending[0].unsub);
    await flush();
    sub.update(connection, '');
    expect(pending[0].unsub).toHaveBeenCalledTimes(1);
    expect(onForecast).toHaveBeenLastCalledWith([]);
  });
});

describe('buildForecastMap', () => {
  it('keys forecasts by local date', () => {
    const map = buildForecastMap([
      { datetime: '2026-10-09T12:00:00-05:00', condition: 'sunny', temperature: 72, templow: 55 },
      { datetime: '2026-10-10', condition: 'rainy', temperature: 61 },
    ]);
    expect(map.get('2026-10-09')).toEqual({ condition: 'sunny', tempHigh: 72, tempLow: 55 });
    expect(map.get('2026-10-10')).toEqual({ condition: 'rainy', tempHigh: 61, tempLow: 61 });
  });
});

/** A connection that can reconnect, like hass.connection. */
function reconnectingConnection() {
  const fake = fakeConnection();
  const options: Array<Record<string, unknown> | undefined> = [];
  const listeners: Array<() => void> = [];
  const subscribe = fake.connection.subscribeMessage;
  const connection: ForecastConnection = {
    subscribeMessage: (callback, message, opts) => {
      options.push(opts);
      return subscribe(callback, message);
    },
    addEventListener: (_event, listener) => listeners.push(listener),
    removeEventListener: (_event, listener) => listeners.splice(listeners.indexOf(listener), 1),
  };
  return { ...fake, connection, options, listeners, reconnect: () => [...listeners].forEach(l => l()) };
}

describe('ForecastSubscription after a reconnect', () => {
  it('subscribes again itself, since the socket library would drop a failed resubscribe', async () => {
    const fake = reconnectingConnection();
    const onForecast = vi.fn();
    const sub = new ForecastSubscription(onForecast);
    sub.update(fake.connection, 'weather.home');
    expect(fake.options[0]).toEqual({ resubscribe: false });
    fake.pending[0].resolve(fake.pending[0].unsub);
    await flush();
    fake.reconnect();
    expect(fake.pending).toHaveLength(2);
    expect(fake.pending[0].unsub).not.toHaveBeenCalled(); // its id may belong to a new command now
    fake.pending[1].resolve(fake.pending[1].unsub);
    await flush();
    fake.pending[0].callback({ forecast: [] });
    fake.pending[1].callback({ forecast: sunny });
    expect(onForecast).toHaveBeenCalledTimes(1);
    expect(onForecast).toHaveBeenLastCalledWith(sunny);
  });

  it('tries for about a minute while the weather comes back, then uses the entity forecast', async () => {
    vi.useFakeTimers();
    try {
      const fake = reconnectingConnection();
      const onForecast = vi.fn();
      const sub = new ForecastSubscription(onForecast);
      sub.update(fake.connection, 'weather.home', sunny);
      fake.pending[0].resolve(fake.pending[0].unsub);
      await flush();
      fake.pending[0].callback({ forecast: rainy });
      fake.reconnect();
      for (const wait of [1000, 2000, 4000, 8000, 16000, 30000]) {
        fake.pending[fake.pending.length - 1].reject(new Error('not ready'));
        await flush();
        expect(onForecast).toHaveBeenCalledTimes(1); // the last forecast stays meanwhile
        vi.advanceTimersByTime(wait);
      }
      expect(fake.pending).toHaveLength(8);
      fake.pending[7].reject(new Error('still not ready'));
      await flush();
      expect(onForecast).toHaveBeenLastCalledWith(sunny);
    } finally {
      vi.useRealTimers();
    }
  });

  it('keeps trying when a new card subscribes before the weather integration has started', async () => {
    vi.useFakeTimers();
    try {
      const fake = reconnectingConnection();
      const onForecast = vi.fn();
      const sub = new ForecastSubscription(onForecast);
      sub.update(fake.connection, 'weather.home', []);
      fake.pending[0].reject(new Error('entity not found'));
      await flush();
      expect(onForecast).toHaveBeenLastCalledWith([]); // the entity's own forecast meanwhile
      vi.advanceTimersByTime(1000);
      expect(fake.pending).toHaveLength(2);
      fake.pending[1].resolve(fake.pending[1].unsub);
      await flush();
      fake.pending[1].callback({ forecast: sunny });
      expect(onForecast).toHaveBeenLastCalledWith(sunny);
      sub.stop();
    } finally {
      vi.useRealTimers();
    }
  });

  it('stops following reconnects when stopped', async () => {
    const fake = reconnectingConnection();
    const sub = new ForecastSubscription(() => {});
    sub.update(fake.connection, 'weather.home');
    expect(fake.listeners).toHaveLength(1);
    sub.stop();
    expect(fake.listeners).toHaveLength(0);
  });
});

describe('todayHighLow', () => {
  it('reads today from the daily forecast', () => {
    const forecast: ForecastEntry[] = [
      { datetime: '2026-10-13T05:00:00+00:00', condition: 'sunny', temperature: 71.6, templow: 54.6 },
      { datetime: '2026-10-14T05:00:00+00:00', condition: 'rainy', temperature: 60, templow: 50 },
    ];
    expect(todayHighLow(forecast, new Date(2026, 9, 13, 16, 10))).toEqual({ high: 72, low: 55 });
    expect(todayHighLow([{ datetime: '2026-10-13T05:00:00+00:00', condition: 'sunny', temperature: 70 }], new Date(2026, 9, 13, 9))).toEqual({ high: 70, low: null });
    expect(todayHighLow(forecast, new Date(2026, 9, 20, 9))).toBeNull();
  });
});
