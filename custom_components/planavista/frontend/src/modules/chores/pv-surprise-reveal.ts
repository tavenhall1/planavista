import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { defineElement } from '../../utils/define';
import { BOUNCY, GENTLE, motionOf, springEasing } from '../../core/motion';
import { chime, haptic } from './effects';
import { pictureOf } from './pv-chore-tile';
import { presentArt } from './surprise-art';
import { REVEAL, confettiPieces, revealWords, type SurpriseModel } from './surprise-derive';

export interface RevealDetail {
  model: SurpriseModel;
  name: string;
  color: string;
  /** Where the present was when the hold finished (the reveal's first frame); null starts in the middle. */
  from: DOMRect | null;
  /** The household's Sound setting. */
  sound: boolean;
  /** Its ask is already waiting for a parent. */
  asked?: boolean;
}

/**
 * pv-surprise-reveal: the goal surprise's full-screen opening (milestone 10).
 *
 * The present flies from where the hold left it to the middle, shakes, pops
 * its lid in a burst of confetti and stars, and the reward rises out with the
 * child's name. Then the reward's own button and Later. A tap skips to the
 * end, but only a press that began on this layer: the finger that finished
 * the hold lifts here, and Safari sends its click to whatever is under it.
 * The card shows it outside ha-card (whose container query would hold a fixed
 * layer inside the card), so it covers Home Assistant's own bars too. It
 * fires `pv-reveal-choice` (ask or later) and then `pv-fullscreen-done`.
 */
export class PvSurpriseReveal extends LitElement {
  @property({ attribute: false }) detail!: RevealDetail;
  @state() private _ready = false;
  private _animations: Animation[] = [];
  private _timers: number[] = [];
  private _pressed = false;
  private _closing = false;

  static styles = css`
    :host {
      position: fixed;
      inset: 0;
      z-index: 2000;
      display: block;
      font-family: var(--pv-font-family, -apple-system, system-ui, sans-serif);
      --gold: var(--pv-present-gold, #F5B800);
      --s: min(40vw, 40vh);
      --y: 42%;
    }

    /* A short screen (a phone held sideways): the picture smaller and higher, the buttons clear of the home indicator (review B4). */
    @media (max-height: 500px) {
      :host {
        --s: min(40vw, 32vh);
        --y: 36%;
      }
    }

    .layer {
      position: absolute;
      inset: 0;
      overflow: hidden;
      background: radial-gradient(circle at 50% var(--y), color-mix(in srgb, var(--member) 38%, rgba(12, 12, 24, 0.86)), rgba(12, 12, 24, 0.9) 65%);
      touch-action: none;
      -webkit-tap-highlight-color: transparent;
      -webkit-user-select: none;
      user-select: none;
    }

    .gift, .reward {
      position: absolute;
      left: 50%;
      top: var(--y);
      width: var(--s);
      height: var(--s);
      margin: calc(var(--s) / -2) 0 0 calc(var(--s) / -2);
    }

    .gift .present {
      width: 100%;
      height: 100%;
      overflow: visible;
    }

    .gift .lid, .gift .box {
      transform-box: fill-box;
      transform-origin: 50% 100%;
    }

    .shaker {
      display: block;
      width: 100%;
      height: 100%;
      transform-origin: 50% 85%;
    }

    .reward {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: calc(var(--s) * 0.62);
      line-height: 1;
      opacity: 0;
      filter: drop-shadow(0 8px 24px color-mix(in srgb, var(--gold) 55%, transparent));
    }

    .words {
      position: absolute;
      left: 16px;
      right: 16px;
      top: calc(var(--y) + var(--s) / 2 + 12px);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      color: #FFFFFF;
      text-align: center;
      opacity: 0;
    }

    .title {
      font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
      font-weight: 800;
      font-size: clamp(1.75rem, 6vmin, 3rem);
      line-height: 1.1;
    }

    .name {
      font-size: clamp(1.125rem, 3.4vmin, 1.75rem);
      font-weight: 700;
      opacity: 0.92;
    }

    .buttons {
      display: flex;
      gap: 12px;
      margin-top: 18px;
      flex-wrap: wrap;
      justify-content: center;
      opacity: 0;
      pointer-events: none;
    }

    .ready .buttons {
      pointer-events: auto;
    }

    button {
      min-height: 56px;
      min-width: 140px;
      padding: 0 28px;
      border-radius: 28px;
      font: inherit;
      font-size: 1.125rem;
      font-weight: 800;
      cursor: pointer;
      border: none;
    }

    .ask {
      background: var(--gold);
      color: #2A1F00;
      box-shadow: 0 6px 20px color-mix(in srgb, var(--gold) 45%, transparent);
    }

    .later {
      background: rgba(255, 255, 255, 0.14);
      color: #FFFFFF;
    }

    button:focus-visible {
      outline: 3px solid #FFFFFF;
      outline-offset: 3px;
    }

    .piece {
      position: absolute;
      left: 50%;
      top: var(--y);
      border-radius: 2px;
      opacity: 0;
      pointer-events: none;
    }

    .piece.star {
      border-radius: 0;
      background: none !important;
      color: var(--gold);
      line-height: 1;
    }
  `;

