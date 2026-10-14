import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { defineElement } from '../../utils/define';
import { HoldGesture } from '../../core/hold';
import { BOUNCY, motionOf, springEasing } from '../../core/motion';
import '../../core/pv-ring';
import { presentArt } from './surprise-art';
import { IDLE_MS, holdPose, idleOffset, surpriseWords, type SurpriseModel } from './surprise-derive';

/** What a finished hold hands the module: the surprise, where the present was, and how to put it back if it can't open. */
export interface SurpriseOpenDetail {
  model: SurpriseModel;
  name: string;
  color: string;
  from: DOMRect;
  settle: (opened: boolean) => void;
}

/**
 * pv-surprise-present: a member's wrapped goal surprise (milestone 10).
 *
 * It wiggles every few seconds while it waits. On the child's screen a hold
 * fills its ring while the present shakes harder and rises: the reveal's
 * first act. A finished hold fires `pv-surprise-open` with where the present
 * was, so the reveal carries on from there without a cut; letting go early
 * springs it back. Elsewhere it says who it waits for and can't be held.
 */
export class PvSurprisePresent extends LitElement {
  @property({ attribute: false }) model!: SurpriseModel;
  @property({ type: String }) name = '';
  @property({ type: String }) color = '#5B5BD6';
  /** This screen may open it (a shared screen or the member's own login). */
  @property({ type: Boolean }) may = false;
  @property({ type: String, reflect: true }) shape: 'tile' | 'row' = 'tile';
  @property({ type: Boolean, reflect: true }) large = false;
  /** A young child's present says Hold me, anyone else's Hold to open (review B9). */
  @property({ type: Boolean }) young = false;
  /** Their place in the household, which sets when the present wiggles (review B6). */
  @property({ type: Number }) order = 0;

  @state() private _fill = 0;
  @state() private _tracking = true;
  /** Handed to the reveal: hidden here until the feed says it's opened, or it comes back. */
  @state() private _away = false;
  private _frame = 0;
  private _holdStart = 0;
  private _idle = 0;
  private _gesture = new HoldGesture({
    progress: fill => {
      this._tracking = true;
      this._fill = fill;
      this._pose(fill);
    },
    complete: () => this._open(),
    rewind: () => {
      this._tracking = false;
      this._fill = 0;
      this._settle();
    },
    tap: () => this._wiggle(),
  });

