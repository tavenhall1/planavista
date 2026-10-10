import { LitElement, html, css, svg } from 'lit';
import { defineElement } from '../../utils/define';

/** Four people's rings, three quarters closed: a hint of what's coming. */
const RING_COLORS = ['#F94144', '#277DA1', '#43AA8B', '#F9C74F'];

/** pv-setup-welcome: the first step (spec 14.7); the host shows its heading and lead. */
export class PvSetupWelcome extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .rings {
      display: flex;
      justify-content: center;
      gap: 18px;
      margin: 24px 0 8px;
    }

    svg {
      transform: rotate(-90deg);
    }
  `;

  render() {
    const size = 72;
    const radius = 30;
    const length = 2 * Math.PI * radius;
    return html`
      <div class="rings" aria-hidden="true">
        ${RING_COLORS.map(color => html`
          <svg width=${size} height=${size} viewBox="0 0 ${size} ${size}">
            ${svg`
              <circle cx="36" cy="36" r=${radius} fill="none" stroke=${color} stroke-width="8" opacity="0.2"></circle>
              <circle cx="36" cy="36" r=${radius} fill="none" stroke=${color} stroke-width="8"
                stroke-linecap="round" stroke-dasharray=${length} stroke-dashoffset=${length * 0.25}></circle>
            `}
          </svg>
        `)}
      </div>
    `;
  }
}

defineElement('pv-setup-welcome', PvSetupWelcome);
