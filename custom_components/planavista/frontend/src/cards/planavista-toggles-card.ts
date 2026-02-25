import { LitElement, html, css, nothing, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { PlanaVistaTogglesConfig, CalendarConfig, DisplayConfig } from '../types';
import { PlanaVistaController } from '../state/state-manager';
import { applyTheme, resolveTheme } from '../styles/themes';
import { baseStyles, buttonStyles } from '../styles/shared';
import { getPlanaVistaData, getPersonAvatar, getPersonName } from '../utils/ha-utils';

@customElement('planavista-toggles-card')
export class PlanaVistaTogglesCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config!: PlanaVistaTogglesConfig;

  private _pv = new PlanaVistaController(this);

  static styles = [
    baseStyles,
    buttonStyles,
    css`
      :host { display: block; }

      ha-card {
        padding: 1rem 1.25rem;
      }

      .toggles-container {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .toggles-container.vertical {
        flex-direction: column;
      }

      .toggle-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.875rem;
        border: 2px solid transparent;
        border-radius: 9999px;
        cursor: pointer;
        transition: all var(--pv-transition, 200ms ease);
        min-height: 48px;
        font-family: inherit;
        font-size: 0.8125rem;
        font-weight: 500;
        -webkit-tap-highlight-color: transparent;
        user-select: none;
        background: transparent;
      }

      .toggle-btn.active {
        color: white;
        box-shadow: 0 2px 8px color-mix(in srgb, var(--cal-color) 30%, transparent);
      }

      .toggle-btn.inactive {
        background: var(--pv-event-hover, rgba(0, 0, 0, 0.03));
        color: var(--pv-text-muted, #9CA3AF);
        border-color: var(--pv-border-subtle);
      }

      .toggle-btn:hover {
        transform: translateY(-1px);
      }

      .toggle-btn:active {
        transform: translateY(0) scale(0.98);
      }

      .avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        object-fit: cover;
        flex-shrink: 0;
      }

      .avatar-placeholder {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        font-weight: 600;
        flex-shrink: 0;
      }

      .toggle-btn.active .avatar-placeholder {
        background: rgba(255, 255, 255, 0.25);
        color: white;
      }

      .toggle-btn.inactive .avatar-placeholder {
        background: var(--pv-border);
        color: var(--pv-text-muted);
      }

      .color-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .divider {
        width: 1px;
        height: 32px;
        background: var(--pv-border);
        margin: 0 0.25rem;
        flex-shrink: 0;
      }

      .new-event-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 9999px;
        background: var(--pv-accent);
        color: var(--pv-accent-text);
        font-family: inherit;
        font-size: 0.8125rem;
        font-weight: 600;
        cursor: pointer;
        transition: all var(--pv-transition, 200ms ease);
        min-height: 48px;
        -webkit-tap-highlight-color: transparent;
        box-shadow: 0 2px 8px color-mix(in srgb, var(--pv-accent) 25%, transparent);
      }

      .new-event-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px color-mix(in srgb, var(--pv-accent) 35%, transparent);
      }

      .new-event-btn:active {
        transform: translateY(0) scale(0.98);
      }

      .new-event-btn ha-icon {
        --mdc-icon-size: 18px;
      }

      .view-switcher {
        display: flex;
        gap: 2px;
        background: var(--pv-border-subtle);
        border-radius: var(--pv-radius-sm, 8px);
        padding: 3px;
        margin-top: 0.75rem;
      }

      .view-btn {
        flex: 1;
        padding: 0.375rem 0.75rem;
        border: none;
        border-radius: 6px;
        background: transparent;
        color: var(--pv-text-secondary);
        font-family: inherit;
        font-size: 0.75rem;
        font-weight: 500;
        cursor: pointer;
        transition: all var(--pv-transition, 200ms ease);
        text-transform: capitalize;
        min-height: 36px;
      }

      .view-btn.active {
        background: var(--pv-card-bg);
        color: var(--pv-text);
        box-shadow: var(--pv-shadow);
      }

      .view-btn:hover:not(.active) {
        color: var(--pv-text);
      }
    `,
  ];

  setConfig(config: PlanaVistaTogglesConfig) {
    this._config = {
      entity: 'sensor.planavista_config',
      layout: 'horizontal',
      show_names: true,
      show_add_button: true,
      ...config,
    };
  }

  updated(changedProps: PropertyValues) {
    super.updated(changedProps);
    if (changedProps.has('hass') || changedProps.has('_config')) {
      const data = getPlanaVistaData(this.hass, this._config?.entity);
      const theme = resolveTheme(this._config?.theme, data?.display?.theme);
      applyTheme(this, theme);
    }
  }

  private _getCalendars(): CalendarConfig[] {
    if (!this.hass) return [];
    const data = getPlanaVistaData(this.hass, this._config?.entity);
    return data?.calendars || [];
  }

  private _isHidden(entityId: string): boolean {
    return this._pv.state.hiddenCalendars.has(entityId);
  }

  private _toggleCalendar(entityId: string) {
    this._pv.state.toggleCalendar(entityId);
  }

  private _openCreateDialog() {
    this._pv.state.openCreateDialog();
  }

  private _setView(view: 'day' | 'week' | 'month') {
    this._pv.state.setView(view);
  }

  render() {
    if (!this._config || !this.hass) return nothing;

    const calendars = this._getCalendars();
    const layout = this._config.layout || 'horizontal';
    const showNames = this._config.show_names !== false;
    const showAddButton = this._config.show_add_button !== false;
    const currentView = this._pv.state.currentView;

    return html`
      <ha-card>
        <div class="toggles-container ${layout === 'vertical' ? 'vertical' : ''}">
          ${calendars.map(cal => this._renderToggle(cal, showNames))}
          ${showAddButton && calendars.length > 0 ? html`<div class="divider"></div>` : nothing}
          ${showAddButton ? html`
            <button class="new-event-btn" @click=${this._openCreateDialog}>
              <ha-icon icon="mdi:plus"></ha-icon>
              New Event
            </button>
          ` : nothing}
        </div>

        <div class="view-switcher">
          ${(['day', 'week', 'month'] as const).map(view => html`
            <button
              class="view-btn ${currentView === view ? 'active' : ''}"
              @click=${() => this._setView(view)}
            >${view}</button>
          `)}
        </div>
      </ha-card>
    `;
  }

  private _renderToggle(cal: CalendarConfig, showName: boolean) {
    const hidden = this._isHidden(cal.entity_id);
    const avatar = cal.person_entity ? getPersonAvatar(this.hass, cal.person_entity) : null;
    const name = showName
      ? (cal.person_entity ? getPersonName(this.hass, cal.person_entity) : cal.display_name)
      : '';
    const initial = name ? name[0].toUpperCase() : '?';

    return html`
      <button
        class="toggle-btn ${hidden ? 'inactive' : 'active'}"
        style="${!hidden ? `background: ${cal.color}; --cal-color: ${cal.color};` : ''}"
        @click=${() => this._toggleCalendar(cal.entity_id)}
      >
        ${avatar
          ? html`<img class="avatar" src="${avatar}" alt="${name}" />`
          : showName
            ? html`<span class="avatar-placeholder">${initial}</span>`
            : html`<span class="color-dot" style="background: ${cal.color}"></span>`}
        ${showName ? html`<span>${name}</span>` : nothing}
      </button>
    `;
  }

  getCardSize(): number {
    return 2;
  }

  static getStubConfig() {
    return {
      entity: 'sensor.planavista_config',
      show_names: true,
      show_add_button: true,
    };
  }
}
