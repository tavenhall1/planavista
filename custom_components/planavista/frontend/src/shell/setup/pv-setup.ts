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
import { saveErrorMessage } from '../../core/page-host';
import { SetupStep, resumeIndex, setupRegistry } from '../../core/settings-registry';
import type { PlanaVistaData } from '../../types';
import './welcome-step';
import './people-step';
import './look-step';
import './done-step';

interface StepElement extends HTMLElement {
  commit?: () => Promise<boolean>;
}

const TOAST_MS = 4000;

/**
 * pv-setup: first-run setup from the steps modules register (spec 14.7). One
 * question per step: a big heading, a short lead, the main button at the
 * bottom, progress dots, and Back at the top left. Setup picks up where it
 * stopped.
 *
 * @fires onboarding-complete - after the last step's commit
 */
export class PvSetup extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlanaVistaData;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ attribute: false }) api!: HouseholdApi;
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';

  @state() private _index = 0;
  @state() private _busy = false;
  @state() private _toast = '';
  private _started = false;
  private _toastTimer: number | undefined;

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.clearTimeout(this._toastTimer);
  }

  protected willUpdate(): void {
    if (!this._started && this.data) {
      this._index = resumeIndex(this._steps(), this.household?.setup.step ?? null);
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
        color: var(--pv-accent, #6366F1);
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

  private _steps(): SetupStep[] {
    return setupRegistry.pages({ household: this.household, data: this.data });
  }

  render() {
    const steps = this._steps();
    if (steps.length === 0) return nothing;
    const index = Math.min(this._index, steps.length - 1);
    const step = steps[index];
    const last = index === steps.length - 1;
    const tag = unsafeStatic(step.tag);
    return html`
      <div class="top">
        <button class="back ${index === 0 ? 'hidden' : ''}" type="button"
          ?disabled=${index === 0 || this._busy}
          aria-hidden=${index === 0 ? 'true' : 'false'}
          @click=${this._back}>‹ Back</button>
        <div class="progress-dots" role="img" aria-label="Step ${index + 1} of ${steps.length}">
          ${steps.map((_, i) => html`<div class="dot ${i === index ? 'dot--active' : ''}"></div>`)}
        </div>
        <span></span>
      </div>
      <div class="content">
        <div class="column">
          <h1 class="heading">${step.heading}</h1>
          ${step.lead ? html`<p class="lead">${step.lead}</p>` : nothing}
          ${keyed(step.id, staticHtml`
            <${tag}
              class="step-el"
              .hass=${this.hass}
              .data=${this.data}
              .household=${this.household}
              .api=${this.api}
              .layout=${this.layout}
              mode="setup"
            ></${tag}>
          `)}
        </div>
      </div>
      <div class="bottom">
        <button class="pv-btn pv-btn-primary main" type="button" ?disabled=${this._busy} @click=${this._next}>
          ${step.primary ?? (last ? 'Finish' : 'Next')}
        </button>
      </div>
      ${this._toast ? html`<div class="toast" role="status">${this._toast}</div>` : nothing}
    `;
  }

  private _next = async (): Promise<void> => {
    if (this._busy) return;
    const element = this.renderRoot.querySelector<StepElement>('.step-el');
    this._busy = true;
    try {
      const ok = element?.commit ? await element.commit() : true;
      if (!ok) return;
      const steps = this._steps();
      if (this._index >= steps.length - 1) {
        this.dispatchEvent(new CustomEvent('onboarding-complete', { bubbles: true, composed: true }));
        return;
      }
      this._index += 1;
      this._remember(steps[this._index].id);
    } finally {
      this._busy = false;
    }
  };

  private _back = (): void => {
    if (this._index === 0 || this._busy) return;
    this._index -= 1;
    this._remember(this._steps()[this._index].id);
  };

  /** Where setup picks up next time (leaving halfway keeps what's done). */
  private _remember(stepId: string): void {
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
