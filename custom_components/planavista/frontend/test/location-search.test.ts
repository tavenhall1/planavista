import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  LocationSearch,
  buildPhotonUrl,
  formatPhotonFeature,
  parsePhotonResponse,
} from '../src/modules/calendar/utils/location-search';

type FetchCall = { url: string; init: RequestInit; resolve: (body: unknown) => void; reject: (err: unknown) => void };

/** fetch stand-in whose responses the test releases one by one. */
function fakeFetch() {
  const calls: FetchCall[] = [];
  const fn = vi.fn((url: string, init: RequestInit) =>
    new Promise<Response>((resolve, reject) => {
      calls.push({
        url,
        init,
        resolve: body => resolve({ ok: true, status: 200, json: async () => body } as Response),
        reject,
      });
    }),
  );
  return { fn, calls };
}

const flush = async () => {
  for (let i = 0; i < 10; i++) await Promise.resolve();
};

function photon(...names: string[]) {
  return { type: 'FeatureCollection', features: names.map(name => ({ type: 'Feature', properties: { name } })) };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('buildPhotonUrl', () => {
  it('sends only the typed text', () => {
    expect(buildPhotonUrl('1600 Penn Ave')).toBe('https://photon.komoot.io/api/?q=1600%20Penn%20Ave&limit=5&lang=en');
    expect(buildPhotonUrl('Café & Bar')).toBe('https://photon.komoot.io/api/?q=Caf%C3%A9%20%26%20Bar&limit=5&lang=en');
  });
});

describe('formatPhotonFeature', () => {
  it('joins the non-empty address parts', () => {
    expect(formatPhotonFeature({
      name: 'Lincoln Park Zoo',
      housenumber: '2001',
      street: 'North Clark Street',
      city: 'Chicago',
      state: 'Illinois',
      postcode: '60614',
      country: 'United States',
    })).toBe('Lincoln Park Zoo, 2001 North Clark Street, Chicago, Illinois, 60614, United States');
  });

  it('skips missing and repeated parts', () => {
    expect(formatPhotonFeature({ name: 'Springfield', state: 'Illinois', country: 'United States' }))
      .toBe('Springfield, Illinois, United States');
    expect(formatPhotonFeature({ street: 'Main Street', city: 'Main Street', country: '' })).toBe('Main Street');
    expect(formatPhotonFeature({})).toBe('');
  });
});

describe('parsePhotonResponse', () => {
  it('returns up to five unique, non-empty suggestions', () => {
    const body = photon('A', 'B', 'A', '', 'C', 'D', 'E', 'F');
    expect(parsePhotonResponse(body)).toEqual(['A', 'B', 'C', 'D', 'E']);
    expect(parsePhotonResponse(null)).toEqual([]);
    expect(parsePhotonResponse({ features: 'nope' })).toEqual([]);
  });
});

describe('LocationSearch', () => {
  function setup() {
    const { fn, calls } = fakeFetch();
    const onResults = vi.fn();
    const onLoading = vi.fn();
    const search = new LocationSearch({ fetchFn: fn as unknown as typeof fetch, onResults, onLoading });
    return { fn, calls, onResults, onLoading, search };
  }

  it('makes no network request when the setting is off', async () => {
    const { fn, search, onResults } = setup();
    search.input('1600 Pennsylvania Avenue', false);
    await vi.advanceTimersByTimeAsync(2000);
    expect(fn).not.toHaveBeenCalled();
    expect(onResults).toHaveBeenLastCalledWith([]);
  });

  it('waits for 3 characters', async () => {
    const { fn, search } = setup();
    search.input('Ch', true);
    await vi.advanceTimersByTimeAsync(2000);
    expect(fn).not.toHaveBeenCalled();
  });

  it('waits for a 350 ms pause and sends one request for the last text', async () => {
    const { fn, calls, search } = setup();
    search.input('Chi', true);
    await vi.advanceTimersByTimeAsync(200);
    search.input('Chic', true);
    await vi.advanceTimersByTimeAsync(200);
    search.input('Chicago', true);
    await vi.advanceTimersByTimeAsync(349);
    expect(fn).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(calls[0].url).toBe('https://photon.komoot.io/api/?q=Chicago&limit=5&lang=en');
    expect(calls[0].url).not.toMatch(/lat|lon/);
    expect(calls[0].init).toMatchObject({ credentials: 'omit', referrerPolicy: 'no-referrer' });
  });

  it('applies only the newest response', async () => {
    const { calls, search, onResults } = setup();
    search.input('Spring', true);
    await vi.advanceTimersByTimeAsync(350);
    search.input('Springfield', true);
    await vi.advanceTimersByTimeAsync(350);
    expect(calls).toHaveLength(2);
    expect(calls[0].init.signal?.aborted).toBe(true);

    calls[1].resolve(photon('Springfield, Illinois'));
    await flush();
    calls[0].resolve(photon('Spring Grove'));
    await flush();
    expect(onResults).toHaveBeenLastCalledWith(['Springfield, Illinois']);
    expect(onResults).not.toHaveBeenCalledWith(['Spring Grove']);
  });

  it('clears suggestions when the request fails', async () => {
    const { calls, search, onResults, onLoading } = setup();
    search.input('Chicago', true);
    await vi.advanceTimersByTimeAsync(350);
    calls[0].reject(new TypeError('Failed to fetch'));
    await flush();
    expect(onResults).toHaveBeenLastCalledWith([]);
    expect(onLoading).toHaveBeenLastCalledWith(false);
  });

  it('cancel() drops a pending search', async () => {
    const { fn, search } = setup();
    search.input('Chicago', true);
    search.cancel();
    await vi.advanceTimersByTimeAsync(1000);
    expect(fn).not.toHaveBeenCalled();
  });
});
