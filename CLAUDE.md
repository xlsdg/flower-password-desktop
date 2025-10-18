# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

FlowerPassword is a cross-platform Electron desktop app (macOS/Windows/Linux) built with React 19, TypeScript, and LESS. It implements deterministic password generation using the flowerpassword.js library - users remember one "memory password" and use different "distinction codes" per account to generate unique, strong passwords.

**Tech Stack:** Electron 38, React 19, TypeScript 5.9, Rspack (bundler), LESS (styles with auto light/dark theme)

**Architecture Support:** macOS (ARM64/x64), Windows (x64/ia32), Linux (x64/ARM64)

## Quick Start

```bash
npm install          # Install dependencies
npm run dev          # Development mode (hot reload + auto-restart)
npm start            # Build once and launch app
npm run build        # Build all processes with Rspack
npm run lint         # ESLint + TypeScript linting
npm run format       # Format with Prettier
```

**Build System:** Rspack compiles all processes (main/preload/renderer) with SWC loader. TypeScript is used only for type checking (`noEmit: true`).

## Production Builds

**Platform-specific commands (Electron Forge):**

```bash
# macOS
npm run make              # Current arch (ARM64 default)
npm run make:mac:arm64    # Apple Silicon only
npm run make:mac:x64      # Intel only

# Windows (must run on Windows or Wine)
npm run make:win:x64      # 64-bit (recommended)
npm run make:win:ia32     # 32-bit

# Linux (must run on Linux)
npm run make:linux:x64    # x64 (most common)
npm run make:linux:arm64  # ARM64 (Raspberry Pi, etc.)
```

**Output:** `out/make/` - DMG/ZIP (macOS), Setup.exe/ZIP (Windows), .deb/.rpm/ZIP (Linux)

**Release Process:** Push version tag (`npm version [major|minor|patch] && git push --tags`) to trigger GitHub Actions multi-platform build and release.

## Architecture

```
src/
├── main/              # Main process (Electron lifecycle, window, tray, menu, IPC)
├── preload/           # Context bridge (exposes safe APIs to renderer)
├── renderer/          # React app (App.tsx, styles/, assets/, html/)
└── shared/            # Shared types and constants

assets/                # Build-time icons (.icns, .ico, .png)
dist/                  # Compiled output (Rspack builds to here)
```

### Key Modules

**Main Process:**

- [main.ts](src/main/main.ts) - App lifecycle, error handling, macOS dock hiding
- [window.ts](src/main/window.ts) - BrowserWindow management with platform-specific config
  - macOS: `setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })` + floating level
  - Windows/Linux: Standard `setAlwaysOnTop(true)`
- [position.ts](src/main/position.ts) - Window positioning logic (tray-relative or cursor-based)
- [tray.ts](src/main/tray.ts) - System tray icon (template mode on macOS), menu, clipboard parsing
- [menu.ts](src/main/menu.ts) - Edit menu + global shortcut (`Cmd+Alt+S`)
- [ipc.ts](src/main/ipc.ts) - IPC handlers (hide, quit, clipboard, shell)

**Preload:** [index.ts](src/preload/index.ts) - Exposes `window.electronAPI` via `contextBridge`

**Renderer:** [App.tsx](src/renderer/App.tsx) - React 19 functional component with hooks, real-time password generation, auto-fill from clipboard

**Security:** `contextIsolation: true`, `nodeIntegration: false`, `contextBridge` for safe IPC

### Platform-Specific Behaviors

- **macOS**: Window appears on all workspaces/Spaces (including fullscreen apps). Tray window positioned below menubar (centered). Global shortcut works in fullscreen without desktop switch.
- **Windows/Linux**: Standard always-on-top. Tray window positioned above taskbar (right-aligned).

## Code Style

**TypeScript Rules:**

- Strict mode enabled, **no `any` types allowed**
- Explicit return types required for all functions
- ESLint v9+ flat config with type-aware linting
- **All comments MUST be in English only** (no Chinese comments)

**Formatting (Prettier enforced):**

- Semicolons required, single quotes, 120 char line width
- 2 spaces indentation, LF line endings
- ES5 trailing commas

**React/CSS:**

- Functional components with hooks (`useState`, `useEffect`, `useCallback`, `useMemo`, `useRef`)
- LESS with BEM naming (`.block__element--modifier`)
- CSS variables for themeable values (`--bg-color`, `--text-primary`)
- Light/dark theme via `prefers-color-scheme`
