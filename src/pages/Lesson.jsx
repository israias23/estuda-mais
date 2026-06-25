// src/pages/Lesson.jsx
// Fluxo (lógica de IA intacta): carrega conteúdo (IA + cache) -> teoria + exemplos ->
//        quiz -> atividade prática (avaliada pela IA) -> conclusão com avaliação + XP.
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProgress } from '../context/ProgressContext'
import { getSubject } from '../data/tracks'
import { getLesson } from '../services/contentService'
import QuizCard from '../components/QuizCard'
import PracticeCard from '../components/PracticeCard'
import LessonRating from '../components/LessonRating'
import LessonNotes from '../components/LessonNotes'
import HighlightText from '../components/HighlightText'
import Confetti from '../components/Confetti'
import Button from '../components/common/Button'
import Spinner from '../components/common/Spinner'
import Badge from '../components/common/Badge'
import SubjectGlyph from '../components/icons/SubjectGlyph'
import UiIcon from '../components/icons/UiIcon'

export default function Lesson() {
  const { subjectId, lessonId } = useParams()
  const navigate = useNavigate()
  const { completeLesson, recordAnswer, progress, update } = useProgress()

  const subject = getSubject(subjectId)
  const lesson = subject?.lessons.find((l) => l.id === lessonId)
  const xpGain = lesson?.xp || 50
  const track = (subject?.tracks || [])[0] || ''

  const [phase, setPhase] = useState('loading') // loading|theory|offline|quiz|practice|done
  const [content, setContent] = useState(null)
  const [source, setSource] = useState(null)
  const [qIndex, setQIndex] = useState(0)
  const [hits, setHits] = useState(0)
  const [bonus, setBonus] = useState(0)

  useEffect(() => {
    if (!subject || !lesson) return
    let active = true
    setPhase('loading')
    ;(async () => {
      const res = await getLesson({
        subjectId, lessonId,
        subject: subject.title, topic: lesson.title, focus: lesson.focus || '', track,
      })
      if (!active) return
      if (res.content) {
        setContent(res.content); setSource(res.source); setPhase('theory')
      } else if (lesson.theory) {
        setContent({ theory: lesson.theory, keypoints: [], examples: [], questions: lesson.questions || [], practice: null })
        setSource('fixo'); setPhase('theory')
      } else {
        setPhase('offline')
      }
    })()
    return () => { active = false }
  }, [subjectId, lessonId]) // eslint-disable-line

  if (!subject || !lesson) {
    return (
      <div className="text-center py-16">
        <p className="text-slatey">Lição não encontrada.</p>
        <Button onClick={() => navigate('/app')} className="mt-4">Início</Button>
      </div>
    )
  }

  async function finishLesson(practiceCorrect) {
    const extra = practiceCorrect ? 15 : 0
    setBonus(extra)
    await completeLesson(subjectId, lesson.id, xpGain + extra)
    setPhase('done')
  }

  async function onAnswered(correct) {
    setHits((h) => h + (correct ? 1 : 0))
    recordAnswer({
      subjectId, lessonId, subjectTitle: subject.title, lessonTitle: lesson.title,
      question: content.questions[qIndex], qIndex, correct,
    })
    if (qIndex + 1 < content.questions.length) setQIndex(qIndex + 1)
    else if (content.practice) setPhase('practice')
    else await finishLesson(false)
  }

  const aiGenerated = source === 'ia' || source === 'cache' || source === 'firestore'

  if (phase === 'loading') return <Spinner label="A IA está preparando sua aula…" />

  // Botão flutuante de anotações (presente durante toda a aula).
  const notesFab = <LessonNotes subjectId={subjectId} lessonId={lesson.id} lessonTitle={lesson.title} />

  if (phase === 'offline') {
    return (
      <div className="text-center py-12 animate-rise max-w-sm mx-auto">
        <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-violet-wash text-violet"><UiIcon name="sparkles" size={28} /></span>
        <h1 className="font-display text-xl font-extrabold text-ink">Conteúdo gerado por IA</h1>
        <p className="text-slatey mt-2">
          Esta aula é desenvolvida pela IA. Inicie o servidor
          (<code className="bg-violet-wash px-1.5 py-0.5 rounded font-mono text-sm">npm run server</code>) e tente de novo.
          Depois de gerada, ela fica salva e funciona offline.
        </p>
        <div className="flex flex-col gap-2 mt-6">
          <Button onClick={() => window.location.reload()}><UiIcon name="refresh" size={18} /> Tentar novamente</Button>
          <Button variant="ghost" onClick={() => navigate(`/app/trilha/${subjectId}`)}>Voltar à trilha</Button>
        </div>
      </div>
    )
  }

  // ---------- TEORIA ----------
  if (phase === 'theory') {
    return (
      <div className="animate-rise">
        <button onClick={() => navigate(`/app/trilha/${subjectId}`)} className="inline-flex items-center gap-1 text-violet font-semibold text-sm mb-3">
          <UiIcon name="chevronLeft" size={16} /> Trilha
        </button>

        <div className="flex items-center gap-3 mb-4">
          <SubjectGlyph id={subjectId} tile size={46} />
          <div className="min-w-0">
            <Badge tone="violet">{subject.title}</Badge>
          </div>
        </div>

        <h1 className="font-display text-2xl font-extrabold text-ink leading-tight">{lesson.title}</h1>
        {aiGenerated && (
          <p className="text-xs text-violet mt-1.5 flex items-center gap-1 font-semibold">
            <UiIcon name="sparkles" size={14} /> Aula desenvolvida por IA
          </p>
        )}

        <HighlightText
          className="prose-study flex flex-col gap-4 mt-5"
          paragraphs={content.theory}
          highlights={progress?.highlights?.[`${subjectId}/${lessonId}`] || []}
          onAdd={({ text, color }) => update((p) => {
            const k = `${subjectId}/${lessonId}`
            const list = [...(p.highlights?.[k] || []), { text, color }]
            return { ...p, highlights: { ...(p.highlights || {}), [k]: list } }
          })}
          onRemove={(text) => update((p) => {
            const k = `${subjectId}/${lessonId}`
            const list = (p.highlights?.[k] || []).filter((h) => h.text !== text)
            return { ...p, highlights: { ...(p.highlights || {}), [k]: list } }
          })}
        />

        {content.examples?.length > 0 && (
          <div className="mt-7">
            <h2 className="font-display font-bold text-ink mb-3 flex items-center gap-2"><UiIcon name="layers" size={18} className="text-violet" /> Exemplos</h2>
            <div className="flex flex-col gap-3">
              {content.examples.map((ex, i) => (
                <div key={i} className="rounded-xl2 border border-line overflow-hidden shadow-soft">
                  <div className="bg-violet-wash px-4 py-2 font-display font-semibold text-violet text-sm">{ex.title}</div>
                  <pre className="bg-night text-cloud text-sm p-4 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">{ex.body}</pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {content.keypoints?.length > 0 && (
          <div className="mt-6 rounded-xl2 bg-violet-wash p-5">
            <h2 className="font-display font-bold text-ink mb-2.5 flex items-center gap-2"><UiIcon name="check" size={18} strokeWidth={2.5} className="text-violet" /> Pontos-chave</h2>
            <ul className="flex flex-col gap-2">
              {content.keypoints.map((k, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-ink/90">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-violet shrink-0" /> {k}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button onClick={() => { setQIndex(0); setHits(0); setPhase('quiz') }} disabled={!content.questions?.length} size="lg" className="w-full mt-8">
          Praticar e ganhar {xpGain} XP <UiIcon name="arrowRight" size={18} />
        </Button>
        {notesFab}
      </div>
    )
  }

  // ---------- QUIZ ----------
  if (phase === 'quiz') {
    return (
      <div className="animate-rise">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(`/app/trilha/${subjectId}`)} aria-label="Sair" className="grid h-8 w-8 place-items-center rounded-full text-slatey hover:bg-line">
            <UiIcon name="close" size={18} />
          </button>
          <div className="h-2.5 flex-1 rounded-full bg-ink/[0.07] overflow-hidden">
            <div className="h-full bg-mint rounded-full transition-all duration-300" style={{ width: `${(qIndex / content.questions.length) * 100}%` }} />
          </div>
          <span className="text-sm font-semibold text-slatey tabular-nums">{qIndex + 1}/{content.questions.length}</span>
        </div>
        <QuizCard key={qIndex} question={content.questions[qIndex]} onAnswered={onAnswered} />
        {notesFab}
      </div>
    )
  }

  // ---------- PRÁTICA ----------
  if (phase === 'practice') {
    return (
      <>
        <PracticeCard
          practice={content.practice}
          subject={subject.title}
          topic={lesson.title}
          track={track}
          onDone={finishLesson}
        />
        {notesFab}
      </>
    )
  }

  // ---------- CONCLUSÃO (avaliação no fim, acima do botão de finalizar) ----------
  const pct = Math.round((hits / content.questions.length) * 100)
  const great = pct >= 70
  return (
    <div className="py-6 animate-pop max-w-md mx-auto">
      {great && <Confetti />}
      {notesFab}
      <div className="text-center">
        <span className={`mx-auto mb-3 grid h-16 w-16 place-items-center rounded-3xl ${great ? 'bg-mint/15 text-mint' : 'bg-ember/15 text-ember'}`}>
          <UiIcon name={great ? 'award' : 'target'} size={32} />
        </span>
        <h1 className="font-display text-2xl font-extrabold text-ink">Lição concluída!</h1>
        <p className="text-slatey mt-1">Você acertou {hits} de {content.questions.length} ({pct}%)</p>
        <div className="mt-4 inline-flex flex-col items-center gap-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-4 py-2 font-display font-bold text-[#B5841E]">
            <UiIcon name="bolt" size={16} className="text-gold" /> +{xpGain + bonus} XP
          </span>
          {bonus > 0 && <span className="text-xs text-mint font-semibold">inclui +{bonus} XP de bônus pela prática</span>}
        </div>
      </div>

      {/* Avaliação do conteúdo — no fim, logo acima do botão de finalizar */}
      <div className="mt-7">
        <LessonRating subjectId={subjectId} lessonId={lesson.id} lessonTitle={lesson.title} />
      </div>

      <Button onClick={() => navigate(`/app/trilha/${subjectId}`)} size="lg" className="w-full mt-5">
        Finalizar e voltar à trilha
      </Button>
    </div>
  )
}
