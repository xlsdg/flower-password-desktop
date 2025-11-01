# Implementation Tasks

## 1. Project Setup

- [ ] 1.1 Install Rust toolchain (rustc, cargo) on development machine
- [ ] 1.2 Initialize Tauri project: `npm create tauri-app` or manual setup
- [ ] 1.3 Create src-tauri/ directory structure
- [ ] 1.4 Configure Cargo.toml with required dependencies (tauri, serde, serde_json, etc.)
- [ ] 1.5 Configure tauri.conf.json (app identifier, window settings, permissions)
- [ ] 1.6 Update package.json scripts for Tauri CLI commands
- [ ] 1.7 Copy app icons to src-tauri/icons/
- [ ] 1.8 Configure Vite for Tauri integration

## 2. Password Generation (Core Functionality)

- [ ] 2.1 Add md5 crate dependency to Cargo.toml (version 0.7 or md-5 0.10)
- [ ] 2.2 Create src-tauri/src/password.rs module with MD5 helper functions
- [ ] 2.3 Implement core algorithm: base hash, rule hash, source hash generation
- [ ] 2.4 Implement character transformation logic using magic string "sunlovesnow1990090127xykab"
- [ ] 2.5 Implement first character enforcement (ensure letter, not digit)
- [ ] 2.6 Implement length validation (2-32 characters)
- [ ] 2.7 Create `generate_password` Tauri command wrapper
- [ ] 2.8 Add command to src-tauri/src/main.rs
- [ ] 2.9 Update frontend to use `invoke('generate_password', ...)` and remove flowerpassword.js import
- [ ] 2.10 Write comprehensive test suite with 100+ test cases from JavaScript implementation
- [ ] 2.11 Verify byte-for-byte identical output for all test cases
- [ ] 2.12 Add unit tests for each algorithm step (base hash, rule hash, source hash, transformation)

## 3. Configuration Management

- [ ] 3.1 Add tauri-plugin-store dependency to Cargo.toml
- [ ] 3.2 Implement src-tauri/src/config.rs module
- [ ] 3.3 Define Config struct (language, shortcut, auto-launch, theme, formSettings)
- [ ] 3.4 Implement formSettings struct (passwordLength, prefix, suffix)
- [ ] 3.5 Implement configuration validation functions for all fields
- [ ] 3.6 Validate language: "en-US", "zh-CN", "zh-TW", "auto" (default: "auto")
- [ ] 3.7 Validate theme: "light", "dark", "auto" (default: "auto")
- [ ] 3.8 Validate passwordLength: 6-32 integer (default: 16)
- [ ] 3.9 Validate globalShortcut: one of 6 available shortcuts
- [ ] 3.10 Implement `get_config()` Tauri command
- [ ] 3.11 Implement `set_config(config)` Tauri command
- [ ] 3.12 Implement `update_form_settings(settings)` Tauri command
- [ ] 3.13 Handle corrupted config file (use defaults, overwrite)
- [ ] 3.14 Handle missing config file (create with defaults)
- [ ] 3.15 Handle write failures (log error, continue with in-memory config)
- [ ] 3.16 Update frontend to use Tauri store APIs
- [ ] 3.17 Test config persistence across app restarts
- [ ] 3.18 Verify Tauri and Electron configs use separate directories (no migration)

## 4. Clipboard Management

- [ ] 4.1 Add tauri-plugin-clipboard dependency
- [ ] 4.2 Implement src-tauri/src/clipboard.rs module
- [ ] 4.3 Implement `copy_to_clipboard(text)` command
- [ ] 4.4 Store copied text value for comparison
- [ ] 4.5 Implement `clear_clipboard()` command
- [ ] 4.6 Add clipboard auto-clear timer (Tokio async task, 10 seconds = 10000ms)
- [ ] 4.7 Implement "clear only if unchanged" logic (read clipboard, compare with stored value)
- [ ] 4.8 If clipboard content changed, skip clearing (user copied something else)
- [ ] 4.9 Update frontend clipboard calls
- [ ] 4.10 Test clipboard auto-clear (10 second timeout) on all platforms
- [ ] 4.11 Test "clear only if unchanged" behavior

## 5. System Tray Integration

