import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../../utils/define';
import { baseStyles, buttonStyles, formStyles } from '../../../styles/shared';
import type { HouseholdView } from '../../../core/household';
import type { Layout } from '../../../core/layout';
import type { ModuleService } from '../../../core/module-registry';
import { PUSH_PAGE } from '../../../core/page-host';
import { copyText } from '../../../core/clipboard';
import { errorMessage } from '../../../core/ws-api';
import type { PlanaVistaData } from '../../../types';
import type { ImportProblem } from '../chores-client';
import type { ChoresService } from '../chores-service';
import { choresSettingsStyles } from './settings-styles';

type Mode = 'import' | 'restore';
const PASTED = 'Pasted text';

/**
 * pv-import-export-page: Import and export (spec 14.5, 14.6, 7.9). Import a
 * plan by choosing a file or pasting its text (wall tablets rarely have
 * files), export a PlanaVista file, and restore one. Reading a file opens
 * the review page; nothing is saved until Import there.
 */
export class PvImportExportPage extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlanaVistaData;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ type: String }) layout: Layout = 'landscape';
  @property({ attribute: false }) services: Record<string, ModuleService> = {};
  @property({ type: Number }) revision = 0;

  @state() private _pasting: Mode | null = null;
  @state() private _text = '';
  @state() private _reading = false;
  @state() private _problem: { name: string; problem: ImportProblem; mode: Mode } | null = null;
  @state() private _exported: { text: string; name: string } | null = null;
  @state() private _copied = false;
  private _mode: Mode = 'import';

  static styles = [
    baseStyles,
    buttonStyles,
    formStyles,
    choresSettingsStyles,
    css`
      :host {
        max-width: 640px;
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 12px 14px;
      }

      .actions button {
        min-height: 48px;
      }

      textarea {
        width: 100%;
        min-height: 160px;
        box-sizing: border-box;
        font-family: ui-monospace, monospace;
        font-size: 0.8125rem;
      }

      .paste {
        display: grid;
        gap: 8px;
        padding: 12px 14px;
      }

      .error {
        margin: 12px 0 0;
        padding: 16px;
        border-radius: 14px;
        background: var(--pv-card-bg, #FFFFFF);
        box-shadow: inset 0 0 0 1px var(--pv-border-subtle, #E5E7EB);
      }

      .error h3 {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 0 0 6px;
        font-size: 1.125rem;
      }

      .error .mark {
        width: 28px;
        height: 28px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        background: color-mix(in srgb, var(--pv-danger, #DC2626) 14%, transparent);
        color: var(--pv-danger, #DC2626);
        font-weight: 800;
      }

      .error ul {
        margin: 6px 0 0;
        padding-left: 18px;
      }

      input[type='file'] {
        display: none;
      }
    `,
  ];

  private get _chores(): ChoresService | undefined {
    return this.services?.chores as ChoresService | undefined;
  }

  render() {
    return html`
      <input type="file" accept=".json,application/json,text/plain" @change=${this._onFile} />
      <h2 class="section-label">Import a plan</h2>
      <div class="group">
        <div class="row"><span class="row-sub">A Household Hours plan (version 1) brings its people, bedtimes, and activities. You see where everything goes before anything is saved.</span></div>
        ${this._renderActions('import')}
      </div>
      ${this._problem?.mode === 'import' ? this._renderProblem() : nothing}

      <h2 class="section-label">Export</h2>
      <div class="group">
        <div class="row"><span class="row-sub">Saves people, chores, rewards, and rules as a PlanaVista file that other tools can read. PINs, stars, and history aren't in it; Home Assistant backups keep those.</span></div>
        <div class="actions">
          <button class="pv-btn pv-btn-secondary" type="button" @click=${this._export}>Export a PlanaVista file</button>
          ${this._exported ? html`
            <button class="pv-btn pv-btn-secondary" type="button" @click=${this._copy}>${this._copied ? 'Copied' : 'Copy the text'}</button>
          ` : nothing}
        </div>
      </div>

      <h2 class="section-label">Restore</h2>
      <div class="group">
        <div class="row"><span class="row-sub">Bring a household back from a PlanaVista file, such as after rebuilding Home Assistant. It shows the same review first.</span></div>
        ${this._renderActions('restore')}
      </div>
      ${this._problem?.mode === 'restore' ? this._renderProblem() : nothing}
    `;
  }

  private _renderActions(mode: Mode) {
    return html`
      <div class="actions">
        <button class="pv-btn pv-btn-primary" type="button" ?disabled=${this._reading} @click=${() => this._choose(mode)}>Choose a file</button>
        <button class="pv-btn pv-btn-secondary" type="button" @click=${() => { this._pasting = this._pasting === mode ? null : mode; this._problem = null; }}>
          Paste text</button>
      </div>
      ${this._pasting === mode ? html`
        <div class="paste">
          <textarea class="pv-input" aria-label="The file's text" placeholder="Paste the file's text here"
            .value=${this._text} @input=${(e: Event) => { this._text = (e.target as HTMLTextAreaElement).value; }}></textarea>
          <button class="pv-btn pv-btn-primary" type="button" ?disabled=${!this._text.trim() || this._reading}
            @click=${() => this._read(this._text, PASTED, mode)}>Review</button>
        </div>
      ` : nothing}
    `;
  }

  private _renderProblem() {
    const { name, problem } = this._problem!;
    return html`
      <div class="error" role="alert">
        <h3><span class="mark" aria-hidden="true">!</span>Can't read this file</h3>
        <div>${problem.code === 'unknown_file'
          ? `${name === PASTED ? 'This text' : `"${name}"`} isn't a plan PlanaVista knows. It reads Household Hours plans (version 1) and files exported from PlanaVista.`
          : problem.message}</div>
        ${problem.problems.length ? html`<ul>${problem.problems.map(p => html`<li>${p}</li>`)}</ul>` : nothing}
        <div class="actions" style="padding: 12px 0 0">
          <button class="pv-btn pv-btn-secondary" type="button" @click=${() => { this._pasting = this._problem!.mode; this._problem = null; }}>Paste text instead</button>
          <button class="pv-btn pv-btn-primary" type="button" @click=${() => this._choose(this._problem!.mode)}>Choose another file</button>
        </div>
      </div>
    `;
  }

  private _choose(mode: Mode): void {
    this._mode = mode;
    const input = this.renderRoot.querySelector<HTMLInputElement>('input[type="file"]');
    if (input) {
      input.value = '';
      input.click();
    }
  }

  private _onFile = async (event: Event): Promise<void> => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const text = await file.text();
    await this._read(text, file.name, this._mode);
  };

  private async _read(text: string, name: string, mode: Mode): Promise<void> {
    const chores = this._chores;
    if (!chores) return;
    this._reading = true;
    this._problem = null;
    try {
      const result = await chores.api.importPreview(text);
      if (result.problem) {
        this._problem = { name, problem: result.problem, mode };
        return;
      }
      this._pasting = null;
      this._text = '';
      this.dispatchEvent(new CustomEvent(PUSH_PAGE, {
        detail: { tag: 'pv-import-review', title: 'Review the import', back: 'Import and export', props: { text, name, preview: result.preview } },
        bubbles: true, composed: true,
      }));
    } catch (err) {
      this._problem = { name, mode, problem: { code: 'error', message: errorMessage(err) ?? "Couldn't read it. Check the connection and try again.", problems: [] } };
    } finally {
      this._reading = false;
    }
  }

  private _export = async (): Promise<void> => {
    const chores = this._chores;
    if (!chores) return;
    try {
      const { file, name } = await chores.api.exportHousehold();
      const text = JSON.stringify(file, null, 2);
      this._exported = { text, name };
      const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = name;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch (err) {
      this._problem = { name: 'Export', mode: 'import', problem: { code: 'error', message: errorMessage(err) ?? "Couldn't export. Check the connection and try again.", problems: [] } };
    }
  };

  private _copy = async (): Promise<void> => {
    if (!this._exported) return;
    this._copied = await copyText(this._exported.text);
    window.setTimeout(() => { this._copied = false; }, 2000);
  };
}

defineElement('pv-import-export-page', PvImportExportPage);
