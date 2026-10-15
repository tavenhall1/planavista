import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppearanceController, AppearanceSource } from '../src/shell/appearance-controller';
import { AppearanceEdits } from '../src/core/appearance-edits';

/** A stand-in page: its listeners, its visibility, and the changes it was asked to play. */
function fakePage() {
  const listeners = new Map<string, Set<(event: Event) => void>>();
  const dataset: Record<string, string> = {};
  const played: string[] = [];
  let visibility: 'visible' | 'hidden' = 'visible';
  const page = {
    get visibilityState() {
      return visibility;
    },
    addEventListener(type: string, fn: (event: Event) => void) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)!.add(fn);
    },
    removeEventListener(type: string, fn: (event: Event) => void) {
      listeners.get(type)?.delete(fn);
    },
    documentElement: { dataset, animate: () => ({ cancel() {} }) },
    head: { appendChild: () => undefined },
    getElementById: () => null,
    createElement: () => ({ remove: () => undefined }),
    startViewTransition(update: () => Promise<void>) {
      played.push(dataset.pvVt);
      return { ready: update(), finished: Promise.resolve() };
    },
    fire(type: string) {
      for (const fn of listeners.get(type) ?? []) fn(new Event(type));
    },
    setVisibility(next: 'visible' | 'hidden') {
      visibility = next;
      page.fire('visibilitychange');
    },
    played,
  };
  return page;
}

type Page = ReturnType<typeof fakePage>;

/** A card that renders on the next microtask when asked, as Lit does, and counts its renders. */
function fakeCard(source: AppearanceSource, Controller: typeof AppearanceController = AppearanceController) {
  let controller!: AppearanceController;
  let pending = false;
  const card = {
    renders: 0,
    addController: () => undefined,
    requestUpdate() {
      card.renders++;
      if (pending) return;
      pending = true;
      queueMicrotask(() => {
        pending = false;
        controller.hostUpdate();
      });
    },
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    setAttribute: () => undefined,
    style: { setProperty: () => undefined, removeProperty: () => undefined },
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }),
  };
  controller = new Controller(card as never, new AppearanceEdits(), () => source, async () => undefined);
  controller.hostConnected();
  return { card, controller };
}

const settle = () => new Promise(resolve => setTimeout(resolve, 20));
const hoursFromNow = (h: number) => new Date(Date.now() + h * 3_600_000).toISOString();

