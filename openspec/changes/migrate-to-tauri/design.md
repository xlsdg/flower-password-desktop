# Tauri Migration Design Document

## Context

FlowerPassword is currently built on Electron 38, which provides excellent cross-platform compatibility but comes with significant overhead:

- Bundle sizes: 150-200MB per platform
- Memory usage: High (bundles full Chromium browser)
- Security surface: Large (Node.js + Chromium)
- Startup time: Slower (Chromium initialization)

Tauri offers an alternative architecture using Rust backend + system WebView, addressing these concerns while maintaining cross-platform support. The migration requires careful planning to ensure:

1. **Algorithm compatibility**: Password generation must produce identical results
2. **Feature parity**: All existing functionality preserved
3. **Security maintenance**: No regression in security posture
4. **Developer experience**: Clear migration path with minimal disruption

**Stakeholders:**

- End users: Expect smaller downloads, faster performance, no functionality loss
- Developers: Need Rust knowledge for backend maintenance
- Project maintainer: Seeks reduced bundle size and improved security

## Goals / Non-Goals

### Goals

- Achieve 90%+ reduction in application bundle size
- Reduce memory footprint by using system WebView
- Maintain 100% feature parity with current Electron version
- Preserve password generation algorithm compatibility (critical for user data)
- Improve application startup time
- Enhance security through Rust's memory safety guarantees
- Maintain support for macOS (x64, arm64), Windows (x64, ia32), Linux (x64, arm64)

### Non-Goals

- Changing UI/UX or visual design (React components remain unchanged)
- Adding new features during migration (pure refactor)
- Supporting older operating systems beyond Tauri's WebView requirements
- Implementing auto-update mechanism in initial migration (future enhancement)
- Rewriting frontend from React (stays React 19 + TypeScript 5)

## Decisions

### 1. Password Algorithm Strategy

**Decision**: Implement flowerpassword.js algorithm natively in Rust using MD5 hashing

**Rationale:**

- Eliminates WASM overhead and complexity
- Provides better performance with native Rust implementation
- MD5 algorithm is well-defined and has mature Rust crates
- Verification through comprehensive test suite with known input/output pairs
- Simpler build process without WASM compilation step

**Alternatives considered:**

- **WASM bridge**: Adds complexity, larger bundle size, WASM runtime overhead
- **Keep Node.js subprocess**: Defeats purpose of Tauri migration (bundle size, security)

**Implementation:**

```
Frontend (React/TS)
    ↓ invoke('generate_password', { memory, distinguishing })
Tauri Command (Rust)
    ↓ call native Rust password generation function
Rust MD5 implementation (md5 crate)
    ↓ return password
Tauri Command returns to Frontend
```

**Algorithm Details:**

The flowerpassword.js algorithm uses MD5 hashing with character transformation:

```rust
// Pseudo-code for Rust implementation
fn fp_code(password: &str, key: &str, length: u8) -> String {
    // 1. Generate base hash: MD5(password + key)
    let base_hash = md5_hex(format!("{}{}", password, key));

    // 2. Generate rule hash: MD5(base_hash + "kise")
    let rule_hash = md5_hex(format!("{}{}", base_hash, "kise"));

    // 3. Generate source hash: MD5(base_hash + "snow")
    let source_hash = md5_hex(format!("{}{}", base_hash, "snow"));

    // 4. Apply transformation rules using magic string
    let magic = "sunlovesnow1990090127xykab";
    let transformed = apply_transformation(source_hash, rule_hash, magic);

    // 5. Ensure first character is letter, truncate to length
    format_password(transformed, length)
}
```

**Rust Dependencies:**

- `md5 = "0.7"` or `md-5 = "0.10"` (RustCrypto)

### 2. Project Structure

**Decision**: Use Tauri's standard structure with src-tauri/ for Rust code

**Structure:**

```
flower-password-desktop/
├── src/                    # Frontend (React/TS) - existing code
│   ├── App.tsx
│   ├── index.tsx
│   ├── i18n.ts
│   ├── locales/
│   └── styles/
├── src-tauri/              # Backend (Rust) - NEW
│   ├── src/
│   │   ├── main.rs         # Tauri app entry
│   │   ├── commands.rs     # IPC command handlers
│   │   ├── tray.rs         # System tray logic
│   │   ├── config.rs       # Configuration management
│   │   ├── clipboard.rs    # Clipboard operations
│   │   └── lib.rs          # Module exports
│   ├── Cargo.toml          # Rust dependencies
│   ├── tauri.conf.json     # Tauri configuration
│   └── icons/              # App icons
├── public/                 # Static assets
└── vite.config.ts          # Frontend build (unchanged)
```

**Rationale:**

- Standard Tauri convention (easier onboarding)
- Clear separation: src/ = frontend, src-tauri/ = backend
- Preserves existing React/TS code structure

### 3. IPC Command Design

**Decision**: Use Tauri's invoke pattern with typed commands

