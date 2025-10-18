# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FlowerPassword is a macOS menubar application built with Electron and TypeScript that implements a deterministic password generation system. Users remember one "memory password" and use different "distinction codes" for each account to generate unique, strong passwords using the flowerpassword.js library.

## Development Commands

### Install Dependencies

```bash
npm install
```

### Building TypeScript

Build all processes (main, preload, renderer) with Rspack:

```bash
npm run build
```

**Note**: All three processes (main, preload, renderer) are now built using **Rspack** with a unified configuration ([rspack.config.js](rspack.config.js)). This simplifies the build pipeline and uses Rspack's built-in SWC loader for fast TypeScript compilation. The renderer process bundles dependencies into a browser-compatible IIFE format, while main and preload processes output CommonJS for Node.js.

### Linting

```bash
npm run lint
```

Uses ESLint with TypeScript support for code linting. Ignores `dist/`, `out/`, `FlowerPassword.app/**` and `node_modules/` directories.

### Code Formatting

```bash
# Format all files
npm run format

# Check formatting without modifying files
npm run format:check
```

Uses Prettier to format TypeScript, JavaScript, JSON, Markdown, CSS, and HTML files.

### Development Mode

```bash
# Build with watch mode (auto-rebuild on changes)
npm run watch
```

Watches for file changes and automatically rebuilds with Rspack.

### Running the App

```bash
npm start
```

Automatically builds TypeScript and launches the Electron app in development mode.

### Building for Production

The project uses **Electron Forge** for building and packaging:

```bash
# Build for Apple Silicon (ARM64) - default
npm run make

# Build for Intel (x64)
npm run make:x64

# Build for both architectures
npm run make:all
```

Output goes to `out/make/zip/darwin/[arch]/` directory. Uses `src/renderer/assets/FlowerPassword.icns` as the app icon.

**Note**: Universal binary builds are currently not supported due to code signing conflicts in Electron 38. The project builds separate ARM64 and x64 binaries instead.

### Publishing a Release

Releases are automatically published via GitHub Actions when you push a version tag:

1. Update version in package.json:

```bash
npm version [major|minor|patch]
```

2. Push the version tag:

```bash
git push && git push --tags
```

3. GitHub Actions will automatically:
   - Build ARM64 binary (Apple Silicon)
   - Build x64 binary (Intel)
   - Create FlowerPassword-arm64.zip and FlowerPassword-x64.zip
   - Create a GitHub release with both zip files attached

You can also manually build locally with `npm run make:all`.

## Architecture

### Project Structure

The project follows modern Electron best practices with a modular TypeScript structure:

```
src/
├── main/              # Main process (TypeScript)
│   ├── main.ts        # Application entry point
│   ├── window.ts      # Window management
│   ├── tray.ts        # Tray icon and menu management
│   ├── menu.ts        # Application menu and shortcuts
│   ├── position.ts    # Window positioning logic
│   └── ipc.ts         # IPC message handlers
├── preload/           # Preload scripts (TypeScript)
│   └── index.ts       # Context bridge API exposure
├── renderer/          # Renderer process
│   ├── index.ts       # UI logic and password generation (TypeScript)
│   ├── global.d.ts    # Global type declarations for renderer
│   ├── html/          # HTML files
│   │   └── index.html # Main UI template
│   ├── css/           # Stylesheets
│   │   ├── reset.css  # CSS reset
│   │   └── index.css  # Main styles
│   └── assets/        # Static assets
│       ├── FlowerPassword.icns      # App icon for packaging
│       ├── Icon.png                 # Dialog icon
│       ├── IconTemplate.png         # Tray icon (1x)
│       └── IconTemplate@2x.png      # Tray icon (2x)
└── shared/            # Shared types and constants
    ├── types.ts       # Common type definitions
    └── constants.ts   # Shared constants (shortcuts, paths, UI text)

dist/                  # Compiled JavaScript output
├── main/
├── preload/
└── renderer/
```

### TypeScript Configuration

The project uses a single unified TypeScript configuration:

- **tsconfig.json**: Single configuration for all processes (main, preload, renderer)
  - Includes all source files (`src/**/*`)
  - Module: `ESNext` with `moduleResolution: bundler`
  - `noEmit: true` (Rspack handles compilation)
  - Strict type checking enabled
  - Full DOM types available for renderer process

**Note**: TypeScript is used only for type checking and editor support. All compilation is handled by Rspack's built-in SWC loader, eliminating the need for separate `tsc` builds.

### Modern Electron Security Architecture

This project uses Electron's modern security best practices:

- **contextIsolation**: Enabled to isolate preload scripts from renderer
- **nodeIntegration**: Disabled to prevent direct Node.js access in renderer
- **sandbox**: Disabled only where necessary for specific functionality
- **preload script**: Uses `contextBridge` to safely expose APIs to renderer
- **TypeScript**: Full type safety across all processes

### Entry Points

- **dist/main/main.js**: Main Electron process (compiled from [src/main/main.ts](src/main/main.ts))
- **dist/preload/index.js**: Preload script (compiled from [src/preload/index.ts](src/preload/index.ts))
- **src/renderer/html/index.html + dist/renderer/index.js**: Renderer process UI

