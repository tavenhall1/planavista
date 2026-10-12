import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { keyed } from 'lit/directives/keyed.js';
import { html as staticHtml, unsafeStatic } from 'lit/static-html.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../utils/define';
import { baseStyles, buttonStyles } from '../../styles/shared';
import type { HouseholdView } from '../../core/household';
import { HouseholdApi, errorCode } from '../../core/household-client';
import type { Layout } from '../../core/layout';
import type { ModuleService } from '../../core/module-registry';
import type { PinGate } from '../../core/pin-gate';
import type { Session } from '../../core/session';
import { saveErrorMessage } from '../../core/page-host';
import { STEP_CHANGE, SetupContext, SetupPatch, SetupStep, resumeIndex, setupRegistry } from '../../core/settings-registry';
import { mergePatch, onlySteps, stepAfter, stepButton, withPatch } from '../../core/setup-flow';
import type { PlanaVistaData } from '../../types';
import './welcome-step';
import './people-step';
import './look-step';
import './done-step';

/** What a step element may offer its host; every part is optional. */
interface StepElement extends HTMLElement {
  commit?: () => Promise<boolean>;
  /** The main button's label now ("Add 8 chores"), instead of the step's. */
  primaryLabel?: string;
  /** False keeps the main button off (nothing picked yet, an age group missing). */
  ready?: boolean;
  /** The step's second way on; true goes on to the next step. */
  secondary?: () => Promise<boolean>;
  /** What the step just changed, for the steps after it, until the household's update arrives. */
  setupPatch?: SetupPatch;
  /** The module the card opens when setup finishes. */
  openModule?: string;
}


const TOAST_MS = 4000;

/**
 * pv-setup: first-run setup from the steps modules register (spec 14.7). One
 * question per step: a big heading, a short lead, the main button at the
 * bottom, progress dots, and Back at the top left. Setup picks up where it
 * stopped.
 *
 * Settings can run a short setup (`only`: the chores steps for a
 * calendar-only home, spec 14.7). It starts at its first step, doesn't move
 * the household's setup bookmark, offers Back to where it came from on its
 * first step, and drops second ways on: Back is the way out, and runs the
 * first step's own (Not now turns chores off again).
 *
 * @fires onboarding-complete - after the last step's commit; { module } to open
 * @fires pv-setup-cancel - Back on a short setup's first step
 */
