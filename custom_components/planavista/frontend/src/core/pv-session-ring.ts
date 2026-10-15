import { LitElement, html, css, svg } from 'lit';
import { property, state } from 'lit/decorators.js';
import { defineElement } from '../utils/define';
import { SESSION_IDLE_MS, sessionWords, spokenTimeLeft } from './session';

/**
 * pv-session-ring: a session's countdown, a ring that empties over the
 * household's quiet time and refills at each touch the backend hears (in the
 * last stretch before the cap it can't refill). It redraws itself every
 * second, so only this element re-renders.
 */
export class PvSessionRing extends LitElement {
  /** When the session ends (ms since the epoch). */
  @property({ type: Number }) endsAt = 0;
  @property({ type: String }) color = 'currentColor';
  @property({ type: Number }) size = 28;
  /** A full ring (ms): Lock after no touches. */
  @property({ type: Number }) span = SESSION_IDLE_MS;
  /** Parent mode, or a child's unlocked window: only the spoken words differ. */
  @property({ type: Boolean }) parent = true;
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
    const fraction = Math.min(1, left / (this.span || SESSION_IDLE_MS));
    const stroke = 3;
    const center = this.size / 2;
    const radius = (this.size - stroke) / 2;
    const length = 2 * Math.PI * radius;
    // Screen readers hear the time left in 10-second steps, not every second.
    const label = `${sessionWords(this.parent).ends} ${spokenTimeLeft(left)}`;
    return html`
      <svg width=${this.size} height=${this.size} viewBox="0 0 ${this.size} ${this.size}" role="img" aria-label=${label}>
        ${svg`
          <circle class="track" cx=${center} cy=${center} r=${radius} fill="none"
            style="stroke: ${this.color}" stroke-width=${stroke}></circle>
          <circle cx=${center} cy=${center} r=${radius} fill="none" style="stroke: ${this.color}"
            stroke-width=${stroke} stroke-linecap="round"
            stroke-dasharray=${length} stroke-dashoffset=${length * (1 - fraction)}></circle>
        `}
      </svg>
    `;
  }
}

defineElement('pv-session-ring', PvSessionRing);
