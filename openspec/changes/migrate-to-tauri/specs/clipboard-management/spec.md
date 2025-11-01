# Clipboard Management - Tauri Migration

## ADDED Requirements

### Requirement: Tauri Clipboard Plugin

The system SHALL manage clipboard operations using tauri-plugin-clipboard instead of Node.js clipboard APIs.

#### Scenario: Copy password to clipboard

- **WHEN** frontend invokes `copy_to_clipboard(password)` Tauri command
- **THEN** Rust backend writes password to system clipboard
- **AND** clipboard contains the password text
- **AND** operation succeeds on all platforms (macOS, Windows, Linux)

#### Scenario: Clipboard write confirmation

- **WHEN** password is successfully copied to clipboard
- **THEN** Tauri command returns success result
- **AND** frontend displays confirmation message to user

### Requirement: Automatic Clipboard Clearing

The system SHALL automatically clear clipboard after a fixed timeout using Rust async timer.

#### Scenario: Clipboard auto-clear timer

- **WHEN** password is copied to clipboard
- **THEN** Rust backend starts async timer (fixed: 10 seconds / 10000ms)
- **AND** when timer expires, clipboard is cleared only if content unchanged
- **AND** clipboard check prevents clearing user's other copied content

#### Scenario: Clipboard clear cancellation

- **WHEN** new password is copied before timeout expires
- **THEN** previous timer is cancelled
- **AND** new timer starts for new password
- **AND** only the latest clipboard content is managed

#### Scenario: Clipboard clear only if unchanged

- **WHEN** auto-clear timer expires
- **THEN** current clipboard content is compared with stored original
- **AND** clipboard is cleared only if content matches original password
- **AND** if user copied something else, clipboard is not cleared

### Requirement: Manual Clipboard Clearing

The system SHALL provide explicit command to clear clipboard on demand.

#### Scenario: Manual clipboard clear

- **WHEN** frontend invokes `clear_clipboard()` Tauri command
- **THEN** Rust backend clears system clipboard immediately
- **AND** any running auto-clear timer is cancelled
- **AND** operation succeeds regardless of clipboard content

#### Scenario: Clear on application quit

- **WHEN** application is terminating
- **THEN** clipboard is cleared if it contains password
- **AND** cleanup completes before process exits

### Requirement: Cross-Platform Clipboard Compatibility

The system SHALL support clipboard operations on macOS, Windows, and Linux using Tauri's unified API.

#### Scenario: macOS pasteboard integration

- **WHEN** running on macOS
- **THEN** clipboard operations use system NSPasteboard
- **AND** clipboard content is accessible to other applications

#### Scenario: Windows clipboard integration

- **WHEN** running on Windows
- **THEN** clipboard operations use Windows Clipboard API
- **AND** clipboard content persists until cleared

#### Scenario: Linux clipboard integration

- **WHEN** running on Linux with X11 or Wayland
- **THEN** clipboard operations use system clipboard protocols
- **AND** clipboard content is available to other applications

### Requirement: Security and Privacy

The system SHALL ensure clipboard operations do not leak sensitive data.

#### Scenario: No clipboard logging

- **WHEN** password is copied to clipboard
- **THEN** password text is never logged to console or files
- **AND** Rust code contains no debug prints of clipboard content

#### Scenario: Clipboard clear verification

- **WHEN** clipboard auto-clear timer expires
- **THEN** clipboard is verifiably empty
- **AND** operation is logged without revealing previous content
