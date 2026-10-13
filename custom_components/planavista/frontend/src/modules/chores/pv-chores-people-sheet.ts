import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../utils/define';
import { buttonStyles } from '../../styles/shared';
import { sheetStyles } from '../../styles/sheet';
import { trapTab } from '../../core/focus';
import type { Layout } from '../../core/layout';
import type { Member } from '../../core/household';
import { SheetMotion } from '../../shell/sheet-motion';
import '../../core/pv-member-avatar';
import { backdropTap } from '../../core/backdrop';
import { SheetLayer } from '../../core/sheet-layer';

/**
 * pv-chores-people-sheet: pick a person ("Who did it?", "Who's getting it?").
 * Faces, not a list, so a child can answer too.
 *
 * @fires pv-person-pick - { member } of the person tapped, or null for Cancel; it fires once the sheet has left
 */
export class PvChoresPeopleSheet extends LitElement {
  /** Closes the sheet only after a press that began on the backdrop (core/backdrop). */
  private readonly _backdrop = backdropTap(() => this._pick(null));
  private readonly _layer = new SheetLayer(this);
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
  @property({ type: String }) heading = '';
  @property({ type: String }) body = '';
  @property({ attribute: false }) people: Member[] = [];
  @property({ attribute: false }) hass?: HomeAssistant;
  /** Each person's color for the mode. */
  @property({ attribute: false }) colorOf: (member: Member) => string = m => m.color;

  private _motion = new SheetMotion(this);
  private _detach: (() => void) | null = null;
  private _closing = false;

  static styles = [
    buttonStyles,
    sheetStyles,
    css`
      .faces {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 14px;
        margin: 14px 0 6px;
      }

      .face {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        min-width: 72px;
        min-height: 48px;
        padding: 6px;
        border: none;
        border-radius: 14px;
        background: transparent;
        color: inherit;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
      }

      .face:hover,
      .face:focus-visible {
        background: var(--pv-chip, #F1F1EE);
        outline: none;
      }
    `,
  ];

  firstUpdated(): void {
    const panel = this.renderRoot.querySelector<HTMLElement>('.panel')!;
    const backdrop = this.renderRoot.querySelector<HTMLElement>('.backdrop')!;
    this._motion.open(panel, backdrop);
    this._detach = this._motion.attachDrag(this.renderRoot.querySelector<HTMLElement>('.grab-zone')!, panel, () => this._pick(null));
    this.renderRoot.querySelector<HTMLElement>('#people-heading')?.focus();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._detach?.();
  }

  render() {
    return html`
      <div class="backdrop" @pointerdown=${this._backdrop.down} @click=${this._backdrop.click}></div>
      <div class="panel" role="dialog" aria-modal="true" aria-labelledby="people-heading" @keydown=${this._key}>
        <div class="grab-zone" aria-hidden="true"><div class="grab"></div></div>
        <h2 class="heading" id="people-heading" tabindex="-1">${this.heading}</h2>
        ${this.body ? html`<p class="body">${this.body}</p>` : nothing}
        <div class="faces">
          ${this.people.map(person => html`
            <button class="face" type="button" @click=${() => this._pick(person)}>
              <pv-member-avatar .member=${{ ...person, color: this.colorOf(person) }} .hass=${this.hass} size="56"></pv-member-avatar>
              ${person.name}
            </button>
          `)}
        </div>
        <div class="actions">
          <button class="pv-btn pv-btn-secondary" type="button" @click=${() => this._pick(null)}>Cancel</button>
        </div>
      </div>
    `;
  }

  private _key = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      event.preventDefault();
      this._pick(null);
      return;
    }
    trapTab(this.shadowRoot!, event);
  };

  private async _pick(member: Member | null): Promise<void> {
    if (this._closing) return;
    this._closing = true;
    const panel = this.renderRoot.querySelector<HTMLElement>('.panel')!;
    const backdrop = this.renderRoot.querySelector<HTMLElement>('.backdrop')!;
    await this._motion.close(panel, backdrop);
    this.dispatchEvent(new CustomEvent('pv-person-pick', { detail: { member }, bubbles: true, composed: true }));
  }
}

defineElement('pv-chores-people-sheet', PvChoresPeopleSheet);
