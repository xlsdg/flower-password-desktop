import { app, nativeTheme } from 'electron';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { AppConfig, ThemeMode, LanguageMode, FormSettings } from '../shared/types';
import { applyLanguage } from './i18n';

/**
 * Default form settings
 */
const DEFAULT_FORM_SETTINGS: FormSettings = {
  passwordLength: 16,
  prefix: '',
  suffix: '',
};

/**
 * Default application configuration
 */
const DEFAULT_CONFIG: AppConfig = {
  theme: 'auto',
  language: 'auto',
  formSettings: DEFAULT_FORM_SETTINGS,
};

/**
 * Configuration file path
 */
const CONFIG_FILE_PATH = path.join(app.getPath('userData'), 'config.json');

/**
 * In-memory config cache
 */
let configCache: AppConfig | null = null;

/**
 * Load configuration from file
 * Creates default config if file doesn't exist
 * @returns Application configuration
 */
export function loadConfig(): AppConfig {
  if (configCache) {
    return configCache;
  }

  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const configData = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
      const parsedConfig = JSON.parse(configData) as Partial<AppConfig>;

      // Validate and merge with defaults
      configCache = {
        theme: isValidTheme(parsedConfig.theme) ? parsedConfig.theme : DEFAULT_CONFIG.theme,
        language: isValidLanguage(parsedConfig.language) ? parsedConfig.language : DEFAULT_CONFIG.language,
        formSettings: isValidFormSettings(parsedConfig.formSettings)
          ? parsedConfig.formSettings
          : DEFAULT_CONFIG.formSettings,
      };
    } else {
      configCache = { ...DEFAULT_CONFIG };
      saveConfig(configCache);
    }
  } catch (error) {
    console.error('Failed to load config:', error);
    configCache = { ...DEFAULT_CONFIG };
  }

  return configCache;
}

/**
 * Save configuration to file
 * @param config - Configuration to save
 */
export function saveConfig(config: AppConfig): void {
  try {
    const configDir = path.dirname(CONFIG_FILE_PATH);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config, null, 2), 'utf-8');
    configCache = config;
  } catch (error) {
    console.error('Failed to save config:', error);
  }
}

/**
 * Get current configuration
 * @returns Current app configuration
 */
export function getConfig(): AppConfig {
  return loadConfig();
}

/**
 * Update theme setting
 * @param theme - Theme mode to set
 */
export function setTheme(theme: ThemeMode): void {
  const config = loadConfig();
  config.theme = theme;
  saveConfig(config);
  applyTheme(theme);
}

/**
 * Update language setting
 * @param language - Language mode to set
 */
export function setLanguage(language: LanguageMode): void {
  const config = loadConfig();
  config.language = language;
  saveConfig(config);
  applyLanguage(language);
}

/**
 * Apply theme to Electron's nativeTheme
 * @param theme - Theme mode to apply
 */
export function applyTheme(theme: ThemeMode): void {
  if (theme === 'auto') {
    nativeTheme.themeSource = 'system';
  } else {
    nativeTheme.themeSource = theme;
  }
}

/**
 * Validate theme value
 * @param theme - Theme value to validate
 * @returns True if valid theme
 */
function isValidTheme(theme: unknown): theme is ThemeMode {
  return typeof theme === 'string' && ['light', 'dark', 'auto'].includes(theme);
}

/**
 * Validate language value
 * @param language - Language value to validate
 * @returns True if valid language
 */
function isValidLanguage(language: unknown): language is LanguageMode {
  return typeof language === 'string' && ['zh-CN', 'zh-TW', 'en-US', 'auto'].includes(language);
}

/**
 * Validate form settings
 * @param settings - Form settings to validate
 * @returns True if valid form settings
 */
function isValidFormSettings(settings: unknown): settings is FormSettings {
  if (typeof settings !== 'object' || settings === null) {
    return false;
  }

  const s = settings as Partial<FormSettings>;

  const hasValidPasswordLength =
    typeof s.passwordLength === 'number' && s.passwordLength >= 6 && s.passwordLength <= 32;
  const hasValidPrefix = typeof s.prefix === 'string';
  const hasValidSuffix = typeof s.suffix === 'string';

  return hasValidPasswordLength && hasValidPrefix && hasValidSuffix;
}

/**
 * Update form settings
 * @param settings - Partial form settings to update
 */
export function updateFormSettings(settings: Partial<FormSettings>): void {
  const config = loadConfig();

  // Merge with existing form settings
  const updatedFormSettings: FormSettings = {
    ...config.formSettings,
    ...settings,
  };

  // Validate merged settings
  if (!isValidFormSettings(updatedFormSettings)) {
    console.error('Invalid form settings provided');
    return;
  }

  config.formSettings = updatedFormSettings;
  saveConfig(config);
}

/**
 * Get current auto-launch setting from system
 * @returns True if auto-launch is enabled
 */
export function getAutoLaunch(): boolean {
  try {
    const settings = app.getLoginItemSettings();
    return settings.openAtLogin;
  } catch (error) {
    console.error('Failed to get auto-launch status:', error);
    return false;
  }
}

/**
 * Update auto-launch setting
 * @param enabled - Enable or disable auto-launch
 * @returns True if successfully applied, false otherwise
 */
export function setAutoLaunch(enabled: boolean): boolean {
  try {
    const settings: Electron.Settings = {
      openAtLogin: enabled,
    };

    // Windows Squirrel installer requires special args to launch the app correctly
    // Without this, it would launch the Update.exe instead of the actual app
    if (process.platform === 'win32' && app.isPackaged) {
      settings.args = ['--processStart', `${path.basename(process.execPath)}`];
    }

    app.setLoginItemSettings(settings);
    return true;
  } catch (error) {
    console.error('Failed to set auto-launch:', error);
    return false;
  }
}

/**
 * Initialize configuration system
 * Load config and apply theme and language on startup
 */
export function initConfig(): void {
  const config = loadConfig();
  applyTheme(config.theme);
  applyLanguage(config.language);
}
