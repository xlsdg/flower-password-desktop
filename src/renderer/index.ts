import { shell, ipcRenderer as ipc, clipboard } from 'electron'
import fpCode from 'flowerpassword.js'

const btnClose = document.getElementById('close') as HTMLElement
const iptPassword = document.getElementById('password') as HTMLInputElement
const iptKey = document.getElementById('key') as HTMLInputElement
const iptPrefix = document.getElementById('prefix') as HTMLInputElement
const iptSuffix = document.getElementById('suffix') as HTMLInputElement
const btnCode = document.getElementById('code') as HTMLButtonElement
const selLength = document.getElementById('length') as HTMLSelectElement

iptPassword.addEventListener('input', showCode, false)
iptKey.addEventListener('input', showCode, false)
iptPrefix.addEventListener('input', showCode, false)
iptSuffix.addEventListener('input', showCode, false)
selLength.addEventListener('change', showCode, false)

iptKey.addEventListener('keypress', function (e) {
  if ((e as KeyboardEvent).key === 'Enter' || (e as any).keyCode === 13) {
    const code = showCode()
    if (code !== false) {
      clipboard.writeText(code as string)
      e.preventDefault()
      hide()
    }
  }
}, false)

ipc.on('key-from-clipboard', function (_event, message) {
  iptKey.value = message
  showCode()
})

function hide () {
  ipc.send('hide', 'hide')
}

function showCode (_e?: Event) {
  const password = iptPassword.value
  let key = iptKey.value
  const prefix = iptPrefix.value
  const suffix = iptSuffix.value
  const length = parseInt(selLength.value, 10)
  let code = '生成密码(点击复制)'

  if ((password.length < 1) || (key.length < 1)) {
    btnCode.textContent = code as string
    return false
  }

  if (!fpCode) {
    btnCode.textContent = code as string
    return false
  }

  key = prefix + key + suffix
  code = fpCode(password, key, length)
  btnCode.textContent = code as string
  return code
}

btnClose.addEventListener('click', function () { hide() }, false)

btnCode.addEventListener('click', function () {
  const code = showCode()
  if (code !== false) {
    clipboard.writeText(code as string)
    hide()
  }
}, false)

const links = document.querySelectorAll('a[href]')
Array.prototype.forEach.call(links, function (link: HTMLAnchorElement) {
  const url = link.getAttribute('href') || ''
  if (url.indexOf('https') === 0) {
    link.addEventListener('click', function (e) {
      e.preventDefault()
      shell.openExternal(url)
    })
  }
})
