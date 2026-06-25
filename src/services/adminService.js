// src/services/adminService.js
// Acesso administrativo — separado do login dos estudantes.
// O painel só é alcançável por uma rota específica (/painel) e exige senha de admin.
// No primeiro acesso usa a SENHA PROVISÓRIA (veja o README) e OBRIGA a trocá-la.
// A senha é guardada apenas como hash (SHA-256). Em produção, reforce com regras do
// Firestore (coleção "admins" por uid) — veja firestore.rules e o README.

import { db, auth, firebaseEnabled } from '../firebase/config'
import {
  doc, getDoc, setDoc, collection, getDocs, query, orderBy, limit,
} from 'firebase/firestore'
import { signInWithEmailAndPassword } from 'firebase/auth'

// Senha provisória do primeiro acesso (TROCAR ao entrar) — usada no MODO LOCAL.
export const PROVISIONAL_PASSWORD = 'Estuda@Admin2026'

const SEC_LS = 'estudamais:admin:security'
const SESSION_KEY = 'estudamais:admin:session'

// Verifica se um uid está na coleção "admins" (fonte de verdade, igual às regras).
export async function isAdminUid(uid) {
  if (!uid) return false
  try {
    const snap = await getDoc(doc(db, 'admins', uid))
    return snap.exists()
  } catch { return false }
}

// Login do painel no modo Firebase: autentica a conta e confirma que é admin.
export async function adminLoginFirebase(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  const ok = await isAdminUid(cred.user.uid)
  if (!ok) {
    throw new Error('Esta conta não tem permissão de administrador. Adicione o UID dela à coleção "admins" (veja o README).')
  }
  try { sessionStorage.setItem(SESSION_KEY, '1') } catch { /* */ }
  return { ok: true, mustChange: false }
}

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function getSecurity() {
  if (firebaseEnabled) {
    try {
      const snap = await getDoc(doc(db, 'admin', 'security'))
      return snap.exists() ? snap.data() : null
    } catch { return readLocalSec() }
  }
  return readLocalSec()
}
function readLocalSec() {
  try { return JSON.parse(localStorage.getItem(SEC_LS) || 'null') } catch { return null }
}
async function writeSecurity(data) {
  if (firebaseEnabled) {
    try { await setDoc(doc(db, 'admin', 'security'), data); return } catch { /* cai pro local */ }
  }
  localStorage.setItem(SEC_LS, JSON.stringify(data))
}

export function isAdminSession() {
  try { return sessionStorage.getItem(SESSION_KEY) === '1' } catch { return false }
}
export function adminLogout() {
  try { sessionStorage.removeItem(SESSION_KEY) } catch { /* */ }
}

// Tenta logar. Retorna { ok, mustChange }.
export async function adminLogin(password) {
  const sec = await getSecurity()
  if (!sec || !sec.passHash) {
    // primeiro acesso de todos: aceita a senha provisória e força a troca
    if (password === PROVISIONAL_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1')
      return { ok: true, mustChange: true }
    }
    throw new Error('Senha incorreta.')
  }
  const h = await sha256(password)
  if (h !== sec.passHash) throw new Error('Senha incorreta.')
  sessionStorage.setItem(SESSION_KEY, '1')
  return { ok: true, mustChange: !sec.changed }
}

// Define a nova senha definitiva (encerra a obrigação de troca).
export async function setAdminPassword(newPassword) {
  if (!newPassword || newPassword.length < 8) throw new Error('A nova senha precisa de pelo menos 8 caracteres.')
  if (newPassword === PROVISIONAL_PASSWORD) throw new Error('Escolha uma senha diferente da provisória.')
  const passHash = await sha256(newPassword)
  await writeSecurity({ passHash, changed: true, updatedAt: Date.now() })
  sessionStorage.setItem(SESSION_KEY, '1')
  return true
}

// --------- Dados para o painel ---------
export async function adminStats() {
  let users = []
  let feedback = []
  if (firebaseEnabled) {
    try {
      const us = await getDocs(collection(db, 'progress'))
      users = us.docs.map((d) => d.data())
    } catch { /* sem permissão? segue vazio */ }
    try {
      const fs = await getDocs(query(collection(db, 'feedback'), orderBy('createdAt', 'desc'), limit(200)))
      feedback = fs.docs.map((d) => ({ id: d.id, ...d.data() }))
    } catch { /* */ }
  } else {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith('estudamais:progress:')) {
        try { users.push(JSON.parse(localStorage.getItem(k))) } catch { /* */ }
      }
    }
    try { feedback = JSON.parse(localStorage.getItem('estudamais:feedback') || '[]') } catch { /* */ }
  }

  const total = feedback.length
  const positive = feedback.filter((f) => f.relevant).length
  const positivePct = total ? Math.round((positive / total) * 100) : 0

  const bySubject = {}
  for (const f of feedback) {
    const s = (bySubject[f.subjectId] = bySubject[f.subjectId] || { pos: 0, total: 0 })
    s.total += 1
    if (f.relevant) s.pos += 1
  }

  const recent = [...feedback].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 40)

  // Novos usuários por dia (últimos 14 dias) — usa createdAt (cai para updatedAt).
  const DAY = 86400000
  const base = new Date(); base.setHours(0, 0, 0, 0)
  const byDay = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date(base.getTime() - i * DAY)
    byDay.push({ key: d.toISOString().slice(0, 10), date: d, count: 0 })
  }
  const idx = Object.fromEntries(byDay.map((d, i) => [d.key, i]))
  for (const u of users) {
    const ts = u.createdAt || u.updatedAt
    if (!ts) continue
    const key = new Date(ts).toISOString().slice(0, 10)
    if (key in idx) byDay[idx[key]].count++
  }

  return { userCount: users.length, feedbackTotal: total, positivePct, bySubject, recent, newUsersByDay: byDay }
}

// --------- Editor de conteúdo de lições ---------
export async function adminLoadLesson(subjectId, lessonId) {
  const id = `${subjectId}__${lessonId}`
  // cache local
  try {
    const raw = localStorage.getItem(`estudamais:lesson:${id}`)
    if (raw) return JSON.parse(raw)
  } catch { /* */ }
  if (firebaseEnabled) {
    try {
      const snap = await getDoc(doc(db, 'lessons', id))
      if (snap.exists()) return snap.data()
    } catch { /* */ }
  }
  return null
}

export async function adminSaveLesson(subjectId, lessonId, content) {
  const id = `${subjectId}__${lessonId}`
  const payload = { ...content, subjectId, lessonId, updatedAt: Date.now() }
  try { localStorage.setItem(`estudamais:lesson:${id}`, JSON.stringify(payload)) } catch { /* */ }
  if (firebaseEnabled) {
    await setDoc(doc(db, 'lessons', id), payload)
  }
  return true
}
