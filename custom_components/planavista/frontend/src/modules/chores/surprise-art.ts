import { svg } from 'lit';

/**
 * The wrapped present (milestone 10), drawn in the member's color with a gold
 * ribbon and bow. The waiting tile and the reveal draw the same one; the lid
 * is its own group so the reveal can pop it. Colors come from the host's
 * `--member`.
 */
export function presentArt() {
  return svg`
    <svg class="present" viewBox="0 0 64 64" aria-hidden="true">
      <g class="box">
        <rect x="10" y="28" width="44" height="30" rx="4" style="fill: var(--member)"></rect>
        <rect x="10" y="28" width="44" height="30" rx="4" style="fill: url(#pv-present-shade)"></rect>
        <rect x="28" y="28" width="8" height="30" style="fill: var(--pv-present-gold, #F5B800)"></rect>
      </g>
      <g class="lid">
        <rect x="6" y="19" width="52" height="11" rx="3" style="fill: color-mix(in srgb, var(--member) 78%, #000)"></rect>
        <rect x="28" y="19" width="8" height="11" style="fill: var(--pv-present-gold, #F5B800)"></rect>
        <path d="M32 19 C 26 6, 13 9, 21 19 Z M32 19 C 38 6, 51 9, 43 19 Z" style="fill: var(--pv-present-gold, #F5B800)"></path>
        <circle cx="32" cy="19" r="3.6" style="fill: #D99A00"></circle>
      </g>
      <defs>
        <linearGradient id="pv-present-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.18"></stop>
          <stop offset="1" stop-color="#000000" stop-opacity="0.12"></stop>
        </linearGradient>
      </defs>
    </svg>
  `;
}