  static styles = css`
    :host {
      display: block;
      --gold: var(--pv-present-gold, #F5B800);
    }

    .surprise {
      /* Here, where --member is set: on the host it resolved only under a column or My day (review B2). */
      --tint: color-mix(in srgb, var(--member) 12%, var(--pv-card-bg, #FFFFFF));
      position: relative;
      box-sizing: border-box;
      width: 100%;
      container-type: inline-size;
      border-radius: 18px;
      border: 2px solid color-mix(in srgb, var(--gold) 70%, transparent);
      background: linear-gradient(160deg, color-mix(in srgb, var(--gold) 16%, var(--pv-card-bg, #FFFFFF)), var(--tint));
      color: var(--pv-text, #1A1B1E);
    }

    .hold {
      box-sizing: border-box;
      width: 100%;
      min-height: 132px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 14px 8px 12px;
      border-radius: 16px;
      cursor: pointer;
      touch-action: none;
      -webkit-tap-highlight-color: transparent;
      -webkit-user-select: none;
      user-select: none;
    }

    :host([large]) .hold {
      min-height: 300px;
      gap: 10px;
    }

    /* Like the picture tiles beside it on a phone: the ring starts where theirs do (round 3). */
    @container (max-width: 160px) {
      :host(:not([shape='row'])) .hold {
        padding-top: 36px;
      }
    }

    /* In a list it is a row like the rows beside it (review B10); its gold border and ring mark it. */
    :host([shape='row']) .surprise {
      border-radius: 12px;
    }

    :host([shape='row']) .hold {
      min-height: 52px;
      flex-direction: row;
      justify-content: flex-start;
      gap: 12px;
      padding: 4px 12px;
      border-radius: 10px;
    }

    .hold:focus-visible {
      outline: 3px solid var(--pv-accent-ink, #5B5BD6);
      outline-offset: 2px;
    }

    .hold[aria-disabled='true'] {
      cursor: default;
    }

    .art {
      position: relative;
      display: block;
      width: 56px;
      height: 56px;
      transform-origin: 50% 80%;
      will-change: transform;
    }

    :host([large]) .art {
      width: 110px;
      height: 110px;
    }

    :host([shape='row']) .art {
      width: 34px;
      height: 34px;
    }

    .art .present {
      width: 100%;
      height: 100%;
      overflow: visible;
    }

    .sparkle {
      position: absolute;
      font-size: 12px;
      color: var(--gold);
      opacity: 0;
      pointer-events: none;
    }

    .sparkle.a { top: -4px; left: 2px; }
    .sparkle.b { top: -10px; right: 6px; font-size: 15px; }
    .sparkle.c { top: 14px; right: -8px; }

    .glow {
      position: absolute;
      inset: -10px;
      border-radius: 50%;
      background: radial-gradient(circle, color-mix(in srgb, var(--gold) 45%, transparent), transparent 70%);
      opacity: 0;
      pointer-events: none;
    }

    .words {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      text-align: center;
    }

    :host([shape='row']) .words {
      align-items: flex-start;
      text-align: left;
    }

    :host([shape='row']) .title {
      font-family: var(--pv-font-family, inherit);
      font-weight: 600;
      font-size: 1rem;
    }

    .title {
      font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
      font-weight: 800;
      font-size: 1.0625rem;
      line-height: 1.2;
    }

    :host([large]) .title {
      font-size: 1.75rem;
    }

    .hint {
      font-size: 0.8125rem;
      color: var(--pv-text-secondary, #5F6670);
    }

    .away {
      visibility: hidden;
    }
  `;

  connectedCallback(): void {
    super.connectedCallback();
    this._scheduleIdle(idleOffset(this.order));
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    cancelAnimationFrame(this._frame);
    window.clearTimeout(this._idle);
  }

  render() {
    if (!this.model) return nothing;
    const words = surpriseWords(this.name, this.may, this.young);
    const ring = this.large ? 150 : this.shape === 'row' ? 48 : 84;
    return html`
      <div class="surprise ${this._away ? 'away' : ''}" style="--member:${this.color}">
        <div class="hold" role="button" tabindex=${this.may ? 0 : -1} aria-disabled=${this.may ? 'false' : 'true'}
          aria-label=${this.may ? `${words.title} Hold to open it.` : `${words.title} ${words.hint}.`}
          @pointerdown=${this._down} @pointermove=${(e: PointerEvent) => this._gesture.move(e.clientX, e.clientY)}
          @pointerup=${this._up} @pointercancel=${() => this._gesture.cancel()} @keydown=${this._key}
          @contextmenu=${(e: Event) => e.preventDefault()}>
          <pv-ring size=${ring} .progress=${this._fill} ?tracking=${this._tracking} color=${this.color}>
            <span class="art">
              <span class="glow"></span>
              ${presentArt()}
              <span class="sparkle a" aria-hidden="true">✦</span>
              <span class="sparkle b" aria-hidden="true">✦</span>
              <span class="sparkle c" aria-hidden="true">✦</span>
            </span>
          </pv-ring>
          <span class="words">
            <span class="title">${words.title}</span>
            <span class="hint">${words.hint}</span>
          </span>
        </div>
      </div>
    `;
  }

  // Waiting --------------------------------------------------------------------------------

  private _scheduleIdle(delay: number): void {
    window.clearTimeout(this._idle);
    this._idle = window.setTimeout(() => {
      if (this.isConnected && !document.hidden && this._fill === 0 && !this._away) this._wiggle();
      if (this.isConnected) this._scheduleIdle(IDLE_MS);
    }, delay);
  }

