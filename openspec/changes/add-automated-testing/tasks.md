# Implementation Tasks

## 1. Setup and Configuration

- [ ] 1.1 Install Vitest and related dependencies (`vitest`, `@vitest/ui`, `jsdom`)
- [ ] 1.2 Install React Testing Library (`@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`)
- [ ] 1.3 Install Playwright for Electron (`playwright`, `@playwright/test`)
- [ ] 1.4 Create `vitest.config.ts` with appropriate settings (jsdom environment, path aliases, coverage)
- [ ] 1.5 Create `playwright.config.ts` for E2E tests
- [ ] 1.6 Add test scripts to `package.json` (`test`, `test:unit`, `test:e2e`, `test:coverage`, `test:ui`)
- [ ] 1.7 Create test setup file for global test utilities and matchers

## 2. Unit Tests - Utilities

- [ ] 2.1 Write tests for password generation (`usePasswordGenerator` hook)
  - [ ] 2.1.1 Test password generation with valid inputs
  - [ ] 2.1.2 Test password generation with empty password or key returns null
  - [ ] 2.1.3 Test password length parameter affects output
  - [ ] 2.1.4 Test prefix and suffix are included in distinguishing code
  - [ ] 2.1.5 Test deterministic output (same inputs = same password)
- [ ] 2.2 Write tests for password masking utility
  - [ ] 2.2.1 Test short passwords (<= min length) are fully masked
  - [ ] 2.2.2 Test long passwords show start/end characters
  - [ ] 2.2.3 Test edge cases (empty string, single character)
- [ ] 2.3 Write tests for clipboard manager
  - [ ] 2.3.1 Test writeText sets clipboard content
  - [ ] 2.3.2 Test auto-clear timer is scheduled
  - [ ] 2.3.3 Test clearTimer cancels pending clear
  - [ ] 2.3.4 Test clipboard clears only if content unchanged
  - [ ] 2.3.5 Test multiple writeText calls clear previous timer

## 3. Unit Tests - React Hooks

- [ ] 3.1 Write tests for `usePasswordGenerator` hook
  - [ ] 3.1.1 Test initial state
  - [ ] 3.1.2 Test state setters update correctly
  - [ ] 3.1.3 Test generatePassword returns null for invalid inputs
  - [ ] 3.1.4 Test getPasswordDisplay shows masked/unmasked correctly
- [ ] 3.2 Write tests for `useFormSettings` hook
  - [ ] 3.2.1 Test initial state loads from config
  - [ ] 3.2.2 Test settings persist via IPC
- [ ] 3.3 Write tests for `useWindowEvents` hook
  - [ ] 3.3.1 Test window show/hide event handlers
  - [ ] 3.3.2 Test cleanup on unmount

## 4. Integration Tests - IPC Communication

- [ ] 4.1 Write tests for IPC handlers (`src/main/ipc.ts`)
  - [ ] 4.1.1 Test HIDE channel hides window
  - [ ] 4.1.2 Test QUIT channel triggers quit confirmation
  - [ ] 4.1.3 Test CLIPBOARD_WRITE_TEXT writes to clipboard manager
  - [ ] 4.1.4 Test GET_CONFIG returns current configuration
  - [ ] 4.1.5 Test UPDATE_FORM_SETTINGS persists settings
  - [ ] 4.1.6 Test SHELL_OPEN_EXTERNAL opens URLs

## 5. Integration Tests - Configuration

- [ ] 5.1 Write tests for configuration management (`src/main/config.ts`)
  - [ ] 5.1.1 Test readConfig returns default config on first run
  - [ ] 5.1.2 Test updateFormSettings persists to storage
  - [ ] 5.1.3 Test configuration schema validation

## 6. E2E Tests - Critical Workflows

- [ ] 6.1 Setup Playwright with Electron
  - [ ] 6.1.1 Create test helper to launch Electron app
  - [ ] 6.1.2 Create page object model for main window
- [ ] 6.2 Write E2E test for password generation workflow
  - [ ] 6.2.1 Test launch app, enter password and key, generate password
  - [ ] 6.2.2 Test copy to clipboard functionality
  - [ ] 6.2.3 Test password visibility toggle
- [ ] 6.3 Write E2E test for settings persistence
  - [ ] 6.3.1 Test update password length setting
  - [ ] 6.3.2 Test restart app, verify setting persisted
- [ ] 6.4 Write E2E test for language switching
  - [ ] 6.4.1 Test switch language updates UI
  - [ ] 6.4.2 Test language persists across sessions
- [ ] 6.5 Write E2E test for global shortcut (manual validation only)

## 7. Documentation and Conventions

- [ ] 7.1 Update `openspec/project.md` with testing conventions
  - [ ] 7.1.1 Add testing strategy section
  - [ ] 7.1.2 Document test file naming conventions
  - [ ] 7.1.3 Document mocking patterns for Electron APIs
  - [ ] 7.1.4 Add examples of good tests
- [ ] 7.2 Create `README.md` section on running tests
- [ ] 7.3 Document CI/CD integration recommendations

## 8. Validation

- [ ] 8.1 Run all tests and verify passing
- [ ] 8.2 Generate coverage report and verify >60% overall, >80% for critical paths
- [ ] 8.3 Run E2E tests on all platforms (macOS, Windows, Linux)
- [ ] 8.4 Verify test execution time (<5s for unit tests)
