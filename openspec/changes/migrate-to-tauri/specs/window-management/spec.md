# Window Management - Tauri Migration

## ADDED Requirements

### Requirement: Tauri Window API

The system SHALL manage application window using Tauri's window API instead of Electron's BrowserWindow.

#### Scenario: Window initialization

- **WHEN** application starts
- **THEN** main window is created with configured properties
- **AND** window dimensions: 300x334 pixels (exact match to Electron)
- **AND** window is frameless: true (no title bar)
- **AND** window is resizable: false (fixed size)
- **AND** window is hidden by default (starts in tray)
- **AND** window is excluded from taskbar (skipTaskbar: true)

#### Scenario: Window configuration in tauri.conf.json

- **WHEN** Tauri application is built
- **THEN** window properties are defined in tauri.conf.json
- **AND** properties include: width, height, resizable, decorations, visible, title, center

### Requirement: Window Visibility Control

The system SHALL provide commands to show and hide the application window.

#### Scenario: Show window

- **WHEN** user triggers show action (tray click, global shortcut)
- **THEN** window becomes visible
- **AND** window is brought to front and focused
- **AND** clipboard is checked for domain URLs before showing
- **AND** IPC event WINDOW_SHOWN is sent to renderer

#### Scenario: Hide window via IPC command

- **WHEN** frontend calls `hide_window()` IPC command (e.g., from UI close button)
- **THEN** window becomes hidden
- **AND** application continues running in system tray

#### Scenario: Hide window via system events

- **WHEN** user triggers hide action (tray click, window blur)
- **THEN** window becomes hidden
- **AND** application continues running in system tray

#### Scenario: Toggle window visibility

- **WHEN** user triggers toggle action (global shortcut, tray click)
- **THEN** if window is visible, it is hidden
- **AND** if window is hidden, it is shown
- **AND** visibility state is tracked by Rust backend

### Requirement: Window Close Behavior

The system SHALL prevent window close from terminating application.

#### Scenario: Window blur event handling

- **WHEN** window loses focus (user clicks outside)
- **THEN** window is automatically hidden
- **AND** exception: if DevTools are open, window stays visible
- **AND** application remains running in tray

#### Scenario: Window close event handling

- **WHEN** window receives close request
- **THEN** window is hidden instead of destroyed
- **AND** application remains running in tray
- **AND** window can be shown again later

#### Scenario: Application quit vs window close

- **WHEN** user selects Quit from tray menu
- **THEN** application terminates completely
- **AND** window is destroyed
- **AND** all resources are cleaned up

### Requirement: Window Always-On-Top Behavior

The system SHALL keep window above other applications on all platforms.

#### Scenario: Always-on-top on macOS

- **WHEN** running on macOS
- **THEN** window is set to always-on-top with 'floating' level
- **AND** window is visible on all workspaces
- **AND** window is visible on fullscreen spaces (visibleOnFullScreen: true)

#### Scenario: Always-on-top on Windows/Linux

- **WHEN** running on Windows or Linux
- **THEN** window is set to always-on-top
- **AND** window is visible on all workspaces/virtual desktops

### Requirement: macOS-Specific Window Behavior

The system SHALL configure macOS-specific window properties for menu bar app.

#### Scenario: No Dock icon on macOS

- **WHEN** running on macOS
- **THEN** application does not appear in Dock via app.dock.hide()
- **AND** LSUIElement may be set in Info.plist (optional)
- **AND** application appears only in menu bar (tray)

#### Scenario: Window activation on macOS

- **WHEN** window is shown on macOS
- **THEN** application is activated without bringing to front of all apps
- **AND** window appears but does not steal focus aggressively

### Requirement: Window WebView Integration

The system SHALL use system WebView instead of bundled Chromium for rendering.

#### Scenario: macOS WebView

- **WHEN** running on macOS
- **THEN** window uses WKWebView (system WebKit)
- **AND** WebView version matches macOS version

#### Scenario: Windows WebView2

- **WHEN** running on Windows
- **THEN** window uses Microsoft Edge WebView2
- **AND** WebView2 runtime is bundled or installed

#### Scenario: Linux WebView

- **WHEN** running on Linux
- **THEN** window uses WebKitGTK
- **AND** WebKitGTK 2.40+ is required

### Requirement: Window Development Mode

The system SHALL provide developer-friendly window configuration for debugging.

#### Scenario: Development mode DevTools

- **WHEN** running in development mode (`tauri dev`)
- **THEN** DevTools are accessible via right-click or keyboard shortcut
- **AND** window is visible on startup for easier debugging

#### Scenario: Production mode

- **WHEN** running in production build
- **THEN** DevTools are disabled
- **AND** window starts hidden as configured

### Requirement: Window Positioning Strategies

The system SHALL support multiple window positioning strategies based on trigger source.

#### Scenario: Position below tray icon

- **WHEN** window is shown via tray click or tray menu "Show"
- **THEN** window is positioned directly below tray icon
- **AND** on macOS: centered horizontally below tray, top edge at tray bottom
- **AND** on Windows/Linux: right edge aligned with tray right, bottom edge at tray top
- **AND** position is calculated using tray bounds

#### Scenario: Position at cursor

- **WHEN** window is shown via global shortcut
- **THEN** window is positioned at cursor location
- **AND** position is adjusted to keep window fully on screen
- **AND** workArea bounds are respected (not covered by taskbar/dock)
- **AND** if cursor near screen edge, window is moved to fit

#### Scenario: Smart bounds checking for cursor positioning

- **WHEN** positioning window at cursor
- **THEN** if x + width exceeds screen right, x = screen right - width
- **AND** if y + height exceeds screen bottom, y = screen bottom - height
- **AND** if x < screen left, x = screen left
- **AND** if y < screen top, y = screen top

### Requirement: Clipboard Domain Parsing

The system SHALL parse URLs from clipboard and auto-fill domain as distinguishing code.

#### Scenario: Parse domain from clipboard URL

- **WHEN** window is about to be shown
- **THEN** clipboard text is read
- **AND** if clipboard contains valid URL (http/https)
- **AND** hostname is extracted and validated
- **AND** second-level domain (SLD) is parsed using public suffix list
- **AND** SLD is sent to renderer via KEY_FROM_CLIPBOARD IPC event

#### Scenario: Invalid clipboard content

- **WHEN** clipboard contains non-URL text
- **THEN** parsing fails gracefully
- **AND** no KEY_FROM_CLIPBOARD event is sent
- **AND** window shows normally without auto-filled key

#### Scenario: Public suffix list validation

- **WHEN** parsing URL hostname
- **THEN** hostname is validated using psl library
- **AND** subdomain is removed (www.example.com → example)
- **AND** TLD is excluded (example.com → example)
- **AND** only second-level domain is used

### Requirement: Focus Management

The system SHALL intelligently focus input fields when window is shown.

#### Scenario: Focus password field when empty

- **WHEN** window is shown and password field is empty
- **THEN** password input field receives focus
- **AND** user can immediately start typing password

#### Scenario: Focus and select key field when password exists

- **WHEN** window is shown and password field has value
- **THEN** key input field receives focus
- **AND** all text in key field is selected
- **AND** user can immediately type new key or press Enter to generate