export class PvSetup extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlanaVistaData;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ attribute: false }) api!: HouseholdApi;
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
  /** Edits the card keeps while steps come and go (the appearance changes, spec 14.7). */
  @property({ attribute: false }) drafts: Map<string, unknown> = new Map();
  /** The card's module services (chores steps read the chores feed and call its commands). */
  @property({ attribute: false }) services: Record<string, ModuleService> = {};
  @property({ type: Number }) revision = 0;
  /** The card's PIN sheet and parent mode (a step that makes this a shared screen asks for a parent's PIN). */
  @property({ attribute: false }) pinGate?: PinGate;
  @property({ attribute: false }) session: Session | null = null;
  /** A short setup: only these steps (their ids). */
  @property({ attribute: false }) only: string[] | null = null;
  /** Where Back on a short setup's first step goes ("Settings"). */
  @property({ type: String }) cancelLabel = '';

  @state() private _index = 0;
  @state() private _busy = false;
  @state() private _toast = '';
  /** What steps changed that the household doesn't show yet (how it started, chores on). */
  @state() private _patch: SetupPatch = {};
  private _started = false;
  private _toastTimer: number | undefined;

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener(STEP_CHANGE, this._onStepChange);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener(STEP_CHANGE, this._onStepChange);
    window.clearTimeout(this._toastTimer);
  }

  private _onStepChange = (event: Event): void => {
    event.stopPropagation();
    this.requestUpdate();
  };

  protected willUpdate(): void {
    if (!this._started && this.data) {
      // A short setup asks its first question afresh, whatever setup chose before.
      if (this.only) this._patch = { setup: { start: null } };
      this._index = this.only ? 0 : resumeIndex(this._steps(), this.household?.setup.step ?? null);
      this._started = true;
    }
  }

  static styles = [
    baseStyles,
    buttonStyles,
    css`
      :host {
        position: relative;
        display: flex;
        flex-direction: column;
        height: 100%;
        background: var(--pv-card-bg, #FFFFFF);
        color: var(--pv-text, #1A1B1E);
        font-family: var(--pv-font-family, -apple-system, system-ui, sans-serif);
      }

      .top {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        min-height: 56px;
        padding: 4px 12px;
        flex-shrink: 0;
      }

      .back {
        justify-self: start;
        display: inline-flex;
        align-items: center;
        min-height: 48px;
        padding: 0 8px;
        border: none;
        background: transparent;
        color: var(--pv-accent-ink, var(--pv-accent, #6366F1));
        font: inherit;
        font-size: 1rem;
        cursor: pointer;
      }

      .back.hidden {
        visibility: hidden;
      }

      .content {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        padding: 8px 20px 24px;
      }

      .column {
        max-width: 640px;
        margin: 0 auto;
      }

      .heading {
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        margin: 8px 0 8px;
        font-size: 2rem;
        font-weight: 800;
        letter-spacing: -0.02em;
        line-height: 1.2;
      }

      .lead {
        margin: 0 0 24px;
        color: var(--pv-text-secondary, #6B7280);
        font-size: 1.0625rem;
        line-height: 1.5;
      }

      .bottom {
        display: flex;
        justify-content: center;
        padding: 12px 20px calc(16px + env(safe-area-inset-bottom, 0px));
        border-top: 1px solid var(--pv-border-subtle, #E5E7EB);
        flex-shrink: 0;
      }

      .main {
        width: min(640px, 100%);
        min-height: 52px;
        font-size: 1.0625rem;
      }

      .column.wide {
        max-width: 1040px;
      }

      .bottom {
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }

      .second {
        min-height: 48px;
        border: none;
        background: transparent;
        color: var(--pv-accent-ink, var(--pv-accent, #6366F1));
        font: inherit;
        font-weight: 600;
        cursor: pointer;
      }

      .skip {
        justify-self: end;
        min-height: 48px;
        padding: 0 8px;
        border: none;
        background: transparent;
        color: var(--pv-text-secondary, #6B7280);
        font: inherit;
        cursor: pointer;
      }

      .toast {
        position: absolute;
        left: 16px;
        right: 16px;
        bottom: 92px;
        margin: 0 auto;
        max-width: 480px;
        padding: 12px 16px;
        border-radius: 12px;
        background: var(--pv-text, #1A1B1E);
        color: var(--pv-card-bg, #FFFFFF);
        text-align: center;
      }

      .progress-dots {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--pv-border-subtle, #E5E7EB);
        transition: background var(--pv-transition, 200ms ease),
                    transform var(--pv-transition, 200ms ease);
      }

      .dot--active {
        background: var(--pv-accent, #6366F1);
        transform: scale(1.25);
      }
    `,
  ];

  /** The household as steps see it: with what earlier steps just changed. */
  private _context(): SetupContext {
    return { household: withPatch(this.household, this._patch), data: this.data, services: this.services };
  }

  private _steps(): SetupStep[] {
    return onlySteps(setupRegistry.pages(this._context()), this.only);
  }

  private get _element(): StepElement | null {
    return this.renderRoot?.querySelector<StepElement>('.step-el') ?? null;
  }

  private _take(element: StepElement | null): void {
    if (element?.setupPatch) this._patch = mergePatch(this._patch, element.setupPatch);
  }

  render() {
    const steps = this._steps();
    if (steps.length === 0) return nothing;
    const index = Math.min(this._index, steps.length - 1);
    const step = steps[index];
    const last = index === steps.length - 1;
    const tag = unsafeStatic(step.tag);
    const element = this._element;
    const short = !!this.only;
    const { label, ready } = stepButton(step, element
      ? { step: element.dataset.step, primaryLabel: element.primaryLabel, ready: element.ready }
      : null, { last, short });
    const context = this._context();
    const leave = index === 0 && short && !!this.cancelLabel;
    const noBack = index === 0 && !leave;
    const secondary = short ? undefined : step.secondary;
    return html`
      <div class="top">
        <button class="back ${noBack ? 'hidden' : ''}" type="button"
          ?disabled=${noBack || this._busy}
          aria-hidden=${noBack ? 'true' : 'false'}
          @click=${leave ? this._leave : this._back}>‹ ${leave ? this.cancelLabel : 'Back'}</button>
        <div class="progress-dots" role="img" aria-label="Step ${index + 1} of ${steps.length}">
          ${steps.map((_, i) => html`<div class="dot ${i === index ? 'dot--active' : ''}"></div>`)}
        </div>
        ${step.skip ? html`<button class="skip" type="button" ?disabled=${this._busy} @click=${this._skip}>Skip</button>` : html`<span></span>`}
      </div>
      <div class="content">
        <div class="column ${step.wide ? 'wide' : ''}">
          <h1 class="heading">${step.heading}</h1>
          ${step.lead ? html`<p class="lead">${step.lead}</p>` : nothing}
          ${keyed(step.id, staticHtml`
            <${tag}
              class="step-el"
              data-step=${step.id}
              .hass=${this.hass}
              .data=${this.data}
              .household=${context.household}
              .api=${this.api}
              .layout=${this.layout}
              .drafts=${this.drafts}
              .services=${this.services}
              .revision=${this.revision}
              .pinGate=${this.pinGate}
              .session=${this.session}
              mode="setup"
            ></${tag}>
          `)}
        </div>
      </div>
      <div class="bottom">
        <button class="pv-btn pv-btn-primary main" type="button" ?disabled=${this._busy || !ready} @click=${this._next}>
          ${label}
        </button>
        ${secondary ? html`
          <button class="second" type="button" ?disabled=${this._busy} @click=${this._secondary}>${secondary}</button>
        ` : nothing}
      </div>
      ${this._toast ? html`<div class="toast" role="status">${this._toast}</div>` : nothing}
    `;
  }

  protected updated(): void {
    // A step's label and readiness live on its element, which exists only after the render that adds it,
    // so a new step's element always gets one more render (until then the step's own label shows).
    const element = this._element;
    if (element && !(element as unknown as { _hostSeen?: boolean })._hostSeen) {
      (element as unknown as { _hostSeen?: boolean })._hostSeen = true;
      this.requestUpdate();
    }
  }

  /** The step on screen now. */
  private _currentId(): string | undefined {
    const steps = this._steps();
    return steps[Math.min(this._index, steps.length - 1)]?.id;
  }

  private _next = async (): Promise<void> => {
    if (this._busy) return;
    const element = this._element;
    const current = this._currentId();
    this._busy = true;
    try {
      const ok = element?.commit ? await element.commit() : true;
      if (!ok) return;
      this._take(element);
      this._advance(element, current);
    } finally {
      this._busy = false;
    }
  };

  /**
   * On to the step after `current`, as the steps stand after what it changed
   * (choosing common chores brings their step in); past the last, setup is finished.
   */
  private _advance(element: StepElement | null, current: string | undefined): void {
    const steps = this._steps();
    const next = stepAfter(steps, current);
    if (next === null) {
      const module = element?.openModule ?? steps.find(step => step.id === current)?.module;
      this.dispatchEvent(new CustomEvent('onboarding-complete', {
        detail: { module }, bubbles: true, composed: true,
      }));
      return;
    }
    this._index = next;
    this._remember(steps[next].id);
  }

  /** Back on a short setup's first step: the step's own way out (Not now), then back where it came from. */
  private _leave = async (): Promise<void> => {
    if (this._busy) return;
    const element = this._element;
    this._busy = true;
    try {
      if (element?.secondary && !(await element.secondary())) return;
    } finally {
      this._busy = false;
    }
    this.dispatchEvent(new CustomEvent('pv-setup-cancel', { bubbles: true, composed: true }));
  };

  private _secondary = async (): Promise<void> => {
    if (this._busy) return;
    const element = this._element;
    const current = this._currentId();
    this._busy = true;
    try {
      const go = element?.secondary ? await element.secondary() : true;
      if (!go) return;
      this._take(element);
      this._advance(element, current);
    } finally {
      this._busy = false;
    }
  };

  private _skip = (): void => {
    if (this._busy) return;
    this._advance(this._element, this._currentId());
  };

  private _back = (): void => {
    if (this._index === 0 || this._busy) return;
    this._index -= 1;
    this._remember(this._steps()[this._index].id);
  };

  /** Where setup picks up next time (leaving halfway keeps what's done); a short setup leaves it alone. */
  private _remember(stepId: string): void {
    if (this.only) return;
    this.api.saveSetup({ step: stepId }).catch(err => {
      this._toast = saveErrorMessage(errorCode(err));
      window.clearTimeout(this._toastTimer);
      this._toastTimer = window.setTimeout(() => {
        this._toast = '';
      }, TOAST_MS);
    });
  }
}

defineElement('pv-setup', PvSetup);