**Before (Electron IPC):**

```typescript
// Renderer
const result = await window.api.generatePassword(memory, distinguishing);

// Preload
contextBridge.exposeInMainWorld('api', {
  generatePassword: (memory, distinguishing) =>
    ipcRenderer.invoke('generate-password', memory, distinguishing)
});

// Main
ipcMain.handle('generate-password', async (event, memory, distinguishing) => {
  return flowerPassword(memory, distinguishing);
});
```

**After (Tauri):**

```typescript
// Frontend (React/TS)
import { invoke } from '@tauri-apps/api';
const result = await invoke<string>('generate_password', {
  memory,
  distinguishing
});

// Backend (Rust)
#[tauri::command]
fn generate_password(memory: String, distinguishing: String) -> Result<String, String> {
  // Call WASM or Rust implementation
  Ok(password)
}
```

**Commands to implement:**

- `generate_password(memory: String, distinguishing: String) -> String`
- `get_config() -> Config`
- `set_config(config: Config) -> Result<(), String>`
- `update_form_settings(settings: FormSettings) -> Result<(), String>`
- `copy_to_clipboard(text: String) -> Result<(), String>`
- `clear_clipboard() -> Result<(), String>`
- `set_global_shortcut(shortcut: String) -> Result<(), String>`
- `set_auto_launch(enabled: bool) -> Result<(), String>`
- `get_locale() -> String`
- `set_locale(locale: String) -> Result<(), String>`
- `show_window() -> Result<(), String>`
- `hide_window() -> Result<(), String>` (for UI close button)
- `toggle_window() -> Result<(), String>`
- `check_for_updates() -> Result<UpdateCheckResult, String>`

### 4. Configuration Storage

**Decision**: Use Tauri Store plugin (@tauri-apps/plugin-store)

**Before (Electron Store):**

```typescript
import Store from 'electron-store';
const store = new Store();
store.set('language', 'en');
const lang = store.get('language');
```

**After (Tauri Store):**

```typescript
import { Store } from '@tauri-apps/plugin-store';
const store = new Store('config.json');
await store.set('language', 'en');
const lang = await store.get('language');
```

**Rust side:**

```rust
use tauri_plugin_store::StoreExt;
let store = app.store("config.json")?;
store.set("language", "en");
```

**No Migration Path:**

- Tauri app maintains separate configuration from Electron version
- Users can run both Electron and Tauri versions side-by-side
- Each app has independent config (no automatic migration)
- Tauri config path: `com.xlsdg.flowerpassword/`
- Electron config path: `FlowerPassword/`

### 5. System Tray Implementation

**Decision**: Use Tauri's built-in tray API

**Mapping:**

```rust
use tauri::{
  menu::{Menu, MenuItem},
  tray::{TrayIconBuilder, TrayIconEvent},
};

fn build_tray(app: &AppHandle) -> Result<()> {
  let show = MenuItem::new(app, "Show", true, None::<&str>)?;
  let quit = MenuItem::new(app, "Quit", true, None::<&str>)?;
  let menu = Menu::with_items(app, &[&show, &quit])?;

  TrayIconBuilder::new()
    .menu(&menu)
    .icon(app.default_window_icon().unwrap().clone())
    .on_tray_icon_event(|tray, event| {
      match event {
        TrayIconEvent::Click { .. } => {
          // Show window
        }
        _ => {}
      }
    })
    .build(app)?;

  Ok(())
}
```

**Features:**

- Context menu with Show/Quit
- Click to show/hide window
- Platform-specific icon handling (mono/color variants)

### 6. Global Shortcuts

**Decision**: Use tauri-plugin-global-shortcut

**Implementation:**

```rust
use tauri_plugin_global_shortcut::GlobalShortcutExt;

app.global_shortcut()
  .on_shortcut("CmdOrCtrl+Alt+S", |app, _shortcut| {
    // Toggle window visibility
  })?;
```

**Configuration:**

- Default: Cmd+Alt+S (macOS) / Ctrl+Alt+S (Windows/Linux)
- User-configurable via settings
- Conflict detection and error handling

### 7. Multi-Language Support

**Decision**:

- **Frontend**: Keep react-i18next (unchanged)
- **Backend**: Use fluent-rs or simple JSON mapping for tray menu/notifications

**Frontend (no change):**

```typescript
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
<button>{t('generate')}</button>
```

**Backend (Rust):**

```rust
// Simple approach: Load JSON locale files
use serde_json::Value;
fn get_translation(key: &str, locale: &str) -> String {
  // Load locale JSON, return translated string
}
```

**Locales to support:**

- English (en-US) - Note: Use en-US, not "en"
- Simplified Chinese (zh-CN)
- Traditional Chinese (zh-TW)
- Auto-detect mode ("auto") - Detects system locale and maps to closest supported language

### 8. Build and Distribution

**Decision**: Use Tauri CLI with platform-specific bundlers

