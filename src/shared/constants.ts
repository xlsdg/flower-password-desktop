// Shared constants

/**
 * IPC channel names
 */
export const IPC_CHANNELS = {
  HIDE: 'hide',
  QUIT: 'quit',
  CLIPBOARD_WRITE_TEXT: 'clipboard:writeText',
  SHELL_OPEN_EXTERNAL: 'shell:openExternal',
  KEY_FROM_CLIPBOARD: 'key-from-clipboard',
  GET_SYSTEM_LOCALE: 'get-system-locale',
  WINDOW_SHOWN: 'window-shown',
  GET_CONFIG: 'config:get',
  THEME_CHANGED: 'config:themeChanged',
  LANGUAGE_CHANGED: 'config:languageChanged',
  UPDATE_FORM_SETTINGS: 'config:updateFormSettings',
} as const;

/**
 * Window configuration
 */
export const WINDOW_CONFIG = {
  width: 300,
  height: 334,
  show: false,
  frame: false,
  resizable: false,
  skipTaskbar: true,
} as const;

/**
 * Global keyboard shortcuts
 */
export const GLOBAL_SHORTCUTS = {
  SHOW_WINDOW_AT_CURSOR: 'CmdOrCtrl+Alt+S',
} as const;

/**
 * Available global shortcut options
 * Single source of truth for shortcut keys
 */
export const AVAILABLE_SHORTCUTS = [
  'CmdOrCtrl+Alt+S',
  'CmdOrCtrl+Shift+S',
  'CmdOrCtrl+Alt+P',
  'CmdOrCtrl+Shift+P',
  'CmdOrCtrl+Alt+F',
  'CmdOrCtrl+Shift+F',
] as const;

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
