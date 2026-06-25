// src/services/webpush.js
// Inscrição em Web Push (lembretes mesmo com o app fechado).
// A chave PÚBLICA do VAPID pode ficar no front (é pública por natureza); a privada
// fica só no servidor. Gere o seu par com:  npx web-push generate-vapid-keys
// e troque a constante abaixo + o server/.env.
export const VAPID_PUBLIC_KEY =
  'BIEzzIA1S-PYZZdUh1vFjEqOdyfzH-wo8gOiM9oZEFykjnPvQBcHCFUb2bj37H6UIfeZZBKoJkYcvpkGQC49jVc'

export function pushSupported() {
  return typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
}

function urlBase64ToUint8Array(base64) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(b64)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr
}

async function api(pathname, body) {
  const res = await fetch(pathname, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error('Falha na comunicação com o servidor de lembretes.')
  return res.json()
}

export async function isPushSubscribed() {
  if (!pushSupported()) return false
  try {
    const reg = await navigator.serviceWorker.getRegistration()
    if (!reg) return false
    return Boolean(await reg.pushManager.getSubscription())
  } catch { return false }
}

// Pede permissão, inscreve no push e registra a inscrição no servidor.
export async function subscribeToPush(uid) {
  if (!pushSupported()) return { ok: false, reason: 'unsupported' }

  const perm = await Notification.requestPermission()
  if (perm !== 'granted') return { ok: false, reason: 'denied' }

  const reg = await navigator.serviceWorker.ready

  // Confirma com o servidor se o push está configurado (chaves VAPID).
  let serverKey = VAPID_PUBLIC_KEY
  try {
    const info = await fetch('/api/push/key').then((r) => r.json())
    if (info && info.enabled === false) return { ok: false, reason: 'server-disabled' }
    if (info && info.publicKey) serverKey = info.publicKey
  } catch { /* segue com a chave embutida */ }

  let sub = await reg.pushManager.getSubscription()
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(serverKey),
    })
  }
  await api('/api/push/subscribe', { uid, subscription: sub })
  return { ok: true }
}

export async function unsubscribeFromPush() {
  if (!pushSupported()) return
  const reg = await navigator.serviceWorker.getRegistration()
  if (!reg) return
  const sub = await reg.pushManager.getSubscription()
  if (sub) {
    try { await api('/api/push/unsubscribe', { endpoint: sub.endpoint }) } catch { /* */ }
    await sub.unsubscribe()
  }
}

export async function sendTestPush(uid) {
  return api('/api/push/test', { uid })
}