- [ ] 5.1 Implement src-tauri/src/tray.rs module
- [ ] 5.2 Create tray menu with items (Show, Settings, Check for Updates, Quit)
- [ ] 5.3 Add localized menu items (support en-US, zh-CN, zh-TW)
- [ ] 5.4 Implement tray icon click handlers:
  - [ ] 5.4.1 Left-click: toggle window visibility (all platforms)
  - [ ] 5.4.2 Right-click: show context menu (Windows/Linux)
  - [ ] 5.4.3 macOS: single click shows menu (macOS convention)
- [ ] 5.5 Handle platform-specific icon formats:
  - [ ] 5.5.1 macOS: Use Mono.png/Mono@2x.png, set as template icon (auto-inverts in dark mode)
  - [ ] 5.5.2 Windows: Use Color.png (16x16 and 32x32 for high DPI)
  - [ ] 5.5.3 Linux: Use Mono.png (22x22 or 24x24 standard)
- [ ] 5.6 Ensure tray behavior matches Electron version exactly
- [ ] 5.7 Test tray menu on macOS, Windows, Linux
- [ ] 5.8 Verify tray icon visibility in dark/light modes
- [ ] 5.9 Verify "Quit" menu shows confirmation dialog (matches Electron)

## 6. Window Management

- [ ] 6.1 Implement src-tauri/src/window.rs module
- [ ] 6.2 Configure window properties in tauri.conf.json:
  - [ ] 6.2.1 Set dimensions: 300x334 pixels (exact match to Electron)
  - [ ] 6.2.2 Set frameless: true (no title bar)
  - [ ] 6.2.3 Set resizable: false (fixed size)
  - [ ] 6.2.4 Set skipTaskbar: true (exclude from taskbar)
  - [ ] 6.2.5 Set visible: false (starts hidden in tray)
- [ ] 6.3 Implement show/hide window functions
- [ ] 6.4 Implement always-on-top behavior:
  - [ ] 6.4.1 On macOS: setAlwaysOnTop with 'floating' level
  - [ ] 6.4.2 Set visibleOnAllWorkspaces: true
  - [ ] 6.4.3 Set visibleOnFullScreen: true (macOS)
- [ ] 6.5 Implement window blur event handler:
  - [ ] 6.5.1 Auto-hide window on focus loss
  - [ ] 6.5.2 Exception: keep visible if DevTools are open
- [ ] 6.6 Implement window positioning strategies:
  - [ ] 6.6.1 Position below tray icon algorithm
  - [ ] 6.6.2 macOS: center horizontally below tray, top edge at tray bottom
  - [ ] 6.6.3 Windows/Linux: right edge aligned with tray right, bottom edge at tray top
  - [ ] 6.6.4 Position at cursor algorithm
  - [ ] 6.6.5 Smart bounds checking (keep window fully on screen)
  - [ ] 6.6.6 Adjust for workArea bounds (respect taskbar/dock)
- [ ] 6.7 Implement clipboard domain parsing:
  - [ ] 6.7.1 Add psl (public suffix list) crate dependency
  - [ ] 6.7.2 Read clipboard before showing window
  - [ ] 6.7.3 Parse URL if clipboard contains http/https
  - [ ] 6.7.4 Extract second-level domain (SLD) using psl
  - [ ] 6.7.5 Send KEY_FROM_CLIPBOARD IPC event with SLD
  - [ ] 6.7.6 Handle invalid clipboard content gracefully
- [ ] 6.8 Implement focus management:
  - [ ] 6.8.1 Add WINDOW_SHOWN IPC event
  - [ ] 6.8.2 Frontend: focus password field if empty
  - [ ] 6.8.3 Frontend: focus and select key field if password exists
- [ ] 6.9 Implement window close/hide command (IPC command for UI close button)
- [ ] 6.10 Handle window close event (hide instead of quit)
- [ ] 6.11 Test window behavior on multi-monitor setups
- [ ] 6.12 Verify no dock icon on macOS (app.dock.hide() or LSUIElement in Info.plist)
- [ ] 6.13 Test positioning algorithms on all platforms

## 7. Global Shortcuts

- [ ] 7.1 Add tauri-plugin-global-shortcut dependency
- [ ] 7.2 Implement src-tauri/src/shortcut.rs module
- [ ] 7.3 Define 6 available shortcuts:
  - [ ] 7.3.1 CmdOrCtrl+Alt+S (default)
  - [ ] 7.3.2 CmdOrCtrl+Shift+S
  - [ ] 7.3.3 CmdOrCtrl+Alt+P
  - [ ] 7.3.4 CmdOrCtrl+Shift+P
  - [ ] 7.3.5 CmdOrCtrl+Alt+F
  - [ ] 7.3.6 CmdOrCtrl+Shift+F
