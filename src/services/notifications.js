// src/services/notifications.js
// Lembretes do PWA (ofensiva). Observação: notificações com o app FECHADO dependem de
// Web Push + servidor (VAPID) — sem isso, lembramos quando o app é aberto e o usuário
// ainda não estudou no dia. A permissão e o disparo local já ficam prontos.
const LAST = 'estudamais:lastReminder'
const todayStr = () => new Date().toISOString().slice(0, 10)

export function notifSupported() { return typeof window !== 'undefined' && 'Notification' in window }
export function notifPermission() { return notifSupported() ? Notification.permission : 'unsupported' }

export async function enableNotifications() {
  if (!notifSupported()) return 'unsupported'
  try { return await Notification.requestPermission() } catch { return 'denied' }
}

function show(title, body) {
  const opts = { body, icon: '/icon-192.png', badge: '/icon-192.png', tag: 'estuda-reminder' }
  try {
    if (navigator.serviceWorker?.ready) {
      navigator.serviceWorker.ready.then((reg) => reg.showNotification(title, opts)).catch(() => new Notification(title, opts))
    } else {
      new Notification(title, opts)
    }
  } catch { /* */ }
}

// Lembra o usuário (no máximo uma vez por dia) se ainda não estudou hoje.
export function maybeRemind(progress) {
  if (!progress || notifPermission() !== 'granted') return
  const today = todayStr()
  try { if (localStorage.getItem(LAST) === today) return } catch { /* */ }
  if (progress.lastStudyDay === today) return // já estudou hoje

  const streak = progress.streak || 0
  const title = streak > 0
    ? `Não perca sua ofensiva de ${streak} dia${streak > 1 ? 's' : ''}!`
    : 'Bora estudar hoje?'
  const body = streak > 0
    ? 'Faça uma lição rapidinha e mantenha a sequência viva.'
    : 'Alguns minutos já fazem diferença. Continue de onde parou.'
  show(title, body)
  try { localStorage.setItem(LAST, today) } catch { /* */ }
}
