import { LitElement, html, css, nothing } from 'lit';
import { tagStyles } from '../../styles/controls';
import { property, state } from 'lit/decorators.js';
import '../../core/pv-date-field';
import { defineElement } from '../../utils/define';
import { buttonStyles } from '../../styles/shared';
import { sheetStyles } from '../../styles/sheet';
import { trapTab } from '../../core/focus';
import type { Layout } from '../../core/layout';
import { SheetMotion } from '../../shell/sheet-motion';
import { choresStyles } from './chores-styles';
import type { OptionId, OptionModel, OptionsModel } from './options-derive';

const ICONS: Record<OptionId, string> = {
  plan_day: '📅', more_time: '⏰', skip: '🛌', done_by: '🙋', history: '📜', undo: '↩️',
  change_due: '🗓️', hand_off: '🔁', excuse: '🤒', edit: '✏️', delete: '🗑️', approve: '✅', send_back: '↩️',
};

/** Quick reasons for Send back (spec 13.7). */
export const SEND_BACK_REASONS = ['Not finished', 'Missed a spot', 'Do it again'];

export interface OptionChoice {
  id: OptionId;
  /** The day picked (plan a day, change the due date, more time), or a Send back note. */
  value?: string;
}

/**
 * pv-chore-options: what can be done about one chore, by whoever is looking
 * (spec 13.3). A member plans a day, asks for more time or to skip, or says
 * someone else did it; parents also change the due date, hand it over,
 * excuse it, or delete the chore, behind a parent's PIN on a shared screen.
 *
 * @fires pv-option - OptionChoice when an option (and its day or note) is picked
 * @fires pv-sheet-close - the sheet left (Done, Escape, a tap outside, or a drag down)
 */
export class PvChoreOptions extends LitElement {
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
  @property({ attribute: false }) model!: OptionsModel;
  @property({ type: String }) color = '#5B5BD6';
  /** The History lines once they arrive; null before. */
  @property({ attribute: false }) history: string[] | null = null;
  /** An option is being saved: the sheet waits. */
  @property({ type: Boolean }) busy = false;

  @state() private _open: OptionId | null = null;
  @state() private _note = '';
  private _motion = new SheetMotion(this);
  private _detach: (() => void) | null = null;
  private _closing = false;

  static styles = [
    tagStyles,
    buttonStyles,
    sheetStyles,
    choresStyles,
    css`
      .panel {
        padding-top: 0;
        border-top: 4px solid var(--member);
      }

      :host([layout='landscape']) .panel {
        width: min(460px, calc(100vw - 32px));
        padding-top: 0;
      }

      .top {
        padding: 18px 2px 12px;
        border-bottom: 1px solid var(--pv-border, #E7E7E3);
      }

      h2 {
        margin: 0;
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        font-size: 1.25rem;
        font-weight: 800;
      }

      .meta-line {
        margin-top: 4px;
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.9375rem;
      }

      .added {
        margin-top: 2px;
        color: var(--pv-text-muted, #8E949C);
        font-size: 0.875rem;
      }

      .note .badge {
        white-space: normal;
        text-align: left;
      }

      .note {
        margin-top: 8px;
      }

      .group {
        margin: 14px 2px 2px;
        font-size: 0.8125rem;
        font-weight: 750;
        color: var(--pv-text-muted, #8E949C);
      }

      .option {
        border-bottom: 1px solid var(--pv-border-subtle, #F1F1EE);
      }

      .option > button {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        min-height: 56px;
        padding: 8px 2px;
        border: none;
        background: transparent;
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
      }

      .option > button:focus-visible {
        outline: 2px solid var(--pv-accent-ink, #5B5BD6);
        outline-offset: -2px;
        border-radius: 10px;
      }

      .option > button[disabled] {
        opacity: 0.5;
        cursor: default;
      }

      .icon {
        width: 28px;
        flex-shrink: 0;
        text-align: center;
        font-size: 1.125rem;
      }

      .words {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .label {
        font-size: 1rem;
      }

      .option.destructive .label {
        color: var(--pv-danger, #C62828);
      }

      .hint {
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.8125rem;
        line-height: 1.35;
      }



      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 0 2px 14px 42px;
      }

      .chip {
        min-height: 48px;
        padding: 0 14px;
        border-radius: 999px;
        border: 1px solid var(--pv-border, #E7E7E3);
        background: var(--pv-card-bg, #FFFFFF);
        color: var(--pv-text, #1A1B1E);
        font: inherit;
        font-weight: 650;
        cursor: pointer;
      }

      .chip:hover,
      .chip:focus-visible {
        border-color: var(--pv-accent, #5B5BD6);
        outline: none;
      }

      input[type='date'],
      input[type='text'] {
        min-height: 48px;
        padding: 0 12px;
        border-radius: 12px;
        border: 1px solid var(--pv-border, #E7E7E3);
        background: var(--pv-card-bg, #FFFFFF);
        color: var(--pv-text, #1A1B1E);
        font: inherit;
      }

      .history {
        margin: 0;
        padding: 0 2px 14px 42px;
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 4px;
        color: var(--pv-text-secondary, #5F6670);
      }

      .loading {
        width: 60%;
        height: 14px;
      }

      .actions {
        margin-top: 14px;
      }
    `,
  ];

