import { LitElement, html } from 'lit';
import { state } from 'lit/decorators.js';
import { errorCode } from '../../core/household-client';
import { HelpId, HelpState, helpBox, helpButton } from '../../core/help';
import { saveErrorMessage } from '../../core/page-host';

/**
 * The rows the Shared screens and PINs pages share (0.12.0): a switch and a
 * pick of a few, each with its name, its ? (core/help.ts), and its explainer
 * under it; one save at a time, with the reason a save was refused.
 */
export class SettingRowsPage extends LitElement {
  @state() protected _message = '';
  @state() protected _busy = false;
  protected readonly _help = new HelpState(this);

  protected _switch(label: string, id: string, on: boolean, toggle: () => void, help: HelpId, locked = false) {
    const press = locked ? () => undefined : toggle;
    return html`
      <div class="toggle-row">
        <span class="pv-name-line"><span class="label" id=${id}>${label}</span>${helpButton(this._help, help, label)}</span>
        <div
          class="pv-toggle ${on ? 'active' : ''}"
          role="switch"
          tabindex="0"
          aria-checked=${on ? 'true' : 'false'}
          aria-labelledby=${id}
          aria-disabled=${this._busy || locked ? 'true' : 'false'}
          @click=${press}
          @keydown=${(e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              press();
            }
          }}
        ></div>
      </div>
      ${helpBox(this._help, help)}
    `;
  }

  /** One of a few: the segmented control, as everywhere (arrows move the choice). */
  protected _choices<V extends number | string>(
    label: string,
    id: string,
    choices: readonly { value: V; label: string; spoken: string }[],
    chosen: V,
    save: (value: V) => Promise<void> | void,
    help: HelpId,
    locked = false,
  ) {
    const choose = (value: V, group?: HTMLElement): void => {
      if (value !== chosen) void this._run(async () => save(value));
      void this.updateComplete.then(() => group?.querySelector<HTMLElement>(`[data-value='${value}']`)?.focus());
    };
    const arrows = (event: KeyboardEvent): void => {
      const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
      if (!step) return;
      event.preventDefault();
      const index = Math.max(0, choices.findIndex(c => c.value === chosen));
      choose(choices[(index + step + choices.length) % choices.length].value, event.currentTarget as HTMLElement);
    };
    return html`
      <div class="choice-row">
        <span class="pv-name-line"><span class="label" id=${id}>${label}</span>${helpButton(this._help, help, label)}</span>
        <div class="pv-seg" role="radiogroup" aria-labelledby=${id} @keydown=${arrows}>
          ${choices.map(choice => html`
            <button type="button" role="radio" data-value=${choice.value} aria-label=${choice.spoken}
              aria-checked=${choice.value === chosen ? 'true' : 'false'}
              tabindex=${choice.value === chosen ? '0' : '-1'}
              ?disabled=${this._busy || locked}
              @click=${() => choose(choice.value)}>${choice.label}</button>
          `)}
        </div>
      </div>
      ${helpBox(this._help, help)}
    `;
  }

  protected async _run(action: () => Promise<void>): Promise<void> {
    if (this._busy) return;
    this._busy = true;
    this._message = '';
    try {
      await action();
    } catch (err) {
      this._message = (err as { message?: string })?.message || saveErrorMessage(errorCode(err));
    } finally {
      this._busy = false;
    }
  }
}
