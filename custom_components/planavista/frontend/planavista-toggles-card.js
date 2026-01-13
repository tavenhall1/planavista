/**
 * PlanaVista Toggles Card
 * Calendar visibility toggles with person avatars
 *
 * Version: 0.2.0
 */

class PlanaVistaTogglesCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._stateManager = null;
  }

  connectedCallback() {
    if (window.PlanaVistaBase) {
      this._stateManager = window.PlanaVistaBase.StateManager.getInstance();
      this._unsubscribe = this._stateManager.subscribe(() => this.render());
    }
  }

  disconnectedCallback() {
    if (this._unsubscribe) {
      this._unsubscribe();
    }
  }

  setConfig(config) {
    this._config = config;
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  getCardSize() {
    return 1;
  }

  get entity() {
    const entityId = this._config.entity || 'sensor.planavista_config';
    return this._hass?.states?.[entityId];
  }

  get calendars() {
    return this.entity?.attributes?.calendars || [];
  }

  get display() {
    return this.entity?.attributes?.display || {};
  }

  get theme() {
    return this._config.theme || this.display.theme || 'planavista';
  }

  render() {
    if (!this._hass) return;

    const { PlanaVistaBase } = window;
    if (!PlanaVistaBase) {
      this.shadowRoot.innerHTML = '<ha-card><div class="error">PlanaVista base module not loaded</div></ha-card>';
      return;
    }

    if (!this._stateManager) {
      this._stateManager = PlanaVistaBase.StateManager.getInstance();
    }

    const calendars = this.calendars;
    const layout = this._config.layout || 'horizontal';
    const showNames = this._config.show_names !== false;
    const showAddButton = this._config.show_add_button !== false;

    if (calendars.length === 0) {
      this.shadowRoot.innerHTML = `
        <style>
          :host { display: block; ${PlanaVistaBase.getThemeStyles(this.theme)} }
          ha-card { background: var(--pv-card-background); padding: 1rem; }
          .no-calendars { text-align: center; color: var(--pv-text-secondary); }
        </style>
        <ha-card>
          <div class="no-calendars">No calendars configured</div>
        </ha-card>
      `;
      return;
    }

    const buttons = calendars.map(cal => {
      const isHidden = this._stateManager.isCalendarHidden(cal.entity_id);
      const personEntity = cal.person_entity;
      let avatar = '';

      if (personEntity && this._hass.states[personEntity]) {
        const person = this._hass.states[personEntity];
        const picture = person.attributes.entity_picture;
        if (picture) {
          avatar = `<img src="${picture}" class="person-avatar" alt="${cal.display_name}" />`;
        }
      }

      if (!avatar) {
        avatar = `<ha-icon icon="${cal.icon || 'mdi:calendar'}"></ha-icon>`;
      }

      return `
        <button
          class="calendar-toggle ${isHidden ? 'inactive' : 'active'}"
          data-entity-id="${cal.entity_id}"
          style="--calendar-color: ${cal.color}"
          title="${cal.display_name}"
        >
          ${avatar}
          ${showNames ? `<span class="calendar-name">${cal.display_name}</span>` : ''}
        </button>
      `;
    }).join('');

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          ${PlanaVistaBase.getThemeStyles(this.theme)}
        }

        ha-card {
          background: var(--pv-card-background);
          color: var(--pv-text);
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--pv-border);
        }

        .controls {
          display: flex;
          gap: 1rem;
          align-items: center;
          ${layout === 'vertical' ? 'flex-direction: column;' : ''}
        }

        .calendar-buttons {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          flex: 1;
          ${layout === 'vertical' ? 'justify-content: center;' : ''}
        }

        .calendar-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem ${showNames ? '1rem' : '0.75rem'};
          border: none;
          border-radius: 24px;
          background: var(--pv-event-bg);
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.95rem;
          color: var(--pv-text);
        }

        .calendar-toggle.active {
          background: var(--calendar-color, var(--pv-accent));
          color: white;
        }

        .calendar-toggle.inactive {
          opacity: 0.5;
        }

        .calendar-toggle:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .calendar-toggle ha-icon {
          --mdc-icon-size: 20px;
        }

        .person-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          object-fit: cover;
        }

        .calendar-name {
          white-space: nowrap;
        }

        .add-event-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1.5rem;
          background: var(--pv-accent);
          color: white;
          border: none;
          border-radius: 24px;
          cursor: pointer;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }

        .add-event-btn:hover {
          filter: brightness(0.9);
          transform: translateY(-2px);
        }

        .add-event-btn ha-icon {
          --mdc-icon-size: 20px;
        }
      </style>
      <ha-card>
        <div class="controls">
          <div class="calendar-buttons">${buttons}</div>
          ${showAddButton ? `
            <button class="add-event-btn">
              <ha-icon icon="mdi:calendar-plus"></ha-icon>
              <span>Add Event</span>
            </button>
          ` : ''}
        </div>
      </ha-card>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    // Calendar toggle buttons
    const toggleButtons = this.shadowRoot.querySelectorAll('.calendar-toggle');
    toggleButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const entityId = btn.dataset.entityId;
        if (this._stateManager) {
          this._stateManager.toggleCalendar(entityId);
        }
      });
    });

    // Add event button
    const addEventBtn = this.shadowRoot.querySelector('.add-event-btn');
    if (addEventBtn) {
      addEventBtn.addEventListener('click', () => {
        this.openAddEventDialog();
      });
    }
  }

  openAddEventDialog() {
    const calendars = this.calendars;
    if (calendars.length > 0) {
      const firstCalendar = calendars[0];
      const event = new CustomEvent('hass-more-info', {
        bubbles: true,
        composed: true,
        detail: { entityId: firstCalendar.entity_id }
      });
      this.dispatchEvent(event);
    }
  }

  static getConfigElement() {
    return document.createElement('planavista-toggles-card-editor');
  }

  static getStubConfig() {
    return {
      entity: 'sensor.planavista_config',
      show_names: true,
      show_add_button: true,
    };
  }
}

class PlanaVistaTogglesCardEditor extends HTMLElement {
  setConfig(config) { this._config = config; this.render(); }
  set hass(hass) { this._hass = hass; }
  render() {
    this.innerHTML = `
      <div style="padding: 16px;">
        <p><strong>PlanaVista Toggles Card</strong></p>
        <p style="color: var(--secondary-text-color); font-size: 12px;">
          Options: entity, layout (horizontal/vertical), show_names, show_add_button, theme
        </p>
      </div>
    `;
  }
}

customElements.define('planavista-toggles-card', PlanaVistaTogglesCard);
customElements.define('planavista-toggles-card-editor', PlanaVistaTogglesCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'planavista-toggles-card',
  name: 'PlanaVista Toggles',
  description: 'Calendar visibility toggles with avatars',
  preview: true,
});

console.info(
  `%c PLANAVISTA-TOGGLES %c v0.2.0 `,
  'color: white; background: #764ba2; font-weight: bold;',
  'color: #764ba2; background: white; font-weight: bold;'
);
