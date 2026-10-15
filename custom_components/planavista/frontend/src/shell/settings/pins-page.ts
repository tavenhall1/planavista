import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../utils/define';
import { baseStyles, buttonStyles, formStyles } from '../../styles/shared';
import { segmentedStyles } from '../../styles/controls';
import { HouseholdView, inOrder } from '../../core/household';
import { HouseholdApi, errorCode } from '../../core/household-client';
import type { Layout } from '../../core/layout';
import { saveErrorMessage } from '../../core/page-host';
import type { PlanaVistaData } from '../../types';
import type { Session } from '../../core/session';
import { mayChangeKiosk } from '../../core/kiosk';
import {
  SCREEN_DOMAINS, type ScreenEntities, entityChoices, motionCandidate, nightText, nightWindow,
} from '../../core/screensaver';
import { screensaver } from '../screensaver-controller';
import '../../core/pv-time-field';
import '../../core/pv-member-avatar';
import './pin-actions';

/**
 * pv-settings-pins: PINs and parent mode (spec 14.5). Whether this screen is
 * a shared family screen, everyone's PIN, Shuffle the keypad, and how long a
 * PIN's session lasts (milestone 8, D3: like a phone's Auto-Lock, with no
 * Never). Once a shared screen exists, Kiosk mode and its Top bar
 * (milestone 9).
 */
const IDLE_CHOICES = [
  { value: 30, label: '30 sec', spoken: '30 seconds' },
  { value: 60, label: '1 min', spoken: '1 minute' },
  { value: 120, label: '2 min', spoken: '2 minutes' },
  { value: 300, label: '5 min', spoken: '5 minutes' },
] as const;
const TOP_BAR_CHOICES = [
  { value: 'hidden', label: 'Hidden', spoken: 'Hidden' },
  { value: 'tabs', label: 'Tabs only', spoken: 'Tabs only' },
] as const;
const AFTER_CHOICES = [
  { value: 2, label: '2 min', spoken: '2 minutes' },
  { value: 5, label: '5 min', spoken: '5 minutes' },
  { value: 10, label: '10 min', spoken: '10 minutes' },
  { value: 15, label: '15 min', spoken: '15 minutes' },
  { value: 30, label: '30 min', spoken: '30 minutes' },
] as const;
const CAP_CHOICES = [
  { value: 5, label: '5 min', spoken: '5 minutes' },
  { value: 10, label: '10 min', spoken: '10 minutes' },
  { value: 15, label: '15 min', spoken: '15 minutes' },
  { value: 30, label: '30 min', spoken: '30 minutes' },
] as const;

