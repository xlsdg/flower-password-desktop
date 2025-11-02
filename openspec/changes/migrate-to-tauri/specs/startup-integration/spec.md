# Startup Integration - Tauri Migration

## ADDED Requirements

### Requirement: Tauri Autostart Plugin

The system SHALL manage auto-launch functionality using tauri-plugin-autostart instead of auto-launch npm package.

#### Scenario: Auto-launch enablement

- **WHEN** user enables auto-launch in tray menu
- **THEN** Rust backend calls tauri-plugin-autostart to enable
- **AND** application is registered for system startup
- **AND** setting is stored in system (NOT in application config)

#### Scenario: Auto-launch disablement

- **WHEN** user disables auto-launch in tray menu
- **THEN** Rust backend calls tauri-plugin-autostart to disable
- **AND** application is removed from system startup
- **AND** setting is removed from system (NOT stored in application config)

### Requirement: Auto-Launch Status Query

The system SHALL provide command to query current auto-launch status.

#### Scenario: Query auto-launch status

- **WHEN** application needs to display current auto-launch status
- **THEN** Rust backend queries tauri-plugin-autostart for actual system state
- **AND** returns boolean indicating current status
- **AND** tray menu reflects correct state

#### Scenario: Status synchronization

- **WHEN** auto-launch is changed externally (e.g., system settings)
- **THEN** application queries actual system status when building tray menu
- **AND** tray menu checkbox reflects actual system state
- **AND** state is NOT cached in application config

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

#### Scenario: Window starts hidden regardless of launch method

- **WHEN** application is launched (via auto-launch or manually)
- **THEN** application always starts with window hidden
- **AND** application runs in system tray only
- **AND** window is only shown when user triggers it (tray click, global shortcut)
- **AND** behavior is same for both auto-launch and manual launch

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
- **THEN** error dialog is displayed to user
- **AND** auto-launch remains disabled in system
- **AND** tray menu checkbox remains unchecked

#### Scenario: Deregistration failure

- **WHEN** auto-launch deregistration fails
- **THEN** warning is logged
- **AND** error dialog is displayed to user
- **AND** user is informed of partial failure
- **AND** tray menu reflects actual system state on next refresh

#### Scenario: Startup failure recovery

- **WHEN** application fails to start via auto-launch
- **THEN** system startup mechanism retries based on platform defaults
- **AND** application does not interfere with user login process
