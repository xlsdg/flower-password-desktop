## ADDED Requirements

### Requirement: IPC Handler Testing

The testing system SHALL validate IPC communication between main and renderer processes to ensure correct message handling and state updates.

#### Scenario: Test IPC handler registration

- **GIVEN** the main process IPC handlers are registered
- **WHEN** a test sends an IPC message on a registered channel
- **THEN** the corresponding handler function is invoked
- **AND** the handler processes the message with correct parameters

#### Scenario: Test clipboard IPC handler

- **GIVEN** a renderer process sends `CLIPBOARD_WRITE_TEXT` with password text
- **WHEN** the IPC handler receives the message
- **THEN** the clipboard manager writes the text to the clipboard
- **AND** the auto-clear timer is initiated

#### Scenario: Test configuration IPC handlers

- **GIVEN** a renderer process requests configuration via `GET_CONFIG`
- **WHEN** the IPC handler processes the request
- **THEN** the current application configuration is returned
- **AND** the configuration contains all expected fields (language, passwordLength, etc.)

#### Scenario: Test settings update IPC handler

- **GIVEN** a renderer process sends `UPDATE_FORM_SETTINGS` with new settings
- **WHEN** the IPC handler processes the update
- **THEN** the settings are persisted to configuration storage
- **AND** subsequent `GET_CONFIG` calls return the updated settings

### Requirement: Configuration Persistence Testing

The testing system SHALL validate configuration read/write operations to ensure settings persist correctly across application restarts.

#### Scenario: Default configuration on first run

- **GIVEN** no existing configuration file exists
- **WHEN** `readConfig()` is called
- **THEN** a default configuration is returned
- **AND** the default configuration contains valid values for all settings

#### Scenario: Configuration update persists

- **GIVEN** a configuration with default settings
- **WHEN** `updateFormSettings()` is called with new password length
- **THEN** the configuration file is updated with the new value
- **AND** subsequent reads return the updated password length

#### Scenario: Invalid configuration values are rejected

- **GIVEN** an attempt to update configuration with invalid values
- **WHEN** `updateFormSettings()` is called with passwordLength = -1
- **THEN** the update is rejected or normalized to a valid value
- **AND** the configuration remains valid

### Requirement: State Management Integration Testing

The testing system SHALL validate React hooks integration with IPC and configuration to ensure UI state synchronizes correctly with backend state.

#### Scenario: Form settings hook loads initial state

- **GIVEN** a configuration exists with passwordLength = 20
- **WHEN** the `useFormSettings` hook initializes
- **THEN** the hook state reflects passwordLength = 20
- **AND** the form UI displays the correct value

#### Scenario: Form settings hook persists updates

- **GIVEN** the `useFormSettings` hook is initialized
- **WHEN** the password length is updated in the hook state
- **THEN** the hook sends `UPDATE_FORM_SETTINGS` IPC message
- **AND** the configuration is persisted to storage

### Requirement: Timer and Async Behavior Testing

The testing system SHALL validate asynchronous operations and timer-based behavior (clipboard auto-clear, debouncing).

#### Scenario: Test clipboard timer with fake timers

- **GIVEN** a test using fake timers (e.g., `vi.useFakeTimers()`)
- **WHEN** clipboard manager writes text with 30s timeout
- **AND** fake timers advance by 30 seconds
- **THEN** the clipboard clear function is invoked
- **AND** the test completes synchronously without waiting real time

#### Scenario: Test async IPC handlers

- **GIVEN** an IPC handler that returns a Promise (e.g., `SHELL_OPEN_EXTERNAL`)
- **WHEN** the test invokes the handler
- **THEN** the test can await the Promise result
- **AND** assertions can verify the async operation completed correctly
