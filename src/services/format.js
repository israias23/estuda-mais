// src/services/format.js — utilidades de formatação.
export function timeAgo(ms) {
  const s = Math.max(1, Math.floor((Date.now() - ms) / 1000))
  if (s < 60) return 'agora há pouco'
  const m = Math.floor(s / 60)
  if (m < 60) return `há ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `há ${h} h`
  const d = Math.floor(h / 24)
  if (d < 7) return `há ${d} d`
  const w = Math.floor(d / 7)
  if (w < 5) return `há ${w} sem`
  return new Date(ms).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export function firstName(name = '') {
  return (name || 'Estudante').trim().split(/\s+/)[0]
}
