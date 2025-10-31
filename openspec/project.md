# Project Context

## Purpose

FlowerPassword is a cross-platform desktop password manager application built with Electron. It provides a simple password management method where users only need to remember one "memory password" and set different "distinction codes" for different accounts. The app generates strong, unique passwords for each account through encryption algorithms.

**Core Functionality:**

- Generate secure passwords using a master password + site-specific key
- Global keyboard shortcut (Cmd+Alt+S on macOS) for quick access
- System tray integration for easy access
- Multi-language support (English, Simplified Chinese, Traditional Chinese)
- Clipboard management with auto-clear functionality
- Auto-launch on system startup

## Tech Stack

### Core Technologies

- **TypeScript 5.9+** - Strict type safety with exactOptionalPropertyTypes enabled
- **Electron 38.4+** - Desktop application framework
- **React 19.2** - UI framework with hooks-based architecture
- **Vite 7.1+** - Build tool and dev server

### UI & Styling

- **React 19.2** with JSX transform (`react-jsx`)
- **Less** - CSS preprocessor for styling
- **i18next & react-i18next** - Internationalization framework

### Core Libraries

- **flowerpassword.js 5.0+** - Password generation algorithm
- **auto-launch 5.0+** - System startup integration
- **psl 1.15+** - Public Suffix List for domain parsing

### Build & Tooling

- **Electron Forge 7.10+** - Building and packaging
- **ESLint 9.38+** with TypeScript plugin - Linting
- **Prettier 3.6+** - Code formatting

### Supported Platforms

- macOS (arm64 and x64)
- Windows (x64 and ia32)
- Linux (x64 and arm64)

## Project Conventions

### Code Style

**TypeScript Configuration:**

- Target: ES2022 with DOM and ES2022 lib
- Strict mode enabled with additional strictness:
  - `exactOptionalPropertyTypes: true`
  - `noUncheckedIndexedAccess: true`
  - `useUnknownInCatchVariables: true`
  - `noUnusedLocals: true`
  - `noUnusedParameters: true`
  - `noImplicitReturns: true`
  - `noFallthroughCasesInSwitch: true`

**Naming Conventions:**

- PascalCase for React components and TypeScript types/interfaces
- camelCase for functions, variables, and file names (except components)
- SCREAMING_SNAKE_CASE for constants
- Kebab-case for OpenSpec change IDs
- Files: `lowercase.ts` or `PascalCase.tsx` (for components)

**Import Organization:**

- React imports first
- External libraries second
- Internal modules/utils third
- Styles last
- Use type imports: `type JSX` from React

**React Patterns:**

- Functional components with hooks only
- `useCallback` for event handlers
- `useRef` for DOM references and stable values
- `useEffect` for side effects and subscriptions
- Export function components as named exports

**Error Handling:**

- Use try-catch with typed errors
- Display user-friendly error dialogs for critical failures
- Log errors to console for debugging
- Graceful degradation where possible

### Architecture Patterns

**Electron Process Architecture:**

- **Main Process** (`src/main/`): Node.js backend handling system integration
  - `main.ts` - Application lifecycle and initialization
  - `window.ts` - BrowserWindow management
  - `tray.ts` - System tray integration
  - `ipc.ts` - IPC handler registration
  - `shortcut.ts` - Global keyboard shortcuts
  - `clipboard.ts` - Clipboard operations with auto-clear
  - `config.ts` - Application configuration
  - `i18n.ts` - Backend internationalization
  - `position.ts` - Window positioning logic
  - `dialog.ts` - Native dialogs
  - `updater.ts` - Auto-update functionality

- **Preload Script** (`src/preload/`): Context bridge for secure IPC
  - Exposes safe `rendererBridge` API to renderer

- **Renderer Process** (`src/renderer/`): React-based UI
  - `App.tsx` - Main application component
  - `index.tsx` - React entry point
  - `i18n.ts` - Frontend internationalization
  - `utils.ts` - Utility functions
  - `styles/` - Less stylesheets

