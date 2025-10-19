# CLAUDE.md

This file provides comprehensive guidance for AI assistants (Claude Code) when working with the FlowerPassword Desktop repository.

## Project Overview

**FlowerPassword Desktop** is a secure, cross-platform password manager built with modern web technologies. It uses deterministic password generation via the [flowerpassword.js](https://github.com/xlsdg/flowerpassword.js) library - users memorize one master password ("memory password") and combine it with site-specific "distinction codes" to generate unique, strong passwords without storing them.

### Tech Stack

- **Runtime**: Electron 38 (Node.js + Chromium)
- **UI**: React 19 (functional components + hooks)
- **Language**: TypeScript 5.9 (strict mode)
- **Bundler**: Rspack 1.5+ with SWC loader (fast builds)
- **Styles**: LESS with CSS variables (auto light/dark theme)
- **i18n**: i18next + react-i18next (Chinese/English)
- **Package Manager**: npm (lockfile v3)

### Supported Platforms

| Platform | Architectures | Output Formats |
|----------|--------------|----------------|
| **macOS** | ARM64 (Apple Silicon), x64 (Intel) | DMG, ZIP |
| **Windows** | x64, ia32 | Setup.exe (Squirrel), ZIP |
| **Linux** | x64, ARM64 | .deb, .rpm, ZIP |

## Development Workflow

### Initial Setup

```bash
npm install          # Install all dependencies
```

### Daily Development

```bash
npm run dev          # Start dev mode (hot reload + auto-restart main process)
npm start            # Build once and launch app (no hot reload)
npm run build        # Manually build all processes (main/preload/renderer)
```

### Code Quality

```bash
npm run lint         # Run ESLint + TypeScript type checking
npm run format       # Auto-format code with Prettier
npm run format:check # Check formatting without modifying files
```

### Build System Notes

- **Rspack** compiles all three Electron processes (main/preload/renderer) using SWC loader for fast transpilation
- TypeScript runs in type-check-only mode (`noEmit: true`) - no TSC compilation overhead
- Dev mode uses `watch` mode + `nodemon` to auto-restart on main process changes
- Renderer uses hot module replacement (HMR) for instant UI updates

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

| Platform | Output Directory | Installer Types |
|----------|-----------------|-----------------|
| macOS | `out/make/` | `.dmg` (drag-to-install), `.zip` (portable) |
| Windows | `out/make/squirrel.windows/` | `Setup.exe` (auto-updater), `.zip` (portable) |
| Linux | `out/make/` | `.deb` (Debian/Ubuntu), `.rpm` (Fedora/RHEL), `.zip` (portable) |

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
│   │   └── i18n.ts     # Main process translations
│   │
│   ├── preload/        # Preload script (security bridge)
│   │   └── index.ts    # contextBridge API exposure
│   │
│   ├── renderer/       # React app (renderer process)
│   │   ├── App.tsx     # Main React component
│   │   ├── index.tsx   # React entry point
│   │   ├── i18n.ts     # i18next configuration
│   │   ├── locales/    # Translation files (en.ts, zh.ts)
│   │   ├── html/       # HTML template
│   │   ├── styles/     # LESS stylesheets
│   │   ├── assets/     # Images, fonts, icons
│   │   └── global.d.ts # TypeScript global declarations
│   │
│   ├── shared/         # Shared code (main + renderer)
│   │   ├── types.ts    # TypeScript interfaces
│   │   └── constants.ts # App constants
│   │
│   └── types/          # Type declarations for untyped packages
│       └── psl.d.ts    # Public Suffix List library types
│
├── assets/             # Build-time assets
│   ├── FlowerPassword.icns  # macOS icon
│   ├── FlowerPassword.ico   # Windows icon
│   └── Icon.png            # Linux icon (PNG source)
│
├── dist/               # Compiled JavaScript (Rspack output)
│   ├── main/           # Compiled main process
│   ├── preload/        # Compiled preload script
│   └── renderer/       # Compiled React app + assets
│
├── out/                # Electron Forge packaging output
│   ├── make/           # Distribution installers
│   └── FlowerPassword-{platform}-{arch}/ # Packaged app
│
├── rspack.config.js    # Rspack bundler configuration
├── forge.config.js     # Electron Forge packaging config
├── tsconfig.json       # TypeScript compiler settings
├── eslint.config.mjs   # ESLint v9 flat config
└── .prettierrc.json    # Prettier formatting rules
```

### Key Modules & Responsibilities

#### Main Process (Node.js Backend)

| Module | Purpose | Key Features |
|--------|---------|--------------|
| [main.ts](src/main/main.ts) | App lifecycle & entry point | Single instance enforcement, error handling, macOS dock hiding, i18n init |
| [window.ts](src/main/window.ts) | Window management | Platform-specific configs (macOS: floating level + all workspaces; Win/Linux: always-on-top) |
| [tray.ts](src/main/tray.ts) | System tray integration | Template icons (macOS), context menu, clipboard URL parsing, click handlers |
| [position.ts](src/main/position.ts) | Smart positioning | Tray-relative positioning (macOS menubar, Win/Linux taskbar), cursor-based fallback |
| [menu.ts](src/main/menu.ts) | Application menu | Edit menu, global shortcut registration (`Cmd+Alt+S` for show/hide) |
| [ipc.ts](src/main/ipc.ts) | IPC handlers | Window control (hide/quit), clipboard access, shell integration, locale detection |
| [i18n.ts](src/main/i18n.ts) | Main process i18n | Lightweight translation system for dialogs/tray (no dependencies) |

#### Preload Script (Security Bridge)

| Module | Purpose | Security Model |
|--------|---------|----------------|
| [index.ts](src/preload/index.ts) | Context bridge | Exposes `window.electronAPI` via `contextBridge` with strict API surface |

#### Renderer Process (React UI)

| Module | Purpose | Key Features |
|--------|---------|--------------|
| [App.tsx](src/renderer/App.tsx) | Main UI component | Password generation, real-time updates, clipboard auto-fill, form validation |
| [index.tsx](src/renderer/index.tsx) | React entry point | i18n initialization, React 19 createRoot, dynamic `<html lang>` updates |
| [i18n.ts](src/renderer/i18n.ts) | Renderer i18n | i18next + react-i18next, namespace organization, fallback handling |
| [locales/](src/renderer/locales/) | Translation files | en.ts (English), zh.ts (Chinese) - structured by namespaces (`app`, `form`, `hints`) |

#### Shared Code

| Module | Purpose | Usage |
|--------|---------|-------|
| [types.ts](src/shared/types.ts) | TypeScript interfaces | Shared types between main/renderer processes |
| [constants.ts](src/shared/constants.ts) | App constants | IPC channel names, app metadata, default values |

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

| Feature | macOS | Windows | Linux |
|---------|-------|---------|-------|
| **Window Level** | Floating (appears over fullscreen) | Always-on-top | Always-on-top |
| **Workspaces** | Visible on all Spaces/Desktops | N/A | N/A |
| **Tray Position** | Below menubar (center-aligned) | Above taskbar (right-aligned) | Above taskbar (varies by DE) |
| **Tray Icon** | Template mode (auto dark/light) | Standard color icon | Standard color icon |
| **Dock/Taskbar** | Hidden (`app.dock.hide()`) | Hidden (no taskbar button) | Hidden (no panel button) |
| **Global Shortcut** | Works in fullscreen apps | Requires app focus | Requires app focus |
| **Window Activation** | No workspace switching | Standard focus | Standard focus |

**Implementation Details:**

- **macOS**: `setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })` + floating window level
- **Windows/Linux**: `setAlwaysOnTop(true)` with standard behavior
- **Positioning**: Calculated in [position.ts](src/main/position.ts) using `tray.getBounds()` and screen workarea

## Internationalization (i18n)

### Supported Languages

| Language | Code | Fallback | Regions |
|----------|------|----------|---------|
| **English** | `en` | ✅ Default | Global (en-US, en-GB, etc.) |
| **Chinese** | `zh` | - | zh-CN, zh-TW, zh-HK |

### Architecture Overview

FlowerPassword uses a **dual i18n system** to handle translations in both Electron processes:

#### Main Process i18n

**Implementation**: [src/main/i18n.ts](src/main/i18n.ts)

- **Lightweight** - No external dependencies (simple object lookup)
- **Use Cases** - Error dialogs, system tray menu, tooltips, notifications
- **Detection** - `app.getLocale()` (e.g., `zh-CN` → `zh`)
- **API** - `t(key)` function returns translated string

```typescript
// Example usage in main process
import { t } from './i18n';
tray.setToolTip(t('tray.tooltip'));
```

#### Renderer Process i18n

**Implementation**: [src/renderer/i18n.ts](src/renderer/i18n.ts) + [locales/](src/renderer/locales/)

- **Full-featured** - Uses `i18next` + `react-i18next`
- **Namespaces** - `app`, `form`, `hints` (organized by feature)
- **React Integration** - `useTranslation()` hook
- **Type Safety** - TypeScript types for translation keys

```typescript
// Example usage in React components
import { useTranslation } from 'react-i18next';

