# Testing Strategy Design

## Context

FlowerPassword is an Electron desktop application with a clear separation between main process (Node.js) and renderer process (React). The application handles sensitive data (passwords) and has critical behaviors (clipboard auto-clear, deterministic password generation) that must work reliably. An active migration to Tauri increases the need for comprehensive test coverage.

**Key constraints:**

- Must test across main and renderer processes
- Must handle Electron APIs (clipboard, ipcMain, ipcRenderer)
- Must test React hooks and components
- Must validate security-critical behavior (clipboard clearing, password masking)
- Must run fast enough for TDD workflow (<5s for unit tests)

## Goals / Non-Goals

**Goals:**

- Achieve >80% code coverage for critical paths (password generation, clipboard, IPC)
- Enable safe refactoring during Tauri migration
- Run unit tests in <5 seconds
- Document expected behavior through test scenarios
- Establish testable architecture patterns

**Non-Goals:**

- 100% code coverage (diminishing returns)
- Testing third-party libraries (flowerpassword.js, auto-launch)
- Performance/load testing (application is single-user)
- Visual regression testing (minimal UI surface)

## Decisions

### Decision 1: Vitest for Unit/Integration Tests

**Rationale:**

- Native Vite integration (project already uses Vite)
- Faster than Jest with better ESM support
- Built-in TypeScript support without configuration
- Compatible with Testing Library
- Watch mode and UI for development workflow

**Alternatives considered:**

- Jest: Slower, requires additional configuration for ESM/TypeScript, larger ecosystem
- Node test runner: Less mature, lacks React testing integration

### Decision 2: React Testing Library for Component Tests

**Rationale:**

- Industry standard for React testing
- Encourages testing user behavior over implementation details
- Excellent TypeScript support
- Works well with Vitest
- Supports hooks testing via `renderHook`

**Alternatives considered:**

- Enzyme: Deprecated, no React 19 support
- Direct React test utils: Too low-level, poor DX

### Decision 3: Playwright for E2E Tests

**Rationale:**

- Official Electron support via `@playwright/test`
- More modern than Spectron (deprecated)
- Fast, reliable, excellent debugging tools
- Same API for web and Electron testing
- Active development and community

**Alternatives considered:**

- Spectron: Deprecated by Electron team
- Selenium: Slower, worse Electron support
- Puppeteer: Limited Electron support

### Decision 4: Co-locate Tests with Source Files

**Rationale:**

- Easier to find and update tests
- Clear test coverage visibility
- Follows project convention of keeping related files together
- Better IDE support

**Pattern:**

```
src/
├── main/
│   ├── clipboard.ts
│   ├── clipboard.test.ts
│   ├── ipc.ts
│   └── ipc.test.ts
├── renderer/
│   ├── hooks/
│   │   ├── usePasswordGenerator.ts
│   │   └── usePasswordGenerator.test.tsx
```

### Decision 5: Test Structure by Testing Pyramid

**Unit Tests (70%):** Focus on pure functions and utilities

- Password generation logic
- Password masking
- Clipboard manager state
- Configuration utilities
- i18n utilities

**Integration Tests (20%):** Focus on IPC and state

- IPC handler registration and communication
- Configuration persistence
- Clipboard manager with timers
- Hook integration with React state

**E2E Tests (10%):** Focus on critical user workflows

- Generate password and copy to clipboard
- Change settings and verify persistence
- Switch language and verify UI updates
- Global shortcut triggers window

## Risks / Trade-offs

**Risk: E2E tests may be flaky**

- Mitigation: Keep E2E test count minimal (<10 tests), focus on critical paths only
- Mitigation: Use Playwright's auto-wait and retry mechanisms
- Mitigation: Run E2E tests in CI only, not on every save

**Risk: Testing Electron APIs requires mocking**

- Mitigation: Use dependency injection for clipboard/IPC in main process
- Mitigation: Extract pure business logic from Electron APIs where possible
- Mitigation: Document mocking patterns in project.md

**Risk: Additional dependencies increase bundle size**

- Mitigation: All test dependencies are devDependencies (not shipped)
- Impact: Minimal (~100MB node_modules increase)

**Trade-off: Time investment vs immediate value**

- Initial setup: ~8-16 hours
- Writing tests: ~2-4 hours per module
- Value: Unlocks confident refactoring for 222-task Tauri migration

## Migration Plan

**Phase 1: Foundation (Week 1)**

1. Install dependencies
2. Configure Vitest and Playwright
3. Add test scripts to package.json
4. Write first unit test to validate setup

**Phase 2: Critical Path Coverage (Week 2)**
5. Unit tests for password generation and masking
6. Unit tests for clipboard manager
7. Integration tests for IPC handlers
8. Integration tests for configuration

**Phase 3: Component Coverage (Week 3)**
9. Tests for usePasswordGenerator hook
10. Tests for useFormSettings hook
11. Tests for useWindowEvents hook

**Phase 4: E2E Coverage (Week 4)**
12. E2E test for password generation workflow
13. E2E test for settings persistence
14. E2E test for language switching

**Rollback:**

- Tests are additive, no breaking changes
- Can remove test infrastructure by reverting commits
- No impact on production code if abandoned

## Open Questions

1. Should we test main process and renderer process in the same test suite or separate?
   - Recommendation: Separate for faster feedback (unit tests don't need Electron)

2. Should we run tests in CI/CD?
   - Recommendation: Yes, on PR and merge to master

3. Should we enforce coverage thresholds?
   - Recommendation: Start with 60% overall, 80% for critical paths

4. Should we test localization strings?
   - Recommendation: No, focus on logic. Visual inspection sufficient for i18n.
