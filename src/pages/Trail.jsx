// src/pages/Trail.jsx
// Trilha serpenteante de lições de uma matéria.
import { useParams, useNavigate } from 'react-router-dom'
import { useProgress } from '../context/ProgressContext'
import { getSubject } from '../data/tracks'
import LessonNode from '../components/LessonNode'
import Confetti from '../components/Confetti'
import Button from '../components/common/Button'
import Ring from '../components/common/Ring'
import SubjectGlyph, { subjectColor } from '../components/icons/SubjectGlyph'
import UiIcon from '../components/icons/UiIcon'
import EmptyState from '../components/common/EmptyState'

export default function Trail() {
  const { subjectId } = useParams()
  const { progress } = useProgress()
  const navigate = useNavigate()
  const subject = getSubject(subjectId)

  if (!subject) {
    return (
      <EmptyState icon={<UiIcon name="book" />} title="Matéria não encontrada"
        action={<Button onClick={() => navigate('/app')}>Voltar ao início</Button>}>
        Talvez ela tenha sido removida ou o link esteja errado.
      </EmptyState>
    )
  }

  const done = progress.completed?.[subjectId] || []
  const total = subject.lessons.length
  const allDone = done.length >= total
  const currentIndex = subject.lessons.findIndex((l) => !done.includes(l.id))
  const c = subjectColor(subjectId)

  function nodeState(lesson, index) {
    if (done.includes(lesson.id)) return 'done'
    if (index === currentIndex) return 'current'
    return 'locked'
  }

  return (
    <div className="animate-rise">
      <button onClick={() => navigate('/app')} className="inline-flex items-center gap-1 text-violet font-semibold text-sm mb-3">
        <UiIcon name="chevronLeft" size={16} /> Início
      </button>

      {/* Cabeçalho da matéria */}
      <div className="rounded-xl2 bg-surface border border-line shadow-soft p-5 flex items-center gap-4">
        <SubjectGlyph id={subjectId} tile size={60} />
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-xl font-extrabold text-ink">{subject.title}</h1>
          <p className="text-sm text-slatey line-clamp-2">{subject.description}</p>
          <p className="text-xs font-semibold mt-1" style={{ color: c }}>{done.length}/{total} lições concluídas</p>
        </div>
        <Ring value={done.length} max={total} size={58} stroke={6} color={c} track="rgba(20,19,43,0.08)">
          <span className="font-display font-extrabold text-sm text-ink">{Math.round((done.length / total) * 100)}%</span>
        </Ring>
      </div>

      {allDone && (
        <div className="relative rounded-xl2 bg-gold/12 border-2 border-gold p-5 mt-5 text-center animate-pop overflow-hidden">
          <Confetti count={50} />
          <span className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-2xl bg-gold/20 text-[#B5841E]"><UiIcon name="award" size={26} /></span>
          <h2 className="font-display font-extrabold text-ink">Trilha concluída!</h2>
          <p className="text-sm text-slatey mb-3">Seu certificado está pronto para emissão.</p>
          <Button variant="ember" onClick={() => navigate(`/app/certificado/${subjectId}`)}>
            <UiIcon name="award" size={18} /> Ver certificado
          </Button>
        </div>
      )}

      {/* Trilha */}
      <div className="relative mt-8">
        <div className="absolute left-1/2 top-4 bottom-4 w-0.5 -translate-x-1/2 border-l-2 border-dashed border-line" aria-hidden />
        <div className="relative flex flex-col items-center gap-9 py-2">
          {subject.lessons.map((lesson, i) => (
            <LessonNode
              key={lesson.id}
              lesson={lesson}
              index={i}
              state={nodeState(lesson, i)}
              onClick={() => navigate(`/app/licao/${subjectId}/${lesson.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
