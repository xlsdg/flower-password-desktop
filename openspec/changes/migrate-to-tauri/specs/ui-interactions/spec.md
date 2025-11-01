# UI Interactions - Tauri Migration

## ADDED Requirements

### Requirement: Password Masking with Hover Reveal

The system SHALL mask generated passwords by default and reveal on hover.

#### Scenario: Generate and mask password

- **WHEN** password is generated from inputs
- **THEN** password is displayed in masked format on generate button
- **AND** if password length <= 4: show all bullets (e.g., "••••")
- **AND** if password length > 4: show first 2 chars + bullets + last 2 chars (e.g., "Ab••••cd")
- **AND** masked password provides visual feedback without revealing full password

#### Scenario: Reveal password on mouse hover

- **WHEN** user hovers mouse over generate button
- **THEN** full unmasked password is displayed
- **AND** password remains visible while hovering

#### Scenario: Re-mask password on mouse leave

- **WHEN** user moves mouse away from generate button
- **THEN** password returns to masked format
- **AND** masking pattern is reapplied

### Requirement: Enter Key Quick Generate

The system SHALL support Enter key to generate and copy password immediately.

#### Scenario: Enter key in password field

- **WHEN** user presses Enter in password input field
- **AND** both password and key fields have values
- **THEN** password is generated
- **AND** generated password is copied to clipboard
- **AND** window is hidden immediately

#### Scenario: Enter key in key field

- **WHEN** user presses Enter in key input field
- **AND** both password and key fields have values
- **THEN** password is generated
- **AND** generated password is copied to clipboard
- **AND** window is hidden immediately

#### Scenario: Enter key with missing fields

- **WHEN** user presses Enter
- **AND** password or key field is empty
- **THEN** nothing happens
- **AND** window remains visible
- **AND** user can complete the missing field

### Requirement: Password Length Selection

The system SHALL allow selection from 6-32 character password lengths.

#### Scenario: Password length dropdown

- **WHEN** user opens password length dropdown
- **THEN** options 6, 7, 8, ... 32 are available
- **AND** current selected length is highlighted
- **AND** default length is 16 characters

#### Scenario: Change password length

- **WHEN** user selects new password length
- **THEN** new length is immediately applied to password generation
- **AND** new length is saved to configuration
- **AND** generate button updates with new password

### Requirement: Prefix and Suffix Fields

The system SHALL support prefix and suffix for distinguishing codes.

#### Scenario: Add prefix to distinguishing code

- **WHEN** user types in prefix field
- **THEN** prefix is prepended to key for password generation
- **AND** final distinguishing code = prefix + key + suffix
- **AND** prefix value is saved to configuration immediately

#### Scenario: Add suffix to distinguishing code

- **WHEN** user types in suffix field
- **THEN** suffix is appended to key for password generation
- **AND** final distinguishing code = prefix + key + suffix
- **AND** suffix value is saved to configuration immediately

#### Scenario: Clear prefix or suffix

- **WHEN** user clears prefix or suffix field
- **THEN** empty value is saved to configuration
- **AND** password generation uses only remaining parts

### Requirement: Real-Time Form Settings Persistence

The system SHALL persist form settings immediately on change.

#### Scenario: Persist password length change

- **WHEN** user changes password length
- **THEN** IPC message UPDATE_FORM_SETTINGS is sent immediately
- **AND** backend saves passwordLength to config file
- **AND** setting is preserved across app restarts

#### Scenario: Persist prefix change

- **WHEN** user modifies prefix field
- **THEN** IPC message UPDATE_FORM_SETTINGS is sent on each keystroke
- **AND** backend saves prefix to config file
- **AND** setting is preserved across app restarts

#### Scenario: Persist suffix change

- **WHEN** user modifies suffix field
- **THEN** IPC message UPDATE_FORM_SETTINGS is sent on each keystroke
- **AND** backend saves suffix to config file
- **AND** setting is preserved across app restarts

### Requirement: Generate Button Click Action

The system SHALL copy password and hide window when generate button is clicked.

#### Scenario: Click generate button with valid inputs

- **WHEN** user clicks generate button
- **AND** password is generated successfully
- **THEN** password is copied to clipboard
- **AND** window is hidden immediately
- **AND** application remains running in tray

#### Scenario: Click generate button with missing inputs

- **WHEN** user clicks generate button
- **AND** password or key field is empty
- **THEN** nothing happens
- **AND** window remains visible

### Requirement: External Link Handling

The system SHALL open external links in system browser with validation.

#### Scenario: Click external link

- **WHEN** user clicks link in UI (e.g., flowerpassword.com)
- **THEN** URL protocol is validated (https:// or http:// only)
- **AND** if valid, link opens in external browser
- **AND** application window remains open

#### Scenario: Reject invalid protocols

- **WHEN** link has invalid protocol (file://, javascript:, etc.)
- **THEN** link is not opened
- **AND** no action is taken
- **AND** error is logged to console

### Requirement: Input Field Security

The system SHALL configure input fields for security and usability.

#### Scenario: Disable autocomplete

- **WHEN** input fields are rendered
- **THEN** autocomplete attribute is set to "off"
- **AND** browser does not suggest saved values
- **AND** prevents password managers from auto-filling

#### Scenario: Disable spell check

- **WHEN** input fields are rendered
- **THEN** spellcheck attribute is set to false
- **AND** browser does not underline misspellings
- **AND** prevents UI noise for passwords and keys

#### Scenario: Password field type

- **WHEN** password input field is rendered
- **THEN** input type is "password"
- **AND** characters are masked by default in input field
- **AND** prevents shoulder surfing

### Requirement: Theme Reactive UI

The system SHALL update UI theme when system or user preference changes.

#### Scenario: Receive theme change event

- **WHEN** IPC event THEME_CHANGED is received
- **THEN** React component updates theme state
- **AND** UI applies new theme (light/dark) via CSS
- **AND** theme change is immediate without restart

#### Scenario: Receive language change event

- **WHEN** IPC event LANGUAGE_CHANGED is received
- **THEN** React component updates language state
- **AND** i18next reloads translations
- **AND** UI text updates to new language immediately
