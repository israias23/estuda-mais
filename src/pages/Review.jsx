// src/pages/Review.jsx
// Sessão de revisão espaçada: traz as questões que estão "na hora" de revisar.
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProgress } from '../context/ProgressContext'
import { dueReviewItems } from '../services/progressService'
import QuizCard from '../components/QuizCard'
import Button from '../components/common/Button'
import Confetti from '../components/Confetti'
import EmptyState from '../components/common/EmptyState'
import SubjectGlyph from '../components/icons/SubjectGlyph'
import UiIcon from '../components/icons/UiIcon'

export default function Review() {
  const { progress, gradeReview } = useProgress()
  const navigate = useNavigate()

  // Tira uma "foto" da fila no início para não embaralhar durante a sessão.
  const queue = useMemo(() => dueReviewItems(progress), []) // eslint-disable-line
  const [i, setI] = useState(0)
  const [hits, setHits] = useState(0)
  const done = i >= queue.length

  if (queue.length === 0) {
    return (
      <div className="animate-rise">
        <button onClick={() => navigate('/app')} className="inline-flex items-center gap-1 text-violet font-semibold text-sm mb-3">
          <UiIcon name="chevronLeft" size={16} /> Início
        </button>
        <EmptyState icon={<UiIcon name="refresh" />} title="Revisão em dia!"
          action={<Button onClick={() => navigate('/app')}>Voltar ao início</Button>}>
          Você não tem questões para revisar agora. Sempre que errar algo nas lições, ela volta aqui na hora certa para fixar.
        </EmptyState>
      </div>
    )
  }

  function answer(correct) {
    if (correct) setHits((h) => h + 1)
    gradeReview(queue[i].key, correct)
    setI((n) => n + 1)
  }

  if (done) {
    const pct = Math.round((hits / queue.length) * 100)
    const great = pct >= 70
    return (
      <div className="py-8 text-center animate-pop max-w-md mx-auto">
        {great && <Confetti />}
        <span className={`mx-auto mb-3 grid h-16 w-16 place-items-center rounded-3xl ${great ? 'bg-mint/15 text-mint' : 'bg-violet-wash text-violet'}`}>
          <UiIcon name="refresh" size={30} />
        </span>
        <h1 className="font-display text-2xl font-extrabold text-ink">Revisão concluída!</h1>
        <p className="text-slatey mt-1">Você revisou {queue.length} {queue.length === 1 ? 'questão' : 'questões'} e acertou {hits} ({pct}%).</p>
        <p className="text-sm text-slatey mt-2">As que você errou voltam amanhã; as que acertou, mais pra frente.</p>
        <div className="flex flex-col gap-2 mt-6">
          <Button onClick={() => navigate('/app/estatisticas')} variant="ghost"><UiIcon name="layers" size={18} /> Ver minhas estatísticas</Button>
          <Button onClick={() => navigate('/app')}>Voltar ao início</Button>
        </div>
      </div>
    )
  }

  const item = queue[i]
  return (
    <div className="animate-rise">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate('/app')} aria-label="Sair" className="grid h-8 w-8 place-items-center rounded-full text-slatey hover:bg-line">
          <UiIcon name="close" size={18} />
        </button>
        <div className="h-2.5 flex-1 rounded-full bg-ink/[0.07] overflow-hidden">
          <div className="h-full bg-violet rounded-full transition-all duration-300" style={{ width: `${(i / queue.length) * 100}%` }} />
        </div>
        <span className="text-sm font-semibold text-slatey tabular-nums">{i + 1}/{queue.length}</span>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <SubjectGlyph id={item.subjectId} tile size={36} />
        <div>
          <p className="font-display font-bold text-ink text-sm leading-none">{item.subjectTitle}</p>
          <p className="text-xs text-slatey">Revisão · {item.lessonTitle}</p>
        </div>
      </div>

      <QuizCard key={item.key} question={item.q} onAnswered={answer} />
    </div>
  )
}
