# Internationalization - Tauri Migration

## ADDED Requirements

### Requirement: Dual-Layer Translation System

The system SHALL maintain separate translation systems for frontend (React i18next) and backend (Rust) in Tauri architecture.

#### Scenario: Frontend translations unchanged

- **WHEN** React components render localized text
- **THEN** react-i18next library is used (no migration required)
- **AND** existing locale files (en, zh-CN, zh-TW) in src/renderer/locales/ remain functional

#### Scenario: Backend translations via Rust

- **WHEN** Rust backend needs localized strings (tray menu, notifications)
- **THEN** Rust code loads JSON locale files from src-tauri/locales/
- **AND** translations are retrieved using locale key

### Requirement: Supported Languages

The system SHALL support English, Simplified Chinese, Traditional Chinese, and automatic detection across frontend and backend.

#### Scenario: English locale

- **WHEN** user selects English language
- **THEN** frontend displays English UI via react-i18next
- **AND** backend tray menu shows English labels
- **AND** locale code is "en-US"

#### Scenario: Simplified Chinese locale

- **WHEN** user selects Simplified Chinese language
- **THEN** frontend displays Simplified Chinese UI
- **AND** backend tray menu shows Simplified Chinese labels
- **AND** locale code is "zh-CN"

#### Scenario: Traditional Chinese locale

- **WHEN** user selects Traditional Chinese language
- **THEN** frontend displays Traditional Chinese UI
- **AND** backend tray menu shows Traditional Chinese labels
- **AND** locale code is "zh-TW"

#### Scenario: Auto locale detection

- **WHEN** user selects "Auto" language mode
- **THEN** system locale is detected
- **AND** if system is Chinese (any variant), appropriate Chinese locale is used
- **AND** if system is other language, English (en-US) is used
- **AND** locale code is "auto"

### Requirement: Tauri Command for Locale Management

The system SHALL expose locale detection via Tauri commands, with language changes managed through configuration system.

#### Scenario: Get system locale

- **WHEN** frontend invokes `get_system_locale()` Tauri command
- **THEN** Rust backend detects and returns system locale code
- **AND** frontend uses value when language mode is "auto"
- **AND** frontend uses config language value when not "auto"

#### Scenario: Change language via configuration

- **WHEN** user changes language in tray menu or settings
- **THEN** language is updated via `set_config()` with new language value
- **AND** Rust backend updates configuration
- **AND** backend reloads translations
- **AND** tray menu items update to new language
- **AND** frontend is notified via LANGUAGE_CHANGED IPC event

#### Scenario: Invalid locale handling

- **WHEN** configuration contains unsupported locale
- **THEN** configuration validation falls back to "auto"
- **AND** system locale detection is used

### Requirement: System Locale Detection

The system SHALL detect system locale on first launch and default to appropriate language.

#### Scenario: First launch locale detection

- **WHEN** application starts for the first time (no saved configuration)
- **THEN** language is set to "auto" by default
- **AND** Rust backend detects system locale
- **AND** if system locale is zh-CN, zh-TW, or en-US, use that locale
- **AND** if system locale is other Chinese variant, default to zh-CN
- **AND** if system locale is non-Chinese/non-English, default to en-US

#### Scenario: Persisted locale preference

- **WHEN** application starts with existing configuration
- **THEN** Rust backend loads saved locale from config
- **AND** system locale detection is skipped

### Requirement: Runtime Language Switching

The system SHALL support language switching without application restart.

#### Scenario: Language switch in settings

- **WHEN** user changes language in tray menu
- **THEN** backend updates configuration with new language
- **AND** backend reloads translations and refreshes tray menu
- **AND** backend sends LANGUAGE_CHANGED IPC event to frontend
- **AND** frontend immediately updates to new language via react-i18next
- **AND** no application restart is required
