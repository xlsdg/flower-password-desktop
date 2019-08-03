const fs = require('fs');
const path = require('path');
const fixPath = require('fix-path');
const userEnv = require('user-env');
const { menubar } = require('menubar');
const electron = require('electron');
const psl = require('psl');
const urlite = require('urlite');


const menu = electron.Menu;
const dialog = electron.dialog;
const ipc = electron.ipcMain;
const clipboard = electron.clipboard;
const globalShortcut = electron.globalShortcut;


const opts = {
    'dir': __dirname,
    // index: ,
    'browserWindow': {
      // x: ,
      // y: ,
      'width': 300,
      'height': 334,
      // 'alwaysOnTop': true,
    },
    'icon': path.join(__dirname, 'images', 'IconTemplate.png'),
    'tooltip': '花密',
    // tray: ,
    'preloadWindow': true,
    // showOnAllWorkspaces: ,
    // windowPosition: ,
    'resizable': false,
    'showDockIcon': false,
    'showOnRightClick': false
};

const fpMenuBar = menubar(opts);

main();

function initProcess() {
    // use current user env (https://github.com/sindresorhus/shell-path/issues/7)
    try {
        process.env = userEnv();
    } catch (e) {}

    process.on('uncaughtException', function(err) {
        dialog.showErrorBox('Uncaught Exception: ' + err.message, err.stack || '');
        fpMenuBar.app.quit();
    })
}

function initIpc() {
    ipc.on('show', function(event, arg) {
        fpMenuBar.showWindow();
    });
    ipc.on('hide', function(event, arg) {
        fpMenuBar.hideWindow();
    });
    ipc.on('quit', function(event, arg) {
        fpMenuBar.app.quit();
    });
    ipc.on('confirmQuit', confirmQuit);
}

function initMenu() {
    let template = [{
        label: 'Edit',
        submenu: [{
            label: 'Undo',
            accelerator: 'CmdOrCtrl+Z',
            role: 'undo'
        }, {
            label: 'Redo',
            accelerator: 'Shift+CmdOrCtrl+Z',
            role: 'redo'
        }, {
            type: 'separator'
        }, {
            label: 'Cut',
            accelerator: 'CmdOrCtrl+X',
            role: 'cut'
        }, {
            label: 'Copy',
            accelerator: 'CmdOrCtrl+C',
            role: 'copy'
        }, {
            label: 'Paste',
            accelerator: 'CmdOrCtrl+V',
            role: 'paste'
        }, {
            label: 'Select All',
            accelerator: 'CmdOrCtrl+A',
            role: 'selectall'
        }]
    }];

    let _menu = menu.buildFromTemplate(template);
    menu.setApplicationMenu(_menu);
}

function initContextMenu() {
    let contextMenu = menu.buildFromTemplate([{
        'label': '显示',
        'click': function() {
            fpMenuBar.showWindow();
        }
    }, {
        'type': 'separator'
    }, {
        'label': '退出',
        'click': confirmQuit
    }]);

    fpMenuBar.tray.on('right-click', function() {
        fpMenuBar.hideWindow();
        fpMenuBar.tray.popUpContextMenu(contextMenu);
    });
}

function initShortcut() {
    if (!globalShortcut.isRegistered('CmdOrCtrl+Alt+S')) {
        globalShortcut.register('CmdOrCtrl+Alt+S', function() {
            fpMenuBar.showWindow();
        });
    }
}

function init() {
    initProcess();
    initIpc();
    initMenu();
    initContextMenu();
    initShortcut();
}

function main() {
    // try to fix the $PATH on OS X
    fixPath();

    fpMenuBar.on('ready', ready);
    // fpMenuBar.on('create-window', createWindow);
    // fpMenuBar.on('after-create-window', function(e) {
    //     fpMenuBar.window.openDevTools();
    // });
    // fpMenuBar.on('show', show);
    fpMenuBar.on('after-show', afterShow);
    // fpMenuBar.on('hide', hide);
    // fpMenuBar.on('after-hide', afterHide);
    // fpMenuBar.on('after-close', afterClose);
    // fpMenuBar.on('focus-lost', focusLost);
    fpMenuBar.app.on('will-quit', function(e) {
        globalShortcut.unregisterAll();
    });
}

function ready() {
    init();
    // fpMenuBar.window.openDevTools();
}

function afterShow() {
    const text = clipboard.readText('text');
    if (text && text.length) {
        const url = urlite.parse(text);
        if (url && url.hostname && psl.isValid(url.hostname)) {
            const parsed = psl.parse(url.hostname);
            fpMenuBar.window.webContents.send('key-from-clipboard', parsed.sld);
        }
    }
}

function confirmQuit(event, arg) {
    fpMenuBar.hideWindow();
    dialog.showMessageBox({
        'type': 'question',
        'buttons': ['确定', '取消'],
        'defaultId': 0,
        'title': '花密',
        'message': '确定退出？',
        'icon': path.join(__dirname, 'images', 'Icon.png'),
        'cancelId': 1
    }, function(index) {
        if (index === 0) {
            fpMenuBar.app.quit();
        }
    });
}
