import { describe, expect, it, vi } from 'vitest';
import {
  ForecastSubscription,
  buildForecastMap,
  type ForecastConnection,
  type ForecastEntry,
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
