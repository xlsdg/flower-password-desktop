# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FlowerPassword is a cross-platform Electron desktop application (macOS, Windows, Linux) for deriving complex passwords from a simple master password and a site-specific key. Built with React, TypeScript, and Vite.

## Common Development Commands

```bash
# Run the app in development mode
npm run start

# Build production installers for the current platform
npm run make

# Build for specific platforms
npm run make:mac          # macOS (auto-detects arm64/x64)
npm run make:mac:arm64    # macOS ARM
npm run make:mac:x64      # macOS Intel
npm run make:win          # Windows
npm run make:linux        # Linux

# Code quality
npm run lint              # Run ESLint with auto-fix
npm run format            # Format all code with Prettier
npm run format:check      # Check formatting without fixing
```

## Architecture

The app uses Electron's security model with three separate processes:

### Main Process (`src/main/`)

- **main.ts**: Entry point. Initializes app, creates window, tray, IPC handlers, and global shortcuts
- **window.ts**: Creates and manages the main window
- **tray.ts**: System tray icon and menu
- **shortcut.ts**: Registers global keyboard shortcut (Cmd+Alt+S) to show/focus window
- **ipc.ts**: Handles IPC channel handlers for renderer-to-main communication
- **clipboard.ts**: Clipboard operations (write text, listen for changes)
- **dialog.ts**: Native dialog handlers
- **config.ts**: App configuration persistence (theme, language, form settings)
- **platform.ts**: Platform-specific behavior (macOS dock, etc.)
- **i18n.ts**: i18n initialization for main process
- **position.ts**: Window position/state persistence
- **updater.ts**: Auto-update handling

### Preload Script (`src/preload/`)

- **preload.ts**: Exposes safe IPC bridge to renderer via `window.rendererBridge`. Enables renderer process to call main process functions without direct access to Node.js APIs.

### Renderer Process (`src/renderer/`)

React UI with two main entry points:

- **index.tsx**: Renders React app to DOM
- **App.tsx**: Main component with password generation form (password input, key input, length selector, prefix/suffix inputs)
- **hooks/**: Custom hooks for form state, password generation, window events, and form settings persistence
- **styles/**: Less stylesheets (reset.less, index.less)
- **i18n.ts**: i18n configuration for UI translations
- **utils.ts**: Utility functions

### Shared Code (`src/shared/`)

- **types.d.ts**: TypeScript interfaces (AppConfig, FormSettings, RendererBridge)
- **constants.ts**: Shared constants (IPC channels, allowed URL protocols, password length limits)

### Type Definitions (`src/types/`)

Custom type definitions for dependencies without built-in types (auto-launch, psl, vite environment).

## Key Dependencies

- **flowerpassword.js**: Core password generation algorithm
- **react/react-dom**: UI framework
- **react-i18next**: Translations
- **auto-launch**: Auto-start on system boot
- **psl**: Public Suffix List for domain parsing
- **electron-forge**: Electron packaging and building
- **vite**: Build tool and dev server
- **electron**: Electron runtime

## Build System

The project uses **Electron Forge** with **Vite** plugin:

- **vite**: Build tool and dev server
- **electron**: Electron runtime

## Build System

The project uses **Electron Forge** with **Vite** plugin:

- Separate Vite configs: `vite.main.config.ts`, `vite.preload.config.ts`, `vite.renderer.config.ts`
- Build output: `.vite/build/` (configured as main entry in package.json)
- Makers for different platforms: DMG (macOS), Squirrel (Windows), Deb/RPM (Linux), Zip (all)
- Security: Fuses plugin enabled (ASAR integrity, cookie encryption, etc.)

## Development Notes

**IPC Communication**: Main-to-renderer events are sent via `ipcMain.handle()` or `mainWindow.webContents.send()`. Renderer calls are made via `window.rendererBridge`, which is exposed in the preload script and uses `ipcRenderer.invoke()` or `ipcRenderer.send()`.

**Configuration**: App config (theme, language, form settings like password length/prefix/suffix) is persisted to `~/.config/FlowerPassword/` (or platform equivalent). Uses Electron's `app.getPath('userData')` for cross-platform compatibility.

**Internationalization**: Translations defined in `public/i18n/` with support for English and Chinese. Language selection is persisted in config.

**Global Shortcut**: Cmd+Alt+S (macOS) shows/focuses the main window. Unregistered on app quit.

**Clipboard Listening**: The clipboard manager monitors system clipboard for text that looks like a domain (contains a dot), then emits it to the renderer to auto-fill the key field.

**Platform Differences**: macOS hides the dock icon and shows only the tray menu. Windows and Linux show the taskbar entry. Handled by `platformAdapter.shouldHideDock()`.