**Commands:**

```json
{
  "scripts": {
    "dev": "tauri dev",
    "build": "tauri build",
    "build:mac": "tauri build --target universal-apple-darwin",
    "build:mac:arm64": "tauri build --target aarch64-apple-darwin",
    "build:mac:x64": "tauri build --target x86_64-apple-darwin",
    "build:win": "tauri build --target x86_64-pc-windows-msvc",
    "build:win:ia32": "tauri build --target i686-pc-windows-msvc",
    "build:linux": "tauri build --target x86_64-unknown-linux-gnu",
    "build:linux:arm64": "tauri build --target aarch64-unknown-linux-gnu"
  }
}
```

**Bundlers:**

- macOS: DMG (default), PKG optional
- Windows: MSI, NSIS installer
- Linux: AppImage, deb, rpm

**Code Signing:**

- **Not implemented** in initial release
- Unsigned builds will show security warnings on first run
- Users must manually approve installation (macOS Gatekeeper, Windows SmartScreen)
- Future enhancement: Add code signing when certificates become available

**GitHub Actions Workflow:**

```yaml
# .github/workflows/release.yml
name: Release Build

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    strategy:
      matrix:
        platform:
          - os: macos-latest
            target: universal-apple-darwin
          - os: ubuntu-latest
            target: x86_64-unknown-linux-gnu
          - os: windows-latest
            target: x86_64-pc-windows-msvc
    runs-on: ${{ matrix.platform.os }}

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - uses: dtolnay/rust-toolchain@stable
      - run: npm install
      - run: npm run tauri build -- --target ${{ matrix.platform.target }}
      - uses: softprops/action-gh-release@v1
        with:
          files: src-tauri/target/release/bundle/**/*
```

**Deployment Process:**

1. Create Git tag (e.g., `v5.0.0`)
2. Push tag to GitHub: `git push origin v5.0.0`
3. GitHub Actions automatically builds for all platforms
4. Artifacts uploaded to GitHub Releases
5. Users download installers from Releases page

### 9. Update Checker Implementation

**Decision**: Port existing manual update checker from Electron to Tauri (no change in functionality)

**Rationale:**

- Current Electron version already has working update checker
- Simple, proven approach: check GitHub API, show dialog, open browser
- No code signing certificates required
- Same user experience as current version
- Can add automatic updates in future if needed

**Update Flow (matches current Electron implementation):**

```
User triggers "Check for Updates" (menu/settings)
    ↓
Tauri Command: check_for_updates()
    ↓
Rust: Fetch https://api.github.com/repos/xlsdg/flower-password-desktop/releases/latest
    ↓
Parse JSON response (tag_name, html_url)
    ↓
Compare versions: latest vs current (semantic versioning)
    ↓
If newer version available:
    Show dialog: "Update Available - v5.0.1"
    Buttons: [Download] [Cancel]
    ↓
If user clicks [Download]:
    Open release.html_url in external browser
    ↓
User manually downloads and installs
```

**Rust Implementation:**

```rust
use tauri::Manager;
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
struct GitHubRelease {
    tag_name: String,
    html_url: String,
    name: String,
    body: String,
}

#[tauri::command]
async fn check_for_updates(app: tauri::AppHandle) -> Result<UpdateCheckResult, String> {
    // Prevent concurrent checks
    // Fetch from GitHub API
    let response = reqwest::get("https://api.github.com/repos/xlsdg/flower-password-desktop/releases/latest")
        .await
        .map_err(|e| e.to_string())?;

    let release: GitHubRelease = response.json()
        .await
        .map_err(|e| e.to_string())?;

    let latest_version = release.tag_name.trim_start_matches('v');
    let current_version = app.package_info().version.to_string();

    // Compare versions (semantic versioning)
    match compare_versions(latest_version, &current_version) {
        Ordering::Greater => Ok(UpdateCheckResult::UpdateAvailable {
            current: current_version,
            latest: latest_version.to_string(),
            url: release.html_url,
        }),
        _ => Ok(UpdateCheckResult::NoUpdate {
            current: current_version,
        }),
    }
}
```

**Frontend (React):**

```typescript
import { invoke } from '@tauri-apps/api';
import { open } from '@tauri-apps/api/shell';

async function checkForUpdates() {
  try {
    const result = await invoke('check_for_updates');

    if (result.type === 'update_available') {
      const userWantsUpdate = await showDialog({
        title: t('dialog.update.available.title'),
        message: t('dialog.update.available.message', {
          current: result.current,
          latest: result.latest
        }),
        buttons: [t('dialog.update.download'), t('dialog.update.cancel')]
      });

      if (userWantsUpdate) {
        await open(result.url); // Opens in external browser
      }
    } else {
      await showDialog({
        title: t('dialog.update.title'),
        message: t('dialog.update.noUpdate.message'),
        detail: t('dialog.update.message', { version: result.current })
      });
    }
  } catch (error) {
    await showDialog({
      type: 'error',
      title: t('dialog.update.error.title'),
      message: error
    });
  }
}
```

