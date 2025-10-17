# Repository Guidelines

## Project Structure & Module Organization

- Electron tray app (macOS primary; Windows/Linux builds via CI). Native `Tray`/`BrowserWindow` (no menubar dependency).
- TypeScript source under `src/`:
  - Main process: `src/main/app.ts` → compiled to `dist-app/main/app.js` (entry in `package.json:main`).
  - Renderer: `src/renderer/index.ts` → compiled to `dist-app/renderer/index.js`.
  - Renderer HTML/CSS: `src/renderer/index.html`, `src/renderer/styles/{reset.css,index.css}`.
- Assets: `images/` (tray/app icons) copied to `dist-app/images/`.
- Packaging config: `electron-builder` via `package.json` `build` field; helper `makefile`.
- No dedicated `test/` directory yet.

## Build And Development

- Install dependencies:
  - `npm install`

- Run locally (compile TS + copy assets, then launch Electron):
  - `npm start`

- Package app locally:
  - macOS (x64/arm64): `npm run build:mac` or `make package`
  - Windows: `npm run build:win`
  - Linux: `npm run build:linux`

- Release via GitHub Actions:
  - Push a tag like `v3.6.5` (or `3.6.5`) to trigger CI that builds for macOS/Windows/Linux and creates a GitHub Release.
  - Version bump helpers: `npm run release:major|minor|patch` (creates a version commit and tag).

## Coding Style & Naming

- EditorConfig: 2-space indent, LF, UTF-8, final newline.
- TypeScript: `strict` mode; prefer single quotes and concise, readable code.
- Naming: lowerCamelCase for variables/functions; UpperCamelCase for classes; kebab-case for files/assets when possible.
- Keep main-process code minimal; UI logic in renderer (`src/renderer/index.ts`).

## Testing

- No unit tests yet; add focused tests if introducing complex logic.
- Minimum expectation: builds locally (`npm start`) and passes type-check (`tsc -p tsconfig.json --noEmit`).

## Commit & Pull Request Guidelines

- Commit style: concise, imperative; conventional prefixes encouraged (e.g., `feat:`, `fix:`, `chore(pkg): …`).
- Keep version-only commits for releases (e.g., `3.6.4`).
- PRs should include a clear description, screenshots/GIFs for UI changes, and linked issues.
- Target small, focused changes; update docs and scripts when behavior or commands change.

## Security & Architecture Notes

- Architecture: Electron (latest) using native `Tray`/`BrowserWindow`; tray app with global shortcut `CmdOrCtrl+Alt+S` and clipboard integration; password generation via `flowerpassword.js`.
- Renderer runs with `nodeIntegration: true`, `contextIsolation: false`. Assets are local only; do not load remote content or untrusted scripts. Sanitize any external input.
- Renderer HTML loads logic via `require('./index.js')` to execute the CommonJS bundle produced by TypeScript.
