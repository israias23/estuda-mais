// src/pages/Statistics.jsx
// Estatísticas de estudo: XP ao longo do tempo e aproveitamento por matéria.
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProgress } from '../context/ProgressContext'
import { getSubject } from '../data/tracks'
import { reviewCount } from '../services/progressService'
import SubjectGlyph, { subjectColor } from '../components/icons/SubjectGlyph'
import UiIcon from '../components/icons/UiIcon'
import EmptyState from '../components/common/EmptyState'
import Button from '../components/common/Button'

const DAY = 86400000

function lastDays(n) {
  const out = []
  const base = new Date(); base.setHours(0, 0, 0, 0)
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(base.getTime() - i * DAY)
    out.push({ key: d.toISOString().slice(0, 10), date: d })
  }
  return out
}

export default function Statistics() {
  const { progress } = useProgress()
  const navigate = useNavigate()

  const xpLog = progress?.xpLog || {}
  const days = useMemo(() => lastDays(14).map((d) => ({ ...d, xp: xpLog[d.key] || 0 })), [xpLog])
  const maxXp = Math.max(10, ...days.map((d) => d.xp))
  const totalXp14 = days.reduce((a, d) => a + d.xp, 0)

  const stats = progress?.subjectStats || {}
  const subjectRows = useMemo(() => Object.entries(stats)
    .map(([id, s]) => ({ id, ...s, pct: s.total ? Math.round((s.correct / s.total) * 100) : 0, title: getSubject(id)?.title || 'Matéria' }))
    .sort((a, b) => b.total - a.total), [stats])

  const totalAnswered = subjectRows.reduce((a, r) => a + r.total, 0)
  const totalCorrect = subjectRows.reduce((a, r) => a + r.correct, 0)
  const overall = totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 0
  const lessonsDone = Object.values(progress?.completed || {}).reduce((a, arr) => a + arr.length, 0)
  const pending = reviewCount(progress)

  const cards = [
    { label: 'Questões', value: totalAnswered, icon: 'layers', color: 'text-violet' },
    { label: 'Acerto geral', value: `${overall}%`, icon: 'target', color: 'text-mint' },
    { label: 'Lições', value: lessonsDone, icon: 'check', color: 'text-sky' },
    { label: 'A revisar', value: pending, icon: 'refresh', color: 'text-ember' },
  ]

  const nothingYet = totalAnswered === 0 && totalXp14 === 0

  return (
    <div className="animate-rise">
      <button onClick={() => navigate('/app/perfil')} className="inline-flex items-center gap-1 text-violet font-semibold text-sm mb-3">
        <UiIcon name="chevronLeft" size={16} /> Perfil
      </button>
      <h1 className="font-display text-3xl font-extrabold text-ink flex items-center gap-2">
        <UiIcon name="layers" size={24} className="text-violet" /> Estatísticas
      </h1>
      <p className="text-slatey mb-6">Acompanhe sua evolução e descubra onde focar.</p>

      {nothingYet ? (
        <EmptyState icon={<UiIcon name="layers" />} title="Sem dados ainda"
          action={<Button onClick={() => navigate('/app')}>Começar a estudar</Button>}>
          Conclua algumas lições e responda questões para ver seus gráficos aqui.
        </EmptyState>
      ) : (
        <>
          {/* Resumo */}
          <div className="grid grid-cols-4 gap-2.5">
            {cards.map((c) => (
              <div key={c.label} className="rounded-xl2 bg-surface p-3 text-center border border-line shadow-soft">
                <UiIcon name={c.icon} size={18} className={`mx-auto mb-1 ${c.color}`} />
                <p className="font-display text-lg font-extrabold text-ink leading-none">{c.value}</p>
                <p className="text-[11px] text-slatey mt-1">{c.label}</p>
              </div>
            ))}
          </div>

          {/* XP nos últimos 14 dias */}
          <div className="rounded-xl2 bg-surface border border-line shadow-soft p-5 mt-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-ink flex items-center gap-2"><UiIcon name="bolt" size={18} className="text-gold" /> XP nos últimos 14 dias</h2>
              <span className="text-sm font-semibold text-violet">{totalXp14} XP</span>
            </div>
            <div className="flex items-end justify-between gap-1 h-32">
              {days.map((d, i) => (
                <div key={d.key} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
                  <div className="w-full rounded-t-md bg-violet/80 transition-all" style={{ height: `${Math.max(3, (d.xp / maxXp) * 100)}%`, background: d.xp ? undefined : 'var(--tw-line, #E9E7F4)' }} title={`${d.xp} XP`} />
                  {(i % 2 === 0 || i === days.length - 1) && (
                    <span className="text-[9px] text-faint">{d.date.getDate()}/{d.date.getMonth() + 1}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Aproveitamento por matéria */}
          <div className="rounded-xl2 bg-surface border border-line shadow-soft p-5 mt-4">
            <h2 className="font-display font-bold text-ink flex items-center gap-2 mb-4"><UiIcon name="target" size={18} className="text-mint" /> Acerto por matéria</h2>
            {subjectRows.length === 0 ? (
              <p className="text-sm text-slatey">Responda questões nas lições para ver seu aproveitamento por matéria.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {subjectRows.map((r) => {
                  const c = subjectColor(r.id)
                  return (
                    <div key={r.id}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <SubjectGlyph id={r.id} size={18} />
                        <span className="font-display font-semibold text-ink text-sm flex-1">{r.title}</span>
                        <span className="text-sm font-bold" style={{ color: c }}>{r.pct}%</span>
                        <span className="text-xs text-faint">({r.correct}/{r.total})</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-ink/[0.06] overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${r.pct}%`, background: c }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {pending > 0 && (
            <Button onClick={() => navigate('/app/revisao')} className="w-full mt-5">
              <UiIcon name="refresh" size={18} /> Revisar {pending} {pending === 1 ? 'questão' : 'questões'} pendente{pending === 1 ? '' : 's'}
            </Button>
          )}
        </>
      )}
    </div>
  )
}
