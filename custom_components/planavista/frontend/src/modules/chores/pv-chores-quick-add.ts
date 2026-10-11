import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../utils/define';
import { buttonStyles } from '../../styles/shared';
import { sheetStyles } from '../../styles/sheet';
import { trapTab } from '../../core/focus';
import type { Layout } from '../../core/layout';
import type { Member } from '../../core/household';
import { minutesText } from '../../core/status-map';
import { SheetMotion } from '../../shell/sheet-motion';
import '../../core/pv-member-avatar';
import {
  MINUTE_CHOICES,
  QuickAddDraft,
  When,
  byChips,
  everyChoices,
  newDraft,
  quickAddProblem,
  withWho,
  worthLine,
} from './quick-add';

/**
 * pv-chores-quick-add: a short sheet for one-offs (spec 13.8): what needs
 * doing, who, when (today, by a date, or repeating), about how long,
 * whether it needs a parent's OK (on for young children), and what it earns.
 * The chore editor in Settings handles everything else.
 *
 * @fires pv-quick-add - { draft } on Add, once the draft makes sense
 * @fires pv-sheet-close - Cancel, Escape, a tap outside, or a drag down
 */
export class PvChoresQuickAdd extends LitElement {
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
  @property({ attribute: false }) people: Member[] = [];
  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) colorOf: (member: Member) => string = m => m.color;
  @property({ type: String }) today = '';
  @property({ type: Number }) minutesPerStar = 15;
  @property({ type: Boolean }) busy = false;

  @state() private _draft: QuickAddDraft = newDraft();
  @state() private _problem: string | null = null;
  @state() private _other = false;
  @state() private _changeStars = false;
  private _motion = new SheetMotion(this);
  private _detach: (() => void) | null = null;
  private _closing = false;

  static styles = [
    buttonStyles,
    sheetStyles,
    css`
      :host([layout='landscape']) .panel {
        width: min(480px, calc(100vw - 32px));
      }

      .bar {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        margin: -4px -6px 10px;
      }

      .bar h2 {
        margin: 0;
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        font-size: 1.125rem;
        font-weight: 800;
      }

      .bar .add {
        justify-self: end;
        font-weight: 800;
      }

      .text {
        min-height: 44px;
        padding: 0 8px;
        border: none;
        background: transparent;
        color: var(--pv-accent-ink, #5B5BD6);
        font: inherit;
        font-weight: 650;
        cursor: pointer;
      }

      .text[disabled] {
        opacity: 0.5;
      }

      section {
        padding: 12px 0;
        border-top: 1px solid var(--pv-border-subtle, #F1F1EE);
      }

      label.title,
      .title {
        display: block;
        margin-bottom: 8px;
        font-size: 0.8125rem;
        font-weight: 750;
        color: var(--pv-text-secondary, #5F6670);
      }

      input[type='text'],
      input[type='number'],
      input[type='date'] {
        box-sizing: border-box;
        min-height: 48px;
        padding: 0 14px;
        border-radius: 12px;
        border: 1px solid var(--pv-border, #E7E7E3);
        background: var(--pv-card-bg, #FFFFFF);
        color: var(--pv-text, #1A1B1E);
        font: inherit;
      }

      input[type='text'] {
        width: 100%;
        font-size: 1.0625rem;
      }

      input:focus-visible {
        outline: 2px solid var(--pv-accent, #5B5BD6);
        outline-offset: 1px;
      }

      .faces {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .face {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        min-width: 56px;
        min-height: 48px;
        padding: 4px;
        border: none;
        border-radius: 14px;
        background: transparent;
        color: var(--pv-text-secondary, #5F6670);
        font: inherit;
        font-size: 0.8125rem;
        font-weight: 700;
        cursor: pointer;
        opacity: 0.55;
      }

      .face[aria-pressed='true'] {
        opacity: 1;
        color: var(--pv-text, #1A1B1E);
      }

      .face[aria-pressed='true'] pv-member-avatar {
        outline: 3px solid var(--face);
        outline-offset: 2px;
        border-radius: 50%;
      }

      .seg {
        display: inline-flex;
        padding: 3px;
        border-radius: 10px;
        background: var(--pv-seg, #ECECE8);
        margin-bottom: 10px;
      }

      .seg button {
        min-height: 40px;
        padding: 0 14px;
        border: none;
        border-radius: 8px;
        background: transparent;
        color: var(--pv-text-secondary, #5F6670);
        font: inherit;
        font-weight: 650;
        cursor: pointer;
      }

      .seg button[aria-pressed='true'] {
        background: var(--pv-seg-on, #FFFFFF);
        color: var(--pv-text, #1A1B1E);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
      }

      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
      }

      .chip {
        min-height: 40px;
        padding: 0 14px;
        border-radius: 999px;
        border: 1px solid var(--pv-border, #E7E7E3);
        background: var(--pv-card-bg, #FFFFFF);
        color: var(--pv-text, #1A1B1E);
        font: inherit;
        font-weight: 650;
        cursor: pointer;
      }

      .chip[aria-pressed='true'] {
        border-color: var(--pv-accent, #5B5BD6);
        background: var(--pv-accent-tint, #EEEEFC);
        color: var(--pv-accent-tint-ink, #3B3BB0);
      }

      .switch-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .switch-row .caption {
        color: var(--pv-text-muted, #8E949C);
        font-size: 0.8125rem;
      }

      .switch {
        position: relative;
        width: 52px;
        height: 32px;
        flex-shrink: 0;
        border: none;
        border-radius: 999px;
        background: var(--pv-track, #ECECE8);
        cursor: pointer;
      }

      .switch::after {
        content: '';
        position: absolute;
        top: 3px;
        left: 3px;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background: #FFFFFF;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
        transition: transform 180ms ease;
      }

      .switch[aria-checked='true'] {
        background: var(--pv-accent, #5B5BD6);
      }

      .switch[aria-checked='true']::after {
        transform: translateX(20px);
      }

      .worth {
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.9375rem;
      }

      .stepper {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        margin-top: 8px;
      }

      .stepper button {
        min-width: 44px;
        min-height: 44px;
      }

      .problem {
        margin-top: 8px;
        color: var(--pv-bad-ink, #A12828);
        font-weight: 650;
      }
    `,
  ];

  firstUpdated(): void {
    const panel = this.renderRoot.querySelector<HTMLElement>('.panel')!;
    const backdrop = this.renderRoot.querySelector<HTMLElement>('.backdrop')!;
    this._motion.open(panel, backdrop);
    this._detach = this._motion.attachDrag(this.renderRoot.querySelector<HTMLElement>('.grab-zone')!, panel, () => void this.close());
    this.renderRoot.querySelector<HTMLInputElement>('#name')?.focus();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._detach?.();
  }

  async close(): Promise<void> {
    if (this._closing) return;
    this._closing = true;
    const panel = this.renderRoot.querySelector<HTMLElement>('.panel')!;
    const backdrop = this.renderRoot.querySelector<HTMLElement>('.backdrop')!;
    await this._motion.close(panel, backdrop);
    this.dispatchEvent(new CustomEvent('pv-sheet-close', { bubbles: true, composed: true }));
  }

  private _set(changes: Partial<QuickAddDraft>): void {
    this._draft = { ...this._draft, ...changes };
    if (this._problem) this._problem = quickAddProblem(this._draft, this.today);
  }

  private _toggle(member: Member): void {
    const who = this._draft.who.includes(member.id)
      ? this._draft.who.filter(id => id !== member.id)
      : [...this._draft.who, member.id];
    this._draft = withWho(this._draft, who, this.people);
    if (this._problem) this._problem = quickAddProblem(this._draft, this.today);
  }

  private _add = (): void => {
    const problem = quickAddProblem(this._draft, this.today);
    this._problem = problem;
    if (problem) return;
    this.dispatchEvent(new CustomEvent('pv-quick-add', { detail: { draft: this._draft }, bubbles: true, composed: true }));
  };

  render() {
    const d = this._draft;
    const when: Array<{ id: When; label: string }> = [
      { id: 'today', label: 'Today' },
      { id: 'by', label: 'By a date' },
      { id: 'repeats', label: 'Repeats' },
    ];
    return html`
      <div class="backdrop" @click=${() => void this.close()}></div>
      <div class="panel" role="dialog" aria-modal="true" aria-labelledby="add-title" @keydown=${this._key}>
        <div class="grab-zone" aria-hidden="true"><div class="grab"></div></div>
        <div class="bar">
          <button class="text" type="button" @click=${() => void this.close()}>Cancel</button>
          <h2 id="add-title">New chore</h2>
          <button class="text add" type="button" ?disabled=${this.busy} @click=${this._add}>${this.busy ? 'Adding…' : 'Add'}</button>
        </div>
        <section>
          <label class="title" for="name">What needs doing?</label>
          <input id="name" type="text" maxlength="60" placeholder="Clean out the garage" autocomplete="off" .value=${d.name}
            @input=${(e: Event) => this._set({ name: (e.target as HTMLInputElement).value })}
            @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter') this._add(); }} />
        </section>
        <section>
          <span class="title" id="who-title">Who</span>
          <div class="faces" role="group" aria-labelledby="who-title">
            ${this.people.map(person => html`
              <button class="face" type="button" aria-pressed=${d.who.includes(person.id) ? 'true' : 'false'}
                style="--face:${this.colorOf(person)}" @click=${() => this._toggle(person)}>
                <pv-member-avatar .member=${{ ...person, color: this.colorOf(person) }} .hass=${this.hass} size="40"></pv-member-avatar>
                ${person.name}
              </button>
            `)}
          </div>
        </section>
        <section>
          <span class="title">When</span>
          <div class="seg" role="group" aria-label="When">
            ${when.map(w => html`<button type="button" aria-pressed=${d.when === w.id ? 'true' : 'false'} @click=${() => this._set({ when: w.id })}>${w.label}</button>`)}
          </div>
          ${d.when === 'by' ? html`
            <div class="chips">
              ${byChips(this.today).map(chip => html`
                <button class="chip" type="button" aria-pressed=${d.by === chip.day ? 'true' : 'false'} @click=${() => this._set({ by: chip.day })}>${chip.label}</button>
              `)}
              <input type="date" aria-label="Pick a date" min=${this.today} .value=${d.by && !byChips(this.today).some(c => c.day === d.by) ? d.by : ''}
                @change=${(e: Event) => this._set({ by: (e.target as HTMLInputElement).value || null })} />
            </div>
          ` : nothing}
          ${d.when === 'repeats' ? html`
            <div class="chips">
              ${everyChoices(this.today).map(choice => html`
                <button class="chip" type="button" aria-pressed=${d.every === choice.id ? 'true' : 'false'} @click=${() => this._set({ every: choice.id })}>${choice.label}</button>
              `)}
            </div>
          ` : nothing}
        </section>
        <section>
          <span class="title">About how long?</span>
          <div class="chips">
            ${MINUTE_CHOICES.map(minutes => html`
              <button class="chip" type="button" aria-pressed=${!this._other && d.minutes === minutes ? 'true' : 'false'}
                @click=${() => { this._other = false; this._set({ minutes }); }}>${minutesText(minutes)}</button>
            `)}
            <button class="chip" type="button" aria-pressed=${this._other ? 'true' : 'false'} @click=${() => { this._other = true; }}>Other</button>
            ${this._other ? html`
              <input type="number" min="1" max="1440" inputmode="numeric" aria-label="Minutes" .value=${String(d.minutes)}
                @input=${(e: Event) => this._set({ minutes: Number((e.target as HTMLInputElement).value) })} /> min
            ` : nothing}
          </div>
        </section>
        <section>
          <div class="switch-row">
            <div>
              <div>Needs a parent's OK</div>
              <div class="caption">On for young children automatically</div>
            </div>
            <button class="switch" type="button" role="switch" aria-checked=${d.needsOk ? 'true' : 'false'} aria-label="Needs a parent's OK"
              @click=${() => this._set({ needsOk: !d.needsOk, needsOkSet: true })}></button>
          </div>
        </section>
        <section>
          <span class="worth">${worthLine(d, this.minutesPerStar)}</span>
          <button class="text" type="button" @click=${() => { this._changeStars = !this._changeStars; }}>Change</button>
          ${this._changeStars ? html`
            <div class="stepper">
              <button class="pv-btn pv-btn-secondary" type="button" aria-label="Fewer stars"
                @click=${() => this._set({ stars: Math.max(0, (d.stars ?? 1) - 1) })}>−</button>
              <button class="pv-btn pv-btn-secondary" type="button" aria-label="More stars"
                @click=${() => this._set({ stars: Math.min(100, (d.stars ?? 0) + 1) })}>+</button>
              <button class="text" type="button" ?disabled=${d.stars === null} @click=${() => this._set({ stars: null })}>Automatic</button>
            </div>
          ` : nothing}
          ${this._problem ? html`<div class="problem" role="alert">${this._problem}</div>` : nothing}
        </section>
      </div>
    `;
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

defineElement('pv-chores-quick-add', PvChoresQuickAdd);
