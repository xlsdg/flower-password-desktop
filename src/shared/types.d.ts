import type { AVAILABLE_LANGUAGES, AVAILABLE_SHORTCUTS, AVAILABLE_THEMES } from './constants';

export type { ParsedDomain } from 'psl';

export interface RendererBridge {
  hide(): void;
  quit(): void;
  writeText(text: string): void;
  openExternal(url: string): Promise<void>;
  getSystemLocale(): Promise<string>;
  getConfig(): Promise<AppConfig>;
  onKeyFromClipboard(callback: (value: string) => void): void;
  onWindowShown(callback: () => void): void;
  onThemeChanged(callback: (theme: ThemeMode) => void): void;
  onLanguageChanged(callback: (language: LanguageMode) => void): void;
  updateFormSettings(settings: Partial<FormSettings>): void;
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Bounds extends Position, Size {}

export type ThemeMode = (typeof AVAILABLE_THEMES)[number];
export type SpecificTheme = Exclude<ThemeMode, 'auto'>;
export type LanguageMode = (typeof AVAILABLE_LANGUAGES)[number];
export type SpecificLanguage = Exclude<LanguageMode, 'auto'>;
export type GlobalShortcut = (typeof AVAILABLE_SHORTCUTS)[number];

export interface FormSettings {
  passwordLength: number;
  prefix: string;
  suffix: string;
}

export interface AppConfig {
  theme: ThemeMode;
  language: LanguageMode;
  formSettings: FormSettings;
  globalShortcut: GlobalShortcut;
}
