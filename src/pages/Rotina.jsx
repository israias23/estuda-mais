// src/pages/Rotina.jsx
// Calendário semanal de estudos: o usuário escolhe o que estudar em cada dia.
import { useNavigate } from 'react-router-dom'
import { useProgress } from '../context/ProgressContext'
import { listSubjects, getSubject } from '../data/tracks'
import SubjectGlyph from '../components/icons/SubjectGlyph'
import UiIcon from '../components/icons/UiIcon'
import Button from '../components/common/Button'

const WEEK = [
  { i: 0, label: 'Segunda', short: 'Seg' },
  { i: 1, label: 'Terça', short: 'Ter' },
  { i: 2, label: 'Quarta', short: 'Qua' },
  { i: 3, label: 'Quinta', short: 'Qui' },
  { i: 4, label: 'Sexta', short: 'Sex' },
  { i: 5, label: 'Sábado', short: 'Sáb' },
  { i: 6, label: 'Domingo', short: 'Dom' },
]
export const todayIndex = () => (new Date().getDay() + 6) % 7 // segunda = 0

export default function Rotina() {
  const { progress, update } = useProgress()
  const navigate = useNavigate()
  const plan = progress?.studyPlan || {}
  const mine = listSubjects(progress?.track || null).filter((s) => (progress?.subjects || []).includes(s.id))
  const pool = mine.length ? mine : listSubjects(progress?.track || null).filter((s) => s.ready)
  const today = todayIndex()

  function toggle(dayIndex, subjectId) {
    update((p) => {
      const sp = { ...(p.studyPlan || {}) }
      const list = new Set(sp[dayIndex] || [])
      if (list.has(subjectId)) list.delete(subjectId)
      else list.add(subjectId)
      sp[dayIndex] = [...list]
      return { ...p, studyPlan: sp }
    })
  }

  function clearAll() {
    if (confirm('Limpar toda a rotina?')) update((p) => ({ ...p, studyPlan: {} }))
  }

  const hasAny = Object.values(plan).some((a) => (a || []).length > 0)

  return (
    <div className="animate-rise">
      <button onClick={() => navigate('/app/perfil')} className="inline-flex items-center gap-1 text-violet font-semibold text-sm mb-3">
        <UiIcon name="chevronLeft" size={16} /> Perfil
      </button>
      <h1 className="font-display text-3xl font-extrabold text-ink flex items-center gap-2">
        <UiIcon name="clock" size={24} className="text-violet" /> Rotina de estudos
      </h1>
      <p className="text-slatey mb-6">Monte sua semana: toque nas matérias para incluí-las em cada dia.</p>

      <div className="flex flex-col gap-3">
        {WEEK.map((d) => {
          const chosen = plan[d.i] || []
          const isToday = d.i === today
          return (
            <div key={d.i} className={`rounded-xl2 border p-4 shadow-soft ${isToday ? 'border-violet bg-violet-wash/40' : 'border-line bg-surface'}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`grid h-9 w-9 place-items-center rounded-xl font-display font-bold text-sm ${isToday ? 'bg-violet text-white' : 'bg-line text-slatey'}`}>{d.short}</span>
                <span className="font-display font-bold text-ink">{d.label}</span>
                {isToday && <span className="chip bg-violet text-white">Hoje</span>}
                {chosen.length > 0 && <span className="ml-auto text-xs text-slatey">{chosen.length} matéria{chosen.length > 1 ? 's' : ''}</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                {pool.map((s) => {
                  const on = chosen.includes(s.id)
                  return (
                    <button key={s.id} onClick={() => toggle(d.i, s.id)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold border transition-colors ${
                        on ? 'bg-violet text-white border-violet' : 'bg-surface text-slatey border-line hover:border-violet/40'}`}>
                      <SubjectGlyph id={s.id} size={15} color={on ? '#fff' : undefined} /> {s.title}
                    </button>
                  )
                })}
                {pool.length === 0 && <p className="text-sm text-slatey">Escolha matérias no seu perfil primeiro.</p>}
              </div>
            </div>
          )
        })}
      </div>

      {hasAny && (
        <button onClick={clearAll} className="text-sm text-slatey mt-5 w-full text-center underline">Limpar rotina</button>
      )}
    </div>
  )
}
