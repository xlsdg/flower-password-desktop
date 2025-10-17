import { shell, ipcRenderer as ipc, clipboard } from 'electron'
import fpCode from 'flowerpassword.js'

const DEFAULT_BUTTON_TEXT = '生成密码(点击复制)'

// UI elements
const closeButton = document.getElementById('close') as HTMLElement
const passwordInput = document.getElementById('password') as HTMLInputElement
const keyInput = document.getElementById('key') as HTMLInputElement
const prefixInput = document.getElementById('prefix') as HTMLInputElement
const suffixInput = document.getElementById('suffix') as HTMLInputElement
const codeButton = document.getElementById('code') as HTMLButtonElement
const lengthSelect = document.getElementById('length') as HTMLSelectElement

passwordInput.addEventListener('input', updateCode, false)
keyInput.addEventListener('input', updateCode, false)
prefixInput.addEventListener('input', updateCode, false)
suffixInput.addEventListener('input', updateCode, false)
lengthSelect.addEventListener('change', updateCode, false)

// Press Enter in the key field to copy & hide quickly
keyInput.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    const code = updateCode()
    if (code) {
      clipboard.writeText(code)
      e.preventDefault()
      hide()
    }
  }
}, false)

ipc.on('key-from-clipboard', (_, message: string) => {
  keyInput.value = message
  updateCode()
})

function hide (): void {
  ipc.send('hide', 'hide')
}

function updateCode (): string | null {
  const password = passwordInput.value
  let key = keyInput.value
  const prefix = prefixInput.value
  const suffix = suffixInput.value
  const length = parseInt(lengthSelect.value, 10)

  if (password.length < 1 || key.length < 1) {
    codeButton.textContent = DEFAULT_BUTTON_TEXT
    return null
  }

  key = prefix + key + suffix
  const code = fpCode(password, key, length)
  codeButton.textContent = code
  return code
}

closeButton.addEventListener('click', () => hide(), false)

codeButton.addEventListener('click', () => {
  const code = updateCode()
  if (code) {
    clipboard.writeText(code)
    hide()
  }
}, false)

// Open external https links in the system browser
const links = document.querySelectorAll<HTMLAnchorElement>('a[href^="https"]')
links.forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault()
    // Use href to ensure absolute URL
    shell.openExternal(link.href)
  })
})
