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
import { memberAccess, parentAccess, pinChoicesFor } from '../../core/access';
import type { Mode } from '../../styles/theme-pairs';
import type { DisplayConfig, PlanaVistaData } from '../../types';
import { choresStyles } from './chores-styles';
import type { ChoresService } from './chores-service';
import type { Board } from './chores-types';
import { ColumnModel, RowModel, boardColumns } from './board-derive';
import { eventsOn } from './calendar-ties';
import { bedtimeOn, fairShares, goalFor } from './my-day-derive';
import type { MyDayStyle } from './pv-chores-my-day';
import { memoizeOne } from '../../utils/render-cache';
import type { HoldDetail } from './pv-chore-item';
import { needsOk } from './overlay';
import { dayWords, historyLines, itemOptions } from './options-derive';
import type { OptionChoice } from './pv-chore-options';
import { InboxRow, answeredText, inboxGroups } from './inbox-derive';
import type { ReviewDetail } from './pv-chores-inbox';
import { QuickAddDraft, activityFrom } from './quick-add';
import { errorMessage } from '../../core/ws-api';
import { chime, haptic } from './effects';
import type { PvChoresBoard } from './pv-chores-board';
import '../../core/pv-toast';
import '../../shell/pv-notice-sheet';
import './pv-chores-board';
import './pv-chores-people-sheet';
import './pv-chore-options';
import './pv-chores-inbox';
import './pv-chores-quick-add';
import './pv-chores-my-day';

