import { LitElement, html, css, nothing } from 'lit';
import { segmentedStyles } from '../../../styles/controls';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../../utils/define';
import { baseStyles, buttonStyles, formStyles } from '../../../styles/shared';
import { HouseholdView, Member, inOrder } from '../../../core/household';
import type { Layout } from '../../../core/layout';
import type { ModuleService } from '../../../core/module-registry';
import { PAGE_ERROR, POP_PAGE } from '../../../core/page-host';
import { copyText } from '../../../core/clipboard';
import { errorCode, errorMessage } from '../../../core/ws-api';
import type { PlanaVistaData } from '../../../types';
import type { ChoresService } from '../chores-service';
import type { Activity, Band, Board } from '../chores-types';
import { pictureFor } from '../picture-words';
import { checkoffStars } from '../worth';
import {
  CATEGORIES, ChoreDraft, ChoreRecord, DAY_CODES, Schedule, asActivity, automationExample, beginChoreDraft,
  choreChanges, choreProblem, evenShares, isDirty, okText, onceText, rebaseChore, sharesStatus, whenText, windowText,
  worthText,
} from './chore-draft';
import { durationText } from './chores-list-derive';
import { memberEntities } from './entities';
import { choresSettingsStyles } from './settings-styles';
import '../../../core/pv-member-avatar';
import '../../../core/pv-recurrence-picker';
import '../../../shell/pv-notice-sheet';

type Notice = 'discard' | 'delete' | 'changed';

const SCHEDULE_LEADS: Record<Schedule, string> = {
  plan: 'Part of the household plan: a set amount of time each day or each week.',
  once: 'One time, on a day or by a date.',
  repeats: 'On a schedule, like every Saturday or once a month.',
};
const DAY_LETTERS: Record<string, [string, string]> = {
  mon: ['M', 'Monday'], tue: ['T', 'Tuesday'], wed: ['W', 'Wednesday'], thu: ['T', 'Thursday'], fri: ['F', 'Friday'],
  sat: ['S', 'Saturday'], sun: ['S', 'Sunday'],
};
const BANDS: Array<[Band, string]> = [['morning', 'Morning'], ['afternoon', 'Afternoon'], ['evening', 'Evening']];
const ESTIMATES = [15, 30, 60, 120, 240];
const PICTURES = ['🍽️', '🧽', '🧺', '🛏️', '🧸', '🐠', '🐱', '🐕', '🐾', '🍴', '🧹', '🛁', '🍂', '🌿', '🛒', '🪴', '🚗', '📦',
  '🍳', '📚', '🪥', '🔨', '🔧', '💵', '✨', '🗑️', '🧼', '🪣', '🛋️', '🌀'];

/** Steps of 5 minutes under an hour, then of 15. */
function step(minutes: number, up: boolean): number {
  if (up) return minutes < 60 ? minutes + 5 : minutes + 15;
  return minutes <= 60 ? Math.max(5, minutes - 5) : minutes - 15;
}

/**
 * pv-chore-editor: one chore (spec 14.4). Plan, Once, or Repeats at the top;
 * who, the board settings, and Use in automations work the same for all
 * three. An editor: Cancel and Save, with the draft kept on the card so it
 * survives the end of parent mode, and the revision it began from saved
 * with it, so a version another screen saved is noticed.
 */
