import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { appearanceSettings } from '../src/core/appearance';
import { AppearanceEdits, SAVE_DELAY_MS, SETTLE_MS, sameValue } from '../src/core/appearance-edits';

const SAVED = appearanceSettings({});

async function settle(): Promise<void> {
  for (let i = 0; i < 4; i++) await Promise.resolve();
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('sameValue', () => {
  it('compares objects whatever their key order', () => {
    expect(sameValue({ accent: '#111111', header: 'plain' }, { header: 'plain', accent: '#111111' })).toBe(true);
    expect(sameValue({ accent: '#111111' }, { accent: '#222222' })).toBe(false);
    expect(sameValue('dark', 'dark')).toBe(true);
  });
});

describe('AppearanceEdits', () => {
  it('shows a tap at once and saves the taps together after a quiet moment', async () => {
    const changed = vi.fn();
    const send = vi.fn().mockResolvedValue(undefined);
    const edits = new AppearanceEdits(changed);
    edits.set({ appearance: 'dark' }, send, () => {});
    edits.set({ theme_pair: 'minimal' }, send, () => {});
    expect(edits.current(SAVED)).toMatchObject({ appearance: 'dark', theme_pair: 'minimal' });
    expect(changed).toHaveBeenCalledTimes(2);
    expect(send).not.toHaveBeenCalled();
    vi.advanceTimersByTime(SAVE_DELAY_MS);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith({ appearance: 'dark', theme_pair: 'minimal' });
  });

  it('keeps showing a change until Home Assistant shows it back', async () => {
    const edits = new AppearanceEdits();
    edits.set({ appearance: 'dark' }, vi.fn().mockResolvedValue(undefined), () => {});
    edits.flush();
    await settle();
    edits.reconcile(SAVED); // the old value is still in the sensor
    expect(edits.current(SAVED).appearance).toBe('dark');
    edits.reconcile({ ...SAVED, appearance: 'dark' });
    expect(edits.current(SAVED).appearance).toBe('light');
  });

  it('lets go of a saved change after a few seconds if it never shows back', async () => {
    const edits = new AppearanceEdits();
    edits.set({ appearance: 'dark' }, vi.fn().mockResolvedValue(undefined), () => {});
    edits.flush();
    await settle();
    vi.advanceTimersByTime(SETTLE_MS);
    expect(edits.current(SAVED).appearance).toBe('light');
  });

  it('drops a change whose save failed, and says so', async () => {
    const onError = vi.fn();
    const edits = new AppearanceEdits();
    edits.set({ motion: 'reduced' }, vi.fn().mockRejectedValue(new Error('offline')), onError);
    edits.flush();
    await settle();
    expect(edits.current(SAVED).motion).toBe('device');
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('keeps a newer change when an older save of the same setting fails', async () => {
    let fail: (err: unknown) => void = () => {};
    const send = vi.fn().mockImplementationOnce(() => new Promise((_resolve, reject) => { fail = reject; }))
      .mockResolvedValue(undefined);
    const edits = new AppearanceEdits();
    edits.set({ appearance: 'dark' }, send, () => {});
    edits.flush();
    edits.set({ appearance: 'automatic' }, send, () => {});
    fail(new Error('offline'));
    await settle();
    expect(edits.current(SAVED).appearance).toBe('automatic');
  });

  it('remembers where the finger was for a few seconds, once', () => {
    const edits = new AppearanceEdits();
    edits.set({ appearance: 'dark' }, vi.fn().mockResolvedValue(undefined), () => {}, { x: 40, y: 300 });
    expect(edits.takeTap()).toEqual({ x: 40, y: 300 });
    expect(edits.takeTap()).toBeNull();
    edits.set({ appearance: 'light' }, vi.fn().mockResolvedValue(undefined), () => {}, { x: 1, y: 2 });
    expect(edits.takeTap(Date.now() + 5000)).toBeNull();
  });

  it('tells the pages showing the settings, until they stop listening', async () => {
    const page = vi.fn();
    const edits = new AppearanceEdits();
    const stop = edits.subscribe(page);
    edits.set({ appearance: 'dark' }, vi.fn().mockRejectedValue(new Error('offline')), () => {});
    expect(page).toHaveBeenCalledTimes(1);
    edits.flush();
    await settle();
    expect(page).toHaveBeenCalledTimes(2); // the failed change was dropped
    stop();
    edits.set({ appearance: 'light' }, vi.fn().mockResolvedValue(undefined), () => {});
    expect(page).toHaveBeenCalledTimes(2);
  });
});
