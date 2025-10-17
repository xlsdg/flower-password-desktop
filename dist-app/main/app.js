"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const electron_1 = require("electron");
const psl_1 = __importDefault(require("psl"));
const urlite_1 = __importDefault(require("urlite"));
let tray = null;
let win = null;
const WINDOW_OPTS = {
    width: 300,
    height: 334,
    resizable: false,
    show: false,
    frame: false,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
    }
};
// Assets are copied to dist-app/ at runtime; __dirname is dist-app/main
const DIST_DIR = path_1.default.join(__dirname, '..');
const TRAY_ICON = path_1.default.join(DIST_DIR, 'images', 'IconTemplate.png');
const APP_ICON = path_1.default.join(DIST_DIR, 'images', 'Icon.png');
main();
function initProcess() {
    // Global exception handler
    process.on('uncaughtException', function (err) {
        electron_1.dialog.showErrorBox('Uncaught Exception: ' + err.message, err.stack || '');
        electron_1.app.quit();
    });
}
function createTray() {
    tray = new electron_1.Tray(TRAY_ICON);
    tray.setToolTip('花密');
    tray.on('click', function () { toggleWindow(); });
    const contextMenu = electron_1.Menu.buildFromTemplate([
        { label: '显示', click: function () { showWindow(); } },
        { type: 'separator' },
        { label: '退出', click: confirmQuit }
    ]);
    tray.on('right-click', function () {
        hideWindow();
        tray?.popUpContextMenu(contextMenu);
    });
}
function createWindow() {
    win = new electron_1.BrowserWindow({ ...WINDOW_OPTS });
    // Load renderer HTML from dist-app/renderer
    win.loadFile(path_1.default.join(DIST_DIR, 'renderer', 'index.html'));
    if (process.platform === 'darwin' && electron_1.app.dock) {
        electron_1.app.dock.hide();
    }
    win.on('blur', function () {
        if (win && !win.webContents.isDevToolsOpened())
            hideWindow();
    });
}
function initIpc() {
    electron_1.ipcMain.on('show', function () { showWindow(); });
    electron_1.ipcMain.on('hide', function () { hideWindow(); });
    electron_1.ipcMain.on('quit', function () { electron_1.app.quit(); });
    electron_1.ipcMain.on('confirmQuit', confirmQuit);
}
function initMenu() {
    const template = [{
            label: 'Edit',
            submenu: [{ label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
                { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
                { type: 'separator' },
                { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
                { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
                { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
                { label: 'Select All', accelerator: 'CmdOrCtrl+A', role: 'selectAll' }]
        }];
    const _menu = electron_1.Menu.buildFromTemplate(template);
    electron_1.Menu.setApplicationMenu(_menu);
}
function initShortcut() {
    if (!electron_1.globalShortcut.isRegistered('CmdOrCtrl+Alt+S')) {
        electron_1.globalShortcut.register('CmdOrCtrl+Alt+S', function () { showWindow(); });
    }
}
function init() {
    initProcess();
    initIpc();
    initMenu();
    createTray();
    createWindow();
    initShortcut();
}
function main() {
    electron_1.app.on('ready', function () { init(); });
    electron_1.app.on('will-quit', function () { electron_1.globalShortcut.unregisterAll(); });
}
function getWindowPosition() {
    if (!tray || !win)
        return { x: 0, y: 0 };
    const trayBounds = tray.getBounds();
    const windowBounds = win.getBounds();
    const primary = electron_1.screen.getPrimaryDisplay();
    const screenBounds = primary.workArea;
    const x = Math.round(Math.max(screenBounds.x, Math.min(trayBounds.x + Math.floor((trayBounds.width - windowBounds.width) / 2), screenBounds.x + screenBounds.width - windowBounds.width)));
    const y = process.platform === 'darwin'
        ? screenBounds.y + 22
        : Math.max(screenBounds.y, Math.min(trayBounds.y - windowBounds.height, screenBounds.y + screenBounds.height - windowBounds.height));
    return { x, y };
}
function showWindow() {
    if (!win)
        return;
    const position = getWindowPosition();
    win.setPosition(position.x, position.y, false);
    win.show();
    win.focus();
    afterShow();
}
function hideWindow() { if (win)
    win.hide(); }
function toggleWindow() { if (win)
    (win.isVisible() ? hideWindow() : showWindow()); }
function afterShow() {
    const text = electron_1.clipboard.readText();
    if (text && text.length) {
        const url = urlite_1.default.parse(text);
        if (url && url.hostname && psl_1.default.isValid(url.hostname)) {
            const parsed = psl_1.default.parse(url.hostname);
            win?.webContents.send('key-from-clipboard', parsed.sld);
        }
    }
}
function confirmQuit() {
    hideWindow();
    electron_1.dialog.showMessageBox({
        type: 'question',
        buttons: ['确定', '取消'],
        defaultId: 0,
        title: '花密',
        message: '确定退出？',
        icon: APP_ICON,
        cancelId: 1
    }).then(function (result) {
        if (result.response === 0)
            electron_1.app.quit();
    });
}
