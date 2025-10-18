# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FlowerPassword is a cross-platform desktop application (macOS, Windows, Linux) built with Electron, React 19, and TypeScript that implements a deterministic password generation system. The UI is built with modern React hooks and functional components, styled with LESS and CSS variables for automatic light/dark theme support. Users remember one "memory password" and use different "distinction codes" for each account to generate unique, strong passwords using the flowerpassword.js library.

**Platform Support:**

- **macOS**: Menubar application with tray icon support (ARM64 and x64)
- **Windows**: Desktop application with system tray support (x64 and ia32)
- **Linux**: Desktop application with system tray support (x64 and ARM64)

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

**Note**: All three processes (main, preload, renderer) are now built using **Rspack** with a unified configuration ([rspack.config.js](rspack.config.js)). This simplifies the build pipeline and uses Rspack's built-in SWC loader for fast TypeScript and TSX compilation with React automatic runtime. The renderer process bundles React, dependencies, and LESS styles into a single browser-compatible IIFE, while main and preload processes output CommonJS for Node.js.

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

Uses Prettier to format TypeScript, JavaScript, JSON, Markdown, CSS, LESS, and HTML files.

### Development Mode

```bash
# Development with hot reload (recommended)
npm run dev
```

Runs Rspack in watch mode and automatically restarts Electron when files change. This is the recommended way to develop as it provides:

- Automatic rebuild on source file changes (via Rspack watch)
- Automatic Electron restart on compiled file changes (via nodemon)
- No need to manually restart the app

```bash
# Build with watch mode only (no auto-restart)
npm run watch
```

Watches for file changes and automatically rebuilds with Rspack, but does NOT restart Electron.

### Running the App

```bash
npm start
```

Builds TypeScript once and launches the Electron app. For development with hot reload, use `npm run dev` instead.

### Building for Production

The project uses **Electron Forge** for building and packaging across all platforms:

**macOS Builds:**

```bash
# Build for Apple Silicon (ARM64) - default
npm run make

# Build for Intel (x64)
npm run make:x64

# Build for both macOS architectures
npm run make:all

# Platform-specific commands
npm run make:mac        # Current architecture
npm run make:mac:arm64  # ARM64 only
npm run make:mac:x64    # x64 only
```

**Windows Builds:**

```bash
# Build for Windows (must run on Windows or with Wine)
npm run make:win        # Current architecture
npm run make:win:x64    # 64-bit (recommended)
npm run make:win:ia32   # 32-bit
```

**Linux Builds:**

```bash
# Build for Linux (must run on Linux)
npm run make:linux        # Current architecture
npm run make:linux:x64    # x64 (most common)
npm run make:linux:arm64  # ARM64 (Raspberry Pi, etc.)
```

**Output Locations:**

- macOS: `out/make/dmg/darwin/[arch]/` - DMG installers, `out/make/zip/darwin/[arch]/` - ZIP archives
- Windows: `out/make/squirrel.windows/[arch]/` - Setup.exe installers, `out/make/zip/win32/[arch]/` - ZIP archives
- Linux: `out/make/deb/[arch]/` - .deb packages, `out/make/rpm/[arch]/` - .rpm packages, `out/make/zip/linux/[arch]/` - ZIP archives

**Icons:**

- macOS: Uses `assets/FlowerPassword.icns`
- Windows: Uses `assets/FlowerPassword.ico`
- Linux: Uses `assets/FlowerPassword.png`

**Note**: Universal binary builds for macOS are currently not supported due to code signing conflicts in Electron 38. The project builds separate ARM64 and x64 binaries instead.

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

3. GitHub Actions will automatically build and release for all platforms:
   - **macOS builds** (on macOS runner):
     - ARM64 DMG installer and ZIP archive (Apple Silicon M1/M2/M3/M4)
     - x64 DMG installer and ZIP archive (Intel)
   - **Windows builds** (on Windows runner):
     - x64 installer and portable ZIP
     - ia32 installer and portable ZIP
   - **Linux builds** (on Ubuntu runner):
     - x64 .deb, .rpm, and ZIP
     - ARM64 .deb, .rpm, and ZIP
   - Create a GitHub release with all binaries attached

