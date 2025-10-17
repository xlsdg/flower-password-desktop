"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const flowerpassword_js_1 = __importDefault(require("flowerpassword.js"));
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
iptKey.addEventListener('keypress', function (e) {
    if (e.key === 'Enter' || e.keyCode === 13) {
        const code = showCode();
        if (code !== false) {
            electron_1.clipboard.writeText(code);
            e.preventDefault();
            hide();
        }
    }
}, false);
electron_1.ipcRenderer.on('key-from-clipboard', function (_event, message) {
    iptKey.value = message;
    showCode();
});
function hide() {
    electron_1.ipcRenderer.send('hide', 'hide');
}
function showCode(_e) {
    const password = iptPassword.value;
    let key = iptKey.value;
    const prefix = iptPrefix.value;
    const suffix = iptSuffix.value;
    const length = parseInt(selLength.value, 10);
    let code = '生成密码(点击复制)';
    if ((password.length < 1) || (key.length < 1)) {
        btnCode.textContent = code;
        return false;
    }
    if (!flowerpassword_js_1.default) {
        btnCode.textContent = code;
        return false;
    }
    key = prefix + key + suffix;
    code = (0, flowerpassword_js_1.default)(password, key, length);
    btnCode.textContent = code;
    return code;
}
btnClose.addEventListener('click', function () { hide(); }, false);
btnCode.addEventListener('click', function () {
    const code = showCode();
    if (code !== false) {
        electron_1.clipboard.writeText(code);
        hide();
    }
}, false);
const links = document.querySelectorAll('a[href]');
Array.prototype.forEach.call(links, function (link) {
    const url = link.getAttribute('href') || '';
    if (url.indexOf('https') === 0) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            electron_1.shell.openExternal(url);
        });
    }
});
