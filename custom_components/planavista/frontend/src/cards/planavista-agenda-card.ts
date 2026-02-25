import { LitElement, html, css, nothing, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { PlanaVistaAgendaConfig } from '../types';
import { PlanaVistaController } from '../state/state-manager';
import { applyTheme, resolveTheme } from '../styles/themes';
import { baseStyles } from '../styles/shared';
import { getPlanaVistaData } from '../utils/ha-utils';
import { filterVisibleEvents } from '../utils/event-utils';

import '../components/view-agenda';
import '../components/event-popup';

@customElement('planavista-agenda-card')
export class PlanaVistaAgendaCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config!: PlanaVistaAgendaConfig;

  private _pv = new PlanaVistaController(this);

  static styles = [
    baseStyles,
    css`
      :host { display: block; }

      ha-card {
        overflow: hidden;
      }

      .agenda-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.875rem 1rem;
        border-bottom: 1px solid var(--pv-border-subtle);
      }

      .agenda-title {
        font-size: 0.9375rem;
        font-weight: 600;
        color: var(--pv-text);
      }

      .event-count {
        font-size: 0.75rem;
        color: var(--pv-text-muted);
        font-weight: 500;
      }
    `,
  ];

  setConfig(config: PlanaVistaAgendaConfig) {
    this._config = {
      entity: 'sensor.planavista_config',
      max_events: 10,
      days_ahead: 7,
      show_calendar_name: true,
      show_end_time: false,
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

  render() {
    if (!this._config || !this.hass) return nothing;

    const data = getPlanaVistaData(this.hass, this._config.entity);
    if (!data) return html`<ha-card><div style="padding:1rem;text-align:center;color:var(--pv-text-muted)">No data</div></ha-card>`;

    const events = filterVisibleEvents(data.events || [], this._pv.state.hiddenCalendars);
    const timeFormat = this._config.time_format || data.display?.time_format || '12h';

    return html`
      <ha-card>
        <div class="agenda-header">
          <span class="agenda-title">Upcoming</span>
          <span class="event-count">${events.length} events</span>
        </div>
        <pv-view-agenda
          .hass=${this.hass}
          .events=${events}
          .calendars=${data.calendars || []}
          .currentDate=${new Date()}
          .hiddenCalendars=${this._pv.state.hiddenCalendars}
          .timeFormat=${timeFormat}
          .maxEvents=${this._config.max_events || 10}
          .daysAhead=${this._config.days_ahead || 7}
          .showCalendarName=${this._config.show_calendar_name !== false}
          .showEndTime=${this._config.show_end_time === true}
          .maxHeight=${this._config.max_height || ''}
          @event-click=${this._onEventClick}
        ></pv-view-agenda>

        ${this._pv.state.selectedEvent ? html`
          <pv-event-popup
            .hass=${this.hass}
            .event=${this._pv.state.selectedEvent}
            .timeFormat=${timeFormat}
          ></pv-event-popup>
        ` : nothing}
      </ha-card>
    `;
  }

  private _onEventClick(e: CustomEvent) {
    this._pv.state.selectEvent(e.detail.event);
  }

  getCardSize(): number {
    return 4;
  }

  static getStubConfig() {
    return {
      entity: 'sensor.planavista_config',
      max_events: 10,
      days_ahead: 7,
    };
  }
}