You can also manually build locally for your current platform using the platform-specific commands above.

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
├── renderer/          # Renderer process (React + TypeScript)
│   ├── index.tsx      # React app entry point
│   ├── App.tsx        # Main React component with UI logic
│   ├── global.d.ts    # Global type declarations for renderer
│   ├── html/          # HTML files
│   │   └── index.html # Main UI template with React root
│   ├── styles/        # LESS stylesheets
│   │   ├── reset.less # Cross-platform normalization
│   │   └── index.less # Main styles with light/dark theme support
│   └── assets/        # Runtime assets (tray icons, dialog icons)
│       ├── Icon.png                 # Dialog icon
│       ├── IconTemplate.png         # Tray icon (1x)
│       └── IconTemplate@2x.png      # Tray icon (2x)
└── shared/            # Shared types and constants
    ├── types.ts       # Common type definitions
    └── constants.ts   # Shared constants (shortcuts, paths, UI text)

assets/                # Build-time assets (app icons)
├── FlowerPassword.icns      # macOS app icon
├── FlowerPassword.ico       # Windows app icon
└── FlowerPassword.png       # Linux app icon

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
- **src/renderer/html/index.html + dist/renderer/index.js**: Renderer process UI (React app compiled from [src/renderer/index.tsx](src/renderer/index.tsx) and [src/renderer/App.tsx](src/renderer/App.tsx))

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
- **Platform-specific window configuration**:
  - **macOS**: Fullscreen app support with `setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })` and `setAlwaysOnTop(true, 'floating')` to appear above fullscreen apps
  - **Windows/Linux**: Standard always-on-top behavior with `setAlwaysOnTop(true)` (visibleOnFullScreen option not supported)

**position.ts** - Window positioning logic:

- `calculatePositionBelowTray(tray, windowBounds)`: Pure function to calculate window position near tray icon (platform-specific)
  - **macOS**: Window appears below tray icon (top menubar), centered
  - **Windows/Linux**: Window appears above tray icon (bottom taskbar), right-aligned
- `calculatePositionAtCursor(windowBounds)`: Pure function to calculate window position at cursor with screen boundary detection
- `positionWindowBelowTray(window, tray)`: Positions window near tray icon with platform-specific behavior
- `positionWindowAtCursor(window)`: Positions window at cursor location
- All positioning logic centralized for testability and reusability

**tray.ts** - Tray icon and menu:

- Creates system tray icon with platform-specific behavior
  - **macOS**: Uses template image (adapts to dark/light mode automatically)
  - **Windows/Linux**: Uses standard icon (template image not supported)
- Handles tray click events (toggle window visibility)
- Right-click context menu (显示, 退出)
- `parseClipboardUrl()`: Extracts domain from clipboard URL
- `handleShowWindowBelowTray()`: Shows window near tray icon with clipboard parsing (position varies by platform)
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

### Renderer Process (src/renderer/)

The renderer process is built with **React 19** and modern functional components:

**index.tsx** - React app entry point:

- Mounts the React application to the DOM using `createRoot`
- Wraps app in `StrictMode` for development checks
- Handles DOM ready state checking

**App.tsx** - Main React component:

- **Modern React hooks**: Uses `useState`, `useEffect`, `useCallback`, `useMemo`, and `useRef`
- **Password generation**: Uses `flowerpassword.js` library to generate passwords from:
  - Memory password (base password to remember)
  - Key/distinction code (prefix + key + suffix)
  - Length (6-32 characters, dynamically generated options)
- **Real-time generation**: Password updates automatically as user types
- **Auto-fill from clipboard**: Receives domain via `window.electronAPI.onKeyFromClipboard` on mount
- **Autofocus**: Password input is focused automatically when window opens
- **Enter key shortcut**: Pressing Enter in key field generates and copies password, then hides window
- **Click to copy**: Clicking the generated password button copies it to clipboard and hides window
- **External links**: Opens HTTPS links in default browser via `window.electronAPI.openExternal` with URL validation
- **Type-safe React**: All props, events, and refs are properly typed with TypeScript

**Styling (styles/)**:

- **index.less**: Main application styles using LESS and CSS variables
  - Supports automatic light/dark theme switching via `prefers-color-scheme` media query
  - BEM-style class naming (`.app__header`, `.app__input`, etc.)
  - Responsive design with CSS variables for colors, spacing, and dimensions
- **reset.less**: Cross-platform CSS normalization
  - Universal box-sizing and tap behavior
  - Font stack optimized for macOS and cross-platform consistency
  - Input and button appearance normalization

**Modern features**:

