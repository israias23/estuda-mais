// src/services/theme.js
// Modo claro/escuro/sistema. Aplica a classe .dark no <html> e persiste a escolha.
const KEY = 'estudamais:theme'

export function getTheme() {
  try { return localStorage.getItem(KEY) || 'system' } catch { return 'system' }
}

export function resolvedTheme(theme = getTheme()) {
  if (theme === 'system') {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return theme
}

export function applyTheme(theme = getTheme()) {
  const r = resolvedTheme(theme)
  const el = document.documentElement
  el.classList.toggle('dark', r === 'dark')
  el.style.colorScheme = r
}

export function setTheme(theme) {
  try { localStorage.setItem(KEY, theme) } catch { /* */ }
  applyTheme(theme)
}

// Reage à mudança do tema do sistema quando a opção é "system".
export function watchSystemTheme() {
  if (!window.matchMedia) return
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  const handler = () => { if (getTheme() === 'system') applyTheme('system') }
  mq.addEventListener?.('change', handler)
}
