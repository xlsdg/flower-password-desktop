## ADDED Requirements

### Requirement: Unit Test Infrastructure

The testing system SHALL provide infrastructure for running isolated unit tests of pure functions, utilities, and React hooks without requiring a full Electron environment.

#### Scenario: Run unit tests quickly

- **GIVEN** a developer has made code changes
- **WHEN** they run `npm test` or `npm run test:unit`
- **THEN** all unit tests execute in under 5 seconds
- **AND** test results show pass/fail status for each test

#### Scenario: Test React hooks in isolation

- **GIVEN** a React hook to test (e.g., `usePasswordGenerator`)
- **WHEN** the developer writes a test using `renderHook` from Testing Library
- **THEN** the hook can be tested without mounting a full React component
- **AND** hook state updates and return values can be asserted

### Requirement: Password Generation Testing

The testing system SHALL validate password generation logic to ensure deterministic, correct password derivation.

#### Scenario: Validate password generation produces consistent output

- **GIVEN** a memory password "test123" and distinguishing code "github"
- **WHEN** `generatePassword()` is called multiple times with these inputs
- **THEN** the same password is returned every time
- **AND** the password matches the expected output from flowerpassword.js algorithm

#### Scenario: Validate password masking utility

- **GIVEN** a generated password string
- **WHEN** `maskPassword()` is called with the password
- **THEN** passwords longer than minimum length show first 2 and last 2 characters with bullets in between
- **AND** passwords at or below minimum length are fully masked with bullets

### Requirement: Clipboard Management Testing

The testing system SHALL validate clipboard auto-clear behavior to ensure passwords are cleared after the configured timeout.

#### Scenario: Clipboard auto-clear timer schedules correctly

- **GIVEN** clipboard manager writes text "password123" with 30s timeout
- **WHEN** the timer reaches 30 seconds
- **THEN** the clipboard content is cleared if it still contains "password123"
- **AND** the clipboard is not cleared if the user has copied different content

#### Scenario: Multiple clipboard writes cancel previous timers

- **GIVEN** clipboard manager writes "password1" with a timer
- **WHEN** clipboard manager writes "password2" before the first timer expires
- **THEN** the first timer is cancelled
- **AND** only the second timer remains active

### Requirement: Test Coverage Reporting

The testing system SHALL provide code coverage metrics to identify untested code paths.

#### Scenario: Generate coverage report

- **GIVEN** unit tests have been executed
- **WHEN** the developer runs `npm run test:coverage`
- **THEN** a coverage report is generated showing line, branch, and function coverage
- **AND** the report identifies files with coverage below threshold

#### Scenario: Coverage meets minimum thresholds

- **GIVEN** the test suite is executed with coverage enabled
- **WHEN** coverage is calculated for critical paths (password generation, clipboard management)
- **THEN** critical path coverage is at least 80%
- **AND** overall project coverage is at least 60%

### Requirement: Test Development Workflow

The testing system SHALL support an efficient test-driven development workflow with watch mode and UI.

#### Scenario: Watch mode reruns tests on file changes

- **GIVEN** a developer is running `npm run test:ui` or watch mode
- **WHEN** a source file or test file is modified
- **THEN** affected tests automatically rerun
- **AND** results are displayed immediately

#### Scenario: Interactive test UI

- **GIVEN** a developer runs `npm run test:ui`
- **WHEN** the Vitest UI opens in the browser
- **THEN** tests can be filtered, rerun individually
- **AND** test execution time and status are visualized
