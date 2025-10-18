// Shared constants

/**
 * Global keyboard shortcuts
 */
export const GLOBAL_SHORTCUTS = {
  SHOW_WINDOW_AT_CURSOR: 'CmdOrCtrl+Alt+S',
} as const;

/**
 * Asset file paths (relative to app root)
 */
export const ASSETS_PATH = {
  TRAY_ICON: 'src/renderer/assets/IconTemplate.png',
  DIALOG_ICON: 'src/renderer/assets/Icon.png',
} as const;

/**
 * Dialog text constants
 */
export const DIALOG_TEXTS = {
  APP_NAME: '花密',
  QUIT_MESSAGE: '确定退出？',
  QUIT_CONFIRM: '确定',
  QUIT_CANCEL: '取消',
  TRAY_SHOW: '显示',
  TRAY_QUIT: '退出',
  TRAY_TOOLTIP: '花密',
} as const;

/**
 * UI text constants for renderer process
 */
export const UI_TEXTS = {
  GENERATE_PASSWORD_BUTTON: '生成密码(点击复制)',
} as const;

/**
 * DOM element IDs
 */
export const DOM_IDS = {
  CLOSE_BUTTON: 'close',
  PASSWORD_INPUT: 'password',
  KEY_INPUT: 'key',
  PREFIX_INPUT: 'prefix',
  SUFFIX_INPUT: 'suffix',
  CODE_BUTTON: 'code',
  LENGTH_SELECT: 'length',
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
