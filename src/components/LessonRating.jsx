// src/components/LessonRating.jsx
// Avaliação do conteúdo exibida no FIM da lição, logo acima do botão de finalizar.
import { useState } from 'react'
import { saveFeedback } from '../services/contentService'
import { useAuth } from '../context/AuthContext'
import UiIcon from './icons/UiIcon'

export default function LessonRating({ subjectId, lessonId, lessonTitle }) {
  const { user } = useAuth()
  const [relevant, setRelevant] = useState(null) // true | false
  const [comment, setComment] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  async function submit() {
    if (relevant === null) return
    setBusy(true)
    try {
      await saveFeedback({ subjectId, lessonId, lessonTitle, relevant, comment, uid: user?.uid })
    } catch { /* não trava o usuário */ }
    setSent(true); setBusy(false)
  }

  if (sent) {
    return (
      <div className="rounded-xl2 bg-mint/10 border border-mint/30 p-4 text-center">
        <p className="font-display font-bold text-ink flex items-center justify-center gap-1.5">
          <UiIcon name="check" size={18} strokeWidth={2.5} className="text-mint" /> Obrigado pela avaliação!
        </p>
        <p className="text-sm text-slatey">Vamos usar seu retorno para melhorar as aulas.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl2 bg-surface border border-line shadow-soft p-4 text-left">
      <p className="font-display font-bold text-ink text-center">Este conteúdo te ajudou?</p>
      <p className="text-sm text-slatey text-center mb-3">Sua avaliação melhora as próximas aulas.</p>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setRelevant(true)}
          className={`flex items-center justify-center gap-2 rounded-xl2 border-2 py-3 font-display font-bold transition-colors ${
            relevant === true ? 'border-mint bg-mint/10 text-ink' : 'border-line text-slatey hover:border-mint/50'
          }`}
        >
          <UiIcon name="thumbsUp" size={18} /> Sim, útil
        </button>
        <button
          onClick={() => setRelevant(false)}
          className={`flex items-center justify-center gap-2 rounded-xl2 border-2 py-3 font-display font-bold transition-colors ${
            relevant === false ? 'border-ember bg-ember/10 text-ink' : 'border-line text-slatey hover:border-ember/50'
          }`}
        >
          <UiIcon name="thumbsDown" size={18} /> Pode melhorar
        </button>
      </div>
      {relevant !== null && (
        <div className="mt-3 animate-rise">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            placeholder="Quer detalhar? (opcional)"
            className="field !py-2.5 text-sm resize-none"
          />
          <button
            onClick={submit}
            disabled={busy}
            className="mt-2 w-full rounded-xl2 bg-violet text-white font-display font-semibold py-2.5 disabled:opacity-50 transition-colors hover:bg-violet-deep"
          >
            {busy ? 'Enviando…' : 'Enviar avaliação'}
          </button>
        </div>
      )}
    </div>
  )
}