**No Configuration Required:**

- No update server setup (uses public GitHub API)
- No signing keys needed
- No manifest generation
- No certificate management
- Works identically to current Electron version

**Automatic Updates:**

- **Not implemented** - users manually download new versions
- Manual update checker remains (queries GitHub API, opens browser)
- Simpler distribution model without update infrastructure
- Future enhancement: Consider tauri-plugin-updater if code signing added

### 10. Window Management and Positioning

**Decision**: Implement comprehensive window management with dual positioning strategies

**Window Properties (must match Electron exactly):**

```json
{
  "width": 300,
  "height": 334,
  "decorations": false,        // Frameless
  "resizable": false,          // Fixed size
  "visible": false,            // Starts hidden in tray
  "skipTaskbar": true,         // No taskbar icon
  "alwaysOnTop": true,         // Floating window
  "center": false              // Use custom positioning
}
```

**Always-On-Top Implementation:**

```rust
// macOS-specific
if cfg!(target_os = "macos") {
    window.set_always_on_top_with_level(true, "floating")?;
    window.set_visible_on_all_workspaces(true)?;
    window.set_visible_on_fullscreen(true)?;
}
// Windows/Linux
else {
    window.set_always_on_top(true)?;
    window.set_visible_on_all_workspaces(true)?;
}
```

**Dual Positioning Strategy:**

1. **Position Below Tray** (when shown via tray click):

```rust
fn position_below_tray(tray_bounds: Rect, window_size: Size, platform: Platform) -> Position {
    match platform {
        Platform::MacOS => {
            // Center horizontally below tray icon
            Position {
                x: tray_bounds.x + (tray_bounds.width / 2) - (window_size.width / 2),
                y: tray_bounds.y + tray_bounds.height,
            }
        },
        Platform::Windows | Platform::Linux => {
            // Right-align with tray, position above (Windows taskbar on bottom)
            Position {
                x: tray_bounds.x + tray_bounds.width - window_size.width,
                y: tray_bounds.y - window_size.height,
            }
        }
    }
}
```

2. **Position At Cursor** (when shown via global shortcut):

```rust
fn position_at_cursor(cursor: Position, window_size: Size, screen: Screen) -> Position {
    let work_area = screen.work_area; // Respects taskbar/dock
    let mut x = cursor.x;
    let mut y = cursor.y;

    // Smart bounds checking - keep window fully on screen
    if x + window_size.width > work_area.right {
        x = work_area.right - window_size.width;
    }
    if y + window_size.height > work_area.bottom {
        y = work_area.bottom - window_size.height;
    }
    if x < work_area.left {
        x = work_area.left;
    }
    if y < work_area.top {
        y = work_area.top;
    }

    Position { x, y }
}
```

**Window Blur Behavior:**

```rust
window.on_blur(|window| {
    // Auto-hide on focus loss (exception: DevTools)
    if !window.is_devtools_open() {
        window.hide()?;
    }
    Ok(())
});
```

**Rationale:**

- Exact dimensions match Electron for UI consistency
- Dual positioning provides optimal UX for different triggers
- Always-on-top ensures visibility without being intrusive
- Smart bounds checking prevents window from going off-screen

### 11. Clipboard Domain Parsing

**Decision**: Implement intelligent clipboard URL parsing with public suffix list

**Implementation:**

```rust
use publicsuffix::{Psl, List};

fn parse_clipboard_domain(clipboard_text: &str) -> Option<String> {
    // 1. Try to parse as URL
    let url = match Url::parse(clipboard_text) {
        Ok(u) if u.scheme() == "http" || u.scheme() == "https" => u,
        _ => return None,
    };

    // 2. Get hostname
    let hostname = url.host_str()?;

    // 3. Parse using public suffix list
    let list = List::fetch()?; // Or use embedded PSL data
    let domain = list.parse_domain(hostname)?;

    // 4. Extract second-level domain (SLD)
    // www.example.com → example
    // subdomain.example.co.uk → example
    Some(domain.root().to_string())
}
```

**Workflow:**

```
Window about to show
    ↓
Read clipboard
    ↓
If contains URL (http/https)
    ↓
Parse hostname using PSL library
    ↓
Extract second-level domain
    ↓
Send KEY_FROM_CLIPBOARD IPC event to renderer
    ↓
Frontend auto-fills key field with domain
```

**Rust Dependency:**

- `publicsuffix = "2.0"` or `psl = "2.0"`

**Rationale:**

- Improves UX by auto-filling domain from copied URLs
- PSL ensures correct domain extraction (handles .co.uk, .com.cn, etc.)
- Matches existing Electron behavior exactly

### 12. Clipboard Auto-Clear Strategy

**Decision**: Fixed 10-second timeout with "clear only if unchanged" logic

