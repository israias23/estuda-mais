// src/services/achievements.js
// Conquistas calculadas a partir do progresso do usuário (sem dados extras).
import { levelFromXp } from './progressService'

export function statsFromProgress(p) {
  const lessons = Object.values(p?.completed || {}).reduce((a, arr) => a + arr.length, 0)
  const totalXp = p?.xp || 0
  const { level } = levelFromXp(totalXp)
  const streak = p?.streak || 0
  const certs = (p?.certificates || []).length
  const ss = p?.subjectStats || {}
  const answered = Object.values(ss).reduce((a, s) => a + (s.total || 0), 0)
  const correct = Object.values(ss).reduce((a, s) => a + (s.correct || 0), 0)
  const accuracy = answered ? Math.round((correct / answered) * 100) : 0
  const notes = Object.keys(p?.notes || {}).length
  const highlights = Object.values(p?.highlights || {}).reduce((a, arr) => a + (arr?.length || 0), 0)
  return { lessons, totalXp, level, streak, certs, answered, correct, accuracy, notes, highlights }
}

// Cada conquista: id, título, descrição, ícone, e meta (valor-alvo) + valor atual.
export function computeAchievements(progress) {
  const s = statsFromProgress(progress)
  const defs = [
    { id: 'first', title: 'Primeiros passos', desc: 'Conclua sua primeira lição', icon: 'check', cur: s.lessons, goal: 1 },
    { id: 'ded10', title: 'Dedicado', desc: 'Conclua 10 lições', icon: 'layers', cur: s.lessons, goal: 10 },
    { id: 'mara50', title: 'Maratonista', desc: 'Conclua 50 lições', icon: 'layers', cur: s.lessons, goal: 50 },
    { id: 'streak7', title: 'Ofensiva de fogo', desc: '7 dias seguidos de estudo', icon: 'flame', cur: s.streak, goal: 7 },
    { id: 'streak30', title: 'Inabalável', desc: '30 dias seguidos de estudo', icon: 'flame', cur: s.streak, goal: 30 },
    { id: 'lvl5', title: 'Em ascensão', desc: 'Alcance o nível 5', icon: 'bolt', cur: s.level, goal: 5 },
    { id: 'lvl10', title: 'Veterano', desc: 'Alcance o nível 10', icon: 'bolt', cur: s.level, goal: 10 },
    { id: 'xp1000', title: 'Estudioso', desc: 'Acumule 1.000 XP', icon: 'sparkles', cur: s.totalXp, goal: 1000 },
    { id: 'xp5000', title: 'Erudito', desc: 'Acumule 5.000 XP', icon: 'sparkles', cur: s.totalXp, goal: 5000 },
    { id: 'cert1', title: 'Certificado!', desc: 'Conquiste seu 1º certificado', icon: 'award', cur: s.certs, goal: 1 },
    { id: 'cert3', title: 'Colecionador', desc: 'Conquiste 3 certificados', icon: 'medal', cur: s.certs, goal: 3 },
    { id: 'q100', title: 'Treino pesado', desc: 'Responda 100 questões', icon: 'target', cur: s.answered, goal: 100 },
    { id: 'acc90', title: 'Pontaria certeira', desc: '90% de acerto (50+ questões)', icon: 'target', cur: s.answered >= 50 ? s.accuracy : 0, goal: 90 },
    { id: 'notes10', title: 'Anotador', desc: 'Faça 10 anotações', icon: 'edit', cur: s.notes, goal: 10 },
  ]
  return defs.map((d) => ({
    ...d,
    earned: d.cur >= d.goal,
    pct: Math.min(100, Math.round((d.cur / d.goal) * 100)),
  }))
}
