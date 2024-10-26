const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: block;
    }

    .card {
      border-radius: 0.5rem;
      border: 1px solid var(--border-color, #e5e7eb);
      background-color: var(--card-bg, white);
      color: var(--card-fg, #111827);
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    }

    .card-header {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      padding: 1.5rem;
    }

    .card-content {
      padding: 1.5rem;
      padding-top: 0;
    }

    .card-footer {
      display: flex;
      align-items: center;
      padding: 1.5rem;
      padding-top: 0;
    }
  </style>
  <div class="card">
    <slot></slot>
  </div>
`;

const headerTemplate = document.createElement('template');
headerTemplate.innerHTML = `
  <div class="card-header">
    <slot></slot>
  </div>
`;

const contentTemplate = document.createElement('template');
contentTemplate.innerHTML = `
  <div class="card-content">
    <slot></slot>
  </div>
`;

const footerTemplate = document.createElement('template');
footerTemplate.innerHTML = `
  <div class="card-footer">
    <slot></slot>
  </div>
`;

export class UICard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot!.appendChild(template.content.cloneNode(true));
    }
}

export class UICardHeader extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot!.appendChild(headerTemplate.content.cloneNode(true));
    }
}

export class UICardContent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot!.appendChild(contentTemplate.content.cloneNode(true));
    }
}

export class UICardFooter extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot!.appendChild(footerTemplate.content.cloneNode(true));
    }
}

// Define custom elements
customElements.define('ui-card', UICard);
customElements.define('ui-card-header', UICardHeader);
customElements.define('ui-card-content', UICardContent);
customElements.define('ui-card-footer', UICardFooter);