**Implementation:**

```rust
use tokio::time::{sleep, Duration};
use std::sync::Arc;
use tokio::sync::Mutex;

struct ClipboardManager {
    last_copied: Arc<Mutex<Option<String>>>,
}

impl ClipboardManager {
    async fn copy_with_auto_clear(&self, text: String) -> Result<()> {
        // 1. Copy to clipboard
        clipboard::write_text(&text)?;

        // 2. Store value for later comparison
        *self.last_copied.lock().await = Some(text.clone());

        // 3. Spawn auto-clear task (10 seconds)
        let last_copied = Arc::clone(&self.last_copied);
        tokio::spawn(async move {
            sleep(Duration::from_millis(10000)).await;

            // 4. Read current clipboard content
            if let Ok(current) = clipboard::read_text() {
                // 5. Only clear if still contains our password
                if Some(current) == *last_copied.lock().await {
                    let _ = clipboard::clear();
                }
                // If user copied something else, don't clear
            }
        });

        Ok(())
    }
}
```

**Key Points:**

- **Timeout: 10 seconds (10000ms)** - not 30 seconds
- **Smart clearing**: Only clears if clipboard content unchanged
- If user copies something else during 10 seconds, clipboard is preserved
- Prevents accidental loss of user data

**Rationale:**

- Balances security (auto-clear passwords) with UX (preserve user actions)
- Matches existing Electron behavior exactly

### 13. Configuration Schema and Validation

**Decision**: Comprehensive configuration with strict validation and "auto" mode support

**Configuration Schema:**

```rust
#[derive(Serialize, Deserialize, Debug, Clone)]
struct Config {
    language: String,           // "en-US", "zh-CN", "zh-TW", "auto"
    theme: String,              // "light", "dark", "auto"
    global_shortcut: String,    // One of 6 available shortcuts
    auto_launch: bool,
    form_settings: FormSettings,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct FormSettings {
    password_length: u8,        // 6-32
    prefix: String,
    suffix: String,
}
```

**Defaults:**

```rust
impl Default for Config {
    fn default() -> Self {
        Config {
            language: "auto".to_string(),
            theme: "auto".to_string(),
            global_shortcut: "CmdOrCtrl+Alt+S".to_string(),
            auto_launch: false,
            form_settings: FormSettings {
                password_length: 16,
                prefix: String::new(),
                suffix: String::new(),
            },
        }
    }
}
```

**Validation Functions:**

```rust
fn validate_language(lang: &str) -> String {
    match lang {
        "en-US" | "zh-CN" | "zh-TW" | "auto" => lang.to_string(),
        _ => {
            log::error!("Invalid language: {}, defaulting to 'auto'", lang);
            "auto".to_string()
        }
    }
}

fn validate_theme(theme: &str) -> String {
    match theme {
        "light" | "dark" | "auto" => theme.to_string(),
        _ => {
            log::error!("Invalid theme: {}, defaulting to 'auto'", theme);
            "auto".to_string()
        }
    }
}

fn validate_password_length(length: u8) -> u8 {
    if (6..=32).contains(&length) {
        length
    } else {
        log::error!("Invalid password length: {}, defaulting to 16", length);
        16
    }
}
```

**"Auto" Mode Handling:**

```rust
fn resolve_language(config_lang: &str) -> String {
    if config_lang == "auto" {
        detect_system_locale()
    } else {
        config_lang.to_string()
    }
}

fn detect_system_locale() -> String {
    let locale = sys_locale::get_locale().unwrap_or_else(|| "en-US".to_string());

    // Map system locale to supported languages
    if locale.starts_with("zh-CN") || locale.starts_with("zh_CN") {
        "zh-CN".to_string()
    } else if locale.starts_with("zh-TW") || locale.starts_with("zh-HK") || locale.starts_with("zh_TW") {
        "zh-TW".to_string()
    } else {
        "en-US".to_string() // Default fallback
    }
}
```

**Rationale:**

- Strict validation prevents invalid state
- "auto" mode provides intelligent defaults
- FormSettings separation allows real-time persistence
- All values have safe defaults

### 14. Global Shortcut Selection System

**Decision**: Provide 6 pre-defined shortcuts with dialog-based selection

**Available Shortcuts:**

```rust
const AVAILABLE_SHORTCUTS: [&str; 6] = [
    "CmdOrCtrl+Alt+S",    // Default
    "CmdOrCtrl+Shift+S",
    "CmdOrCtrl+Alt+P",
    "CmdOrCtrl+Shift+P",
    "CmdOrCtrl+Alt+F",
    "CmdOrCtrl+Shift+F",
];
```

**Selection Dialog Implementation:**

