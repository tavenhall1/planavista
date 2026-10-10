import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../utils/define';
import { baseStyles, buttonStyles, formStyles } from '../../styles/shared';
import { HouseholdView, ROLES, Role } from '../../core/household';
import { HouseholdApi, errorCode } from '../../core/household-client';
import type { Layout } from '../../core/layout';
import { saveErrorMessage } from '../../core/page-host';
import { PersonRow, addedRow, setupPlan, setupRows } from '../../core/setup-people';
import type { PlanaVistaData } from '../../types';
import '../../core/pv-member-avatar';

/** A neutral color for people who aren't in the household yet. */
const NOT_YET = '#9CA3AF';

/**
 * pv-setup-people: Who lives here? (spec 14.7). Home Assistant people with a
 * checkbox and a role each, plus people added by name. Next adds, changes,
 * and removes household members to match.
 */
export class PvSetupPeople extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlanaVistaData;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ attribute: false }) api!: HouseholdApi;
  @property({ type: String }) layout: Layout = 'landscape';
  @property({ type: String }) mode: 'settings' | 'setup' = 'setup';

  @state() private _rows: PersonRow[] = [];
  @state() private _name = '';
  @state() private _message = '';
  private _built = false;
  private _added = 0;

  protected willUpdate(): void {
    if (!this._built && this.hass && this.household) {
      const persons = Object.values(this.hass.states)
        .filter(state => state.entity_id.startsWith('person.'))
        .map(state => ({
          entity_id: state.entity_id,
          name: (state.attributes.friendly_name as string | undefined) ?? state.entity_id,
          user_id: (state.attributes.user_id as string | undefined) ?? null,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
      this._rows = setupRows(this.household.members, persons, this.hass.user?.id ?? null);
      this._built = true;
    }
  }

  /** Next: make the household match the rows, one change at a time. */
  async commit(): Promise<boolean> {
    const members = this.household?.members ?? [];
    const plan = setupPlan(this._rows, members);
    this._message = '';
    try {
      for (const id of plan.remove) await this.api.deleteMember(id);
      for (const { id, changes } of plan.update) {
        const member = members.find(m => m.id === id);
        await this.api.saveMember(changes, member ? { id, rev: member.rev } : undefined);
      }
      for (const changes of plan.add) await this.api.saveMember(changes);
      return true;
    } catch (err) {
      this._message = (err as { message?: string })?.message || saveErrorMessage(errorCode(err));
      return false;
    } finally {
      // Start again from the household, which now holds whatever was saved.
      this._built = false;
      this.requestUpdate();
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

      ul {
        list-style: none;
        margin: 0 0 20px;
        padding: 0;
      }

      li {
        display: flex;
        align-items: center;
        gap: 12px;
        min-height: 64px;
        border-bottom: 1px solid var(--pv-border-subtle, #E5E7EB);
      }

      .check {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        cursor: pointer;
      }

      .check input {
        width: 22px;
        height: 22px;
        accent-color: var(--pv-accent, #6366F1);
      }

      .name {
        flex: 1;
        min-width: 0;
        font-weight: 600;
      }

      .role {
        width: auto;
        min-width: 150px;
        min-height: 44px;
      }

      .add {
        display: flex;
        gap: 8px;
      }

      .add input {
        flex: 1;
      }

      .add button {
        min-height: 48px;
      }

      .message {
        margin: 12px 0 0;
        color: var(--pv-danger, #DC2626);
      }
    `,
  ];

  render() {
    return html`
      <ul>
        ${this._rows.map((row, index) => html`
          <li>
            <label class="check">
              <input type="checkbox" .checked=${row.checked} aria-label="${row.name} lives here"
                @change=${(e: Event) => this._update(index, { checked: (e.target as HTMLInputElement).checked })} />
            </label>
            <pv-member-avatar
              .member=${{
                name: row.name,
                color: this.household?.members.find(m => m.id === row.memberId)?.color ?? NOT_YET,
                picture: row.person ? { person: true } : { initial: true },
                person: row.person,
              }}
              .hass=${this.hass}
              size="40"
            ></pv-member-avatar>
            <span class="name">${row.name}</span>
            <select class="pv-input pv-select role" aria-label="What ${row.name} is"
              ?disabled=${!row.checked}
              @change=${(e: Event) => this._update(index, { role: (e.target as HTMLSelectElement).value as Role })}>
              ${ROLES.map(role => html`<option value=${role.id} ?selected=${row.role === role.id}>${role.label}</option>`)}
            </select>
          </li>
        `)}
      </ul>
      <div class="add">
        <input class="pv-input" type="text" maxlength="40" placeholder="Someone without Home Assistant"
          aria-label="Name of someone to add"
          .value=${this._name}
          @input=${(e: Event) => { this._name = (e.target as HTMLInputElement).value; }}
          @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter') this._add(); }} />
        <button class="pv-btn pv-btn-secondary" type="button" ?disabled=${!this._name.trim()} @click=${this._add}>Add someone</button>
      </div>
      ${this._message ? html`<p class="message" role="alert">${this._message}</p>` : nothing}
    `;
  }

  private _update(index: number, patch: Partial<PersonRow>): void {
    this._rows = this._rows.map((row, i) => (i === index ? { ...row, ...patch } : row));
  }

  private _add = (): void => {
    if (!this._name.trim()) return;
    this._rows = [...this._rows, addedRow(this._name, this._added++)];
    this._name = '';
  };
}

defineElement('pv-setup-people', PvSetupPeople);