- [ ] 7.4 Implement `register_global_shortcut(shortcut)` command
- [ ] 7.5 Implement `unregister_global_shortcut()` command
- [ ] 7.6 Implement `set_global_shortcut(shortcut)` command (unregister old, register new)
- [ ] 7.7 Implement shortcut selection dialog:
  - [ ] 7.7.1 Add "Global Shortcut" to tray menu
  - [ ] 7.7.2 Display dialog with current shortcut message
  - [ ] 7.7.3 Show alternative shortcuts as buttons (excluding current)
  - [ ] 7.7.4 Add "Cancel" button
  - [ ] 7.7.5 On button click: unregister old, register new, save to config
- [ ] 7.8 Handle shortcut conflicts:
  - [ ] 7.8.1 Detect registration errors from Tauri plugin
  - [ ] 7.8.2 Display error dialog to user
  - [ ] 7.8.3 Log error to console
  - [ ] 7.8.4 Allow user to choose alternative shortcut
- [ ] 7.9 Handle default shortcut conflict on startup (continue without shortcut)
- [ ] 7.10 Update frontend settings to configure shortcut
- [ ] 7.11 Test shortcut registration on all platforms
- [ ] 7.12 Test platform-specific modifier keys (Cmd on macOS, Ctrl on Windows/Linux)

## 8. Auto-Launch Integration

- [ ] 8.1 Add tauri-plugin-autostart dependency
- [ ] 8.2 Implement src-tauri/src/autostart.rs module
- [ ] 8.3 Implement `enable_auto_launch()` command
- [ ] 8.4 Implement `disable_auto_launch()` command
- [ ] 8.5 Implement `is_auto_launch_enabled()` query
- [ ] 8.6 Update frontend settings toggle
- [ ] 8.7 Test auto-launch on macOS, Windows, Linux
- [ ] 8.8 Verify permissions and user prompts on macOS

## 9. Multi-Language Support

- [ ] 9.1 Create src-tauri/locales/ directory with JSON files (en-US.json, zh-CN.json, zh-TW.json)
- [ ] 9.2 Implement src-tauri/src/i18n.rs module for backend translations
- [ ] 9.3 Implement system locale detection:
  - [ ] 9.3.1 Detect system locale on first launch
  - [ ] 9.3.2 Map Chinese variants to zh-CN or zh-TW
  - [ ] 9.3.3 Default to en-US for other languages
- [ ] 9.4 Implement `get_locale()` command
- [ ] 9.5 Implement `set_locale(locale)` command
- [ ] 9.6 Support "auto" mode:
  - [ ] 9.6.1 When locale is "auto", detect system locale
  - [ ] 9.6.2 Re-detect when system locale changes
- [ ] 9.7 Update tray menu to use translated strings
- [ ] 9.8 Keep frontend react-i18next unchanged
- [ ] 9.9 Test language switching without restart
- [ ] 9.10 Verify system locale detection on first launch
- [ ] 9.11 Test "auto" mode behavior across locale changes

## 10. Frontend Updates

- [ ] 10.1 Install @tauri-apps/api dependency
- [ ] 10.2 Remove electron and electron-forge dependencies
- [ ] 10.3 Update all IPC calls from window.api to invoke()
- [ ] 10.4 Update store access from electron-store to Tauri store
- [ ] 10.5 Update clipboard calls to Tauri commands
- [ ] 10.6 Update shortcut registration calls
- [ ] 10.7 Test all frontend interactions
- [ ] 10.8 Verify no Electron APIs remain in code

## 11. UI Interactions and User Experience

- [ ] 11.1 Implement password masking:
  - [ ] 11.1.1 Create maskPassword function (if length <= 4: all bullets, else: first 2 + bullets + last 2)
  - [ ] 11.1.2 Display masked password on generate button by default
  - [ ] 11.1.3 Add mouse hover event listener to button
  - [ ] 11.1.4 Reveal full password on hover
  - [ ] 11.1.5 Re-mask password on mouse leave
- [ ] 11.2 Implement Enter key quick generate:
  - [ ] 11.2.1 Add keydown event listener to password input field
  - [ ] 11.2.2 Add keydown event listener to key input field
  - [ ] 11.2.3 On Enter: check both fields have values
  - [ ] 11.2.4 Generate password, copy to clipboard, hide window immediately