```rust
#[tauri::command]
fn show_shortcut_selection_dialog(
    app: AppHandle,
    current_shortcut: String,
) -> Result<()> {
    let alternatives: Vec<&str> = AVAILABLE_SHORTCUTS
        .iter()
        .filter(|&&s| s != current_shortcut)
        .copied()
        .collect();

    let dialog = MessageDialogBuilder::new(
        t("dialog.shortcut.title"),
        format!(
            "{}\n\n{}",
            t("dialog.shortcut.message"),
            t("dialog.shortcut.current", current_shortcut)
        ),
    );

    // Add button for each alternative
    for shortcut in alternatives {
        dialog.add_button(shortcut, move || {
            set_global_shortcut(&app, shortcut)?;
            Ok(())
        });
    }

    dialog.add_button(t("dialog.shortcut.cancel"), || Ok(()));
    dialog.show();

    Ok(())
}

#[tauri::command]
fn set_global_shortcut(app: &AppHandle, new_shortcut: &str) -> Result<()> {
    // 1. Validate shortcut is in allowed list
    if !AVAILABLE_SHORTCUTS.contains(&new_shortcut) {
        return Err("Invalid shortcut".into());
    }

    // 2. Unregister old shortcut
    app.global_shortcut().unregister_all()?;

    // 3. Register new shortcut
    app.global_shortcut()
        .on_shortcut(new_shortcut, |app, _| {
            toggle_window(app)
        })
        .map_err(|e| {
            // Handle registration failure
            show_error_dialog(&t("dialog.shortcut.error"), &e.to_string());
            e
        })?;

    // 4. Save to config
    let mut config = get_config(app)?;
    config.global_shortcut = new_shortcut.to_string();
    save_config(app, &config)?;

    Ok(())
}
```

**Conflict Handling:**

```rust
fn register_shortcut_with_fallback(app: &AppHandle) -> Result<()> {
    let config = get_config(app)?;
    let shortcut = &config.global_shortcut;

    match app.global_shortcut().on_shortcut(shortcut, toggle_window) {
        Ok(_) => {
            log::info!("Registered global shortcut: {}", shortcut);
            Ok(())
        }
        Err(e) => {
            log::error!("Failed to register shortcut {}: {}", shortcut, e);
            show_error_dialog(
                &t("dialog.shortcut.conflict.title"),
                &t("dialog.shortcut.conflict.message", shortcut),
            );
            // Continue running without shortcut
            Ok(())
        }
    }
}
```

**Rationale:**

- Limited set prevents invalid shortcuts
- Dialog UX matches existing Electron behavior
- Graceful failure handling for conflicts
- Platform-agnostic (CmdOrCtrl resolves correctly)

### 15. UI Interactions and User Experience

**Decision**: Implement password masking, Enter key shortcuts, and intelligent focus management

**Password Masking Algorithm:**

```typescript
function maskPassword(password: string): string {
    if (password.length <= 4) {
        // Short passwords: all bullets
        return '•'.repeat(password.length);
    }
    // Longer passwords: first 2 + bullets + last 2
    const bulletCount = password.length - 4;
    return `${password.slice(0, 2)}${'•'.repeat(bulletCount)}${password.slice(-2)}`;
}

// Example: "Abc123xyz" → "Ab••••yz"
```

**Hover Reveal:**

```typescript
const [showPassword, setShowPassword] = useState(false);

<button
    onMouseEnter={() => setShowPassword(true)}
    onMouseLeave={() => setShowPassword(false)}
>
    {showPassword ? generatedPassword : maskPassword(generatedPassword)}
</button>
```

**Enter Key Quick Generate:**

```typescript
function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Enter') {
        if (password && key) {
            // Generate, copy, hide window - all in one action
            const generated = await invoke('generate_password', {
                memory: password,
                distinguishing: prefix + key + suffix,
            });
            await invoke('copy_to_clipboard', { text: generated });
            await invoke('hide_window');
        }
    }
}

<input onKeyDown={handleKeyDown} />
```

**Focus Management (IPC-driven):**

```typescript
import { listen } from '@tauri-apps/api/event';

useEffect(() => {
    const unlisten = listen('WINDOW_SHOWN', () => {
        if (!password) {
            // Focus password field if empty
            passwordInputRef.current?.focus();
        } else {
            // Focus and select key field if password exists
            keyInputRef.current?.focus();
            keyInputRef.current?.select();
        }
    });

    return () => { unlisten(); };
}, [password]);
```

**Real-Time Form Settings Persistence:**

```typescript
const handlePasswordLengthChange = async (length: number) => {
    setPasswordLength(length);
    await invoke('update_form_settings', {
        settings: { passwordLength: length, prefix, suffix }
    });
};

const handlePrefixChange = async (value: string) => {
    setPrefix(value);
    await invoke('update_form_settings', {
        settings: { passwordLength, prefix: value, suffix }
    });
};
```

**External Link Validation:**

```typescript
import { open } from '@tauri-apps/api/shell';

async function handleLinkClick(url: string) {
    // Validate protocol
    if (url.startsWith('https://') || url.startsWith('http://')) {
        await open(url);
    } else {
        console.error('Invalid protocol:', url);
    }
}
```

