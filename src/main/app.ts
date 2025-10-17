import path from 'path'
import {
  app,
  Menu,
  dialog,
  ipcMain,
  clipboard,
  globalShortcut,
  Tray,
  BrowserWindow,
  screen,
  nativeImage,
  type BrowserWindowConstructorOptions,
  type MenuItemConstructorOptions
} from 'electron'
import psl, { type ParsedDomain } from 'psl'
import { parse as parseUrl, type URLDescriptor } from 'urlite'

let appTray: Tray | null = null
let mainWindow: BrowserWindow | null = null

const windowOptions: BrowserWindowConstructorOptions = {
  width: 300,
  height: 334,
  resizable: false,
  show: false,
  frame: false,
  webPreferences: {
    // Renderer side uses require('./index.js') per project guidelines
    nodeIntegration: true,
    contextIsolation: false
  }
}

// Assets are copied to dist-app/ at runtime; __dirname is dist-app/main
const distDir = path.join(__dirname, '..')
const trayIconPath = path.join(distDir, 'images', 'IconTemplate.png')
const appIconPath = path.join(distDir, 'images', 'Icon.png')

main()

function registerProcessHandlers (): void {
  // Global exception handler
  process.on('uncaughtException', (err: unknown) => {
    const message = err instanceof Error ? err.message : String(err)
    const stack = err instanceof Error && err.stack ? err.stack : ''
    dialog.showErrorBox('Uncaught Exception: ' + message, stack)
    app.quit()
  })
}

function createTray (): void {
  // Use a template image on macOS so the system auto-tints for light/dark modes
  // and active/inactive states. Retina (@2x) variant is picked up automatically.
  const img = nativeImage.createFromPath(trayIconPath)
  if (process.platform === 'darwin') img.setTemplateImage(true)
  appTray = new Tray(img)
  appTray.setToolTip('花密')

  appTray.on('click', () => toggleWindow())

  const contextMenu = Menu.buildFromTemplate([
    { label: '显示', click: () => showWindow() },
    { type: 'separator' },
    { label: '退出', click: () => confirmAndQuit() }
  ])

  appTray.on('right-click', () => {
    hideWindow()
    appTray?.popUpContextMenu(contextMenu)
  })
}

function createWindow (): void {
  mainWindow = new BrowserWindow({ ...windowOptions })
  // Load renderer HTML from dist-app/renderer
  mainWindow.loadFile(path.join(distDir, 'renderer', 'index.html'))

  if (process.platform === 'darwin' && app.dock) {
    app.dock.hide()
  }

  mainWindow.on('blur', () => {
    if (mainWindow && !mainWindow.webContents.isDevToolsOpened()) hideWindow()
  })

  // In case the window gets closed (e.g. via DevTools), release the reference
  mainWindow.on('closed', () => { mainWindow = null })
}

function registerIpcHandlers (): void {
  ipcMain.on('show', () => showWindow())
  ipcMain.on('hide', () => hideWindow())
  ipcMain.on('quit', () => app.quit())
  ipcMain.on('confirmQuit', () => confirmAndQuit())
}

