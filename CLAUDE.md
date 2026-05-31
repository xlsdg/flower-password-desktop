# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**FlowerPassword Desktop** is a cross-platform Electron app for the Flower Password algorithm—a password derivation system. Given a master password (記憶密碼) and a site identifier (區分代號), it generates strong, unique passwords deterministically.

The app runs natively on macOS, Windows, and Linux with a tray icon, global hotkey support (Cmd/Ctrl+Alt+S), and real-time clipboard integration. It's built with Electron, React, TypeScript, Vite, and styled with LESS.

**Key Features:**

- Password generation and display with masking
- System tray integration with configurable shortcuts
- Clipboard auto-clear after 10 seconds
- Auto-launch support (macOS/Windows)
- Multi-language (zh-CN, zh-TW, en-US) with auto-detection
- Theme switching (light, dark, auto)
- Form settings persistence across sessions

## Essential Commands

```bash
# Development
npm start                    # Start dev server with Electron hot-reload

# Building
npm run make                 # Build for current platform/arch (default arm64)
npm run make:x64             # Build for x64 architecture
npm run make:mac             # Build for macOS (arm64, default)
npm run make:mac:arm64       # Build for macOS arm64 specifically
npm run make:mac:x64         # Build for macOS x64
npm run make:win             # Build for Windows (x64, ia32)
npm run make:linux           # Build for Linux (x64, arm64)
npm run package              # Create package without installer

# Code quality
npm run lint                 # Run ESLint with auto-fix
npm run format               # Run Prettier with auto-write
npm run format:check         # Check formatting without writing
```

## Architecture

### Process Structure

- **Main Process** (`src/main/`): Node.js runtime, window management, system integrations
- **Renderer** (`src/renderer/`): React UI, runs in Chromium sandbox
- **Preload** (`src/preload/preload.ts`): IPC bridge with explicit API surface
- **Shared** (`src/shared/`): Constants and types used by both processes

### File Organization

```
src/
├── main/
│   ├── main.ts              # App entry point, boot sequence, error handling
│   ├── window.ts            # Window creation and lifecycle
│   ├── tray.ts              # System tray icon and menu
│   ├── shortcut.ts          # Global keyboard shortcut registration
│   ├── ipc.ts               # IPC channel handlers
│   ├── config.ts            # User settings (theme, language, form state, shortcut)
│   ├── clipboard.ts         # Clipboard operations with auto-clear timeout
│   ├── platform.ts          # OS detection and platform-specific behavior
│   ├── i18n.ts              # Main process translations
│   ├── updater.ts           # Auto-update logic (macOS/Windows)
│   ├── dialog.ts            # Dialogs (about, settings)
│   ├── position.ts          # Window positioning relative to mouse/screen
│   └── locales/             # i18next JSON files for main process
│
├── renderer/
│   ├── App.tsx              # Main React component with form UI
│   ├── index.tsx            # React root and DOM mount
│   ├── i18n.ts              # Renderer i18next setup
│   ├── utils.ts             # UI helpers (domain extraction, etc.)
│   ├── hooks/
│   │   ├── usePasswordGenerator.ts   # Password generation and visibility state
│   │   ├── useFormSettings.ts        # Load/sync form settings with main process
│   │   └── useWindowEvents.ts        # IPC listeners (theme, language changes, clipboard)
│   ├── styles/
│   │   ├── reset.less       # CSS reset for consistent rendering
│   │   └── index.less       # Main app styles
│   ├── locales/             # i18next JSON files for renderer
│   └── global.d.ts          # Type definitions for Vite globals
│
├── preload/
│   └── preload.ts           # Contextual IPC APIs exposed to renderer
│
├── shared/
│   ├── constants.ts         # IPC channels, UI limits, shortcuts, paths
│   └── types.d.ts           # Shared types (Config, FormSettings)
│
└── types/
    ├── vite-env.d.ts        # Vite HMR types
    ├── auto-launch.d.ts     # Type stubs
    └── psl.d.ts             # Public Suffix List types
```

### Key Design Patterns

**IPC Communication:**

- Renderer → Main: `ipcRenderer.send()` for fire-and-forget (hide window, quit, clipboard write, form settings)
- Renderer → Main: `ipcRenderer.invoke()` for request/response (get config, open URL)
- Main → Renderer: IPC channels for broadcasts (theme, language, window show)
- All IPC channels defined centrally in `src/shared/constants.ts` (IPC_CHANNELS)

**Settings Persistence:**

