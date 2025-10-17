# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FlowerPassword is a macOS menubar application built with Electron that implements a deterministic password generation system. Users remember one "memory password" and use different "distinction codes" for each account to generate unique, strong passwords using the flowerpassword.js library.

## Development Commands

### Linting

```bash
npm test
```

Uses StandardJS for code linting. Ignores `FlowerPassword.app/**` directory.

### Running the App

```bash
npm start
```

Launches the Electron app in development mode.

### Building for Production

```bash
npm run build
```

Packages the app for macOS (darwin/x64) using electron-packager. Output goes to `dist/` directory. Uses `images/FlowerPassword.icns` as the app icon.

### Publishing a Release

```bash
make publish
```

This command:

1. Cleans up `dist/` and `FlowerPassword.zip`
2. Runs `npm run build`
3. Creates a properly compressed zip using `ditto` (macOS's Finder-compatible compression)
4. Publishes the release to GitHub (requires `$TOKEN` environment variable)

Version bump commands:

- `npm run release:major` - Major version bump
- `npm run release:minor` - Minor version bump
- `npm run release:patch` - Patch version bump

## Architecture

### Entry Point

- **app.js**: Main Electron process that creates the menubar application using the `menubar` package
- **index.html + index.js**: Renderer process containing the UI and password generation logic

### Key Components

#### Main Process (app.js)

- **menubar instance**: Creates a menubar app with a 300x334 window that appears on the menubar
- **IPC handlers**: Listens for `show`, `hide`, `quit`, and `confirmQuit` events from renderer
- **Global shortcut**: Registers `Cmd+Alt+S` to show the app window
- **Clipboard integration**: On window show, reads clipboard and attempts to extract domain from URLs using `urlite` and `psl` (Public Suffix List)
- **Context menu**: Right-click on tray icon shows "Show" and "Quit" options
- **Environment handling**: Uses `fix-path` and `user-env` to ensure proper PATH on macOS

#### Renderer Process (index.js)

- **Password generation**: Uses `flowerpassword.js` library to generate passwords from:
  - Memory password (base password to remember)
  - Key/distinction code (prefix + key + suffix)
  - Length (6-32 characters)
- **Auto-fill from clipboard**: Receives domain via IPC (`key-from-clipboard` event) and populates the key field
- **Enter key shortcut**: Pressing Enter in key field generates and copies password, then hides window
- **Click to copy**: Clicking the generated password button copies it to clipboard and hides window

#### UI Flow

1. User opens app via menubar icon or global shortcut `Cmd+Alt+S`
2. If clipboard contains a URL, domain is extracted and auto-filled into "Key" field
3. User enters memory password and distinction code
4. Password is generated in real-time as user types
5. User presses Enter or clicks generated password to copy and close window

### Dependencies

- **menubar**: Creates the menubar application
- **flowerpassword.js**: Core password generation algorithm
- **psl**: Public Suffix List parser for extracting domains
- **urlite**: Lightweight URL parser
- **fix-path**: Fixes PATH on macOS for spawned processes
- **user-env**: Gets current user's environment variables

## Code Style

- Uses StandardJS code style (enforced via `npm test`)
- Node.js style with CommonJS modules
- No semicolons (StandardJS convention)

## Important Notes

- This is a macOS-only application (darwin platform)
- The app runs in the menubar with no dock icon (`showDockIcon: false`)
- All text and UI labels are in Chinese
- NodeIntegration is enabled in webPreferences (legacy Electron approach)
- The app window is not resizable
