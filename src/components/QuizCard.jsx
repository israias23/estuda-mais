// src/components/QuizCard.jsx
import { useState } from 'react'
import Button from './common/Button'
import UiIcon from './icons/UiIcon'

export default function QuizCard({ question, onAnswered }) {
  const [picked, setPicked] = useState(null)
  const [confirmed, setConfirmed] = useState(false)
  const isCorrect = confirmed && picked === question.correct

  function confirm() { if (picked !== null) setConfirmed(true) }
  function next() { onAnswered(picked === question.correct); setPicked(null); setConfirmed(false) }

  return (
    <div className="animate-rise">
      <h2 className="font-display text-xl font-bold text-ink mb-5 leading-snug">{question.q}</h2>

      <div className="flex flex-col gap-3">
        {question.options.map((opt, i) => {
          const selected = picked === i
          let cls = 'bg-surface border-line text-ink hover:border-violet/40'
          let mark = null
          if (confirmed) {
            if (i === question.correct) { cls = 'bg-mint/10 border-mint text-ink'; mark = <UiIcon name="check" size={18} strokeWidth={2.5} className="text-mint" /> }
            else if (selected) { cls = 'bg-ember/10 border-ember text-ink'; mark = <UiIcon name="close" size={18} className="text-ember" /> }
            else cls = 'bg-surface border-line text-faint'
          } else if (selected) cls = 'bg-violet-wash border-violet text-ink'
          return (
            <button
              key={i}
              onClick={() => !confirmed && setPicked(i)}
              disabled={confirmed}
              className={`flex items-center justify-between gap-3 text-left rounded-xl2 border-2 px-4 py-3.5 font-medium transition-colors ${cls}`}
            >
              <span>{opt}</span>
              {mark}
            </button>
          )
        })}
      </div>

      {confirmed && (
        <div className={`mt-4 rounded-xl2 p-4 animate-rise border ${isCorrect ? 'bg-mint/10 border-mint/30' : 'bg-ember/10 border-ember/30'}`}>
          <p className="font-display font-bold mb-1 text-ink flex items-center gap-1.5">
            <UiIcon name={isCorrect ? 'check' : 'target'} size={18} strokeWidth={2.2} className={isCorrect ? 'text-mint' : 'text-ember'} />
            {isCorrect ? 'Acertou!' : 'Não foi dessa vez'}
          </p>
          <p className="text-sm text-slatey">{question.explain}</p>
        </div>
      )}

      <div className="mt-6">
        {!confirmed ? (
          <Button onClick={confirm} disabled={picked === null} className="w-full">Confirmar</Button>
        ) : (
          <Button onClick={next} variant={isCorrect ? 'primary' : 'ember'} className="w-full">Continuar</Button>
        )}
      </div>
    </div>
  )
}
