// Shared constants

/**
 * Global keyboard shortcuts
 */
export const GLOBAL_SHORTCUTS = {
  SHOW_WINDOW_AT_CURSOR: 'CmdOrCtrl+Alt+S',
} as const;

/**
 * Asset file paths (relative to app root)
 * All assets are compiled to dist/assets by Rspack
 */
export const ASSETS_PATH = {
  TRAY_ICON: 'dist/assets/IconTemplate.png',
  DIALOG_ICON: 'dist/assets/Icon.png',
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
