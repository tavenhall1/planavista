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
function fakeCard(source: AppearanceSource) {
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
  controller = new AppearanceController(card as never, new AppearanceEdits(), () => source, async () => undefined);
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
