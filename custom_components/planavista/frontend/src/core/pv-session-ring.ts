import { LitElement, html, css, svg } from 'lit';
import { property, state } from 'lit/decorators.js';
import { defineElement } from '../utils/define';
import { SESSION_IDLE_MS } from './session';

/**
 * pv-session-ring: parent mode's countdown, a ring that empties over two
 * minutes. It redraws itself every second, so only this element re-renders.
 */
export class PvSessionRing extends LitElement {
  /** When the session ends (ms since the epoch). */
  @property({ type: Number }) endsAt = 0;
  @property({ type: String }) color = 'currentColor';
  @property({ type: Number }) size = 28;
  @state() private _now = Date.now();
  private _timer: number | undefined;

  connectedCallback(): void {
    super.connectedCallback();
    this._timer = window.setInterval(() => {
      this._now = Date.now();
    }, 1000);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.clearInterval(this._timer);
  }

  static styles = css`
    :host {
      display: inline-flex;
    }

    svg {
      display: block;
      transform: rotate(-90deg);
    }

    .track {
      opacity: 0.25;
    }
  `;

  render() {
    const left = Math.max(0, this.endsAt - this._now);
    const fraction = Math.min(1, left / SESSION_IDLE_MS);
    const stroke = 3;
    const center = this.size / 2;
    const radius = (this.size - stroke) / 2;
    const length = 2 * Math.PI * radius;
    // Screen readers hear the time left in 10-second steps, not every second.
    const spoken = Math.ceil(Math.ceil(left / 1000) / 10) * 10;
    const label = `Parent mode ends in ${Math.floor(spoken / 60)} min ${spoken % 60} s`;
    return html`
      <svg width=${this.size} height=${this.size} viewBox="0 0 ${this.size} ${this.size}" role="img" aria-label=${label}>
        ${svg`
          <circle class="track" cx=${center} cy=${center} r=${radius} fill="none"
            stroke=${this.color} stroke-width=${stroke}></circle>
          <circle cx=${center} cy=${center} r=${radius} fill="none" stroke=${this.color}
            stroke-width=${stroke} stroke-linecap="round"
            stroke-dasharray=${length} stroke-dashoffset=${length * (1 - fraction)}></circle>
        `}
      </svg>
    `;
  }
}

defineElement('pv-session-ring', PvSessionRing);