export class PvChoreEditor extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlanaVistaData;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
  @property({ attribute: false }) pageProps: Record<string, unknown> = {};
  @property({ attribute: false }) drafts: Map<string, unknown> = new Map();
  @property({ attribute: false }) services: Record<string, ModuleService> = {};
  @property({ type: Number }) revision = 0;

  @state() private _record!: ChoreRecord;
  @state() private _problem = '';
  @state() private _saving = false;
  @state() private _notice: Notice | null = null;
  @state() private _pictures = false;
  @state() private _otherEstimate = false;
  @state() private _copied = '';
  private _loaded = false;
  private _leave?: (ok: boolean) => void;

  private get _chores(): ChoresService | undefined {
    return this.services?.chores as ChoresService | undefined;
  }

  private get _board(): Board | null {
    return this._chores?.board() ?? null;
  }

  private get _choreId(): string | null {
    return (this.pageProps.choreId as string | null | undefined) ?? null;
  }

  private get _activity(): Activity | null {
    return this._board?.chores.find(a => a.id === this._choreId) ?? null;
  }

  private get _draftKey(): string {
    return `chore:${this._choreId ?? 'new'}`;
  }

  private get _draft(): ChoreDraft {
    return this._record.draft;
  }

  protected willUpdate(): void {
    const board = this._board;
    if (!this._loaded && board && (this._choreId === null || this._activity)) {
      const kept = this.drafts.get(this._draftKey) as ChoreRecord | undefined;
      this._record = kept ?? beginChoreDraft(this._activity, board.today, (this.pageProps.assignees as string[] | undefined) ?? []);
      this._loaded = true;
    }
  }

  /** Settings asks before leaving a page with changes (spec 14.1). */
  confirmLeave(): Promise<boolean> {
    if (!this._loaded || !isDirty(this._record)) return Promise.resolve(true);
    this._notice = 'discard';
    return new Promise(resolve => {
      this._leave = resolve;
    });
  }

  static styles = [
    segmentedStyles,
    baseStyles,
    buttonStyles,
    formStyles,
    choresSettingsStyles,
    css`
      :host {
        max-width: 640px;
      }

      :host([layout='landscape']) {
        margin: 0 auto;
      }

      .top {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 16px;
      }

      .top .actions {
        display: flex;
        gap: 8px;
        margin-left: auto;
      }

      .top .actions button {
        min-height: 48px;
        min-width: 88px;
      }

      .picture-button {
        display: grid;
        justify-items: center;
        gap: 4px;
        border: none;
        background: transparent;
        color: var(--pv-accent-ink, var(--pv-accent, #6366F1));
        font: inherit;
        font-size: 0.8125rem;
        font-weight: 600;
        cursor: pointer;
      }

      .picture-button .big {
        width: 72px;
        height: 72px;
        display: grid;
        place-items: center;
        border-radius: 18px;
        background: var(--pv-card-bg, #FFFFFF);
        box-shadow: inset 0 0 0 1px var(--pv-border-subtle, #E5E7EB);
        font-size: 2.5rem;
      }

      .pictures {
        display: grid;
        grid-template-columns: repeat(auto-fill, 48px);
        gap: 6px;
        padding: 12px;
      }

      .pictures button {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        border: 1px solid var(--pv-border-subtle, #E5E7EB);
        background: var(--pv-card-bg, #FFFFFF);
        font-size: 1.5rem;
        cursor: pointer;
      }

      .pictures button[aria-pressed='true'] {
        border-color: var(--pv-accent, #6366F1);
        box-shadow: inset 0 0 0 2px var(--pv-accent, #6366F1);
      }

      .name-row input {
        flex: 1;
        border: none;
        background: transparent;
        font: inherit;
        font-size: 1.0625rem;
        color: inherit;
        min-height: 48px;
      }

      .name-row input:focus {
        outline: none;
      }

      .people {
        display: flex;
        flex-wrap: wrap;
        gap: 14px;
        padding: 12px 14px;
      }

      .person {
        position: relative;
        display: grid;
        justify-items: center;
        gap: 4px;
        min-width: 56px;
        border: none;
        background: transparent;
        color: inherit;
        font: inherit;
        font-size: 0.8125rem;
        cursor: pointer;
      }

      .person[aria-pressed='false'] pv-member-avatar {
        opacity: 0.4;
      }

      .person[aria-pressed='true'] .name {
        font-weight: 700;
      }

      .check {
        position: absolute;
        top: 28px;
        left: calc(50% + 10px);
        width: 18px;
        height: 18px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        background: var(--pv-accent, #6366F1);
        color: var(--pv-on-accent, #FFFFFF);
        font-size: 0.6875rem;
        box-shadow: 0 0 0 2px var(--pv-card-bg, #FFFFFF);
      }

      .days {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }

      .day {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: 1px solid var(--pv-border-subtle, #E5E7EB);
        background: var(--pv-card-bg, #FFFFFF);
        color: inherit;
        font: inherit;
        font-weight: 600;
        cursor: pointer;
      }

      .day[aria-pressed='true'] {
        background: var(--pv-accent, #6366F1);
        border-color: var(--pv-accent, #6366F1);
        color: var(--pv-on-accent, #FFFFFF);
      }

      .stack {
        display: grid;
        gap: 8px;
        width: 100%;
      }

      .row .pv-input,
      .row .pv-select {
        max-width: 240px;
        margin-left: auto;
      }

      .other {
        max-width: 120px;
      }

      pre {
        margin: 0;
        padding: 12px 14px;
        border-radius: 12px;
        background: color-mix(in srgb, var(--pv-text, #1A1B1E) 6%, transparent);
        font-size: 0.8125rem;
        white-space: pre-wrap;
      }

      .copy {
        min-height: 48px;
        margin-left: auto;
      }

      code {
        font-size: 0.875rem;
      }

      .gone {
        color: var(--pv-text-secondary, #6B7280);
      }
    `,
  ];

  render() {
    const board = this._board;
    if (!board) return html`<div class="skeleton"></div><div class="skeleton"></div>`;
    if (this._choreId !== null && !this._activity) {
      return html`<p class="gone">This chore was deleted on another screen.</p>`;
    }
    if (!this._loaded) return nothing;
    const d = this._draft;
    const members = inOrder(this.household?.members ?? []);
    const isNew = this._choreId === null;
    return html`
      <div class="top">
        <button class="picture-button" type="button" aria-expanded=${this._pictures ? 'true' : 'false'}
          @click=${() => { this._pictures = !this._pictures; }}>
          <span class="big" aria-hidden="true">${d.icon || pictureFor(d.name || 'chore')}</span>Change picture
        </button>
        <div class="actions">
          <button class="pv-btn pv-btn-secondary" type="button" @click=${this._cancel}>Cancel</button>
          <button class="pv-btn pv-btn-primary" type="button" ?disabled=${this._saving || (!isNew && !isDirty(this._record))}
            @click=${this._save}>${isNew ? 'Add' : 'Save'}</button>
        </div>
      </div>
      ${this._pictures ? this._renderPictures() : nothing}
      ${this._problem ? html`<p class="problem" role="alert">${this._problem}</p>` : nothing}
      <div class="group">
        <label class="row name-row">
          <span class="row-sub" style="width: 56px">Name</span>
          <input type="text" maxlength="60" autocomplete="off" .value=${d.name} aria-label="Name"
            @input=${(e: Event) => this._change({ name: (e.target as HTMLInputElement).value })} />
        </label>
      </div>
      <div class="pv-seg stretch" role="group" aria-label="Schedule" style="margin-top: 14px">
        ${(['plan', 'once', 'repeats'] as Schedule[]).map(schedule => html`
          <button type="button" aria-pressed=${d.schedule === schedule ? 'true' : 'false'}
            @click=${() => this._change({ schedule })}>${schedule === 'plan' ? 'Plan' : schedule === 'once' ? 'Once' : 'Repeats'}</button>
        `)}
      </div>
      <p class="hint">${SCHEDULE_LEADS[d.schedule]}</p>
      ${this._renderWho(members)}
      ${d.schedule === 'plan' ? this._renderPlan(board) : d.schedule === 'once' ? this._renderOnce(board) : this._renderRepeats(board)}
      ${this._renderBoard(board, members)}
      ${this._activity ? this._renderAutomations(this._activity, members) : nothing}
      ${this._activity ? html`
        <button class="destructive" type="button" @click=${() => { this._notice = 'delete'; }}>Delete ${this._activity.name}…</button>
      ` : nothing}
      ${this._renderNotice()}
    `;
  }

  private _renderPictures() {
    const d = this._draft;
    return html`
      <div class="group">
        <div class="pictures" role="group" aria-label="Pictures">
          <button type="button" aria-pressed=${d.icon === null ? 'true' : 'false'} aria-label="From the name"
            title="From the name" @click=${() => this._pick(null)}>${pictureFor(d.name || 'chore')}</button>
          ${PICTURES.map(picture => html`
            <button type="button" aria-pressed=${d.icon === picture ? 'true' : 'false'} @click=${() => this._pick(picture)}>${picture}</button>
          `)}
        </div>
        <label class="row">
          <span class="row-text">Another emoji</span>
          <input class="pv-input other" type="text" maxlength="8" placeholder="🦖" aria-label="Another emoji"
            .value=${d.icon && !PICTURES.includes(d.icon) ? d.icon : ''}
            @input=${(e: Event) => { const value = (e.target as HTMLInputElement).value.trim(); this._change({ icon: value || null }); }} />
        </label>
      </div>
    `;
  }

  private _pick(icon: string | null): void {
    this._change({ icon });
    this._pictures = false;
  }

  private _renderWho(members: Member[]) {
    const d = this._draft;
    const shared = d.schedule === 'plan' && d.assignees.length > 1;
    return html`
      <h2 class="section-label">Who</h2>
      <div class="group">
        <div class="people" role="group" aria-label="Who">
          ${members.map(member => {
            const on = d.assignees.includes(member.id);
            return html`
              <button class="person" type="button" aria-pressed=${on ? 'true' : 'false'} @click=${() => this._toggleMember(member.id)}>
                <pv-member-avatar .member=${member} .hass=${this.hass} size="44"></pv-member-avatar>
                ${on ? html`<span class="check" aria-hidden="true">✓</span>` : nothing}
                <span class="name">${member.name}</span>
              </button>
            `;
          })}
        </div>
        ${shared ? html`
          <div class="row">
            <div class="pv-seg stretch" role="group" aria-label="How the time is shared">
              <button type="button" aria-pressed=${d.split === 'shared' ? 'true' : 'false'}
                @click=${() => this._change({ split: 'shared', shares: evenShares(d.assignees, d.minutes) })}>Split the time</button>
              <button type="button" aria-pressed=${d.split === 'each' ? 'true' : 'false'}
                @click=${() => this._change({ split: 'each' })}>Each does it all</button>
            </div>
          </div>
          ${d.split === 'shared' ? members.filter(m => d.assignees.includes(m.id)).map(member => html`
            <div class="row">
              <pv-member-avatar .member=${member} .hass=${this.hass} size="28"></pv-member-avatar>
              <span class="row-text">${member.name}</span>
              ${this._stepper(d.shares[member.id] ?? 0, value => this._change({ shares: { ...d.shares, [member.id]: value } }), `${member.name}'s share`, 0)}
            </div>
          `) : nothing}
        ` : nothing}
      </div>
      ${shared && d.split === 'shared' ? html`<p class="hint ${sharesStatus(d).ok ? 'ok' : ''}">${sharesStatus(d).text}</p>` : nothing}
      ${!d.assignees.length ? html`<p class="hint">No one yet: it waits off the board until someone is picked.</p>` : nothing}
      ${d.schedule !== 'plan' && d.assignees.length > 1 ? html`<p class="hint">With two or more people, each one gets their own check-off.</p>` : nothing}
    `;
  }

  private _stepper(value: number, set: (value: number) => void, label: string, min = 5, text = durationText(value)) {
    return html`
      <span class="stepper">
        <output>${value === 0 ? '0 min' : text}</output>
        <button type="button" aria-label="Less: ${label}" ?disabled=${value <= min} @click=${() => set(Math.max(min, step(value, false)))}>−</button>
        <button type="button" aria-label="More: ${label}" @click=${() => set(step(value, true))}>+</button>
      </span>
    `;
  }

  private _counter(value: number, set: (value: number) => void, label: string, text: string, min: number, max: number) {
    return html`
      <span class="stepper">
        <output>${text}</output>
        <button type="button" aria-label="Fewer: ${label}" ?disabled=${value <= min} @click=${() => set(value - 1)}>−</button>
        <button type="button" aria-label="More: ${label}" ?disabled=${value >= max} @click=${() => set(value + 1)}>+</button>
      </span>
    `;
  }

  private _renderPlan(board: Board) {
    const d = this._draft;
    const members = inOrder(this.household?.members ?? []);
    const unit = d.per === 'day' ? 'day' : 'week';
    return html`
      <h2 class="section-label">How much</h2>
      <div class="group">
        <div class="row">
          <span class="row-text">Time</span>
          ${this._stepper(d.minutes, minutes => this._setMinutes(minutes), 'time')}
        </div>
        <div class="row">
          <div class="pv-seg stretch" role="group" aria-label="Each day or each week">
            <button type="button" aria-pressed=${d.per === 'day' ? 'true' : 'false'} @click=${() => this._change({ per: 'day' })}>Each day</button>
            <button type="button" aria-pressed=${d.per === 'week' ? 'true' : 'false'} @click=${() => this._change({ per: 'week' })}>Each week</button>
          </div>
        </div>
        <div class="row">
          <span class="row-text">Check off</span>
          ${this._counter(d.times, times => this._change({ times }), 'check-offs',
            `${d.times} ${d.times === 1 ? 'time' : 'times'} a ${d.per === 'week' && d.days.length ? 'day picked' : unit}`, 1, 12)}
        </div>
      </div>
      <p class="hint">${worthText(d, board.settings, members)}</p>
      <h2 class="section-label">When</h2>
      <div class="group">
        <div class="row">
          <div class="stack">
            <span>Days</span>
            <div class="days" role="group" aria-label="Days">
              ${DAY_CODES.map(day => html`
                <button class="day" type="button" aria-label=${DAY_LETTERS[day][1]} aria-pressed=${d.days.includes(day) ? 'true' : 'false'}
                  @click=${() => this._change({ days: d.days.includes(day) ? d.days.filter(x => x !== day) : [...d.days, day] })}>
                  ${DAY_LETTERS[day][0]}
                </button>
              `)}
            </div>
          </div>
        </div>
        <div class="row">
          <div class="stack">
            <span>Time of day</span>
            <div class="chips" role="group" aria-label="Time of day">
              ${BANDS.map(([band, label]) => html`
                <button class="chip chip--plain" type="button" aria-pressed=${d.time_of_day.includes(band) ? 'true' : 'false'}
                  @click=${() => this._change({
                    time_of_day: d.time_of_day.includes(band) ? d.time_of_day.filter(b => b !== band) : [...d.time_of_day, band],
                  })}>${label}</button>
              `)}
            </div>
          </div>
        </div>
      </div>
      ${whenText(d) ? html`<p class="hint">${whenText(d)}</p>` : nothing}
    `;
  }

  private _renderEstimate(board: Board, label: string) {
    const d = this._draft;
    const members = inOrder(this.household?.members ?? []);
    const other = this._otherEstimate || !ESTIMATES.includes(d.estimate);
    return html`
      <h2 class="section-label">How long</h2>
      <div class="group">
        <div class="row">
          <div class="stack">
            <span>${label}</span>
            <div class="chips" role="group" aria-label=${label}>
              ${ESTIMATES.map(minutes => html`
                <button class="chip chip--plain" type="button" aria-pressed=${!other && d.estimate === minutes ? 'true' : 'false'}
                  @click=${() => { this._otherEstimate = false; this._change({ estimate: minutes }); }}>${durationText(minutes)}</button>
              `)}
              <button class="chip chip--plain" type="button" aria-pressed=${other ? 'true' : 'false'}
                @click=${() => { this._otherEstimate = true; }}>Other…</button>
            </div>
            ${other ? html`
              <label class="row" style="padding: 0">
                <span class="row-text">Minutes</span>
                <input class="pv-input other" type="number" min="1" max="1440" inputmode="numeric" .value=${String(d.estimate)}
                  @input=${(e: Event) => this._change({ estimate: Math.max(0, Math.round(Number((e.target as HTMLInputElement).value) || 0)) })} />
              </label>
            ` : nothing}
          </div>
        </div>
      </div>
      <p class="hint">${worthText(d, board.settings, members)}</p>
    `;
  }

  private _renderOnce(board: Board) {
    const d = this._draft;
    return html`
      <h2 class="section-label">When</h2>
      <div class="group">
        <div class="row">
          <div class="pv-seg stretch" role="group" aria-label="When">
            ${(['on', 'by', 'any'] as const).map(when => html`
              <button type="button" aria-pressed=${d.once_when === when ? 'true' : 'false'} @click=${() => this._change({ once_when: when })}>
                ${when === 'on' ? 'On a day' : when === 'by' ? 'By a date' : 'Any time'}
              </button>
            `)}
          </div>
        </div>
        ${d.once_when !== 'any' ? html`
          <label class="row">
            <span class="row-text">Date</span>
            <input class="pv-input" type="date" min=${board.today} .value=${d.date}
              @change=${(e: Event) => this._change({ date: (e.target as HTMLInputElement).value })} />
          </label>
        ` : nothing}
        ${d.once_when === 'by' ? html`
          <label class="row">
            <span class="row-text">By<span class="row-sub">Leave it empty for the end of the day.</span></span>
            <input class="pv-input" type="time" .value=${d.by_time ?? ''}
              @change=${(e: Event) => this._change({ by_time: (e.target as HTMLInputElement).value || null })} />
          </label>
        ` : nothing}
        <div class="row">
          <span class="row-text">Sessions</span>
          ${this._counter(d.sessions, sessions => this._change({ sessions }), 'sessions', String(d.sessions), 1, 20)}
        </div>
      </div>
      <p class="hint">${onceText(d, board.today)}</p>
      ${this._renderEstimate(board, 'About how long, in all')}
    `;
  }

  private _renderRepeats(board: Board) {
    const d = this._draft;
    const freq = d.recurrence.freq;
    return html`
      <h2 class="section-label">Repeats</h2>
      <pv-recurrence-picker .value=${d.recurrence}
        @pv-recurrence-change=${(e: CustomEvent) => this._change({ recurrence: e.detail })}></pv-recurrence-picker>
      ${freq !== 'DAILY' ? html`
        <h2 class="section-label">Each time</h2>
        <div class="pv-seg stretch" role="group" aria-label="Each time">
          <button type="button" aria-pressed=${d.window === 'day' ? 'true' : 'false'} @click=${() => this._change({ window: 'day' })}>On the day</button>
          <button type="button" aria-pressed=${d.window === 'period' ? 'true' : 'false'} @click=${() => this._change({ window: 'period' })}>
            ${freq === 'MONTHLY' ? 'Any time that month' : 'Any time that week'}
          </button>
        </div>
        <p class="hint">${d.window === 'day' ? windowText(board.settings.missed) : 'It waits under This week on the board until it\'s done.'}</p>
      ` : nothing}
      ${this._renderEstimate(board, 'About how long')}
    `;
  }

  private _toggle(on: boolean, label: string, set: () => void, sub?: string) {
    return html`
      <div class="row toggle-row">
        <span class="row-text">
          <span>${label}</span>
          ${sub ? html`<span class="row-sub">${sub}</span>` : nothing}
        </span>
        <div class="pv-toggle ${on ? 'active' : ''}" role="switch" tabindex="0" aria-checked=${on ? 'true' : 'false'}
          aria-label=${label} @click=${set}
          @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); set(); } }}></div>
      </div>
    `;
  }

  private _renderBoard(board: Board, members: Member[]) {
    const d = this._draft;
    const ok = d.needs_ok || d.needs_ok_always;
    const automatic = checkoffStars({ ...asActivity(d), stars: null }, board.settings.minutes_per_star);
    return html`
      <h2 class="section-label">On the board</h2>
      <div class="group">
        ${d.schedule === 'plan'
          ? this._toggle(d.on_board, 'Show on the board', () => this._change({ on_board: !d.on_board }),
            d.on_board ? undefined : 'Plan only: part of the household plan, but not checked off.')
          : nothing}
        ${this._toggle(ok, "Needs a parent's OK", () => this._change(ok ? { needs_ok: false, needs_ok_always: false } : { needs_ok: true }),
          okText(d, members) || undefined)}
        <div class="row">
          <span class="row-text">Stars<span class="row-sub">${d.stars === null ? `★ ${automatic} each, from the time` : `★ ${d.stars} each`}</span></span>
          <div class="pv-seg stretch" role="group" aria-label="Stars" style="flex: 0 1 260px">
            <button type="button" aria-pressed=${d.stars === null ? 'true' : 'false'} @click=${() => this._change({ stars: null })}>Automatic</button>
            <button type="button" aria-pressed=${d.stars !== null ? 'true' : 'false'}
              @click=${() => this._change({ stars: d.stars ?? automatic })}>Set</button>
          </div>
        </div>
        ${d.stars !== null ? html`
          <div class="row">
            <span class="row-text">Stars each check-off</span>
            ${this._counter(d.stars, stars => this._change({ stars }), 'stars', `★ ${d.stars}`, 0, 100)}
          </div>
        ` : nothing}
        <label class="row">
          <span class="row-text">Category</span>
          <select class="pv-input pv-select" .value=${d.category}
            @change=${(e: Event) => this._change({ category: (e.target as HTMLSelectElement).value })}>
            ${CATEGORIES.map(c => html`<option value=${c.id} ?selected=${d.category === c.id}>${c.label}</option>`)}
          </select>
        </label>
      </div>
    `;
  }

  private _renderAutomations(activity: Activity, members: Member[]) {
    const owner = members.find(m => activity.assignees.includes(m.id));
    const example = automationExample(activity.id, owner?.id);
    const todo = owner ? memberEntities(this.hass?.states, owner)[0].entity_id : null;
    return html`
      <h2 class="section-label">Use in automations</h2>
      <div class="group">
        <div class="row">
          <span class="row-text">Chore ID<code>${activity.id}</code></span>
          <button class="pv-btn pv-btn-secondary copy" type="button" @click=${() => this._copy(activity.id, 'id')}>
            ${this._copied === 'id' ? 'Copied' : 'Copy'}</button>
        </div>
        <div class="row">
          <div class="stack">
            <pre>${example}</pre>
            <button class="pv-btn pv-btn-secondary copy" type="button" @click=${() => this._copy(example, 'yaml')}>
              ${this._copied === 'yaml' ? 'Copied' : 'Copy'}</button>
          </div>
        </div>
      </div>
      <p class="hint">${todo ? `Or check it off on ${todo}. ` : ''}The ID stays the same even if the chore is renamed.</p>
    `;
  }

  private async _copy(text: string, what: string): Promise<void> {
    if (await copyText(text)) {
      this._copied = what;
      window.setTimeout(() => { if (this._copied === what) this._copied = ''; }, 2000);
    } else {
      this._error("Couldn't copy. Select the text and copy it instead.");
    }
  }

  private _renderNotice() {
    if (!this._notice) return nothing;
    if (this._notice === 'discard') {
      return html`
        <pv-notice-sheet .layout=${this.layout} heading="Discard changes?"
          .actions=${[{ id: 'discard', label: 'Discard changes', kind: 'destructive' }, { id: 'keep', label: 'Keep editing', kind: 'secondary' }]}
          @pv-sheet-action=${this._onDiscardChoice}></pv-notice-sheet>
      `;
    }
    if (this._notice === 'delete' && this._activity) {
      return html`
        <pv-notice-sheet .layout=${this.layout} heading="Delete ${this._activity.name}?"
          body="It leaves the board at once. Past weeks still show what was done, and stars stay earned."
          .actions=${[{ id: 'delete', label: `Delete ${this._activity.name}`, kind: 'destructive' }, { id: 'cancel', label: 'Cancel', kind: 'secondary' }]}
          @pv-sheet-action=${this._onDeleteChoice}></pv-notice-sheet>
      `;
    }
    return html`
      <pv-notice-sheet .layout=${this.layout} heading="This changed on another screen."
        .actions=${[{ id: 'keep', label: 'Keep editing', kind: 'secondary' }, { id: 'load', label: 'Load the new version', kind: 'primary' }]}
        @pv-sheet-action=${this._onChangedChoice}></pv-notice-sheet>
    `;
  }

  private _change(patch: Partial<ChoreDraft>): void {
    const draft = { ...this._draft, ...patch };
    this._record = { ...this._record, draft };
    this._problem = '';
    this.drafts.set(this._draftKey, this._record);
  }

  private _setMinutes(minutes: number): void {
    const d = this._draft;
    const shares = d.split === 'shared' && d.assignees.length > 1 ? evenShares(d.assignees, minutes) : d.shares;
    this._change({ minutes, shares });
  }

  private _toggleMember(id: string): void {
    const d = this._draft;
    const members = inOrder(this.household?.members ?? []).map(m => m.id);
    const assignees = members.filter(m => (m === id ? !d.assignees.includes(id) : d.assignees.includes(m)));
    this._change({ assignees, shares: d.split === 'shared' ? evenShares(assignees, d.minutes) : d.shares });
  }

  private _pop(): void {
    this.dispatchEvent(new CustomEvent(POP_PAGE, { bubbles: true, composed: true }));
  }

  private _error(message: string): void {
    this.dispatchEvent(new CustomEvent(PAGE_ERROR, { detail: { message }, bubbles: true, composed: true }));
  }

  private _cancel(): void {
    if (isDirty(this._record)) {
      this._notice = 'discard';
      return;
    }
    this._pop();
  }

  private async _save(): Promise<void> {
    const board = this._board;
    const chores = this._chores;
    if (!board || !chores) return;
    const startDate = this._activity?.once?.on ?? this._activity?.once?.by ?? null;
    const problem = choreProblem(this._draft, board.today, startDate);
    if (problem) {
      this._problem = problem;
      return;
    }
    if (this._choreId !== null && !this._activity) {
      this._problem = 'This chore was deleted on another screen.';
      return;
    }
    this._saving = true;
    try {
      const existing = this._choreId !== null && this._record.rev !== null ? { id: this._choreId, rev: this._record.rev } : undefined;
      await chores.api.saveActivity(choreChanges(this._record), existing);
      this.drafts.delete(this._draftKey);
      this._record = { ...this._record, start: this._record.draft };
      this._pop();
    } catch (err) {
      if (errorCode(err) === 'changed') this._notice = 'changed';
      else this._problem = errorMessage(err) ?? "Couldn't save. Check the connection and try again.";
    } finally {
      this._saving = false;
    }
  }

  private _onDiscardChoice(event: CustomEvent<{ id: string }>): void {
    event.stopPropagation();
    this._notice = null;
    const discard = event.detail.id === 'discard';
    if (discard) {
      this.drafts.delete(this._draftKey);
      this._record = { ...this._record, draft: this._record.start };
    }
    if (this._leave) {
      const leave = this._leave;
      this._leave = undefined;
      leave(discard);
    } else if (discard) {
      this._pop();
    }
  }

  private async _onDeleteChoice(event: CustomEvent<{ id: string }>): Promise<void> {
    event.stopPropagation();
    this._notice = null;
    const activity = this._activity;
    if (event.detail.id !== 'delete' || !activity || !this._chores) return;
    try {
      await this._chores.api.deleteActivity(activity.id);
      this.drafts.delete(this._draftKey);
      this._record = { ...this._record, start: this._record.draft };
      this._pop();
    } catch (err) {
      this._problem = errorMessage(err) ?? "Couldn't delete. Check the connection and try again.";
    }
  }

  private _onChangedChoice(event: CustomEvent<{ id: string }>): void {
    event.stopPropagation();
    this._notice = null;
    const activity = this._activity;
    const board = this._board;
    if (!activity || !board) return;
    if (event.detail.id === 'load') {
      this._record = beginChoreDraft(activity, board.today);
      this.drafts.delete(this._draftKey);
    } else {
      this._record = rebaseChore(this._record, activity, board.today);
      this.drafts.set(this._draftKey, this._record);
    }
  }
}

defineElement('pv-chore-editor', PvChoreEditor);
