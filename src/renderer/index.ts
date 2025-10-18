/**
 * Renderer process main file
 * Handles user interface interactions and password generation logic
 */

import { fpCode } from 'flowerpassword.js';

/**
 * DOM element references
 */
interface DOMElements {
  btnClose: HTMLElement;
  iptPassword: HTMLInputElement;
  iptKey: HTMLInputElement;
  iptPrefix: HTMLInputElement;
  iptSuffix: HTMLInputElement;
  btnCode: HTMLButtonElement;
  selLength: HTMLSelectElement;
}

/**
 * Get all required DOM elements
 * @returns DOM elements object
 * @throws Throws error if required elements don't exist
 */
function getDOMElements(): DOMElements {
  const btnClose = document.getElementById('close');
  const iptPassword = document.getElementById('password') as HTMLInputElement;
  const iptKey = document.getElementById('key') as HTMLInputElement;
  const iptPrefix = document.getElementById('prefix') as HTMLInputElement;
  const iptSuffix = document.getElementById('suffix') as HTMLInputElement;
  const btnCode = document.getElementById('code') as HTMLButtonElement;
  const selLength = document.getElementById('length') as HTMLSelectElement;

  if (!btnClose || !iptPassword || !iptKey || !iptPrefix || !iptSuffix || !btnCode || !selLength) {
    throw new Error('Required DOM elements not found');
  }

  return {
    btnClose,
    iptPassword,
    iptKey,
    iptPrefix,
    iptSuffix,
    btnCode,
    selLength,
  };
}

/**
 * Hide window
 */
function hide(): void {
  window.electronAPI.hide();
}

/**
 * Generate password
 * @param elements - DOM elements object
 * @returns Generated password string, or false if input is invalid
 */
function showCode(elements: DOMElements): string | false {
  const password = elements.iptPassword.value;
  const key = elements.iptKey.value;
  const prefix = elements.iptPrefix.value;
  const suffix = elements.iptSuffix.value;
  const length = parseInt(elements.selLength.value, 10);

  const defaultText = '生成密码(点击复制)';

  if (password.length < 1 || key.length < 1) {
    elements.btnCode.textContent = defaultText;
    return false;
  }

  const fullKey = prefix + key + suffix;
  const code = fpCode(password, fullKey, length);
  elements.btnCode.textContent = code;

  return code;
}

/**
 * Handle input change event
 * @param elements - DOM elements object
 */
function handleInputChange(elements: DOMElements): void {
  showCode(elements);
}

/**
 * Handle Enter key press event
 * @param event - Keyboard event
 * @param elements - DOM elements object
 */
function handleKeyPress(event: KeyboardEvent, elements: DOMElements): void {
  if (event.keyCode === 13) {
    const code = showCode(elements);
    if (code !== false) {
      window.electronAPI
        .writeText(code)
        .then(() => {
          event.preventDefault();
          hide();
        })
        .catch((error: Error) => {
          console.error('Failed to write to clipboard:', error);
        });
    }
  }
}

/**
 * Handle password button click event
 * @param elements - DOM elements object
 */
function handleCodeButtonClick(elements: DOMElements): void {
  const code = showCode(elements);
  if (code !== false) {
    window.electronAPI
      .writeText(code)
      .then(() => {
        hide();
      })
      .catch((error: Error) => {
        console.error('Failed to write to clipboard:', error);
      });
  }
}

/**
 * Setup external link handling
 */
function setupExternalLinks(): void {
  const links = document.querySelectorAll<HTMLAnchorElement>('a[href]');

  links.forEach(link => {
    const url = link.getAttribute('href');
    if (url && url.startsWith('https')) {
      link.addEventListener('click', event => {
        event.preventDefault();
        window.electronAPI.openExternal(url).catch((error: Error) => {
          console.error('Failed to open external URL:', error);
        });
      });
    }
  });
}

/**
 * Initialize application
 */
function initialize(): void {
  try {
    const elements = getDOMElements();

    // Listen to input changes, generate password in real-time
    elements.iptPassword.addEventListener('input', () => handleInputChange(elements), false);
    elements.iptKey.addEventListener('input', () => handleInputChange(elements), false);
    elements.iptPrefix.addEventListener('input', () => handleInputChange(elements), false);
    elements.iptSuffix.addEventListener('input', () => handleInputChange(elements), false);
    elements.selLength.addEventListener('change', () => handleInputChange(elements), false);

    // Listen for Enter key
    elements.iptKey.addEventListener('keypress', event => handleKeyPress(event, elements), false);

    // Receive domain extracted from clipboard
    window.electronAPI.onKeyFromClipboard((message: string) => {
      elements.iptKey.value = message;
      showCode(elements);
    });

    // Close button
    elements.btnClose.addEventListener('click', () => hide(), false);

    // Click password button to copy
    elements.btnCode.addEventListener('click', () => handleCodeButtonClick(elements), false);

    // Handle external links
    setupExternalLinks();
  } catch (error) {
    console.error('Failed to initialize app:', error);
  }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
