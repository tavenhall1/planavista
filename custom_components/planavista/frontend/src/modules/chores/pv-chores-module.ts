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
import type { RowModel } from './board-derive';
import type { HoldDetail } from './pv-chore-item';
import { needsOk } from './overlay';
import { chime, haptic } from './effects';
import type { PvChoresBoard } from './pv-chores-board';
import '../../core/pv-toast';
import '../../shell/pv-notice-sheet';
import './pv-chores-board';
import './pv-chores-people-sheet';

/** A sheet the chores screens show over themselves. */
type ChoresSheet =
  | { kind: 'start_over' }
  | { kind: 'no_pin'; heading: string }
  | { kind: 'people'; heading: string; body?: string; people: Member[]; pick: (member: Member | null) => void };

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

  /** The bar's and the parent-mode strip's buttons. */
  moduleAction(_id: string): void {
    // Waiting for OK and Add chore arrive with their sheets.
  }

  protected willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
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

  /** The view the bar picked. */
  protected renderView(): unknown {
    const board = this.service?.board();
    if (!board) return nothing;
    const empty = board.chores.length === 0;
    if (empty) return this._empty();
    return html`
      <pv-chores-board .board=${board} .household=${this.household} .session=${this.session} .data=${this.data}
        .hass=${this.hass} .timeFormat=${this.display?.time_format ?? '12h'} .mode=${this.mode} layout=${this.layout}
        .minute=${this._minute}
        @pv-hold-done=${(e: CustomEvent<HoldDetail>) => this._complete(e.detail)}
        @pv-hold-undo=${(e: CustomEvent<HoldDetail>) => this._uncheck(e.detail)}
        @pv-hint=${(e: CustomEvent<{ row: RowModel }>) => this._hint(e.detail.row)}></pv-chores-board>
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
