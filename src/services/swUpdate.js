// src/services/swUpdate.js
// Registra o Service Worker e detecta quando há uma NOVA versão esperando.
// O app pergunta ao usuário se quer atualizar; ao aceitar, ativa e recarrega.
let waitingWorker = null
const listeners = new Set()
function emit() { listeners.forEach((l) => l(Boolean(waitingWorker))) }

export function onUpdate(cb) {
  listeners.add(cb)
  cb(Boolean(waitingWorker))
  return () => listeners.delete(cb)
}

export function applyUpdate() {
  if (!waitingWorker) return
  waitingWorker.postMessage({ type: 'SKIP_WAITING' })
}

export function registerSW() {
  if (!('serviceWorker' in navigator)) return
  navigator.serviceWorker.register('/sw.js').then((reg) => {
    // Já existe uma versão esperando?
    if (reg.waiting && navigator.serviceWorker.controller) {
      waitingWorker = reg.waiting; emit()
    }
    reg.addEventListener('updatefound', () => {
      const nw = reg.installing
      if (!nw) return
      nw.addEventListener('statechange', () => {
        // 'installed' + já existe um controller = é uma ATUALIZAÇÃO (não a 1ª instalação)
        if (nw.state === 'installed' && navigator.serviceWorker.controller) {
          waitingWorker = nw; emit()
        }
      })
    })
    // Verifica atualizações periodicamente enquanto o app está aberto.
    setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000)
  }).catch(() => {})

  let reloaded = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloaded) return
    reloaded = true
    window.location.reload()
  })
}