export class PvSettingsPins extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlanaVistaData;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ attribute: false }) api!: HouseholdApi;
  @property({ type: String }) layout: Layout = 'landscape';
  @property({ type: String }) mode: 'settings' | 'setup' = 'settings';
  /** The card's PIN session: whether its parent may change kiosk mode (milestone 9). */
  @property({ attribute: false }) session: Session | null = null;

  @state() private _message = '';
  @state() private _busy = false;
  /** Why night's own times were turned back, shown beside them. */
  @state() private _nightProblem = '';

  static styles = [
    baseStyles,
    buttonStyles,
    formStyles,
    segmentedStyles,
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

      .person {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 0;
        border-bottom: 1px solid var(--pv-border-subtle, #E5E7EB);
      }

      .person .name {
        width: 120px;
        flex-shrink: 0;
        font-weight: 600;
      }

      .person pv-pin-actions {
        flex: 1;
        min-width: 0;
      }

      .choice-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 8px 12px;
        min-height: 48px;
        margin-top: 16px;
      }

      .choice-row:first-of-type {
        margin-top: 0;
      }

      /* The screensaver's night and each shared screen's entities (milestone 11). */
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

      .screen {
        margin-top: 16px;
        padding-top: 12px;
        border-top: 1px solid var(--pv-border, #E5E7EB);
      }

      .screen h3 {
        margin: 0 0 4px;
        font-size: 1rem;
      }

      .screen select {
        min-height: 44px;
        max-width: 100%;
      }

      .rule {
        font-size: 0.875rem;
        color: var(--pv-text-secondary, #6B7280);
        line-height: 1.6;
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
        ${this._switch('Shared family screen', 'shared-label', account.shared, this._toggleShared)}
        <p class="hint">Yes, the whole family uses it. Settings asks for a parent's PIN.</p>
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
        <section>
          <h2>Shared screens</h2>
          ${this._switch('Kiosk mode', 'kiosk-label', kiosk.enabled, this._toggleKiosk, !mayChange)}
          <p class="hint">
            On shared family screens, PlanaVista hides Home Assistant's menus so the screen stays on
            PlanaVista. A parent who is a Home Assistant admin can exit it in parent mode, and it comes
            back when parent mode ends. It tidies the screen, but it isn't a lock: for that, use
            Guided Access on an iPad or a kiosk browser on Android.
          </p>
          ${mayChange ? nothing : html`<p class="hint">Only a Home Assistant admin, or a parent who is one, can change kiosk mode.</p>`}
          ${kiosk.enabled ? this._choices('Top bar', 'top-bar-label', TOP_BAR_CHOICES, kiosk.top_bar,
            value => this.api.saveSecurity({ kiosk_top_bar: value }), !mayChange) : nothing}
          ${kiosk.enabled ? html`
            <p class="hint">Hidden: PlanaVista fills the screen. Tabs only: the dashboard's tabs stay, for other screens the family uses.</p>
          ` : nothing}
          ${this._screensaver(household)}
        </section>
      ` : nothing}

      <section>
        <h2>PINs</h2>
        ${inOrder(household.members).map(member => html`
          <div class="person">
            <pv-member-avatar .member=${member} .hass=${this.hass} size="32"></pv-member-avatar>
            <span class="name">${member.name}</span>
            <pv-pin-actions
              .hass=${this.hass}
              .api=${this.api}
              .layout=${this.layout}
              .member=${member}
              .shuffle=${household.security.shuffle_keypad}
              .sharedScreens=${sharedScreens}
            ></pv-pin-actions>
          </div>
        `)}
      </section>

      <section>
        ${this._switch('Shuffle the keypad', 'shuffle-label', household.security.shuffle_keypad, this._toggleShuffle)}
        <p class="hint">The numbers move each time, so smudges and glances don't give a PIN away.</p>
      </section>

      <section>
        ${this._choices('Lock after no touches', 'idle-label', IDLE_CHOICES, household.security.session_idle_seconds ?? 120,
          value => this.api.saveSecurity({ session_idle_seconds: value }))}
        <p class="hint">After a PIN, the screen locks again once nobody has touched it this long.</p>
        ${this._choices('Parent mode ends after', 'cap-label', CAP_CHOICES, household.security.parent_mode_minutes ?? 10,
          value => this.api.saveSecurity({ parent_mode_minutes: value }))}
        <p class="hint">However busy the screen is, parent mode and a child's unlocked time end this long after the PIN.</p>
      </section>

      <p class="rule">
        After 5 wrong tries, a PIN pauses for 30 seconds, and each pause after that is twice as
        long, up to 15 minutes. A parent can clear a pause here. Forgot every parent's PIN? Sign in
        to Home Assistant with a parent's or an admin's own account and set new ones here.
      </p>
    `;
  }

  /** The screensaver (milestone 11, spec 3.4): beside kiosk mode, for shared screens. */
  private _screensaver(household: HouseholdView) {
    const saver = household.security.screensaver;
    if (!saver) return nothing;
    const format = this.data?.display?.time_format === '24h' ? '24h' : '12h';
    const tonight = nightWindow(household.members, saver.night, new Date());
    return html`
      ${this._switch('Screensaver', 'saver-label', saver.enabled, this._toggleSaver)}
      <p class="hint">When nobody has touched a shared screen for a while, it shows the sky, the time, and today. A touch wakes it.</p>
      ${saver.enabled ? html`
        ${this._choices('Comes on after', 'saver-after-label', AFTER_CHOICES, saver.after_minutes as 2 | 5 | 10 | 15 | 30,
          value => this.api.saveSecurity({ screensaver_after: value }))}
        <div class="saver-row">
          <span class="label">Night</span>
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
        ${this._nightProblem ? html`<p class="message" role="alert">${this._nightProblem}</p>` : nothing}
        <p class="hint">
          ${saver.night ? 'Night runs at these times.' : tonight.source === 'sleep'
            ? 'From the latest bedtime to the earliest wake-up in Sleep times.'
            : 'Nobody has a bedtime in Sleep times yet, so night runs at these times.'}
          At night the sky goes dark and only the time shows.
        </p>
        <button class="pv-btn pv-btn-secondary" type="button" ?disabled=${this._busy}
          @click=${() => this._night(saver.night ? null : { from: '22:00', to: '06:30' })}>${saver.night ? 'From Sleep times' : 'Set its own times'}</button>
        ${saver.screens.map(screen => this._screenRow(screen))}
        <div class="saver-row">
          <button class="pv-btn pv-btn-secondary" type="button" @click=${() => screensaver.preview(new Date())}>Show it now</button>
        </div>
      ` : nothing}
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
          <label class="label" for=${`screen-${screen.user_id}`}>Screen</label>
          <select id=${`screen-${screen.user_id}`} class="pv-input pv-select" ?disabled=${this._busy}
            @change=${(e: Event) => pick('screen', (e.target as HTMLSelectElement).value)}>
            <option value="" ?selected=${!screen.screen}>None</option>
            ${options(s => (SCREEN_DOMAINS as readonly string[]).includes(s.entity_id.split('.', 1)[0]), screen.screen).map(s => html`<option value=${s.id} ?selected=${s.id === screen.screen}>${s.name}</option>`)}
          </select>
        </div>
        <p class="hint">Pick this screen's own backlight or plug, not a room's light. A light or number is dimmed while the screensaver shows; at night the screen is turned off or all the way down, and it comes back in the morning and on a touch.</p>
        <div class="saver-row">
          <label class="label" for=${`motion-${screen.user_id}`}>Motion</label>
          <select id=${`motion-${screen.user_id}`} class="pv-input pv-select" ?disabled=${this._busy}
            @change=${(e: Event) => pick('motion', (e.target as HTMLSelectElement).value)}>
            <option value="" ?selected=${!screen.motion}>None</option>
            ${options(s => motionCandidate(s.entity_id, s.attributes), screen.motion).map(s => html`<option value=${s.id} ?selected=${s.id === screen.motion}>${s.name}</option>`)}
          </select>
        </div>
        <p class="hint">Someone in front of the screen keeps it awake and wakes it. Devices signed in with this account share these.</p>
      </div>
    `;
  }

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
    this._night(next);
  }

  private _night(night: { from: string; to: string } | null): void {
    if (night && (!night.from || !night.to)) return;
    void this._run(() => this.api.saveSecurity({ screensaver_night: night }));
  }

  private _switch(label: string, id: string, on: boolean, toggle: () => void, locked = false) {
    const press = locked ? () => undefined : toggle;
    return html`
      <div class="toggle-row">
        <span class="label" id=${id}>${label}</span>
        <div
          class="pv-toggle ${on ? 'active' : ''}"
          role="switch"
          tabindex="0"
          aria-checked=${on ? 'true' : 'false'}
          aria-labelledby=${id}
          aria-disabled=${this._busy || locked ? 'true' : 'false'}
          @click=${press}
          @keydown=${(e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              press();
            }
          }}
        ></div>
      </div>
    `;
  }

  /** One of a few: the segmented control, as everywhere (arrows move the choice). */
  private _choices<V extends number | string>(
    label: string,
    id: string,
    choices: readonly { value: V; label: string; spoken: string }[],
    chosen: V,
    save: (value: V) => Promise<void>,
    locked = false,
  ) {
    const choose = (value: V, group?: HTMLElement): void => {
      if (value !== chosen) void this._run(() => save(value));
      void this.updateComplete.then(() => group?.querySelector<HTMLElement>(`[data-value='${value}']`)?.focus());
    };
    const arrows = (event: KeyboardEvent): void => {
      const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
      if (!step) return;
      event.preventDefault();
      const index = Math.max(0, choices.findIndex(c => c.value === chosen));
      choose(choices[(index + step + choices.length) % choices.length].value, event.currentTarget as HTMLElement);
    };
    return html`
      <div class="choice-row">
        <span class="label" id=${id}>${label}</span>
        <div class="pv-seg" role="radiogroup" aria-labelledby=${id} @keydown=${arrows}>
          ${choices.map(choice => html`
            <button type="button" role="radio" data-value=${choice.value} aria-label=${choice.spoken}
              aria-checked=${choice.value === chosen ? 'true' : 'false'}
              tabindex=${choice.value === chosen ? '0' : '-1'}
              ?disabled=${this._busy || locked}
              @click=${() => choose(choice.value)}>${choice.label}</button>
          `)}
        </div>
      </div>
    `;
  }

  private _toggleShared = (): void => {
    if (!this.household) return;
    void this._run(() => this.api.setSharedScreen(!this.household!.account.shared));
  };

  private _toggleKiosk = (): void => {
    const kiosk = this.household?.security.kiosk;
    if (!this.household) return;
    void this._run(() => this.api.saveSecurity({ kiosk_enabled: !kiosk?.enabled }));
  };

  private _toggleShuffle = (): void => {
    if (!this.household) return;
    void this._run(() => this.api.saveSecurity({ shuffle_keypad: !this.household!.security.shuffle_keypad }));
  };

  private async _run(action: () => Promise<void>): Promise<void> {
    if (this._busy) return;
    this._busy = true;
    this._message = '';
    try {
      await action();
    } catch (err) {
      this._message = (err as { message?: string })?.message || saveErrorMessage(errorCode(err));
    } finally {
      this._busy = false;
    }
  }
}

defineElement('pv-settings-pins', PvSettingsPins);
