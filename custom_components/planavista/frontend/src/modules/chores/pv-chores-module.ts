import { LitElement, html, css, nothing, PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../utils/define';
import { buttonStyles } from '../../styles/shared';
import type { Layout } from '../../core/layout';
import type { HouseholdView } from '../../core/household';
import type { ModuleElement, ModuleService, OpenTarget } from '../../core/module-registry';
import type { PinGate } from '../../core/pin-gate';
import type { Session } from '../../core/session';
import type { Toast } from '../../core/pv-toast';
import { parentAccess } from '../../core/access';
import type { Mode } from '../../styles/theme-pairs';
import type { DisplayConfig, PlanaVistaData } from '../../types';
import { choresStyles } from './chores-styles';
import type { ChoresService } from './chores-service';
import '../../core/pv-toast';
import '../../shell/pv-notice-sheet';

/** A sheet the chores screens show over themselves. */
type ChoresSheet = { kind: 'start_over' } | { kind: 'no_pin'; heading: string };

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
  private _overlayOpen = false;

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

  disconnectedCallback(): void {
    super.disconnectedCallback();
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
    return nothing;
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

  protected onToastAction(_toast: Toast, _action: string): void {
    // Undo and Someone else did it? arrive with the board.
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