  firstUpdated(): void {
    this.style.setProperty('--member', this.color);
    const panel = this.renderRoot.querySelector<HTMLElement>('.panel')!;
    const backdrop = this.renderRoot.querySelector<HTMLElement>('.backdrop')!;
    this._motion.open(panel, backdrop);
    this._detach = this._motion.attachDrag(this.renderRoot.querySelector<HTMLElement>('.grab-zone')!, panel, () => void this.close());
    this.renderRoot.querySelector<HTMLElement>('#options-title')?.focus();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._detach?.();
  }

  /** Leave, then say so. */
  async close(): Promise<void> {
    if (this._closing) return;
    this._closing = true;
    const panel = this.renderRoot.querySelector<HTMLElement>('.panel')!;
    const backdrop = this.renderRoot.querySelector<HTMLElement>('.backdrop')!;
    await this._motion.close(panel, backdrop);
    this.dispatchEvent(new CustomEvent('pv-sheet-close', { bubbles: true, composed: true }));
  }

  render() {
    const model = this.model;
    if (!model) return nothing;
    return html`
      <div class="backdrop" @click=${() => void this.close()}></div>
      <div class="panel" role="dialog" aria-modal="true" aria-labelledby="options-title" @keydown=${this._key}
        aria-busy=${this.busy ? 'true' : 'false'}>
        <div class="grab-zone" aria-hidden="true"><div class="grab"></div></div>
        <div class="top">
          <h2 id="options-title" tabindex="-1">${model.title}</h2>
          <div class="meta-line">${model.meta}</div>
          ${model.added ? html`<div class="added">${model.added}</div>` : nothing}
          ${model.note ? html`<div class="note"><span class="badge ${model.note.startsWith('Sent back') ? 'bad' : 'act'}">${model.note}</span></div>` : nothing}
        </div>
        ${model.member.filter(option => !option.destructive).map(option => this._option(option))}
        ${model.parent.some(option => !option.destructive)
          ? html`<div class="group">For parents</div>${model.parent.filter(option => !option.destructive).map(option => this._option(option))}`
          : nothing}
        <div class="actions">
          ${[...model.member, ...model.parent].filter(option => option.destructive).map(option => html`
            <button class="pv-btn pv-btn-secondary danger" type="button" ?disabled=${option.disabled || this.busy}
              @click=${() => this._tap(option, false)}>${option.label}${option.tag ? html` <span class="pv-tag muted">${option.tag}</span>` : nothing}</button>
          `)}
          <button class="pv-btn pv-btn-secondary" type="button" @click=${() => void this.close()}>Done</button>
        </div>
      </div>
    `;
  }

  private _option(option: OptionModel) {
    const open = this._open === option.id;
    const expands = !!option.chips?.length || !!option.pick || option.id === 'history' || option.id === 'send_back';
    return html`
      <div class="option ${option.destructive ? 'destructive' : ''}">
        <button type="button" ?disabled=${option.disabled || this.busy} aria-expanded=${expands ? (open ? 'true' : 'false') : nothing}
          @click=${() => this._tap(option, expands)}>
          <span class="icon" aria-hidden="true">${ICONS[option.id]}</span>
          <span class="words">
            <span class="label">${option.label}</span>
            ${option.hint ? html`<span class="hint">${option.hint}</span>` : nothing}
          </span>
          ${option.tag ? html`<span class="pv-tag ${option.tag === 'Needs an OK' ? 'ask' : 'muted'}">${option.tag}</span>` : nothing}
        </button>
        ${open ? this._more(option) : nothing}
      </div>
    `;
  }

  private _more(option: OptionModel) {
    if (option.id === 'history') {
      return this.history
        ? html`<ul class="history">${this.history.map(line => html`<li>${line}</li>`)}</ul>`
        : html`<ul class="history" aria-busy="true"><li class="bone loading"></li><li class="bone loading"></li></ul>`;
    }
    if (option.id === 'send_back') {
      return html`
        <div class="chips">
          ${SEND_BACK_REASONS.map(reason => html`
            <button class="chip" type="button" @click=${() => this._choose(option.id, reason)}>${reason}</button>
          `)}
          <input type="text" maxlength="60" placeholder="Write a note…" aria-label="Write a note" .value=${this._note}
            @input=${(e: Event) => { this._note = (e.target as HTMLInputElement).value; }}
            @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter' && this._note.trim()) this._choose(option.id, this._note.trim()); }} />
          ${this._note.trim() ? html`<button class="chip" type="button" @click=${() => this._choose(option.id, this._note.trim())}>Send back</button>` : nothing}
        </div>
      `;
    }
    return html`
      <div class="chips">
        ${(option.chips ?? []).map(chip => html`
          <button class="chip" type="button" @click=${() => this._choose(option.id, chip.day)}>${chip.label}</button>
        `)}
        ${option.pick ? html`
          <pv-date-field  aria-label="Pick a date" min=${option.pick.min} max=${option.pick.max ?? nothing}
            @change=${(e: Event) => { const value = (e.target as HTMLInputElement).value; if (value) this._choose(option.id, value); }}></pv-date-field>
        ` : nothing}
      </div>
    `;
  }

  private _tap(option: OptionModel, expands: boolean): void {
    if (expands) {
      this._open = this._open === option.id ? null : option.id;
      if (option.id === 'history' && this._open === 'history') this._choose('history');
      return;
    }
    this._choose(option.id);
  }

  private _choose(id: OptionId, value?: string): void {
    this.dispatchEvent(new CustomEvent<OptionChoice>('pv-option', { detail: { id, value }, bubbles: true, composed: true }));
  }

  private _key = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      event.preventDefault();
      void this.close();
      return;
    }
    trapTab(this.shadowRoot!, event);
  };
}

defineElement('pv-chore-options', PvChoreOptions);
