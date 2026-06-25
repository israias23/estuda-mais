// src/devWarm.js
import { warmLesson } from './services/contentService'
import { listSubjects, getSubject } from './data/tracks'

let cancelar = false

async function warm({ track = null, delayMs = 1200 } = {}) {
  cancelar = false
  const subjects = listSubjects(track)
  const tasks = []
  for (const s of subjects) {
    const full = getSubject(s.id)
    if (!full) continue
    for (const l of full.lessons) {
      tasks.push({
        subjectId: full.id, lessonId: l.id, subject: full.title,
        topic: l.title, focus: l.focus || '', track: (full.tracks || [])[0] || '',
      })
    }
  }

  console.log(`%c[Esquentar] ${tasks.length} lições${track ? ` (trilha: ${track})` : ' (todas)'}. Para parar: stopWarm()`,
    'color:#5B3FE6;font-weight:bold')

  let gerou = 0, local = 0, existia = 0, falhou = 0
  const inicio = Date.now()

  for (let i = 0; i < tasks.length; i++) {
    if (cancelar) { console.warn(`[Esquentar] Interrompido em ${i}/${tasks.length}.`); break }
    const t = tasks[i]
    let r = 'falhou'
    try { r = await warmLesson(t) }
    catch (e) { console.warn(`[${i + 1}/${tasks.length}] erro em ${t.subject} › ${t.topic}: ${e.message}`) }
    if (r === 'gerada') gerou++
    else if (r === 'enviada-do-local') local++
    else if (r === 'ja-no-firestore') existia++
    else falhou++

    const tag = { gerada: '✨ gerada', 'enviada-do-local': '⬆ enviada', 'ja-no-firestore': '✓ já existia', falhou: '❌ falhou' }[r]
    console.log(`[${i + 1}/${tasks.length}] ${t.subject} › ${t.topic} — ${tag}`)

    if (i < tasks.length - 1 && !cancelar && r === 'gerada') {
      await new Promise((res) => setTimeout(res, delayMs))
    }
  }

  const mins = Math.round((Date.now() - inicio) / 60000)
  console.log(`%c[Esquentar] Fim (~${mins} min). Geradas: ${gerou} | Enviadas do local: ${local} | Já existiam: ${existia} | Falhas: ${falhou}`,
    'color:#19C2A0;font-weight:bold')
}

if (import.meta.env.DEV) {
  window.warmCache = warm
  window.stopWarm = () => { cancelar = true }
  console.info('%c[Esquentar] Pronto! warmCache() para tudo, ou warmCache({ track: "programacao" }) por trilha.', 'color:#5B3FE6')
}