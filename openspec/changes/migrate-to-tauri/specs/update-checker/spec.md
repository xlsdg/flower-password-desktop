# Update Checker - Tauri Migration

## ADDED Requirements

### Requirement: GitHub Release Version Check

The system SHALL check for new versions by querying GitHub Releases API.

#### Scenario: Query GitHub API for latest release

- **WHEN** update check is initiated
- **THEN** Rust backend queries `https://api.github.com/repos/xlsdg/flower-password-desktop/releases/latest`
- **AND** response is parsed to extract tag_name and html_url
- **AND** request uses HTTPS with proper error handling

#### Scenario: Handle GitHub API errors

- **WHEN** GitHub API request fails (network error, rate limit, etc.)
- **THEN** error is logged
- **AND** user is shown error dialog with error message
- **AND** update check state is reset to allow retry

### Requirement: Semantic Version Comparison

The system SHALL compare current application version with latest GitHub release version using semantic versioning rules.

#### Scenario: Parse and compare versions

- **WHEN** comparing versions "4.0.3" and "5.0.0"
- **THEN** "v" prefix is stripped if present
- **AND** versions are split into major.minor.patch numbers
- **AND** comparison follows semantic versioning rules (major > minor > patch)
- **AND** result indicates which version is newer

#### Scenario: Handle version string variations

- **WHEN** version has "v" prefix (e.g., "v5.0.0")
- **THEN** prefix is removed before comparison
- **AND** comparison works identically to version without prefix

#### Scenario: Equal versions

- **WHEN** current version equals latest version
- **THEN** comparison returns equal result
- **AND** "no update available" message is shown

### Requirement: Update Available Dialog

The system SHALL display dialog when newer version is detected.

#### Scenario: Show update available dialog

- **WHEN** latest version is newer than current version
- **THEN** dialog is displayed with:
  - Title: localized "Update Available" message
  - Message: current version and latest version numbers
  - Detail: prompt to download new version
  - Buttons: "Download" (default) and "Cancel"

#### Scenario: User accepts update

- **WHEN** user clicks "Download" button
- **THEN** GitHub release page URL is opened in external browser
- **AND** URL is `release.html_url` from GitHub API response
- **AND** dialog is closed
- **AND** application continues running

#### Scenario: User cancels update

- **WHEN** user clicks "Cancel" button
- **THEN** dialog is closed
- **AND** no action is taken
- **AND** application continues running normally

### Requirement: No Update Available Dialog

The system SHALL display dialog when application is up to date.

#### Scenario: Show no update dialog

- **WHEN** current version equals or exceeds latest version
- **THEN** dialog is displayed with:
  - Title: localized "Check for Updates" message
  - Message: "No update available"
  - Detail: current version number
  - Buttons: "OK" (default)

### Requirement: Update Check Invocation

The system SHALL provide manual update check triggered by user.

#### Scenario: Menu-triggered update check

- **WHEN** user selects "Check for Updates" from tray menu or settings
- **THEN** update check function is invoked
- **AND** GitHub API is queried
- **AND** appropriate dialog is shown based on result

#### Scenario: Prevent concurrent update checks

- **WHEN** update check is already in progress
- **THEN** subsequent update check requests are ignored
- **AND** no duplicate API requests are made
- **AND** flag is reset when check completes or fails

### Requirement: Localized Update Messages

The system SHALL display update dialogs in user's selected language.

#### Scenario: English update messages

- **WHEN** user's language is English (en)
- **THEN** dialog displays English text
- **AND** "Update Available", "Download", "Cancel" buttons use English labels

#### Scenario: Simplified Chinese update messages

- **WHEN** user's language is Simplified Chinese (zh-CN)
- **THEN** dialog displays Simplified Chinese text
- **AND** button labels use Simplified Chinese translations

#### Scenario: Traditional Chinese update messages

- **WHEN** user's language is Traditional Chinese (zh-TW)
- **THEN** dialog displays Traditional Chinese text
- **AND** button labels use Traditional Chinese translations

### Requirement: Cross-Platform External URL Opening

The system SHALL open GitHub release URLs in system default browser on all platforms.

#### Scenario: Open URL on macOS

- **WHEN** user clicks "Download" on macOS
- **THEN** URL opens in default browser (Safari, Chrome, etc.)
- **AND** application remains running in background

#### Scenario: Open URL on Windows

- **WHEN** user clicks "Download" on Windows
- **THEN** URL opens in default browser (Edge, Chrome, etc.)
- **AND** application remains running in background

#### Scenario: Open URL on Linux

- **WHEN** user clicks "Download" on Linux
- **THEN** URL opens in default browser
- **AND** application remains running in background
