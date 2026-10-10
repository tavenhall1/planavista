import { LitElement, html, css, nothing } from 'lit';
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

/**
 * pv-calendar-options-page: the calendar's display options (Settings,
 * Calendar options). Each change saves as you tap (spec 14.1).
 */
export class PvCalendarOptionsPage extends LitElement {
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
        <!-- Time Format -->
        <div class="field-group">
          <label class="pv-label">Time Format</label>
          <div class="pill-group" role="group" aria-label="Time format">
            <button
              class="pill-btn ${this._draft.time_format === '12h' ? 'pill-btn--active' : ''}"
              type="button"
              @click=${() => { this._apply({ time_format: '12h' }); }}
            >12h</button>
            <button
              class="pill-btn ${this._draft.time_format === '24h' ? 'pill-btn--active' : ''}"
              type="button"
              @click=${() => { this._apply({ time_format: '24h' }); }}
            >24h</button>
          </div>
        </div>

        <!-- First Day of Week -->
        <div class="field-group">
          <label class="pv-label">First Day of Week</label>
          <div class="pill-group" role="group" aria-label="First day of week">
            <button
              class="pill-btn ${this._draft.first_day === 'sunday' ? 'pill-btn--active' : ''}"
              type="button"
              @click=${() => { this._apply({ first_day: 'sunday' }); }}
            >Sunday</button>
            <button
              class="pill-btn ${this._draft.first_day === 'monday' ? 'pill-btn--active' : ''}"
              type="button"
              @click=${() => { this._apply({ first_day: 'monday' }); }}
            >Monday</button>
          </div>
        </div>

        <!-- Weather Entity -->
        <div class="field-group">
          <label class="pv-label" for="weather-select">Weather Entity</label>
          <select
            id="weather-select"
            class="pv-input pv-select"
            .value=${this._draft.weather_entity}
            @change=${(e: Event) => { this._apply({ weather_entity: (e.target as HTMLSelectElement).value }); }}
          >
            <option value="">(None)</option>
            ${this._weatherEntities.map(e => html`
              <option value="${e}" ?selected=${this._draft.weather_entity === e}>${this._entityLabel(e)}</option>
            `)}
          </select>
        </div>

        <!-- Default View -->
        <div class="field-group">
          <label class="pv-label">Default View</label>
          <div class="view-grid" role="group" aria-label="Default calendar view">
            ${([
              { key: 'day', label: 'Day', icon: 'M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zm-7-7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z' },
              { key: 'week', label: 'Week', icon: 'M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM7 12h2v6H7zm4 0h2v6h-2zm4 0h2v6h-2z' },
              { key: 'month', label: 'Month', icon: 'M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z' },
              { key: 'agenda', label: 'Agenda', icon: 'M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z' },
            ] as Array<{ key: string; label: string; icon: string }>).map(v => html`
              <button
                class="view-card ${this._draft.default_view === v.key ? 'view-card--active' : ''}"
                type="button"
                aria-pressed="${this._draft.default_view === v.key}"
                @click=${() => { this._apply({ default_view: v.key as DisplayConfig['default_view'] }); }}
              >
                <svg class="view-icon" viewBox="0 0 24 24" width="24" height="24">
                  <path d="${v.icon}" />
                </svg>
                <span class="view-label">${v.label}</span>
              </button>
            `)}
          </div>
        </div>

        <!-- Address suggestions (location autocomplete) -->
        <div class="field-group">
          <div class="toggle-row">
            <span class="pv-label" id="address-suggestions-label">Address suggestions</span>
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
/* ── View grid (default view selection) ────────────────── */
.view-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
      }
@media (max-width: 400px) {
.view-grid {
          grid-template-columns: repeat(2, 1fr);
        }
}
.view-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.375rem;
        padding: 0.875rem 0.5rem;
        border: 1.5px solid var(--pv-border-subtle, #E5E7EB);
        border-radius: var(--pv-radius, 12px);
        background: transparent;
        cursor: pointer;
        font-family: inherit;
        transition: all var(--pv-transition, 200ms ease);
        -webkit-tap-highlight-color: transparent;
        user-select: none;
      }
.view-card:hover {
        border-color: var(--pv-accent, #6366F1);
        background: color-mix(in srgb, var(--pv-accent, #6366F1) 5%, transparent);
      }
.view-card--active {
        border-color: var(--pv-accent, #6366F1);
        background: color-mix(in srgb, var(--pv-accent, #6366F1) 10%, transparent);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--pv-accent, #6366F1) 20%, transparent);
      }
.view-icon {
        fill: var(--pv-text-secondary, #6B7280);
        transition: fill var(--pv-transition, 200ms ease);
      }
.view-card--active .view-icon,
      .view-card:hover .view-icon {
        fill: var(--pv-accent, #6366F1);
      }
.view-label {
        font-size: 0.8125rem;
        font-weight: 500;
        color: var(--pv-text-secondary, #6B7280);
        transition: color var(--pv-transition, 200ms ease);
      }
.view-card--active .view-label,
      .view-card:hover .view-label {
        color: var(--pv-accent, #6366F1);
      }
@media (max-width: 479px) {
.field-group { margin-bottom: 1rem; }
.view-grid { grid-template-columns: repeat(2, 1fr); }
}
    `,
  ];
}

defineElement('pv-calendar-options-page', PvCalendarOptionsPage);
