import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ChoresService, resetSharedQueue } from '../src/modules/chores/chores-service';
import type { LiveConnection } from '../src/core/live-subscription';

const KEY = 'planavista.checkoffs';
const CAT = 'cat_care|casey|day:2026-10-13|0';

async function settle(): Promise<void> {
  for (let i = 0; i < 8; i++) await Promise.resolve();
}

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => void map.set(key, value),
    removeItem: (key: string) => void map.delete(key),
  };
}

/** A card on the page: its own connection, its own record of what it sent, refusing when told to. */
function card(name: string, sent: string[], refuse: () => string | null = () => null) {
  const waiting: Array<() => void> = [];
  const connection: LiveConnection<unknown> = {
    subscribeMessage: vi.fn(() => new Promise<() => void>(resolve => waiting.push(() => resolve(() => undefined)))),
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  };
  const host = {
    addController: () => undefined,
    hass: {
      connection,
      callWS: vi.fn(async (msg: Record<string, unknown>) => {
        sent.push(`${name}:${String(msg.occurrence)}`);
        const code = refuse();
        if (code) throw { code, message: 'No' };
        return {};
      }),
    },
    householdView: { available: true, modules: { chores: { enabled: true } }, members: [] },
    pinSession: null,
    planavistaData: null,
    sessionEnded: () => undefined,
    serviceChanged: () => undefined,
  };
  const service = new ChoresService(host as never);
  return {
    service,
    async connect() {
      service.hostConnected();
      waiting.splice(0).forEach(go => go());
      await settle();
    },
  };
}

const entry = { op: 'complete' as const, occurrence: CAT, member: 'casey', name: 'Cat care', shows: 'done' as const };

beforeEach(() => {
  vi.stubGlobal('localStorage', memoryStorage());
  resetSharedQueue();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('one check-off queue for every card on the page (Review Focus 1)', () => {
  it('sends a check-off once, from the card that made it', async () => {
    const sent: string[] = [];
    const calendar = card('calendar', sent);
    const chores = card('chores', sent);
    await calendar.connect();
    await chores.connect();
    chores.service.enqueue(entry);
    await settle();
    expect(sent).toEqual([`chores:${CAT}`]);
    expect(chores.service.queue.entries).toEqual([]);
  });

  it('sends a check-off left by an earlier page once, from a card on this one', async () => {
    localStorage.setItem(KEY, JSON.stringify([{ ...entry, id: 'old-1', at: Date.now(), card: 'card1' }]));
    const sent: string[] = [];
    const calendar = card('calendar', sent);
    const chores = card('chores', sent);
    await calendar.connect();
    await chores.connect();
    expect(sent).toHaveLength(1);
    expect(calendar.service.queue.entries).toEqual([]);
  });

  it('tells a refusal on the card that shows chores, even when another card owns the check-off', async () => {
    localStorage.setItem(KEY, JSON.stringify([{ ...entry, id: 'old-1', at: Date.now(), card: 'card1' }]));
    const sent: string[] = [];
    const calendar = card('calendar', sent, () => 'period_closed');
    const chores = card('chores', sent, () => 'period_closed');
    const stop = chores.service.watch();
    await calendar.connect();
    await chores.connect();
    expect(sent).toHaveLength(1);
    expect(calendar.service.takeNotices()).toEqual([]);
    expect(chores.service.takeNotices().map(n => n.text)).toEqual(['Couldn\'t save "Cat care": the day had ended.']);
    stop();
  });

  it('tells a refusal on the card that made the check-off when it shows chores', async () => {
    const sent: string[] = [];
    let refuse: string | null = null;
    const left = card('left', sent, () => refuse);
    const right = card('right', sent, () => refuse);
    left.service.watch();
    right.service.watch();
    await left.connect();
    await right.connect();
    refuse = 'period_closed';
    right.service.enqueue(entry);
    await settle();
    expect(left.service.takeNotices()).toEqual([]);
    expect(right.service.takeNotices()).toHaveLength(1);
  });
});
