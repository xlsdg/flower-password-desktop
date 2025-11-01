# Configuration - Tauri Migration

## ADDED Requirements

### Requirement: Tauri Store Plugin

The system SHALL persist user configuration using tauri-plugin-store instead of electron-store.

#### Scenario: Configuration persistence

- **WHEN** user changes application settings
- **THEN** configuration is saved to platform-specific location
- **AND** macOS: ~/Library/Application Support/com.xlsdg.flowerpassword/config.json
- **AND** Windows: %APPDATA%/com.xlsdg.flowerpassword/config.json
- **AND** Linux: ~/.config/com.xlsdg.flowerpassword/config.json

#### Scenario: Configuration loading on startup

- **WHEN** application starts
- **THEN** Rust backend loads configuration from store
- **AND** if no configuration exists, default values are used
- **AND** configuration is accessible to both frontend and backend

### Requirement: Configuration Schema

The system SHALL store user preferences with typed configuration structure.

#### Scenario: Configuration fields

- **WHEN** configuration is initialized
- **THEN** configuration includes fields:
  - `language`: string (en-US, zh-CN, zh-TW, auto)
  - `shortcut`: string (global shortcut combination)
  - `autoLaunch`: boolean (start on system boot)
  - `theme`: string (light, dark, auto)
  - `formSettings`: object with passwordLength (6-32), prefix, suffix
- **AND** all fields have documented default values

### Requirement: Tauri Command Interface

The system SHALL expose configuration access via Tauri commands.

#### Scenario: Get configuration

- **WHEN** frontend invokes `get_config()` Tauri command
- **THEN** Rust backend returns current configuration as JSON
- **AND** configuration includes all fields with current values

#### Scenario: Set configuration

- **WHEN** frontend invokes `set_config(config)` Tauri command with partial config
- **THEN** Rust backend merges changes with existing configuration
- **AND** updated configuration is persisted to store
- **AND** affected subsystems are notified (e.g., shortcut re-registration, locale change)

#### Scenario: Configuration validation

- **WHEN** frontend invokes `set_config(config)` with invalid values
- **THEN** Tauri command returns error with validation message
- **AND** configuration remains unchanged

### Requirement: Default Configuration Values

The system SHALL provide sensible defaults when no configuration is found.

#### Scenario: First launch with no existing config

- **WHEN** application starts with no Electron or Tauri config
- **THEN** default configuration is created:
  - `language`: "auto" (detects system locale)
  - `shortcut`: "CmdOrCtrl+Alt+S"
  - `autoLaunch`: false
  - `theme`: "auto" (follows system theme)
  - `formSettings`: { passwordLength: 16, prefix: "", suffix: "" }
- **AND** defaults are persisted to store

### Requirement: Configuration Reactivity

The system SHALL propagate configuration changes to affected subsystems in real-time.

#### Scenario: Shortcut configuration change

- **WHEN** `set_config()` updates `shortcut` field
- **THEN** Rust backend unregisters old global shortcut
- **AND** registers new global shortcut
- **AND** if registration fails, reverts to previous shortcut and returns error

#### Scenario: Language configuration change

- **WHEN** `set_config()` updates `language` field
- **THEN** Rust backend updates locale
- **AND** tray menu items update to new language
- **AND** frontend is notified to update UI

#### Scenario: Theme configuration change

- **WHEN** `set_config()` updates `theme` field
- **THEN** Rust backend applies native theme (light/dark/auto)
- **AND** tray menu is refreshed to reflect new theme selection
- **AND** frontend is notified to update UI theme

#### Scenario: AutoLaunch configuration change

- **WHEN** `set_config()` updates `autoLaunch` field
- **THEN** Rust backend enables or disables system startup registration
- **AND** if operation fails, error is returned and previous state is maintained
- **AND** tray menu is refreshed to reflect new autoLaunch status