- **React 19 automatic runtime**: No need to import React in component files
- **Bundled with Rspack**: React, dependencies, and LESS styles bundled into a single IIFE
- **Performance optimized**: Uses `useCallback` and `useMemo` to prevent unnecessary re-renders
- **Accessible**: Proper ARIA labels and semantic HTML

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
- `KEYBOARD_KEYS`: Keyboard key constants (e.g., `Enter`)
- `ALLOWED_URL_PROTOCOLS`: Allowed URL protocols for external links (e.g., `https:`, `http:`)

### Global Type Declarations (src/renderer/global.d.ts)

Augments the global `Window` interface to include the `electronAPI` property, providing type safety for renderer process IPC communication.

### UI Flow

1. User opens app via:
   - **Tray icon click**: Window appears near tray icon
     - **macOS**: Below tray icon (top menubar), centered
     - **Windows/Linux**: Above tray icon (bottom taskbar), right-aligned
   - **Global shortcut (`Cmd/Ctrl+Alt+S`)**: Window appears at mouse cursor position (works across all platforms)
   - **Right-click menu "显示"**: Window appears near tray icon (platform-specific positioning)
2. If clipboard contains a URL, domain is extracted and auto-filled into "Key" field
3. User enters memory password and distinction code
4. Password is generated in real-time as user types
5. User presses Enter or clicks generated password to copy and close window
6. Window auto-hides when it loses focus

**Platform-specific behaviors:**

- **macOS**: Window appears on all workspaces/Spaces including fullscreen apps. Global shortcut works seamlessly in fullscreen applications without forcing desktop switch. Window uses floating level to appear above fullscreen content.
- **Windows/Linux**: Window uses standard always-on-top behavior. Tray positioning adapts to bottom taskbar location.

### Dependencies

**Production:**

- **react**: v19.2.0+ - Modern React library for building user interfaces
- **react-dom**: v19.2.0+ - React DOM rendering
- **flowerpassword.js**: Core password generation algorithm
- **psl**: Public Suffix List parser for extracting domains
- **urlite**: Lightweight URL parser

**Development:**

