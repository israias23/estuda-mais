// src/services/quizBank.js
// Monta um banco de questões a partir do conteúdo já disponível no aparelho:
//  1) questões fixas que vêm nos dados das matérias;
//  2) questões de lições que a IA já gerou e ficaram em cache.
// Não chama a IA — usa só o que já existe (funciona offline).
import { getSubject, listSubjects } from '../data/tracks'

function pushQuestions(out, seen, { subjectId, subjectTitle, lessonId, lessonTitle, questions }) {
  if (!Array.isArray(questions)) return
  for (const q of questions) {
    if (!q || !q.q || !Array.isArray(q.options) || typeof q.correct !== 'number') continue
    const sig = `${subjectId}:${q.q}`
    if (seen.has(sig)) continue
    seen.add(sig)
    out.push({ subjectId, subjectTitle, lessonId, lessonTitle, q })
  }
}

// Lê as lições em cache no navegador (estudamais:lesson:subject__lesson).
function readCachedLessons() {
  const items = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (!k || !k.startsWith('estudamais:lesson:')) continue
      const id = k.replace('estudamais:lesson:', '')
      const [subjectId, lessonId] = id.split('__')
      let content
      try { content = JSON.parse(localStorage.getItem(k)) } catch { continue }
      if (content?.questions?.length) items.push({ subjectId, lessonId, questions: content.questions })
    }
  } catch { /* ignora */ }
  return items
}

// Retorna todas as questões disponíveis para as matérias indicadas (ou todas).
export function collectQuestions(subjectIds) {
  const ids = subjectIds && subjectIds.length ? new Set(subjectIds) : null
  const out = []
  const seen = new Set()

  // 1) questões fixas dos dados
  const subjectsToScan = ids ? [...ids] : listSubjects(null).map((s) => s.id)
  for (const sid of subjectsToScan) {
    const subject = getSubject(sid)
    if (!subject) continue
    for (const lesson of subject.lessons || []) {
      pushQuestions(out, seen, {
        subjectId: sid, subjectTitle: subject.title,
        lessonId: lesson.id, lessonTitle: lesson.title, questions: lesson.questions,
      })
    }
  }

  // 2) questões em cache (geradas por IA anteriormente)
  for (const cached of readCachedLessons()) {
    if (ids && !ids.has(cached.subjectId)) continue
    const subject = getSubject(cached.subjectId)
    pushQuestions(out, seen, {
      subjectId: cached.subjectId, subjectTitle: subject?.title || 'Matéria',
      lessonId: cached.lessonId, lessonTitle: '', questions: cached.questions,
    })
  }
  return out
}

export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Conta quantas questões existem para um conjunto de matérias.
export function bankSize(subjectIds) {
  return collectQuestions(subjectIds).length
}
