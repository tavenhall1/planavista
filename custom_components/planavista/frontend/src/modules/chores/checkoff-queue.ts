import { errorCode } from '../../core/ws-api';

/**
 * Check-offs waiting to reach Home Assistant (spec 15.1). A check-off shows
 * at once and is sent when the connection allows; while Home Assistant
 * restarts or the Wi-Fi drops it waits in the browser's storage, so it
 * survives a reload, and goes through when the connection returns. Resending
 * is safe because each one names its occurrence. The server's clock decides:
 * one that can no longer count (its day ended) is dropped with a message,
 * and so is one refused for any other reason, so the item reverts.
 */

export type CheckoffOp = 'complete' | 'undo';

export interface QueuedCheckoff {
  /** This card's id for the entry. */
  id: string;
  op: CheckoffOp;
  occurrence: string;
  /** Whose item it is. */
  member: string;
  /** The chore's name, for messages. */
  name: string;
  /** Who did it, when someone else did. */
  doneBy?: string;
  /** What the item shows until the answer comes: done, or waiting for OK. */
  shows?: 'done' | 'pending';
  /** When it was queued (ms since the epoch). */
  at: number;
  /** The card that queued it (its PIN session sends it); any card sends it once that one is gone. */
  card?: string;
}

export interface QueueStorage {
  load(): QueuedCheckoff[];
  save(entries: QueuedCheckoff[]): void;
}

/** What sending an entry came to: it went through, it must wait (no connection), or it was refused. */
export type SendOutcome = { kind: 'sent' } | { kind: 'wait' } | { kind: 'refused'; code: string; message: string | null };

export interface QueueListener {
  /** The entries changed (an entry was added, went through, or was dropped). */
  changed(): void;
  /** An entry was refused and dropped; its item reverts. */
  refused(entry: QueuedCheckoff, code: string, message: string | null): void;
}

/** How a send that threw counts: a code Home Assistant chose is a refusal; anything else means wait. */
export function outcomeOf(err: unknown, message: string | null = null): SendOutcome {
  const code = errorCode(err);
  return code === 'unknown' ? { kind: 'wait' } : { kind: 'refused', code, message };
}

let counter = 0;

/** A unique id for an entry. */
export function entryId(now = Date.now()): string {
  counter = (counter + 1) % 1_000_000;
  return `${now.toString(36)}-${counter.toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
}

export class CheckoffQueue {
  private _entries: QueuedCheckoff[];
  private _flushing = false;
  private _again = false;

  constructor(
    private readonly _storage: QueueStorage,
    private readonly _send: (entry: QueuedCheckoff) => Promise<SendOutcome>,
    private readonly _listener: QueueListener,
  ) {
    this._entries = _storage.load();
  }

  get entries(): readonly QueuedCheckoff[] {
    return this._entries;
  }

  get waiting(): boolean {
    return this._entries.length > 0;
  }

  /** The newest entry waiting for an occurrence, if any. */
  latestFor(occurrence: string): QueuedCheckoff | undefined {
    for (let i = this._entries.length - 1; i >= 0; i--) {
      if (this._entries[i].occurrence === occurrence) return this._entries[i];
    }
    return undefined;
  }

  /**
   * Queue a check-off or an uncheck. An uncheck of a check-off still waiting
   * cancels it instead, so nothing is sent for a check-off taken back before
   * it left. (A check-off after a waiting uncheck is sent after it: it may
   * name someone else as the doer.)
   */
  add(entry: Omit<QueuedCheckoff, 'id' | 'at'> & { id?: string; at?: number }): QueuedCheckoff | null {
    const last = this.latestFor(entry.occurrence);
    if (entry.op === 'undo' && last?.op === 'complete' && !this._isSending(last)) {
      this._entries = this._entries.filter(e => e !== last);
      this._persist();
      return null;
    }
    const full: QueuedCheckoff = { ...entry, id: entry.id ?? entryId(), at: entry.at ?? Date.now() };
    this._entries = [...this._entries, full];
    this._persist();
    return full;
  }

  /** Send what's waiting, oldest first, one at a time; stop at the first that has to wait. */
  async flush(): Promise<void> {
    if (this._flushing) {
      this._again = true;
      return;
    }
    this._flushing = true;
    try {
      do {
        this._again = false;
        while (this._entries.length > 0) {
          const entry = this._entries[0];
          this._sending = entry;
          let outcome: SendOutcome;
          try {
            outcome = await this._send(entry);
          } catch (err) {
            outcome = outcomeOf(err);
          }
          this._sending = null;
          if (outcome.kind === 'wait') return;
          this._entries = this._entries.filter(e => e !== entry);
          this._persist();
          if (outcome.kind === 'refused') this._listener.refused(entry, outcome.code, outcome.message);
        }
      } while (this._again);
    } finally {
      this._sending = null;
      this._flushing = false;
    }
  }

  private _sending: QueuedCheckoff | null = null;

  private _isSending(entry: QueuedCheckoff): boolean {
    return this._sending === entry;
  }

  private _persist(): void {
    this._storage.save(this._entries);
    this._listener.changed();
  }
}

const STORAGE_KEY = 'planavista.checkoffs';
/** Entries older than this are dropped on load: the day they belonged to is long over. */
const STALE_MS = 2 * 24 * 60 * 60 * 1000;

/** The queue's home in the browser: localStorage, shared by every card on the page. */
export function browserStorage(now: () => number = Date.now): QueueStorage {
  return {
    load() {
      try {
        const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
        const parsed = raw ? (JSON.parse(raw) as unknown) : [];
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(
          (e): e is QueuedCheckoff =>
            !!e && typeof e === 'object' && typeof (e as QueuedCheckoff).occurrence === 'string' &&
            ((e as QueuedCheckoff).op === 'complete' || (e as QueuedCheckoff).op === 'undo') &&
            typeof (e as QueuedCheckoff).at === 'number' && now() - (e as QueuedCheckoff).at < STALE_MS,
        );
      } catch {
        return [];
      }
    },
    save(entries) {
      try {
        if (entries.length === 0) globalThis.localStorage?.removeItem(STORAGE_KEY);
        else globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(entries));
      } catch {
        // Storage can be full or blocked; the queue still works until the page reloads.
      }
    },
  };
}
