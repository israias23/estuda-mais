// src/services/aiService.js
// Conversa com o servidor (que guarda a chave). Apenas chamadas à IA —
// o armazenamento/cache fica em contentService.js.

// Gera a lição via IA. Retorna o conteúdo ou null se falhar/offline.
export async function generateLessonAI({ subject, topic, focus, track }) {
  try {
    const res = await fetch('/api/generate-lesson', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, topic, focus, track }),
    })
    if (!res.ok) throw new Error('Servidor de IA indisponível')
    const data = await res.json()
    if (!Array.isArray(data.theory) || !Array.isArray(data.questions)) throw new Error('Resposta incompleta')
    return data
  } catch (err) {
    console.warn('[Estuda+] IA indisponível:', err.message)
    return null
  }
}

// Avalia a atividade prática. Retorna { ok, correct, feedback }
export async function evaluatePractice({ subject, topic, task, userAnswer, language, track }) {
  try {
    const res = await fetch('/api/evaluate-practice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, topic, task, userAnswer, language, track }),
    })
    if (!res.ok) throw new Error('Servidor indisponível')
    const data = await res.json()
    return { ok: true, correct: data.correct, feedback: data.feedback }
  } catch {
    return { ok: false, correct: false, feedback: 'Não consegui avaliar agora (servidor de IA offline).' }
  }
}
