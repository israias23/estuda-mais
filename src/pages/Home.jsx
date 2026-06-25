// src/pages/Home.jsx
import { useNavigate } from 'react-router-dom'
import { useProgress } from '../context/ProgressContext'
import { listSubjects, getSubject } from '../data/tracks'
import { levelFromXp, reviewCount } from '../services/progressService'
import { firstName } from '../services/format'
import SubjectCard from '../components/SubjectCard'
import ProgressBar from '../components/common/ProgressBar'
import Ring from '../components/common/Ring'
import SubjectGlyph from '../components/icons/SubjectGlyph'
import UiIcon from '../components/icons/UiIcon'
import StreakBadge from '../components/StreakBadge'

function TodayPlan({ progress, onOpen, onStudy }) {
  const todayIdx = (new Date().getDay() + 6) % 7
  const ids = (progress?.studyPlan?.[todayIdx]) || []
  const subjects = ids.map(getSubject).filter(Boolean)
  if (subjects.length === 0) {
    return (
      <button onClick={onOpen} className="w-full text-left mb-3 rounded-xl2 border-2 border-dashed border-line p-4 flex items-center gap-3 text-slatey tap hover:border-violet/40">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-violet-wash text-violet"><UiIcon name="clock" size={20} /></span>
        <span className="flex-1 text-sm">Monte sua rotina de estudos da semana</span>
        <UiIcon name="chevronRight" size={18} className="text-faint" />
      </button>
    )
  }
  return (
    <div className="mb-3 rounded-xl2 bg-surface border border-line shadow-soft p-4">
      <div className="flex items-center justify-between mb-2.5">
        <p className="font-display font-bold text-ink flex items-center gap-2"><UiIcon name="clock" size={16} className="text-violet" /> Seu plano de hoje</p>
        <button onClick={onOpen} className="text-violet text-sm font-semibold">Editar</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {subjects.map((s) => (
          <button key={s.id} onClick={() => onStudy(s.id)} className="inline-flex items-center gap-1.5 rounded-full bg-violet-wash text-violet px-3 py-1.5 text-sm font-semibold tap">
            <SubjectGlyph id={s.id} size={15} /> {s.title}
          </button>
        ))}
      </div>
    </div>
  )
}