- [ ] 11.3 Implement password length selection:
  - [ ] 11.3.1 Create dropdown with options 6-32
  - [ ] 11.3.2 Default to 16 characters
  - [ ] 11.3.3 On change: update password generation immediately
  - [ ] 11.3.4 Persist to config via UPDATE_FORM_SETTINGS
- [ ] 11.4 Implement prefix and suffix fields:
  - [ ] 11.4.1 Add prefix input field
  - [ ] 11.4.2 Add suffix input field
  - [ ] 11.4.3 Combine as: prefix + key + suffix for password generation
  - [ ] 11.4.4 Persist on each keystroke via UPDATE_FORM_SETTINGS
- [ ] 11.5 Implement real-time form settings persistence:
  - [ ] 11.5.1 Save passwordLength immediately on change
  - [ ] 11.5.2 Save prefix immediately on change
  - [ ] 11.5.3 Save suffix immediately on change
  - [ ] 11.5.4 Verify persistence across app restarts
- [ ] 11.6 Implement generate button click action:
  - [ ] 11.6.1 Check password and key fields are not empty
  - [ ] 11.6.2 Copy generated password to clipboard
  - [ ] 11.6.3 Hide window immediately after copy
- [ ] 11.7 Implement external link handling:
  - [ ] 11.7.1 Validate URL protocol (https:// or http:// only)
  - [ ] 11.7.2 Reject invalid protocols (file://, javascript:, etc.)
  - [ ] 11.7.3 Open valid links in external browser
  - [ ] 11.7.4 Log error for invalid protocols
- [ ] 11.8 Configure input field security:
  - [ ] 11.8.1 Set autocomplete="off" on all input fields
  - [ ] 11.8.2 Set spellcheck="false" on all input fields
  - [ ] 11.8.3 Set type="password" on password input field
- [ ] 11.9 Implement theme reactive UI:
  - [ ] 11.9.1 Listen for THEME_CHANGED IPC event
  - [ ] 11.9.2 Update theme state in React component
  - [ ] 11.9.3 Apply new theme via CSS immediately
- [ ] 11.10 Implement language reactive UI:
  - [ ] 11.10.1 Listen for LANGUAGE_CHANGED IPC event
  - [ ] 11.10.2 Update language state in React component
  - [ ] 11.10.3 Reload i18next translations
- [ ] 11.11 Implement focus management:
  - [ ] 11.11.1 Listen for WINDOW_SHOWN IPC event
  - [ ] 11.11.2 If password field empty: focus password field
  - [ ] 11.11.3 If password field has value: focus and select key field

## 12. Error Handling and Robustness

- [ ] 12.1 Implement uncaught exception handler:
  - [ ] 12.1.1 Add global error handler in main.rs
  - [ ] 12.1.2 Display error dialog with message and stack trace
  - [ ] 12.1.3 Dialog type: "error", title: "Uncaught Exception"
  - [ ] 12.1.4 Quit application after user acknowledges
- [ ] 12.2 Implement quit confirmation dialog:
  - [ ] 12.2.1 Add "Quit" to tray menu
  - [ ] 12.2.2 Hide window first
  - [ ] 12.2.3 Display confirmation dialog: "Are you sure you want to quit?"
  - [ ] 12.2.4 On "Confirm": unregister shortcuts, clear clipboard timer, quit
  - [ ] 12.2.5 On "Cancel": close dialog, continue running
- [ ] 12.3 Implement shortcut registration error handling:
  - [ ] 12.3.1 Catch registration errors from Tauri plugin
  - [ ] 12.3.2 Log error to console
  - [ ] 12.3.3 Display error dialog: "Failed to register global shortcut"
  - [ ] 12.3.4 Continue running without shortcut
- [ ] 12.4 Implement auto-launch error handling:
  - [ ] 12.4.1 Catch enable/disable errors
  - [ ] 12.4.2 Log error to console
  - [ ] 12.4.3 Display error dialog with system error message
  - [ ] 12.4.4 Keep toggle in correct state
- [ ] 12.5 Implement configuration validation:
  - [ ] 12.5.1 Validate all fields before applying
  - [ ] 12.5.2 Replace invalid values with defaults
  - [ ] 12.5.3 Log validation errors
- [ ] 12.6 Implement configuration file error handling:
  - [ ] 12.6.1 Missing file: create with defaults
  - [ ] 12.6.2 Corrupted file: log error, use defaults, overwrite
  - [ ] 12.6.3 Write failure: log error, continue with in-memory config
- [ ] 12.7 Implement IPC error handling:
  - [ ] 12.7.1 Wrap all Tauri commands in try-catch
  - [ ] 12.7.2 Return error responses to renderer
  - [ ] 12.7.3 Frontend: handle errors gracefully
  - [ ] 12.7.4 Log errors to console
- [ ] 12.8 Implement dev vs production error handling:
  - [ ] 12.8.1 Development: detailed logging, stack traces
  - [ ] 12.8.2 Production: minimal logging, friendly error messages
  - [ ] 12.8.3 Keep DevTools accessible in development

## 13. Build Configuration

- [ ] 13.1 Configure tauri.conf.json bundler settings
- [ ] 13.2 Configure platform-specific permissions
- [ ] 13.3 Set up icon generation workflow:
  - [ ] 13.3.1 Upscale FlowerPassword.png to 1024x1024 if needed
  - [ ] 13.3.2 Run `npm run tauri icon assets/FlowerPassword.png` to generate app icons
  - [ ] 13.3.3 Copy existing tray icons (Mono.png, Mono@2x.png, Color.png) to src-tauri/icons/
  - [ ] 13.3.4 Verify all icons in src-tauri/icons/ directory
  - [ ] 13.3.5 Configure Tauri to use Mono.png as template icon for macOS tray
- [ ] 13.4 Add build scripts for all target platforms
- [ ] 13.5 Test build process for macOS (x64, arm64, universal)
- [ ] 13.6 Test build process for Windows (x64, ia32)
- [ ] 13.7 Test build process for Linux (x64, arm64)
- [ ] 13.8 Document unsigned build security warnings in README
- [ ] 13.9 Add instructions for users to bypass Gatekeeper (macOS) and SmartScreen (Windows)

## 14. Cross-Platform Testing

- [ ] 14.1 Test on macOS Ventura+ (Intel and Apple Silicon)
- [ ] 14.2 Test on Windows 10/11 (x64 and ia32)
- [ ] 14.3 Test on Ubuntu 22.04+ (x64)
- [ ] 14.4 Test on Fedora 38+ (x64)
- [ ] 14.5 Verify all features work on each platform
- [ ] 14.6 Test installers (DMG, MSI, AppImage, deb)
- [ ] 14.7 Document platform-specific quirks
- [ ] 14.8 Create platform compatibility matrix

## 15. Security Audit

- [ ] 15.1 Review tauri.conf.json permissions (use minimal required)
- [ ] 15.2 Verify context isolation settings
- [ ] 15.3 Audit Tauri command permissions (no unnecessary privileges)
- [ ] 15.4 Ensure no password logging in Rust code
- [ ] 15.5 Verify clipboard auto-clear works correctly
- [ ] 15.6 Review dependency tree for known vulnerabilities (cargo audit)
- [ ] 15.7 Test with security tools (macOS Gatekeeper, Windows SmartScreen)
- [ ] 15.8 Document security improvements over Electron

## 16. Performance Verification

- [ ] 16.1 Measure bundle size for all platforms (target: <20MB)
- [ ] 16.2 Measure memory usage (target: 50% reduction vs Electron)
- [ ] 16.3 Measure startup time (target: 30-50% improvement)
- [ ] 16.4 Benchmark password generation performance
- [ ] 16.5 Test clipboard operations speed
- [ ] 16.6 Profile Rust backend performance
- [ ] 16.7 Create performance comparison report (Electron vs Tauri)
- [ ] 16.8 Document metrics in release notes

## 17. Documentation Updates

- [ ] 17.1 Update README.md with Tauri setup instructions
- [ ] 17.2 Document Rust toolchain requirements
- [ ] 17.3 Update build instructions for all platforms
- [ ] 17.4 Create migration guide for contributors
- [ ] 17.5 Document new architecture in CLAUDE.md project context
- [ ] 17.6 Update code signing documentation
- [ ] 17.7 Add troubleshooting section for common Tauri issues
- [ ] 17.8 Update contribution guidelines with Rust standards

## 18. Update Checker Implementation

- [ ] 18.1 Add reqwest crate dependency to Cargo.toml for HTTP requests
- [ ] 18.2 Add serde and serde_json for JSON parsing
- [ ] 18.3 Create src-tauri/src/updater.rs module
- [ ] 18.4 Implement GitHubRelease struct (tag_name, html_url, name, body)
- [ ] 18.5 Implement semantic version comparison function (compare_versions)
- [ ] 18.6 Implement `check_for_updates()` Tauri command
- [ ] 18.7 Add concurrent check prevention flag
- [ ] 18.8 Fetch GitHub API: <https://api.github.com/repos/xlsdg/flower-password-desktop/releases/latest>
- [ ] 18.9 Parse JSON response and extract release information
- [ ] 18.10 Compare latest version with current app version
- [ ] 18.11 Add "Check for Updates" to tray menu
- [ ] 18.12 Implement update available dialog (with Download and Cancel buttons)
- [ ] 18.13 Implement no update available dialog
- [ ] 18.14 Implement error dialog for API failures
- [ ] 18.15 Open release URL in external browser using Tauri shell API
- [ ] 18.16 Add localized strings for update dialogs (en-US, zh-CN, zh-TW)
- [ ] 18.17 Test version comparison with various version formats
- [ ] 18.18 Test update checker on all platforms (macOS, Windows, Linux)
- [ ] 18.19 Test GitHub API error handling (network failures, rate limits)

## 19. GitHub Actions CI/CD Setup

- [ ] 19.1 Create .github/workflows/release.yml workflow file
- [ ] 19.2 Configure matrix build for all platforms:
  - [ ] 19.2.1 macOS: universal-apple-darwin, x86_64-apple-darwin, aarch64-apple-darwin
  - [ ] 19.2.2 Windows: x86_64-pc-windows-msvc, i686-pc-windows-msvc
  - [ ] 19.2.3 Linux: x86_64-unknown-linux-gnu, aarch64-unknown-linux-gnu
- [ ] 19.3 Add Rust toolchain setup step
- [ ] 19.4 Add Node.js setup step
- [ ] 19.5 Configure artifact upload to GitHub Releases
- [ ] 19.6 Test workflow with a pre-release tag
- [ ] 19.7 Verify all platform builds complete successfully
- [ ] 19.8 Verify artifacts are uploaded correctly

## 20. Release Preparation

- [ ] 20.1 Create release notes highlighting improvements
- [ ] 20.2 Document breaking changes (no config migration, unsigned builds)
- [ ] 20.3 Update version to 5.0.0 (major version bump)
- [ ] 20.4 Create Git tag (v5.0.0)
- [ ] 20.5 Push tag to trigger GitHub Actions workflow
- [ ] 20.6 Wait for automated builds to complete
- [ ] 20.7 Test installers on clean systems for each platform
- [ ] 20.8 Verify security warning bypasses work (macOS Gatekeeper, Windows SmartScreen)
- [ ] 20.9 Update flowerpassword.com website with new downloads
- [ ] 20.10 Verify update checker correctly detects new version
- [ ] 20.11 Document that Electron v4.x.x remains available as fallback

## 21. Post-Release Monitoring

- [ ] 21.1 Monitor GitHub issues for migration bugs
- [ ] 21.2 Track user feedback on bundle size/performance
- [ ] 21.3 Document common migration issues
- [ ] 21.4 Maintain Electron v4.0.x as fallback (6-12 months)
- [ ] 21.5 Plan follow-up improvements based on user feedback

## 22. Future Enhancements (Post v5.0.0)

**Note**: These are optional future improvements, not required for initial migration.

### Code Signing (Optional Future Feature)

- [ ] 22.1 Obtain code signing certificates:
  - [ ] 22.1.1 macOS: Apple Developer ID Application certificate
  - [ ] 22.1.2 Windows: Authenticode certificate from trusted CA
- [ ] 22.2 Configure code signing in tauri.conf.json
- [ ] 22.3 Update GitHub Actions workflow with signing secrets
- [ ] 22.4 Test signed builds on all platforms
- [ ] 22.5 Verify no security warnings on installation

### Automatic Update Installation (Optional Future Feature)

If code signing certificates become available, automatic update installation can be added:

- [ ] 22.6 Evaluate tauri-plugin-updater for automatic installation
- [ ] 22.7 Implement background download with progress indicator
- [ ] 22.8 Add signature verification for downloaded packages
- [ ] 22.9 Implement "Install and Restart" flow
- [ ] 22.10 Create signed update manifest generation pipeline
