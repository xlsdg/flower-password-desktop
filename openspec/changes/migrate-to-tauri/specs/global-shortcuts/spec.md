# Global Shortcuts - Tauri Migration

## ADDED Requirements

### Requirement: Tauri Global Shortcut Plugin

The system SHALL register system-wide keyboard shortcuts using tauri-plugin-global-shortcut instead of Electron's globalShortcut module.

#### Scenario: Default shortcut registration

- **WHEN** application starts
- **THEN** global shortcut "CmdOrCtrl+Alt+S" is registered
- **AND** shortcut triggers window toggle action

#### Scenario: Shortcut activation

- **WHEN** user presses registered global shortcut
- **THEN** application window toggles visibility (show if hidden, hide if visible)
- **AND** shortcut works regardless of which application has focus

### Requirement: Multiple Shortcut Options

The system SHALL provide multiple pre-defined shortcut combinations for user selection.

#### Scenario: Available shortcut options

- **WHEN** system initializes
- **THEN** 6 shortcut options are available:
  - CmdOrCtrl+Alt+S (default)
  - CmdOrCtrl+Shift+S
  - CmdOrCtrl+Alt+P
  - CmdOrCtrl+Shift+P
  - CmdOrCtrl+Alt+F
  - CmdOrCtrl+Shift+F
- **AND** user can choose from any of these options

### Requirement: Shortcut Selection Dialog

The system SHALL display dialog for users to choose a different shortcut.

#### Scenario: Open shortcut selection dialog

- **WHEN** user selects "Global Shortcut" from tray menu
- **THEN** dialog is displayed showing available shortcuts
- **AND** current shortcut is indicated in dialog message
- **AND** alternative shortcuts (excluding current) are shown as buttons
- **AND** "Cancel" button allows closing without change

#### Scenario: Select new shortcut

- **WHEN** user clicks shortcut button in dialog
- **THEN** old shortcut is unregistered
- **AND** new shortcut is registered
- **AND** if registration succeeds, new shortcut is saved to config
- **AND** dialog closes

#### Scenario: Cancel shortcut change

- **WHEN** user clicks "Cancel" in shortcut dialog
- **THEN** dialog closes
- **AND** current shortcut remains unchanged
- **AND** no configuration is modified

### Requirement: User-Configurable Shortcuts

The system SHALL allow users to customize global shortcuts via settings with Tauri command interface.

#### Scenario: Shortcut customization

- **WHEN** user configures custom shortcut via settings UI
- **THEN** frontend invokes `set_global_shortcut(shortcut)` Tauri command
- **AND** Rust backend unregisters old shortcut and registers new one
- **AND** new shortcut is persisted to configuration

#### Scenario: Invalid shortcut handling

- **WHEN** user attempts to set an invalid shortcut format
- **THEN** Tauri command returns error
- **AND** frontend displays error message
- **AND** previous shortcut remains active

### Requirement: Shortcut Conflict Detection

The system SHALL detect and handle conflicts when shortcuts are already registered by other applications.

#### Scenario: Shortcut registration conflict

- **WHEN** attempting to register a shortcut already claimed by another application
- **THEN** Tauri plugin returns error
- **AND** application logs warning message
- **AND** user is notified to choose different shortcut

#### Scenario: Fallback on conflict

- **WHEN** default shortcut registration fails due to conflict
- **THEN** application continues to run without global shortcut
- **AND** user can manually configure alternative shortcut

### Requirement: Cross-Platform Shortcut Support

The system SHALL support global shortcuts on macOS, Windows, and Linux using Tauri's cross-platform API.

#### Scenario: macOS shortcut registration

- **WHEN** running on macOS
- **THEN** shortcuts use "Cmd" modifier (Command key)
- **AND** shortcuts work system-wide including fullscreen apps

#### Scenario: Windows/Linux shortcut registration

- **WHEN** running on Windows or Linux
- **THEN** shortcuts use "Ctrl" modifier (Control key)
- **AND** "CmdOrCtrl" in shortcut string resolves to platform-appropriate key

#### Scenario: Platform-specific modifier keys

- **WHEN** shortcut string includes "CmdOrCtrl"
- **THEN** Tauri plugin translates to "Cmd" on macOS
- **AND** translates to "Ctrl" on Windows/Linux
