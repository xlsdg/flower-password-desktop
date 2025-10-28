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

export const isDevelopment = typeof MAIN_WINDOW_VITE_DEV_SERVER_URL !== 'undefined';

export const MAIN_WINDOW_OPTIONS = {
  width: 300,
  height: 334,
  show: false,
  frame: false,
  resizable: false,
  skipTaskbar: true,
} as const;

export const ASSET_PATHS = {
  TRAY_ICON: isDevelopment ? '../../public/Tray.png' : '../renderer/Tray.png',
  DIALOG_ICON: isDevelopment ? '../../public/Icon.png' : '../renderer/Icon.png',
} as const;

export const GLOBAL_SHORTCUTS = {
  SHOW_WINDOW_AT_CURSOR: 'CmdOrCtrl+Alt+S',
} as const;
export const AVAILABLE_SHORTCUTS = [
  'CmdOrCtrl+Alt+S',
  'CmdOrCtrl+Shift+S',
  'CmdOrCtrl+Alt+P',
  'CmdOrCtrl+Shift+P',
  'CmdOrCtrl+Alt+F',
  'CmdOrCtrl+Shift+F',
] as const;

export const AVAILABLE_THEMES = ['light', 'dark', 'auto'] as const;
export const AVAILABLE_LANGUAGES = ['zh-CN', 'zh-TW', 'en-US', 'auto'] as const;
