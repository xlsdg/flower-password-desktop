// Shared type definitions

/**
 * Electron API interface
 */
export interface ElectronAPI {
  /**
   * Hide window
   */
  hide: () => void;

  /**
   * Quit application
   */
  quit: () => void;

  /**
   * Write text to clipboard
   * @param text - Text to write
   */
  writeText: (text: string) => void;

  /**
   * Open external link in default browser
   * @param url - URL to open
   */
  openExternal: (url: string) => Promise<void>;

  /**
   * Listen for domain extracted from clipboard
   * @param callback - Callback function to receive domain
   */
  onKeyFromClipboard: (callback: (value: string) => void) => void;

  /**
   * Get system locale from main process
   * @returns System locale string (e.g., 'en-US', 'zh-CN')
   */
  getSystemLocale: () => Promise<string>;

  /**
   * Listen for window shown event
   * @param callback - Callback function invoked when window is shown
   */
  onWindowShown: (callback: () => void) => void;

  /**
   * Get application configuration
   * @returns Current app configuration
   */
  getConfig: () => Promise<AppConfig>;

  /**
   * Listen for theme changes
   * @param callback - Callback function to receive new theme
   */
  onThemeChanged: (callback: (theme: ThemeMode) => void) => void;

  /**
   * Listen for language changes
   * @param callback - Callback function to receive new language
   */
  onLanguageChanged: (callback: (language: LanguageMode) => void) => void;

  /**
   * Update form settings
   * @param settings - Form settings to update
   */
  updateFormSettings: (settings: Partial<FormSettings>) => void;
}

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
export interface WindowConfig {
  width: number;
  height: number;
  show: boolean;
  frame: boolean;
  resizable: boolean;
  skipTaskbar: boolean;
}

/**
 * Position coordinates
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Size dimensions
 */
export interface Size {
  width: number;
  height: number;
}

/**
 * Bounds information (position + size)
 */
export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * PSL parsing result
 * Re-export ParsedDomain from psl package for convenience
 */
export type { ParsedDomain } from 'psl';

/**
 * Theme mode options
 */
export type ThemeMode = 'light' | 'dark' | 'auto';

/**
 * Language options
 */
export type LanguageMode = 'zh-CN' | 'zh-TW' | 'en-US' | 'auto';

/**
 * Form settings configuration
 */
export interface FormSettings {
  passwordLength: number;
  prefix: string;
  suffix: string;
}

/**
 * Application configuration
 */
export interface AppConfig {
  theme: ThemeMode;
  language: LanguageMode;
  formSettings: FormSettings;
}
