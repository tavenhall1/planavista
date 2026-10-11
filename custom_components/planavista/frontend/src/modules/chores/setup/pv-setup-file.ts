import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../../utils/define';
import { baseStyles, buttonStyles, formStyles } from '../../../styles/shared';
import { HouseholdView, inOrder } from '../../../core/household';
import type { Layout } from '../../../core/layout';
import type { ModuleService } from '../../../core/module-registry';
import { STEP_CHANGE, SetupPatch } from '../../../core/settings-registry';
import { errorMessage } from '../../../core/ws-api';
import type { PlanaVistaData } from '../../../types';
import type { ChoresService } from '../chores-service';
import { ImportChoices, ImportPreview, emptyChoices, fileLine, importSummary, missingAges } from '../settings/import-derive';
import '../settings/pv-import-preview';

/**
 * pv-setup-file: setup's way in from a file (spec 14.7): Start from our
 * household plan (a Household Hours plan) or Restore from a PlanaVista file
 * (a rebuilt Home Assistant gets its household back in one step). Choose
 * the file or paste its text, see the same preview as in Settings, then the
 * main button imports.
 */
export class PvSetupFile extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlanaVistaData;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ attribute: false }) services: Record<string, ModuleService> = {};
  @property({ type: Number }) revision = 0;
  @property({ type: String }) layout: Layout = 'landscape';

  @state() private _text = '';
  @state() private _name = '';
  @state() private _pasting = false;
  @state() private _preview: ImportPreview | null = null;
  @state() private _choices: ImportChoices = emptyChoices();
  @state() private _problems: string[] = [];
  @state() private _reading = false;
  setupPatch?: SetupPatch;

  private get _restoring(): boolean {
    return this.household?.setup.start === 'restore';
  }

  private get _chores(): ChoresService | undefined {
    return this.services?.chores as ChoresService | undefined;
  }

  get primaryLabel(): string {
    return this._restoring ? 'Restore' : 'Import';
  }

  get ready(): boolean {
    return !!this._preview && missingAges(this._preview, this._choices).length === 0;
  }

  private _changed(): void {
    this.dispatchEvent(new CustomEvent(STEP_CHANGE, { bubbles: true, composed: true }));
  }

  /** Import (or restore) what the preview shows. */
  async commit(): Promise<boolean> {
    const chores = this._chores;
    if (!chores || !this._preview) return false;
    this._problems = [];
    try {
      const result = await chores.api.importApply(this._text, this._choices);
      if (result.problem) {
        this._problems = result.problem.problems.length ? result.problem.problems : [result.problem.message];
        return false;
      }
      // Importing chores turns them on (the steps after this one, such as the shared screen, apply now).
      this.setupPatch = { modules: { chores: { enabled: true } } };
      return true;
    } catch (err) {
      this._problems = [errorMessage(err) ?? "Couldn't import. Check the connection and try again."];
      return false;
    }
  }

  static styles = [
    baseStyles,
    buttonStyles,
    formStyles,
    css`
      :host {
        display: block;
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 12px;
      }

      .actions button {
        min-height: 48px;
      }

      textarea {
        width: 100%;
        min-height: 140px;
        box-sizing: border-box;
        font-family: ui-monospace, monospace;
        font-size: 0.8125rem;
      }

      .file {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 4px;
        padding: 12px 14px;
        border-radius: 14px;
        background: var(--pv-card-bg, #FFFFFF);
        box-shadow: inset 0 0 0 1px var(--pv-border-subtle, #E5E7EB);
      }

      .file .text {
        flex: 1;
      }

      .file .sub {
        display: block;
        font-size: 0.8125rem;
        color: var(--pv-text-secondary, #6B7280);
      }

      .summary {
        margin: 16px 0 0;
        font-weight: 600;
      }

      .problems {
        margin: 12px 0;
        padding: 12px 16px;
        border-radius: 12px;
        background: color-mix(in srgb, var(--pv-danger, #DC2626) 10%, transparent);
      }

      .problems ul {
        margin: 6px 0 0;
        padding-left: 18px;
      }

      input[type='file'] {
        display: none;
      }
    `,
  ];

  render() {
    return html`
      <input type="file" accept=".json,application/json,text/plain" @change=${this._onFile} />
      ${this._preview ? html`
        <div class="file">
          <span class="text"><strong>${this._name}</strong><span class="sub">${fileLine(this._preview)}</span></span>
          <button class="pv-btn pv-btn-secondary" type="button" @click=${this._reset}>Choose another</button>
        </div>
      ` : html`
        <div class="actions">
          <button class="pv-btn pv-btn-primary" type="button" ?disabled=${this._reading} @click=${this._choose}>Choose a file</button>
          <button class="pv-btn pv-btn-secondary" type="button" @click=${() => { this._pasting = !this._pasting; }}>Paste text</button>
        </div>
        ${this._pasting ? html`
          <textarea class="pv-input" aria-label="The file's text" placeholder="Paste the file's text here"
            .value=${this._text} @input=${(e: Event) => { this._text = (e.target as HTMLTextAreaElement).value; }}></textarea>
          <div class="actions" style="margin-top: 8px">
            <button class="pv-btn pv-btn-primary" type="button" ?disabled=${!this._text.trim() || this._reading}
              @click=${() => this._read(this._text, 'Pasted text')}>Review</button>
          </div>
        ` : nothing}
      `}
      ${this._problems.length ? html`
        <div class="problems" role="alert">
          <strong>${this._preview ? 'This file has problems, so nothing was imported.' : "Can't read this file"}</strong>
          <ul>${this._problems.map(p => html`<li>${p}</li>`)}</ul>
        </div>
      ` : nothing}
      ${this._preview ? html`
        <pv-import-preview .hass=${this.hass} .preview=${this._preview} .members=${inOrder(this.household?.members ?? [])}
          .choices=${this._choices} .layout=${this.layout} .timeFormat=${this.data?.display?.time_format ?? '12h'}
          @pv-import-choices=${(e: CustomEvent<ImportChoices>) => { this._choices = e.detail; this._changed(); }}></pv-import-preview>
        <p class="summary">${importSummary(this._preview, this._choices)} Nothing is deleted.</p>
      ` : nothing}
    `;
  }

  private _choose = (): void => {
    const input = this.renderRoot.querySelector<HTMLInputElement>('input[type="file"]');
    if (input) {
      input.value = '';
      input.click();
    }
  };

  private _reset = (): void => {
    this._preview = null;
    this._choices = emptyChoices();
    this._problems = [];
    this._changed();
  };

  private _onFile = async (event: Event): Promise<void> => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    await this._read(await file.text(), file.name);
  };

  private async _read(text: string, name: string): Promise<void> {
    const chores = this._chores;
    if (!chores) return;
    this._reading = true;
    this._problems = [];
    try {
      const result = await chores.api.importPreview(text);
      if (result.problem) {
        const known = result.problem.code === 'unknown_file'
          ? `${name === 'Pasted text' ? 'This text' : `"${name}"`} isn't a plan PlanaVista knows. It reads Household Hours plans (version 1) and files exported from PlanaVista.`
          : result.problem.message;
        this._problems = [known, ...result.problem.problems];
        return;
      }
      this._text = text;
      this._name = name;
      this._preview = result.preview ?? null;
      this._choices = emptyChoices();
      this._pasting = false;
    } catch (err) {
      this._problems = [errorMessage(err) ?? "Couldn't read it. Check the connection and try again."];
    } finally {
      this._reading = false;
      this._changed();
    }
  }
}

defineElement('pv-setup-file', PvSetupFile);