function App() {
  const { t } = useTranslation('form');
  return <label>{t('memoryPassword')}</label>;
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
// src/main/i18n.ts
const TRANSLATIONS = {
  en: { /* existing */ },
  zh: { /* existing */ },
  ja: {  // Add new language
    'app.quit': 'アプリケーションを終了',
    'tray.tooltip': 'フラワーパスワード',
    // ...
  },
};
```

**Step 2**: Create renderer translation file

```typescript
// src/renderer/locales/ja.ts
export default {
  app: {
    title: 'フラワーパスワード',
    // ...
  },
  form: {
    memoryPassword: '記憶パスワード',
    // ...
  },
};
```

**Step 3**: Update detection logic

```typescript
// src/main/i18n.ts & src/renderer/i18n.ts
const detectLanguage = (locale: string): string => {
  const lang = locale.split('-')[0];
  if (lang === 'zh') return 'zh';
  if (lang === 'ja') return 'ja';  // Add check
  return 'en';  // Default fallback
};
```

**Step 4**: Import new locale in renderer

```typescript
// src/renderer/i18n.ts
import en from './locales/en';
import zh from './locales/zh';
import ja from './locales/ja';  // Add import

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh },
    ja: { translation: ja },  // Add resource
  },
  // ...
});
```

### Translation File Structure

Renderer translations use namespaces for organization:

```typescript
// src/renderer/locales/en.ts
export default {
  app: {
    title: 'FlowerPassword',
    subtitle: 'Memorable, Secure Passwords',
  },
  form: {
    memoryPassword: 'Memory Password',
    distinguishingCode: 'Distinguishing Code',
    passwordLength: 'Password Length',
  },
  hints: {
    emptyMemoryPassword: 'Please enter memory password',
    invalidUrl: 'Invalid URL format',
  },
};
```

**Best Practices:**

- Use dot notation for nested keys: `t('form.memoryPassword')`
- Keep keys in English (language-neutral)
- No interpolation in main process (simple string lookups)
- Use i18next features in renderer (plurals, context, interpolation)

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
function calculatePassword(input, length) {  // Implicit any
  return input.slice(0, length);
}
```

