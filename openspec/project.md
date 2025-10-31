# Project Context

## Purpose

FlowerPassword is a cross-platform desktop application (macOS, Windows, Linux) that provides a deterministic password generation system. Users only need to remember one "memory password" and create different "distinguishing codes" for each account to generate unique, strong passwords. The application:

- Generates consistent, cryptographically strong passwords from memory password + distinguishing code
- Supports multi-language interface (English, Simplified Chinese, Traditional Chinese)
- Provides global keyboard shortcut (Cmd+Alt+S) for quick access
- Runs in system tray with minimal UI footprint
- Manages clipboard security with automatic clearing

## Tech Stack

### Core Framework

- **Electron 38**: Cross-platform desktop application framework
- **React 19**: UI rendering with hooks and modern patterns
- **TypeScript 5**: Strict type safety with enhanced compiler options

### Build & Development

- **Vite 7**: Fast build tool and dev server
- **Electron Forge**: Application packaging and distribution
- **Electron Fuses**: Security hardening and configuration

### Styling & UI

- **Less**: CSS preprocessor for component styling
- **React i18next**: Internationalization library

### Core Libraries

- **flowerpassword.js**: Password generation algorithm (deterministic password derivation)
- **auto-launch**: System startup integration
- **psl**: Public Suffix List for domain parsing

## Project Conventions

### Code Style

**TypeScript Configuration:**

- Strict mode enabled with additional strictness flags:
  - `exactOptionalPropertyTypes`: true
  - `noUncheckedIndexedAccess`: true
  - `useUnknownInCatchVariables`: true
- Explicit function return types required
- No `any` types permitted
- Strict boolean expressions (no truthy/falsy coercion)
- Path alias: `@/*` maps to `./src/*`

**Formatting (Prettier):**

- Single quotes
- 2-space indentation
- Print width: 120 characters
- Semicolons required
- Arrow function parens: avoid
- Trailing commas: ES5
- End of line: LF

**Linting (ESLint):**

- TypeScript recommended rules + type-checking rules
- Console statements: warn (except console.warn and console.error)
- Unused parameters allowed if prefixed with underscore
- No floating promises or unhandled async operations
- No explicit any types

**Naming Conventions:**

- Files: kebab-case (e.g., `main.ts`, `clipboard.ts`)
- Components: PascalCase (e.g., `App.tsx`)
- Constants: UPPER_SNAKE_CASE
- Variables/Functions: camelCase

### Architecture Patterns

**Electron Multi-Process Architecture:**

```
src/
├── main/          # Main process (Node.js environment)
│   ├── main.ts    # Application entry point
│   ├── window.ts  # Window management
│   ├── tray.ts    # System tray integration
│   ├── ipc.ts     # IPC handlers
│   ├── config.ts  # Configuration management
│   ├── clipboard.ts
│   ├── shortcut.ts
│   └── locales/   # Main process i18n
├── preload/       # Preload script (IPC bridge)
│   └── preload.ts # Exposes APIs to renderer
├── renderer/      # Renderer process (Browser environment)
│   ├── App.tsx    # Main React component
│   ├── index.tsx  # React entry point
│   ├── i18n.ts    # i18n configuration
│   ├── locales/   # Renderer i18n
│   └── styles/    # LESS stylesheets
├── shared/        # Shared code between processes
│   ├── types.d.ts # Common type definitions
│   └── constants.ts
└── types/         # Type declarations for libraries
```

**Key Patterns:**

- **IPC Communication**: Renderer communicates with main process via preload bridge
- **Configuration Persistence**: Electron Store for user preferences
- **Global Shortcuts**: System-wide keyboard shortcuts for quick access
- **Tray Application**: Runs in system tray, no dock icon on macOS
- **Security**: Context isolation enabled, node integration disabled in renderer

### Testing Strategy

Currently no automated testing framework configured. Manual testing approach:

- Cross-platform builds verified on macOS, Windows, Linux
- Multiple architectures: x64, arm64, ia32
- Language switching validation
- Clipboard management verification
- Global shortcut testing

### Git Workflow

**Branching Strategy:**

- Main branch: `master`
- Feature branches: descriptive names (e.g., `v4-claude` for major version work)
- Development branches merged to master after review

**Commit Conventions:**

- Format: `<type>: <description>`
- Types: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
- Examples:
  - `feat: add password input reference and focus management`
  - `feat: disable autocomplete and spell check for input fields`
  - `fix: update asset paths for tray and dialog icons`

**Release Process:**

- Version bumps in package.json
- Tag releases with version numbers
- Build artifacts for all platforms and architectures

## Domain Context

**Flower Password Algorithm:**
The core concept is deterministic password generation:

1. User provides a "memory password" (master password they remember)
2. User provides a "distinguishing code" (identifier for the service, e.g., "taobao", "gmail")
3. Algorithm combines these inputs to generate a unique, strong password
4. Same inputs always produce the same output (deterministic)
5. Different distinguishing codes produce completely different passwords

**Use Case:**

- User only needs to remember one password
- Each service gets a unique, strong password
- No password storage required (passwords are generated on-demand)
- If database is compromised, other accounts remain secure

**Security Model:**

- Passwords never stored, only generated
- Clipboard auto-clear after configurable timeout
- Memory password never leaves the application
- Distinguishing codes can be simple memorable strings

## Important Constraints

**Security Constraints:**

- Must never log or persist memory passwords
- Clipboard must be cleared after password generation
- No telemetry or analytics that could leak user data
- Context isolation and node integration settings follow Electron security best practices

**Platform Constraints:**

- macOS: Hides dock icon, runs as menu bar app
- Windows: Runs in system tray
- Linux: System tray support varies by desktop environment
- Global shortcuts may conflict with system or other apps

**Build Constraints:**

- ASAR packaging enabled for performance
- Code signing required for macOS distribution
- Multiple architecture builds required (x64, arm64)

**UX Constraints:**

- Minimal UI - quick in/out interaction model
- Must support keyboard-only workflow
- Language switching without restart
- System startup integration optional

## External Dependencies

**Core Algorithm:**

- `flowerpassword.js`: The password generation algorithm (maintained separately)
  - GitHub: <https://github.com/xlsdg/flowerpassword.js>
  - Deterministic password derivation function
  - Must remain compatible with web and mobile versions

**System Integration:**

- `auto-launch`: Cross-platform system startup integration
- `psl`: Public Suffix List for domain parsing (helps with distinguishing code suggestions)

**Official Resources:**

- Website: <https://flowerpassword.com/>
- Repository: <https://github.com/xlsdg/flower-password-desktop>

**No External Services:**

- Application is completely offline
- No API calls or network requests
- No update server (manual updates)
- No crash reporting or analytics
