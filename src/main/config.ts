import * as fs from 'node:fs';
import * as path from 'node:path';

import AutoLaunch from 'auto-launch';
import { app, nativeTheme } from 'electron';

import {
  AVAILABLE_LANGUAGES,
  AVAILABLE_SHORTCUTS,
  AVAILABLE_THEMES,
  DEFAULT_PASSWORD_LENGTH,
  GLOBAL_SHORTCUTS,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from '../shared/constants';
import type { AppConfig, FormSettings, GlobalShortcut, LanguageMode, ThemeMode } from '../shared/types';
import { showMessageBox } from './dialog';
import { applyLanguage, t } from './i18n';
import { registerGlobalShortcut } from './shortcut';

const CONFIG_FILE_PATH = path.join(app.getPath('userData'), 'config.json');

const DEFAULT_FORM_SETTINGS = {
  passwordLength: DEFAULT_PASSWORD_LENGTH,
  prefix: '',
  suffix: '',
} as const satisfies FormSettings;

const DEFAULT_CONFIG = {
  theme: 'auto',
  language: 'auto',
  formSettings: { ...DEFAULT_FORM_SETTINGS },
  globalShortcut: GLOBAL_SHORTCUTS.SHOW_WINDOW_AT_CURSOR,
} as const satisfies AppConfig;

let autoLauncher: AutoLaunch | null = null;

export function setTheme(theme: ThemeMode): void {
  if (!isValidTheme(theme)) {
    console.error('Attempted to set unsupported theme:', theme);
    return;
  }

  const config = readConfig();
  writeConfig({ ...config, theme });
  applyNativeTheme(theme);
}

export function setLanguage(language: LanguageMode): void {
  if (!isValidLanguage(language)) {
    console.error('Attempted to set unsupported language:', language);
    return;
  }

  const config = readConfig();
  writeConfig({ ...config, language });
  applyLanguage(language);
}

export function updateFormSettings(settings: Partial<FormSettings>): void {
  const config = readConfig();
  const merged: FormSettings = { ...config.formSettings, ...settings };

  if (!isValidFormSettings(merged)) {
    console.error('Invalid form settings provided');
    return;
  }

  writeConfig({ ...config, formSettings: merged });
}

export async function getAutoLaunch(): Promise<boolean> {
  try {
    const launcher = ensureAutoLauncher();
    return await launcher.isEnabled();
  } catch (error) {
    console.error('Failed to get auto-launch status:', error);
    return false;
  }
}

export async function setAutoLaunch(enabled: boolean): Promise<boolean> {
  try {
    const launcher = ensureAutoLauncher();

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
    await showMessageBox({
      type: 'error',
      title: t('dialog.autoLaunch.set.failed.title'),
      message: t('dialog.autoLaunch.set.failed.message'),
      detail: errorMessage,
    });

    return false;
  }
}

export function setGlobalShortcut(shortcut: GlobalShortcut): void {
  if (!isValidGlobalShortcut(shortcut)) {
    console.error('Attempted to set unsupported shortcut:', shortcut);
    return;
  }

  const config = readConfig();
  writeConfig({ ...config, globalShortcut: shortcut });
  registerGlobalShortcut(shortcut);
}

export function initConfig(): void {
  const config = readConfig();
  applyNativeTheme(config.theme);
  applyLanguage(config.language);
  registerGlobalShortcut(config.globalShortcut);
}

export function readConfig(): AppConfig {
  try {
    if (!fs.existsSync(CONFIG_FILE_PATH)) {
      const config = defaultConfig();
      writeConfig(config);
      return config;
    }

    const configData = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(configData) as Partial<AppConfig>;
    const sanitized = sanitizeConfig(parsed);
    return {
      ...sanitized,
      formSettings: { ...sanitized.formSettings },
    };
  } catch (error) {
    console.error('Failed to load config:', error);
    const fallback = defaultConfig();
    writeConfig(fallback);
    return fallback;
  }
}

function writeConfig(config: AppConfig): void {
  try {
    fs.mkdirSync(path.dirname(CONFIG_FILE_PATH), { recursive: true });
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save config:', error);
  }
}

function sanitizeConfig(partial: Partial<AppConfig>): AppConfig {
  const config = defaultConfig();

  config.theme = isValidTheme(partial.theme) ? partial.theme : config.theme;
  config.language = isValidLanguage(partial.language) ? partial.language : config.language;
  config.formSettings = isValidFormSettings(partial.formSettings)
    ? { ...partial.formSettings }
    : { ...config.formSettings };
  config.globalShortcut = isValidGlobalShortcut(partial.globalShortcut)
    ? partial.globalShortcut
    : config.globalShortcut;

  return config;
}

function defaultConfig(): AppConfig {
  return {
    ...DEFAULT_CONFIG,
    formSettings: { ...DEFAULT_CONFIG.formSettings },
  };
}

function ensureAutoLauncher(): AutoLaunch {
  if (autoLauncher === null) {
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

function applyNativeTheme(theme: ThemeMode): void {
  nativeTheme.themeSource = theme === 'auto' ? 'system' : theme;
}

function isValidTheme(theme: unknown): theme is ThemeMode {
  return typeof theme === 'string' && AVAILABLE_THEMES.includes(theme as ThemeMode);
}

function isValidLanguage(language: unknown): language is LanguageMode {
  return typeof language === 'string' && AVAILABLE_LANGUAGES.includes(language as LanguageMode);
}

function isValidFormSettings(settings: unknown): settings is FormSettings {
  if (typeof settings !== 'object' || settings === null) {
    return false;
  }

  const candidate = settings as Partial<FormSettings>;
  const passwordLength = candidate.passwordLength;

  const hasValidLength =
    typeof passwordLength === 'number' &&
    passwordLength >= PASSWORD_MIN_LENGTH &&
    passwordLength <= PASSWORD_MAX_LENGTH;
  const hasValidPrefix = typeof candidate.prefix === 'string';
  const hasValidSuffix = typeof candidate.suffix === 'string';

  return hasValidLength && hasValidPrefix && hasValidSuffix;
}

function isValidGlobalShortcut(shortcut: unknown): shortcut is GlobalShortcut {
  return typeof shortcut === 'string' && AVAILABLE_SHORTCUTS.includes(shortcut as GlobalShortcut);
}