### Main Process (src/main/)

Modular architecture with separated concerns:

**main.ts** - Application lifecycle:

- Error handling
- App initialization
- Event listeners
- macOS dock hiding

**window.ts** - Window management:

- Creates and manages the main BrowserWindow
- Handles window show/hide/toggle
- Provides window position and bounds getters
- Exposes `showWindowAtCursor()` for displaying window at mouse position
- Communication with renderer process

**position.ts** - Window positioning logic:

- `calculatePositionBelowTray(tray, windowBounds)`: Pure function to calculate window position below tray icon
- `calculatePositionAtCursor(windowBounds)`: Pure function to calculate window position at cursor with screen boundary detection
- `positionWindowBelowTray(window, tray)`: Positions window below tray icon
- `positionWindowAtCursor(window)`: Positions window at cursor location
- All positioning logic centralized for testability and reusability

**tray.ts** - Tray icon and menu:

- Creates system tray icon
- Handles tray click events (toggle window visibility)
- Right-click context menu (显示, 退出)
- `parseClipboardUrl()`: Extracts domain from clipboard URL
- `handleShowWindowBelowTray()`: Shows window below tray icon with clipboard parsing
- `handleShowWindowAtCursor()`: Shows window at cursor position with clipboard parsing
- Quit confirmation dialog

**menu.ts** - Application menu:

- Creates Edit menu (Undo, Redo, Cut, Copy, Paste, Select All)
- Registers global shortcut (`Cmd+Alt+S`) that triggers `handleShowWindowAtCursor()`
- Shortcut cleanup on quit

**ipc.ts** - IPC handlers:

- `hide`: Hides window
- `quit`: Shows confirmation dialog then quits
- `clipboard:writeText`: Writes text to clipboard
- `shell:openExternal`: Opens URLs in default browser

### Preload Script (src/preload/index.ts)

Safely exposes APIs using `contextBridge.exposeInMainWorld`:

```typescript
window.electronAPI = {
  hide: () => void
  quit: () => void
  writeText: (text: string) => Promise<void>
  openExternal: (url: string) => Promise<void>
  onKeyFromClipboard: (callback: (value: string) => void) => void
}
```

This prevents direct access to `ipcRenderer` and other Electron internals from the renderer process.

### Renderer Process (src/renderer/index.ts)

- **Modern ES module imports**: Uses standard `import { fpCode } from 'flowerpassword.js'` syntax
- **Bundled with Rspack**: All dependencies bundled into a single IIFE for browser compatibility
- **Password generation**: Uses `flowerpassword.js` library to generate passwords from:
  - Memory password (base password to remember)
  - Key/distinction code (prefix + key + suffix)
  - Length (6-32 characters)
- **Auto-fill from clipboard**: Receives domain via `window.electronAPI.onKeyFromClipboard`
- **Enter key shortcut**: Pressing Enter in key field generates and copies password, then hides window
- **Click to copy**: Clicking the generated password button copies it to clipboard and hides window
- **External links**: Opens HTTPS links in default browser via `window.electronAPI.openExternal`
- **Type-safe DOM manipulation**: All DOM elements are properly typed

### Shared Types and Constants (src/shared/)

**types.ts** - Centralized type definitions:

- ElectronAPI interface
- IPC channel constants
- Window and tray configuration
- URL parsing results

**constants.ts** - Shared constants across processes:

- `GLOBAL_SHORTCUTS`: Global keyboard shortcuts (e.g., `Cmd+Alt+S`)
- `ASSETS_PATH`: Asset file paths for tray icon and dialog icon
- `DIALOG_TEXTS`: Text constants for dialogs and tray menu (in Chinese)
- `UI_TEXTS`: UI text constants for renderer process
- `DOM_IDS`: DOM element IDs for type-safe element selection
- `KEYBOARD_KEYS`: Keyboard key constants
- `ALLOWED_URL_PROTOCOLS`: Allowed URL protocols for external links

### Global Type Declarations (src/renderer/global.d.ts)

Extends the global `Window` interface to include the `electronAPI` property, providing type safety for renderer process IPC communication.

### UI Flow

1. User opens app via:
   - **Menubar icon click**: Window appears below tray icon
   - **Global shortcut (`Cmd+Alt+S`)**: Window appears at mouse cursor position
   - **Right-click menu "显示"**: Window appears below tray icon
2. If clipboard contains a URL, domain is extracted and auto-filled into "Key" field
3. User enters memory password and distinction code
4. Password is generated in real-time as user types
5. User presses Enter or clicks generated password to copy and close window
6. Window auto-hides when it loses focus

### Dependencies

**Production:**

- **flowerpassword.js**: Core password generation algorithm
- **psl**: Public Suffix List parser for extracting domains
- **urlite**: Lightweight URL parser

**Development:**

