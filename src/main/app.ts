import path from 'path'
import { app, Menu, dialog, ipcMain, clipboard, globalShortcut, Tray, BrowserWindow, screen } from 'electron'
import psl from 'psl'
import urlite from 'urlite'

let tray: Tray | null = null
let win: BrowserWindow | null = null

const WINDOW_OPTS: Electron.BrowserWindowConstructorOptions = {
  width: 300,
  height: 334,
  resizable: false,
  show: false,
  frame: false,
  webPreferences: {
    nodeIntegration: true,
    contextIsolation: false
  }
}

// Assets are copied to dist-app/ at runtime; __dirname is dist-app/main
const DIST_DIR = path.join(__dirname, '..')
const TRAY_ICON = path.join(DIST_DIR, 'images', 'IconTemplate.png')
const APP_ICON = path.join(DIST_DIR, 'images', 'Icon.png')

main()

function initProcess () {
  // Global exception handler
  process.on('uncaughtException', function (err: any) {
    dialog.showErrorBox('Uncaught Exception: ' + err.message, err.stack || '')
    app.quit()
  })
}

function createTray () {
  tray = new Tray(TRAY_ICON)
  tray.setToolTip('花密')

  tray.on('click', function () { toggleWindow() })

  const contextMenu = Menu.buildFromTemplate([
    { label: '显示', click: function () { showWindow() } },
    { type: 'separator' },
    { label: '退出', click: confirmQuit }
  ])

  tray.on('right-click', function () {
    hideWindow()
    tray?.popUpContextMenu(contextMenu)
  })
}

function createWindow () {
  win = new BrowserWindow({ ...WINDOW_OPTS })
  // Load renderer HTML from dist-app/renderer
  win.loadFile(path.join(DIST_DIR, 'renderer', 'index.html'))


  if (process.platform === 'darwin' && (app as any).dock) {
    app.dock!.hide()
  }

  win.on('blur', function () {
    if (win && !win.webContents.isDevToolsOpened()) hideWindow()
  })
}

function initIpc () {
  ipcMain.on('show', function () { showWindow() })
  ipcMain.on('hide', function () { hideWindow() })
  ipcMain.on('quit', function () { app.quit() })
  ipcMain.on('confirmQuit', confirmQuit)
}

function initMenu () {
  const template: Electron.MenuItemConstructorOptions[] = [{
    label: 'Edit',
    submenu: [{ label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
      { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
      { type: 'separator' },
      { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
      { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
      { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
      { label: 'Select All', accelerator: 'CmdOrCtrl+A', role: 'selectAll' }]
  }]

  const _menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(_menu)
}

function initShortcut () {
  if (!globalShortcut.isRegistered('CmdOrCtrl+Alt+S')) {
    globalShortcut.register('CmdOrCtrl+Alt+S', function () { showWindow() })
  }
}

function init () {
  initProcess()
  initIpc()
  initMenu()
  createTray()
  createWindow()
  initShortcut()
}

function main () {
  app.on('ready', function () { init() })
  app.on('will-quit', function () { globalShortcut.unregisterAll() })
}

function getWindowPosition () {
  if (!tray || !win) return { x: 0, y: 0 }
  const trayBounds = tray.getBounds()
  const windowBounds = win.getBounds()
  const primary = screen.getPrimaryDisplay()
  const screenBounds = primary.workArea

  const x = Math.round(Math.max(screenBounds.x, Math.min(
    trayBounds.x + Math.floor((trayBounds.width - windowBounds.width) / 2),
    screenBounds.x + screenBounds.width - windowBounds.width
  )))

  const y = process.platform === 'darwin'
    ? screenBounds.y + 22
    : Math.max(screenBounds.y, Math.min(trayBounds.y - windowBounds.height, screenBounds.y + screenBounds.height - windowBounds.height))

  return { x, y }
}

function showWindow () {
  if (!win) return
  const position = getWindowPosition()
  win.setPosition(position.x, position.y, false)
  win.show()
  win.focus()
  afterShow()
}

function hideWindow () { if (win) win.hide() }

function toggleWindow () { if (win) (win.isVisible() ? hideWindow() : showWindow()) }

function afterShow () {
  const text = clipboard.readText()
  if (text && text.length) {
    const url = urlite.parse(text) as any
    if (url && url.hostname && psl.isValid(url.hostname)) {
      const parsed = psl.parse(url.hostname) as any
      win?.webContents.send('key-from-clipboard', (parsed as any).sld)
    }
  }
}

function confirmQuit () {
  hideWindow()
  dialog.showMessageBox({
    type: 'question',
    buttons: ['确定', '取消'],
    defaultId: 0,
    title: '花密',
    message: '确定退出？',
    icon: APP_ICON,
    cancelId: 1
  }).then(function (result) {
    if (result.response === 0) app.quit()
  })
}
