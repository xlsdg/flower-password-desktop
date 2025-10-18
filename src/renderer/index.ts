/**
 * Renderer process main file
 * Handles user interface interactions and password generation logic
 */

import { fpCode } from 'flowerpassword.js';
import { UI_TEXTS, DOM_IDS, KEYBOARD_KEYS, ALLOWED_URL_PROTOCOLS } from '../shared/constants';

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
  const btnClose = document.getElementById(DOM_IDS.CLOSE_BUTTON);
  const iptPassword = document.getElementById(DOM_IDS.PASSWORD_INPUT) as HTMLInputElement;
  const iptKey = document.getElementById(DOM_IDS.KEY_INPUT) as HTMLInputElement;
  const iptPrefix = document.getElementById(DOM_IDS.PREFIX_INPUT) as HTMLInputElement;
  const iptSuffix = document.getElementById(DOM_IDS.SUFFIX_INPUT) as HTMLInputElement;
  const btnCode = document.getElementById(DOM_IDS.CODE_BUTTON) as HTMLButtonElement;
  const selLength = document.getElementById(DOM_IDS.LENGTH_SELECT) as HTMLSelectElement;

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

  if (password.length < 1 || key.length < 1) {
    elements.btnCode.textContent = UI_TEXTS.GENERATE_PASSWORD_BUTTON;
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
  if (event.key === KEYBOARD_KEYS.ENTER) {
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
 * Validate if URL is safe to open externally
 * @param url - URL string to validate
 * @returns True if URL is safe (http/https protocol only)
 */
function isValidExternalUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    // Use type assertion to handle readonly array includes check
    return (ALLOWED_URL_PROTOCOLS as readonly string[]).includes(parsedUrl.protocol);
  } catch {
    // Invalid URL format
    return false;
  }
}

/**
 * Setup external link handling
 */
function setupExternalLinks(): void {
  const links = document.querySelectorAll<HTMLAnchorElement>('a[href]');

  links.forEach(link => {
    const url = link.getAttribute('href');
    if (url && isValidExternalUrl(url)) {
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