describe('AppearanceController', () => {
  let page: Page;
  let source: AppearanceSource;

  beforeEach(() => {
    page = fakePage();
    vi.stubGlobal('document', page);
    source = { display: { appearance: 'light' }, cardTheme: undefined, sun: null, haDark: false, overlayOpen: false };
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('waits under an open sheet without drawing the card over and over', async () => {
    source.display = { appearance: 'automatic', appearance_switch: 'sun' };
    source.sun = { state: 'above_horizon', next_setting: hoursFromNow(1), next_rising: hoursFromNow(12) };
    const { card, controller } = fakeCard(source);
    controller.hostUpdate();
    expect(controller.mode).toBe('light');

    // Sunset comes while Settings or a popup is open, and nobody has touched the card in a while.
    source.sun = { state: 'below_horizon', next_rising: hoursFromNow(12), next_setting: hoursFromNow(24) };
    source.overlayOpen = true;
    card.renders = 0;
    controller.hostUpdate();
    await new Promise(resolve => setTimeout(resolve, 300));
    expect(controller.mode).toBe('light');
    expect(card.renders).toBeLessThanOrEqual(1);

    // Closing it draws the card again, and night falls then.
    source.overlayOpen = false;
    controller.hostUpdate();
    await settle();
    expect(controller.mode).toBe('dark');
    expect(page.played).toEqual(['dusk']);
    controller.hostDisconnected();
  });

  it('counts a touch anywhere on the page as someone using the screen', async () => {
    const { controller } = fakeCard(source);
    controller.hostUpdate();
    page.fire('pointerdown');
    source.display = { appearance: 'dark' };
    controller.hostUpdate();
    await settle();
    expect(controller.mode).toBe('light');
    controller.hostDisconnected();
  });

  it('just switches a change that arrives soon after the screen wakes', async () => {
    const { controller } = fakeCard(source);
    controller.hostUpdate();
    page.setVisibility('hidden');
    page.setVisibility('visible');
    await settle();
    // Home Assistant reconnects after the wake, and only then says the look changed while it slept.
    source.display = { appearance: 'dark' };
    controller.hostUpdate();
    await settle();
    expect(controller.mode).toBe('dark');
    expect(page.played).toEqual([]);
    controller.hostDisconnected();
  });

  it('plays a change again once the screen has been awake a while', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const { controller } = fakeCard(source);
    controller.hostUpdate();
    page.setVisibility('hidden');
    page.setVisibility('visible');
    await settle();
    vi.setSystemTime(Date.now() + 60_000);
    source.display = { appearance: 'dark' };
    controller.hostUpdate();
    await settle();
    expect(controller.mode).toBe('dark');
    expect(page.played).toEqual(['dusk']);
    controller.hostDisconnected();
  });

  it("keeps the household's look while its settings are missing (Home Assistant restarting)", async () => {
    source.display = { appearance: 'dark' };
    const { controller } = fakeCard(source);
    controller.hostUpdate();
    expect(controller.mode).toBe('dark');
    source.display = undefined;
    controller.hostUpdate();
    await settle();
    expect(controller.mode).toBe('dark');
    expect(page.played).toEqual([]);
    controller.hostDisconnected();
  });

  it('draws the first real settings without a change, when the card loaded before them', async () => {
    source.display = undefined;
    const { controller } = fakeCard(source);
    controller.hostUpdate();
    source.display = { appearance: 'dark' };
    controller.hostUpdate();
    await settle();
    expect(controller.mode).toBe('dark');
    expect(page.played).toEqual([]);
    controller.hostDisconnected();
  });
});

describe('AppearanceController dimming (0.12.0)', () => {
  let page: Page;
  let source: AppearanceSource;
  const dimming = { settings: { day: 100, night: 30 }, members: [], night: null };

  beforeEach(() => {
    page = fakePage();
    vi.stubGlobal('document', page);
    source = { display: { appearance: 'dark' }, cardTheme: undefined, sun: null, haDark: false, overlayOpen: false };
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  function painted(card: { style: { setProperty: (n: string, v: string) => void } }) {
    const tokens: Record<string, string> = {};
    card.style.setProperty = (n: string, v: string) => { tokens[n] = v; };
    return tokens;
  }

  it('draws a shared screen at the night level at night, and other screens at full', () => {
    vi.setSystemTime(new Date(2026, 9, 14, 23, 0));
    const shared = fakeCard({ ...source, dimming });
    const tokens = painted(shared.card);
    shared.controller.hostUpdate();
    expect(shared.controller.dim).toBe(0.3);
    expect(tokens['--pv-bg']).not.toBe('#111214');
    expect(tokens['--pv-dim']).toBe('0.3');
    expect(tokens['--pv-media-filter']).toMatch(/^brightness\(0\.\d+\)$/);
    shared.controller.hostDisconnected();

    const phone = fakeCard({ ...source, dimming: null });
    const full = painted(phone.card);
    phone.controller.hostUpdate();
    expect(phone.controller.dim).toBe(1);
    expect(full['--pv-bg']).toBe('#111214');
    expect(full['--pv-media-filter']).toBe('none');
    phone.controller.hostDisconnected();
  });

  it('steps through the evening fade every 15 seconds, not on every update', () => {
    vi.setSystemTime(new Date(2026, 9, 14, 21, 45, 1));
    const { card, controller } = fakeCard({ ...source, dimming });
    controller.hostUpdate();
    const first = controller.dim;
    expect(first).toBeLessThan(1);
    expect(first).toBeGreaterThan(0.3);
    vi.setSystemTime(new Date(2026, 9, 14, 21, 45, 9));
    controller.hostUpdate();
    expect(controller.dim).toBe(first);
    card.renders = 0;
    vi.advanceTimersByTime(15_000);
    expect(card.renders).toBeGreaterThan(0);
    controller.hostDisconnected();
  });

  it("draws a light look's surfaces and people no darker than the floor (review m12 A)", () => {
    vi.setSystemTime(new Date(2026, 9, 14, 23, 0));
    const deep = { ...dimming, settings: { day: 100, night: 8 } };
    const light = fakeCard({ ...source, display: { appearance: 'light' }, dimming: deep });
    light.controller.hostUpdate();
    expect(light.controller.dim).toBe(0.25);
    light.controller.hostDisconnected();
    const dark = fakeCard({ ...source, dimming: deep });
    dark.controller.hostUpdate();
    expect(dark.controller.dim).toBe(0.08);
    dark.controller.hostDisconnected();
  });

  it('a card made before the household answers draws the last level, not full (review m12 F)', () => {
    vi.setSystemTime(new Date(2026, 9, 14, 23, 0));
    const before = fakeCard({ ...source, dimming });
    before.controller.hostUpdate();
    before.controller.hostDisconnected();
    const rebuilt = fakeCard({ ...source, dimming: 'waiting' });
    const tokens = painted(rebuilt.card);
    rebuilt.controller.hostUpdate();
    expect(rebuilt.controller.dim).toBe(0.3);
    expect(tokens['--pv-dim']).toBe('0.3');
    rebuilt.controller.hostDisconnected();
    // Long after, a level nobody has said is full.
    vi.setSystemTime(new Date(2026, 9, 14, 23, 30));
    const late = fakeCard({ ...source, dimming: 'waiting' });
    late.controller.hostUpdate();
    expect(late.controller.dim).toBe(1);
    late.controller.hostDisconnected();
  });

  it('a reloaded page draws the level this browser last drew (review m12 F)', async () => {
    vi.setSystemTime(new Date(2026, 9, 14, 23, 0));
    const store = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
    });
    const before = fakeCard({ ...source, dimming: { ...dimming, settings: { day: 100, night: 15 } } });
    before.controller.hostUpdate();
    before.controller.hostDisconnected();
    expect(JSON.parse(store.get('planavista.dim')!)).toEqual({ level: 0.15, at: Date.now() });
    vi.resetModules();
    const fresh = await import('../src/shell/appearance-controller');
    const card = fakeCard({ ...source, dimming: 'waiting' }, fresh.AppearanceController);
    card.controller.hostUpdate();
    expect(card.controller.dim).toBe(0.15);
    card.controller.hostDisconnected();
  });

  it('shows a previewed level for a while, then the real one', () => {
    vi.setSystemTime(new Date(2026, 9, 14, 14, 0));
    const { controller } = fakeCard({ ...source, dimming });
    controller.hostUpdate();
    expect(controller.dim).toBe(1);
    controller.preview(0.15, 3500);
    controller.hostUpdate();
    expect(controller.dim).toBe(0.15);
    vi.advanceTimersByTime(3600);
    controller.hostUpdate();
    expect(controller.dim).toBe(1);
    controller.hostDisconnected();
  });
});
