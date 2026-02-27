import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { CalendarConfig } from '../types';
import { SharedEvent, buildStripeGradient, getOrganizerCalendar, isEventPast } from '../utils/event-utils';
import { contrastText } from '../styles/themes';
import { formatTime } from '../utils/date-utils';
import { getPersonAvatar, getPersonName } from '../utils/ha-utils';
import { baseStyles } from '../styles/shared';

@customElement('pv-event-chip')
export class PVEventChip extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) event!: SharedEvent;
  @property({ attribute: false }) calendars: CalendarConfig[] = [];
  @property({ attribute: false }) timeFormat: '12h' | '24h' = '12h';
  @property({ type: Boolean }) compact = false;
  @property({ type: Boolean }) showStripes = true;
  @property({ type: Number }) tick = 0;

  static styles = [
    baseStyles,
    css`
      :host { display: block; }

      .chip {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        padding: 0.5rem 0.625rem;
        border-radius: 6px;
        border-left: 3px solid var(--chip-border-color);
        cursor: pointer;
        transition: transform 120ms ease, box-shadow 120ms ease;
        min-height: 0;
        overflow: hidden;
      }

      .chip.past { opacity: 0.45; }

      .chip:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      }

      .chip:active {
        transform: scale(0.98);
      }

      .chip-body {
        flex: 1;
        min-width: 0;
      }

      .chip-title {
        font-weight: 600;
        font-size: 0.875rem;
        line-height: 1.3;
        color: var(--chip-text);
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .chip-title--wrap {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        white-space: normal;
      }

      .chip-title--nowrap {
        white-space: nowrap;
      }

      .chip-time {
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--chip-text);
        opacity: 0.8;
        margin-top: 2px;
      }

      .chip-avatars {
        display: flex;
        align-items: center;
        flex-shrink: 0;
        gap: 0;
        margin-left: auto;
        padding-top: 2px;
      }

      .chip-avatar {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid rgba(255,255,255,0.8);
        margin-left: -6px;
        object-fit: cover;
        flex-shrink: 0;
      }

      .chip-avatar:first-child {
        margin-left: 0;
      }

      .chip-initial {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid rgba(255,255,255,0.8);
        margin-left: -6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.625rem;
        font-weight: 700;
        color: white;
        flex-shrink: 0;
      }

      .chip-initial:first-child {
        margin-left: 0;
      }

      .chip-overflow {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid rgba(255,255,255,0.8);
        margin-left: -6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.5rem;
        font-weight: 700;
        color: var(--pv-text-secondary);
        background: var(--pv-card-bg, #f0f0f0);
        flex-shrink: 0;
      }

      /* Compact mode (month view) */
      .chip--compact {
        padding: 0.25rem 0.5rem;
        border-left-width: 2px;
        border-radius: 4px;
      }

      .chip--compact .chip-title {
        font-size: 0.6875rem;
        font-weight: 500;
      }

      /* Responsive — small screens */
      @media (max-width: 479px) {
        .chip { padding: 0.375rem 0.5rem; }
        .chip-title { font-size: 0.8125rem; }
        .chip-time { font-size: 0.6875rem; }
        .chip-avatar, .chip-initial, .chip-overflow { width: 20px; height: 20px; font-size: 0.5rem; }
      }

      /* Large screens */
      @media (min-width: 1024px) {
        .chip { padding: 0.625rem 0.75rem; }
        .chip-title { font-size: 0.9375rem; }
        .chip-time { font-size: 0.8125rem; }
        .chip-avatar, .chip-initial, .chip-overflow { width: 28px; height: 28px; }
      }

      /* XL screens — ~50% larger for wall displays */
      @media (min-width: 1440px) {
        .chip { padding: 1rem 1.25rem; gap: 0.75rem; border-left-width: 4px; }
        .chip-title { font-size: 1.375rem; }
        .chip-time { font-size: 1.125rem; }
        .chip-avatar, .chip-initial, .chip-overflow { width: 40px; height: 40px; font-size: 0.8125rem; }
        .chip--compact { padding: 0.375rem 0.75rem; border-left-width: 3px; }
        .chip--compact .chip-title { font-size: 1rem; }
      }
    `,
  ];

  render() {
    const event = this.event;
    if (!event) return nothing;

    const cals = event.shared_calendars || [];
    const isMulti = cals.length > 1;
    const organizer = getOrganizerCalendar(event, this.calendars);
    const borderColor = organizer?.color || event.calendar_color || 'var(--pv-accent)';

    // Background
    let bgStyle: string;
    if (this.showStripes && isMulti) {
      bgStyle = `background: ${buildStripeGradient(cals)}`;
    } else if (this.showStripes) {
      // Single participant — solid pastel
      const bgColor = cals[0]?.color_light || event.calendar_color_light || event.calendar_color;
      bgStyle = `background: ${bgColor}`;
    } else {
      // Solid mode — theme background
      bgStyle = `background: var(--pv-card-bg, #FFFFFF)`;
    }

    // Text contrast
    const textBg = this.showStripes
      ? (cals[0]?.color_light || event.calendar_color_light || event.calendar_color)
      : '#FFFFFF';
    const textColor = this.showStripes ? contrastText(textBg) : 'var(--pv-text)';

    const past = isEventPast(event) ? ' past' : '';
    const chipClass = (this.compact ? 'chip chip--compact' : 'chip') + past;
    const titleClass = this.compact ? 'chip-title chip-title--wrap' : 'chip-title chip-title--nowrap';

    // Time display
    const isAllDay = !event.start.includes('T') ||
      (new Date(event.end).getTime() - new Date(event.start).getTime() >= 86400000 &&
       event.start.includes('T00:00') && event.end.includes('T00:00'));

    return html`
      <div
        class="${chipClass}"
        style="${bgStyle}; --chip-border-color: ${borderColor}; --chip-text: ${textColor}"
        @click=${this._onClick}
      >
        <div class="chip-body">
          <div class="${titleClass}">${event.summary}</div>
          ${!this.compact ? html`
            <div class="chip-time">
              ${isAllDay ? 'All day' : `${formatTime(event.start, this.timeFormat)} – ${formatTime(event.end, this.timeFormat)}`}
            </div>
          ` : nothing}
        </div>
        ${!this.compact && cals.length > 0 ? this._renderAvatars(cals) : nothing}
      </div>
    `;
  }

  private _renderAvatars(cals: SharedEvent['shared_calendars']) {
    const maxVisible = 4;
    const visible = cals.slice(0, maxVisible);
    const overflow = cals.length - maxVisible;

    return html`
      <div class="chip-avatars">
        ${visible.map(cal => {
          const avatar = cal.person_entity ? getPersonAvatar(this.hass, cal.person_entity) : null;
          const name = cal.person_entity
            ? getPersonName(this.hass, cal.person_entity)
            : cal.display_name || '?';
          if (avatar) {
            return html`<img class="chip-avatar" src="${avatar}" alt="${name}" />`;
          }
          return html`<div class="chip-initial" style="background: ${cal.color}">${name[0]?.toUpperCase() || '?'}</div>`;
        })}
        ${overflow > 0 ? html`<div class="chip-overflow">+${overflow}</div>` : nothing}
      </div>
    `;
  }

  private _onClick() {
    this.dispatchEvent(new CustomEvent('event-click', {
      detail: { event: this.event },
      bubbles: true,
      composed: true,
    }));
  }
}