  /** The excited wait: a wiggle and a hop with the bow's sparkles; a soft glow with reduced motion. */
  private _wiggle(): void {
    const art = this.renderRoot.querySelector<HTMLElement>('.art');
    if (!art) return;
    if (motionOf(this) === 'reduced') {
      art.querySelector('.glow')?.animate({ opacity: [0, 0.8, 0] }, { duration: 1400, easing: 'ease-in-out' });
      return;
    }
    art.animate([
      { transform: 'translateY(0) rotate(0deg)' },
      { transform: 'translateY(-6px) rotate(-7deg)', offset: 0.25 },
      { transform: 'translateY(-6px) rotate(7deg)', offset: 0.5 },
      { transform: 'translateY(0) rotate(-4deg)', offset: 0.75 },
      { transform: 'translateY(0) rotate(0deg)' },
    ], { duration: 700, easing: 'ease-in-out' });
    art.querySelectorAll('.sparkle').forEach((sparkle, i) => {
      sparkle.animate(
        { opacity: [0, 1, 0], transform: ['scale(0.4)', 'scale(1.15)', 'scale(0.6)'] },
        { duration: 650, delay: 80 + i * 110, easing: 'ease-out' },
      );
    });
  }

  // The hold: the reveal's first act ---------------------------------------------------------

  private _down = (event: PointerEvent): void => {
    if (event.button > 0 || !this.may || this._away) return;
    try {
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    } catch {
      // A hold works without pointer capture too.
    }
    this._holdStart = performance.now();
    this._gesture.down(event.clientX, event.clientY, this._holdStart);
    const tick = (t: number) => {
      this._gesture.frame(t);
      if (this._gesture.holding) this._frame = requestAnimationFrame(tick);
    };
    this._frame = requestAnimationFrame(tick);
  };

  private _up = (): void => {
    cancelAnimationFrame(this._frame);
    this._gesture.up(performance.now());
  };

  private _key = (event: KeyboardEvent): void => {
    if (event.key !== ' ' && event.key !== 'Enter') return;
    event.preventDefault();
    if (this.may && !this._away) this._gesture.key(event.key);
  };

  /** Shake harder, faster, and higher as the hold fills (no shake with reduced motion; the ring still fills). */
  private _pose(fill: number): void {
    const art = this.renderRoot.querySelector<HTMLElement>('.art');
    if (!art || motionOf(this) === 'reduced') return;
    const pose = holdPose(fill);
    const t = performance.now() - this._holdStart;
    const angle = pose.angle * Math.sin((2 * Math.PI * t) / pose.period);
    art.style.transform = `translateY(${-pose.rise}px) rotate(${angle.toFixed(2)}deg) scale(${pose.scale})`;
  }

  /** Let go early: spring back to rest. */
  private _settle(): void {
    const art = this.renderRoot.querySelector<HTMLElement>('.art');
    if (!art) return;
    const from = art.style.transform;
    art.style.transform = '';
    if (!from || motionOf(this) === 'reduced') return;
    const back = springEasing(BOUNCY);
    art.animate({ transform: [from, 'none'] }, { duration: back.duration, easing: back.easing });
  }

  private _open(): void {
    const art = this.renderRoot.querySelector<HTMLElement>('.art');
    const from = art?.getBoundingClientRect() ?? new DOMRect();
    this._fill = 1;
    this._away = true;
    const detail: SurpriseOpenDetail = {
      model: this.model,
      name: this.name,
      color: this.color,
      from,
      settle: opened => {
        if (opened) return;
        this._away = false;
        this._tracking = false;
        this._fill = 0;
        this._settle();
      },
    };
    this.dispatchEvent(new CustomEvent('pv-surprise-open', { detail, bubbles: true, composed: true }));
  }
}

defineElement('pv-surprise-present', PvSurprisePresent);

declare global {
  interface HTMLElementTagNameMap {
    'pv-surprise-present': PvSurprisePresent;
  }
}
