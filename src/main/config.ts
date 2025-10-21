import { app, nativeTheme, dialog } from 'electron';
import * as fs from 'node:fs';
import * as path from 'node:path';
import AutoLaunch from 'auto-launch';
import type { AppConfig, ThemeMode, LanguageMode, FormSettings } from '../shared/types';
import { applyLanguage, t } from './i18n';

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
 * AutoLaunch instance for managing login items
 * Initialized lazily to ensure app.getPath() is available
 */
let autoLauncher: AutoLaunch | null = null;

/**
 * Get or create AutoLaunch instance
 */
function getAutoLauncher(): AutoLaunch {
  if (!autoLauncher) {
    autoLauncher = new AutoLaunch({
      name: 'FlowerPassword',
      path: app.getPath('exe'),
      mac: {
        useLaunchAgent: true,
      },
    });
  }
  return autoLauncher;
}

/**
 * Load configuration from file
 * Creates default config if file doesn't exist
 * @returns Application configuration
 */
export function loadConfig(): AppConfig {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const configData = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
      const parsedConfig = JSON.parse(configData) as Partial<AppConfig>;

      // Validate and merge with defaults
      return {
        theme: isValidTheme(parsedConfig.theme) ? parsedConfig.theme : DEFAULT_CONFIG.theme,
        language: isValidLanguage(parsedConfig.language) ? parsedConfig.language : DEFAULT_CONFIG.language,
        formSettings: isValidFormSettings(parsedConfig.formSettings)
          ? parsedConfig.formSettings
          : DEFAULT_CONFIG.formSettings,
      };
    } else {
      const config = { ...DEFAULT_CONFIG };
      saveConfig(config);
      return config;
    }
  } catch (error) {
    console.error('Failed to load config:', error);
    return { ...DEFAULT_CONFIG };
  }
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

  const updatedFormSettings: FormSettings = {
    ...config.formSettings,
    ...settings,
  };

  if (!isValidFormSettings(updatedFormSettings)) {
    console.error('Invalid form settings provided');
    return;
  }

  config.formSettings = updatedFormSettings;
  saveConfig(config);
}

/**
 * Get current auto-launch setting
 * @returns Promise that resolves to true if auto-launch is enabled
 */
export async function getAutoLaunch(): Promise<boolean> {
  try {
    const launcher = getAutoLauncher();
    return await launcher.isEnabled();
  } catch (error) {
    console.error('Failed to get auto-launch status:', error);
    return false;
  }
}

/**
 * Update auto-launch setting
 * @param enabled - Enable or disable auto-launch
 * @returns Promise that resolves to true if successful
 */
export async function setAutoLaunch(enabled: boolean): Promise<boolean> {
  try {
    const launcher = getAutoLauncher();

    if (enabled) {
      await launcher.enable();
    } else {
      await launcher.disable();
    }

    const isEnabled = await launcher.isEnabled();
    return isEnabled === enabled;
  } catch (error) {
    console.error('Failed to set auto-launch:', error);

    const errorMessage = error instanceof Error ? error.message : String(error);
    await dialog.showMessageBox({
      type: 'error',
      title: t('dialog.autoLaunch.setFailed'),
      message: t('dialog.autoLaunch.setFailedMessage'),
      detail: errorMessage,
    });

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
