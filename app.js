const fs = require('fs');
const path = require('path');
const fixPath = require('fix-path');
const userEnv = require('user-env');
const menuBar = require('menubar');
const electron = require('electron');


const dialog = electron.dialog;
const ipc = electron.ipcMain;
const globalShortcut = electron.globalShortcut;

const opts = {
    'tooltip': '花密',
    'dir': __dirname,
    'icon': path.join(__dirname, 'images', 'IconTemplate.png'),
    'width': 300,
    'height': 300,
    'preloadWindow': true,
    'resizable': false,
    'showDockIcon': false,
    'showOnRightClick': false
};

const menu = menuBar(opts);

main();

function initProcess() {
    // use current user env (https://github.com/sindresorhus/shell-path/issues/7)
    try {
        process.env = userEnv();
    } catch (e) {}

    process.on('uncaughtException', function(err) {
        dialog.showErrorBox('Uncaught Exception: ' + err.message, err.stack || '');
        menu.app.quit();
    })
}

function initIpc() {
    ipc.on('hide', function(event, arg) {
        menu.hideWindow();
    });
    ipc.on('quit', function(event, arg) {
        menu.app.quit();
    });
    ipc.on('confirmQuit', confirmQuit);
}

function init() {
    // try to fix the $PATH on OS X
    fixPath();
    initProcess();
    initIpc();
}

function main() {
    init();

    menu.on('ready', ready);
    // menu.on('create-window', createWindow);
    // menu.on('after-create-window', function(e) {
    //     menu.window.openDevTools();
    // });
    // menu.on('show', show);
    // menu.on('after-show', afterShow);
    // menu.on('hide', hide);
    // menu.on('after-hide', afterHide);
    // menu.on('after-close', afterClose);
    // menu.on('focus-lost', focusLost);
    menu.app.on('will-quit', function(e) {
        globalShortcut.unregisterAll();
    });
}

function ready(e) {
    if (!globalShortcut.isRegistered('Command+Alt+S')) {
        globalShortcut.register('Command+Alt+S', function() {
            menu.showWindow();
        });
    }
}

function confirmQuit(event, arg) {
    menu.hideWindow();
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
            menu.app.quit();
        }
    });
}
