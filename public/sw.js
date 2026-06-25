// public/sw.js — Service Worker do Estuda+
// Estratégia: app shell em cache (offline-first para navegação),
// network-first para chamadas de IA (/api) e stale-while-revalidate para assets.
const VERSION = 'estuda-v4'
const SHELL = `${VERSION}-shell`
const ASSETS = `${VERSION}-assets`
const SHELL_URLS = ['/', '/index.html', '/logo.svg', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png']

self.addEventListener('install', (e) => {
  // NÃO ativa sozinho: espera o usuário aceitar a atualização (mensagem SKIP_WAITING).
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(SHELL_URLS)))
})

// O app pede para ativar a nova versão quando o usuário clica em "Atualizar agora".
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting()
})

// Recebe uma notificação push (lembretes) e a exibe.
self.addEventListener('push', (e) => {
  let data = { title: 'Estuda+', body: 'Hora de estudar!', url: '/app' }
  try { if (e.data) data = { ...data, ...e.data.json() } } catch { /* payload simples */ }
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'estuda-push',
      data: { url: data.url || '/app' },
    })
  )
})

// Ao clicar na notificação, abre/foca o app na URL indicada.
self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  const url = (e.notification.data && e.notification.data.url) || '/app'
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) { if ('focus' in c) { c.navigate(url); return c.focus() } }
      return self.clients.openWindow(url)
    })
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (e) => {
  const { request } = e
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== location.origin) return

  // Nunca cachear IA/dados dinâmicos
  if (url.pathname.startsWith('/api')) return

  // Navegação: offline-first com fallback ao shell (SPA)
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request).catch(() => caches.match('/index.html').then((r) => r || caches.match('/')))
    )
    return
  }

  // Assets: stale-while-revalidate
  e.respondWith(
    caches.open(ASSETS).then(async (cache) => {
      const cached = await cache.match(request)
      const network = fetch(request).then((res) => {
        if (res && res.status === 200) cache.put(request, res.clone())
        return res
      }).catch(() => cached)
      return cached || network
    })
  )
})