  render() {
    const d = this.detail;
    if (!d) return nothing;
    const words = revealWords(d.name, d.model.reward, !!d.asked);
    const reduced = motionOf(this) === 'reduced';
    const pieces = reduced ? [] : confettiPieces(80, d.model.memberId.length * 7919 + d.model.reward.cost, d.color);
    return html`
      <div class="layer ${this._ready ? 'ready' : ''}" style="--member:${d.color}" role="dialog" aria-modal="true"
        aria-label=${words.title} @pointerdown=${this._down} @click=${this._click} @keydown=${this._key}>
        ${pieces.map(p => html`<span class="piece ${p.star ? 'star' : ''}" data-dx=${p.dx} data-dy=${p.dy} data-spin=${p.spin}
          data-delay=${p.delay} style="width:${p.size}px;height:${p.star ? p.size : Math.round(p.size * 0.6)}px;margin:${-p.size / 2}px 0 0 ${-p.size / 2}px;background:${p.color};font-size:${p.size + 6}px"
          aria-hidden="true">${p.star ? '★' : ''}</span>`)}
        <div class="gift" aria-hidden="true"><span class="shaker">${presentArt()}</span></div>
        <div class="reward" aria-hidden="true">${pictureOf(d.model.reward.icon) || '🎁'}</div>
        <div class="words">
          <span class="title">${words.title}</span>
          <span class="name">${words.reward}</span>
          <div class="buttons">
            <button class="ask" type="button" ?disabled=${words.asked} @click=${() => this._choose('ask')}>${words.button}</button>
            <button class="later" type="button" @click=${() => this._choose('later')}>Later</button>
          </div>
        </div>
      </div>
    `;
  }

  protected firstUpdated(): void {
    if (motionOf(this) === 'reduced') this._playGently();
    else this._play();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._timers.forEach(t => window.clearTimeout(t));
    this._animations.forEach(a => a.cancel());
  }

  private _q<T extends Element>(selector: string): T | null {
    return this.renderRoot.querySelector<T>(selector);
  }

  private _animate(el: Element | null, keyframes: Keyframe[] | PropertyIndexedKeyframes, options: KeyframeAnimationOptions): void {
    if (!el) return;
    this._animations.push(el.animate(keyframes, { fill: 'both', ...options }));
  }

  private _at(ms: number, run: () => void): void {
    this._timers.push(window.setTimeout(run, ms));
  }

  private _play(): void {
    const gift = this._q<HTMLElement>('.gift');
    const shaker = this._q('.shaker');
    const from = this.detail.from;
    const to = gift?.getBoundingClientRect();
    // 1. From where the hold left it to the middle, still shaking.
    if (gift && from && to && to.width > 0) {
      const dx = from.left + from.width / 2 - (to.left + to.width / 2);
      const dy = from.top + from.height / 2 - (to.top + to.height / 2);
      const fly = springEasing(GENTLE);
      this._animate(gift, { transform: [`translate(${dx}px, ${dy}px) scale(${from.width / to.width})`, 'none'] },
        { duration: Math.max(REVEAL.flyMs, fly.duration), easing: fly.easing });
    } else {
      this._animate(gift, { opacity: [0, 1], transform: ['scale(0.6)', 'none'] }, { duration: REVEAL.flyMs, easing: 'ease-out' });
    }
    this._animate(shaker, { transform: ['rotate(-5deg)', 'rotate(5deg)'] },
      { duration: 90, iterations: REVEAL.shakeAt / 90, direction: 'alternate', fill: 'none' });
    // 2. Two big shakes.
    this._animate(shaker, {
      transform: ['rotate(0deg)', 'rotate(-13deg)', 'rotate(13deg)', 'rotate(-13deg)', 'rotate(13deg)', 'rotate(0deg)'],
    }, { duration: REVEAL.lidAt - REVEAL.shakeAt, delay: REVEAL.shakeAt, easing: 'ease-in-out', fill: 'none' });
    // 3. The lid pops, and the burst.
    const pop = springEasing(BOUNCY);
    this._animate(this._q('.gift .lid'), {
      transform: ['none', 'translate(-18%, -150%) rotate(-32deg)'], opacity: [1, 0],
    }, { duration: 750, delay: REVEAL.lidAt, easing: pop.easing });
    this._animate(this._q('.gift .box'), { transform: ['none', 'scale(1.06, 0.9)', 'none'] },
      { duration: 360, delay: REVEAL.lidAt, easing: 'ease-out' });
    this._confetti();
    this._at(REVEAL.lidAt, () => {
      haptic('ring');
      if (this.detail.sound) chime(true);
    });
    // 4. The reward rises out of the box, which fades away below it.
    this._animate(this._q('.reward'), {
      opacity: [0, 1], transform: ['translateY(18%) scale(0.2)', 'translateY(-8%) scale(1)'],
    }, { duration: 650, delay: REVEAL.riseAt, easing: pop.easing });
    // The fade on the gift, the drop on its shaker: one animation can't add a transform without adding the opacity too.
    this._animate(gift, { opacity: [1, 0] }, { duration: 450, delay: REVEAL.riseAt + 150, easing: 'ease-in' });
    this._animate(shaker, { transform: ['none', 'translateY(14%) scale(0.92)'] },
      { duration: 450, delay: REVEAL.riseAt + 150, easing: 'ease-in', fill: 'forwards' });
    // 5 and 6. The words, then the buttons.
    this._animate(this._q('.words'), { opacity: [0, 1], transform: ['translateY(16px)', 'none'] },
      { duration: 420, delay: REVEAL.wordsAt, easing: 'ease-out' });
    this._animate(this._q('.buttons'), { opacity: [0, 1] }, { duration: 320, delay: REVEAL.buttonsAt, easing: 'ease-out' });
    this._at(REVEAL.buttonsAt, () => this._arrive());
  }

