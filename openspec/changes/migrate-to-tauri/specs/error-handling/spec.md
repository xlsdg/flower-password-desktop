# Error Handling and Dialogs - Tauri Migration

## ADDED Requirements

### Requirement: Uncaught Exception Handler

The system SHALL handle uncaught exceptions gracefully and provide error feedback.

#### Scenario: Uncaught exception during runtime

- **WHEN** uncaught exception occurs in main process
- **THEN** error dialog is displayed to user
- **AND** dialog shows error message and stack trace
- **AND** dialog type is "error"
- **AND** after user acknowledges, application quits

#### Scenario: Error dialog display

- **WHEN** uncaught exception triggers error dialog
- **THEN** dialog includes:
  - Title: "Uncaught Exception"
  - Message: error.message
  - Detail: error.stack (if available)
  - Button: "OK"
- **AND** dialog is modal (blocks other actions)

### Requirement: Quit Confirmation Dialog

The system SHALL confirm user intent before quitting application.

#### Scenario: User selects Quit from tray

- **WHEN** user selects "Quit" from tray menu
- **THEN** window is hidden first
- **AND** confirmation dialog is displayed
- **AND** dialog asks "Are you sure you want to quit?"

#### Scenario: User confirms quit

- **WHEN** quit confirmation dialog is shown
- **AND** user clicks "Confirm" button
- **THEN** global shortcuts are unregistered
- **AND** clipboard timer is cleared
- **AND** application quits completely

#### Scenario: User cancels quit

- **WHEN** quit confirmation dialog is shown
- **AND** user clicks "Cancel" button
- **THEN** dialog closes
- **AND** application continues running in tray
- **AND** window remains hidden

### Requirement: Shortcut Registration Error Handling

The system SHALL handle global shortcut registration failures gracefully.

#### Scenario: Shortcut registration fails

- **WHEN** global shortcut registration fails
- **THEN** error is logged to console
- **AND** error dialog is displayed to user
- **AND** dialog shows "Failed to register global shortcut"
- **AND** application continues running without shortcut

#### Scenario: Shortcut conflict detected

- **WHEN** shortcut is already registered by another app
- **THEN** Tauri plugin returns error
- **AND** user is informed via dialog
- **AND** user can try different shortcut from settings

### Requirement: Auto-Launch Error Handling

The system SHALL handle auto-launch configuration errors.

#### Scenario: Auto-launch enable fails

- **WHEN** enabling auto-launch fails
- **THEN** error is logged
- **AND** error dialog is displayed
- **AND** dialog shows error message from system
- **AND** auto-launch toggle remains unchecked

#### Scenario: Auto-launch disable fails

- **WHEN** disabling auto-launch fails
- **THEN** warning is logged
- **AND** error dialog is displayed
- **AND** user is informed of partial failure

### Requirement: Configuration Validation

The system SHALL validate configuration values before applying.

#### Scenario: Validate password length

- **WHEN** reading or updating password length
- **THEN** value must be integer between 6 and 32 (inclusive)
- **AND** if invalid, default to 16
- **AND** error is logged

#### Scenario: Validate theme value

- **WHEN** reading or updating theme
- **THEN** value must be one of: "light", "dark", "auto"
- **AND** if invalid, default to "auto"
- **AND** error is logged

#### Scenario: Validate language value

- **WHEN** reading or updating language
- **THEN** value must be one of: "en-US", "zh-CN", "zh-TW", "auto"
- **AND** if invalid, default to "auto"
- **AND** error is logged

#### Scenario: Validate global shortcut

- **WHEN** reading or updating global shortcut
- **THEN** value must be one of 6 available shortcuts
- **AND** if invalid, default to "CmdOrCtrl+Alt+S"
- **AND** error is logged

#### Scenario: Validate form settings

- **WHEN** reading or updating form settings
- **THEN** passwordLength is validated as number (6-32)
- **AND** prefix is validated as string
- **AND** suffix is validated as string
- **AND** invalid values are replaced with defaults

### Requirement: Configuration File Error Handling

The system SHALL handle configuration file errors robustly.

#### Scenario: Config file does not exist

- **WHEN** application starts and config file missing
- **THEN** default configuration is created
- **AND** default config is written to file
- **AND** application continues normally

#### Scenario: Config file is corrupted

- **WHEN** config file contains invalid JSON
- **THEN** error is logged
- **AND** default configuration is used
- **AND** corrupted file is overwritten with defaults
- **AND** application continues normally

#### Scenario: Config file cannot be written

- **WHEN** writing config file fails (permissions, disk full)
- **THEN** error is logged to console
- **AND** application continues with in-memory config
- **AND** changes are not persisted

### Requirement: IPC Error Handling

The system SHALL handle IPC communication errors gracefully.

#### Scenario: IPC handler throws exception

- **WHEN** IPC handler encounters error
- **THEN** error is caught and logged
- **AND** error response is sent to renderer
- **AND** renderer displays error to user or handles gracefully

#### Scenario: Renderer receives error from IPC

- **WHEN** Tauri command returns error
- **THEN** frontend catch block handles error
- **AND** error is logged to console
- **AND** user is informed if appropriate

### Requirement: Development vs Production Error Handling

The system SHALL provide different error handling for development and production.

#### Scenario: Development mode error logging

- **WHEN** running in development mode
- **AND** error occurs (e.g., clipboard parsing)
- **THEN** detailed error is logged to console
- **AND** stack traces are shown
- **AND** DevTools remain accessible

#### Scenario: Production mode error logging

- **WHEN** running in production mode
- **AND** non-critical error occurs
- **THEN** minimal error logging to console
- **AND** stack traces may be omitted
- **AND** user-facing errors show friendly messages