- Config stored in user data directory (`AppConfig` in `src/main/config.ts`)
- Form state (password length, prefix, suffix) synced via `UPDATE_FORM_SETTINGS` IPC
- Settings loaded on app start and updated reactively

**Password Generation:**

- Uses `flowerpassword.js` npm package (external algorithm)
- `usePasswordGenerator()` hook manages state (password, key, prefix, suffix, length)
- Visibility controlled separately to show/hide masked password display

**Styling:**

- LESS preprocessor with JavaScript support enabled
- Global styles in `reset.less` and `index.less`
- Responsive to theme and language changes via CSS variables

### Vite Build Configuration

- **Main process** built by Vite (not Webpack) using `vite.main.config.ts`
- **Renderer** built separately with React plugin and LESS support
- **Electron Forge** orchestrates main/preload/renderer builds and packaging
- Hot reload enabled in dev, asar packaging in production
- Electron Fuses enable security hardening (cookie encryption, ASAR integrity, etc.)

### Electron-Specific Features

- **Window:** Frameless, transparent with vibrancy effect (macOS native look)
- **Tray:** Icon changes based on theme; menu includes settings and exit
- **Shortcuts:** Global hotkey shows window at cursor position, customizable via config
- **Auto-launch:** Stored in config, platform-dependent (macOS Login Items, Windows Registry)
- **Clipboard:** Auto-clear after 10 seconds; uses `CLIPBOARD_CLEAR_TIMEOUT` constant

## Development Notes

**Strict TypeScript:**

- `strict: true` with additional checks (exactOptionalPropertyTypes, noUncheckedIndexedAccess, etc.)
- All function return types explicitly declared
- Unused vars forbidden (parameters can be prefixed with `_`)
- Boolean expressions must be explicit (no falsy/truthy coercion)

**ESLint/Prettier Integration:**

- Prettier rules enforced via ESLint (`prettier/prettier: 'error'`)
- Run `npm run lint` before committing to auto-fix violations
- Check `.eslintignore` in eslint.config.js for excluded directories

**i18n Structure:**

- Both main and renderer have separate `locales/` directories with JSON files
- Language auto-detected from system; user can override in config
- Use `useTranslation()` in React, `getCurrentLanguage()` in main process

**Testing:**

- No test framework configured; manual testing required
- Use `npm start` to launch the dev app and test features interactively
- Check styling, IPC communication, and platform-specific behaviors (especially shortcuts, tray)

**Build Artifacts:**

- Development: `.vite/` (live reload during `npm start`)
- Production: `out/` directory with signed/notarized binaries
- Packager output in `out/` with platform-specific subdirectories

## Release Process

The project uses `release-please` for automated versioning and changelogs:

- Conventional Commits (e.g., `fix:`, `feat:`, `chore:`) trigger version bumps
- PR titles are validated against conventional commit format (see `.github/workflows/pr-title-check.yml`)
- Release workflow signs binaries (macOS notarization, Windows code signing)
- GitHub releases created automatically with generated changelogs

## Common Tasks

**Adding a new IPC channel:**

1. Add constant to `IPC_CHANNELS` in `src/shared/constants.ts`
2. Register handler in `src/main/ipc.ts` using `ipcMain.handle()` or `ipcMain.on()`
3. Use `window.electron.<channel>()` in renderer (exposed via preload)

**Changing theme/language:**

- Settings UI in tray menu; updates persisted via `ipcMain.handle('config:get')`
- Main process broadcasts `THEME_CHANGED` / `LANGUAGE_CHANGED` to renderer
- Renderer listens via `useWindowEvents()` and re-renders

**Modifying password generation:**

- Logic in `usePasswordGenerator()` hook; calls `flowerpassword.js` library
- Display formatting (masking) in `getPasswordDisplay()` helper
- Length constraints defined in `src/shared/constants.ts`

**Platform-specific behavior:**

- `src/main/platform.ts` detects OS and handles quirks
- Global shortcuts vary by OS (Cmd on macOS, Ctrl elsewhere)
- Auto-launch uses platform-specific `auto-launch` package
- Packager config in `forge.config.js` defines per-OS makers and icons

## Debugging

- Main process: Add breakpoints in VS Code and attach debugger via `--inspect` flag
- Renderer: DevTools available via right-click → Inspect (dev mode only)
- IPC calls: Log to console or DevTools network tab
- Hot reload: Enabled in dev; changes to main/preload/renderer auto-rebuild
