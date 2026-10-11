import type {
  GlanceChip,
  MemberProgress,
  ModuleAction,
  ModuleContext,
  ModuleService,
  ServiceHost,
} from '../../core/module-registry';
import type { LiveConnection, LiveStatus } from '../../core/live-subscription';
import { errorMessage } from '../../core/ws-api';
import { ChoresApi, ChoresSubscription } from './chores-client';
import type { Board, ChoresFeed } from './chores-types';
import { CheckoffQueue, QueuedCheckoff, SendOutcome, browserStorage, outcomeOf } from './checkoff-queue';
import { withQueued } from './overlay';
import { choresBarActions, choresGlance, choresStripActions, nextEventChip } from './chores-glance';
import { calendarNameOf, eventsOn, nextForHousehold } from './calendar-ties';

/** Something to tell whoever is at the screen: a check-off that couldn't be saved. */
export interface ChoresNotice {
  id: string;
  text: string;
  /** The entry it is about, when it is a check-off. */
  entry?: QueuedCheckoff;
}

/** Whether the household has chores on (spec 6.3: the module only shows then). */
export function choresEnabled(ctx: Pick<ModuleContext, 'household'>): boolean {
  const modules = ctx.household?.modules as { chores?: { enabled?: boolean } } | undefined;
  return !!ctx.household?.available && modules?.chores?.enabled === true;
}

/** What a refused check-off says (spec 15.1). */
export function refusalText(entry: QueuedCheckoff, code: string): string {
  if (code === 'period_closed') return `Couldn't save "${entry.name}": the day had ended.`;
  if (code === 'pin_required' || code === 'parent_mode_required') {
    return `Couldn't save "${entry.name}". The PIN timed out, so hold it again.`;
  }
  return `Couldn't save "${entry.name}". Try again.`;
}

// One queue per page: localStorage is shared by every card on it.
const live = new Set<ChoresService>();
let pageQueue: CheckoffQueue | null = null;
let services = 0;

function sharedQueue(): CheckoffQueue {
  if (!pageQueue) {
    pageQueue = new CheckoffQueue(
      browserStorage(),
      entry => {
        const owner = [...live].find(service => service.id === entry.card) ?? [...live].find(service => service.connected);
        return owner ? owner.send(entry) : Promise.resolve<SendOutcome>({ kind: 'wait' });
      },
      {
        changed: () => live.forEach(service => service.requestUpdate()),
        refused: (entry, code) => {
          const owner = [...live].find(service => service.id === entry.card) ?? [...live][0];
          owner?.notify({ id: entry.id, text: refusalText(entry, code), entry });
        },
      },
    );
  }
  return pageQueue;
}

/** For tests: forget the page's queue. */
export function resetSharedQueue(): void {
  pageQueue = null;
  live.clear();
}

const RESEND_MS = 15_000;

/**
 * The chores module's card-wide state (spec 10.7): the board feed, the
 * check-offs waiting to be sent, and what the header and bar show about
 * chores on every module. One per card; it subscribes only while the
 * household has chores on.
 */
export class ChoresService implements ModuleService {
  readonly id = `card${++services}`;
  feed: ChoresFeed | null = null;
  status: LiveStatus = 'idle';
  notices: ChoresNotice[] = [];
  readonly api: ChoresApi;
  readonly queue: CheckoffQueue;
  private readonly _subscription: ChoresSubscription;
  private _following = false;
  private _resend: ReturnType<typeof setInterval> | undefined;
  private _boardFor: { feed: ChoresFeed | null; entries: readonly unknown[]; board: Board | null } = {
    feed: null, entries: [], board: null,
  };

  constructor(private readonly _host: ServiceHost) {
    this.api = new ChoresApi(
      { callWS: <T>(msg: Record<string, unknown>) => (this._host.hass as unknown as { callWS(m: unknown): Promise<T> }).callWS(msg) },
      () => this._host.pinSession?.token ?? null,
      token => this._host.sessionEnded(token),
    );
    this.queue = sharedQueue();
    this._subscription = new ChoresSubscription(
      feed => {
        this.feed = feed;
        this.requestUpdate();
      },
      status => {
        this.status = status;
        if (status === 'live') void this.queue.flush();
        this.requestUpdate();
      },
    );
    _host.addController(this);
  }