function createApplicationMenu (): void {
  const template: MenuItemConstructorOptions[] = [{
    label: 'Edit',
    submenu: [
      { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
      { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
      { type: 'separator' },
      { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
      { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
      { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
      { label: 'Select All', accelerator: 'CmdOrCtrl+A', role: 'selectAll' }
    ]
  }]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function registerGlobalShortcuts (): void {
  if (!globalShortcut.isRegistered('CmdOrCtrl+Alt+S')) {
    // Shortcut shows the window near the mouse cursor (different from tray click)
    const ok = globalShortcut.register('CmdOrCtrl+Alt+S', () => showWindowAtCursor())
    if (!ok) console.warn('Failed to register global shortcut: CmdOrCtrl+Alt+S')
  }
}

function init (): void {
  registerProcessHandlers()
  registerIpcHandlers()
  createApplicationMenu()
  createTray()
  createWindow()
  registerGlobalShortcuts()
}

function main (): void {
  app.whenReady().then(() => init())
  app.on('will-quit', () => globalShortcut.unregisterAll())
}

function getWindowPositionForTray (): { x: number; y: number } {
  if (!appTray || !mainWindow) return { x: 0, y: 0 }

  const trayBounds = appTray.getBounds()
  const windowBounds = mainWindow.getBounds()
  const display = screen.getDisplayNearestPoint({ x: Math.round(trayBounds.x), y: Math.round(trayBounds.y) })
  const workArea = display.workArea

  // Center horizontally to the tray icon, and clamp to the current display work area
  const centeredX = trayBounds.x + Math.floor((trayBounds.width - windowBounds.width) / 2)
  const x = Math.round(
    Math.max(
      workArea.x,
      Math.min(centeredX, workArea.x + workArea.width - windowBounds.width)
    )
  )

  // macOS: place window just below the menu bar tray icon using tray bounds
  // Windows/Linux: place window above the taskbar tray (using tray y - window height), clamped to work area
  let y: number
  if (process.platform === 'darwin') {
    const verticalOffset = 4 // small gap under the menu bar
    y = Math.round(trayBounds.y + trayBounds.height + verticalOffset)
  } else {
    y = Math.max(
      workArea.y,
      Math.min(trayBounds.y - windowBounds.height, workArea.y + workArea.height - windowBounds.height)
    )
  }

  return { x, y }
}

// Compute a position where the window's top-left corner is slightly offset
// to the bottom-right of the current mouse cursor, clamped to the active work area.
function getWindowPositionForCursor (): { x: number; y: number } {
  if (!mainWindow) return { x: 0, y: 0 }

  const cursor = screen.getCursorScreenPoint()
  const display = screen.getDisplayNearestPoint(cursor)
  const workArea = display.workArea
  const windowBounds = mainWindow.getBounds()

  const padding = 8 // small gap so the cursor isn't exactly on the window corner

  // Start from cursor bottom-right with padding
  let x = cursor.x + padding
  let y = cursor.y + padding

  // Clamp to the current display work area so the window remains fully visible
  x = Math.round(
    Math.max(
      workArea.x,
      Math.min(x, workArea.x + workArea.width - windowBounds.width)
    )
  )

  y = Math.round(
    Math.max(
      workArea.y,
      Math.min(y, workArea.y + workArea.height - windowBounds.height)
    )
  )

  return { x, y }
}

function showWindow (): void {
  if (!mainWindow) return
  const position = getWindowPositionForTray()
  mainWindow.setPosition(position.x, position.y, false)
  mainWindow.show()
  mainWindow.focus()
  prefillKeyFromClipboard()
}

// Only used by the global shortcut: position relative to the mouse cursor.
function showWindowAtCursor (): void {
  if (!mainWindow) return
  const position = getWindowPositionForCursor()
  mainWindow.setPosition(position.x, position.y, false)
  mainWindow.show()
  mainWindow.focus()
  prefillKeyFromClipboard()
}

function hideWindow (): void { if (mainWindow) mainWindow.hide() }

function toggleWindow (): void { if (mainWindow) (mainWindow.isVisible() ? hideWindow() : showWindow()) }

// Try to pre-fill the key field from a valid URL on the clipboard
function prefillKeyFromClipboard (): void {
  const text = clipboard.readText().trim()
  if (!text) return

  let candidateHost: string | null = null

  // Prefer hostname parsed from a URL, fall back to plain domain text
  const parsedUrl: URLDescriptor = parseUrl(text)
  if (parsedUrl.hostname && psl.isValid(parsedUrl.hostname)) {
    candidateHost = parsedUrl.hostname
  } else if (psl.isValid(text)) {
    candidateHost = text
  }

  if (!candidateHost) return

  const parsed = psl.parse(candidateHost)
  if ('error' in parsed) return
  const sld = (parsed as ParsedDomain).sld
  if (sld) {
    mainWindow?.webContents.send('key-from-clipboard', sld)
  }
}

function confirmAndQuit (): void {
  hideWindow()
  dialog.showMessageBox({
    type: 'question',
    buttons: ['确定', '取消'],
    defaultId: 0,
    title: '花密',
    message: '确定退出？',
    icon: appIconPath,
    cancelId: 1
  }).then((result) => {
    if (result.response === 0) app.quit()
  })
}