**Rationale:**

- Password masking balances security and usability
- Enter key provides power-user workflow
- Focus management reduces clicks
- Real-time persistence prevents data loss
- Protocol validation prevents XSS attacks

### 16. Error Handling and Robustness

**Decision**: Comprehensive error handling with graceful degradation

**Uncaught Exception Handler:**

```rust
use std::panic;

fn setup_panic_handler(app: &AppHandle) {
    let app_handle = app.clone();

    panic::set_hook(Box::new(move |panic_info| {
        let message = format!("{}", panic_info);
        let backtrace = std::backtrace::Backtrace::force_capture();

        // Show error dialog
        let _ = MessageDialogBuilder::new(
            "Uncaught Exception",
            &format!("{}\n\n{:?}", message, backtrace),
        )
        .kind(MessageDialogKind::Error)
        .show_blocking();

        // Quit application after user acknowledges
        app_handle.exit(1);
    }));
}
```

**Quit Confirmation Dialog:**

```rust
fn handle_quit_request(app: &AppHandle) -> Result<()> {
    // 1. Hide window first
    if let Some(window) = app.get_window("main") {
        window.hide()?;
    }

    // 2. Show confirmation dialog
    let confirmed = MessageDialogBuilder::new(
        t("dialog.quit.title"),
        t("dialog.quit.message"),
    )
    .buttons(MessageDialogButtons::OkCancel)
    .show_blocking();

    if confirmed {
        // 3. Clean up resources
        app.global_shortcut().unregister_all()?;
        // Clear clipboard timer (handled by Drop trait)

        // 4. Quit
        app.exit(0);
    }
    // User cancelled - continue running

    Ok(())
}
```

**Configuration Validation with Error Recovery:**

```rust
fn load_config(app: &AppHandle) -> Config {
    match try_load_config(app) {
        Ok(config) => validate_config(config),
        Err(e) => {
            match e.kind() {
                io::ErrorKind::NotFound => {
                    // Missing file - create with defaults
                    log::info!("Config not found, creating defaults");
                    let default_config = Config::default();
                    let _ = save_config(app, &default_config);
                    default_config
                },
                _ => {
                    // Corrupted file - overwrite with defaults
                    log::error!("Config corrupted: {}, using defaults", e);
                    let default_config = Config::default();
                    let _ = save_config(app, &default_config);
                    default_config
                }
            }
        }
    }
}

fn validate_config(mut config: Config) -> Config {
    config.language = validate_language(&config.language);
    config.theme = validate_theme(&config.theme);
    config.global_shortcut = validate_shortcut(&config.global_shortcut);
    config.form_settings.password_length = validate_password_length(
        config.form_settings.password_length
    );
    config
}
```

**IPC Error Handling:**

```rust
#[tauri::command]
fn risky_operation() -> Result<String, String> {
    match perform_operation() {
        Ok(result) => Ok(result),
        Err(e) => {
            log::error!("Operation failed: {}", e);
            Err(format!("Operation failed: {}", e))
        }
    }
}
```

```typescript
// Frontend
try {
    const result = await invoke('risky_operation');
} catch (error) {
    console.error('IPC error:', error);
    // Show user-friendly error message
    showToast('Operation failed. Please try again.');
}
```

**Development vs Production Logging:**

```rust
fn setup_logging() {
    if cfg!(debug_assertions) {
        // Development: verbose logging
        env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("debug"))
            .init();
    } else {
        // Production: minimal logging
        env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("warn"))
            .init();
    }
}
```

**Rationale:**

- Graceful degradation prevents data loss
- User-facing errors are localized and helpful
- All failure modes have defined recovery paths
- Development logging aids debugging without compromising production UX

## Risks / Trade-offs

### Risk: Algorithm Compatibility

**Risk**: Rust MD5 implementation produces different results than JavaScript version

**Mitigation:**

- Comprehensive test suite with 100+ known input/output pairs from JavaScript implementation
- Unit tests for each step of the algorithm (base hash, rule hash, source hash, transformation)
- Character-by-character comparison validation
- Pre-release testing with real user passwords (volunteer beta testers)
- Both Electron and Tauri versions available during transition period

**Rollback**: Keep Electron version available if incompatibility discovered

---

### Risk: Platform-Specific Bugs

**Risk**: System tray, shortcuts, or WebView behave differently across platforms

**Mitigation:**

- Test on all target platforms early (macOS x64/arm64, Windows x64/ia32, Linux x64/arm64)
- Use Tauri's platform-specific configuration options
- Monitor Tauri GitHub issues for known platform bugs

**Trade-off**: Tauri is younger than Electron; some edge cases may not be documented

---

### Risk: Rust Learning Curve

**Risk**: Team unfamiliar with Rust slows development and maintenance

**Mitigation:**

