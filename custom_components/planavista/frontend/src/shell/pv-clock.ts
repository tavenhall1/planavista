import { LitElement, html, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { defineElement } from '../utils/define';
import { formatClockParts } from '../utils/date-utils';

/**
 * Header date and time. Owns its 1-second timer and re-renders only when the
 * minute changes, so the card itself no longer re-renders every second.
 *
 * Renders into light DOM (no shadow root) so the card's header styles and
 * breakpoints (.pvc-header-date, .pvc-header-time, ...) still apply; the card
 * gives the host `display: contents` so both parts stay header flex items.
 */
export class PVClock extends LitElement {
  @property({ attribute: false }) timeFormat: '12h' | '24h' = '12h';

  /** Minutes since the epoch; changing it is what triggers a render. */
  @state() private _minute = Math.floor(Date.now() / 60000);

  private _timer: ReturnType<typeof setInterval> | null = null;

  protected createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this._minute = Math.floor(Date.now() / 60000);
    this._timer = setInterval(() => {
      const minute = Math.floor(Date.now() / 60000);
      if (minute !== this._minute) this._minute = minute;
    }, 1000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }

  render() {
    const { time, ampm, date } = formatClockParts(new Date(), this.timeFormat);
    return html`
      <div class="pvc-header-date">${date}</div>
      <div class="pvc-header-time">
        <span class="pvc-time-display">${time}</span>${ampm ? html`<span class="pvc-time-ampm">${ampm}</span>` : nothing}
      </div>
    `;
  }
}

defineElement('pv-clock', PVClock);
