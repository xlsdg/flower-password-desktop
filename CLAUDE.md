# CLAUDE.md

This file provides comprehensive guidance for AI assistants (Claude Code) when working with the FlowerPassword Desktop repository.

## Project Overview

**FlowerPassword Desktop** is a secure, cross-platform password manager built with modern web technologies. It uses deterministic password generation via the [flowerpassword.js](https://github.com/xlsdg/flowerpassword.js) library - users memorize one master password ("memory password") and combine it with site-specific "distinction codes" to generate unique, strong passwords without storing them.

### Tech Stack

- **Runtime**: Electron 38 (Node.js + Chromium)
- **UI**: React 19 (functional components + hooks)
- **Language**: TypeScript 5.9 (strict mode)
- **Bundler**: Vite 6+ (fast builds, HMR)
- **Styles**: LESS with CSS variables (auto light/dark theme)
- **i18n**: i18next + react-i18next (Chinese/English)
- **Package Manager**: npm (lockfile v3)

### Supported Platforms

| Platform    | Architectures                      | Output Formats            |
| ----------- | ---------------------------------- | ------------------------- |
| **macOS**   | ARM64 (Apple Silicon), x64 (Intel) | DMG, ZIP                  |
| **Windows** | x64, ia32                          | Setup.exe (Squirrel), ZIP |
| **Linux**   | x64, ARM64                         | .deb, .rpm, ZIP           |

## Development Workflow

### Initial Setup

```bash
npm install          # Install all dependencies
```

### Daily Development

```bash
npm start            # Start dev mode with Vite (HMR + auto-reload)
npm run package      # Package app for current platform
```

### Code Quality

```bash
npm run lint         # Run ESLint + TypeScript type checking
npm run format       # Auto-format code with Prettier
npm run format:check # Check formatting without modifying files
```

### Build System Notes

- **Vite** handles all three Electron processes (main/preload/renderer) with fast builds and HMR
- **@electron-forge/plugin-vite** integrates Vite with Electron Forge workflow
- TypeScript runs in type-check-only mode (`noEmit: true`) - no TSC compilation overhead
- Dev mode (`npm start`) provides hot module replacement (HMR) for instant updates
- Vite dev server for renderer process, watch mode for main/preload processes
- Build output structure:
  - `.vite/build/` - Main and preload process compiled files (main.js, preload.js)
  - `.vite/renderer/` - Renderer process output (index.html, assets/, and public files)

## Production Builds

### Platform-Specific Commands

All commands use **Electron Forge** for packaging and distribution:

```bash
# macOS (run on macOS only)
npm run make              # Current system arch (ARM64 on Apple Silicon)
npm run make:mac:arm64    # Apple Silicon (M1/M2/M3) - produces .dmg + .zip
npm run make:mac:x64      # Intel Macs - produces .dmg + .zip
npm run make:all          # Both ARM64 and x64 (requires macOS)

# Windows (run on Windows or use Wine/CI)
npm run make:win:x64      # 64-bit (recommended) - Squirrel installer + .zip
npm run make:win:ia32     # 32-bit (legacy) - Squirrel installer + .zip

# Linux (run on Linux or use Docker/CI)
npm run make:linux:x64    # x64 - .deb + .rpm + .zip
npm run make:linux:arm64  # ARM64 (Raspberry Pi 4+, ARM servers) - .deb + .rpm + .zip
```

### Build Artifacts

| Platform | Output Directory             | Installer Types                                                 |
| -------- | ---------------------------- | --------------------------------------------------------------- |
| macOS    | `out/make/`                  | `.dmg` (drag-to-install), `.zip` (portable)                     |
| Windows  | `out/make/squirrel.windows/` | `Setup.exe` (auto-updater), `.zip` (portable)                   |
| Linux    | `out/make/`                  | `.deb` (Debian/Ubuntu), `.rpm` (Fedora/RHEL), `.zip` (portable) |

### Automated Release Process

1. **Bump version**: `npm version [major|minor|patch]` (updates `package.json` + creates git tag)
2. **Push tag**: `git push --tags` (triggers GitHub Actions workflow)
3. **CI builds**: Multi-platform GitHub Actions runners build all architectures
4. **GitHub Release**: Automated release with all installers attached

**Manual Release**: Run platform-specific `make` commands locally and upload to GitHub Releases.

## Project Architecture

### Directory Structure

```
flower-password-desktop/
├── src/
│   ├── main/           # Electron main process (Node.js)
│   │   ├── main.ts     # App lifecycle & initialization
│   │   ├── window.ts   # BrowserWindow management
│   │   ├── tray.ts     # System tray icon & menu
│   │   ├── menu.ts     # Application menu & shortcuts
│   │   ├── ipc.ts      # IPC handlers (main ↔ renderer communication)
│   │   ├── position.ts # Smart window positioning logic
│   │   ├── config.ts   # Configuration management (theme, language)
│   │   ├── i18n.ts     # Main process translations
│   │   └── locales/    # Main process translation files (en.ts, zh.ts)
│   │
│   ├── preload/        # Preload script (security bridge)
│   │   └── preload.ts  # contextBridge API exposure
│   │
│   ├── renderer/       # React app (renderer process)
│   │   ├── App.tsx     # Main React component
│   │   ├── index.tsx   # React entry point
│   │   ├── index.html  # HTML template with Vite entry point
│   │   ├── i18n.ts     # i18next configuration
│   │   ├── utils.ts    # Utility functions (domain extraction, etc.)
│   │   ├── locales/    # Translation files (en.ts, zh.ts)
│   │   ├── styles/     # LESS stylesheets (index.less, reset.less)
│   │   └── global.d.ts # TypeScript global declarations
│   │
│   ├── shared/         # Shared code (main + renderer)
│   │   ├── types.ts    # TypeScript interfaces
│   │   └── constants.ts # App constants
│   │
│   └── types/          # Global type declarations
│       ├── psl.d.ts    # Public Suffix List library types
│       └── vite-env.d.ts # Vite/Electron Forge environment constants
│
├── public/             # Static assets (auto-copied by Vite to output)
│   ├── Icon.png        # App icon (512x512 or higher)
│   ├── IconTemplate.png # macOS menubar icon (template mode, ~16x16)
│   └── IconTemplate@2x.png # macOS menubar icon @2x (template mode, ~32x32)
│
├── assets/             # Build-time assets (for Electron Forge packaging)
│   ├── FlowerPassword.icns  # macOS icon (multi-resolution .icns)
│   ├── FlowerPassword.ico   # Windows icon (multi-resolution .ico)
│   └── FlowerPassword.png   # Linux icon (PNG source, 512x512 recommended)
│
├── .vite/              # Vite build output (managed by Electron Forge)
│   ├── build/          # Production build
│   │   ├── main.js     # Compiled main process
│   │   └── preload.js  # Compiled preload script
│   └── renderer/       # Renderer process output
│       ├── index.html  # HTML entry point
│       ├── assets/     # JS, CSS, and images
│       ├── Icon.png    # App icon (copied from public/)
│       ├── IconTemplate.png # Menubar icon (copied from public/)
│       └── IconTemplate@2x.png # Menubar icon @2x (copied from public/)
│
├── out/                # Electron Forge packaging output
│   ├── make/           # Distribution installers (.dmg, .exe, .deb, .rpm, .zip)
│   └── FlowerPassword-{platform}-{arch}/ # Packaged app directory
│
├── vite.main.config.ts     # Vite config for main process
├── vite.preload.config.ts  # Vite config for preload script
├── vite.renderer.config.ts # Vite config for renderer process
├── forge.config.js         # Electron Forge packaging config
├── tsconfig.json           # TypeScript compiler settings
├── eslint.config.js        # ESLint v9 flat config
└── .prettierrc.json        # Prettier formatting rules
```

**Key Directories Explained:**

- **`public/`**: Static assets that are copied as-is to the renderer output directory by Vite. Used for runtime assets like app icons and tray icons that the application loads at runtime.
- **`assets/`**: Build-time only assets used by Electron Forge during packaging (e.g., installer icons). These are not included in the final app bundle but used by packaging tools.
- **`.vite/`**: Temporary build output directory managed by Vite and Electron Forge. Contains compiled JavaScript, HTML, CSS, and copied assets. This directory is gitignored.
- **`out/`**: Final packaged application and installers. Generated by `npm run make` or `npm run package`. This directory is gitignored.

### Icon Assets

FlowerPassword uses different icon formats for different purposes:

**Runtime Icons (`public/` directory):**

- **`Icon.png`**: Main app icon displayed in the UI (recommended: 512x512px or higher, PNG format)
- **`IconTemplate.png`**: macOS menubar tray icon in template mode (~16x16px for standard displays)
- **`IconTemplate@2x.png`**: macOS menubar tray icon for Retina displays (~32x32px)

**Packaging Icons (`assets/` directory):**

- **`FlowerPassword.icns`**: macOS multi-resolution icon bundle (contains 16x16 to 1024x1024)
- **`FlowerPassword.ico`**: Windows multi-resolution icon (contains 16x16 to 256x256)
- **`FlowerPassword.png`**: Linux icon source (recommended: 512x512px PNG)

**Template Icons (macOS only):**

Template icons use a special naming convention (`IconTemplate.png`) that tells macOS to automatically adapt the icon color to match the system theme (light/dark mode). The icon should be a monochrome black shape with transparency - macOS will invert it for dark mode automatically.

### Key Modules & Responsibilities

#### Main Process (Node.js Backend)

| Module                              | Purpose                     | Key Features                                                                                 |
| ----------------------------------- | --------------------------- | -------------------------------------------------------------------------------------------- |
| [main.ts](src/main/main.ts)         | App lifecycle & entry point | Single instance enforcement, error handling, macOS dock hiding, config initialization        |
| [window.ts](src/main/window.ts)     | Window management           | Platform-specific configs (macOS: floating level + all workspaces; Win/Linux: always-on-top) |
| [tray.ts](src/main/tray.ts)         | System tray integration     | Template icons (macOS), context menu with theme/language settings, clipboard URL parsing     |
| [position.ts](src/main/position.ts) | Smart positioning           | Tray-relative positioning (macOS menubar, Win/Linux taskbar), cursor-based fallback          |
| [menu.ts](src/main/menu.ts)         | Application menu            | Edit menu, global shortcut registration (`Cmd+Alt+S` for show/hide)                          |
| [ipc.ts](src/main/ipc.ts)           | IPC handlers                | Window control (hide/quit), clipboard, shell, locale, config access                          |
| [config.ts](src/main/config.ts)     | Configuration management    | Theme and language settings, persistent storage, auto-apply on startup                       |
| [i18n.ts](src/main/i18n.ts)         | Main process i18n           | Lightweight translation system with nested structure for organized content                   |
| [locales/](src/main/locales/)       | Main translations           | en.ts (English), zh.ts (Chinese) - nested objects by category (app, dialog, tray, etc.)     |

#### Preload Script (Security Bridge)

| Module                               | Purpose        | Security Model                                                           |
| ------------------------------------ | -------------- | ------------------------------------------------------------------------ |
| [preload.ts](src/preload/preload.ts) | Context bridge | Exposes `window.electronAPI` via `contextBridge` with strict API surface |

#### Renderer Process (React UI)

| Module                              | Purpose           | Key Features                                                                                          |
| ----------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------- |
| [App.tsx](src/renderer/App.tsx)     | Main UI component | Password generation, real-time updates, clipboard auto-fill, form validation, theme/language sync    |
| [index.tsx](src/renderer/index.tsx) | React entry point | i18n initialization, React 19 createRoot, dynamic `<html lang>` updates                               |
| [i18n.ts](src/renderer/i18n.ts)     | Renderer i18n     | i18next + react-i18next, namespace-free flat structure, fallback handling                             |
| [utils.ts](src/renderer/utils.ts)   | Utility functions | Domain extraction from URLs using psl library                                                         |
| [locales/](src/renderer/locales/)   | Translation files | en.ts (English), zh.ts (Chinese) - structured by sections (`app`, `metadata`, `form`, `hints`)       |

#### Shared Code

| Module                                  | Purpose               | Usage                                                                        |
| --------------------------------------- | --------------------- | ---------------------------------------------------------------------------- |
| [types.ts](src/shared/types.ts)         | TypeScript interfaces | Shared types (ElectronAPI, AppConfig, ThemeMode, etc.), IPC channel names   |
| [constants.ts](src/shared/constants.ts) | App constants         | Global shortcuts, asset paths, keyboard keys, allowed URL protocols          |

### Security Architecture

**Electron Security Best Practices:**

- ✅ `contextIsolation: true` - Renderer and preload run in separate contexts
- ✅ `nodeIntegration: false` - No direct Node.js access from renderer
- ✅ `sandbox: true` - Renderer runs in Chromium sandbox (optional, not currently enabled)
- ✅ `contextBridge` - Explicit, minimal API surface between processes
- ✅ CSP headers - Content Security Policy prevents XSS
- ✅ IPC validation - All IPC messages validated before processing

### Platform-Specific Behaviors

The app adapts to each OS for optimal UX:

| Feature               | macOS                              | Windows                       | Linux                        |
| --------------------- | ---------------------------------- | ----------------------------- | ---------------------------- |
| **Window Level**      | Floating (appears over fullscreen) | Always-on-top                 | Always-on-top                |
| **Workspaces**        | Visible on all Spaces/Desktops     | N/A                           | N/A                          |
| **Tray Position**     | Below menubar (center-aligned)     | Above taskbar (right-aligned) | Above taskbar (varies by DE) |
| **Tray Icon**         | Template mode (auto dark/light)    | Standard color icon           | Standard color icon          |
| **Dock/Taskbar**      | Hidden (`app.dock.hide()`)         | Hidden (no taskbar button)    | Hidden (no panel button)     |
| **Global Shortcut**   | Works in fullscreen apps           | Requires app focus            | Requires app focus           |
| **Window Activation** | No workspace switching             | Standard focus                | Standard focus               |

**Implementation Details:**

- **macOS**: `setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })` + floating window level
- **Windows/Linux**: `setAlwaysOnTop(true)` with standard behavior
- **Positioning**: Calculated in [position.ts](src/main/position.ts) using `tray.getBounds()` and screen workarea

## Internationalization (i18n)

### Supported Languages

| Language    | Code | Fallback   | Regions                     |
| ----------- | ---- | ---------- | --------------------------- |
| **English** | `en` | ✅ Default | Global (en-US, en-GB, etc.) |
| **Chinese** | `zh` | -          | zh-CN, zh-TW, zh-HK         |

### Architecture Overview

FlowerPassword uses a **dual i18n system** to handle translations in both Electron processes:

#### Main Process i18n

**Implementation**: [src/main/i18n.ts](src/main/i18n.ts) + [locales/](src/main/locales/)

- **Lightweight** - No external dependencies (simple object lookup)
- **Use Cases** - Error dialogs, system tray menu, tooltips, notifications
- **Detection** - `app.getLocale()` (e.g., `zh-CN` → `zh`)
- **API** - `t(key)` function returns translated string
- **Structure** - Separate translation files in `src/main/locales/` (en.ts, zh.ts)

```typescript
// Example usage in main process
import { t } from './i18n';
tray.setToolTip(t('tray.tooltip')); // Reads from src/main/locales/en.ts or zh.ts
```

#### Renderer Process i18n

**Implementation**: [src/renderer/i18n.ts](src/renderer/i18n.ts) + [locales/](src/renderer/locales/)

- **Full-featured** - Uses `i18next` + `react-i18next`
- **Structure** - Namespace-free flat structure with sections: `app`, `metadata`, `form`, `hints`
- **React Integration** - `useTranslation()` hook (no namespace parameter needed)
- **Type Safety** - TypeScript types for translation keys

```typescript
// Example usage in React components
import { useTranslation } from 'react-i18next';

function App(): JSX.Element {
  const { t } = useTranslation();
  return <label>{t('form.passwordPlaceholder')}</label>;
}
```

### Language Detection Flow

```
1. System Locale (Electron API)
   ↓ app.getLocale() → "zh-CN" | "en-US" | "ja-JP" | ...

2. Language Extraction
   ↓ Extract prefix → "zh" | "en" | "ja" | ...

3. Support Check
   ↓ Is "zh"? → Use Chinese
   ↓ Otherwise → Use English (fallback)

4. Apply to Processes
   ├─ Main: Load translations from i18n.ts
   └─ Renderer: Initialize i18next with locale

5. Dynamic UI Updates
   ├─ <html lang="zh-CN"> or lang="en"
   ├─ <title> and <meta description>
   └─ All UI text via t() function
```

### Adding New Languages

To add support for another language (e.g., Japanese):

**Step 1**: Add main process translations

```typescript
// src/main/locales/en.ts
export const en = {
  app: {
    name: 'FlowerPassword',
  },
  tray: {
    tooltip: 'FlowerPassword',
    // ...
  },
  // Add new sections...
} as const;

// src/main/locales/zh.ts
export const zh = {
  app: {
    name: '花密',
  },
  tray: {
    tooltip: '花密',
    // ...
  },
  // Add new sections...
} as const;

// src/main/locales/ja.ts (new file)
export const ja = {
  app: {
    name: 'フラワーパスワード',
  },
  tray: {
    tooltip: 'フラワーパスワード',
    // ...
  },
  // Add new sections...
} as const;
```

**Step 2**: Create renderer translation file

```typescript
// src/renderer/locales/ja.ts
export const ja = {
  app: {
    title: 'Flower Password',
    close: '閉じる',
  },
  metadata: {
    title: 'フラワーパスワード',
    description: 'フラワーパスワード - 記憶パスワードと区別コードでパスワードを生成',
    htmlLang: 'ja',
  },
  form: {
    passwordPlaceholder: '記憶パスワード',
    keyPlaceholder: '区別コード',
    // ...
  },
  hints: {
    password: '記憶パスワード: 簡単に覚えられるパスワード...',
    // ...
  },
} as const;
```

**Step 3**: Import and register in main process

```typescript
// src/main/i18n.ts
import { en } from './locales/en';
import { zh } from './locales/zh';
import { ja } from './locales/ja'; // Add import

const TRANSLATIONS: Record<string, Record<string, string>> = {
  en,
  zh,
  ja, // Register new language
};

const detectLanguage = (locale: string): string => {
  const lang = locale.split('-')[0];
  if (lang === 'zh') return 'zh';
  if (lang === 'ja') return 'ja'; // Add check
  return 'en'; // Default fallback
};
```

**Step 4**: Import and register in renderer process

```typescript
// src/renderer/i18n.ts
import { en } from './locales/en';
import { zh } from './locales/zh';
import { ja } from './locales/ja'; // Add import

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh },
    ja: { translation: ja }, // Add resource
  },
  lng: currentLanguage, // Detected language
  fallbackLng: 'en',
  // ...
});
```

### Translation File Structure

#### Main Process Translation Structure

Main process translations use nested objects organized by category:

```typescript
// src/main/locales/en.ts
export const en = {
  app: {
    name: 'FlowerPassword',
  },
  dialog: {
    quitMessage: 'Are you sure you want to quit?',
    quitConfirm: 'Quit',
    quitCancel: 'Cancel',
  },
  tray: {
    tooltip: 'FlowerPassword',
    show: 'Show',
    quit: 'Quit',
    settings: 'Settings',
  },
  menu: {
    theme: 'Theme',
    language: 'Language',
  },
  theme: {
    light: 'Light',
    dark: 'Dark',
    auto: 'Auto',
  },
  language: {
    zh: '简体中文',
    en: 'English',
    auto: 'Auto',
  },
  metadata: {
    htmlTitle: 'FlowerPassword',
    htmlDescription: 'FlowerPassword - Generate passwords based on memory password and distinction code',
  },
} as const;
```

#### Renderer Translation Structure

Renderer translations use sections for organization:

```typescript
// src/renderer/locales/en.ts
export const en = {
  app: {
    title: 'Flower Password',
    close: 'Close',
  },
  metadata: {
    title: 'FlowerPassword',
    description: 'FlowerPassword - Generate passwords based on memory password and distinction code',
    htmlLang: 'en',
  },
  form: {
    passwordPlaceholder: 'Memory Password',
    keyPlaceholder: 'Distinguishing Code',
    prefixPlaceholder: 'Prefix',
    suffixPlaceholder: 'Suffix',
    generateButton: 'Generate Password (Click to Copy)',
    lengthUnit: ' chars',
  },
  hints: {
    password: 'Memory Password: A simple password to generate strong passwords.',
    key: 'Distinction Code: A short code for different accounts, e.g., "taobao" or "tb".',
    website: 'Official Website: ',
  },
} as const;
```

**Best Practices:**

- **Main process**: Use dot notation for nested keys like `t('tray.tooltip')` or `t('app.name')`
- **Renderer process**: Use dot notation for nested keys like `t('form.passwordPlaceholder')` or `t('app.title')`
- Keep keys in English (language-neutral)
- Main process uses simple string lookups with basic category nesting
- Use i18next features in renderer (plurals, context, interpolation if needed)
- Always use `as const` for type safety and immutability
- Use named exports (`export const en = {...}`) instead of default exports

## Dependencies

### Core Dependencies

| Package             | Version | Purpose                                      |
| ------------------- | ------- | -------------------------------------------- |
| `electron`          | ^38.3.0 | Cross-platform desktop application framework |
| `react`             | ^19.2.0 | UI library for building user interfaces      |
| `react-dom`         | ^19.2.0 | React renderer for web                       |
| `flowerpassword.js` | ^5.0.2  | Core password generation algorithm           |
| `i18next`           | ^25.6.0 | Internationalization framework               |
| `react-i18next`     | ^16.1.0 | React bindings for i18next                   |
| `psl`               | ^1.15.0 | Public Suffix List for domain parsing        |

**Note**: URL parsing is handled by Node.js native `URL` API (WHATWG standard), no external dependencies needed.

### Build Tools

| Package                | Version | Purpose                               |
| ---------------------- | ------- | ------------------------------------- |
| `vite`                 | ^6.4.0  | Fast build tool with HMR              |
| `@vitejs/plugin-react` | ^5.0.4  | Vite plugin for React with HMR        |
| `typescript`           | ^5.9.3  | TypeScript compiler for type checking |
| `eslint`               | ^9.38.0 | JavaScript/TypeScript linter          |
| `prettier`             | ^3.6.2  | Code formatter                        |
| `less`                 | ^4.4.2  | CSS preprocessor                      |

### Electron Forge

| Package                                      | Version | Purpose                           |
| -------------------------------------------- | ------- | --------------------------------- |
| `@electron-forge/cli`                        | ^7.10.2 | Electron Forge CLI                |
| `@electron-forge/plugin-vite`                | ^7.10.2 | Vite plugin for Electron Forge    |
| `@electron-forge/maker-dmg`                  | ^7.10.2 | macOS DMG installer maker         |
| `@electron-forge/maker-zip`                  | ^7.10.2 | ZIP archive maker (all platforms) |
| `@electron-forge/maker-squirrel`             | ^7.10.2 | Windows Squirrel installer maker  |
| `@electron-forge/maker-deb`                  | ^7.10.2 | Debian/Ubuntu package maker       |
| `@electron-forge/maker-rpm`                  | ^7.10.2 | Fedora/RHEL package maker         |
| `@electron-forge/plugin-auto-unpack-natives` | ^7.10.2 | Auto-unpack native modules        |
| `@electron-forge/plugin-fuses`               | ^7.10.2 | Electron fuses configuration      |
| `@electron/fuses`                            | ^1.8.0  | Electron security fuses           |

## Code Style & Standards

### TypeScript Rules (Strict Mode)

**Type Safety (Enforced by ESLint + TSC):**

- ✅ **Strict mode** - All `strict` flags enabled in tsconfig.json
- ❌ **No `any` types** - Use `unknown` or proper types
- ✅ **Explicit return types** - All functions must declare return type
- ✅ **Null safety** - `strictNullChecks` enforced
- ✅ **Type imports** - Use `import type` for type-only imports

```typescript
// ✅ Good
function calculatePassword(input: string, length: number): string {
  return input.slice(0, length);
}

// ❌ Bad
function calculatePassword(input, length) {
  // Implicit any
  return input.slice(0, length);
}
```

**ESLint Configuration:**

- **Version**: ESLint v9+ (flat config format - `eslint.config.js`)
- **Parser**: `@typescript-eslint/parser` with type-aware rules
- **Plugins**: `@typescript-eslint`, `prettier`
- **Rules**: `recommended-type-checked` + `recommended-requiring-type-checking` + Prettier integration

### Code Formatting (Prettier)

**Settings** (`.prettierrc.json`):

```json
{
  "arrowParens": "avoid", // Avoid parentheses for single-parameter arrows
  "bracketSpacing": true, // Spaces inside object braces
  "embeddedLanguageFormatting": "auto", // Auto-format embedded languages
  "endOfLine": "lf", // Unix line endings
  "htmlWhitespaceSensitivity": "css", // CSS-like whitespace handling
  "insertPragma": false, // Don't add @format pragma
  "jsxBracketSameLine": false, // JSX closing bracket on new line
  "jsxSingleQuote": false, // Double quotes in JSX
  "printWidth": 120, // 120 characters per line
  "proseWrap": "preserve", // Keep prose as-is
  "quoteProps": "consistent", // Consistent quote style for object properties
  "requirePragma": false, // Format all files, don't require pragma
  "semi": true, // Semicolons required
  "singleQuote": true, // Single quotes for strings
  "tabWidth": 2, // 2 spaces indentation
  "trailingComma": "es5", // ES5 trailing commas (objects, arrays)
  "useTabs": false, // Use spaces, not tabs
  "vueIndentScriptAndStyle": false // Don't indent Vue script/style tags
}
```

**Auto-format on save** - Configure your editor to run Prettier on save

### React Best Practices

**Component Style:**

```typescript
// ✅ Functional components with typed props
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

function Button({ label, onClick, disabled = false }: ButtonProps): JSX.Element {
  return <button onClick={onClick} disabled={disabled}>{label}</button>;
}
```

**Hooks to Use:**

| Hook             | Purpose                  | Example                                           |
| ---------------- | ------------------------ | ------------------------------------------------- |
| `useState`       | Local state              | `const [count, setCount] = useState<number>(0)`   |
| `useEffect`      | Side effects, lifecycle  | `useEffect(() => { /* fetch data */ }, [deps])`   |
| `useCallback`    | Memoized callbacks       | `const handler = useCallback(() => {}, [deps])`   |
| `useMemo`        | Memoized values          | `const value = useMemo(() => compute(), [deps])`  |
| `useRef`         | DOM refs, mutable values | `const inputRef = useRef<HTMLInputElement>(null)` |
| `useTranslation` | i18n (react-i18next)     | `const { t } = useTranslation()`                  |

**Avoid:**

- ❌ Class components (use functional components)
- ❌ `React.FC` type (deprecated pattern)
- ❌ Default exports (use named exports for better tree-shaking and refactoring)

### CSS/LESS Standards

**BEM Naming Convention:**

```less
// Block
.password-generator {
  // Element
  &__input {
    border: 1px solid var(--border-color);

    // Modifier
    &--error {
      border-color: var(--error-color);
    }
  }

  &__button {
    background: var(--primary-color);
  }
}
```

**CSS Variables (Theme Support):**

```less
:root {
  // Light theme (default)
  --bg-color: #ffffff;
  --text-primary: #333333;
  --border-color: #e0e0e0;
}

@media (prefers-color-scheme: dark) {
  :root {
    // Dark theme
    --bg-color: #1e1e1e;
    --text-primary: #f0f0f0;
    --border-color: #404040;
  }
}
```

**Theming Strategy:**

- Use CSS variables for all colors, spacing, fonts
- `prefers-color-scheme` media query for auto dark mode
- No manual theme toggle (follows OS preference)

### Comments & Documentation

#### Core Principle: Code as Documentation

Comments should explain **WHY**, not **WHAT**. If you need to explain what the code does, the code itself should be refactored to be more self-documenting through better naming, structure, or decomposition.

**Language Policy:**

- ✅ **All comments MUST be in English** (no Chinese/other languages)
- ✅ Use JSDoc for public API functions and complex functions
- ✅ Explain "why", not "what" (code should be self-documenting)
- ❌ Avoid redundant comments that merely repeat what the code clearly expresses

**When to Add Comments:**

✅ **DO add comments for:**

- Platform-specific behavior that isn't obvious (e.g., macOS vs Windows differences)
- Performance optimizations and their rationale
- Security considerations and constraints
- Complex algorithms or non-obvious logic
- Workarounds for known issues or limitations
- Important lifecycle or memory management decisions
- Public API documentation (JSDoc)

❌ **DON'T add comments for:**

- Simple variable assignments or return statements
- Function calls where the function name is self-explanatory
- IPC handlers where the channel name describes the action
- Event handlers with descriptive names
- Getters/setters with obvious behavior
- Code that simply repeats the function/variable name

**Examples:**

```typescript
// ✅ GOOD - Explains WHY (platform-specific behavior)
if (process.platform === 'darwin') {
  // macOS: Support fullscreen apps with visibleOnFullScreen option
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  mainWindow.setAlwaysOnTop(true, 'floating');
} else {
  mainWindow.setVisibleOnAllWorkspaces(true);
  mainWindow.setAlwaysOnTop(true);
}

// ✅ GOOD - Explains WHY (performance optimization)
/**
 * Pre-computed password length options (6-32 characters)
 * Using a constant array to avoid recalculation on every render
 */
const PASSWORD_LENGTH_OPTIONS = Array.from(
  { length: PASSWORD_MAX_LENGTH - PASSWORD_MIN_LENGTH + 1 },
  (_, i) => i + PASSWORD_MIN_LENGTH
);

// ✅ GOOD - Explains WHY (important lifecycle decision)
useEffect(() => {
  window.electronAPI.onKeyFromClipboard(handleClipboardKey);
  window.electronAPI.onWindowShown(handleWindowShown);

  // No cleanup needed: listener lifetime matches app lifetime
  // (App component never unmounts in this single-window application)
}, []);

// ✅ GOOD - Explains WHY (security context)
/**
 * Safely expose APIs to renderer process
 * Use contextBridge to ensure renderer process cannot directly access Electron internal APIs
 */
const electronAPI: ElectronAPI = {
  // ...
};

// ❌ BAD - Redundant, just describes what the code does
// Hide window
ipcMain.on(IPC_CHANNELS.HIDE, () => {
  hideWindow();
});

// ❌ BAD - Function name already says this
// Handle close button click
const handleClose = useCallback((): void => {
  window.electronAPI.hide();
}, []);

// ❌ BAD - Obvious from the code structure
// Set up IPC listeners
window.electronAPI.onKeyFromClipboard(handleClipboardKey);
window.electronAPI.onWindowShown(handleWindowShown);

// ❌ BAD - States the obvious
/**
 * Window control - Hide window
 */
hide: (): void => {
  ipcRenderer.send(IPC_CHANNELS.HIDE);
};

// ❌ BAD - Non-English comment
// 处理点击事件
function handleClick() {
  /* ... */
}
```

**JSDoc Guidelines:**

Use JSDoc for public APIs and complex functions. Keep JSDoc concise - avoid repeating information that's already in the function signature.

```typescript
// ✅ GOOD - Adds value beyond the signature
/**
 * Calculate window position near tray icon
 * @param tray - Tray instance
 * @param windowBounds - Window bounds information
 * @returns Coordinates where window should be displayed {x, y}
 */
export function calculatePositionBelowTray(tray: Tray, windowBounds: Size): Position {
  // Implementation...
}

// ✅ GOOD - Documents non-obvious behavior
/**
 * Extract domain from clipboard URL and send to renderer
 * If extraction succeeds, send domain to renderer process
 */
function extractDomainFromClipboard(): void {
  // Implementation...
}

// ❌ BAD - Just repeats the function signature
/**
 * Get main window instance
 * @returns Main window instance or null
 */
export function getWindow(): BrowserWindow | null {
  return mainWindow;
}

// ✅ BETTER - Remove JSDoc if it doesn't add value
export function getWindow(): BrowserWindow | null {
  return mainWindow;
}
```

**JSDoc Example with Context:**

````typescript
/**
 * Generates a deterministic password from memory password and distinction code.
 * Uses the FlowerPassword algorithm which ensures identical inputs always produce
 * identical outputs without storing passwords.
 *
 * @param memoryPassword - User's master password (memorized)
 * @param distinctionCode - Site/service identifier
 * @param length - Desired password length (default: 16)
 * @returns Generated password string
 *
 * @example
 * ```ts
 * const pwd = generatePassword('mySecret123', 'github.com', 16);
 * // Returns: "aB3$xY9..."
 * ```
 */
function generatePassword(memoryPassword: string, distinctionCode: string, length: number = 16): string {
  // Implementation...
}
````

**Comment Review Checklist:**

Before committing, review your comments and ask:

1. Does this comment explain WHY, not WHAT?
2. Would the code be clear without this comment if I improved naming/structure?
3. Does this comment add information beyond what the type signature provides?
4. Is this explaining platform-specific behavior, security, or performance concerns?
5. Would a future developer benefit from knowing this context?

If you answer "no" to most of these questions, consider removing or refactoring instead of commenting.

### File Organization

**Naming Conventions:**

- **Files**: camelCase for utilities (`parseUrl.ts`), PascalCase for components (`App.tsx`)
- **Constants**: UPPER_SNAKE_CASE (`IPC_CHANNELS`)
- **Interfaces**: PascalCase with descriptive names (`WindowConfig`, not `IWindowConfig`)
- **Functions**: camelCase, verb-first (`createWindow`, `handleClick`)

**Import Order** (enforced by ESLint):

```typescript
// 1. External dependencies
import { app, BrowserWindow } from 'electron';
import React, { useState } from 'react';

// 2. Internal modules (absolute paths)
import { IPC_CHANNELS } from '@/shared/constants';
import type { AppConfig } from '@/shared/types';

// 3. Relative imports
import { createWindow } from './window';
import styles from './App.module.less';
```

**Export/Import Conventions:**

```typescript
// ✅ Good - Named exports
export function createWindow(): BrowserWindow {
  /* ... */
}
export const CONFIG = {
  /* ... */
};
export type WindowConfig = {
  /* ... */
};

// ✅ Good - Named imports
import { createWindow, CONFIG } from './window';
import { en, zh } from './locales';

// ❌ Bad - Default exports
export default function createWindow() {
  /* ... */
}
export default CONFIG;

// ❌ Bad - Default imports
import createWindow from './window';
import locales from './locales';
```

**Why Named Exports?**

- Better tree-shaking (dead code elimination)
- Easier refactoring (rename symbol refactoring works)
- No naming inconsistencies between export and import
- Clearer API surface (explicit exports)

### Git Commit Style

**Format**: Follow [Conventional Commits](https://www.conventionalcommits.org/)

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructuring (no behavior change)
- `perf`: Performance improvement
- `docs`: Documentation only
- `style`: Code style (formatting, no logic change)
- `test`: Add/update tests
- `chore`: Build process, dependencies, tooling

**Examples:**

```
feat(tray): add clipboard URL auto-detection

Automatically parse clipboard content on window show
to extract distinction code from URLs.

Closes #42
```

```
fix(i18n): correct Chinese translations for error messages

- Fix typo in 'hints.invalidUrl'
- Update 'form.passwordLength' description
```

### Code Review Checklist

Before submitting changes, ensure:

- [ ] TypeScript compiles with no errors (`npm run build` or type check via IDE)
- [ ] ESLint passes with no warnings (`npm run lint`)
- [ ] Prettier formatting applied (`npm run format`)
- [ ] No `any` types introduced
- [ ] All functions have explicit return types
- [ ] Comments are in English
- [ ] i18n keys added to both `en.ts` and `zh.ts` (in both main and renderer locales if applicable)
- [ ] Platform-specific code tested (macOS, Windows, Linux if applicable)
- [ ] No console.log left in production code (use proper logging)

### Performance Guidelines

**Optimization Priorities:**

1. **Startup time** - Keep main process imports minimal
2. **Build time** - Leverage Vite caching (`.vite/` directory)
3. **Bundle size** - Tree-shaking friendly code (named exports)
4. **Runtime performance** - Use React.memo/useMemo for expensive renders

**Do's:**

- ✅ Use `useCallback` for event handlers passed to child components
- ✅ Use `useMemo` for expensive calculations
- ✅ Lazy load heavy dependencies if possible
- ✅ Use Electron IPC efficiently (batch requests when possible)

**Don'ts:**

- ❌ Synchronous file I/O in main process (blocks UI)
- ❌ Large dependencies imported globally
- ❌ Unnecessary re-renders (missing dependency arrays)
- ❌ Memory leaks (unsubscribed event listeners)
