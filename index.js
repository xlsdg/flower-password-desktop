const electron = require('electron');
const fpCode = require('node-flower-password');


// const remote = electron.remote;
const shell = electron.shell;
const ipc = electron.ipcRenderer;
const clipboard = electron.clipboard;


const btnClose = document.getElementById('close');
const iptPassword = document.getElementById('password');
const iptKey = document.getElementById('key');
const iptPrefix = document.getElementById('prefix');
const iptSuffix = document.getElementById('suffix');
const btnCode = document.getElementById('code');
const selLength = document.getElementById('length');


iptPassword.addEventListener('input', showCode, false);
iptKey.addEventListener('input', showCode, false);
iptPrefix.addEventListener('input', showCode, false);
iptSuffix.addEventListener('input', showCode, false);
selLength.addEventListener('change', showCode, false);

iptKey.addEventListener('keypress', function(e) {
    if (e.keyCode === 13) {
        let code = showCode();
        if (code !== false) {
            clipboard.writeText(code, 'text');
            e.preventDefault();
            hide();
        }
    }
}, false);

ipc.on('key-from-clipboard', function(event, message) {
    iptKey.value = message;
    showCode();
});

function hide() {
    ipc.send('hide', 'hide');
}

function showCode(e) {
    let password = iptPassword.value;
    let key = iptKey.value;
    let prefix = iptPrefix.value;
    let suffix = iptSuffix.value;
    let length = selLength.value;
    let code = '生成密码(点击复制)';

    if ((password.length < 1) || (key.length < 1)) {
        btnCode.textContent = code;
        return false;
    }

    key = prefix + key + suffix;
    code = fpCode(password, key, length);
    btnCode.textContent = code;
    return code;
}

btnClose.addEventListener('click', function(e) {
    hide();
}, false);

btnCode.addEventListener('click', function(e) {
    let code = showCode();
    if (code !== false) {
        clipboard.writeText(code);
        hide();
    }
}, false);


const links = document.querySelectorAll('a[href]');

Array.prototype.forEach.call(links, function(link) {
    const url = link.getAttribute('href');
    if (url.indexOf('http') === 0) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            shell.openExternal(url);
        })
    }
})
