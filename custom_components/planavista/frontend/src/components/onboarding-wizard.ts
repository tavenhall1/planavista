import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { baseStyles, buttonStyles, formStyles, animationStyles, scrollbarStyles } from '../styles/shared';
import { ThemeOverrides } from '../types';
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
 * In 'settings' mode, it pre-populates from existing config and uses tabs
 * instead of a linear flow. Fires 'settings-save' on save.
 *
 * @fires onboarding-complete - fired when onboarding setup is saved successfully
 * @fires settings-save - fired when settings are saved successfully
 * @fires settings-close - fired when the user cancels settings
 */
@customElement('pv-onboarding-wizard')
export class PvOnboardingWizard extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: String }) mode: 'onboarding' | 'settings' = 'onboarding';
  @property({ attribute: false }) config?: any;

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
  @state() private _dragIdx: number | null = null;
  @state() private _dragOverIdx: number | null = null;

  // Page 2 — Theme
  @state() private _theme: 'light' | 'dark' | 'minimal' | 'vibrant' = 'light';

  // Page 2 — Theme customization overrides
  @state() private _themeOverrides: ThemeOverrides = {};
  @state() private _customizeOpen = false;

  @state() private _saving = false;
  @state() private _saveError = '';
  private _settingsInitialized = false;

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
    // In settings mode, pre-populate display settings from config (once)
    if (this.mode === 'settings' && this.config && !this._settingsInitialized) {
      this._initFromConfig();
      this._settingsInitialized = true;
    }
  }

  private _initFromConfig() {
    const display = this.config?.display || {};
    this._timeFormat = display.time_format || '12h';
    this._firstDay = display.first_day || 'sunday';
    this._weatherEntity = display.weather_entity || '';
    this._defaultView = display.default_view || 'week';
    this._theme = display.theme || 'light';
    this._themeOverrides = display.theme_overrides ? { ...display.theme_overrides } : {};
    this._customizeOpen = Object.keys(this._themeOverrides).length > 0;
  }

  private _initCalendars() {
    const presets = PvColorSwatchPicker.PRESETS;
    const allEntities = new Set(
      Object.keys(this.hass.states).filter(k => k.startsWith('calendar.'))
    );

    // In settings mode, preserve saved calendar order
    const existingCals = this.mode === 'settings' && this.config?.calendars
      ? (this.config.calendars as any[])
      : [];

    const result: typeof this._calendarConfigs = [];
    const seen = new Set<string>();

    // First: add saved calendars in their saved order
    for (const existing of existingCals) {
      seen.add(existing.entity_id);
      const idx = result.length;
      result.push({
        entity_id: existing.entity_id,
        display_name: existing.display_name || existing.entity_id,
        color: existing.color || presets[idx % presets.length].color,
        color_light: existing.color_light || presets[idx % presets.length].light,
        person_entity: existing.person_entity || '',
        include: true,
      });
    }

    // Then: append any newly discovered calendars (not in saved config)
    const newEntities = [...allEntities].filter(e => !seen.has(e)).sort();
    for (const entity_id of newEntities) {
      const idx = result.length;
      const preset = presets[idx % presets.length];
      const friendly = this.hass.states[entity_id]?.attributes?.friendly_name as string | undefined;
      result.push({
        entity_id,
        display_name: friendly || entity_id,
        color: preset.color,
        color_light: preset.light,
        person_entity: '',
        include: false,
      });
    }

    this._calendarConfigs = result;
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

  private _entityLabel(entityId: string): string {
    return this.hass?.states[entityId]?.attributes?.friendly_name || entityId;
  }

  private _personLabel(entityId: string): string {
    return this._entityLabel(entityId);
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
      const payload: any = {
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
          theme_overrides: Object.keys(this._themeOverrides).length > 0 ? this._themeOverrides : undefined,
        },
      };
      if (this.mode === 'onboarding') {
        payload.onboarding_complete = true;
      }
      await this.hass.callService('planavista', 'save_config', payload);
      const eventName = this.mode === 'settings' ? 'settings-save' : 'onboarding-complete';
      this.dispatchEvent(new CustomEvent(eventName, {
        bubbles: true,
        composed: true,
      }));
    } catch (err) {
      console.error('[pv-onboarding-wizard] save_config failed:', err);
      this._saveError = this.mode === 'settings'
        ? 'Save failed — please try again.'
        : 'Setup failed — please try again.';
    } finally {
      this._saving = false;
    }
  }

  private _cancel() {
    this.dispatchEvent(new CustomEvent('settings-close', {
      bubbles: true,
      composed: true,
    }));
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

  // ─── Theme customization ─────────────────────────────────────────────────────

  private _dispatchThemePreview() {
    this.dispatchEvent(new CustomEvent('theme-preview', {
      detail: {
        theme: this._theme,
        overrides: Object.keys(this._themeOverrides).length > 0 ? this._themeOverrides : null,
      },
      bubbles: true,
      composed: true,
    }));
  }

  private _setOverride(key: keyof ThemeOverrides, value: string | undefined) {
    if (value === undefined || value === '') {
      const { [key]: _, ...rest } = this._themeOverrides;
      this._themeOverrides = rest as ThemeOverrides;
    } else {
      this._themeOverrides = { ...this._themeOverrides, [key]: value };
    }
    this._dispatchThemePreview();
  }

  private _resetOverrides() {
    this._themeOverrides = {};
    this._dispatchThemePreview();
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
              <option value="${e}" ?selected=${this._weatherEntity === e}>${this._entityLabel(e)}</option>
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
        <p class="page-subtitle">Check the calendars you want to display, then personalise each one.</p>

        <div class="calendar-list">
          ${this._calendarConfigs.map((cal, idx) => this._renderCalendarRow(cal, idx))}
        </div>
      </div>
    `;
  }

  // ─── Drag-to-reorder handlers ────────────────────────────────────────────────

  private _onDragStart(idx: number, e: DragEvent) {
    this._dragIdx = idx;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(idx));
    }
  }

  private _onDragOver(idx: number, e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    this._dragOverIdx = idx;
  }

  private _onDragLeave() {
    this._dragOverIdx = null;
  }

  private _onDrop(idx: number, e: DragEvent) {
    e.preventDefault();
    if (this._dragIdx !== null && this._dragIdx !== idx) {
      const updated = [...this._calendarConfigs];
      const [moved] = updated.splice(this._dragIdx, 1);
      updated.splice(idx, 0, moved);
      this._calendarConfigs = updated;
    }
    this._dragIdx = null;
    this._dragOverIdx = null;
  }

  private _onDragEnd() {
    this._dragIdx = null;
    this._dragOverIdx = null;
  }

  private _renderCalendarRow(cal: CalendarEntry, idx: number) {
    const isDragging = this._dragIdx === idx;
    const isDragOver = this._dragOverIdx === idx && this._dragIdx !== idx;
    return html`
      <div class="cal-row ${isDragging ? 'cal-row--dragging' : ''} ${isDragOver ? 'cal-row--dragover' : ''}"
        draggable="true"
        @dragstart=${(e: DragEvent) => this._onDragStart(idx, e)}
        @dragover=${(e: DragEvent) => this._onDragOver(idx, e)}
        @dragleave=${this._onDragLeave}
        @drop=${(e: DragEvent) => this._onDrop(idx, e)}
        @dragend=${this._onDragEnd}
      >
        <!-- Always-visible header: checkbox + calendar name -->
        <div class="cal-header">
          <div class="cal-drag-handle" aria-label="Drag to reorder">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </div>
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
          <div class="cal-header-info">
            <span class="cal-friendly-name">${cal.display_name || cal.entity_id}</span>
            <span class="cal-entity-id">${cal.entity_id}</span>
          </div>
        </div>

        <!-- Expandable details — only shown when included -->
        ${cal.include ? html`
          <div class="cal-details">
            <!-- Display name input -->
            <div class="cal-field">
              <label class="pv-label" for="cal-name-${idx}">Display Name</label>
              <input
                id="cal-name-${idx}"
                type="text"
                class="pv-input cal-name-input"
                .value=${cal.display_name}
                placeholder="Calendar name"
                @input=${(e: Event) => this._updateCalendar(idx, { display_name: (e.target as HTMLInputElement).value })}
              />
            </div>

            <!-- Color picker -->
            <div class="cal-field">
              <label class="pv-label">Color</label>
              <pv-color-swatch-picker
                .value=${cal.color}
                .valueLight=${cal.color_light}
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
                @change=${(e: Event) => this._updateCalendar(idx, { person_entity: (e.target as HTMLSelectElement).value })}
              >
                <option value="">(None)</option>
                ${this._personEntities.map(p => html`
                  <option value="${p}" ?selected=${cal.person_entity === p}>${this._personLabel(p)}</option>
                `)}
              </select>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  private _renderCustomize() {
    const ov = this._themeOverrides;
    const hasOverrides = Object.keys(ov).length > 0;

    return html`
      <!-- Customize toggle -->
      <button
        class="customize-toggle"
        type="button"
        @click=${() => { this._customizeOpen = !this._customizeOpen; }}
      >
        <span class="customize-toggle-label">Customize</span>
        <svg class="customize-toggle-chevron ${this._customizeOpen ? 'open' : ''}" viewBox="0 0 24 24" width="18" height="18">
          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" fill="currentColor"/>
        </svg>
      </button>

      ${this._customizeOpen ? html`
        <div class="customize-section">

          <!-- Accent Color -->
          <div class="customize-group">
            <label class="pv-label">Accent Color</label>
            <pv-color-swatch-picker
              .value=${ov.accent || ''}
              @color-change=${(e: CustomEvent<{ color: string }>) => this._setOverride('accent', e.detail.color)}
            ></pv-color-swatch-picker>
          </div>

          <!-- Background -->
          <div class="customize-group">
            <label class="pv-label">Background</label>
            <div class="bg-options">
              <button class="pill-btn ${!ov.background ? 'pill-btn--active' : ''}" type="button"
                @click=${() => this._setOverride('background', undefined)}>Base Default</button>
              <div class="bg-custom-row">
                <label class="bg-custom-label">Custom:</label>
                <input type="color" class="bg-color-input"
                  .value=${ov.background || '#FFFFFF'}
                  @input=${(e: Event) => this._setOverride('background', (e.target as HTMLInputElement).value)}
                />
                ${ov.background ? html`
                  <span class="bg-color-hex">${ov.background}</span>
                ` : ''}
              </div>
            </div>
          </div>

          <!-- Header Style -->
          <div class="customize-group">
            <label class="pv-label">Header Style</label>
            <div class="header-style-grid">
              ${([
                { key: 'gradient_purple', label: 'Purple', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
                { key: 'gradient_teal', label: 'Teal', gradient: 'linear-gradient(135deg, #0D9488, #2563EB)' },
                { key: 'gradient_sunset', label: 'Sunset', gradient: 'linear-gradient(135deg, #F59E0B, #EF4444)' },
                { key: 'solid_accent', label: 'Accent', gradient: ov.accent || '#6366F1' },
                { key: 'solid_dark', label: 'Dark', gradient: '#1A1B1E' },
              ] as Array<{ key: string; label: string; gradient: string }>).map(h => html`
                <button
                  class="header-style-btn ${ov.header_style === h.key ? 'header-style-btn--active' : ''}"
                  type="button"
                  @click=${() => this._setOverride('header_style', h.key)}
                >
                  <div class="header-style-preview" style="background: ${h.gradient};"></div>
                  <span class="header-style-label">${h.label}</span>
                </button>
              `)}
              <button
                class="header-style-btn ${ov.header_style === 'custom' ? 'header-style-btn--active' : ''}"
                type="button"
                @click=${() => this._setOverride('header_style', 'custom')}
              >
                <div class="header-style-preview" style="background: ${ov.header_custom || '#333'};"></div>
                <span class="header-style-label">Custom</span>
              </button>
            </div>
            ${ov.header_style === 'custom' ? html`
              <div class="header-custom-row">
                <input type="color" class="bg-color-input"
                  .value=${ov.header_custom || '#333333'}
                  @input=${(e: Event) => {
                    this._themeOverrides = { ...this._themeOverrides, header_custom: (e.target as HTMLInputElement).value };
                    this._dispatchThemePreview();
                  }}
                />
                <span class="bg-color-hex">${ov.header_custom || '#333333'}</span>
              </div>
            ` : ''}
          </div>

          <!-- Corners -->
          <div class="customize-group">
            <label class="pv-label">Corners</label>
            <div class="pill-group">
              ${(['sharp', 'rounded', 'pill'] as const).map(style => html`
                <button
                  class="pill-btn ${(ov.corner_style || 'rounded') === style ? 'pill-btn--active' : ''}"
                  type="button"
                  @click=${() => this._setOverride('corner_style', style)}
                >${style.charAt(0).toUpperCase() + style.slice(1)}</button>
              `)}
            </div>
          </div>

          <!-- Shadows -->
          <div class="customize-group">
            <label class="pv-label">Shadows</label>
            <div class="pill-group">
              ${(['none', 'subtle', 'bold'] as const).map(depth => html`
                <button
                  class="pill-btn ${(ov.shadow_depth || 'subtle') === depth ? 'pill-btn--active' : ''}"
                  type="button"
                  @click=${() => this._setOverride('shadow_depth', depth)}
                >${depth.charAt(0).toUpperCase() + depth.slice(1)}</button>
              `)}
            </div>
          </div>

          <!-- Avatar Border -->
          <div class="customize-group">
            <label class="pv-label">Avatar Border</label>
            <div class="pill-group">
              ${(['primary', 'light'] as const).map(mode => html`
                <button
                  class="pill-btn ${(ov.avatar_border || 'primary') === mode ? 'pill-btn--active' : ''}"
                  type="button"
                  @click=${() => this._setOverride('avatar_border', mode)}
                >${mode === 'primary' ? 'Primary' : 'Light'}</button>
              `)}
            </div>
            <div class="bg-custom-row" style="margin-top: 0.375rem;">
              <label class="bg-custom-label">Custom:</label>
              <input type="color" class="bg-color-input"
                .value=${(ov.avatar_border && ov.avatar_border !== 'primary' && ov.avatar_border !== 'light') ? ov.avatar_border : '#6366F1'}
                @input=${(e: Event) => this._setOverride('avatar_border', (e.target as HTMLInputElement).value)}
              />
              ${ov.avatar_border && ov.avatar_border !== 'primary' && ov.avatar_border !== 'light' ? html`
                <span class="bg-color-hex">${ov.avatar_border}</span>
              ` : ''}
            </div>
          </div>

          <!-- Now Line Color -->
          <div class="customize-group">
            <label class="pv-label">Now Indicator</label>
            <div class="bg-options">
              <button class="pill-btn ${!ov.now_color ? 'pill-btn--active' : ''}" type="button"
                @click=${() => this._setOverride('now_color', undefined)}>Theme Default</button>
              <div class="bg-custom-row">
                <label class="bg-custom-label">Custom:</label>
                <input type="color" class="bg-color-input"
                  .value=${ov.now_color || '#EF4444'}
                  @input=${(e: Event) => this._setOverride('now_color', (e.target as HTMLInputElement).value)}
                />
                ${ov.now_color ? html`
                  <span class="bg-color-hex">${ov.now_color}</span>
                ` : ''}
              </div>
            </div>
          </div>

          <!-- Event Style -->
          <div class="customize-group">
            <label class="pv-label">Event Style</label>
            <div class="pill-group">
              ${(['stripes', 'solid'] as const).map(style => html`
                <button
                  class="pill-btn ${(ov.event_style || 'stripes') === style ? 'pill-btn--active' : ''}"
                  type="button"
                  @click=${() => this._setOverride('event_style', style)}
                >${style === 'stripes' ? 'Stripes' : 'Solid'}</button>
              `)}
            </div>
          </div>

          <!-- Reset -->
          ${hasOverrides ? html`
            <button class="reset-btn" type="button" @click=${this._resetOverrides}>
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="currentColor"/>
              </svg>
              Reset to Base Theme
            </button>
          ` : ''}

        </div>
      ` : ''}
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
              @click=${() => { this._theme = t.key; this._dispatchThemePreview(); }}
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

        ${this._renderCustomize()}
      </div>
    `;
  }

  render() {
    const isSettings = this.mode === 'settings';
    const pageLabels = ['Preferences', 'Calendars', 'Theme'];
    const isLast = this._page === 2;

    // Right button label
    let rightBtnLabel: string;
    if (isSettings) {
      rightBtnLabel = this._saving ? 'Saving…' : 'Save';
    } else {
      rightBtnLabel = isLast ? (this._saving ? 'Saving…' : 'Finish') : 'Next';
    }

    // Right button shows checkmark icon when it's a terminal action
    const showCheckIcon = isSettings || isLast;
    const showChevronIcon = !isSettings && !isLast;

    return html`
      <div class="wizard-container" role="dialog" aria-modal="true"
        aria-label="${isSettings ? 'PlanaVista Settings' : 'PlanaVista Setup'} — ${pageLabels[this._page]}">

        <div class="wizard-header">

          <!-- Left: Close (settings) or Back (onboarding) -->
          <div class="wizard-nav-left">
            ${isSettings ? html`
              <button class="pv-btn pv-btn-secondary back-btn" type="button"
                @click=${this._cancel}>
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
                </svg>
                Close
              </button>
            ` : html`
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
            `}
          </div>

          <!-- Center: Tabs (settings) or Brand+Dots (onboarding) -->
          <div class="wizard-header-center">
            ${isSettings ? html`
              <div class="settings-tabs" role="tablist">
                ${pageLabels.map((label, i) => html`
                  <button
                    class="settings-tab ${this._page === i ? 'settings-tab--active' : ''}"
                    role="tab"
                    aria-selected="${this._page === i}"
                    type="button"
                    @click=${() => { this._page = i; }}
                  >${label}</button>
                `)}
              </div>
            ` : html`
              <div class="wizard-brand">
                <span class="wizard-logo" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z" fill="currentColor"/>
                  </svg>
                </span>
                <span class="wizard-title-text">PlanaVista Setup</span>
              </div>
              ${this._renderProgressDots()}
            `}
          </div>

          <!-- Right: Save (settings) or Next/Finish (onboarding) -->
          <div class="wizard-nav-right">
            <button
              class="pv-btn pv-btn-primary next-btn"
              type="button"
              ?disabled=${this._saving}
              @click=${isSettings ? () => this._finish() : () => this._goNext()}
            >
              ${showCheckIcon ? html`
                ${this._saving ? html`
                  <span class="spinner" aria-hidden="true"></span>
                ` : html`
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
                  </svg>
                `}
              ` : ''}
              ${rightBtnLabel}
              ${showChevronIcon ? html`
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" fill="currentColor"/>
                </svg>
              ` : ''}
            </button>
          </div>
        </div>

        ${this._saveError ? html`<p class="save-error-banner" role="alert">${this._saveError}</p>` : nothing}

        <div class="wizard-content">
          ${this._page === 0 ? this._renderPage0() : ''}
          ${this._page === 1 ? this._renderPage1() : ''}
          ${this._page === 2 ? this._renderPage2() : ''}
        </div>

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
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        padding: 0.625rem 1rem;
        border-bottom: 1px solid var(--pv-border-subtle, #E5E7EB);
        flex-shrink: 0;
        background: var(--pv-card-bg, #FFFFFF);
        gap: 0.5rem;
      }

      .wizard-nav-left {
        justify-self: start;
      }

      .wizard-header-center {
        justify-self: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
      }

      .wizard-nav-right {
        justify-self: end;
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

      /* ── Settings tabs (settings mode) ───────────────────────── */

      .settings-tabs {
        display: flex;
        gap: 2px;
        background: var(--pv-border-subtle, #E5E7EB);
        border-radius: 8px;
        padding: 2px;
      }

      .settings-tab {
        padding: 6px 14px;
        border: none;
        border-radius: 6px;
        background: transparent;
        color: var(--pv-text-secondary, #6B7280);
        font-size: 0.8125rem;
        font-weight: 600;
        cursor: pointer;
        transition: all var(--pv-transition, 200ms ease);
        font-family: inherit;
        min-height: 32px;
        -webkit-tap-highlight-color: transparent;
      }

      .settings-tab--active {
        background: var(--pv-card-bg, #FFFFFF);
        color: var(--pv-text, #1A1B1E);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .settings-tab:hover:not(.settings-tab--active) {
        color: var(--pv-text, #1A1B1E);
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
        gap: 0.625rem;
      }

      .cal-row {
        display: flex;
        flex-direction: column;
        padding: 0.875rem 1rem;
        border: 1px solid var(--pv-border-subtle, #E5E7EB);
        border-radius: var(--pv-radius, 12px);
        background: var(--pv-card-bg, #FFFFFF);
        transition: border-color var(--pv-transition, 200ms ease), box-shadow var(--pv-transition, 200ms ease), opacity var(--pv-transition, 200ms ease);
      }

      .cal-row:has(.cal-checkbox:checked) {
        border-color: var(--pv-accent, #6366F1);
      }

      /* Always-visible header row */
      .cal-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .cal-drag-handle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        flex-shrink: 0;
        cursor: grab;
        color: var(--pv-text-muted, #9CA3AF);
        border-radius: 4px;
        transition: color var(--pv-transition, 200ms ease);
      }

      .cal-drag-handle:hover {
        color: var(--pv-text-secondary, #6B7280);
      }

      .cal-drag-handle:active {
        cursor: grabbing;
      }

      .cal-row--dragging {
        opacity: 0.4;
      }

      .cal-row--dragover {
        border-color: var(--pv-accent, #6366F1);
        box-shadow: 0 0 0 2px color-mix(in srgb, var(--pv-accent, #6366F1) 20%, transparent);
      }

      .cal-header-info {
        display: flex;
        flex-direction: column;
        gap: 1px;
        min-width: 0;
        flex: 1;
      }

      .cal-friendly-name {
        font-size: 0.9375rem;
        font-weight: 500;
        color: var(--pv-text, #1A1B1E);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .cal-entity-id {
        font-size: 0.6875rem;
        color: var(--pv-text-muted, #9CA3AF);
        font-family: monospace;
        letter-spacing: 0.01em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* Custom checkbox */
      .cal-checkbox-wrap {
        display: flex;
        align-items: center;
        cursor: pointer;
        flex-shrink: 0;
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

      /* Expanded details (only shown when included) */
      .cal-details {
        display: flex;
        flex-direction: column;
        gap: 0.875rem;
        margin-top: 0.875rem;
        padding-top: 0.875rem;
        border-top: 1px solid var(--pv-border-subtle, #E5E7EB);
        animation: pv-fadeIn 200ms ease forwards;
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

      /* ── Customize accordion (page 2) ─────────────────────── */

      .customize-toggle {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        margin-top: 1.5rem;
        padding: 0.75rem 0;
        border: none;
        border-top: 1px solid var(--pv-border-subtle, #E5E7EB);
        background: transparent;
        cursor: pointer;
        font-family: inherit;
        -webkit-tap-highlight-color: transparent;
      }

      .customize-toggle-label {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--pv-text-secondary, #6B7280);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .customize-toggle-chevron {
        fill: var(--pv-text-secondary, #6B7280);
        transition: transform var(--pv-transition, 200ms ease);
      }

      .customize-toggle-chevron.open {
        transform: rotate(180deg);
      }

      .customize-section {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        padding-top: 0.5rem;
        animation: pv-fadeIn 200ms ease forwards;
      }

      .customize-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      /* Background options */
      .bg-options {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .bg-custom-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .bg-custom-label {
        font-size: 0.8125rem;
        color: var(--pv-text-secondary, #6B7280);
        font-weight: 500;
      }

      .bg-color-input {
        width: 36px;
        height: 36px;
        border: 2px solid var(--pv-border-subtle, #E5E7EB);
        border-radius: 8px;
        padding: 2px;
        cursor: pointer;
        background: transparent;
      }

      .bg-color-hex {
        font-size: 0.75rem;
        font-family: monospace;
        color: var(--pv-text-muted, #9CA3AF);
      }

      /* Header style grid */
      .header-style-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
      }

      @media (max-width: 400px) {
        .header-style-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      .header-style-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 6px;
        border: 2px solid var(--pv-border-subtle, #E5E7EB);
        border-radius: var(--pv-radius-sm, 8px);
        background: transparent;
        cursor: pointer;
        font-family: inherit;
        transition: all var(--pv-transition, 200ms ease);
        -webkit-tap-highlight-color: transparent;
      }

      .header-style-btn:hover {
        border-color: var(--pv-accent, #6366F1);
      }

      .header-style-btn--active {
        border-color: var(--pv-accent, #6366F1);
        box-shadow: 0 0 0 2px color-mix(in srgb, var(--pv-accent, #6366F1) 25%, transparent);
      }

      .header-style-preview {
        width: 100%;
        height: 24px;
        border-radius: 4px;
      }

      .header-style-label {
        font-size: 0.6875rem;
        font-weight: 500;
        color: var(--pv-text-secondary, #6B7280);
      }

      .header-custom-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: 0.5rem;
      }

      /* Reset button */
      .reset-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.5rem 1rem;
        border: 1px solid var(--pv-border-subtle, #E5E7EB);
        border-radius: 9999px;
        background: transparent;
        color: var(--pv-text-secondary, #6B7280);
        font-size: 0.8125rem;
        font-weight: 500;
        font-family: inherit;
        cursor: pointer;
        transition: all var(--pv-transition, 200ms ease);
        align-self: flex-start;
        -webkit-tap-highlight-color: transparent;
      }

      .reset-btn svg {
        fill: currentColor;
      }

      .reset-btn:hover {
        border-color: var(--pv-accent, #6366F1);
        color: var(--pv-accent, #6366F1);
      }

      /* ── Save error banner ───────────────────────────────────── */

      .save-error-banner {
        padding: 0.5rem 1.5rem;
        background: color-mix(in srgb, var(--error-color, #EF4444) 10%, transparent);
        color: var(--error-color, #EF4444);
        font-size: 0.8125rem;
        margin: 0;
        text-align: center;
        flex-shrink: 0;
      }

      .back-btn {
        gap: 0.25rem;
        padding: 0.375rem 0.75rem;
        font-size: 0.875rem;
        min-height: 36px;
      }

      .back-btn--hidden {
        visibility: hidden;
        pointer-events: none;
      }

      .next-btn {
        gap: 0.25rem;
        padding: 0.375rem 0.875rem;
        font-size: 0.875rem;
        min-height: 36px;
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

      /* ═══════════ RESPONSIVE BREAKPOINTS ═══════════ */

      /* xs: phones — compact wizard */
      @media (max-width: 479px) {
        .wizard-header { padding: 0.5rem 0.625rem; gap: 0.25rem; }
        .wizard-title-text { font-size: 0.8125rem; }
        .wizard-content { padding: 1rem; }
        .page-title { font-size: 1.125rem; }
        .page-subtitle { font-size: 0.8125rem; margin-bottom: 1.25rem; }
        .field-group { margin-bottom: 1rem; }
        .pill-btn { padding: 0.375rem 0.875rem; min-height: 38px; font-size: 0.8125rem; }
        .view-grid { grid-template-columns: repeat(2, 1fr); }
        .theme-grid { grid-template-columns: 1fr; }
        .settings-tabs { flex-wrap: wrap; }
        .settings-tab { font-size: 0.75rem; padding: 5px 10px; }
        .back-btn, .next-btn { font-size: 0.75rem; padding: 0.25rem 0.5rem; min-height: 32px; }
      }

      /* sm: large phones */
      @media (min-width: 480px) and (max-width: 767px) {
        .wizard-content { padding: 1.25rem; }
        .page-title { font-size: 1.25rem; }
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    'pv-onboarding-wizard': PvOnboardingWizard;
  }
}
