# Migrate to Tauri Framework

## Why

The application currently uses Electron (Chromium + Node.js) which bundles a full browser runtime with each build, resulting in large application sizes (150-200MB) and higher memory consumption. Tauri offers a modern alternative using Rust backend with native system WebView, providing:

- **90% smaller bundle sizes** (5-15MB vs 150-200MB)
- **Reduced memory footprint** (uses system WebView instead of bundling Chromium)
- **Enhanced security** (Rust's memory safety + smaller attack surface)
- **Faster startup times** (no Chromium initialization overhead)
- **Native performance** for system integration (tray, shortcuts, clipboard)

Given FlowerPassword's security-focused nature (password generation, no telemetry, offline-first), Tauri's security model and minimal footprint align better with the application's core values.

## What Changes

### Architecture

- **BREAKING**: Replace Electron with Tauri framework
- **BREAKING**: Rewrite main process from TypeScript/Node.js to Rust
- **BREAKING**: Replace Electron IPC with Tauri command system
- **BREAKING**: Replace Electron Store with Tauri's store plugin
- **BREAKING**: Replace electron-forge build system with Tauri CLI

### Frontend (Minimal Changes)

- Retain React 19 + TypeScript 5 + Vite 7 for UI layer
- Update IPC calls from Electron APIs to Tauri invoke commands
- Maintain all existing UI components and styling (React + LESS)
- Implement UI interactions:
  - Password masking with hover reveal (first 2 + bullets + last 2)
  - Enter key quick generate (generate, copy, hide in one action)
  - Intelligent focus management (password field if empty, key field if password exists)
  - Real-time form settings persistence (passwordLength, prefix, suffix)
  - External link validation (https/http only)
  - Input security settings (autocomplete off, spellcheck off)

### Backend (Complete Rewrite)

- Implement Rust backend with Tauri commands for:
  - Password generation (native Rust implementation of flowerpassword.js algorithm using MD5)
  - System tray management (Tauri tray API) with quit confirmation dialog
  - Global shortcuts (Tauri global-shortcut plugin):
    - 6 pre-defined shortcut options
    - Dialog-based shortcut selection
    - Conflict detection and graceful error handling
  - Clipboard operations (Tauri clipboard plugin):
    - Auto-clear after 10 seconds (not 30)
    - "Clear only if unchanged" logic to preserve user actions
    - Domain parsing from URLs using public suffix list (psl)
  - Configuration persistence (Tauri store plugin):
    - FormSettings (passwordLength, prefix, suffix)
    - Strict validation with safe defaults
    - Support for "auto" mode in language and theme
  - Auto-launch (Tauri autostart plugin) with error handling
  - Window management (Tauri window API):
    - Fixed dimensions: 300x334px, frameless, not resizable
    - Always-on-top behavior (floating on macOS)
    - Dual positioning: below tray icon or at cursor (smart bounds checking)
    - Window blur behavior (auto-hide on focus loss)
    - Clipboard domain parsing before showing window
  - Error handling:
    - Uncaught exception handler with error dialog
    - Configuration file error recovery (missing, corrupted, write failures)
    - IPC error handling
    - Development vs production logging

### Dependencies

- Remove: electron, electron-forge, @electron/fuses, flowerpassword.js
- Add: @tauri-apps/cli, @tauri-apps/api, tauri (Rust crates), md5 crate (Rust)

## Impact

### Affected Specs

All core capabilities require specification updates:

- **password-generation**: Algorithm execution moves from Node.js to Rust native implementation (MD5-based)
- **system-tray**: Replace Electron Tray API with Tauri tray, add quit confirmation dialog
- **global-shortcuts**: Replace Electron globalShortcut with Tauri plugin, add 6 shortcut options and selection dialog
- **clipboard-management**: Replace Node.js clipboard API with Tauri plugin, 10-second auto-clear, "clear only if unchanged", domain parsing with psl
- **i18n**: React i18next remains, main process translations in Rust, support "en-US"/"zh-CN"/"zh-TW"/"auto" modes
- **configuration**: Replace electron-store with Tauri store plugin, add formSettings (passwordLength, prefix, suffix), strict validation
- **window-management**: Replace BrowserWindow API with Tauri Window API, 300x334px fixed dimensions, dual positioning strategies, always-on-top, blur behavior
- **startup-integration**: Replace auto-launch with Tauri autostart plugin, add error handling
- **update-checker**: Manual update checker that queries GitHub Releases API and opens download page in browser
- **ui-interactions**: Password masking with hover reveal, Enter key quick generate, focus management, real-time persistence, link validation
- **error-handling**: Uncaught exception handler, quit confirmation, configuration validation and recovery, IPC error handling, dev/prod logging

### Affected Code

- `src/main/**/*` - **Complete rewrite** in Rust (src-tauri/)
- `src/preload/**/*` - **Removed** (Tauri uses different IPC model)
- `src/renderer/**/*` - **Minor updates** (API calls only, remove flowerpassword.js import)
- `src/shared/**/*` - Review for Rust/TypeScript equivalents
- `flowerpassword.js` dependency - **Replaced** with native Rust implementation
- Build configuration - **Complete replacement**
- Package scripts - Update for Tauri CLI commands

### Breaking Changes

- **Development workflow**: New Rust toolchain requirement (rustc, cargo)
- **Build process**: Different platform build commands and configuration
- **Distribution**: Tauri-generated installers (DMG, MSI, AppImage, deb, rpm)
- **Code signing**: Different approach for macOS/Windows signatures
- **Update mechanism**: Manual update checker (same as current Electron version) - queries GitHub Releases API, shows dialog, opens release page in browser

### Migration Risks

- **Algorithm compatibility**: Must verify Rust MD5 implementation produces byte-for-byte identical outputs to flowerpassword.js
- **Platform parity**: Ensure system tray, shortcuts, and auto-launch work on all platforms (macOS, Windows, Linux)
- **Development complexity**: Team needs Rust knowledge for backend maintenance
- **Plugin ecosystem**: Tauri is younger; some Electron features may require custom implementations

### Algorithm Implementation Details

The flowerpassword.js algorithm will be ported to native Rust using MD5 hashing:

1. **Algorithm**: MD5-based password derivation with character transformation rules
2. **Rust crate**: `md5` crate (or `md-5` for RustCrypto implementation)
3. **Compatibility testing**: Comprehensive test suite with 100+ known input/output pairs
4. **Magic string**: `sunlovesnow1990090127xykab` (transformation pattern constant)
5. **Fixed salts**: "kise" and "snow" for rule and source hash generation

### Benefits

- **User experience**: 90% smaller downloads, faster launches, lower memory usage
- **Security**: Rust memory safety, reduced attack surface, no Node.js runtime exposure
- **Performance**: Native system integration without JavaScript overhead
- **Maintainability**: Clearer separation between frontend (React/TS) and backend (Rust)
- **Future-proof**: Modern architecture aligned with native app trends

### Timeline Estimate

- Prototype phase (Rust backend + basic IPC): 2-3 weeks
- Full implementation (all features parity): 6-8 weeks
- Testing and refinement (cross-platform validation): 2-3 weeks
- **Total**: 10-14 weeks for production-ready release
