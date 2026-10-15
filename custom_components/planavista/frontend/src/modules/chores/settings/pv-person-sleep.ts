import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import '../../../core/pv-time-field';
import { defineElement } from '../../../utils/define';
import { baseStyles, formStyles } from '../../../styles/shared';
import type { PersonDraft } from '../../../core/person-draft';
import type { PlanaVistaData } from '../../../types';
import { PERSON_CHANGE } from '../../../core/settings-registry';
import { sleepText } from './person-derive';
import { choresSettingsStyles } from './settings-styles';
import { HelpState, helpBox, helpLabel, helpStyles } from '../../../core/help';

/**
 * pv-person-sleep: bedtimes and sleep (spec 14.2, 7.2). My day starts after
 * sleep and ends at bedtime; an imported plan fills these in.
 */
export class PvPersonSleep extends LitElement {
  /** Which settings' explainers are open (0.12.0, core/help.ts). */
  private readonly _help = new HelpState(this);
  @property({ attribute: false }) draft!: PersonDraft;
  /** For the household's 12- or 24-hour times. */
  @property({ attribute: false }) data?: PlanaVistaData;

  static styles = [
    helpStyles,
    baseStyles,
    formStyles,
    choresSettingsStyles,
    css`
      :host {
        margin: 0 0 22px;
      }

      .legend {
        display: block;
        margin-bottom: 8px;
        font-size: 0.8125rem;
        font-weight: 750;
        color: var(--pv-text-secondary, #5F6670);
      }

      .row .pv-input {
        max-width: 160px;
        margin-left: auto;
      }
    `,
  ];

  private _change(patch: Partial<PersonDraft>): void {
    this.dispatchEvent(new CustomEvent(PERSON_CHANGE, { detail: patch, bubbles: true, composed: true }));
  }

  private _bedtime(which: 'weeknight' | 'weekend', value: string): void {
    const now = this.draft.bedtime;
    if (!value) {
      this._change({ bedtime: which === 'weeknight' ? null : now ? { ...now, weekend: now.weeknight } : null });
      return;
    }
    const weeknight = which === 'weeknight' ? value : now?.weeknight ?? value;
    const weekend = which === 'weekend' ? value : now?.weekend ?? value;
    this._change({ bedtime: { weeknight, weekend } });
  }

  render() {
    const d = this.draft;
    if (!d) return nothing;
    const sleep = d.sleep_hours;
    return html`
      <span class="legend">${helpLabel(this._help, 'person_sleep', 'Sleep')}</span>
      ${helpBox(this._help, 'person_sleep')}
      <div class="group">
        <label class="row">
          <span class="row-text">Bedtime, weeknights</span>
          <pv-time-field  .format=${this.data?.display?.time_format === '24h' ? '24h' : '12h'} .value=${d.bedtime?.weeknight ?? ''}
            @change=${(e: Event) => this._bedtime('weeknight', (e.target as HTMLInputElement).value)}></pv-time-field>
        </label>
        <label class="row">
          <span class="row-text">Bedtime, weekends<span class="row-sub">Friday and Saturday nights</span></span>
          <pv-time-field  .format=${this.data?.display?.time_format === '24h' ? '24h' : '12h'} .value=${d.bedtime?.weekend ?? ''} ?disabled=${!d.bedtime}
            @change=${(e: Event) => this._bedtime('weekend', (e.target as HTMLInputElement).value)}></pv-time-field>
        </label>
        <div class="row">
          <span class="row-text">Sleep</span>
          <span class="stepper">
            <output>${sleep === null ? 'Not set' : sleepText(sleep)}</output>
            <button type="button" aria-label="Less sleep" ?disabled=${sleep !== null && sleep <= 1}
              @click=${() => this._change({ sleep_hours: sleep === null ? 8 : Math.max(1, sleep - 0.5) })}>−</button>
            <button type="button" aria-label="More sleep" ?disabled=${sleep !== null && sleep >= 16}
              @click=${() => this._change({ sleep_hours: sleep === null ? 8 : Math.min(16, sleep + 0.5) })}>+</button>
          </span>
        </div>
      </div>
    `;
  }
}

defineElement('pv-person-sleep', PvPersonSleep);