- **TypeScript**: v5.9.3 for type-safe development
- **@types/react**: v19.2.2+ - React type definitions
- **@types/react-dom**: v19.2.2+ - React DOM type definitions
- **Rspack**: Fast Rust-based bundler (v1.5.8+)
- **@rspack/core**: Rspack core library
- **@rspack/cli**: Rspack CLI tool
- **less**: v4.4.2+ - LESS CSS preprocessor
- **less-loader**: v12.3.0+ - Rspack loader for LESS files
- **css-loader**: v7.1.2+ - Rspack loader for CSS files
- **style-loader**: v4.0.0+ - Injects CSS into DOM
- **nodemon**: v3.1.10+ for auto-restarting Electron during development
- **concurrently**: v9.2.1+ for running multiple npm scripts in parallel
- **@types/node**: Node.js type definitions
- **@typescript-eslint/**: TypeScript ESLint plugin and parser (v8.46.1+)
- **Prettier**: Code formatter (v3.6.2+)
- **eslint-config-prettier**: Disables conflicting ESLint rules
- **eslint-plugin-prettier**: Runs Prettier as an ESLint rule
- **@electron-forge/cli**: Electron Forge CLI for building and packaging (v7.10.2+)
- **@electron-forge/maker-zip**: ZIP maker for all platforms
- **@electron-forge/maker-squirrel**: Windows installer maker (Squirrel.Windows)
- **@electron-forge/maker-deb**: Debian/Ubuntu package maker
- **@electron-forge/maker-rpm**: RedHat/Fedora package maker
- **@electron-forge/plugin-auto-unpack-natives**: Auto-unpacks native dependencies
- **@electron-forge/plugin-fuses**: Electron Fuses for security configuration
- **@electron/fuses**: Fuses configuration library
- **electron**: v38.3.0+
- **eslint**: v9.38.0+ (using flat config format)

## Code Style

- TypeScript with strict mode enabled
- **No `any` types allowed** - all code is fully typed
- Explicit function return types required for all functions
- React functional components with TypeScript generics (`React.JSX.Element`)
- Modern React hooks (`useState`, `useEffect`, `useCallback`, `useMemo`, `useRef`)
- ESLint with TypeScript plugin for code linting
- Prettier for code formatting
- **Semicolons required**, single quotes (Prettier enforced)
- ES5 trailing commas
- 120 character line width
- 2 spaces for indentation
- LF line endings
- Comprehensive JSDoc comments for all public functions
- **All code comments MUST be written in English only** - Chinese comments are not allowed
- **LESS styles**: Use BEM naming convention (`.block__element--modifier`)
- **CSS variables**: Use CSS custom properties for themeable values (e.g., `--bg-color`, `--text-primary`)

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

The project uses GitHub Actions for automated multi-platform building and releasing:

- **Trigger**: Automatically runs when a version tag (e.g., `v3.6.4`) is pushed
- **Jobs**: Three parallel build jobs for each platform
  - `build-macos`: Runs on macOS-latest
  - `build-windows`: Runs on windows-latest
  - `build-linux`: Runs on ubuntu-latest
  - `release`: Runs after all builds complete to create the GitHub release

**Build Process:**

1. **macOS Job**:
   - Checkout code
   - Setup Node.js 20
   - Install dependencies with `npm ci`
   - Build ARM64 binary with `npm run make:mac:arm64`
   - Build x64 binary with `npm run make:mac:x64`
   - Upload artifacts

2. **Windows Job**:
   - Checkout code
   - Setup Node.js 20
   - Install dependencies with `npm ci`
   - Build x64 installer and ZIP with `npm run make:win:x64`
   - Build ia32 installer and ZIP with `npm run make:win:ia32`
   - Upload artifacts

3. **Linux Job**:
   - Checkout code
   - Setup Node.js 20
   - Install dependencies with `npm ci`
   - Build x64 packages (.deb, .rpm, .zip) with `npm run make:linux:x64`
   - Build ARM64 packages (.deb, .rpm, .zip) with `npm run make:linux:arm64`
   - Upload artifacts

4. **Release Job**:
   - Download all artifacts from the three build jobs
   - Organize and rename files with consistent naming
   - Create GitHub release with all binaries attached
   - Include platform-specific installation instructions in release notes

- **Permissions**: Requires `contents: write` permission to create releases
- **Workflow file**: [.github/workflows/release.yml](.github/workflows/release.yml)

### Electron Forge Configuration

The project uses [forge.config.js](forge.config.js) for Electron Forge configuration:

- **packagerConfig**: Cross-platform packaging options
  - `icon`: Auto-selects platform-specific icon (.icns for macOS, .ico for Windows, .png for Linux)
  - `asar`: Enabled for application bundling
  - `appBundleId`: org.xlsdg.flowerpassword
  - Excludes TypeScript source files and build artifacts

- **makers**: Platform-specific makers
  - `@electron-forge/maker-dmg`: macOS DMG installer (disk image with drag-to-install UI)
  - `@electron-forge/maker-zip`: Creates ZIP archives for all platforms
  - `@electron-forge/maker-squirrel`: Windows installer (Setup.exe)
  - `@electron-forge/maker-deb`: Debian/Ubuntu packages (.deb)
  - `@electron-forge/maker-rpm`: RedHat/Fedora packages (.rpm)

- **plugins**:
  - `auto-unpack-natives`: Automatically unpacks native dependencies
  - `fuses`: Security fuses for Electron (RunAsNode disabled, Cookie encryption enabled, etc.)

## Important Notes

- **Cross-platform application**: Supports macOS, Windows, and Linux
  - **macOS**: Menubar application with tray icon (no dock icon)
  - **Windows**: Desktop application with system tray support
  - **Linux**: Desktop application with system tray support
- All text and UI labels are in Chinese
- **React 19 with TypeScript** - Modern functional components with full type safety
- **Automatic theming**: Light/dark theme switching based on system preferences
- **TypeScript with strict typing** - no `any` types allowed
- Uses modern Electron security practices with `contextIsolation` and `contextBridge`
- **Architecture support**:
  - macOS: ARM64 (Apple Silicon) and x64 (Intel)
  - Windows: x64 and ia32
  - Linux: x64 and ARM64
- Uses Electron Forge for modern build tooling and packaging
- Modular architecture with separated concerns
- Type-safe IPC communication between processes
- **macOS-specific features**:
  - Fullscreen app support: Window appears on all workspaces/Spaces without forcing desktop switches
  - Global shortcut (`Cmd+Alt+S`) works seamlessly in fullscreen applications
  - Window appears at floating level above fullscreen content
  - Auto-hides on blur to avoid interfering with workflow
