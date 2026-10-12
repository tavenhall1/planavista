import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { defineElement } from '../../../utils/define';
import { baseStyles, formStyles } from '../../../styles/shared';
import type { PersonDraft } from '../../../core/person-draft';
import { PERSON_CHANGE } from '../../../core/settings-registry';
import { sleepText } from './person-derive';
import { choresSettingsStyles } from './settings-styles';

/**
 * pv-person-sleep: bedtimes and sleep (spec 14.2, 7.2). My day starts after
 * sleep and ends at bedtime; an imported plan fills these in.
 */
export class PvPersonSleep extends LitElement {
  @property({ attribute: false }) draft!: PersonDraft;

  static styles = [
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
        font-weight: 600;
        font-size: 0.9375rem;
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
      <span class="legend">Sleep</span>
      <div class="group">
        <label class="row">
          <span class="row-text">Bedtime, weeknights</span>
          <input class="pv-input" type="time" .value=${d.bedtime?.weeknight ?? ''}
            @change=${(e: Event) => this._bedtime('weeknight', (e.target as HTMLInputElement).value)} />
        </label>
        <label class="row">
          <span class="row-text">Bedtime, weekends<span class="row-sub">Friday and Saturday nights</span></span>
          <input class="pv-input" type="time" .value=${d.bedtime?.weekend ?? ''} ?disabled=${!d.bedtime}
            @change=${(e: Event) => this._bedtime('weekend', (e.target as HTMLInputElement).value)} />
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
      <p class="hint">My day starts after sleep and ends at bedtime.</p>
    `;
  }
}

defineElement('pv-person-sleep', PvPersonSleep);