  get connected(): boolean {
    return this.status === 'live';
  }

  hostConnected(): void {
    live.add(this);
    this._follow();
    this._resend = setInterval(() => {
      if (this.queue.waiting && this.connected) void this.queue.flush();
    }, RESEND_MS);
  }

  hostUpdate(): void {
    this._follow();
  }

  hostDisconnected(): void {
    live.delete(this);
    clearInterval(this._resend);
    this._resend = undefined;
    this._subscription.stop();
    this._following = false;
    this.feed = null;
  }

  requestUpdate(): void {
    this._host.serviceChanged();
  }

  private _follow(): void {
    const on = choresEnabled({ household: this._host.householdView });
    if (!on) {
      if (this._following) {
        this._subscription.stop();
        this._following = false;
        this.feed = null;
      }
      return;
    }
    this._following = true;
    this._subscription.update(this._host.hass?.connection as unknown as LiveConnection<ChoresFeed> | undefined);
  }

  /** Try to reach Home Assistant again now (the error state's Try again). */
  retry(): void {
    this._subscription.retry();
    void this.queue.flush();
  }

  /** Today's board with waiting check-offs shown as done; null until the feed arrives or when chores aren't usable. */
  board(): Board | null {
    const feed = this.feed;
    const entries = this.queue.entries;
    if (this._boardFor.feed === feed && this._boardFor.entries === entries) return this._boardFor.board;
    const board = feed?.state === 'ok' && feed.board ? withQueued(feed.board, entries) : null;
    this._boardFor = { feed, entries, board };
    return board;
  }

  /** Queue a check-off or an uncheck and send it when the connection allows. */
  enqueue(entry: Omit<QueuedCheckoff, 'id' | 'at' | 'card'>): QueuedCheckoff | null {
    const added = this.queue.add({ ...entry, card: this.id });
    if (this.connected) void this.queue.flush();
    return added;
  }

  /** Send one waiting entry (the queue calls this). */
  async send(entry: QueuedCheckoff): Promise<SendOutcome> {
    if (!this.connected) return { kind: 'wait' };
    try {
      if (entry.op === 'complete') await this.api.complete(entry.occurrence, entry.doneBy);
      else await this.api.undo(entry.occurrence);
      return { kind: 'sent' };
    } catch (err) {
      return outcomeOf(err, errorMessage(err));
    }
  }

  notify(notice: ChoresNotice): void {
    this.notices = [...this.notices, notice];
    this.requestUpdate();
  }

  /** The notices not yet shown; whoever shows them takes them. */
  takeNotices(): ChoresNotice[] {
    const notices = this.notices;
    if (notices.length) this.notices = [];
    return notices;
  }

  glance(ctx: ModuleContext): GlanceChip[] {
    if (!choresEnabled(ctx)) return [];
    const board = this.board();
    const chips = choresGlance(board);
    if (!board) return chips;
    const data = this._host.planavistaData;
    const now = new Date();
    const events = eventsOn(data, new Date(board.day.start), new Date(board.day.end), ctx.config);
    const next = nextForHousehold(events, ctx.household?.members ?? [], now, data?.display?.time_format ?? '12h',
      entityId => calendarNameOf(data, entityId));
    return [...chips, ...nextEventChip(next)];
  }

  barActions(ctx: ModuleContext): ModuleAction[] {
    return choresBarActions(this.board(), ctx.household ?? null, this._host.pinSession);
  }

  stripActions(): ModuleAction[] {
    return choresStripActions(this.board());
  }

  memberProgress(memberId: string): MemberProgress | null {
    const member = this.board()?.members[memberId];
    if (!member) return null;
    return { done: member.today.done, pending: member.today.pending, due: member.today.due };
  }
}
