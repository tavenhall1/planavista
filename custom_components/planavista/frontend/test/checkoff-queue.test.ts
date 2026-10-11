import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CheckoffQueue,
  QueuedCheckoff,
  QueueStorage,
  SendOutcome,
  browserStorage,
  outcomeOf,
} from '../src/modules/chores/checkoff-queue';

function memoryStorage(initial: QueuedCheckoff[] = []): QueueStorage & { saved: QueuedCheckoff[][] } {
  const saved: QueuedCheckoff[][] = [];
  let current = initial;
  return {
    saved,
    load: () => current,
    save: entries => {
      current = entries;
      saved.push(entries);
    },
  };
}

const TRASH = { op: 'complete' as const, occurrence: 'take_out_the_trash|casey|week:2026-10-12|0', member: 'casey', name: 'Take out the trash' };
const CAT = { op: 'complete' as const, occurrence: 'cat_care|casey|day:2026-10-13|1', member: 'casey', name: 'Cat care' };

function queueWith(send: (entry: QueuedCheckoff) => Promise<SendOutcome>, storage = memoryStorage()) {
  const refused: Array<[string, string]> = [];
  const changed = vi.fn();
  const queue = new CheckoffQueue(storage, send, { changed, refused: (entry, code) => refused.push([entry.name, code]) });
  return { queue, refused, changed, storage };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('CheckoffQueue (spec 15.1)', () => {
  it('sends check-offs oldest first and forgets each once it went through', async () => {
    const sent: string[] = [];
    const { queue, storage } = queueWith(async entry => {
      sent.push(entry.name);
      return { kind: 'sent' };
    });
    queue.add(TRASH);
    queue.add(CAT);
    await queue.flush();
    expect(sent).toEqual(['Take out the trash', 'Cat care']);
    expect(queue.waiting).toBe(false);
    expect(storage.saved.at(-1)).toEqual([]);
  });

  it('keeps everything while there is no connection, and goes on when it comes back', async () => {
    let online = false;
    const sent: string[] = [];
    const { queue } = queueWith(async entry => {
      if (!online) return { kind: 'wait' };
      sent.push(entry.name);
      return { kind: 'sent' };
    });
    queue.add(TRASH);
    queue.add(CAT);
    await queue.flush();
    expect(queue.entries.map(e => e.name)).toEqual(['Take out the trash', 'Cat care']);
    online = true;
    await queue.flush();
    expect(sent).toEqual(['Take out the trash', 'Cat care']);
  });

  it('drops one Home Assistant refuses, says so, and sends the rest', async () => {
    const { queue, refused } = queueWith(async entry =>
      entry.name === 'Take out the trash' ? { kind: 'refused', code: 'period_closed', message: 'The day had ended.' } : { kind: 'sent' });
    queue.add(TRASH);
    queue.add(CAT);
    await queue.flush();
    expect(refused).toEqual([['Take out the trash', 'period_closed']]);
    expect(queue.waiting).toBe(false);
  });

  it('cancels a check-off that was taken back before it left', async () => {
    const send = vi.fn(async (): Promise<SendOutcome> => ({ kind: 'wait' }));
    const { queue } = queueWith(send);
    queue.add(TRASH);
    expect(queue.add({ ...TRASH, op: 'undo' })).toBeNull();
    expect(queue.waiting).toBe(false);
    queue.add({ ...TRASH, doneBy: 'blair' });
    expect(queue.entries.map(e => [e.op, e.doneBy])).toEqual([['complete', 'blair']]);
  });

  it('sends an uncheck of a check-off that already went through', async () => {
    const ops: string[] = [];
    const { queue } = queueWith(async entry => {
      ops.push(entry.op);
      return { kind: 'sent' };
    });
    queue.add(TRASH);
    await queue.flush();
    queue.add({ ...TRASH, op: 'undo' });
    queue.add({ ...TRASH, doneBy: 'blair' });
    await queue.flush();
    expect(ops).toEqual(['complete', 'undo', 'complete']);
  });

  it('survives a reload: what was waiting comes back from storage', () => {
    const storage = memoryStorage();
    const first = queueWith(async () => ({ kind: 'wait' }), storage);
    first.queue.add(TRASH);
    const second = queueWith(async () => ({ kind: 'wait' }), storage);
    expect(second.queue.entries.map(e => e.occurrence)).toEqual([TRASH.occurrence]);
  });

  it('flushes once at a time, and once more if asked meanwhile', async () => {
    let release: () => void = () => undefined;
    const sent: string[] = [];
    const { queue } = queueWith(entry => new Promise(resolve => {
      sent.push(entry.name);
      release = () => resolve({ kind: 'sent' });
    }));
    queue.add(TRASH);
    const first = queue.flush();
    queue.add(CAT);
    void queue.flush();
    release();
    await Promise.resolve();
    await Promise.resolve();
    release();
    await first;
    expect(sent).toEqual(['Take out the trash', 'Cat care']);
  });
});

describe('outcomeOf', () => {
  it('treats a code Home Assistant chose as a refusal and anything else as a lost connection', () => {
    expect(outcomeOf({ code: 'pin_required', message: 'x' })).toEqual({ kind: 'refused', code: 'pin_required', message: null });
    expect(outcomeOf(3)).toEqual({ kind: 'wait' });
    expect(outcomeOf(new Error('Connection lost'))).toEqual({ kind: 'wait' });
  });
});

describe('browserStorage', () => {
  it('keeps the queue in localStorage and drops entries from days ago or that make no sense', () => {
    const store = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => store.set(k, v),
      removeItem: (k: string) => store.delete(k),
    });
    const now = 1_800_000_000_000;
    const storage = browserStorage(() => now);
    const fresh = { ...TRASH, id: 'a', at: now - 1000 };
    storage.save([fresh, { ...CAT, id: 'b', at: now - 3 * 86_400_000 }, { id: 'c' } as never]);
    expect(storage.load()).toEqual([fresh]);
    storage.save([]);
    expect(store.has('planavista.checkoffs')).toBe(false);
  });

  it('works without storage (a blocked or private browser)', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('blocked'); },
      removeItem: () => { throw new Error('blocked'); },
    });
    const storage = browserStorage();
    expect(storage.load()).toEqual([]);
    expect(() => storage.save([{ ...TRASH, id: 'a', at: 1 }])).not.toThrow();
  });
});
