import { html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../utils/define';
import { baseStyles, buttonStyles, formStyles } from '../../styles/shared';
import { segmentedStyles } from '../../styles/controls';
import type { HouseholdView } from '../../core/household';
import type { HouseholdApi } from '../../core/household-client';
import type { Layout } from '../../core/layout';
import type { PlanaVistaData } from '../../types';
import type { Session } from '../../core/session';
import { mayChangeKiosk } from '../../core/kiosk';
import {
  SCREEN_DOMAINS, type ScreenEntities, type Trial, type TrialSeason, type TrialTime, entityChoices, motionCandidate, nightText, nightWindow,
} from '../../core/screensaver';
import { DIM_DEFAULT, DIM_PREVIEW_EVENT, DIM_PREVIEW_MS, type DimPreview } from '../../core/dimming';
import { helpBox, helpLabel, helpStyles } from '../../core/help';
import { screensaver } from '../screensaver-controller';
import { SettingRowsPage } from './setting-rows';
import '../../core/pv-time-field';

/**
 * pv-settings-screens: Shared screens (0.12.0, spec 3.6). Whether this screen
 * is a shared family screen; for shared screens, their night, Kiosk mode and
 * its Top bar (milestone 9), the screensaver with Try it (milestone 11), and
 * how bright they are by day and at night. Every setting has its ?.
 */
const TOP_BAR_CHOICES = [
  { value: 'hidden', label: 'Hidden', spoken: 'Hidden' },
  { value: 'tabs', label: 'Tabs only', spoken: 'Tabs only' },
] as const;
const AFTER_CHOICES = [
  { value: 1, label: '1 min', spoken: '1 minute' },
  { value: 2, label: '2 min', spoken: '2 minutes' },
  { value: 5, label: '5 min', spoken: '5 minutes' },
  { value: 10, label: '10 min', spoken: '10 minutes' },
  { value: 15, label: '15 min', spoken: '15 minutes' },
  { value: 30, label: '30 min', spoken: '30 minutes' },
] as const;
/** The waits offered: five fit a phone's Settings in one row; a household that chose 15 minutes keeps it shown. */
const OFFERED_AFTER = [1, 2, 5, 10, 30];
const DAY_CHOICES = [100, 85, 70].map(v => ({ value: v, label: `${v}%`, spoken: `${v} percent` }));
const NIGHT_CHOICES = [100, 50, 30, 15, 8].map(v => ({ value: v, label: `${v}%`, spoken: v === 100 ? '100 percent, no dimming' : `${v} percent` }));
const TRY_TIMES: Array<{ value: TrialTime | 'now'; label: string; spoken: string }> = [
  { value: 'now', label: 'Now', spoken: 'Now' },
  { value: 'morning', label: 'Morning', spoken: 'Morning' },
  { value: 'afternoon', label: 'Afternoon', spoken: 'Afternoon' },
  { value: 'evening', label: 'Evening', spoken: 'Evening' },
  { value: 'night', label: 'Night', spoken: 'Night' },
];
const TRY_WEATHER: Array<{ value: string; label: string; spoken: string }> = [
  { value: 'now', label: 'Now', spoken: 'Now' },
  { value: 'sunny', label: 'Clear', spoken: 'Clear' },
  { value: 'rainy', label: 'Rain', spoken: 'Rain' },
  { value: 'snowy', label: 'Snow', spoken: 'Snow' },
  { value: 'lightning-rainy', label: 'Storm', spoken: 'Storm' },
  { value: 'windy', label: 'Windy', spoken: 'Windy' },
  { value: 'after_rain', label: 'After the rain', spoken: 'After the rain' },
];
const TRY_SEASONS: Array<{ value: TrialSeason | 'now'; label: string; spoken: string }> = [
  { value: 'now', label: 'Now', spoken: 'Now' },
  { value: 'spring', label: 'Spring', spoken: 'Spring' },
  { value: 'summer', label: 'Summer', spoken: 'Summer' },
  { value: 'autumn', label: 'Autumn', spoken: 'Autumn' },
  { value: 'winter', label: 'Winter', spoken: 'Winter' },
];

/** Try it's picks as the screensaver takes them: Now leaves that part as it is. */
export function trialOf(time: string, weather: string, season: string): Trial | null {
  const trial: Trial = {};
  if (time !== 'now') trial.time = time as TrialTime;
  if (weather !== 'now') trial.weather = weather;
  if (season !== 'now') trial.season = season as TrialSeason;
  return Object.keys(trial).length ? trial : null;
}

export class PvSettingsScreens extends SettingRowsPage {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlanaVistaData;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ attribute: false }) api!: HouseholdApi;
  @property({ type: String }) layout: Layout = 'landscape';
  @property({ type: String }) mode: 'settings' | 'setup' = 'settings';
  /** The card's PIN session: whether its parent may change kiosk mode (milestone 9). */
  @property({ attribute: false }) session: Session | null = null;

  /** Why night's own times were turned back, shown beside them. */
  @state() private _nightProblem = '';
  @state() private _tryTime = 'now';
  @state() private _tryWeather = 'now';
  @state() private _trySeason = 'now';

  static styles = [
    baseStyles,
    buttonStyles,
    formStyles,
    segmentedStyles,
    helpStyles,
    css`
      :host {
        display: block;
        max-width: 640px;
      }

      section {
        margin: 0 0 28px;
      }

      h2 {
        margin: 0 0 10px;
        font-size: 0.8125rem;
        font-weight: 750;
        color: var(--pv-text-secondary, #5F6670);
      }

      .toggle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        min-height: 48px;
      }

      .label {
        font-weight: 600;
      }

      .hint {
        margin: 6px 0 0;
        font-size: 0.875rem;
        color: var(--pv-text-secondary, #6B7280);
        line-height: 1.5;
      }

      .note {
        margin: 12px 0 0;
        padding: 12px 14px;
        border-radius: 12px;
        background: color-mix(in srgb, #F59E0B 14%, transparent);
        line-height: 1.5;
      }

      .message {
        margin: 8px 0 0;
        color: var(--pv-danger, #DC2626);
      }

      .choice-row,
      .saver-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 8px 12px;
        min-height: 48px;
        margin-top: 12px;
      }

      .saver-row .times {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .screen,
      .try {
        margin-top: 16px;
        padding-top: 12px;
        border-top: 1px solid var(--pv-border, #E5E7EB);
      }

      .screen h3,
      .try h3 {
        margin: 0 0 4px;
        font-size: 1rem;
      }

      .screen select {
        min-height: 44px;
        max-width: 100%;
      }

      /* Try it's picks scroll sideways on a phone rather than wrap a word at a time. */
      .try .pv-seg {
        overflow-x: auto;
        scrollbar-width: none;
      }

      .try .pv-seg::-webkit-scrollbar {
        display: none;
      }

      .try .label {
        font-weight: 600;
        color: var(--pv-text-secondary, #5F6670);
      }

      .try .actions {
        margin-top: 12px;
      }
    `,
  ];

  render() {
    const household = this.household;
    if (!household) return nothing;
    const account = household.account;
    const sharedScreens = household.security.shared_screens > 0;
    const kiosk = household.security.kiosk ?? { enabled: false, top_bar: 'hidden' as const };
    const mayChange = mayChangeKiosk(account, this.session);
    return html`
      <section>
        <h2>This screen</h2>
        ${this._switch('Shared family screen', 'shared-label', account.shared, this._toggleShared, 'shared_screen')}
        ${this._message ? html`<p class="message" role="alert">${this._message}</p>` : nothing}
        ${account.is_admin ? html`
          <p class="note">
            This screen is signed in with an admin account. A non-admin account is safer for a
            shared screen, because anyone here can reach Home Assistant's own settings.
            <a href="https://www.home-assistant.io/docs/authentication/" target="_blank" rel="noopener noreferrer">How to set one up</a>
          </p>
        ` : nothing}
      </section>

      ${sharedScreens ? html`
        ${this._night(household)}

        <section>
          <h2>Kiosk mode</h2>
          ${this._switch('Kiosk mode', 'kiosk-label', kiosk.enabled, this._toggleKiosk, 'kiosk', !mayChange)}
          ${mayChange ? nothing : html`<p class="hint">Only a Home Assistant admin, or a parent who is one, can change kiosk mode.</p>`}
          ${kiosk.enabled ? this._choices('Top bar', 'top-bar-label', TOP_BAR_CHOICES, kiosk.top_bar,
            value => this.api.saveSecurity({ kiosk_top_bar: value }), 'kiosk_top_bar', !mayChange) : nothing}
        </section>

        ${this._screensaver(household)}
        ${this._dimming(household)}
      ` : html`<p class="hint">Mark this screen as a shared family screen to set up kiosk mode, the screensaver, and dimming.</p>`}
    `;
  }

  /** Night: the screensaver's and dimming's (spec D4), from Sleep times or its own. */
  private _night(household: HouseholdView) {
    const saver = household.security.screensaver;
    if (!saver) return nothing;
    const format = this.data?.display?.time_format === '24h' ? '24h' : '12h';
    const tonight = nightWindow(household.members, saver.night, new Date());
    return html`
      <section>
        <h2>Night</h2>
        <div class="saver-row">
          ${helpLabel(this._help, 'night', 'Night', 'night-label')}
          ${saver.night ? html`
            <span class="times">
              <pv-time-field .format=${format} .value=${saver.night.from} aria-label="Night starts"
                @change=${(e: Event) => this._nightPart('from', e.target as HTMLInputElement)}></pv-time-field>
              <span>to</span>
              <pv-time-field .format=${format} .value=${saver.night.to} aria-label="Night ends"
                @change=${(e: Event) => this._nightPart('to', e.target as HTMLInputElement)}></pv-time-field>
            </span>
          ` : html`<span>${nightText(tonight, format)}</span>`}
        </div>
        ${helpBox(this._help, 'night')}
        ${this._nightProblem ? html`<p class="message" role="alert">${this._nightProblem}</p>` : nothing}
        <p class="hint">
          ${saver.night ? 'Night runs at these times.' : tonight.source === 'sleep'
            ? 'From the latest bedtime to the earliest wake-up in Sleep times.'
            : 'Nobody has a bedtime in Sleep times yet, so night runs at these times.'}
        </p>
        <button class="pv-btn pv-btn-secondary" type="button" ?disabled=${this._busy}
          @click=${() => this._setNight(saver.night ? null : { from: '22:00', to: '06:30' })}>${saver.night ? 'From Sleep times' : 'Set its own times'}</button>
      </section>
    `;
  }

  /** The screensaver (milestone 11) and Try it (0.12.0). */
  private _screensaver(household: HouseholdView) {
    const saver = household.security.screensaver;
    if (!saver) return nothing;
    return html`
      <section>
        <h2>Screensaver</h2>
        ${this._switch('Screensaver', 'saver-label', saver.enabled, this._toggleSaver, 'screensaver')}
        ${saver.enabled ? html`
          ${this._choices('Comes on after', 'saver-after-label',
            AFTER_CHOICES.filter(c => OFFERED_AFTER.includes(c.value) || c.value === saver.after_minutes), saver.after_minutes as 1 | 2 | 5 | 10 | 15 | 30,
            value => this.api.saveSecurity({ screensaver_after: value }), 'screensaver_after')}
          ${saver.screens.map(screen => this._screenRow(screen))}
          ${this._try()}
        ` : nothing}
      </section>
    `;
  }

  private _screenRow(screen: ScreenEntities) {
    const options = (fits: (s: { entity_id: string; attributes: Record<string, unknown> }) => boolean, current: string | null) =>
      entityChoices(this.hass?.states ?? {}, fits, current);
    const pick = (field: 'screen' | 'motion', value: string) =>
      void this._run(() => this.api.saveSecurity({ screensaver_screen: { user: screen.user_id, [field]: value || null } }));
    return html`
      <div class="screen">
        <h3>${screen.name ?? 'A shared screen'}</h3>
        <div class="saver-row">
          ${helpLabel(this._help, 'screensaver_screen', 'Screen', `screen-label-${screen.user_id}`, screen.user_id)}
          <select id=${`screen-${screen.user_id}`} class="pv-input pv-select" ?disabled=${this._busy}
            aria-labelledby=${`screen-label-${screen.user_id}`}
            @change=${(e: Event) => pick('screen', (e.target as HTMLSelectElement).value)}>
            <option value="" ?selected=${!screen.screen}>None</option>
            ${options(s => (SCREEN_DOMAINS as readonly string[]).includes(s.entity_id.split('.', 1)[0]), screen.screen).map(s => html`<option value=${s.id} ?selected=${s.id === screen.screen}>${s.name}</option>`)}
          </select>
        </div>
        ${helpBox(this._help, 'screensaver_screen', screen.user_id)}
        <div class="saver-row">
          ${helpLabel(this._help, 'screensaver_motion', 'Motion', `motion-label-${screen.user_id}`, screen.user_id)}
          <select id=${`motion-${screen.user_id}`} class="pv-input pv-select" ?disabled=${this._busy}
            aria-labelledby=${`motion-label-${screen.user_id}`}
            @change=${(e: Event) => pick('motion', (e.target as HTMLSelectElement).value)}>
            <option value="" ?selected=${!screen.motion}>None</option>
            ${options(s => motionCandidate(s.entity_id, s.attributes), screen.motion).map(s => html`<option value=${s.id} ?selected=${s.id === screen.motion}>${s.name}</option>`)}
          </select>
        </div>
        ${helpBox(this._help, 'screensaver_motion', screen.user_id)}
      </div>
    `;
  }

  /** Try it: Time, Weather, Season, then Show it now. Picks are this page's own; nothing is saved. */
  private _try() {
    const pickRow = (label: string, id: string, choices: Array<{ value: string; label: string; spoken: string }>, chosen: string,
      set: (value: string) => void) => html`
      <div class="choice-row">
        <span class="label" id=${id}>${label}</span>
        <div class="pv-seg" role="radiogroup" aria-labelledby=${id}>
          ${choices.map(choice => html`
            <button type="button" role="radio" aria-label=${choice.spoken} aria-checked=${choice.value === chosen ? 'true' : 'false'}
              @click=${() => set(choice.value)}>${choice.label}</button>
          `)}
        </div>
      </div>
    `;
    return html`
      <div class="try">
        <h3>${helpLabel(this._help, 'screensaver_try', 'Try it', 'try-label')}</h3>
        ${helpBox(this._help, 'screensaver_try')}
        ${pickRow('Time', 'try-time', TRY_TIMES, this._tryTime, v => { this._tryTime = v; })}
        ${pickRow('Weather', 'try-weather', TRY_WEATHER, this._tryWeather, v => { this._tryWeather = v; })}
        ${pickRow('Season', 'try-season', TRY_SEASONS, this._trySeason, v => { this._trySeason = v; })}
        <div class="actions">
          <button class="pv-btn pv-btn-secondary" type="button"
            @click=${() => screensaver.preview(new Date(), trialOf(this._tryTime, this._tryWeather, this._trySeason))}>Show it now</button>
        </div>
      </div>
    `;
  }

  /** Dimming (0.12.0): tapping a level saves it and shows it on this screen for a moment. */
  private _dimming(household: HouseholdView) {
    const saver = household.security.screensaver;
    if (!saver) return nothing;
    const dim = saver.dim ?? DIM_DEFAULT;
    return html`
      <section @click=${this._previewPick}>
        <h2>Dimming</h2>
        <div data-dim="day">
          ${this._choices('Brightness by day', 'dim-day-label', DAY_CHOICES, dim.day,
            value => this.api.saveSecurity({ dim_day: value }), 'dim_day')}
        </div>
        <div data-dim="night">
          ${this._choices('Brightness at night', 'dim-night-label', NIGHT_CHOICES, dim.night,
            value => this.api.saveSecurity({ dim_night: value }), 'dim_night')}
        </div>
      </section>
    `;
  }

  /** A tap on a level, chosen already or not, shows it here for a few seconds. */
  private _previewPick = (e: Event): void => {
    const button = (e.target as HTMLElement).closest<HTMLElement>('[data-dim] [data-value]');
    if (!button) return;
    const detail: DimPreview = { level: Number(button.dataset.value) / 100, ms: DIM_PREVIEW_MS };
    this.dispatchEvent(new CustomEvent(DIM_PREVIEW_EVENT, { detail, bubbles: true, composed: true }));
  };

  private _toggleShared = (): void => {
    if (!this.household) return;
    void this._run(() => this.api.setSharedScreen(!this.household!.account.shared));
  };

  private _toggleKiosk = (): void => {
    const kiosk = this.household?.security.kiosk;
    if (!this.household) return;
    void this._run(() => this.api.saveSecurity({ kiosk_enabled: !kiosk?.enabled }));
  };

  private _toggleSaver = (): void => {
    const saver = this.household?.security.screensaver;
    if (!saver) return;
    void this._run(() => this.api.saveSecurity({ screensaver_enabled: !saver.enabled }));
  };

  /** One end of night's own times changed; a night that would start when it ends goes back, saying why there. */
  private _nightPart(part: 'from' | 'to', field: HTMLInputElement): void {
    const night = this.household?.security.screensaver?.night;
    if (!night) return;
    const next = { ...night, [part]: field.value };
    if (next.from === next.to) {
      field.value = night[part];
      this._nightProblem = 'Night needs a start and an end that differ.';
      return;
    }
    this._nightProblem = '';
    this._setNight(next);
  }

  private _setNight(night: { from: string; to: string } | null): void {
    if (night && (!night.from || !night.to)) return;
    void this._run(() => this.api.saveSecurity({ screensaver_night: night }));
  }
}

defineElement('pv-settings-screens', PvSettingsScreens);