function ExamCountdown({ examDate, examLabel, onSet }) {
  if (!examDate) {
    return (
      <button onClick={onSet} className="w-full text-left mt-4 rounded-xl2 border-2 border-dashed border-line p-4 flex items-center gap-3 text-slatey tap hover:border-violet/40">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-violet-wash text-violet"><UiIcon name="target" size={20} /></span>
        <span className="flex-1 text-sm">Defina a data da sua prova para ver a contagem regressiva</span>
        <UiIcon name="chevronRight" size={18} className="text-faint" />
      </button>
    )
  }
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const exam = new Date(examDate + 'T00:00:00')
  const days = Math.ceil((exam - today) / 86400000)
  const past = days < 0
  return (
    <div className="mt-4 rounded-xl2 bg-night text-white p-4 shadow-card relative overflow-hidden">
      <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-ember/30 blur-2xl" />
      <div className="relative flex items-center gap-4">
        <div className="text-center">
          <p className="font-display text-3xl font-extrabold leading-none text-gold">{past ? '✓' : days}</p>
          <p className="text-[10px] uppercase tracking-wide text-white/60 mt-1">{past ? 'feita' : days === 1 ? 'dia' : 'dias'}</p>
        </div>
        <div className="h-10 w-px bg-white/15" />
        <div className="flex-1 min-w-0">
          <p className="text-white/60 text-xs">Contagem regressiva</p>
          <p className="font-display font-bold truncate">{examLabel || 'Sua prova'}</p>
          <p className="text-sm text-white/70">{past ? 'A data já passou — atualize nas configurações.' : `Falta${days === 1 ? '' : 'm'} ${days} dia${days === 1 ? '' : 's'} · ${exam.toLocaleDateString('pt-BR')}`}</p>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const { progress } = useProgress()
  const navigate = useNavigate()

  const chosen = progress.subjects || []
  const all = listSubjects(progress.track)
  const mySubjects = all.filter((s) => chosen.includes(s.id))
  const others = all.filter((s) => !chosen.includes(s.id))

  const { level, intoLevel, levelNeed } = levelFromXp(progress.xp || 0)
  const goalDone = (progress.weekXp || 0) >= progress.weeklyGoalXp
  const dueCount = reviewCount(progress)

  // Continuar de onde parou
  let resume = null
  const resumeSubject = progress.lastSubjectId ? getSubject(progress.lastSubjectId) : null
  if (resumeSubject) {
    const done = progress.completed?.[resumeSubject.id] || []
    const next = resumeSubject.lessons.find((l) => !done.includes(l.id))
    if (next) resume = { subject: resumeSubject, lesson: next }
  }

  return (
    <div className="animate-rise">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-slatey text-sm">Bom te ver de novo</p>
          <h1 className="font-display text-3xl font-extrabold text-ink">Olá, {firstName(progress.name)}</h1>
        </div>
      </div>

      {/* Contagem regressiva da prova */}
      <ExamCountdown examDate={progress.examDate} examLabel={progress.examLabel} onSet={() => navigate('/app/configuracoes')} />

      {/* Continuar */}
      {resume && (
        <button
          onClick={() => navigate(`/app/licao/${resume.subject.id}/${resume.lesson.id}`)}
          className="group w-full text-left mt-5 rounded-xl2 bg-brand text-white p-4 shadow-card shine relative overflow-hidden"
        >
          <div className="relative flex items-center gap-3.5">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15">
              <SubjectGlyph id={resume.subject.id} size={26} color="#fff" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-white/70 text-[11px] font-semibold uppercase tracking-wide">Continuar de onde parou</p>
              <p className="font-display font-bold truncate">{resume.lesson.title}</p>
              <p className="text-sm text-white/75">{resume.subject.title}</p>
            </div>
            <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-violet shrink-0 group-active:scale-95 transition-transform">
              <UiIcon name="play" size={20} />
            </span>
          </div>
        </button>
      )}

      {/* Nível + Meta */}
      <div className="grid sm:grid-cols-2 gap-3 mt-5">
        <div className="rounded-xl2 bg-night text-white p-5 shadow-card relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet/30 blur-2xl" />
          <div className="relative flex items-center gap-4">
            <Ring value={intoLevel} max={levelNeed} size={68} stroke={7} color="#F6B53D" track="rgba(255,255,255,0.14)">
              <span className="font-display font-extrabold text-lg">{level}</span>
            </Ring>
            <div>
              <p className="text-white/60 text-sm">Seu nível</p>
              <p className="font-display text-2xl font-extrabold">Nível {level}</p>
              <p className="text-xs text-white/50 mt-0.5">faltam {levelNeed - intoLevel} XP p/ subir</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl2 bg-surface p-5 border border-line shadow-soft">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-display font-bold text-ink flex items-center gap-2">
              <UiIcon name="target" size={18} className="text-violet" /> Meta da semana
            </h2>
            <StreakBadge days={progress.streak || 0} />
          </div>
          <p className="text-sm text-slatey mb-3">{progress.weekXp || 0} de {progress.weeklyGoalXp} XP</p>
          <ProgressBar value={progress.weekXp || 0} max={progress.weeklyGoalXp} color="violet" />
          {goalDone && (
            <p className="text-mint font-semibold text-sm mt-2.5 flex items-center gap-1.5">
              <UiIcon name="check" size={16} strokeWidth={2.5} /> Meta batida! Mandou bem.
            </p>
          )}
        </div>
      </div>

      {/* Praticar */}
      <h2 className="font-display text-lg font-bold text-ink mt-8 mb-3">Praticar</h2>
      <TodayPlan progress={progress} onOpen={() => navigate('/app/rotina')} onStudy={(id) => navigate(`/app/trilha/${id}`)} />
      <div className="grid grid-cols-3 gap-3">
        <button onClick={() => navigate('/app/revisao')}
          className="relative rounded-xl2 bg-surface border border-line shadow-soft p-4 flex flex-col items-center gap-2 tap hover:border-violet/40">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-wash text-violet"><UiIcon name="refresh" size={22} /></span>
          <span className="font-display font-bold text-ink text-sm">Revisão</span>
          {dueCount > 0 && (
            <span className="absolute top-2 right-2 grid h-6 min-w-6 px-1 place-items-center rounded-full bg-ember text-white text-xs font-bold">{dueCount}</span>
          )}
        </button>
        <button onClick={() => navigate('/app/simulado')}
          className="rounded-xl2 bg-surface border border-line shadow-soft p-4 flex flex-col items-center gap-2 tap hover:border-violet/40">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-ember/12 text-ember"><UiIcon name="target" size={22} /></span>
          <span className="font-display font-bold text-ink text-sm">Simulado</span>
        </button>
        <button onClick={() => navigate('/app/estatisticas')}
          className="rounded-xl2 bg-surface border border-line shadow-soft p-4 flex flex-col items-center gap-2 tap hover:border-violet/40">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-mint/12 text-mint"><UiIcon name="layers" size={22} /></span>
          <span className="font-display font-bold text-ink text-sm">Estatísticas</span>
        </button>
      </div>

      {/* Minhas matérias */}
      <div className="flex items-center justify-between mt-8 mb-3">
        <h2 className="font-display text-lg font-bold text-ink">Suas matérias</h2>
        <button onClick={() => navigate('/onboarding')} className="inline-flex items-center gap-1 text-violet text-sm font-semibold">
          <UiIcon name="plus" size={16} /> Adicionar
        </button>
      </div>
      <div className="flex flex-col gap-3">
        {mySubjects.map((s) => (
          <SubjectCard key={s.id} subject={s} doneCount={(progress.completed?.[s.id] || []).length} />
        ))}
        {mySubjects.length === 0 && (
          <button
            onClick={() => navigate('/onboarding')}
            className="rounded-xl2 border-2 border-dashed border-line p-6 text-slatey flex items-center justify-center gap-2"
          >
            <UiIcon name="plus" size={18} /> Escolher minhas matérias
          </button>
        )}
      </div>

      {/* Explorar mais */}
      {others.length > 0 && (
        <>
          <h2 className="font-display text-lg font-bold text-ink mt-8 mb-3">Explorar mais</h2>
          <div className="flex flex-col gap-3">
            {others.map((s) => (
              <SubjectCard key={s.id} subject={s} doneCount={(progress.completed?.[s.id] || []).length} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
