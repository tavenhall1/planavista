import { LitElement, html, css, nothing, svg, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { defineElement } from '../utils/define';
import { contrastText } from './color';
import { BOUNCY, GENTLE, motionOf, springEasing } from './motion';

/**
 * pv-ring: the signature (spec 11.1). A person's ring fills as their day gets
 * done and closes with a check. One element serves every size: 34 px Week
 * cells, 58 px board columns, 132 px picture tiles, and the calendar's Day
 * view headers. Whatever is slotted (a picture, an icon) sits inside it.
 *
 * Bumping `celebrate` plays the glow and burst once (spec 11.5: celebrations
 * are earned).
 */
export class PvRing extends LitElement {
  @property({ type: Number }) size = 58;
  /** 0 to 1. */
  @property({ type: Number }) progress = 0;
  @property({ type: String }) color = 'currentColor';
  /** Draws the closed check badge. */
  @property({ type: Boolean, reflect: true }) closed = false;
  /** A dashed track: a day still to come (Week). */
  @property({ type: Boolean, reflect: true }) dashed = false;
  /** What a screen reader hears ("Casey, 1 of 3 done today"); empty leaves it to the surroundings. */
  @property({ type: String }) label = '';
  /** Change it to a new number to celebrate once. */
  @property({ type: Number }) celebrate = 0;
  /**
   * A finger drives it (hold to complete): each value is drawn as given, since
   * easing to a target that moves every frame leaves the ring far behind the
   * finger (spec 11.5: it tracks the finger).
   */
  @property({ type: Boolean, reflect: true }) tracking = false;

  static styles = css`
    :host {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      line-height: 0;
    }

    svg.ring {
      position: absolute;
      inset: 0;
      transform: rotate(-90deg);
      overflow: visible;
    }

    .track {
      stroke: var(--pv-ring-track, var(--pv-track, #ECECE8));
    }

    :host([dashed]) .track {
      stroke-dasharray: 3 4;
    }

    .fill {
      transition: stroke-dashoffset var(--pv-ring-ms, 700ms) var(--pv-ring-ease, cubic-bezier(0.2, 0.8, 0.2, 1));
    }

    :host([tracking]) .fill {
      transition: none;
    }

    .inside {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      overflow: hidden;
    }

    .badge {
      position: absolute;
      right: -1px;
      bottom: -1px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      border: 2px solid var(--pv-card-bg, #FFFFFF);
      box-sizing: border-box;
    }

    .glow {
      position: absolute;
      inset: -6px;
      border-radius: 50%;
      pointer-events: none;
      opacity: 0;
    }

    .spark {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 6px;
      height: 6px;
      margin: -3px 0 0 -3px;
      border-radius: 50%;
      pointer-events: none;
      opacity: 0;
    }
  `;

  private get _stroke(): number {
    return this.size >= 100 ? 8 : this.size >= 50 ? 4 : 3;
  }

  protected firstUpdated(): void {
    this._setEasing();
  }

  protected willUpdate(changed: PropertyValues): void {
    // Motion changed in Settings since the first draw: the next fill follows it (round 1).
    if (changed.has('progress')) this._setEasing();
  }

  protected updated(changed: PropertyValues): void {
    if (changed.has('celebrate') && this.celebrate && changed.get('celebrate') !== undefined) this._play();
  }

  private _setEasing(): void {
    if (motionOf(this) === 'reduced') {
      this.style.setProperty('--pv-ring-ms', '180ms');
      this.style.setProperty('--pv-ring-ease', 'linear');
      return;
    }
    const spring = springEasing(GENTLE);
    this.style.setProperty('--pv-ring-ms', `${spring.duration}ms`);
    this.style.setProperty('--pv-ring-ease', spring.easing);
  }

  /** The glow and burst, once. Only opacity and transform animate (spec 11.5: cheap to run). */
  private _play(): void {
    const glow = this.renderRoot.querySelector<HTMLElement>('.glow');
    if (!glow) return;
    if (motionOf(this) === 'reduced') {
      glow.animate({ opacity: [0, 0.5, 0] }, { duration: 500, easing: 'ease-out' });
      return;
    }
    glow.animate(
      { opacity: [0, 0.7, 0], transform: ['scale(0.9)', 'scale(1.15)', 'scale(1.25)'] },
      { duration: 900, easing: 'ease-out' },
    );
    const pop = springEasing(BOUNCY);
    this.animate({ transform: ['scale(1)', 'scale(1.08)', 'scale(1)'] }, { duration: pop.duration, easing: pop.easing });
    const sparks = [...this.renderRoot.querySelectorAll<HTMLElement>('.spark')];
    const reach = this.size * 0.75;
    sparks.forEach((spark, i) => {
      const angle = (i / sparks.length) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * reach;
      const y = Math.sin(angle) * reach;
      spark.animate(
        {
          opacity: [0, 1, 0],
          transform: ['translate(0, 0) scale(0.6)', `translate(${x * 0.7}px, ${y * 0.7}px) scale(1)`, `translate(${x}px, ${y}px) scale(0.4)`],
        },
        { duration: 800, delay: i * 18, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
      );
    });
  }

  render() {
    const size = this.size;
    const stroke = this._stroke;
    const center = size / 2;
    const radius = (size - stroke) / 2;
    const length = 2 * Math.PI * radius;
    const progress = this.closed ? 1 : Math.min(1, Math.max(0, this.progress));
    const inner = size - stroke * 2 - Math.max(2, Math.round(size * 0.06)) * 2;
    const badge = Math.max(14, Math.round(size * 0.32));
    return html`
      <div style="width:${size}px;height:${size}px;position:relative;display:flex;align-items:center;justify-content:center"
        role=${this.label ? 'img' : nothing} aria-label=${this.label || nothing}>
        <div class="glow" style="box-shadow: 0 0 0 4px ${this.color}, 0 0 24px 6px ${this.color}"></div>
        ${[0, 1, 2, 3, 4, 5, 6, 7].map(() => html`<span class="spark" style="background:${this.color}"></span>`)}
        <svg class="ring" width=${size} height=${size} viewBox="0 0 ${size} ${size}" aria-hidden="true">
          ${svg`
            <circle class="track" cx=${center} cy=${center} r=${radius} fill="none" stroke-width=${stroke}></circle>
            <circle class="fill" cx=${center} cy=${center} r=${radius} fill="none" stroke=${this.color}
              stroke-width=${stroke} stroke-linecap="round" stroke-dasharray=${length}
              stroke-dashoffset=${length * (1 - progress)} opacity=${progress > 0 ? 1 : 0}></circle>
          `}
        </svg>
        <div class="inside" style="width:${inner}px;height:${inner}px"><slot></slot></div>
        ${this.closed ? html`
          <span class="badge" aria-hidden="true"
            style="width:${badge}px;height:${badge}px;background:${this.color};color:${contrastText(this.color)}">
            <svg width=${Math.round(badge * 0.6)} height=${Math.round(badge * 0.6)} viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12.5l4.5 4.5L19 7.5"></path>
            </svg>
          </span>
        ` : nothing}
      </div>
    `;
  }
}

defineElement('pv-ring', PvRing);
