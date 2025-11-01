# Startup Integration - Tauri Migration

## ADDED Requirements

### Requirement: Tauri Autostart Plugin

The system SHALL manage auto-launch functionality using tauri-plugin-autostart instead of auto-launch npm package.

#### Scenario: Auto-launch enablement

- **WHEN** user enables auto-launch in settings
- **THEN** frontend invokes `enable_auto_launch()` Tauri command
- **AND** Rust backend registers application for system startup
- **AND** setting is persisted to configuration

#### Scenario: Auto-launch disablement

- **WHEN** user disables auto-launch in settings
- **THEN** frontend invokes `disable_auto_launch()` Tauri command
- **AND** Rust backend removes application from system startup
- **AND** setting is persisted to configuration

### Requirement: Auto-Launch Status Query

The system SHALL provide command to query current auto-launch status.

#### Scenario: Query auto-launch status

- **WHEN** frontend invokes `is_auto_launch_enabled()` Tauri command
- **THEN** Rust backend checks system startup registration
- **AND** returns boolean indicating current status
- **AND** frontend updates settings UI toggle accordingly

#### Scenario: Status synchronization

- **WHEN** auto-launch is changed externally (e.g., system settings)
- **THEN** application queries actual system status
- **AND** configuration is updated to reflect reality
- **AND** settings UI shows correct state

### Requirement: Cross-Platform Auto-Launch Support

The system SHALL support auto-launch on macOS, Windows, and Linux using Tauri's unified API.

#### Scenario: macOS Login Items

- **WHEN** auto-launch is enabled on macOS
- **THEN** application is added to Login Items
- **AND** application starts when user logs in
- **AND** change is visible in System Settings > General > Login Items

#### Scenario: Windows Startup Registry

- **WHEN** auto-launch is enabled on Windows
- **THEN** application is registered in Windows Registry startup key
- **AND** application starts when user logs in
- **AND** change is visible in Task Manager > Startup

#### Scenario: Linux Autostart Desktop Entry

- **WHEN** auto-launch is enabled on Linux
- **THEN** .desktop file is created in ~/.config/autostart/
- **AND** application starts when user logs in
- **AND** compatible with XDG autostart specification

### Requirement: Startup Arguments

The system SHALL configure application behavior when launched at system startup.

#### Scenario: Silent startup

- **WHEN** application is launched via auto-launch mechanism
- **THEN** application starts in hidden mode (window not shown)
- **AND** application runs in system tray only
- **AND** no user interaction required on startup

#### Scenario: Manual startup

- **WHEN** application is launched manually by user
- **THEN** application may show window based on configuration
- **AND** behavior can be configured independently of auto-launch

### Requirement: Permission Handling

The system SHALL handle platform-specific permissions for auto-launch registration.

#### Scenario: macOS permission request

- **WHEN** enabling auto-launch on macOS 13+
- **THEN** system may prompt user for Login Items permission
- **AND** if permission is denied, application shows informative error
- **AND** user is guided to grant permission in System Settings

#### Scenario: Windows UAC handling

- **WHEN** enabling auto-launch on Windows
- **THEN** registry modification succeeds without UAC prompt (user scope)
- **AND** if admin privileges are required, user is informed

#### Scenario: Linux permission handling

- **WHEN** enabling auto-launch on Linux
- **THEN** .desktop file is created in user's home directory
- **AND** no elevated permissions are required

### Requirement: Error Handling

The system SHALL gracefully handle auto-launch registration failures.

#### Scenario: Registration failure

- **WHEN** auto-launch registration fails
- **THEN** Tauri command returns error with descriptive message
- **AND** frontend displays error to user
- **AND** auto-launch setting remains disabled in configuration

#### Scenario: Deregistration failure

- **WHEN** auto-launch deregistration fails
- **THEN** Tauri command logs warning
- **AND** setting is updated in configuration regardless
- **AND** user is informed of partial failure

#### Scenario: Startup failure recovery

- **WHEN** application fails to start via auto-launch
- **THEN** system startup mechanism retries based on platform defaults
- **AND** application does not interfere with user login process
