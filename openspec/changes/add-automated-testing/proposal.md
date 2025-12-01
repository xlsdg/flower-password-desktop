# Add Automated Testing

## Why

The project currently lacks automated testing infrastructure, making refactoring risky and time-consuming. With an active migration to Tauri underway (0/222 tasks), comprehensive test coverage is essential to:

- Provide confidence when refactoring critical password generation and clipboard management logic
- Catch regressions early during the Tauri migration
- Enable safe architectural changes without manual testing overhead
- Document expected behavior through executable specifications
- Reduce bug discovery time from production to development

## What Changes

- Add Vitest as the primary test runner for unit and integration tests
- Add React Testing Library for React component and hook testing
- Add Playwright for end-to-end Electron application testing
- Implement unit tests for critical utilities (password generation, masking, clipboard management)
- Implement integration tests for IPC handlers and configuration persistence
- Implement E2E tests for core user workflows (password generation, settings, clipboard)
- Add test scripts to package.json and CI/CD integration documentation
- Establish testing conventions and patterns in project.md

## Impact

**Affected specs:**

- `unit-testing` (NEW): Pure functions, utilities, and React hooks
- `integration-testing` (NEW): IPC communication, configuration, state management
- `e2e-testing` (NEW): Full application workflows and user interactions

**Affected code:**

- `package.json`: Add test dependencies and scripts
- `src/`: Add test files alongside source files
- `vitest.config.ts`: Configuration for unit/integration tests
- `playwright.config.ts`: Configuration for E2E tests
- `openspec/project.md`: Add testing conventions section

**Dependencies:**

- New dev dependencies: `vitest`, `@vitest/ui`, `@testing-library/react`, `@testing-library/user-event`, `jsdom`, `playwright`, `@playwright/test`

**Timeline:**

- Phase 1: Unit tests for utilities and hooks (highest ROI)
- Phase 2: Integration tests for IPC and config
- Phase 3: E2E tests for critical workflows
