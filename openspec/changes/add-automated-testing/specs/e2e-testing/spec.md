## ADDED Requirements

### Requirement: E2E Test Infrastructure

The testing system SHALL provide infrastructure for running full application end-to-end tests in a real Electron environment.

#### Scenario: Launch Electron application for testing

- **GIVEN** an E2E test suite using Playwright
- **WHEN** a test starts
- **THEN** a fresh Electron application instance launches
- **AND** the application window is ready for interaction

#### Scenario: Clean state between E2E tests

- **GIVEN** multiple E2E tests in a suite
- **WHEN** each test runs
- **THEN** each test starts with a clean application state
- **AND** configuration from previous tests does not affect subsequent tests

### Requirement: Password Generation Workflow Testing

The testing system SHALL validate the complete password generation workflow from user input to clipboard copy.

#### Scenario: Generate password end-to-end

- **GIVEN** the Electron application is launched
- **WHEN** the user enters memory password "test123"
- **AND** the user enters distinguishing code "github"
- **AND** the user clicks generate or presses Enter
- **THEN** a password is displayed in the result area
- **AND** the password matches the expected deterministic output

#### Scenario: Copy password to clipboard

- **GIVEN** a password has been generated
- **WHEN** the user clicks the copy button
- **THEN** the password is written to the system clipboard
- **AND** the UI shows confirmation of successful copy

#### Scenario: Password visibility toggle

- **GIVEN** a password has been generated and is masked
- **WHEN** the user clicks the visibility toggle
- **THEN** the password is displayed in plain text
- **AND** clicking toggle again re-masks the password

### Requirement: Settings Persistence Testing

The testing system SHALL validate that user settings persist correctly across application restarts.

#### Scenario: Update password length setting

- **GIVEN** the Electron application is running with default settings
- **WHEN** the user changes password length to 24
- **AND** the application is closed and restarted
- **THEN** the password length setting remains 24
- **AND** newly generated passwords use the 24-character length

#### Scenario: Language setting persists

- **GIVEN** the application is running in English
- **WHEN** the user switches language to Simplified Chinese
- **AND** the application is closed and restarted
- **THEN** the UI displays in Simplified Chinese
- **AND** all labels and messages use the correct language

### Requirement: UI Interaction Testing

The testing system SHALL validate user interface interactions and keyboard navigation.

#### Scenario: Keyboard navigation works

- **GIVEN** the application window is focused
- **WHEN** the user presses Tab to navigate between form fields
- **THEN** focus moves to the next input field in logical order
- **AND** pressing Enter in the key field triggers password generation

#### Scenario: Global shortcut shows window

- **GIVEN** the application is running in the system tray
- **WHEN** the user presses the global shortcut (Cmd+Alt+S)
- **THEN** the application window is shown and focused
- **AND** the password input field is ready for input

**Note:** Global shortcut testing requires manual validation or special OS-level automation.

### Requirement: Error Handling and Edge Cases

The testing system SHALL validate error handling and edge cases in the user interface.

#### Scenario: Empty inputs show no password

- **GIVEN** the application is launched
- **WHEN** the user leaves password or key fields empty
- **AND** attempts to generate a password
- **THEN** no password is generated
- **AND** the UI shows appropriate placeholder or message

#### Scenario: Application handles clipboard permission denial

- **GIVEN** the system denies clipboard access (simulated)
- **WHEN** the user attempts to copy a password
- **THEN** the application handles the error gracefully
- **AND** the UI shows an error message to the user

### Requirement: Cross-Platform E2E Testing

The testing system SHALL support running E2E tests on multiple operating systems to validate platform-specific behavior.

#### Scenario: E2E tests run on macOS

- **GIVEN** Playwright is configured for Electron on macOS
- **WHEN** the E2E test suite runs
- **THEN** all tests pass on macOS
- **AND** platform-specific behaviors (menu bar app, tray) work correctly

#### Scenario: E2E tests run on Windows

- **GIVEN** Playwright is configured for Electron on Windows
- **WHEN** the E2E test suite runs
- **THEN** all tests pass on Windows
- **AND** platform-specific behaviors (system tray) work correctly

#### Scenario: E2E tests run on Linux

- **GIVEN** Playwright is configured for Electron on Linux
- **WHEN** the E2E test suite runs
- **THEN** all tests pass on Linux
- **AND** tests gracefully handle variations in desktop environments

**Note:** Cross-platform CI testing may require separate runners for each OS.
