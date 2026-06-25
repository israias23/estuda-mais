// src/services/progressService.js
// Gerencia o progresso do estudante: XP, ofensiva (streak), lições concluídas,
// trilha escolhida, meta semanal e ranking. Usa Firestore quando disponível,
// senão localStorage. A forma dos dados é IDÊNTICA nos dois modos.

import { db, firebaseEnabled } from '../firebase/config'
import { doc, getDoc, setDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { getSubject } from '../data/tracks'

const todayStr = () => new Date().toISOString().slice(0, 10)
function yesterdayStr() {
  const y = new Date(); y.setDate(y.getDate() - 1)
  return y.toISOString().slice(0, 10)
}

export function emptyProgress(user) {
  return {
    uid: user.uid,
    name: user.displayName || (user.email ? user.email.split('@')[0] : 'Estudante'),
    fullName: user.displayName || '',
    cpf: '',
    track: null, // 'enem' | 'concurso' | 'programacao' | 'ciberseguranca' | 'sistemas'
    subjects: [], // ids das matérias escolhidas
    xp: 0,
    streak: 0,
    lastStudyDay: null,
    weeklyGoalXp: 350,
    weekStart: weekStartStr(),
    weekXp: 0,
    completed: {}, // { subjectId: [lessonId, ...] }
    certificates: [], // [subjectId]
    certData: {}, // { subjectId: { dateStr, code } } — emissão fixa do certificado
    notes: {}, // { 'subjectId/lessonId': { text, subjectId, lessonId, lessonTitle, updatedAt } }
    highlights: {}, // { 'subjectId/lessonId': [{ text, color }] } — marcações de texto
    examDate: null, // 'YYYY-MM-DD' — data da prova (contagem regressiva)
    examLabel: '', // ex.: 'ENEM 2026'
    subjectStats: {}, // { subjectId: { correct, total } } — para estatísticas de acerto
    xpLog: {}, // { 'YYYY-MM-DD': xpGanhoNoDia } — para o gráfico de XP no tempo
    review: {}, // fila de revisão espaçada: { key: { subjectId, lessonId, q, box, due, ... } }
    studyPlan: {}, // rotina semanal: { '0'..'6': [subjectIds] } (0 = segunda)
    createdAt: Date.now(), // data de criação (para o painel: novos usuários por dia)
    updatedAt: Date.now(),
  }
}

function weekStartStr() {
  const d = new Date()
  const day = (d.getDay() + 6) % 7 // segunda = 0
  d.setDate(d.getDate() - day)
  return d.toISOString().slice(0, 10)
}

const localKey = (uid) => `estudamais:progress:${uid}`

export async function loadProgress(user) {
  if (firebaseEnabled) {
    const ref = doc(db, 'progress', user.uid)
    const snap = await getDoc(ref)
    if (snap.exists()) return reconcileWeek(snap.data())
    const fresh = emptyProgress(user)
    await setDoc(ref, fresh)
    return fresh
  }
  const raw = localStorage.getItem(localKey(user.uid))
  if (raw) return reconcileWeek(JSON.parse(raw))
  const fresh = emptyProgress(user)
  localStorage.setItem(localKey(user.uid), JSON.stringify(fresh))
  return fresh
}

export async function saveProgress(progress) {
  const next = { ...progress, updatedAt: Date.now() }
  if (firebaseEnabled) {
    await setDoc(doc(db, 'progress', next.uid), next)
  } else {
    localStorage.setItem(localKey(next.uid), JSON.stringify(next))
  }
  return next
}

// Zera o contador semanal se virou a semana E recalcula a ofensiva.
function reconcileWeek(p) {
  let next = p
  const current = weekStartStr()
  if (p.weekStart !== current) {
    next = { ...next, weekStart: current, weekXp: 0 }
  }
  // Ofensiva: se o último dia de estudo foi antes de ontem, a sequência quebrou.
  if (next.lastStudyDay && (next.streak || 0) > 0) {
    const t = todayStr(); const y = yesterdayStr()
    if (next.lastStudyDay !== t && next.lastStudyDay !== y) {
      next = { ...next, streak: 0 }
    }
  }
  return next
}

// Aplica a conclusão de uma lição: soma XP, atualiza ofensiva e meta semanal.
export function applyLessonComplete(progress, subjectId, lessonId, xpGain) {
  const p = { ...progress }
  const done = new Set(p.completed[subjectId] || [])
  const firstTime = !done.has(lessonId)
  done.add(lessonId)
  p.completed = { ...p.completed, [subjectId]: [...done] }

  if (firstTime) {
    p.xp += xpGain
    p.weekXp += xpGain
    const t = todayStr()
    p.xpLog = { ...(p.xpLog || {}), [t]: (p.xpLog?.[t] || 0) + xpGain }
  }

  // ofensiva
  const today = todayStr()
  if (p.lastStudyDay !== today) {
    p.streak = p.lastStudyDay === yesterdayStr() ? (p.streak || 0) + 1 : 1
    p.lastStudyDay = today
  }

  // Certificado: se concluiu a trilha inteira, registra de forma explícita
  // (fica salvo e sincronizado, aparecendo em qualquer aparelho).
  const subject = getSubject(subjectId)
  if (subject && subject.lessons.length > 0) {
    const doneCount = (p.completed[subjectId] || []).length
    if (doneCount >= subject.lessons.length) {
      const certs = new Set(p.certificates || [])
      certs.add(subjectId)
      p.certificates = [...certs]
    }
  }
  return p
}

// --- REVISÃO ESPAÇADA (caixas de Leitner) ---
// Cada questão errada entra na fila; ao acertar na revisão ela sobe de caixa e
// demora mais para voltar. Ao errar, volta para a primeira caixa.
const DAY = 86400000
const BOXES = [1, 2, 4, 8, 16] // dias até a próxima revisão, por caixa

function reviewKey(subjectId, lessonId, qIndex) {
  return `${subjectId}__${lessonId}__${qIndex}`
}

// Registra a resposta de uma questão: atualiza estatísticas e a fila de revisão.
export function recordAnswer(progress, { subjectId, lessonId, subjectTitle, lessonTitle, question, qIndex, correct }) {
  const p = { ...progress }
  const ss = { ...(p.subjectStats || {}) }
  const cur = ss[subjectId] || { correct: 0, total: 0 }
  ss[subjectId] = { correct: cur.correct + (correct ? 1 : 0), total: cur.total + 1 }
  p.subjectStats = ss

  const review = { ...(p.review || {}) }
  const key = reviewKey(subjectId, lessonId, qIndex)
  if (!correct) {
    review[key] = {
      key, subjectId, lessonId, subjectTitle, lessonTitle, q: question,
      box: 0, due: Date.now(), lapses: (review[key]?.lapses || 0) + 1,
    }
  } else if (review[key]) {
    const box = Math.min((review[key].box || 0) + 1, BOXES.length - 1)
    review[key] = { ...review[key], box, due: Date.now() + BOXES[box] * DAY }
  }
  p.review = review
  return p
}

// Avalia uma questão durante a sessão de revisão (atualiza caixa + estatísticas).
export function gradeReview(progress, key, ok) {
  const review = { ...(progress.review || {}) }
  const item = review[key]
  if (!item) return progress
  if (ok) {
    const box = Math.min((item.box || 0) + 1, BOXES.length - 1)
    review[key] = { ...item, box, due: Date.now() + BOXES[box] * DAY }
  } else {
    review[key] = { ...item, box: 0, due: Date.now() + DAY, lapses: (item.lapses || 0) + 1 }
  }
  const ss = { ...(progress.subjectStats || {}) }
  const cur = ss[item.subjectId] || { correct: 0, total: 0 }
  ss[item.subjectId] = { correct: cur.correct + (ok ? 1 : 0), total: cur.total + 1 }
  return { ...progress, review, subjectStats: ss }
}

export function dueReviewItems(progress, now = Date.now()) {
  return Object.values(progress?.review || {})
    .filter((it) => (it.due || 0) <= now)
    .sort((a, b) => (a.due || 0) - (b.due || 0))
}

export function reviewCount(progress) {
  return dueReviewItems(progress).length
}

export function levelFromXp(xp) {
  // cada nível custa um pouco mais (curva suave)
  let level = 1
  let need = 100
  let acc = 0
  while (xp >= acc + need) {
    acc += need
    level += 1
    need = Math.round(need * 1.25)
  }
  return { level, intoLevel: xp - acc, levelNeed: need }
}

// Ranking: no Firebase lê a coleção; no modo local junta os perfis salvos no navegador.
export async function loadLeaderboard(currentUid) {
  if (firebaseEnabled) {
    const q = query(collection(db, 'progress'), orderBy('weekXp', 'desc'), limit(50))
    const snap = await getDocs(q)
    return snap.docs.map((d) => d.data())
  }
  const rows = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k && k.startsWith('estudamais:progress:')) {
      try { rows.push(JSON.parse(localStorage.getItem(k))) } catch { /* ignora */ }
    }
  }
  // adiciona alguns colegas fictícios para o ranking não ficar vazio em testes locais
  if (rows.length < 4) {
    const bots = [
      { uid: 'bot1', name: 'Ana Beatriz', weekXp: 540, streak: 12 },
      { uid: 'bot2', name: 'Carlos Henrique', weekXp: 410, streak: 5 },
      { uid: 'bot3', name: 'Juliana Mendes', weekXp: 280, streak: 8 },
      { uid: 'bot4', name: 'Pedro Lucas', weekXp: 150, streak: 2 },
    ].filter((b) => !rows.find((r) => r.uid === b.uid))
    rows.push(...bots)
  }
  return rows.sort((a, b) => (b.weekXp || 0) - (a.weekXp || 0)).slice(0, 50)
}
