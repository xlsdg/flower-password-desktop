# System Tray - Tauri Migration

## ADDED Requirements

### Requirement: Tauri Tray Integration

The system SHALL display a system tray icon using Tauri's built-in tray API instead of Electron's Tray module.

#### Scenario: Tray icon initialization

- **WHEN** application starts
- **THEN** tray icon appears in system tray area
- **AND** icon matches platform conventions (macOS menu bar, Windows system tray, Linux notification area)

#### Scenario: Platform-specific icon rendering

- **WHEN** running on macOS with dark mode
- **THEN** tray uses Template.png format for automatic color inversion
- **WHEN** running on Windows
- **THEN** tray uses standard ICO format
- **AND** icon renders correctly in light and dark system themes

### Requirement: Tray Menu

The system SHALL provide a context menu with localized menu items implemented via Tauri menu API, matching Electron version behavior.

#### Scenario: Tray menu display

- **WHEN** user right-clicks tray icon (Windows/Linux) or clicks (macOS)
- **THEN** context menu appears with items: Show, Settings, Check for Updates, Quit
- **AND** menu items are displayed in user's selected language
- **AND** menu structure matches Electron version exactly

#### Scenario: Show menu action

- **WHEN** user selects "Show" from tray menu
- **THEN** application window becomes visible and focused
- **AND** if window was minimized, it is restored

#### Scenario: Quit menu action

- **WHEN** user selects "Quit" from tray menu
- **THEN** window is hidden first
- **AND** confirmation dialog is displayed: "Are you sure you want to quit?"
- **AND** if user confirms, application terminates gracefully
- **AND** if user cancels, application continues running
- **AND** all resources are cleaned up on quit (shortcuts unregistered, clipboard timer cleared)

### Requirement: Tray Click Behavior

The system SHALL handle tray icon clicks to toggle window visibility, with platform-specific behavior matching Electron version.

#### Scenario: Left-click on Windows/Linux

- **WHEN** user left-clicks tray icon on Windows or Linux
- **THEN** window visibility is toggled (show if hidden, hide if visible)

#### Scenario: Right-click on Windows/Linux

- **WHEN** user right-clicks tray icon on Windows or Linux
- **THEN** context menu is displayed

#### Scenario: Click on macOS

- **WHEN** user clicks tray icon on macOS
- **THEN** window visibility is toggled (show if hidden, hide if visible)
- **AND** behavior matches Windows/Linux left-click

#### Scenario: Right-click on macOS

- **WHEN** user right-clicks tray icon on macOS
- **THEN** if window is visible, it is hidden first
- **AND** context menu is displayed

#### Scenario: Show hidden window via tray click

- **WHEN** window is hidden and user left-clicks tray icon (Windows/Linux)
- **THEN** window becomes visible and focused

#### Scenario: Hide visible window via tray click

- **WHEN** window is visible and user left-clicks tray icon (Windows/Linux)
- **THEN** window is hidden
- **AND** application remains running in tray

### Requirement: Cross-Platform Tray Support

The system SHALL maintain tray functionality on macOS, Windows, and Linux using Tauri's platform-agnostic API.

#### Scenario: macOS menu bar integration

- **WHEN** running on macOS
- **THEN** tray icon appears in menu bar
- **AND** application does not appear in Dock
- **AND** icon follows macOS Template image guidelines

#### Scenario: Windows system tray integration

- **WHEN** running on Windows
- **THEN** tray icon appears in notification area
- **AND** icon persists across system tray visibility changes

#### Scenario: Linux notification area integration

- **WHEN** running on Linux with supported desktop environment
- **THEN** tray icon appears in notification area
- **AND** functionality matches Windows/macOS behavior