- **Shared** (`src/shared/`): Common types and constants
  - `types.d.ts` - Shared TypeScript types
  - `constants.ts` - Shared constants

**State Management:**

- Local component state with `useState`
- Refs for stable references (`useRef`)
- No external state management library (Redux, Zustand, etc.)

**IPC Communication:**

- Main → Renderer: Direct calls via context bridge
- Renderer → Main: `ipcRenderer.invoke` with typed handlers
- Preload script exposes limited, secure API surface

**Security:**

- Context isolation enabled
- Node integration disabled in renderer
- Preload script as sole bridge between processes
- URL validation for external links (HTTPS/HTTP only)

### Testing Strategy

**Current State:**

- No automated tests currently implemented
- Manual testing for releases across platforms
- Visual regression testing through screenshots

**Future Considerations:**

- Unit tests for password generation logic
- Integration tests for IPC communication
- E2E tests for critical user flows

### Git Workflow

**Branching:**

- `main` - Production-ready code
- `v4-claude` - Current development branch
- Feature branches: `feature/[description]`
- Bug fixes: `fix/[description]`

**Commits:**

- Descriptive commit messages
- Atomic commits (one logical change per commit)

**Release Process:**

- Version bumps in `package.json`
- Build for all platforms (macOS, Windows, Linux)
- Create GitHub releases with binaries

## Domain Context

**Password Generation Algorithm:**

- Uses `flowerpassword.js` library implementing the "Flower Password" algorithm
- Inputs: memory password + distinction code (prefix + key + suffix) + length
- Output: Deterministic, cryptographically secure password
- Length range: 6-32 characters (default: 16)
- Same inputs always produce the same output (no randomness)

**User Workflow:**

1. User sets global shortcut or clicks tray icon
2. Window appears (positioned near cursor or tray)
3. User enters memory password (never stored)
4. User enters distinction code (site identifier like "taobao", "tb", etc.)
5. App generates password in real-time
6. User clicks to copy, password copied to clipboard
7. Window auto-hides
8. Clipboard auto-clears after timeout

**Security Model:**

- Zero knowledge: Master password never stored or transmitted
- All computation happens locally
- Clipboard auto-clear prevents password leakage
- Password masking in UI (shows first/last 2 chars)

**Internationalization:**

- Three languages: en-US, zh-CN, zh-TW
- Separate locale files for main and renderer processes
- Language selection persists in config
- RTL not required (all supported languages are LTR)

## Important Constraints

**Technical:**

- Must maintain Electron security best practices (context isolation, no nodeIntegration)
- Must work offline (no network calls for password generation)
- Must be lightweight and fast (< 100MB installed, < 500ms launch time)
- Global shortcuts must not conflict with common OS/app shortcuts

**Platform-Specific:**

- macOS: Proper app signing and notarization required for distribution
- Windows: Code signing for avoiding security warnings
- Linux: AppImage or deb/rpm packages

**User Experience:**

- Window must appear instantly when triggered
- Password generation must be real-time (no perceptible delay)
- UI must be simple and uncluttered (single-window workflow)
- Must support high-DPI displays

**Privacy:**

- No telemetry or analytics
- No network communication (except for update checks)
- No password storage or logging

## External Dependencies

**Core Libraries:**

- `flowerpassword.js` - Password generation algorithm (critical)
- `electron` - Desktop framework (critical)
- `react` & `react-dom` - UI framework (critical)

**System Integration:**

- `auto-launch` - System startup integration
- `psl` - Public Suffix List for domain parsing (potential future use)

**Internationalization:**

- `i18next` - i18n framework
- `react-i18next` - React bindings for i18next

**Build Tools:**

- `@electron-forge/*` - Build, package, and distribution
- `vite` - Build tool and dev server
- `@vitejs/plugin-react` - React plugin for Vite

**Code Quality:**

- `eslint` with TypeScript and Prettier plugins
- `prettier` - Code formatting
- `typescript` - Type checking

**No External Services:**

- No authentication services
- No cloud storage or sync
- No crash reporting services
- No update server (using GitHub releases for updates)
