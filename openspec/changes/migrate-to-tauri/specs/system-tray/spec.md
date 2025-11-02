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
- **THEN** context menu appears with following structure:
  1. Show
  2. --- (separator) ---
  3. Theme (submenu: Light, Dark, Auto - with checkboxes)
  4. Language (submenu: zh-CN, zh-TW, en-US, Auto - with checkboxes)
  5. --- (separator) ---
  6. Auto Launch (checkbox)
  7. Global Shortcut
  8. Check for Updates
  9. --- (separator) ---
  10. Quit
- **AND** menu items are displayed in user's selected language
- **AND** menu structure matches Electron version exactly

#### Scenario: Show menu action

- **WHEN** user selects "Show" from tray menu
- **THEN** application window becomes visible and focused
- **AND** window is positioned below tray icon
- **AND** clipboard is checked for domain URLs before showing

#### Scenario: Theme submenu interaction

- **WHEN** user opens Theme submenu
- **THEN** three options are shown: Light, Dark, Auto
- **AND** current theme selection is checked
- **WHEN** user selects new theme option
- **THEN** theme configuration is updated
- **AND** native theme is applied immediately
- **AND** tray menu is refreshed to show new selection
- **AND** frontend is notified via THEME_CHANGED IPC event

#### Scenario: Language submenu interaction

- **WHEN** user opens Language submenu
- **THEN** four options are shown: zh-CN, zh-TW, en-US, Auto
- **AND** current language selection is checked
- **WHEN** user selects new language option
- **THEN** language configuration is updated
- **AND** backend reloads translations
- **AND** tray menu is refreshed with new language labels
- **AND** frontend is notified via LANGUAGE_CHANGED IPC event

#### Scenario: Auto Launch checkbox toggle

- **WHEN** user clicks Auto Launch menu item
- **THEN** auto-launch state is toggled (enable if disabled, disable if enabled)
- **AND** system startup registration is updated via tauri-plugin-autostart
- **AND** if operation succeeds, tray menu is refreshed to show new checkbox state
- **AND** if operation fails, error dialog is shown and checkbox remains unchanged

#### Scenario: Global Shortcut menu action

- **WHEN** user selects "Global Shortcut" from tray menu
- **THEN** dialog is displayed showing current shortcut
- **AND** dialog offers alternative shortcut options as buttons
- **AND** user can select new shortcut or cancel
- **AND** if new shortcut is selected, it is registered and saved to configuration

#### Scenario: Check for Updates menu action

- **WHEN** user selects "Check for Updates" from tray menu
- **THEN** update check is initiated
- **AND** GitHub API is queried for latest release
- **AND** appropriate dialog is shown based on result (update available or up-to-date)

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

- **WHEN** window is hidden and user left-clicks tray icon (Windows/Linux) or clicks on macOS
- **THEN** window becomes visible and focused
- **AND** window is positioned below tray icon

#### Scenario: Hide visible window via tray click

- **WHEN** window is visible and user left-clicks tray icon (Windows/Linux) or clicks on macOS
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