**ESLint Configuration:**

- **Version**: ESLint v9+ (flat config format - `eslint.config.mjs`)
- **Parser**: `@typescript-eslint/parser` with type-aware rules
- **Plugins**: `@typescript-eslint`, `prettier`
- **Rules**: `recommended-type-checked` + Prettier integration

### Code Formatting (Prettier)

**Settings** (`.prettierrc.json`):

```json
{
  "semi": true,              // Semicolons required
  "singleQuote": true,       // Single quotes for strings
  "printWidth": 120,         // 120 characters per line
  "tabWidth": 2,             // 2 spaces indentation
  "trailingComma": "es5",    // ES5 trailing commas (objects, arrays)
  "endOfLine": "lf",         // Unix line endings
  "arrowParens": "always"    // Always parentheses for arrow functions
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

| Hook | Purpose | Example |
|------|---------|---------|
| `useState` | Local state | `const [count, setCount] = useState<number>(0)` |
| `useEffect` | Side effects, lifecycle | `useEffect(() => { /* fetch data */ }, [deps])` |
| `useCallback` | Memoized callbacks | `const handler = useCallback(() => {}, [deps])` |
| `useMemo` | Memoized values | `const value = useMemo(() => compute(), [deps])` |
| `useRef` | DOM refs, mutable values | `const inputRef = useRef<HTMLInputElement>(null)` |
| `useTranslation` | i18n (react-i18next) | `const { t } = useTranslation('namespace')` |

**Avoid:**

- ❌ Class components (use functional components)
- ❌ `React.FC` type (deprecated pattern)
- ❌ Default exports (use named exports for better tree-shaking)

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

**Language Policy:**

- ✅ **All comments MUST be in English** (no Chinese/other languages)
- ✅ Use JSDoc for function documentation
- ✅ Explain "why", not "what" (code should be self-documenting)

```typescript
// ✅ Good - Explains reasoning
// Use setTimeout to debounce rapid clicks and prevent double submissions
function handleClick() { /* ... */ }

// ❌ Bad - States the obvious
// This function handles clicks
function handleClick() { /* ... */ }

// ❌ Bad - Non-English comment
// 处理点击事件
function handleClick() { /* ... */ }
```

**JSDoc Example:**

```typescript
/**
 * Generates a deterministic password from memory password and distinction code.
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
function generatePassword(
  memoryPassword: string,
  distinctionCode: string,
  length: number = 16
): string {
  // Implementation...
}
```

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

- [ ] TypeScript compiles with no errors (`npm run build`)
- [ ] ESLint passes with no warnings (`npm run lint`)
- [ ] Prettier formatting applied (`npm run format`)
- [ ] No `any` types introduced
- [ ] All functions have explicit return types
- [ ] Comments are in English
- [ ] i18n keys added to both `en.ts` and `zh.ts`
- [ ] Platform-specific code tested (macOS, Windows, Linux if applicable)
- [ ] No console.log left in production code (use proper logging)

### Performance Guidelines

**Optimization Priorities:**

1. **Startup time** - Keep main process imports minimal
2. **Build time** - Leverage Rspack caching (`.rspack_cache/`)
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