/** A sheet the chores screens show over themselves. */
type ChoresSheet =
  | { kind: 'start_over' }
  | { kind: 'no_pin'; heading: string }
  | { kind: 'people'; heading: string; body?: string; people: Member[]; pick: (member: Member | null) => void }
  | { kind: 'options'; key: string; history: string[] | null; busy: boolean }
  | { kind: 'delete'; row: RowModel }
  | { kind: 'inbox' }
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
  /** Whose My day is showing. */
  @state() private _myDayMember: string | null = null;
  /** Requests being answered in the inbox. */
  @state() private _reviewing: ReadonlySet<string> = new Set();
  private _overlayOpen = false;
  private _last: LastCheckoff | null = null;
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

  /** The bar's and the parent-mode strip's buttons: Waiting for OK and Add chore. */
  moduleAction(id: string): void {
    if (id === 'inbox') void this._openInbox();
    if (id === 'add') void this._openQuickAdd();
  }

  private async _openInbox(): Promise<void> {
    if (await this.asParent("Who's approving?")) this._sheet = { kind: 'inbox' };
  }

  private async _openQuickAdd(): Promise<void> {
    if (await this.asParent("Who's adding a chore?")) this._sheet = { kind: 'quick_add', busy: false };
  }

  /** One answer from the inbox: its own review, attributed to the parent (spec 13.7). */
  private async _review(detail: ReviewDetail): Promise<boolean> {
    const { row, allow, note } = detail;
    const api = this.service?.api;
    if (!api || !(await this.asParent("Who's approving?"))) return false;
    this._reviewing = new Set([...this._reviewing, row.id]);
    try {
      await api.review(row.id, allow ? 'allow' : 'decline', note ?? null);
      this.showToast({ id: `review-${row.id}`, text: answeredText(row, allow, note) });
      return true;
    } catch (err) {
      this.showToast({ id: `review-${row.id}-${Date.now()}`, text: errorMessage(err) ?? 'That didn\'t save. Try again.', tone: 'bad' });
      return false;
    } finally {
      const next = new Set(this._reviewing);
      next.delete(row.id);
      this._reviewing = next;
    }
  }

  /** Approve all: each chore to check approved on its own, so each is attributed and stands alone. */
  private async _approveAll(rows: InboxRow[]): Promise<void> {
    let approved = 0;
    for (const row of rows) {
      if (await this._review({ row, allow: true })) approved += 1;
      else break;
    }
    if (approved > 1) this.showToast({ id: `approved-${Date.now()}`, text: `Approved ${approved} chores.` });
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
    // A ring in the calendar, or a column header, opened someone's day.
    if (changed.has('openTarget') && this.openTarget?.member) this._myDayMember = this.openTarget.member;
    const notices = this.service?.takeNotices() ?? [];
    const last = notices[notices.length - 1];
    if (last) this._toast = { id: last.id, text: last.text, tone: 'bad', ms: 7000 };
  }

  protected updated(changed: PropertyValues): void {
    super.updated(changed);
    const open = this._sheet !== null;
    if (open !== this._overlayOpen) {
      this._overlayOpen = open;
      this.dispatchEvent(new CustomEvent('pv-overlay-change', { detail: { open }, bubbles: true, composed: true }));
    }
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
      ${this._renderSheet()}
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

  private _columnsFor = memoizeOne((board: Board, household: HouseholdView | null, data: PlanaVistaData | null, timeFormat: '12h' | '24h', _minute: number) =>
    boardColumns(board, {
      today: board.today,
      now: new Date(),
      events: eventsOn(data, new Date(board.day.start), new Date(board.day.end)),
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
    const columns = this._columnsFor(board, this.household, this.data, timeFormat, this._minute);
    const column = this._myDayColumn(columns);
    if (!column) return nothing;
    const member = column.member;
    return html`
      <pv-chores-my-day .column=${column} .columns=${columns} .board=${board} .hass=${this.hass} layout=${this.layout}
        .events=${eventsOn(this.data, new Date(board.day.start), new Date(board.day.end))}
        .colorOf=${this._colorOf} .timeFormat=${timeFormat} .minute=${this._minute}
        .goal=${goalFor(member, column.entry, board.rewards)} .shares=${fairShares(board, inOrder(this.household?.members ?? []))}
        .bedtime=${bedtimeOn(member, new Date())}
        ?locked=${memberAccess(this.household, this.session, member.id) === 'no'}
        @pv-my-day-member=${(e: CustomEvent<{ member: string }>) => { this._myDayMember = e.detail.member; }}
        @pv-my-day-style=${(e: CustomEvent<{ member: string; style: MyDayStyle }>) => void this._setStyle(e.detail.member, e.detail.style)}
        @pv-hold-done=${(e: CustomEvent<HoldDetail>) => this._complete(e.detail)}
        @pv-hold-undo=${(e: CustomEvent<HoldDetail>) => this._uncheck(e.detail)}
        @pv-hint=${(e: CustomEvent<{ row: RowModel }>) => this._hint(e.detail.row)}
        @pv-row-options=${(e: CustomEvent<{ row: RowModel }>) => this._openOptions(e.detail.row)}></pv-chores-my-day>
    `;
  }

  /** The view the bar picked. */
  protected renderView(): unknown {
    const board = this.service?.board();
    if (!board) return nothing;
    const empty = board.chores.length === 0;
    if (empty) return this._empty();
    if (this.view === 'my_day') return this._renderMyDay(board);
    return html`
      <pv-chores-board .board=${board} .household=${this.household} .session=${this.session} .data=${this.data}
        .hass=${this.hass} .timeFormat=${this.display?.time_format ?? '12h'} .mode=${this.mode} layout=${this.layout}
        .minute=${this._minute}
        @pv-hold-done=${(e: CustomEvent<HoldDetail>) => this._complete(e.detail)}
        @pv-hold-undo=${(e: CustomEvent<HoldDetail>) => this._uncheck(e.detail)}
        @pv-hint=${(e: CustomEvent<{ row: RowModel }>) => this._hint(e.detail.row)}
        @pv-row-options=${(e: CustomEvent<{ row: RowModel }>) => this._openOptions(e.detail.row)}
        @pv-member-open=${(e: CustomEvent<{ member: string }>) => this._openMyDay(e.detail.member)}></pv-chores-board>
    `;
  }

  private _empty() {
    const access = parentAccess(this.household, this.session);
    return html`
      <div class="state">
        <div class="art" aria-hidden="true">🧺</div>
        <h2>No chores yet</h2>
        <p>Add your family's chores, and they'll show up here for everyone.</p>
        ${access !== 'no' ? html`
          <div class="buttons">
            <button class="pv-btn pv-btn-primary" type="button" @click=${() => this.moduleAction('add')}>Add chores</button>
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
    this._last = { row, member, toast: id };
    const name = doneBy && doneBy !== member ? this._member(doneBy)?.name : null;
    this.showToast({
      id,
      text: waits ? `${row.name}: waiting for OK` : name ? `Done by ${name}` : 'Done',
      actions: [{ id: 'undo', label: 'Undo' }, ...(doneBy ? [] : [{ id: 'someone', label: 'Someone else did it?' }])],
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
          ? 'This is waiting for a parent\'s OK.'
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
      }),
    };
  }

  /** Run one change from a sheet: close it and say what happened, or say what went wrong (spec 11.7). */
  private async _run(action: () => Promise<unknown>, done: string): Promise<boolean> {
    try {
      await action();
      this._sheet = null;
      this.showToast({ id: `ok-${Date.now()}`, text: done });
      return true;
    } catch (err) {
      this.showToast({ id: `err-${Date.now()}`, text: errorMessage(err) ?? 'That didn\'t save. Try again.', tone: 'bad', ms: 6000 });
      if (this._sheet?.kind === 'options') this._sheet = { ...this._sheet, busy: false };
      return false;
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
        await this._run(() => api.request('skip', key), 'Asked to skip this week. A parent will answer.');
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
        const people = inOrder(this.household?.members ?? []).filter(m => m.id !== owner.id);
        this._sheet = {
          kind: 'people', heading: 'Who did it?', people,
          body: `They get the credit for ${name}.`,
          pick: async member => {
            if (!member || !(await this.asMember(owner.id, `Who's checking off ${name}?`))) return;
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
        if (!request || !(await this.asParent(choice.id === 'approve' ? "Who's approving?" : "Who's sending it back?"))) return;
        const allow = choice.id === 'approve';
        await this._run(
          () => api.review(request, allow ? 'allow' : 'decline', allow ? null : choice.value ?? null),
          allow ? `${name}: looks good.` : `${name} went back${choice.value ? `: ${choice.value}` : ''}.`,
        );
        return;
      }
      case 'delete': {
        if (!(await this.asParent(`Who's deleting ${name}?`))) return;
        this._sheet = { kind: 'delete', row };
        return;
      }
    }
  }

  /** "Someone else did it?": pick who, then credit them instead (spec 13.2). */
  private _someoneElse(last: LastCheckoff): void {
    const people = inOrder(this.household?.members ?? []).filter(m => m.id !== last.member);
    this._sheet = {
      kind: 'people',
      heading: 'Who did it?',
      body: `They get the credit${people.some(p => p.stars) ? ' and the stars' : ''} for ${last.row.name}.`,
      people,
      pick: member => {
        const board = this.service?.board();
        if (!member || !board || !this.service) return;
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
          restore a Home Assistant backup from before it went missing (Settings, System, Backups). Or start over
          with no chores.</p>
        ${access !== 'no' ? html`
          <div class="buttons">
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
    const last = this._last;
    if (!last || last.toast !== toast.id || !this.service) return;
    if (action === 'undo') {
      this.service.enqueue({ op: 'undo', occurrence: last.row.key, member: last.member, name: last.row.name });
      this._last = null;
    } else if (action === 'someone') {
      this._someoneElse(last);
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
    if (sheet.kind === 'inbox') {
      const board = this.service?.board();
      if (!board) return nothing;
      const groups = inboxGroups(board.requests, inOrder(this.household?.members ?? []), board.today, this.display?.time_format ?? '12h');
      return html`
        <pv-chores-inbox .layout=${this.layout} .groups=${groups} .hass=${this.hass} .colorOf=${this._colorOf} .busy=${this._reviewing}
          @pv-review=${(e: CustomEvent<ReviewDetail>) => void this._review(e.detail)}
          @pv-approve-all=${() => void this._approveAll(groups.chores)}
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
        queueMicrotask(() => { if (this._sheet === sheet) this._sheet = null; });
        return nothing;
      }
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