- Document all Rust code with clear comments
- Create contribution guide for backend changes
- Start with simple Rust patterns, avoid advanced features
- Consider pair programming for Rust changes

**Trade-off**: Short-term productivity decrease for long-term benefits

---

### Risk: WebView Rendering Differences

**Risk**: System WebView may render UI differently than Chromium

**Mitigation:**

- Test UI on all platforms early in migration
- Use CSS compatible with Safari (macOS), Edge WebView2 (Windows), WebKitGTK (Linux)
- Avoid bleeding-edge CSS features

**Trade-off**: Minimal risk since React app uses standard HTML/CSS

---

### Risk: Bundle Size on Linux

**Risk**: Linux AppImage bundles WebKitGTK, increasing size

**Mitigation:**

- Offer both AppImage (portable) and deb/rpm (uses system WebView)
- Document system WebView requirements in installation guide

**Trade-off**: Linux users may prefer system WebView; document clearly

## Migration Plan

### Phase 1: Prototype (Week 1-2)

**Goals**: Prove core functionality works

**Tasks:**

1. Initialize Tauri project structure
2. Implement password generation command (WASM bridge)
3. Basic window + tray setup
4. Single IPC command test
5. Build for one platform (macOS)

**Success criteria**: Can generate password via Tauri IPC

---

### Phase 2: Feature Implementation (Week 3-6)

**Goals**: Achieve feature parity

**Tasks:**

1. Implement all Tauri commands (config, clipboard, shortcuts, locale)
2. System tray with full menu
3. Global shortcut registration
4. Configuration persistence (migrate electron-store data)
5. Auto-launch integration
6. Window management (show/hide, positioning)
7. Clipboard auto-clear timer
8. Update React frontend IPC calls

**Success criteria**: All features work on primary development platform

---

### Phase 3: Cross-Platform (Week 7-8)

**Goals**: Ensure all platforms work

**Tasks:**

1. Build for all targets (macOS x64/arm64, Windows x64/ia32, Linux x64/arm64)
2. Platform-specific testing
3. Icon handling for each platform
4. Code signing setup
5. Installer testing

**Success criteria**: Installable builds on all platforms with all features working

---

### Phase 4: Testing & Refinement (Week 9-10)

**Goals**: Production readiness

**Tasks:**

1. Password generation algorithm verification (100+ test cases)
2. Multi-language testing
3. Performance benchmarking (bundle size, memory, startup time)
4. Security audit (Tauri configuration, permissions)
5. User acceptance testing
6. Documentation updates (README, build instructions)

**Success criteria**:

- All tests pass
- Bundle size < 20MB per platform
- No regressions in functionality

---

### Phase 5: Release (Week 11-12)

**Goals**: Ship to users

**Tasks:**

1. Create release notes with migration guide
2. Tag GitHub release
3. Upload platform-specific installers
4. Update website (flowerpassword.com) with new downloads
5. Monitor issue tracker for migration bugs

**Rollback plan**: Keep Electron v4.0.3 available as fallback download

---

### Data Migration

**Electron config location:**

- macOS: `~/Library/Application Support/FlowerPassword/config.json`
- Windows: `%APPDATA%/FlowerPassword/config.json`
- Linux: `~/.config/FlowerPassword/config.json`

**Tauri config location:**

- macOS: `~/Library/Application Support/com.xlsdg.flowerpassword/config.json`
- Windows: `%APPDATA%/com.xlsdg.flowerpassword/config.json`
- Linux: `~/.config/com.xlsdg.flowerpassword/config.json`

**No Migration Strategy:**

- Tauri and Electron apps use separate config directories
- No automatic config migration on first launch
- Users manually reconfigure Tauri app if switching from Electron
- Both versions can coexist without conflicts
- Simpler implementation without migration code

## Open Questions

1. **Should we add configuration for update check frequency?**
   - Current Electron version: manual check only (user-triggered)
   - Option: Add auto-check on startup (configurable)
   - Recommendation: Keep manual-only initially, add auto-check as optional enhancement

2. **How to handle users who don't upgrade from Electron version?**
   - Keep Electron v4.0.x available for download?
   - Recommendation: Yes, maintain for 6-12 months as fallback

3. **Should we add telemetry for migration success metrics?**
   - Project principle: No telemetry
   - Recommendation: No - rely on GitHub issues and user feedback

4. **Linux WebView compatibility - which distributions to officially support?**
   - Tauri requires WebKitGTK 2.40+
   - Recommendation: Document Ubuntu 22.04+, Fedora 38+, Arch as supported

## Resolved Decisions

1. **Algorithm compatibility layer**: Not needed - flowerpassword.js algorithm is stable and frozen
2. **Config migration**: Not implemented - separate configs for Electron and Tauri versions
3. **Code signing**: Deferred to future enhancement (v5.1+)
4. **Automatic updates**: Not implemented - manual download workflow only
5. **GitHub Actions**: Implemented for automated cross-platform builds
