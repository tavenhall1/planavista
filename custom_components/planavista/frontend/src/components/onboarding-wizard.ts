import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { baseStyles, buttonStyles, formStyles, animationStyles, scrollbarStyles } from '../styles/shared';
import { PvColorSwatchPicker } from './color-swatch-picker';

interface CalendarEntry {
  entity_id: string;
  display_name: string;
  color: string;
  color_light: string;
  person_entity: string;
  include: boolean;
}

/**
 * pv-onboarding-wizard
 *
 * A full-screen onboarding wizard that guides the user through 3 pages of
 * initial setup: Preferences → Calendars → Theme. On completion, it calls
 * the planavista.save_config service and fires an 'onboarding-complete' event.
 *
 * @fires onboarding-complete - fired when setup is saved successfully
 */
@customElement('pv-onboarding-wizard')
export class PvOnboardingWizard extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;

  // Navigation
  @state() private _page = 0;

  // Page 0 — Preferences
  @state() private _timeFormat: '12h' | '24h' = '12h';
  @state() private _firstDay: 'sunday' | 'monday' = 'sunday';
  @state() private _weatherEntity = '';
  @state() private _defaultView: 'day' | 'week' | 'month' | 'agenda' = 'week';

  // Page 1 — Calendars
  @state() private _calendarConfigs: CalendarEntry[] = [];
  @state() private _calendarsInitialized = false;

  // Page 2 — Theme
  @state() private _theme: 'light' | 'dark' | 'minimal' | 'vibrant' = 'light';

  @state() private _saving = false;
  @state() private _saveError = '';

  // ─── Lifecycle ──────────────────────────────────────────────────────────────

  firstUpdated() {
    // Move focus into the dialog so screen readers announce it correctly
    const firstFocusable = this.renderRoot.querySelector<HTMLElement>(
      'button, [href], input, select, [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable?.focus();
  }

  updated(changed: Map<string, unknown>) {
    super.updated(changed);
    // Initialize calendar configs once hass is available and we haven't done so
    if (changed.has('hass') && this.hass && !this._calendarsInitialized) {
      this._initCalendars();
    }
  }

  private _initCalendars() {
    const presets = PvColorSwatchPicker.PRESETS;
    const entities = Object.keys(this.hass.states)
      .filter(k => k.startsWith('calendar.'))
      .sort();

    this._calendarConfigs = entities.map((entity_id, idx) => {
      const preset = presets[idx % presets.length];
      const friendly = this.hass.states[entity_id]?.attributes?.friendly_name as string | undefined;
      return {
        entity_id,
        display_name: friendly || entity_id,
        color: preset.color,
        color_light: preset.light,
        person_entity: '',
        include: true,
      };
    });
    this._calendarsInitialized = true;
  }

  // ─── Getters ─────────────────────────────────────────────────────────────────

  private get _weatherEntities(): string[] {
    if (!this.hass) return [];
    return Object.keys(this.hass.states).filter(k => k.startsWith('weather.')).sort();
  }

  private get _personEntities(): string[] {
    if (!this.hass) return [];
    return Object.keys(this.hass.states).filter(k => k.startsWith('person.')).sort();
  }

  // ─── Handlers ─────────────────────────────────────────────────────────────────

  private _goBack() {
    if (this._page > 0) this._page -= 1;
  }

  private async _goNext() {
    if (this._page < 2) {
      this._page += 1;
    } else {
      await this._finish();
    }
  }

  private async _finish() {
    this._saving = true;
    this._saveError = '';
    try {
      await this.hass.callService('planavista', 'save_config', {
        calendars: this._calendarConfigs
          .filter(c => c.include)
          .map(c => ({
            entity_id: c.entity_id,
            display_name: c.display_name,
            color: c.color,
            color_light: c.color_light,
            icon: 'mdi:calendar',
            person_entity: c.person_entity,
            visible: true,
          })),
        display: {
          time_format: this._timeFormat,
          weather_entity: this._weatherEntity,
          first_day: this._firstDay,
          default_view: this._defaultView,
          theme: this._theme,
        },
        onboarding_complete: true,
      });
      this.dispatchEvent(new CustomEvent('onboarding-complete', {
        bubbles: true,
        composed: true,
      }));
    } catch (err) {
      console.error('[pv-onboarding-wizard] save_config failed:', err);
      this._saveError = 'Setup failed — please try again.';
    } finally {
      this._saving = false;
    }
  }

  private _updateCalendar(idx: number, patch: Partial<CalendarEntry>) {
    const updated = [...this._calendarConfigs];
    updated[idx] = { ...updated[idx], ...patch };
    this._calendarConfigs = updated;
  }

  private _onCalendarColorChange(idx: number, e: CustomEvent<{ color: string; colorLight: string }>) {
    e.stopPropagation();
    this._updateCalendar(idx, {
      color: e.detail.color,
      color_light: e.detail.colorLight,
    });
  }

  // ─── Render helpers ──────────────────────────────────────────────────────────

  private _renderProgressDots() {
    return html`
      <div class="progress-dots" aria-label="Step ${this._page + 1} of 3">
        ${[0, 1, 2].map(i => html`
          <div
            class="dot ${i === this._page ? 'dot--active' : ''}"
            aria-current="${i === this._page ? 'step' : 'false'}"
          ></div>
        `)}
      </div>
    `;
  }

  private _renderPage0() {
    return html`
      <div class="page-content">
        <h2 class="page-title">Preferences</h2>
        <p class="page-subtitle">Customize how PlanaVista looks and behaves.</p>

        <!-- Time Format -->
        <div class="field-group">
          <label class="pv-label">Time Format</label>
          <div class="pill-group" role="group" aria-label="Time format">
            <button
              class="pill-btn ${this._timeFormat === '12h' ? 'pill-btn--active' : ''}"
              type="button"
              @click=${() => { this._timeFormat = '12h'; }}
            >12h</button>
            <button
              class="pill-btn ${this._timeFormat === '24h' ? 'pill-btn--active' : ''}"
              type="button"
              @click=${() => { this._timeFormat = '24h'; }}
            >24h</button>
          </div>
        </div>

        <!-- First Day of Week -->
        <div class="field-group">
          <label class="pv-label">First Day of Week</label>
          <div class="pill-group" role="group" aria-label="First day of week">
            <button
              class="pill-btn ${this._firstDay === 'sunday' ? 'pill-btn--active' : ''}"
              type="button"
              @click=${() => { this._firstDay = 'sunday'; }}
            >Sunday</button>
            <button
              class="pill-btn ${this._firstDay === 'monday' ? 'pill-btn--active' : ''}"
              type="button"
              @click=${() => { this._firstDay = 'monday'; }}
            >Monday</button>
          </div>
        </div>

        <!-- Weather Entity -->
        <div class="field-group">
          <label class="pv-label" for="weather-select">Weather Entity</label>
          <select
            id="weather-select"
            class="pv-input pv-select"
            .value=${this._weatherEntity}
            @change=${(e: Event) => { this._weatherEntity = (e.target as HTMLSelectElement).value; }}
          >
            <option value="">(None)</option>
            ${this._weatherEntities.map(e => html`
              <option value="${e}" ?selected=${this._weatherEntity === e}>${e}</option>
            `)}
          </select>
        </div>

        <!-- Default View -->
        <div class="field-group">
          <label class="pv-label">Default View</label>
          <div class="view-grid" role="group" aria-label="Default calendar view">
            ${([
              { key: 'day', label: 'Day', icon: 'M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zm-7-7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z' },
              { key: 'week', label: 'Week', icon: 'M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3zM4 19h16v2H4z' },
              { key: 'month', label: 'Month', icon: 'M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z' },
              { key: 'agenda', label: 'Agenda', icon: 'M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z' },
            ] as Array<{ key: string; label: string; icon: string }>).map(v => html`
              <button
                class="view-card ${this._defaultView === v.key ? 'view-card--active' : ''}"
                type="button"
                aria-pressed="${this._defaultView === v.key}"
                @click=${() => { this._defaultView = v.key as typeof this._defaultView; }}
              >
                <svg class="view-icon" viewBox="0 0 24 24" width="24" height="24">
                  <path d="${v.icon}" />
                </svg>
                <span class="view-label">${v.label}</span>
              </button>
            `)}
          </div>
        </div>
      </div>
    `;
  }

  private _renderPage1() {
    if (this._calendarConfigs.length === 0) {
      return html`
        <div class="page-content">
          <h2 class="page-title">Calendars</h2>
          <p class="page-subtitle">No calendar entities found in Home Assistant.</p>
          <p class="empty-hint">Add calendar integrations (Google Calendar, CalDAV, etc.) and re-run setup.</p>
        </div>
      `;
    }

    return html`
      <div class="page-content">
        <h2 class="page-title">Calendars</h2>
        <p class="page-subtitle">Choose which calendars to display and personalise each one.</p>

        <div class="calendar-list">
          ${this._calendarConfigs.map((cal, idx) => this._renderCalendarRow(cal, idx))}
        </div>
      </div>
    `;
  }

  private _renderCalendarRow(cal: CalendarEntry, idx: number) {
    return html`
      <div class="cal-row ${!cal.include ? 'cal-row--excluded' : ''}">
        <!-- Include checkbox -->
        <label class="cal-checkbox-wrap" title="${cal.include ? 'Exclude this calendar' : 'Include this calendar'}">
          <input
            type="checkbox"
            class="cal-checkbox"
            .checked=${cal.include}
            @change=${(e: Event) => this._updateCalendar(idx, { include: (e.target as HTMLInputElement).checked })}
          />
          <span class="cal-checkbox-visual" aria-hidden="true">
            ${cal.include ? html`
              <svg viewBox="0 0 24 24" width="14" height="14">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
              </svg>
            ` : ''}
          </span>
        </label>

        <!-- Calendar details -->
        <div class="cal-details">
          <!-- Entity ID badge -->
          <span class="cal-entity-id">${cal.entity_id}</span>

          <!-- Display name input -->
          <div class="cal-field">
            <label class="pv-label" for="cal-name-${idx}">Display Name</label>
            <input
              id="cal-name-${idx}"
              type="text"
              class="pv-input cal-name-input"
              .value=${cal.display_name}
              placeholder="Calendar name"
              ?disabled=${!cal.include}
              @input=${(e: Event) => this._updateCalendar(idx, { display_name: (e.target as HTMLInputElement).value })}
            />
          </div>

          <!-- Color picker -->
          <div class="cal-field">
            <label class="pv-label">Color</label>
            <pv-color-swatch-picker
              .value=${cal.color}
              .valueLight=${cal.color_light}
              ?disabled=${!cal.include}
              @color-change=${(e: CustomEvent) => this._onCalendarColorChange(idx, e)}
            ></pv-color-swatch-picker>
          </div>

          <!-- Person entity link -->
          <div class="cal-field">
            <label class="pv-label" for="cal-person-${idx}">Link to Person</label>
            <select
              id="cal-person-${idx}"
              class="pv-input pv-select cal-person-select"
              .value=${cal.person_entity}
              ?disabled=${!cal.include}
              @change=${(e: Event) => this._updateCalendar(idx, { person_entity: (e.target as HTMLSelectElement).value })}
            >
              <option value="">(None)</option>
              ${this._personEntities.map(p => html`
                <option value="${p}" ?selected=${cal.person_entity === p}>${p}</option>
              `)}
            </select>
          </div>
        </div>
      </div>
    `;
  }

  private _renderPage2() {
    const themes: Array<{
      key: 'light' | 'dark' | 'minimal' | 'vibrant';
      name: string;
      description: string;
      previewBg: string;
      previewAccent: string;
      previewText: string;
    }> = [
      {
        key: 'light',
        name: 'Clean Light',
        description: 'White background, subtle shadows',
        previewBg: '#FFFFFF',
        previewAccent: '#6366F1',
        previewText: '#1A1B1E',
      },
      {
        key: 'dark',
        name: 'Deep Dark',
        description: 'Dark gray background, glowing accents',
        previewBg: '#1E1E2E',
        previewAccent: '#818CF8',
        previewText: '#E5E7EB',
      },
      {
        key: 'minimal',
        name: 'Minimal',
        description: 'Barely-there UI, content first',
        previewBg: '#FAFAF9',
        previewAccent: '#374151',
        previewText: '#374151',
      },
      {
        key: 'vibrant',
        name: 'Vibrant',
        description: 'Rich colors, bold personality',
        previewBg: '#4F46E5',
        previewAccent: '#F59E0B',
        previewText: '#FFFFFF',
      },
    ];

    return html`
      <div class="page-content">
        <h2 class="page-title">Theme</h2>
        <p class="page-subtitle">Pick a visual style for your calendar.</p>

        <div class="theme-grid">
          ${themes.map(t => html`
            <button
              class="theme-card ${this._theme === t.key ? 'theme-card--active' : ''}"
              type="button"
              aria-pressed="${this._theme === t.key}"
              @click=${() => { this._theme = t.key; }}
            >
              <!-- Mini preview -->
              <div
                class="theme-preview"
                style="background: ${t.previewBg}; border-color: ${t.previewAccent}20;"
              >
                <!-- Header bar -->
                <div class="theme-preview-header" style="background: ${t.previewAccent}15; border-bottom: 1px solid ${t.previewAccent}30;">
                  <div class="theme-preview-dot" style="background: ${t.previewAccent};"></div>
                  <div class="theme-preview-bar" style="background: ${t.previewText}20; width: 40%;"></div>
                  <div class="theme-preview-bar" style="background: ${t.previewText}20; width: 20%;"></div>
                </div>
                <!-- Event pills -->
                <div class="theme-preview-body">
                  <div class="theme-preview-event" style="border-left-color: ${t.previewAccent}; background: ${t.previewAccent}18; color: ${t.previewText};"></div>
                  <div class="theme-preview-event" style="border-left-color: ${t.previewAccent}88; background: ${t.previewAccent}10; color: ${t.previewText}; width: 70%;"></div>
                  <div class="theme-preview-event" style="border-left-color: ${t.previewAccent}55; background: ${t.previewAccent}0C; color: ${t.previewText}; width: 85%;"></div>
                </div>
              </div>

              <!-- Label -->
              <div class="theme-info">
                <span class="theme-name">${t.name}</span>
                <span class="theme-desc">${t.description}</span>
              </div>

              <!-- Selected checkmark -->
              ${this._theme === t.key ? html`
                <div class="theme-check" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
                  </svg>
                </div>
              ` : ''}
            </button>
          `)}
        </div>
      </div>
    `;
  }

  private _renderFooter() {
    const isLast = this._page === 2;
    const nextLabel = isLast
      ? (this._saving ? 'Saving…' : 'Finish')
      : 'Next';

    return html`
      <div class="wizard-footer">
        ${this._saveError ? html`<p class="save-error" role="alert">${this._saveError}</p>` : nothing}
        <!-- Back button (hidden on page 0) -->
        <button
          class="pv-btn pv-btn-secondary back-btn ${this._page === 0 ? 'back-btn--hidden' : ''}"
          type="button"
          ?disabled=${this._page === 0}
          aria-hidden=${this._page === 0 ? 'true' : nothing}
          @click=${this._goBack}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="currentColor"/>
          </svg>
          Back
        </button>

        <!-- Next / Finish button -->
        <button
          class="pv-btn pv-btn-primary next-btn"
          type="button"
          ?disabled=${this._saving}
          @click=${this._goNext}
        >
          ${isLast ? html`
            ${this._saving ? html`
              <span class="spinner" aria-hidden="true"></span>
            ` : html`
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
              </svg>
            `}
          ` : ''}
          ${nextLabel}
          ${!isLast ? html`
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" fill="currentColor"/>
            </svg>
          ` : ''}
        </button>
      </div>
    `;
  }

  render() {
    const pageLabels = ['Preferences', 'Calendars', 'Theme'];

    return html`
      <div class="wizard-container" role="dialog" aria-modal="true" aria-label="PlanaVista Setup — ${pageLabels[this._page]}">
        <!-- Header with progress -->
        <div class="wizard-header">
          <div class="wizard-brand">
            <span class="wizard-logo" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z" fill="currentColor"/>
              </svg>
            </span>
            <span class="wizard-title-text">PlanaVista Setup</span>
          </div>
          ${this._renderProgressDots()}
        </div>

        <!-- Scrollable content area -->
        <div class="wizard-content">
          ${this._page === 0 ? this._renderPage0() : ''}
          ${this._page === 1 ? this._renderPage1() : ''}
          ${this._page === 2 ? this._renderPage2() : ''}
        </div>

        <!-- Fixed footer -->
        ${this._renderFooter()}
      </div>
    `;
  }

  // ─── Styles ──────────────────────────────────────────────────────────────────

  static styles = [
    baseStyles,
    buttonStyles,
    formStyles,
    animationStyles,
    scrollbarStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        background: var(--pv-card-bg, #FFFFFF);
        color: var(--pv-text, #1A1B1E);
        font-family: var(--pv-font-family, Inter, -apple-system, system-ui, sans-serif);
        overflow: hidden;
      }

      /* ── Wizard shell ───────────────────────────────────────── */

      .wizard-container {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        animation: pv-fadeIn 300ms ease forwards;
      }

      /* ── Header ─────────────────────────────────────────────── */

      .wizard-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 1.5rem;
        border-bottom: 1px solid var(--pv-border-subtle, #E5E7EB);
        flex-shrink: 0;
        background: var(--pv-card-bg, #FFFFFF);
      }

      .wizard-brand {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--pv-accent, #6366F1);
      }

      .wizard-logo {
        display: flex;
        align-items: center;
        justify-content: center;
        fill: currentColor;
      }

      .wizard-title-text {
        font-size: 0.9375rem;
        font-weight: 600;
        color: var(--pv-text, #1A1B1E);
        letter-spacing: -0.01em;
      }

      /* ── Progress dots ──────────────────────────────────────── */

      .progress-dots {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--pv-border-subtle, #E5E7EB);
        transition: background var(--pv-transition, 200ms ease),
                    transform var(--pv-transition, 200ms ease);
      }

      .dot--active {
        background: var(--pv-accent, #6366F1);
        transform: scale(1.25);
      }

      /* ── Scrollable content ─────────────────────────────────── */

      .wizard-content {
        flex: 1;
        overflow-y: auto;
        padding: 1.5rem;
        -webkit-overflow-scrolling: touch;
      }

      .page-content {
        max-width: 560px;
        margin: 0 auto;
        animation: pv-slideLeft 250ms ease forwards;
      }

      .page-title {
        font-size: 1.375rem;
        font-weight: 700;
        color: var(--pv-text, #1A1B1E);
        margin: 0 0 0.25rem;
        letter-spacing: -0.02em;
      }

      .page-subtitle {
        font-size: 0.9375rem;
        color: var(--pv-text-secondary, #6B7280);
        margin: 0 0 1.75rem;
        line-height: 1.5;
      }

      .empty-hint {
        font-size: 0.875rem;
        color: var(--pv-text-muted, #9CA3AF);
        margin: 0.5rem 0 0;
      }

      /* ── Field groups ───────────────────────────────────────── */

      .field-group {
        margin-bottom: 1.5rem;
      }

      /* ── Pill group (time format / first day) ───────────────── */

      .pill-group {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .pill-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.5rem 1.25rem;
        min-height: 44px;
        border-radius: 9999px;
        border: 1.5px solid var(--pv-border-subtle, #E5E7EB);
        background: transparent;
        color: var(--pv-text-secondary, #6B7280);
        font-family: inherit;
        font-size: 0.9375rem;
        font-weight: 500;
        cursor: pointer;
        transition: all var(--pv-transition, 200ms ease);
        -webkit-tap-highlight-color: transparent;
        user-select: none;
      }

      .pill-btn:hover {
        border-color: var(--pv-accent, #6366F1);
        color: var(--pv-accent, #6366F1);
        background: color-mix(in srgb, var(--pv-accent, #6366F1) 5%, transparent);
      }

      .pill-btn--active {
        border-color: var(--pv-accent, #6366F1);
        background: var(--pv-accent, #6366F1);
        color: var(--pv-accent-text, #FFFFFF);
      }

      .pill-btn--active:hover {
        opacity: 0.9;
        color: var(--pv-accent-text, #FFFFFF);
        background: var(--pv-accent, #6366F1);
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

      /* ── Calendar list (page 1) ─────────────────────────────── */

      .calendar-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .cal-row {
        display: flex;
        gap: 1rem;
        align-items: flex-start;
        padding: 1rem;
        border: 1px solid var(--pv-border-subtle, #E5E7EB);
        border-radius: var(--pv-radius, 12px);
        background: var(--pv-card-bg, #FFFFFF);
        transition: opacity var(--pv-transition, 200ms ease),
                    border-color var(--pv-transition, 200ms ease);
      }

      .cal-row--excluded {
        opacity: 0.5;
      }

      /* Custom checkbox */
      .cal-checkbox-wrap {
        display: flex;
        align-items: center;
        cursor: pointer;
        flex-shrink: 0;
        margin-top: 0.125rem;
      }

      .cal-checkbox {
        position: absolute;
        opacity: 0;
        width: 0;
        height: 0;
        pointer-events: none;
      }

      .cal-checkbox-visual {
        width: 20px;
        height: 20px;
        border-radius: 4px;
        border: 2px solid var(--pv-border-subtle, #E5E7EB);
        background: var(--pv-card-bg, #FFFFFF);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: all var(--pv-transition, 200ms ease);
        color: var(--pv-accent-text, #FFFFFF);
      }

      .cal-checkbox:checked + .cal-checkbox-visual {
        background: var(--pv-accent, #6366F1);
        border-color: var(--pv-accent, #6366F1);
      }

      .cal-checkbox-wrap:hover .cal-checkbox-visual {
        border-color: var(--pv-accent, #6366F1);
      }

      .cal-details {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 0.875rem;
      }

      .cal-entity-id {
        font-size: 0.75rem;
        color: var(--pv-text-muted, #9CA3AF);
        font-family: monospace;
        letter-spacing: 0.01em;
        word-break: break-all;
      }

      .cal-field {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .cal-name-input {
        font-size: 0.9375rem;
      }

      .cal-person-select {
        font-size: 0.875rem;
      }

      /* ── Theme grid (page 2) ────────────────────────────────── */

      .theme-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }

      @media (max-width: 400px) {
        .theme-grid {
          grid-template-columns: 1fr;
        }
      }

      .theme-card {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        padding: 0;
        border: 2px solid var(--pv-border-subtle, #E5E7EB);
        border-radius: var(--pv-radius, 12px);
        background: transparent;
        cursor: pointer;
        font-family: inherit;
        text-align: left;
        overflow: hidden;
        transition: all var(--pv-transition, 200ms ease);
        -webkit-tap-highlight-color: transparent;
      }

      .theme-card:hover {
        border-color: var(--pv-accent, #6366F1);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px color-mix(in srgb, var(--pv-accent, #6366F1) 20%, transparent);
      }

      .theme-card--active {
        border-color: var(--pv-accent, #6366F1);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--pv-accent, #6366F1) 25%, transparent);
      }

      /* Mini preview area */
      .theme-preview {
        height: 80px;
        border-radius: 0;
        border-bottom: 1px solid transparent;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .theme-preview-header {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 10px;
        flex-shrink: 0;
      }

      .theme-preview-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .theme-preview-bar {
        height: 6px;
        border-radius: 3px;
        flex-shrink: 0;
      }

      .theme-preview-body {
        flex: 1;
        padding: 6px 10px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .theme-preview-event {
        height: 12px;
        border-radius: 3px;
        border-left: 3px solid transparent;
        width: 100%;
      }

      /* Label area */
      .theme-info {
        padding: 0.625rem 0.75rem 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .theme-name {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--pv-text, #1A1B1E);
        line-height: 1.3;
      }

      .theme-desc {
        font-size: 0.75rem;
        color: var(--pv-text-secondary, #6B7280);
        line-height: 1.4;
      }

      /* Checkmark badge */
      .theme-check {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: var(--pv-accent, #6366F1);
        color: var(--pv-accent-text, #FFFFFF);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* ── Footer ─────────────────────────────────────────────── */

      .wizard-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 1.5rem;
        border-top: 1px solid var(--pv-border-subtle, #E5E7EB);
        flex-shrink: 0;
        background: var(--pv-card-bg, #FFFFFF);
        gap: 1rem;
      }

      .save-error {
        flex: 1;
        font-size: 0.8125rem;
        color: var(--error-color, #EF4444);
        margin: 0;
      }

      .back-btn {
        gap: 0.25rem;
        padding-left: 0.875rem;
      }

      .back-btn--hidden {
        visibility: hidden;
        pointer-events: none;
      }

      .next-btn {
        gap: 0.25rem;
        padding-right: 0.875rem;
        margin-left: auto;
      }

      /* ── Spinner ─────────────────────────────────────────────── */

      @keyframes pv-spin {
        to { transform: rotate(360deg); }
      }

      .spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid color-mix(in srgb, currentColor 30%, transparent);
        border-top-color: currentColor;
        border-radius: 50%;
        animation: pv-spin 0.6s linear infinite;
        flex-shrink: 0;
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    'pv-onboarding-wizard': PvOnboardingWizard;
  }
}