- **TypeScript**: v5.9.3 for type-safe development
- **Rspack**: Fast Rust-based bundler (v1.5.8+)
- **@rspack/core**: Rspack core library
- **@rspack/cli**: Rspack CLI tool
- **@types/node**: Node.js type definitions
- **@typescript-eslint/**: TypeScript ESLint plugin and parser (v8.46.1+)
- **Prettier**: Code formatter (v3.6.2+)
- **eslint-config-prettier**: Disables conflicting ESLint rules
- **eslint-plugin-prettier**: Runs Prettier as an ESLint rule
- **@electron-forge/cli**: Electron Forge CLI for building and packaging (v7.10.2+)
- **@electron-forge/maker-zip**: ZIP maker for macOS distributables
- **@electron-forge/plugin-auto-unpack-natives**: Auto-unpacks native dependencies
- **@electron-forge/plugin-fuses**: Electron Fuses for security configuration
- **@electron/fuses**: Fuses configuration library
- **electron**: v38.3.0+
- **eslint**: v9.37.0+ (using flat config format)

## Code Style

- TypeScript with strict mode enabled
- **No `any` types allowed** - all code is fully typed
- Explicit function return types required
- ESLint with TypeScript plugin for code linting
- Prettier for code formatting
- **Semicolons required**, single quotes (Prettier enforced)
- ES5 trailing commas
- 120 character line width
- 2 spaces for indentation
- LF line endings
- Comprehensive JSDoc comments for all public functions
- **All code comments MUST be written in English only** - Chinese comments are not allowed

### ESLint Configuration

The project uses ESLint v9+ with the new **flat config format** in [eslint.config.js](eslint.config.js):

**Key features:**

- Separate configurations for JavaScript and TypeScript files
- Global ignores for `dist/`, `out/`, `FlowerPassword.app/**`, `node_modules/**`, and `**/*.d.ts`
- TypeScript-specific rules with type-aware linting

**Key ESLint rules:**

- `@typescript-eslint/no-unused-vars`: Error (with `_` prefix exception for unused parameters)
- `@typescript-eslint/explicit-function-return-type`: Error (all functions must have explicit return types)
- `@typescript-eslint/no-explicit-any`: Error (no `any` types allowed)
- `@typescript-eslint/no-floating-promises`: Error (all Promises must be handled)
- `@typescript-eslint/await-thenable`: Error (only await on Promises)
- `@typescript-eslint/no-misused-promises`: Error (prevent Promise misuse)
- `@typescript-eslint/strict-boolean-expressions`: Off (allows flexible boolean expressions)
- `no-console`: Warning (only `console.warn` and `console.error` allowed)
- `prettier/prettier`: Error (Prettier formatting enforced through ESLint)

### Prettier Configuration

Configured in [.prettierrc.json](.prettierrc.json):

- `semi`: true (semicolons required)
- `singleQuote`: true (single quotes)
- `trailingComma`: "es5" (trailing commas where valid in ES5)
- `printWidth`: 120 (max line width)
- `tabWidth`: 2 (2 spaces per indentation level)
- `useTabs`: false (spaces, not tabs)
- `arrowParens`: "avoid" (omit parens when possible for arrow functions)
- `endOfLine`: "lf" (Unix-style line endings)
- `bracketSpacing`: true (spaces inside object literals)
- `quoteProps`: "consistent" (consistent quote style for object properties)
- `jsxSingleQuote`: false (double quotes in JSX)
- `htmlWhitespaceSensitivity`: "css" (respect CSS display property)
- `proseWrap`: "preserve" (preserve markdown/prose wrapping)

## CI/CD

### GitHub Actions Workflow

The project uses GitHub Actions for automated building and releasing:

- **Trigger**: Automatically runs when a version tag (e.g., `v3.6.4`) is pushed
- **Runner**: macOS-latest (required for building macOS apps)
- **Build process**:
  1. Checkout code
  2. Setup Node.js 20
  3. Install dependencies with `npm ci`
  4. Build ARM64 binary with `npm run make`
  5. Build x64 binary with `npm run make:x64`
  6. Rename and organize zip files
  7. Create GitHub release with both zip files attached

- **Permissions**: Requires `contents: write` permission to create releases
- **Workflow file**: [.github/workflows/release.yml](.github/workflows/release.yml)

### Electron Forge Configuration

The project uses [forge.config.js](forge.config.js) for Electron Forge configuration:

- **packagerConfig**: Basic packaging options (asar, icon, app bundle ID)
  - Excludes TypeScript source files and build artifacts
- **makers**: Only ZIP maker for macOS (removed Windows/Linux makers)
- **plugins**:
  - `auto-unpack-natives`: Automatically unpacks native dependencies
  - `fuses`: Security fuses for Electron (RunAsNode disabled, Cookie encryption enabled, etc.)

## Important Notes

- This is a macOS-only application (darwin platform)
- The app runs in the menubar with no dock icon
- All text and UI labels are in Chinese
- **TypeScript with strict typing** - no `any` types allowed
- Uses modern Electron security practices with `contextIsolation` and `contextBridge`
- Supports both Intel (x64) and Apple Silicon (arm64) architectures with separate builds
- Uses Electron Forge for modern build tooling and packaging
- Modular architecture with separated concerns
- Type-safe IPC communication between processes
