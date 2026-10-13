import { LitElement, html, css, nothing, PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { defineElement } from '../../utils/define';
import { HOLD_MS, HoldGesture, MOVE_CANCEL_PX } from '../../core/hold';
import { BOUNCY, motionOf, springEasing } from '../../core/motion';
import { contrastText } from '../../core/color';
import '../../core/pv-ring';
import type { HoldDetail } from './pv-chore-item';
import type { RowModel } from './board-derive';
import { rowChange, tileLine, tileRingFill } from './hold-state';
import { chorePicture } from './picture-words';

/** The picture for a chore: its emoji, or a star when it has none (spec 7.3: the icon is also the picture tile). */
export function pictureOf(icon: string | null | undefined): string {
  return icon && !icon.startsWith('mdi:') ? icon : '⭐';
}

/**
 * pv-chore-tile: a young child's chore as a picture (spec 13.2). The whole
 * tile is the hold target, because small hands need a big one; a small ⋯
 * button in the corner opens the options, mostly for grown-ups. Waiting for
 * approval says so in words here too.
 *
 * @fires pv-hold-done - HoldDetail, a hold finished on an open tile
 * @fires pv-hold-undo - HoldDetail, a hold finished on a done tile
 * @fires pv-hint - { row } a quick tap
 * @fires pv-row-options - { row } the ⋯ button
 */
export class PvChoreTile extends LitElement {
  @property({ attribute: false }) row!: RowModel;
  @property({ type: String }) color = '#5B5BD6';
  /** The chore for now: drawn with the person's color around it. */
  @property({ type: Boolean, reflect: true }) now = false;
  /** Bigger, for My day's Now tile. */
  @property({ type: Boolean, reflect: true }) large = false;
  @property({ type: Boolean }) locked = false;
  /** Stars a check-off earns, for "Keep holding… ⭐ +1". */
  @property({ type: Number }) stars = 0;

  @state() private _fill = 0;
  @state() private _held = false;
  /**
   * The ring draws the fill as given: through a hold, and when the answer
   * comes (it gives way to the done or waiting tile at once). Only a rewind
   * eases back from where the hold got to (spec 11.5).
   */
  @state() private _tracking = true;
  private _frame = 0;
  private _celebrate = false;
  private _gesture = new HoldGesture({
    progress: fill => {
      this._tracking = true;
      this._fill = fill;
    },
    complete: () => this._finish(),
    rewind: () => {
      this._tracking = false;
      this._held = false;
      this._fill = 0;
    },
    tap: () => this._fire('pv-hint', { row: this.row }),
  });

  static styles = css`
    :host {
      display: block;
      --tint: color-mix(in srgb, var(--member) 12%, var(--pv-card-bg, #FFFFFF));
    }

    .tile {
      position: relative;
      box-sizing: border-box;
      width: 100%;
      border-radius: 18px;
      border: 2px solid transparent;
      background: var(--tint);
      color: var(--pv-text, #1A1B1E);
      container-type: inline-size;
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

    /* A narrow tile (a phone's two across): the ring starts below the corner controls, which sat on its arc (round 2). */
    @container (max-width: 160px) {
      .hold {
        padding-top: 36px;
      }
    }

    .hold:focus-visible {
      outline: 3px solid var(--pv-accent-ink, #5B5BD6);
      outline-offset: 2px;
    }

    .hold[aria-disabled='true'] {
      cursor: default;
    }

    :host([now]) .tile {
      border-color: var(--member);
    }

    .tile.pending {
      border: 2px dashed var(--member);
      background: var(--pv-card-bg, #FFFFFF);
    }

    .tile.done {
      opacity: 0.72;
    }

    .picture {
      font-size: 44px;
      line-height: 1;
    }

    :host([large]) .picture {
      font-size: 84px;
    }

    .name {
      font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
      font-weight: 800;
      font-size: 1.0625rem;
      line-height: 1.2;
      text-align: center;
    }

    :host([large]) .name {
      font-size: 1.75rem;
    }

    .hint {
      font-size: 0.8125rem;
      color: var(--pv-text-secondary, #5F6670);
      min-height: 1.2em;
    }

    .waiting {
      font-size: 0.8125rem;
      font-weight: 700;
      line-height: 1.2;
      text-align: center;
      text-wrap: balance;
      color: var(--pv-accent-tint-ink, #3B3BB0);
    }

    .sent-back {
      font-size: 0.8125rem;
      font-weight: 700;
      line-height: 1.2;
      text-align: center;
      text-wrap: balance;
      color: var(--pv-danger-ink, #A12828);
    }

    .more {
      position: absolute;
      top: 2px;
      right: 2px;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
      padding: 0;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    .more span {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: var(--pv-card-bg, #FFFFFF);
      color: var(--pv-text-secondary, #5F6670);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      letter-spacing: 1px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
    }

    .more:focus-visible span {
      outline: 2px solid var(--pv-accent-ink, #5B5BD6);
    }

    .tick {
      position: absolute;
      /* Over the ring, which is positioned too and comes later. */
      z-index: 1;
      top: 10px;
      left: 10px;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `;

  protected willUpdate(changed: PropertyValues): void {
    if (changed.has('row')) {
      const change = rowChange(changed.get('row') as RowModel | undefined, this.row);
      if (change !== 'none') {
        this._tracking = true;
        this._held = false;
        this._fill = 0;
      }
      if (change === 'answered' && (this.row.state === 'done' || this.row.state === 'pending')) this._celebrate = true;
    }
  }

  protected updated(): void {
    if (!this._celebrate) return;
    this._celebrate = false;
    const tile = this.renderRoot.querySelector('.tile');
    if (motionOf(this) === 'reduced') {
      tile?.animate({ opacity: [0.5, 1] }, { duration: 160 });
      return;
    }
    const pop = springEasing(BOUNCY);
    tile?.animate({ transform: ['scale(0.94)', 'scale(1)'] }, { duration: pop.duration, easing: pop.easing });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    cancelAnimationFrame(this._frame);
  }

  private get _holdable(): boolean {
    const state = this.row.state;
    return !this.locked && (state === 'open' || state === 'sent_back' || state === 'done');
  }

  /** A press that began where this screen can't hold (waiting, or someone else's): a quick release explains why. */
  private _hintPress: { x: number; y: number; t: number } | null = null;

  private _down = (event: PointerEvent): void => {
    if (event.button > 0) return;
    if (!this._holdable) {
      this._hintPress = { x: event.clientX, y: event.clientY, t: performance.now() };
      return;
    }
    if (this._held) return;
    try {
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    } catch {
      // A hold works without pointer capture too.
    }
    this._gesture.down(event.clientX, event.clientY, performance.now());
    const tick = (t: number) => {
      this._gesture.frame(t);
      if (this._gesture.holding) this._frame = requestAnimationFrame(tick);
    };
    this._frame = requestAnimationFrame(tick);
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

  private _key = (event: KeyboardEvent): void => {
    if (event.key !== ' ' && event.key !== 'Enter') return;
    event.preventDefault();
    if (this._holdable && !this._held) this._gesture.key(event.key);
  };

  private _finish(): void {
    this._held = true;
    this._fill = 1;
    const from = this.renderRoot.querySelector('.picture')?.getBoundingClientRect() ?? new DOMRect();
    const detail: HoldDetail = {
      row: this.row,
      from,
      settle: accepted => {
        if (!accepted) {
          this._tracking = false;
          this._held = false;
          this._fill = 0;
        }
      },
    };
    this._fire(this.row.state === 'done' ? 'pv-hold-undo' : 'pv-hold-done', detail);
  }

  private _fire(name: string, detail: unknown): void {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }

  render() {
    const row = this.row;
    if (!row) return nothing;
    const state = row.state;
    const done = state === 'done';
    const pending = state === 'pending';
    const fill = tileRingFill(state, this._held, this._fill);
    const line = tileLine(row, fill, this.large, this.stars);
    const ring = this.large ? 132 : 84;
    return html`
      <div class="tile ${pending ? 'pending' : ''} ${done ? 'done' : ''}" style="--member:${this.color}">
        <div class="hold" role="button" tabindex=${this.locked ? -1 : 0} aria-disabled=${this.locked ? 'true' : 'false'}
          aria-label=${done ? `${row.name}, done. Hold to uncheck` : pending ? `${row.name}, waiting for approval`
            : state === 'sent_back' ? `${row.name}, ${row.badge?.words ?? 'sent back'}. Hold to complete` : `Hold to complete ${row.name}`}
          @pointerdown=${this._down} @pointermove=${(e: PointerEvent) => this._gesture.move(e.clientX, e.clientY)}
          @pointerup=${this._up} @pointercancel=${() => { this._hintPress = null; this._gesture.cancel(); }} @keydown=${this._key}
          @contextmenu=${(e: Event) => e.preventDefault()}>
        ${done ? html`
          <span class="tick" style="background:${this.color};color:${contrastText(this.color)}" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>
          </span>
        ` : nothing}
        <pv-ring size=${ring} .progress=${fill} ?tracking=${this._tracking} color=${this.color}>
          <span class="picture" aria-hidden="true">${chorePicture(row.icon, row.name)}</span>
        </pv-ring>
        <span class="name">${row.name}</span>
        <span class=${line.kind === 'waiting' ? 'waiting' : line.kind === 'bad' ? 'sent-back' : 'hint'}>${line.text}</span>
        </div>
        <button class="more" type="button" aria-label=${`Options for ${row.name}`}
          @click=${() => this._fire('pv-row-options', { row })}>
          <span aria-hidden="true">⋯</span>
        </button>
      </div>
    `;
  }
}

defineElement('pv-chore-tile', PvChoreTile);
