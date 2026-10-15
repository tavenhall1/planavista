import { LitElement, html, css, nothing } from 'lit';
import { segmentedStyles } from '../../../styles/controls';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../../utils/define';
import { animationStyles, baseStyles, buttonStyles, formStyles } from '../../../styles/shared';
import { settingsPageStyles } from '../../../styles/settings';
import type { HouseholdView } from '../../../core/household';
import { HouseholdApi, errorCode } from '../../../core/household-client';
import type { Layout } from '../../../core/layout';
import { PAGE_ERROR, saveErrorMessage } from '../../../core/page-host';
import type { DisplayConfig, PlanaVistaData } from '../../../types';
import { HelpState, helpBox, helpLabel, helpStyles } from '../../../core/help';

/**
 * pv-calendar-options-page: the calendar's display options (Settings,
 * Calendar options). Each change saves as you tap (spec 14.1).
 */
export class PvCalendarOptionsPage extends LitElement {
  /** Which settings' explainers are open (0.12.0, core/help.ts). */
  private readonly _help = new HelpState(this);
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlanaVistaData;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ attribute: false }) api!: HouseholdApi;
  @property({ attribute: false }) layout: Layout = 'landscape';
  @property({ type: String }) mode: 'settings' | 'setup' = 'settings';

  /** What's on screen. Set from the saved display once, so a later sensor update can't undo a tap. */
  @state() private _draft!: DisplayConfig;
  private _loaded = false;

  protected willUpdate(): void {
    if (!this._loaded && this.data?.display) {
      this._draft = { ...this.data.display };
      this._loaded = true;
    }
  }

  /** Show the change and save only it: saves merge, so other pages' settings (the theme) stay. */
  private _apply(change: Partial<DisplayConfig>): void {
    this._draft = { ...this._draft, ...change };
    this.api.saveConfig({ display: change }).catch(err => this._error(err));
  }

  /** Tell the host a save failed (it shows the words in a toast). */
  private _error(err: unknown): void {
    this.dispatchEvent(new CustomEvent(PAGE_ERROR, {
      detail: { message: saveErrorMessage(errorCode(err)) },
      bubbles: true,
      composed: true,
    }));
  }

  private get _weatherEntities(): string[] {
    if (!this.hass) return [];
    return Object.keys(this.hass.states).filter(k => k.startsWith('weather.')).sort();
  }

  private _entityLabel(entityId: string): string {
    return this.hass?.states[entityId]?.attributes?.friendly_name || entityId;
  }

  private _toggleLocationAutocomplete() {
    this._apply({ location_autocomplete: !this._draft.location_autocomplete });
  }

  private _renderPreferences() {
    return html`
      <div class="page-content">
        <!-- Time format -->
        <div class="field-group">
          <label class="pv-label">${helpLabel(this._help, 'calendar_time_format', 'Time format')}</label>
          ${helpBox(this._help, 'calendar_time_format')}
          <div class="pv-seg" role="group" aria-label="Time format">
            <button
              aria-pressed=${this._draft.time_format === '12h' ? 'true' : 'false'}
              type="button"
              @click=${() => { this._apply({ time_format: '12h' }); }}
            >12-hour</button>
            <button
              aria-pressed=${this._draft.time_format === '24h' ? 'true' : 'false'}
              type="button"
              @click=${() => { this._apply({ time_format: '24h' }); }}
            >24-hour</button>
          </div>
        </div>

        <!-- First day of the week -->
        <div class="field-group">
          <label class="pv-label">${helpLabel(this._help, 'calendar_first_day', 'First day of the week')}</label>
          ${helpBox(this._help, 'calendar_first_day')}
          <div class="pv-seg" role="group" aria-label="First day of week">
            <button
              aria-pressed=${this._draft.first_day === 'sunday' ? 'true' : 'false'}
              type="button"
              @click=${() => { this._apply({ first_day: 'sunday' }); }}
            >Sunday</button>
            <button
              aria-pressed=${this._draft.first_day === 'monday' ? 'true' : 'false'}
              type="button"
              @click=${() => { this._apply({ first_day: 'monday' }); }}
            >Monday</button>
          </div>
        </div>

        <!-- Weather -->
        <div class="field-group">
          <label class="pv-label" for="weather-select">${helpLabel(this._help, 'calendar_weather', 'Weather')}</label>
          ${helpBox(this._help, 'calendar_weather')}
          <select
            id="weather-select"
            class="pv-input pv-select"
            .value=${this._draft.weather_entity}
            @change=${(e: Event) => { this._apply({ weather_entity: (e.target as HTMLSelectElement).value }); }}
          >
            <option value="">None</option>
            ${this._weatherEntities.map(e => html`
              <option value="${e}" ?selected=${this._draft.weather_entity === e}>${this._entityLabel(e)}</option>
            `)}
          </select>
        </div>

        <!-- Default view -->
        <div class="field-group">
          <label class="pv-label">${helpLabel(this._help, 'calendar_default_view', 'Default view')}</label>
          ${helpBox(this._help, 'calendar_default_view')}
          <div class="pv-seg stretch" role="group" aria-label="Default calendar view">
            ${([
              { key: 'day', label: 'Day' },
              { key: 'week', label: 'Week' },
              { key: 'month', label: 'Month' },
              { key: 'agenda', label: 'Agenda' },
            ] as Array<{ key: string; label: string }>).map(v => html`
              <button type="button" aria-pressed=${this._draft.default_view === v.key ? 'true' : 'false'}
                @click=${() => { this._apply({ default_view: v.key as DisplayConfig['default_view'] }); }}>${v.label}</button>
            `)}
          </div>
        </div>

        <!-- Address suggestions (location autocomplete) -->
        <div class="field-group">
          <div class="toggle-row">
            <span class="pv-label">${helpLabel(this._help, 'calendar_address_suggestions', 'Address suggestions', 'address-suggestions-label')}</span>
            <div
              class="pv-toggle ${(this._draft.location_autocomplete === true) ? 'active' : ''}"
              role="switch"
              tabindex="0"
              aria-checked="${(this._draft.location_autocomplete === true)}"
              aria-labelledby="address-suggestions-label"
              @click=${this._toggleLocationAutocomplete}
              @keydown=${(e: KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  this._toggleLocationAutocomplete();
                }
              }}
            ></div>
          </div>
          ${helpBox(this._help, 'calendar_address_suggestions')}
          <p class="field-hint">
            <strong>Off (recommended):</strong> address lookup stays 100% local. Locations are plain
            text and nothing is sent anywhere.
          </p>
          <p class="field-hint">
            <strong>On:</strong> as you type a location, the text you've typed is sent to Photon
            (photon.komoot.io), a free OpenStreetMap-based service, to suggest addresses. Nothing
            else is sent: not your home location or any calendar details.
          </p>
        </div>
      </div>
    `;
  }


  render() {
    return this._loaded ? this._renderPreferences() : nothing;
  }

  static styles = [
    helpStyles,
    segmentedStyles,
    baseStyles,
    buttonStyles,
    formStyles,
    animationStyles,
    settingsPageStyles,
    css`
/* ── Field groups ───────────────────────────────────────── */
.field-group {
        margin-bottom: 1.5rem;
      }
.toggle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 0.5rem;
      }
.toggle-row .pv-label {
        margin-bottom: 0;
      }
.toggle-row .pv-toggle {
        flex-shrink: 0;
      }
.field-hint {
        font-size: 0.8125rem;
        line-height: 1.5;
        color: var(--pv-text-secondary, #6B7280);
        margin: 0 0 0.375rem;
        max-width: 60ch;
      }
.field-hint strong {
        color: var(--pv-text, #1A1B1E);
        font-weight: 600;
      }
@media (max-width: 479px) {
.field-group { margin-bottom: 1rem; }
}
    `,
  ];
}

defineElement('pv-calendar-options-page', PvCalendarOptionsPage);
