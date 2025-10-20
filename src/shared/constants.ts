// Shared constants

/**
 * Global keyboard shortcuts
 */
export const GLOBAL_SHORTCUTS = {
  SHOW_WINDOW_AT_CURSOR: 'CmdOrCtrl+Alt+S',
} as const;

/**
 * Environment detection
 * Use MAIN_WINDOW_VITE_DEV_SERVER_URL as a reliable indicator of development mode
 * This constant is set by @electron-forge/plugin-vite and undefined in production
 */
export const isDevelopment = typeof MAIN_WINDOW_VITE_DEV_SERVER_URL !== 'undefined';

export const ASSETS_PATH = {
  TRAY_ICON: isDevelopment ? '../../public/IconTemplate.png' : '../renderer/IconTemplate.png',
  DIALOG_ICON: isDevelopment ? '../../public/Icon.png' : '../renderer/Icon.png',
} as const;

/**
 * Keyboard keys
 */
export const KEYBOARD_KEYS = {
  ENTER: 'Enter',
} as const;

/**
 * Allowed URL protocols for external links
 */
export const ALLOWED_URL_PROTOCOLS = ['https:', 'http:'] as const;
