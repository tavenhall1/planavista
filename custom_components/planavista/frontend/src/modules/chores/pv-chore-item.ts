import { LitElement, html, css, nothing, svg, PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { defineElement } from '../../utils/define';
import { HOLD_MS, HoldGesture, MOVE_CANCEL_PX } from '../../core/hold';
import { BOUNCY, motionOf, springEasing } from '../../core/motion';
import { onColor } from '../../core/dimming';
import { choresStyles } from './chores-styles';
import type { RowModel } from './board-derive';
import { rowChange } from './hold-state';
import { badgeBelow } from '../../core/status-map';

/** What a finished hold asks of whoever handles it. */
export interface HoldDetail {
  row: RowModel;
  /** Say whether the check-off goes ahead (a PIN can be refused); false rewinds the circle. */
  settle(accepted: boolean): void;
  /** Where the circle is on screen, for the stars' flight. */
  from: DOMRect;
}

const CIRCLE = 26;
const R = 11.5;
const LENGTH = 2 * Math.PI * R;

/**
 * pv-chore-item: one chore, two zones (spec 13.2). The circle is the "do it"
 * zone: hold it to complete (a quick tap only shows a hint), or hold a done
 * one to uncheck it; Space or Enter does the same. While held, its ring
 * fills and a soft sweep crosses the row. The rest of the row is the
 * "about it" zone: a tap opens the options sheet.
 *
 * @fires pv-hold-done - HoldDetail, a hold finished on an open item
 * @fires pv-hold-undo - HoldDetail, a hold finished on a done item
 * @fires pv-hint - { row } a quick tap on the circle
 * @fires pv-row-options - { row } the rest of the row was tapped
 */
export class PvChoreItem extends LitElement {
  @property({ attribute: false }) row!: RowModel;
  /** The person's color (their ring, their checks). */
  @property({ type: String }) color = '#5B5BD6';
  /** The Now band's rows sit on a pale tint of it. */
  @property({ type: Boolean, reflect: true }) highlight = false;
  /** A panel narrower than about 300 px puts badges under the name (spec 12.3). */
  @property({ type: Boolean, reflect: true }) narrow = false;
  /** This screen may not change this person's items (another child's, on a child's own login). */
  @property({ type: Boolean }) locked = false;
  /** A later band's row: drawn a little quieter (spec 13.1). */
  @property({ type: Boolean, reflect: true }) dim = false;

  @state() private _fill = 0;
  /** A hold finished and waits for its answer: the circle stays full. */
  @state() private _held = false;
  private _frame = 0;
  /** The rewind's own frame, so the browser's lostpointercapture after a release can't stop it. */
  private _rewindFrame = 0;
  /** A press that began where this screen can't hold (waiting, or someone else's): a quick release explains why. */
  private _hintPress: { x: number; y: number; t: number } | null = null;
  private _gesture = new HoldGesture({
    progress: fill => {
      this._fill = fill;
    },
    complete: () => this._finish(),
    rewind: fill => this._rewind(fill),
    tap: () => this._fire('pv-hint', { row: this.row }),
  });

  static styles = [
    choresStyles,
    css`
      :host {
        display: block;
        --tint: color-mix(in srgb, var(--member) 14%, var(--pv-card-bg, #FFFFFF));
      }

      .row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 2px;
        min-height: 52px;
        padding-right: 10px;
        border-radius: 12px;
        overflow: hidden;
      }

      :host([highlight]) .row {
        background: var(--tint);
      }

      .sweep {
        position: absolute;
        inset: 0;
        background: color-mix(in srgb, var(--member) 22%, transparent);
        transform-origin: left center;
        pointer-events: none;
      }

      .circle {
        position: relative;
        flex-shrink: 0;
        width: 48px;
        height: 52px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        background: transparent;
        padding: 0;
        cursor: pointer;
        touch-action: none;
        -webkit-tap-highlight-color: transparent;
        -webkit-user-select: none;
        user-select: none;
      }

      .circle[aria-disabled='true'] {
        cursor: default;
        opacity: 0.5;
      }

      :host([dim]) .name,
      :host([dim]) .end {
        opacity: 0.72;
      }

      .circle:focus-visible {
        outline: none;
      }

      .circle:focus-visible svg {
        outline: 2px solid var(--pv-accent-ink, #5B5BD6);
        outline-offset: 3px;
        border-radius: 50%;
      }

      .circle svg {
        overflow: visible;
      }

      .about {
        position: relative;
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 8px;
        min-height: 52px;
        padding: 6px 0;
        border: none;
        background: transparent;
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
      }

      :host([narrow]) .about {
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: 3px;
      }

      .about:focus-visible {
        outline: 2px solid var(--pv-accent-ink, #5B5BD6);
        outline-offset: -2px;
        border-radius: 10px;
      }

      .name {
        position: relative;
        flex: 1 1 auto;
        min-width: 0;
        font-size: 1rem;
        line-height: 1.3;
      }

      :host([narrow]) .name {
        flex: none;
      }

      /* A long badge (a sent-back note) sits under the name and wraps, in any panel. */
      .about.below {
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: 3px;
      }

      .about.below .name {
        flex: none;
      }

      .about.below .end,
      :host([narrow]) .end {
        flex-shrink: 1;
        min-width: 0;
        max-width: 100%;
      }

      .about.below .badge,
      :host([narrow]) .badge {
        white-space: normal;
        text-align: left;
      }

      .name .text {
        position: relative;
      }

      .label {
        color: var(--pv-text-muted, #8E949C);
        font-size: 0.875rem;
        margin-left: 4px;
      }

      .strike {
        position: absolute;
        left: 0;
        right: 0;
        top: 50%;
        height: 1.5px;
        background: currentColor;
        transform-origin: left center;
        transform: scaleX(0);
      }

      :host([data-state='done']) .name {
        color: var(--pv-text-muted, #8E949C);
      }

      :host([data-state='done']) .strike {
        transform: scaleX(1);
      }

      .end {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .who {
        color: var(--pv-text-muted, #8E949C);
        font-size: 0.8125rem;
      }

      .sparkles {
        position: absolute;
        left: 60px;
        top: 4px;
        pointer-events: none;
        color: var(--member);
        font-size: 11px;
        letter-spacing: 4px;
        opacity: 0;
      }
    `,
  ];

  protected willUpdate(changed: PropertyValues): void {
    if (changed.has('row')) {
      const change = rowChange(changed.get('row') as RowModel | undefined, this.row);
      this.dataset.state = this.row.state;
      if (change !== 'none') {
        this._held = false;
        this._fill = 0;
      }
      if (change === 'answered' && (this.row.state === 'done' || this.row.state === 'pending')) this._celebrate = true;
    }
  }

  private _celebrate = false;

  protected updated(): void {
    if (!this._celebrate) return;
    this._celebrate = false;
    const reduced = motionOf(this) === 'reduced';
    const check = this.renderRoot.querySelector('.check');
    const mark = this.renderRoot.querySelector<SVGPathElement>('.mark');
    const strike = this.renderRoot.querySelector('.strike');
    if (reduced) {
      check?.animate({ opacity: [0, 1] }, { duration: 150 });
      return;
    }
    const pop = springEasing(BOUNCY);
    check?.animate({ transform: ['scale(0.55)', 'scale(1)'] }, { duration: pop.duration, easing: pop.easing });
    mark?.animate({ strokeDashoffset: [24, 0] }, { duration: 320, delay: 60, easing: 'cubic-bezier(0.3, 0.7, 0.2, 1)', fill: 'backwards' });
    strike?.animate({ transform: ['scaleX(0)', 'scaleX(1)'] }, { duration: 300, delay: 120, easing: 'ease-out', fill: 'backwards' });
    this.renderRoot.querySelector('.sparkles')?.animate(
      { opacity: [0, 1, 0], transform: ['translateY(4px)', 'translateY(-6px)'] },
      { duration: 700, easing: 'ease-out' },
    );
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    cancelAnimationFrame(this._frame);
    cancelAnimationFrame(this._rewindFrame);
  }

  private get _done(): boolean {
    return this.row.state === 'done';
  }

  private get _holdable(): boolean {
    return !this.locked && (this.row.state === 'open' || this.row.state === 'sent_back' || this.row.state === 'done');
  }

  private _down = (event: PointerEvent): void => {
    if (event.button > 0) return;
    if (!this._holdable) {
      this._hintPress = { x: event.clientX, y: event.clientY, t: performance.now() };
      return;
    }
    if (this._held) return;
    cancelAnimationFrame(this._rewindFrame);
    const target = event.currentTarget as HTMLElement;
    try {
      target.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture keeps a drifting finger on the circle; without it the hold still works.
    }
    this._gesture.down(event.clientX, event.clientY, performance.now());
    const tick = (t: number) => {
      this._gesture.frame(t);
      if (this._gesture.holding) this._frame = requestAnimationFrame(tick);
    };
    this._frame = requestAnimationFrame(tick);
  };

  private _move = (event: PointerEvent): void => {
    this._gesture.move(event.clientX, event.clientY);
  };

  private _up = (event?: PointerEvent): void => {
    const press = this._hintPress;
    if (press) {
      this._hintPress = null;
      const quick = !!event && performance.now() - press.t < HOLD_MS
        && Math.hypot(event.clientX - press.x, event.clientY - press.y) <= MOVE_CANCEL_PX;
      if (quick) this._fire('pv-hint', { row: this.row });
      return;
    }
    cancelAnimationFrame(this._frame);
    this._gesture.up(performance.now());
  };

  private _cancel = (): void => {
    this._hintPress = null;
    cancelAnimationFrame(this._frame);
    this._gesture.cancel();
  };

  /** The browser fires this right after pointerup and pointercancel too; only a capture lost mid-hold ends one. */
  private _lost = (): void => {
    if (this._gesture.holding) this._up();
  };

  private _key = (event: KeyboardEvent): void => {
    if (event.key !== ' ' && event.key !== 'Enter') return;
    event.preventDefault();
    if (!this._holdable || this._held) {
      this._fire('pv-hint', { row: this.row });
      return;
    }
    this._gesture.key(event.key);
  };

  private _finish(): void {
    this._held = true;
    this._fill = 1;
    const circle = this.renderRoot.querySelector('.circle')?.getBoundingClientRect() ?? new DOMRect();
    const detail: HoldDetail = {
      row: this.row,
      from: circle,
      settle: accepted => {
        if (!accepted) this._rewind(1);
      },
    };
    this._fire(this._done ? 'pv-hold-undo' : 'pv-hold-done', detail);
  }

  private _rewind(fill: number): void {
    this._held = false;
    if (fill <= 0 || motionOf(this) === 'reduced') {
      this._fill = 0;
      return;
    }
    // Let go early: the ring rewinds from where it got to.
    const start = performance.now();
    const ms = 220 * fill;
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / ms);
      this._fill = fill * (1 - k);
      if (k < 1 && !this._gesture.holding) this._rewindFrame = requestAnimationFrame(step);
    };
    cancelAnimationFrame(this._rewindFrame);
    this._rewindFrame = requestAnimationFrame(step);
  }

  private _fire(name: string, detail: unknown): void {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }

  private _options = (): void => {
    this._fire('pv-row-options', { row: this.row });
  };

  private _context = (event: Event): void => {
    event.preventDefault();
    this._options();
  };

  render() {
    const row = this.row;
    if (!row) return nothing;
    const color = this.color;
    const state = row.state;
    const done = state === 'done';
    const pending = state === 'pending';
    const fill = this._held ? 1 : this._fill;
    const action = done ? `Hold to uncheck ${row.name}` : `Hold to complete ${row.name}`;
    const end = html`
      ${row.badge ? html`
        <span class="badge ${row.badge.tone}">${row.badge.glyph ? html`<span aria-hidden="true">${row.badge.glyph}</span>` : nothing}${row.badge.words}</span>
      ` : nothing}
      ${!row.badge && row.meta && !done ? html`<span class="meta">${row.meta}</span>` : nothing}
      ${done && row.doneAt ? html`<span class="meta">${row.doneBy ? `${row.doneBy} · ` : ''}${row.doneAt}</span>` : nothing}
    `;
    return html`
      <div class="row" style="--member:${color}">
        <div class="sweep" style="transform: scaleX(${done ? 0 : fill})"></div>
        <button class="circle" type="button" aria-label=${action} aria-disabled=${this.locked ? 'true' : 'false'}
          @pointerdown=${this._down} @pointermove=${this._move} @pointerup=${this._up}
          @pointercancel=${this._cancel} @lostpointercapture=${this._lost} @keydown=${this._key}
          @contextmenu=${(e: Event) => e.preventDefault()}>
          <svg width=${CIRCLE} height=${CIRCLE} viewBox="0 0 26 26" aria-hidden="true">
            ${done ? svg`
              <g class="check" style="transform-origin: 13px 13px">
                <circle cx="13" cy="13" r="12.5" fill=${color}></circle>
                <path class="mark" d="M7.5 13.4l3.6 3.6 7.4-7.6" fill="none" style="stroke: ${onColor(color)}" stroke-width="2.6"
                  stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="24"></path>
              </g>
              <circle cx="13" cy="13" r="15.5" fill="none" stroke=${color} stroke-width="2.4" stroke-linecap="round"
                stroke-dasharray=${2 * Math.PI * 15.5} stroke-dashoffset=${2 * Math.PI * 15.5 * (1 - fill)}
                transform="rotate(-90 13 13)" opacity=${fill > 0 ? 0.55 : 0}></circle>
            ` : svg`
              <circle cx="13" cy="13" r=${R} fill="none" stroke=${color} stroke-width="2.4"
                stroke-dasharray=${pending ? '3.2 3.2' : 'none'} opacity=${pending ? 0.9 : 1}></circle>
              ${pending ? svg`<text class="emo" x="13" y="17.2" text-anchor="middle" font-size="11">⏳</text>` : nothing}
              <circle cx="13" cy="13" r=${R} fill="none" stroke=${color} stroke-width="3.4" stroke-linecap="round"
                stroke-dasharray=${LENGTH} stroke-dashoffset=${LENGTH * (1 - fill)}
                transform="rotate(-90 13 13)" opacity=${fill > 0 ? 1 : 0}></circle>
            `}
          </svg>
        </button>
        <button class="about ${badgeBelow(row.badge, this.narrow) ? 'below' : ''}" type="button"
          @click=${this._options} @contextmenu=${this._context}
          aria-label=${`${row.name}${row.badge ? `, ${row.badge.words}` : ''}. Options`}>
          <span class="name"><span class="text">${row.name}<span class="strike"></span></span>${row.label ? html`<span class="label">${row.label}</span>` : nothing}</span>
          <span class="end">${end}</span>
        </button>
        <span class="sparkles" aria-hidden="true">✦ ✧ ✦</span>
      </div>
    `;
  }
}

defineElement('pv-chore-item', PvChoreItem);
