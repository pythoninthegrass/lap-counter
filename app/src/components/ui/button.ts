// app/src/components/ui/button.ts

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: inline-flex;
    }

    button {
      all: unset;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      transition-property: color, background-color, border-color;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 150ms;
    }

    button:focus-visible {
      outline: 2px solid var(--ring-color, #2563eb);
      outline-offset: 2px;
    }

    button:disabled {
      pointer-events: none;
      opacity: 0.5;
    }

    /* Variants */
    button.default {
      background-color: var(--primary-color, #2563eb);
      color: var(--primary-foreground, white);
    }

    button.default:hover {
      background-color: var(--primary-hover, #1d4ed8);
    }

    button.outline {
      border: 1px solid var(--input-border, #e5e7eb);
      background-color: transparent;
    }

    button.outline:hover {
      background-color: var(--accent-color, #f3f4f6);
    }

    /* Sizes */
    button.default-size {
      height: 2.5rem;
      padding: 0.5rem 1rem;
    }

    button.sm {
      height: 2.25rem;
      padding: 0.375rem 0.75rem;
    }

    button.lg {
      height: 2.75rem;
      padding: 0.75rem 2rem;
    }
  </style>
  <button part="button">
    <slot></slot>
  </button>
`;

export class UIButton extends HTMLElement {
    private button: HTMLButtonElement;

    static get observedAttributes() {
        return ['variant', 'size', 'disabled'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot!.appendChild(template.content.cloneNode(true));
        this.button = this.shadowRoot!.querySelector('button')!;
    }

    connectedCallback() {
        this.updateClasses();
    }

    attributeChangedCallback() {
        this.updateClasses();
    }

    private updateClasses() {
        const variant = this.getAttribute('variant') || 'default';
        const size = this.getAttribute('size') || 'default-size';

        // Reset classes
        this.button.className = '';

        // Add variant and size classes
        this.button.classList.add(variant, size);

        // Handle disabled state
        this.button.disabled = this.hasAttribute('disabled');
    }
}

customElements.define('ui-button', UIButton);
