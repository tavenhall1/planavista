import { LitElement, html, css, nothing, PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../utils/define';
import { buttonStyles } from '../../styles/shared';
import type { Layout } from '../../core/layout';
import { HouseholdView, Member, inOrder, memberColor } from '../../core/household';
import type { ModuleElement, ModuleService, OpenTarget } from '../../core/module-registry';
import type { PinGate } from '../../core/pin-gate';
import type { Session } from '../../core/session';
import type { Toast } from '../../core/pv-toast';
import { keyed } from 'lit/directives/keyed.js';
import { guardPageTaps } from '../../core/press-guard';
import { BoardHandoff, boardHandoff, handoffWords, sheetKey } from './sheet-key';
import { actingParent, creditAccess, creditable, memberAccess, parentAccess, pinChoicesFor } from '../../core/access';
import { OPEN_SETTINGS } from '../../core/page-host';
import { deepActiveElement } from '../../core/focus';
import { ViewPlace, viewChange, viewMotion } from '../../core/view-motion';
import { motionOf, supportsLinearEasing } from '../../core/motion';
import type { SettingsTarget } from '../../core/settings-registry';
import type { Mode } from '../../styles/theme-pairs';
import type { DisplayConfig, PlanaVistaCardConfig, PlanaVistaData } from '../../types';
import { choresStyles } from './chores-styles';
import type { ChoresService } from './chores-service';
import type { Board } from './chores-types';
import { ColumnModel, RowModel, boardColumns } from './board-derive';
import { eventsOn } from './calendar-ties';
import { bedtimeOn, fairShares, goalFor } from './my-day-derive';
import type { MyDayStyle } from './pv-chores-my-day';
import type { DayView, WeekView } from './chores-types';
import { weekHighlights, weekRows, weekShares } from './week-derive';
import { addDays } from './options-derive';
import { RewardDraft, balances, elsewhereText, recentLine, redeemers, rewardCards, rewardFrom, settleAsks } from './rewards-derive';
import { memoizeOne } from '../../utils/render-cache';
import type { HoldDetail } from './pv-chore-item';
import { needsOk } from './overlay';
import { creditedText, dayWords, historyLines, itemOptions, skipWords, whoDidItBody } from './options-derive';
import { RecentCheckoffs } from './recent-checkoffs';
import type { OptionChoice } from './pv-chore-options';
import { InboxRow, answeredText, approveAllSummary, excusedRequest, inboxGroups, lateRequest, reviewQuestion } from './inbox-derive';
import type { ApproveAllAsk, ReviewDetail } from './pv-chores-inbox';
import { QuickAddDraft, activityFrom } from './quick-add';
import { errorCode, errorMessage } from '../../core/ws-api';
import './pv-surprise-present';
import './pv-surprise-reveal';
import type { SurpriseOpenDetail } from './pv-surprise-present';
import type { RevealDetail } from './pv-surprise-reveal';
import { mayOpenSurprise, surpriseOf } from './surprise-derive';
import { chime, haptic } from './effects';
import type { PvChoresBoard } from './pv-chores-board';
import { IMPORT_EXPORT, editChore } from './settings/targets';
import '../../core/pv-toast';
import '../../shell/pv-notice-sheet';
import './pv-chores-board';
import './pv-chores-people-sheet';
import './pv-chore-options';
import './pv-chores-inbox';
import './pv-chores-quick-add';
import './pv-chores-my-day';
import './pv-chores-week';
import './pv-chores-day-sheet';
import './pv-chores-rewards';
import './pv-chores-reward-sheet';

/** A sheet the chores screens show over themselves. */
type ChoresSheet =
  | { kind: 'start_over' }
  | { kind: 'no_pin'; heading: string }
  | { kind: 'people'; heading: string; body?: string; people: Member[]; pick: (member: Member | null) => void }
  | { kind: 'options'; key: string; history: string[] | null; busy: boolean }
  | { kind: 'delete'; row: RowModel }
  | { kind: 'inbox' }
  | { kind: 'reward'; id: string | null; busy: boolean }
  | { kind: 'delete_reward'; id: string; name: string }
  | { kind: 'day'; member: string; date: string; day: DayView | null; failed: boolean }
  | { kind: 'quick_add'; busy: boolean };

/** What the last check-off toast can take back or hand to someone else. */
interface LastCheckoff {
  row: RowModel;
  member: string;
  toast: string;
}

/**
 * pv-chores-module: the Chores module (spec 13). It shows the view the bar
 * picked (Board, Week, My day, Rewards) over the card-wide chores feed, its
 * sheets, and its toasts, and asks the card for PINs when a change needs one.
 * The engine decides everything; this only draws the feed and sends changes.
 *
 * @fires pv-overlay-change - { open } when one of its sheets opens or closes
 * @fires pv-open - a module and view to go to
 */
export class PvChoresModule extends LitElement implements ModuleElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data: PlanaVistaData | null = null;
  /** The card's options: its `calendars` list narrows the events the chores screens show. */
  @property({ attribute: false }) cardConfig?: PlanaVistaCardConfig;
  @property({ attribute: false }) display!: DisplayConfig;
  @property({ attribute: false }) mode: Mode = 'light';
  @property({ attribute: false }) view: string | undefined;
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ attribute: false }) session: Session | null = null;
  @property({ attribute: false }) services: Record<string, ModuleService> = {};
  /** Bumped by the card whenever the chores feed has news. */
  @property({ attribute: false }) revision = 0;
  @property({ attribute: false }) pinGate?: PinGate;
  @property({ attribute: false }) openTarget: OpenTarget | null = null;

  @state() protected _sheet: ChoresSheet | null = null;
  @state() protected _toast: Toast | null = null;
  /** Minutes since the epoch, so bands and the evening check move with the clock. */
  @state() private _minute = Math.floor(Date.now() / 60000);
  /** The Week view: how many weeks from this one, what came back, and for which request. */
  @state() private _weekOffset = 0;
  /** The view (and Week's week) last drawn, to tell how the next change moves (spec 11.5). */
  private _drawn: ViewPlace | null = null;
  @state() private _week: WeekView | null = null;
  @state() private _weekFailed = false;
  private _weekAsked: string | null = null;
  private _weekRevision = -1;
  /** Whose My day is showing. */
  @state() private _myDayMember: string | null = null;
  /** Requests being answered in the inbox. */
  @state() private _reviewing: ReadonlySet<string> = new Set();
  private _overlayOpen = false;
  /** What had focus when a sheet opened; it gets focus back when the sheet closes (spec 11.8). */
  private _opener: HTMLElement | null = null;
  /** Each check-off toast's own check-off, so its Undo always knows what to undo (milestone 8). */
  private readonly _recent = new RecentCheckoffs<LastCheckoff>();
  /** Rewards asked for that the board doesn't show yet: Redeem waits at once. */
  @state() private _asking: ReadonlyArray<{ member: string; reward: string }> = [];
  private _clock: ReturnType<typeof setInterval> | undefined;

  static styles = [
    buttonStyles,
    choresStyles,
    css`
      :host {
        position: relative;
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-height: 0;
        background: var(--pv-bg, #F8F8F6);
      }

      .view {
        position: relative;
        flex: 1 1 auto;
        min-height: 0;
        display: flex;
        flex-direction: column;
      }

      .skeleton {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 12px;
        padding: 12px;
      }

      .skeleton .col {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 16px;
        border-radius: var(--pv-radius-lg, 16px);
        background: var(--pv-card-bg, #FFFFFF);
        border: 1px solid var(--pv-border, #E7E7E3);
      }

      .skeleton .who {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
      }
    `,
  ];

  /** The chores feed and queue, kept by the card for every module. */
  protected get service(): ChoresService | undefined {
    return this.services?.chores as ChoresService | undefined;
  }

  /** The service whose notices this element shows (so a refusal is told here, spec 15.1). */
  private _watching: { service: ChoresService; stop: () => void } | null = null;

  private _watch(): void {
    const service = this.isConnected ? this.service : undefined;
    if (this._watching?.service === service) return;
    this._watching?.stop();
    this._watching = service ? { service, stop: service.watch() } : null;
  }

  /** The bar's and the parent-mode strip's buttons: Waiting for approval and Add chore. */
  moduleAction(id: string): void {
    if (id === 'inbox') {
      // Pressed again, it closes To approve (round 10: sideways on a phone, Done was out of reach).
      if (this._sheet?.kind === 'inbox') void this.renderRoot.querySelector<HTMLElement & { close(): Promise<void> }>('pv-chores-inbox')?.close();
      else void this._openInbox();
    }
    if (id === 'add') void this._openQuickAdd();
  }

  private async _openInbox(): Promise<void> {
    if (await this.asParent("Who's approving?")) {
      this._sheet = { kind: 'inbox' };
      // A double tap on the bar's button would close it again at once (round 11).
      guardPageTaps();
    }
  }

  private async _openQuickAdd(): Promise<void> {
    if (await this.asParent("Who's adding a chore?")) this._sheet = { kind: 'quick_add', busy: false };
  }

  /** One answer from the inbox: its own review, attributed to the parent (spec 13.7). */
  private async _review(detail: ReviewDetail): Promise<boolean> {
    const result = await this._answer(detail.row, detail.allow, detail.note ?? null);
    detail.settled?.(result === 'done');
    return result === 'done';
  }

  /** What the last refused answer said, for Approve all's summary (round 7). */
  private _lastRefusal: string | null = null;

  /** One answer, and how it went: answered elsewhere meanwhile is `gone`, not a failure (round 6). */
  private async _answer(row: InboxRow, allow: boolean, note: string | null, quietGone = false): Promise<'done' | 'cancelled' | 'gone' | 'failed'> {
    const api = this.service?.api;
    if (!api || !(await this.asParent(reviewQuestion(row, allow)))) return 'cancelled';
    this._reviewing = new Set([...this._reviewing, row.id]);
    try {
      await api.review(row.id, allow ? 'allow' : 'decline', note);
      this.showToast({ id: `review-${row.id}`, text: answeredText(row, allow, note) });
      return 'done';
    } catch (err) {
      const gone = ['unknown_request', 'request_closed', 'request_withdrawn', 'request_handed_on'].includes(errorCode(err));
      this._lastRefusal = errorMessage(err);
      if (!(gone && quietGone)) {
        this.showToast({ id: `review-${row.id}-${Date.now()}`, text: errorMessage(err) ?? 'That didn\'t save. Try again.', tone: 'bad' });
      }
      return gone ? 'gone' : 'failed';
    } finally {
      const next = new Set(this._reviewing);
      next.delete(row.id);
      this._reviewing = next;
    }
  }

  /** Approve all: each chore to check approved on its own, so each is attributed and stands alone. */
  /** Approve all's question, asked over the inbox (round 6). */
  @state() private _approveAsk: ApproveAllAsk | null = null;

  /** The rows it named, less any answered elsewhere since; none left (or the inbox gone), no question. */
  private _renderApproveAsk() {
    const ask = this._approveAsk;
    if (!ask) return nothing;
    const waiting = new Set(this.service?.board()?.requests.map(r => r.id) ?? []);
    const rows = ask.rows.filter(row => waiting.has(row.id));
    if (rows.length === 0 || this._sheet?.kind !== 'inbox') {
      queueMicrotask(() => { if (this._approveAsk === ask) this._approveAsk = null; });
      return nothing;
    }
    return html`
      <pv-notice-sheet .layout=${this.layout} heading=${`Approve all ${rows.length}?`}
        body="Each one counts as approved by you, with its stars."
        .actions=${[{ id: 'approve', label: `Approve all ${rows.length}`, kind: 'primary' }, { id: 'cancel', label: 'Cancel', kind: 'secondary' }]}
        @pv-sheet-action=${(e: CustomEvent<{ id: string }>) => this._onApproveAsk(e, ask, rows)}></pv-notice-sheet>
    `;
  }

  private _onApproveAsk(event: CustomEvent<{ id: string }>, ask: ApproveAllAsk, rows: InboxRow[]): void {
    event.stopPropagation();
    this._approveAsk = null;
    // Focus back in To approve, not the page (round 15).
    void this.updateComplete.then(() => this.renderRoot.querySelector<HTMLElement & { focusTitle(): void }>('pv-chores-inbox')?.focusTitle());
    if (event.detail.id !== 'approve') return;
    ask.start(rows);
    void this._approveAll(rows, (id, ok) => ask.settle(id, ok));
  }

  /** Each row it named, past any answered elsewhere meanwhile; a cancelled PIN or a failure stops it (round 6). */
  private async _approveAll(rows: InboxRow[], settle?: (id: string, ok: boolean) => void): Promise<void> {
    this._lastRefusal = null;
    let approved = 0;
    let gone = 0;
    let stopped: 'cancelled' | 'failed' | null = null;
    for (const row of rows) {
      if (stopped) {
        settle?.(row.id, false);
        continue;
      }
      const result = await this._answer(row, true, null, true);
      settle?.(row.id, result === 'done');
      if (result === 'done') approved += 1;
      else if (result === 'gone') gone += 1;
      else stopped = result;
    }
    // A failure stops it and says how many didn't save (round 7: the summary hid the error).
    const summary = approveAllSummary(approved, gone, stopped === 'failed' ? rows.length - approved - gone : 0, this._lastRefusal);
    if (summary) this.showToast({ id: `approved-${Date.now()}`, text: summary.text, tone: summary.tone });
  }

  private async _quickAdd(draft: QuickAddDraft): Promise<void> {
    const board = this.service?.board();
    const api = this.service?.api;
    if (!board || !api || this._sheet?.kind !== 'quick_add') return;
    if (!(await this.asParent("Who's adding a chore?"))) return;
    this._sheet = { kind: 'quick_add', busy: true };
    try {
      await api.saveActivity(activityFrom(draft, board.today));
      this._sheet = null;
      this.showToast({ id: `added-${Date.now()}`, text: `Added ${draft.name.trim()}.` });
    } catch (err) {
      this._sheet = { kind: 'quick_add', busy: false };
      this.showToast({ id: `add-${Date.now()}`, text: errorMessage(err) ?? 'That didn\'t save. Try again.', tone: 'bad' });
    }
  }

  protected willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    if (changed.has('_sheet')) {
      const before = changed.get('_sheet') as ChoresSheet | null | undefined;
      if (!before && this._sheet) this._opener = deepActiveElement();
    }
    // A ring in the calendar, or a column header, opened someone's day.
    if (changed.has('openTarget') && this.openTarget?.member) this._myDayMember = this.openTarget.member;
    this._watch();
    // An ask the board now shows is the board's: drop it here, so a parent's answer clears the card (review).
    const board = this._asking.length ? this.service?.board() : null;
    if (board) {
      const left = settleAsks(this._asking, board);
      if (left !== this._asking) this._asking = left;
    }
    const notices = this.service?.takeNotices() ?? [];
    const last = notices[notices.length - 1];
    if (last) this._toast = { id: last.id, text: last.text, tone: 'bad', ms: 7000 };
  }

  protected updated(changed: PropertyValues): void {
    super.updated(changed);
    if (changed.has('session') || changed.has('household')) this._refreshReveal();
    this._replayCutShort();
    if (this.view === 'week') this._loadWeek();
    if (changed.has('_sheet') && changed.get('_sheet') && !this._sheet) {
      const opener = this._opener;
      this._opener = null;
      if (opener?.isConnected) opener.focus();
    }
    const open = this._sheet !== null;
    if (open !== this._overlayOpen) {
      this._overlayOpen = open;
      this.dispatchEvent(new CustomEvent('pv-overlay-change', { detail: { open }, bubbles: true, composed: true }));
    }
    this._playViewChange();
  }

  /** The calendar's springs for view changes (spec 11.5): another view glides in, another week slides in from its side. */
  private _playViewChange(): void {
    const next: ViewPlace = { view: this.view ?? 'board', at: this.view === 'week' ? this._weekOffset : 0 };
    const change = viewChange(this._drawn, next);
    this._drawn = next;
    const motion = viewMotion(change, motionOf(this), supportsLinearEasing());
    if (motion) this.renderRoot.querySelector<HTMLElement>('.view')?.animate(motion.keyframes, motion.options);
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._clock = setInterval(() => {
      const minute = Math.floor(Date.now() / 60000);
      if (minute !== this._minute) this._minute = minute;
    }, 5000);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    clearInterval(this._clock);
    this._watching?.stop();
    this._watching = null;
    if (this._overlayOpen) {
      this._overlayOpen = false;
      this.dispatchEvent(new CustomEvent('pv-overlay-change', { detail: { open: false }, bubbles: true, composed: true }));
    }
  }

  render() {
    const service = this.service;
    if (!service) return nothing;
    return html`
      ${this._renderContent(service)}
      <pv-toast .toast=${this._toast} @pv-toast-gone=${() => { this._toast = null; }}
        @pv-toast-action=${this._onToastAction}></pv-toast>
      ${keyed(sheetKey(this._sheet), this._renderSheet())}
      ${this._renderApproveAsk()}
    `;
  }

  private _renderContent(service: ChoresService) {
    const feed = service.feed;
    if (!feed) {
      return service.status === 'offline' ? this._unreachable(service) : this._skeleton();
    }
    if (feed.state === 'needs_a_look') return this._needsALook();
    if (feed.state === 'newer') {
      return html`
        <div class="state">
          <div class="art" aria-hidden="true">⬆️</div>
          <h2>Update PlanaVista to use chores</h2>
          <p>These chores were saved by a newer PlanaVista. Update it in HACS to use them on this screen.</p>
        </div>
      `;
    }
    if (feed.state === 'off' || !feed.board) {
      return html`
        <div class="state">
          <div class="art" aria-hidden="true">🧺</div>
          <h2>Chores are off</h2>
          <p>A parent can turn them on in Settings.</p>
        </div>
      `;
    }
    return html`
      ${service.status === 'offline' ? html`
        <div class="banner" role="status">
          <span class="text"><strong>Can't reach Home Assistant.</strong> Your check-offs aren't lost. We'll keep trying.</span>
          <button class="pv-btn pv-btn-secondary" type="button" @click=${() => service.retry()}>Try again</button>
        </div>
      ` : nothing}
      ${feed.save_failed ? html`
        <div class="banner" role="status">
          <span class="text"><strong>Couldn't save.</strong> Home Assistant will keep trying. If this stays, check its storage in Settings, System, Repairs.</span>
        </div>
      ` : nothing}
      <div class="view">${this.renderView()}</div>
    `;
  }

  private _columnsFor = memoizeOne((board: Board, household: HouseholdView | null, data: PlanaVistaData | null,
    config: PlanaVistaCardConfig | undefined, timeFormat: '12h' | '24h', _minute: number) =>
    boardColumns(board, {
      today: board.today,
      now: new Date(),
      events: eventsOn(data, new Date(board.day.start), new Date(board.day.end), config),
      timeFormat,
      activities: new Map(board.chores.map(a => [a.id, a])),
      members: household ? inOrder(household.members) : [],
    }));

  /** Whose day My day shows: the one picked, else this account's own person, else the first. */
  private _myDayColumn(columns: ColumnModel[]): ColumnModel | undefined {
    const wanted = this._myDayMember ?? this.household?.account.member_id ?? null;
    return columns.find(c => c.member.id === wanted) ?? columns[0];
  }

  private _openMyDay(memberId: string): void {
    this._myDayMember = memberId;
    this.dispatchEvent(new CustomEvent('pv-view-change', { detail: { view: 'my_day' }, bubbles: true, composed: true }));
  }

  private async _setStyle(memberId: string, style: MyDayStyle): Promise<void> {
    const api = this.service?.api;
    if (!api || !(await this.asMember(memberId, 'Whose day is this?'))) return;
    try {
      await api.savePrefs(memberId, { my_day: style });
    } catch (err) {
      this.showToast({ id: `style-${Date.now()}`, text: errorMessage(err) ?? 'That didn\'t save. Try again.', tone: 'bad' });
    }
  }

  private _renderMyDay(board: Board) {
    const timeFormat = this.display?.time_format ?? '12h';
    const columns = this._columnsFor(board, this.household, this.data, this.cardConfig, timeFormat, this._minute);
    const column = this._myDayColumn(columns);
    if (!column) return nothing;
    const member = column.member;
    return html`
      <pv-chores-my-day .column=${column} .columns=${columns} .board=${board} .hass=${this.hass} layout=${this.layout}
        .events=${eventsOn(this.data, new Date(board.day.start), new Date(board.day.end), this.cardConfig)}
        .colorOf=${this._colorOf} .timeFormat=${timeFormat} .minute=${this._minute}
        .goal=${goalFor(member, column.entry, board.rewards)} .shares=${fairShares(board, inOrder(this.household?.members ?? []))}
        .bedtime=${bedtimeOn(member, new Date())}
        .surprise=${surpriseOf(member.id, column.entry, board.rewards)} ?mayOpen=${mayOpenSurprise(this.household, member.id)}
        @pv-surprise-open=${(e: CustomEvent<SurpriseOpenDetail>) => this._openSurprise(e.detail)}
        ?locked=${memberAccess(this.household, this.session, member.id) === 'no'}
        @pv-my-day-member=${(e: CustomEvent<{ member: string }>) => { this._myDayMember = e.detail.member; }}
        @pv-my-day-style=${(e: CustomEvent<{ member: string; style: MyDayStyle }>) => void this._setStyle(e.detail.member, e.detail.style)}
        @pv-hold-done=${(e: CustomEvent<HoldDetail>) => this._complete(e.detail)}
        @pv-hold-undo=${(e: CustomEvent<HoldDetail>) => this._uncheck(e.detail)}
        @pv-hint=${(e: CustomEvent<{ row: RowModel }>) => this._hint(e.detail.row)}
        @pv-row-options=${(e: CustomEvent<{ row: RowModel }>) => this._openOptions(e.detail.row)}></pv-chores-my-day>
    `;
  }

  /** The week to show, fetched when the view opens, the week changes, or (this week) the board changes. */
  /** Loads the week shown; the promise settles once it has (round 7: Excuse it waits for it). */
  private _loadWeek(force = false): Promise<void> {
    const board = this.service?.board();
    const api = this.service?.api;
    if (!board || !api) return Promise.resolve();
    const date = this._weekOffset === 0 ? board.week.start : addDays(board.week.start, 7 * this._weekOffset);
    const stale = this._weekOffset === 0 && this._weekRevision !== this.revision;
    if (!force && this._weekAsked === date && !stale) return Promise.resolve();
    this._weekAsked = date;
    this._weekRevision = this.revision;
    if (this._week?.week.start !== date) this._week = null;
    this._weekFailed = false;
    return api.week(date).then(
      view => {
        if (this._weekAsked === date) this._week = view;
      },
      () => {
        if (this._weekAsked === date) this._weekFailed = true;
      },
    );
  }

  private _renderWeek(board: Board) {
    const members = inOrder(this.household?.members ?? []);
    const view = this._week;
    return html`
      <pv-chores-week .view=${view} .excusing=${this._excusing} .rows=${view ? weekRows(view, members, board.week.days_left) : []}
        .highlights=${view ? weekHighlights(view, members) : []} .shares=${view ? weekShares(view, members) : []}
        .hass=${this.hass} .colorOf=${this._colorOf} layout=${this.layout} ?current=${this._weekOffset === 0}
        ?failed=${this._weekFailed} ?canExcuse=${parentAccess(this.household, this.session) !== 'no'}
        @pv-week-nav=${(e: CustomEvent<{ offset: number }>) => this._navWeek(e.detail.offset)}
        @pv-week-day=${(e: CustomEvent<{ member: string; date: string }>) => this._openDay(e.detail.member, e.detail.date)}
        @pv-week-excuse=${(e: CustomEvent<{ occurrence: string; name: string; member: string }>) => void this._excuseMissed(e.detail.occurrence, e.detail.name, e.detail.member)}>
      </pv-chores-week>
    `;
  }

  private _navWeek(offset: number): void {
    this._weekOffset = offset === 0 ? 0 : this._weekOffset + offset;
    this._loadWeek(offset === 0 && this._weekFailed);
  }

  /** `keep`: the day shown stays while it reloads, so rows don't move under the finger (round 5). */
  private _openDay(member: string, date: string, keep = false): Promise<void> {
    const api = this.service?.api;
    if (!api) return Promise.resolve();
    const shown = keep && this._sheet?.kind === 'day' && this._sheet.date === date ? this._sheet.day : null;
    const sheet = { kind: 'day' as const, member, date, day: shown, failed: false };
    this._sheet = sheet;
    return api.day(date).then(
      day => {
        if (this._sheet?.kind === 'day' && this._sheet.date === date) this._sheet = { ...this._sheet, day };
      },
      () => {
        if (this._sheet?.kind === 'day' && this._sheet.date === date) this._sheet = { ...this._sheet, failed: true };
      },
    );
  }

  /** Excuse it on a missed one (spec 13.5): its day and the streak hold. */
  /** Being excused now: the day sheet's link takes no second tap, and comes back if nothing was (round 6). */
  @state() private _excusing: ReadonlySet<string> = new Set();

  private async _excuseMissed(occurrence: string, name: string, member: string): Promise<void> {
    const api = this.service?.api;
    if (!api || this._excusing.has(occurrence)) return;
    this._excusing = new Set([...this._excusing, occurrence]);
    try {
      if (!(await this.asParent(`Who's excusing ${name}?`))) return;
      const result = await api.excuseMissed(occurrence);
      const who = this._member(member)?.name;
      // Only a day that closes keeps the streak (round 9: it said so while the day had another miss).
      this.showToast({ id: `excused-${occurrence}`, text: `Excused ${name}.${result.streak_holds && who ? ` ${who}'s streak holds.` : ''}` });
      // Its link stays gone until the day and the week show it excused (round 7: a double tap excused twice).
      await Promise.all([
        this._loadWeek(true),
        this._sheet?.kind === 'day' ? this._openDay(this._sheet.member, this._sheet.date, true) : Promise.resolve(),
      ]);
    } catch (err) {
      this.showToast({ id: `excuse-${Date.now()}`, text: errorMessage(err) ?? 'That didn\'t save. Try again.', tone: 'bad' });
      // Excused on another screen meanwhile: show the day as it is (round 7: the row kept saying Missed).
      if (errorCode(err) === 'not_missed') {
        await Promise.all([
          this._loadWeek(true),
          this._sheet?.kind === 'day' ? this._openDay(this._sheet.member, this._sheet.date, true) : Promise.resolve(),
        ]);
      }
    } finally {
      const next = new Set(this._excusing);
      next.delete(occurrence);
      this._excusing = next;
    }
  }

  private _renderRewards(board: Board) {
    const members = inOrder(this.household?.members ?? []);
    return html`
      <pv-chores-rewards .balances=${balances(board, members)} .cards=${rewardCards(board, members, this._waitingAsks(board))}
        .recent=${recentLine(board, members)} .hass=${this.hass} .colorOf=${this._colorOf} layout=${this.layout}
        ?canEdit=${parentAccess(this.household, this.session) !== 'no'} .mayOpen=${this._mayOpen}
        @pv-surprise-open=${(e: CustomEvent<SurpriseOpenDetail>) => this._openSurprise(e.detail)}
        @pv-surprise-replay=${(e: CustomEvent<{ member: string }>) => this._replaySurprise(e.detail.member)}
        @pv-reward-redeem=${(e: CustomEvent<{ reward: string }>) => this._redeem(e.detail.reward)}
        @pv-reward-open=${(e: CustomEvent<{ reward: string | null }>) => void this._openReward(e.detail.reward)}></pv-chores-rewards>
    `;
  }

  /** Asks the board doesn't show yet; one the board has shown is the board's from then on (settled in willUpdate). */
  private _waitingAsks(board: Board): ReadonlyArray<{ member: string; reward: string }> {
    return settleAsks(this._asking, board);
  }

  /** Redeem: for whoever can afford it (asking who, when more than one can), behind their PIN if they have one. */
  private _redeem(rewardId: string): void {
    const board = this.service?.board();
    if (!board) return;
    const card = rewardCards(board, inOrder(this.household?.members ?? []), this._waitingAsks(board)).find(c => c.reward.id === rewardId);
    if (!card) return;
    const { ready, elsewhere } = redeemers(card, id => memberAccess(this.household, this.session, id) !== 'no');
    if (ready.length === 0) {
      // Never silent (round 1): say who can, and where.
      if (elsewhere.length) this.showToast({ id: `redeem-${Date.now()}`, text: elsewhereText(elsewhere, card.reward.name) });
      return;
    }
    const go = (member: Member) => this._redeemAs(member, rewardId, card.reward.name);
    if (ready.length === 1) {
      void go(ready[0]);
      return;
    }
    this._sheet = {
      kind: 'people', heading: `Who's getting ${card.reward.name}?`, people: ready, body: `It costs ★ ${card.reward.cost}.`,
      pick: member => { if (member) void go(member); },
    };
  }

  /** One member spends their stars on a reward, behind their PIN if they have one. */
  private async _redeemAs(member: Member, rewardId: string, rewardName: string): Promise<void> {
    const api = this.service?.api;
    if (!api || !(await this.asMember(member.id, `Who's getting ${rewardName}?`))) return;
    const ask = { member: member.id, reward: rewardId };
    this._asking = [...this._asking, ask];
    try {
      const out = await api.redeem(member.id, rewardId);
      if (out.result === 'given') this._asking = this._asking.filter(a => a !== ask);
      this.showToast({
        id: `redeem-${Date.now()}`,
        text: out.result === 'given' ? `${rewardName} is ${member.name}'s!` : `Asked for ${rewardName}. A parent will answer.`,
      });
    } catch (err) {
      this._asking = this._asking.filter(a => a !== ask);
      this.showToast({ id: `redeem-${Date.now()}`, text: errorMessage(err) ?? 'That didn\'t save. Try again.', tone: 'bad' });
    }
  }

  // The goal surprise (milestone 10) -------------------------------------------------------

  private _mayOpen = (memberId: string): boolean => mayOpenSurprise(this.household, memberId);

  /** A present held open: the reveal plays at once while Home Assistant marks it opened. */
  private _openSurprise(detail: SurpriseOpenDetail): void {
    const api = this.service?.api;
    if (!api) {
      detail.settle(false);
      return;
    }
    const reveal = this._reveal({ model: detail.model, name: detail.name, color: detail.color, from: detail.from });
    api.openSurprise(detail.model.memberId).then(
      () => detail.settle(true),
      err => {
        detail.settle(false);
        guardPageTaps(); // the hold's lifting finger lands on the page the reveal left (round 5)
        reveal.dispatchEvent(new CustomEvent('pv-fullscreen-done', { bubbles: true, composed: true }));
        this.showToast({ id: `surprise-${Date.now()}`, text: errorMessage(err) ?? 'That didn\'t open. Try again.', tone: 'bad' });
      },
    );
  }

  /** Watch it again, from Rewards: the same reveal, nothing to change. */
  private _replaySurprise(memberId: string): void {
    const board = this.service?.board();
    const member = this.household?.members.find(m => m.id === memberId);
    const model = board && member ? surpriseOf(memberId, board.members[memberId], board.rewards) : null;
    if (!model || !member) return;
    this._reveal({ model, name: member.name, color: this._colorOf(member), from: null });
  }

  /**
   * What it has open, for the card Home Assistant makes again after a reconnect
   * (core/handoff.ts). A sheet isn't reopened: parent mode went with the connection,
   * so it would ask for a PIN nobody asked for; the new card says what closed (round 4).
   */
  handoff(): BoardHandoff | undefined {
    return boardHandoff({
      sheet: this._sheet, reveal: this._openReveal?.detail.model.memberId ?? null, toast: this._toast?.text ?? null,
      myDay: this._myDayMember ?? null,
    });
  }

  resume(note: unknown, options?: { quiet?: boolean }): void {
    const n = note && typeof note === 'object' ? (note as BoardHandoff) : null;
    const words = handoffWords(n);
    if (words && !options?.quiet) this.showToast({ id: `handoff-${Date.now()}`, text: words });
    if (typeof n?.myDay === 'string' && this.household?.members.some(m => m.id === n.myDay)) this._myDayMember = n.myDay;
    if (typeof n?.reveal === 'string') this._replayAfter = { member: n.reveal, until: Date.now() + 15_000 };
    this.requestUpdate();
  }

  /** A reveal a reconnect cut short, played again once the board is here (round 4). */
  private _replayAfter: { member: string; until: number } | null = null;

  private _replayCutShort(): void {
    const want = this._replayAfter;
    if (!want) return;
    if (Date.now() > want.until) {
      this._replayAfter = null;
      return;
    }
    const board = this.service?.board();
    if (!board) return;
    this._replayAfter = null;
    // Opened before the drop: play it again. Not opened: its present still waits on the board.
    if (board.members[want.member]?.surprise?.opened) this._replaySurprise(want.member);
  }

  /** The reveal on screen, whose button follows this screen's session (round 4). */
  private _openReveal: (HTMLElement & { detail: RevealDetail }) | null = null;

  private _parentActs(): boolean {
    return actingParent(this.household, this.session)?.parent === true;
  }

  /** Parent mode began or lapsed under an open reveal: its button says what a press would do now. */
  private _refreshReveal(): void {
    const reveal = this._openReveal;
    if (!reveal) return;
    const parent = actingParent(this.household, this.session)?.parent === true;
    if (reveal.detail.parent !== parent) reveal.detail = { ...reveal.detail, parent };
  }

  /** Asks the card to show the reveal over everything; its button asks for the reward. */
  private _reveal(detail: Omit<RevealDetail, 'sound'>): HTMLElement {
    const reveal = document.createElement('pv-surprise-reveal') as HTMLElement & { detail: RevealDetail };
    const board = this.service?.board();
    const { memberId, reward } = detail.model;
    // An ask already waiting (or on its way) shows as waiting, not a second Ask for it (review B3).
    const asked = !!board?.requests.some(r => r.kind === 'redemption' && r.member === memberId && r.reward === reward.id)
      || this._asking.some(a => a.member === memberId && a.reward === reward.id);
    // A parent's own ask is their answer: the button says it gives it at once (round 3, r3b I4).
    reveal.detail = { ...detail, sound: !!board?.settings.sound, asked, parent: this._parentActs() };
    this._openReveal = reveal;
    reveal.addEventListener('pv-fullscreen-done', () => {
      if (this._openReveal === reveal) this._openReveal = null;
    });
    reveal.addEventListener('pv-reveal-choice', event => {
      if ((event as CustomEvent<{ choice: string }>).detail.choice !== 'ask') return;
      const member = this.household?.members.find(m => m.id === detail.model.memberId);
      if (member) void this._redeemAs(member, detail.model.reward.id, detail.model.reward.name);
    });
    this.dispatchEvent(new CustomEvent('pv-fullscreen', { detail: { element: reveal }, bubbles: true, composed: true }));
    return reveal;
  }

  private async _openReward(id: string | null): Promise<void> {
    if (id === null && !(await this.asParent("Who's adding a reward?"))) return;
    this._sheet = { kind: 'reward', id, busy: false };
  }

  private async _saveReward(id: string | null, draft: RewardDraft): Promise<void> {
    const api = this.service?.api;
    if (!api || !(await this.asParent(id ? "Who's changing this reward?" : "Who's adding a reward?"))) return;
    this._sheet = { kind: 'reward', id, busy: true };
    try {
      await api.saveReward(rewardFrom(draft), id ?? undefined);
      this._sheet = null;
      this.showToast({ id: `reward-${Date.now()}`, text: id ? `Saved ${draft.name.trim()}.` : `Added ${draft.name.trim()}.` });
    } catch (err) {
      this._sheet = { kind: 'reward', id, busy: false };
      this.showToast({ id: `reward-${Date.now()}`, text: errorMessage(err) ?? 'That didn\'t save. Try again.', tone: 'bad' });
    }
  }

  private async _setGoal(memberId: string, rewardId: string | null): Promise<void> {
    const api = this.service?.api;
    const member = this._member(memberId);
    if (!api || !member || !(await this.asMember(memberId, `Whose goal is this?`))) return;
    const reward = this.service?.board()?.rewards.find(r => r.id === rewardId);
    try {
      await api.savePrefs(memberId, { goal: rewardId });
      this.showToast({ id: `goal-${Date.now()}`, text: reward ? `${member.name} is saving up for ${reward.name}.` : `${member.name} has no goal now.` });
    } catch (err) {
      this.showToast({ id: `goal-${Date.now()}`, text: errorMessage(err) ?? 'That didn\'t save. Try again.', tone: 'bad' });
    }
  }

  /** The view the bar picked. */
  protected renderView(): unknown {
    const board = this.service?.board();
    if (!board) return nothing;
    const empty = board.chores.length === 0;
    if (empty) return this._empty();
    if (this.view === 'my_day') return this._renderMyDay(board);
    if (this.view === 'week') return this._renderWeek(board);
    if (this.view === 'rewards') return this._renderRewards(board);
    return html`
      <pv-chores-board .board=${board} .household=${this.household} .session=${this.session} .data=${this.data}
        .cardConfig=${this.cardConfig}
        .hass=${this.hass} .timeFormat=${this.display?.time_format ?? '12h'} .mode=${this.mode} layout=${this.layout}
        .minute=${this._minute}
        @pv-hold-done=${(e: CustomEvent<HoldDetail>) => this._complete(e.detail)}
        @pv-hold-undo=${(e: CustomEvent<HoldDetail>) => this._uncheck(e.detail)}
        @pv-hint=${(e: CustomEvent<{ row: RowModel }>) => this._hint(e.detail.row)}
        @pv-row-options=${(e: CustomEvent<{ row: RowModel }>) => this._openOptions(e.detail.row)}
        @pv-surprise-open=${(e: CustomEvent<SurpriseOpenDetail>) => this._openSurprise(e.detail)}
        @pv-member-open=${(e: CustomEvent<{ member: string }>) => this._openMyDay(e.detail.member)}></pv-chores-board>
    `;
  }

  private _empty() {
    const access = parentAccess(this.household, this.session);
    return html`
      <div class="state">
        <div class="art" aria-hidden="true">🧺</div>
        <h2>No chores yet</h2>
        <p>Add your family's chores, or import a plan you already agreed on.</p>
        ${access !== 'no' ? html`
          <div class="buttons">
            <button class="pv-btn pv-btn-primary" type="button" @click=${() => this.moduleAction('add')}>New chore</button>
            <button class="pv-btn pv-btn-secondary" type="button" @click=${() => this._openSettings(IMPORT_EXPORT)}>Import a plan</button>
          </div>
        ` : nothing}
      </div>
    `;
  }

  private _member(id: string): Member | undefined {
    return this.household?.members.find(m => m.id === id);
  }

  private _colorOf = (member: Member): string => memberColor(member, this.mode);

  /**
   * Whether this screen may change `memberId`'s items now: straight away, or
   * after their PIN (or a parent's) on a shared screen (spec 13.2).
   */
  protected async asMember(memberId: string, heading: string): Promise<boolean> {
    const access = memberAccess(this.household, this.session, memberId);
    if (access === 'yes') return true;
    if (access === 'no' || !this.pinGate) return false;
    return this.pinGate.ask(pinChoicesFor(this.household, memberId), heading);
  }

  /** Who this screen could credit instead of `memberId`, in the household's order. */
  private _creditable(memberId: string): Member[] {
    return creditable(this.household, this.session, inOrder(this.household?.members ?? []), memberId);
  }

  /** Whether this screen may say `doer` did it: a parent takes a parent's PIN, anyone else their own (round 1). */
  private async _asDoer(doer: Member, heading: string): Promise<boolean> {
    const access = creditAccess(this.household, this.session, doer);
    if (access === 'yes') return true;
    if (access === 'no') {
      this.showToast({ id: `credit-${Date.now()}`, text: `${doer.name} can't be given the credit from this screen.`, tone: 'bad' });
      return false;
    }
    if (!this.pinGate) return false;
    return doer.parent ? this.asParent(heading) : this.pinGate.ask(pinChoicesFor(this.household, doer.id), heading);
  }

  private async _complete(detail: HoldDetail): Promise<void> {
    const { row } = detail;
    const service = this.service;
    const board = service?.board();
    if (!service || !board) {
      detail.settle(false);
      return;
    }
    const member = row.item.member;
    if (!(await this.asMember(member, `Who's checking off ${row.name}?`))) {
      detail.settle(false);
      return;
    }
    this._checkOff(row, member, board, undefined, detail.from);
    detail.settle(true);
  }

  /** Queue the check-off, show it at once, and offer Undo (spec 13.2). */
  private _checkOff(row: RowModel, member: string, board: Board, doneBy?: string, from?: DOMRect): void {
    const service = this.service!;
    const doer = this._member(doneBy ?? member);
    const activity = board.chores.find(a => a.id === row.item.chore);
    const waits = needsOk(doer, activity);
    service.enqueue({ op: 'complete', occurrence: row.key, member, name: row.name, doneBy, shows: waits ? 'pending' : 'done' });
    haptic('tick');
    if (board.settings.sound) chime();
    const id = `done-${row.key}-${Date.now()}`;
    this._recent.remember(id, { row, member, toast: id });
    const credited = doneBy && doneBy !== member && doer ? creditedText({ name: doer.name, stars: !!doer.stars }, row.item.stars) : null;
    this.showToast({
      id,
      text: waits ? `${row.name}: waiting for approval.` : credited ?? 'Done.',
      actions: [{ id: 'undo', label: 'Undo' }, ...(doneBy || !this._creditable(member).length ? [] : [{ id: 'someone', label: 'Someone else did it?' }])],
      ms: 6000,
    });
    const owner = this._member(doneBy ?? member);
    if (from && owner?.stars && !waits) {
      void this.updateComplete.then(() => {
        this.renderRoot.querySelector<PvChoresBoard>('pv-chores-board')?.flyStars(member, from, row.item.stars);
      });
    }
  }

  private async _uncheck(detail: HoldDetail): Promise<void> {
    const { row } = detail;
    const member = row.item.member;
    if (!this.service || !(await this.asMember(member, `Who's unchecking ${row.name}?`))) {
      detail.settle(false);
      return;
    }
    this.service.enqueue({ op: 'undo', occurrence: row.key, member, name: row.name });
    detail.settle(true);
    this.showToast({ id: `undo-${row.key}-${Date.now()}`, text: `${row.name} is open again.` });
  }

  private _hint(row: RowModel): void {
    const locked = memberAccess(this.household, this.session, row.item.member) === 'no';
    const owner = this._member(row.item.member)?.name ?? 'its owner';
    const text = locked
      ? `Only ${owner} or a parent can check this off here.`
      : row.state === 'done'
        ? 'Hold the check to uncheck it.'
        : row.state === 'pending'
          ? 'This is waiting for a parent\'s approval.'
          : 'Hold the circle to finish a chore. Let go early and nothing happens.';
    this.showToast({ id: `hint-${Date.now()}`, text, ms: 3500 });
  }

  /** The board item with this key now (the feed may have changed it since a sheet opened). */
  private _itemRow(key: string): RowModel | null {
    const board = this.service?.board();
    if (!board) return null;
    for (const entry of Object.values(board.members)) {
      const item = entry.items.find(i => i.key === key);
      if (item) return { key, item, name: item.name, icon: item.icon, label: null, badge: null, meta: '', state: item.status };
    }
    return null;
  }

  private _openOptions(row: RowModel): void {
    this._sheet = { kind: 'options', key: row.key, history: null, busy: false };
  }

  private _optionsModel(key: string) {
    const board = this.service?.board();
    const row = this._itemRow(key);
    const owner = row ? this._member(row.item.member) : undefined;
    if (!board || !row || !owner) return null;
    return {
      row,
      owner,
      model: itemOptions({
        item: row.item,
        activity: board.chores.find(a => a.id === row.item.chore),
        owner,
        members: inOrder(this.household?.members ?? []),
        today: board.today,
        member: memberAccess(this.household, this.session, owner.id),
        parent: parentAccess(this.household, this.session),
        credit: this._creditable(owner.id).length > 0,
        late: lateRequest(board, row.item.completion?.id),
        excused: excusedRequest(board, row.item.completion?.id),
      }),
    };
  }

  /** Run one change from a sheet: close it and say what happened, or say what went wrong (spec 11.7). */
  /** An option this screen chose is running: its own toast says what happened. */
  private _acting = false;

  /** Each options sheet's title as last shown, so a chore deleted on another screen is still named (round 2). */
  private readonly _optionNames = new WeakMap<object, string>();

  private _choreName(key: string): string {
    const id = key.split('|')[0];
    return this.service?.board()?.chores.find(chore => chore.id === id)?.name ?? 'That chore';
  }

  private async _run(action: () => Promise<unknown>, done: string): Promise<boolean> {
    this._acting = true;
    try {
      await action();
      this._sheet = null;
      this.showToast({ id: `ok-${Date.now()}`, text: done });
      return true;
    } catch (err) {
      this.showToast({ id: `err-${Date.now()}`, text: errorMessage(err) ?? 'That didn\'t save. Try again.', tone: 'bad', ms: 6000 });
      if (this._sheet?.kind === 'options') this._sheet = { ...this._sheet, busy: false };
      return false;
    } finally {
      this._acting = false;
    }
  }

  private async _option(key: string, choice: OptionChoice): Promise<void> {
    const service = this.service;
    const found = this._optionsModel(key);
    const board = service?.board();
    if (!service || !found || !board) return;
    const { row, owner } = found;
    const item = row.item;
    const api = service.api;
    const today = board.today;
    const name = row.name;
    switch (choice.id) {
      case 'history': {
        try {
          const history = await api.history(item.chore, item.member);
          if (this._sheet?.kind === 'options' && this._sheet.key === key) {
            this._sheet = { ...this._sheet, history: historyLines(history, today, this.household?.members ?? [], this.display?.time_format ?? '12h') };
          }
        } catch {
          if (this._sheet?.kind === 'options') this._sheet = { ...this._sheet, history: ['History isn\'t available right now.'] };
        }
        return;
      }
      case 'plan_day': {
        if (!choice.value || !(await this.asMember(owner.id, `Who's planning ${name}?`))) return;
        const due = item.due_day ? ` It's still due ${dayWords(item.due_day, today)}.` : '';
        await this._run(() => api.override(key, { planned_day: choice.value }), `${name} shows on ${dayWords(choice.value, today)}.${due}`);
        return;
      }
      case 'more_time': {
        if (!choice.value || !(await this.asMember(owner.id, `Who's asking for more time?`))) return;
        await this._run(() => api.request('more_time', key, choice.value), 'Asked for more time. A parent will answer.');
        return;
      }
      case 'skip': {
        if (!(await this.asMember(owner.id, `Who's asking to skip ${name}?`))) return;
        await this._run(() => api.request('skip', key), `Asked to skip ${skipWords(row.item.period, board.today)}. A parent will answer.`);
        return;
      }
      case 'undo': {
        if (!(await this.asMember(owner.id, `Who's unchecking ${name}?`))) return;
        service.enqueue({ op: 'undo', occurrence: key, member: owner.id, name });
        this._sheet = null;
        this.showToast({ id: `undo-${key}-${Date.now()}`, text: `${name} is open again.` });
        return;
      }
      case 'done_by': {
        const people = this._creditable(owner.id);
        this._sheet = {
          kind: 'people', heading: 'Who did it?', people,
          body: whoDidItBody(name),
          pick: async member => {
            if (!member || !(await this.asMember(owner.id, `Who's checking off ${name}?`))) return;
            if (!(await this._asDoer(member, `Who's giving ${member.name} the credit?`))) return;
            const fresh = this.service?.board();
            if (!fresh) return;
            if (item.status === 'done' || item.status === 'pending') {
              service.enqueue({ op: 'undo', occurrence: key, member: owner.id, name });
            }
            this._checkOff(row, owner.id, fresh, member.id);
          },
        };
        return;
      }
      case 'change_due': {
        if (!choice.value || !(await this.asParent(`Who's changing ${name}?`))) return;
        await this._run(() => api.override(key, { due: choice.value }), `${name} is due ${dayWords(choice.value!, today)} now.`);
        return;
      }
      case 'hand_off': {
        const people = inOrder(this.household?.members ?? []).filter(m => m.id !== owner.id);
        this._sheet = {
          kind: 'people', heading: `Who's doing ${name}?`, people, body: 'Just this time. It comes back next time.',
          pick: async member => {
            if (!member || !(await this.asParent(`Who's handing ${name} over?`))) return;
            await this._run(() => api.override(key, { assignee: member.id }), `${name} is ${member.name}'s this time.`);
          },
        };
        return;
      }
      case 'excuse': {
        if (!(await this.asParent(`Who's excusing ${name}?`))) return;
        await this._run(() => api.override(key, { excused: true }), `${name} is excused. Nothing is missed.`);
        return;
      }
      case 'approve':
      case 'send_back': {
        const request = item.completion?.id;
        const late = lateRequest(board, request);
        const excused = excusedRequest(board, request);
        if (!request || !(await this.asParent(reviewQuestion({ kind: 'completion', late, excused }, choice.id === 'approve')))) return;
        const allow = choice.id === 'approve';
        const note = choice.value ? `: ${choice.value}` : '';
        await this._run(
          () => api.review(request, allow ? 'allow' : 'decline', allow ? null : choice.value ?? null),
          allow ? `${name}: looks good.` : excused ? `${name} stays excused${note}.` : late ? `${name} counts as missed that day${note}.` : `${name} went back${note}.`,
        );
        return;
      }
      case 'edit': {
        if (!(await this.asParent(`Who's changing ${name}?`))) return;
        this._sheet = null;
        this._openSettings(editChore({ id: item.chore, name: board.chores.find(a => a.id === item.chore)?.name ?? name }));
        return;
      }
      case 'delete': {
        if (!(await this.asParent(`Who's deleting ${name}?`))) return;
        this._sheet = { kind: 'delete', row };
        return;
      }
    }
  }

  /** Settings at a page (Edit, Import a plan); the card asks for a parent's PIN when it must. */
  private _openSettings(target: SettingsTarget): void {
    this.dispatchEvent(new CustomEvent(OPEN_SETTINGS, { detail: target, bubbles: true, composed: true }));
  }

  /** "Someone else did it?": pick who, then credit them instead (spec 13.2). */
  private _someoneElse(last: LastCheckoff): void {
    const people = this._creditable(last.member);
    this._sheet = {
      kind: 'people',
      heading: 'Who did it?',
      body: whoDidItBody(last.row.name),
      people,
      pick: async member => {
        if (!member || !(await this._asDoer(member, `Who's giving ${member.name} the credit?`))) return;
        const board = this.service?.board();
        if (!board || !this.service) return;
        this.service.enqueue({ op: 'undo', occurrence: last.row.key, member: last.member, name: last.row.name });
        this._checkOff(last.row, last.member, board, member.id);
      },
    };
  }

  private _skeleton() {
    const columns = Math.max(1, Math.min(4, this.household?.members.length ?? 3));
    return html`
      <div class="skeleton" aria-busy="true" aria-label="Loading chores">
        ${Array.from({ length: columns }, () => html`
          <div class="col">
            <div class="who"><div class="bone round" style="width:58px;height:58px"></div>
              <div style="flex:1;display:flex;flex-direction:column;gap:8px">
                <div class="bone" style="width:60%;height:16px"></div><div class="bone" style="width:80%;height:12px"></div>
              </div>
            </div>
            <div class="bone" style="height:44px"></div>
            <div class="bone" style="height:44px"></div>
            <div class="bone" style="height:44px;width:85%"></div>
          </div>
        `)}
      </div>
    `;
  }

  private _unreachable(service: ChoresService) {
    return html`
      <div class="state" role="alert">
        <div class="art" aria-hidden="true">📡</div>
        <h2>Can't reach Home Assistant</h2>
        <p>Your check-offs aren't lost. We'll keep trying.</p>
        <div class="buttons">
          <button class="pv-btn pv-btn-secondary" type="button" @click=${() => service.retry()}>Try again</button>
        </div>
      </div>
    `;
  }

  private _needsALook() {
    const access = parentAccess(this.household, this.session);
    return html`
      <div class="state" role="alert">
        <div class="art" aria-hidden="true">🧰</div>
        <h2>Chores need a look</h2>
        <p>Some chores data couldn't be read, so nothing is shown or saved until a parent decides. To get it back,
          restore a Home Assistant backup from before it went missing (Settings, System, Backups), or a PlanaVista
          file you exported. Or start over with no chores.</p>
        ${access !== 'no' ? html`
          <div class="buttons">
            <button class="pv-btn pv-btn-primary" type="button" @click=${() => this._openSettings(IMPORT_EXPORT)}>Restore from a file</button>
            <button class="pv-btn pv-btn-secondary" type="button" @click=${this._askStartOver}>Start over</button>
          </div>
        ` : nothing}
      </div>
    `;
  }

  private _askStartOver = async (): Promise<void> => {
    if (await this.asParent("Who's starting over?")) this._sheet = { kind: 'start_over' };
  };

  /**
   * Make sure a parent-level change may go ahead on this screen: straight
   * away for a parent's own login, after a parent's PIN on a shared screen.
   */
  protected async asParent(heading: string): Promise<boolean> {
    const access = parentAccess(this.household, this.session);
    if (access === 'yes') return true;
    if (access === 'no_pin') {
      this._sheet = { kind: 'no_pin', heading: 'This needs a parent\'s PIN' };
      return false;
    }
    if (access === 'no' || !this.pinGate || !this.household) return false;
    const parents = this.household.members.filter(m => m.parent && m.has_pin);
    return this.pinGate.ask(parents, heading);
  }

  protected showToast(toast: Toast): void {
    this._toast = toast;
  }

  protected onToastAction(toast: Toast, action: string): void {
    if (!this.service) return;
    if (action === 'undo') {
      // Undo always answers in words; a refusal comes back as its own toast, on this card (milestone 8).
      const last = this._recent.take(toast.id);
      if (!last) {
        this.showToast({ id: `undo-${Date.now()}`, text: 'Hold the check to uncheck it.' });
        return;
      }
      this.service.enqueue({ op: 'undo', occurrence: last.row.key, member: last.member, name: last.row.name });
      this.showToast({ id: `undo-${last.row.key}-${Date.now()}`, text: `${last.row.name} is open again.` });
    } else if (action === 'someone') {
      const last = this._recent.peek(toast.id);
      if (last) this._someoneElse(last);
    }
  }

  private _onToastAction = (event: CustomEvent<{ toast: Toast; action: string }>): void => {
    this._toast = null;
    this.onToastAction(event.detail.toast, event.detail.action);
  };

  protected renderSheet(): unknown {
    return nothing;
  }

  private _renderSheet() {
    const sheet = this._sheet;
    if (!sheet) return this.renderSheet();
    if (sheet.kind === 'day') {
      const member = this._member(sheet.member);
      const board = this.service?.board();
      if (!member || !board) return nothing;
      return html`
        <pv-chores-day-sheet .layout=${this.layout} .member=${member} date=${sheet.date} today=${board.today} .excusing=${this._excusing}
          .day=${sheet.day} ?failed=${sheet.failed} ?canExcuse=${parentAccess(this.household, this.session) !== 'no'}
          .names=${(id: string) => this._member(id)?.name ?? id}
          @pv-day-excuse=${(e: CustomEvent<{ occurrence: string; name: string }>) => void this._excuseMissed(e.detail.occurrence, e.detail.name, sheet.member)}
          @pv-sheet-close=${() => { if (this._sheet?.kind === 'day') this._sheet = null; }}></pv-chores-day-sheet>
      `;
    }
    if (sheet.kind === 'reward') {
      const board = this.service?.board();
      if (!board) return nothing;
      const members = inOrder(this.household?.members ?? []);
      const card = sheet.id ? rewardCards(board, members).find(c => c.reward.id === sheet.id) ?? null : null;
      if (sheet.id && !card) {
        queueMicrotask(() => { if (this._sheet === sheet) this._sheet = null; });
        return nothing;
      }
      return html`
        <pv-chores-reward-sheet .layout=${this.layout} .card=${card} .people=${members} .hass=${this.hass} .colorOf=${this._colorOf}
          ?canEdit=${parentAccess(this.household, this.session) !== 'no'} ?busy=${sheet.busy}
          @pv-reward-goal=${(e: CustomEvent<{ member: string; reward: string | null }>) => void this._setGoal(e.detail.member, e.detail.reward)}
          @pv-reward-save=${(e: CustomEvent<{ draft: RewardDraft }>) => void this._saveReward(sheet.id, e.detail.draft)}
          @pv-reward-delete=${() => { if (card) this._sheet = { kind: 'delete_reward', id: card.reward.id, name: card.reward.name }; }}
          @pv-sheet-close=${() => { if (this._sheet?.kind === 'reward') this._sheet = null; }}></pv-chores-reward-sheet>
      `;
    }
    if (sheet.kind === 'delete_reward') {
      return html`
        <pv-notice-sheet .layout=${this.layout} heading=${`Delete ${sheet.name}?`}
          body="It leaves the catalog. Rewards already given stay in history, and nobody loses stars."
          .actions=${[{ id: 'delete', label: `Delete ${sheet.name}`, kind: 'destructive' }, { id: 'cancel', label: 'Cancel', kind: 'secondary' }]}
          @pv-sheet-action=${(e: CustomEvent<{ id: string }>) => void this._confirmDeleteReward(sheet.id, sheet.name, e.detail.id)}></pv-notice-sheet>
      `;
    }
    if (sheet.kind === 'inbox') {
      const board = this.service?.board();
      if (!board) return nothing;
      const groups = inboxGroups(board.requests, inOrder(this.household?.members ?? []), board.today, this.display?.time_format ?? '12h', board.settings?.day_starts);
      return html`
        <pv-chores-inbox .layout=${this.layout} .groups=${groups} .hass=${this.hass} .colorOf=${this._colorOf} .busy=${this._reviewing}
          @pv-review=${(e: CustomEvent<ReviewDetail>) => void this._review(e.detail)}
          @pv-approve-all-ask=${(e: CustomEvent<ApproveAllAsk>) => { this._approveAsk = e.detail; }}
          @pv-sheet-close=${() => { if (this._sheet === sheet) this._sheet = null; }}></pv-chores-inbox>
      `;
    }
    if (sheet.kind === 'quick_add') {
      const board = this.service?.board();
      if (!board) return nothing;
      return html`
        <pv-chores-quick-add .layout=${this.layout} .people=${inOrder(this.household?.members ?? [])} .hass=${this.hass}
          .colorOf=${this._colorOf} today=${board.today} .minutesPerStar=${board.settings.minutes_per_star} ?busy=${sheet.busy}
          @pv-quick-add=${(e: CustomEvent<{ draft: QuickAddDraft }>) => void this._quickAdd(e.detail.draft)}
          @pv-sheet-close=${() => { if (this._sheet?.kind === 'quick_add') this._sheet = null; }}></pv-chores-quick-add>
      `;
    }
    if (sheet.kind === 'options') {
      const found = this._optionsModel(sheet.key);
      if (!found) {
        // Its chore left the board: say so when another screen did it (round 1), not after this screen's own change.
        queueMicrotask(() => {
          if (this._sheet !== sheet) return;
          this._sheet = null;
          if (!this._acting) this.showToast({ id: `moved-${sheet.key}`, text: `${this._optionNames.get(sheet) ?? this._choreName(sheet.key)} changed on another screen.` });
        });
        return nothing;
      }
      this._optionNames.set(sheet, found.model.title);
      return html`
        <pv-chore-options .layout=${this.layout} .model=${found.model} color=${memberColor(found.owner, this.mode)}
          .history=${sheet.history} ?busy=${sheet.busy}
          @pv-option=${(e: CustomEvent<OptionChoice>) => void this._option(sheet.key, e.detail)}
          @pv-sheet-close=${() => { if (this._sheet === sheet) this._sheet = null; }}></pv-chore-options>
      `;
    }
    if (sheet.kind === 'delete') {
      const name = sheet.row.name;
      return html`
        <pv-notice-sheet .layout=${this.layout} heading=${`Delete ${name}?`}
          body="It leaves the board for everyone now. Past weeks still show what was done, and stars stay earned."
          .actions=${[{ id: 'delete', label: `Delete ${name}`, kind: 'destructive' }, { id: 'cancel', label: 'Cancel', kind: 'secondary' }]}
          @pv-sheet-action=${(e: CustomEvent<{ id: string }>) => void this._confirmDelete(sheet.row, e.detail.id)}></pv-notice-sheet>
      `;
    }
    if (sheet.kind === 'people') {
      return html`
        <pv-chores-people-sheet .layout=${this.layout} heading=${sheet.heading} body=${sheet.body ?? ''}
          .people=${sheet.people} .hass=${this.hass} .colorOf=${this._colorOf}
          @pv-person-pick=${(e: CustomEvent<{ member: Member | null }>) => { this._sheet = null; sheet.pick(e.detail.member); }}>
        </pv-chores-people-sheet>
      `;
    }
    if (sheet.kind === 'no_pin') {
      return html`
        <pv-notice-sheet .layout=${this.layout} heading=${sheet.heading}
          body="On a shared screen, a parent's PIN allows this, and no parent has one yet. A parent can set one in Settings, PINs and parent mode, from their own Home Assistant login."
          .actions=${[{ id: 'ok', label: 'OK', kind: 'primary' }]}
          @pv-sheet-action=${() => { this._sheet = null; }}></pv-notice-sheet>
      `;
    }
    return html`
      <pv-notice-sheet .layout=${this.layout} heading="Start over with no chores?"
        body="Chores, rewards, stars, and their history are emptied. People, PINs, and calendars stay as they are."
        .actions=${[{ id: 'start_over', label: 'Start over', kind: 'destructive' }, { id: 'cancel', label: 'Cancel', kind: 'secondary' }]}
        @pv-sheet-action=${(e: CustomEvent<{ id: string }>) => this._onStartOver(e.detail.id)}></pv-notice-sheet>
    `;
  }

  private async _confirmDelete(row: RowModel, id: string): Promise<void> {
    this._sheet = null;
    if (id !== 'delete' || !this.service) return;
    await this._run(() => this.service!.api.deleteActivity(row.item.chore), `Deleted ${row.name}.`);
  }

  private async _confirmDeleteReward(rewardId: string, name: string, id: string): Promise<void> {
    this._sheet = null;
    if (id !== 'delete' || !this.service || !(await this.asParent(`Who's deleting ${name}?`))) return;
    await this._run(() => this.service!.api.deleteReward(rewardId), `Deleted ${name}.`);
  }

  private async _onStartOver(id: string): Promise<void> {
    this._sheet = null;
    if (id !== 'start_over') return;
    try {
      await this.service?.api.startOver();
      this.showToast({ id: `start-over-${Date.now()}`, text: 'Chores started over.' });
    } catch {
      this.showToast({ id: `start-over-${Date.now()}`, text: 'Couldn\'t start over. Try again.', tone: 'bad' });
    }
  }
}

defineElement('pv-chores-module', PvChoresModule);