  /** Reduced motion keeps the meaning: the present fades to the reward with a soft glow, then the words and buttons. */
  private _playGently(): void {
    this._animate(this._q('.gift'), { opacity: [0, 1, 1, 0] }, { duration: 1100, easing: 'ease-in-out' });
    this._animate(this._q('.reward'), { opacity: [0, 1] }, { duration: 500, delay: 700, easing: 'ease-out' });
    this._animate(this._q('.words'), { opacity: [0, 1] }, { duration: 400, delay: 1000 });
    this._animate(this._q('.buttons'), { opacity: [0, 1] }, { duration: 300, delay: 1300 });
    this._at(700, () => {
      if (this.detail.sound) chime(true);
    });
    this._at(1300, () => this._arrive());
  }

  private _confetti(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderRoot.querySelectorAll<HTMLElement>('.piece').forEach(piece => {
      const dx = Number(piece.dataset.dx) * w;
      const dy = Number(piece.dataset.dy) * h;
      const spin = Number(piece.dataset.spin);
      this._animate(piece, [
        { opacity: 1, transform: 'translate(0, 0) rotate(0deg) scale(0.6)' },
        { opacity: 1, transform: `translate(${dx * 0.7}px, ${dy * 0.4 - h * 0.18}px) rotate(${spin * 0.5}deg) scale(1)`, offset: 0.35 },
        { opacity: 0, transform: `translate(${dx}px, ${dy + h * 0.25}px) rotate(${spin}deg) scale(0.9)` },
      ], { duration: REVEAL.confettiMs, delay: REVEAL.lidAt + Number(piece.dataset.delay), easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)' });
    });
  }

  private _arrive(): void {
    if (this._ready) return;
    this._ready = true;
    void this.updateComplete.then(() => this._q<HTMLButtonElement>('.ask')?.focus());
  }

  /** A tap anywhere jumps to the end; the hold's own lifting finger doesn't count. */
  private _down = (event: PointerEvent): void => {
    this._pressed = !(event.target as Element).closest?.('button');
  };

  private _click = (event: MouseEvent): void => {
    const pressed = this._pressed;
    this._pressed = false;
    if (!pressed || (event.target as Element).closest?.('button') || this._ready) return;
    this._skip();
  };

  private _skip(): void {
    this._timers.forEach(t => window.clearTimeout(t));
    this._timers = [];
    for (const animation of this._animations) {
      try {
        animation.finish();
      } catch {
        // An endless animation can't finish; it is done anyway.
        animation.cancel();
      }
    }
    this._arrive();
  }

  private _key = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      event.preventDefault();
      this._choose('later');
    } else if (!this._ready && (event.key === ' ' || event.key === 'Enter')) {
      event.preventDefault();
      this._skip();
    }
  };

  private _choose(choice: 'ask' | 'later'): void {
    if (this._closing) return;
    this._closing = true;
    this.dispatchEvent(new CustomEvent('pv-reveal-choice', { detail: { choice }, bubbles: true, composed: true }));
    const done = () => this.dispatchEvent(new CustomEvent('pv-fullscreen-done', { bubbles: true, composed: true }));
    if (motionOf(this) === 'reduced') {
      done();
      return;
    }
    const layer = this._q('.layer');
    const out = layer?.animate({ opacity: [1, 0] }, { duration: 220, easing: 'ease-in', fill: 'forwards' });
    if (out) out.onfinish = done;
    else done();
  }
}

defineElement('pv-surprise-reveal', PvSurpriseReveal);

declare global {
  interface HTMLElementTagNameMap {
    'pv-surprise-reveal': PvSurpriseReveal;
  }
}
