// src/pages/Achievements.jsx
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProgress } from '../context/ProgressContext'
import { computeAchievements } from '../services/achievements'
import UiIcon from '../components/icons/UiIcon'

export default function Achievements() {
  const { progress } = useProgress()
  const navigate = useNavigate()
  const list = useMemo(() => computeAchievements(progress), [progress])
  const earned = list.filter((a) => a.earned).length

  return (
    <div className="animate-rise">
      <button onClick={() => navigate('/app/perfil')} className="inline-flex items-center gap-1 text-violet font-semibold text-sm mb-3">
        <UiIcon name="chevronLeft" size={16} /> Perfil
      </button>
      <h1 className="font-display text-3xl font-extrabold text-ink flex items-center gap-2">
        <UiIcon name="trophy" size={24} className="text-gold" /> Conquistas
      </h1>
      <p className="text-slatey mb-6">{earned} de {list.length} desbloqueadas. Continue estudando para liberar as demais!</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {list.map((a) => (
          <div key={a.id} className={`rounded-xl2 border p-4 text-center shadow-soft transition-colors ${
            a.earned ? 'bg-surface border-gold/40' : 'bg-surface border-line opacity-70'}`}>
            <span className={`mx-auto mb-2 grid h-12 w-12 place-items-center rounded-2xl ${
              a.earned ? 'bg-gold/15 text-gold' : 'bg-line text-faint'}`}>
              <UiIcon name={a.earned ? a.icon : 'lock'} size={22} />
            </span>
            <p className="font-display font-bold text-ink text-sm leading-tight">{a.title}</p>
            <p className="text-xs text-slatey mt-1 leading-snug">{a.desc}</p>
            {!a.earned && (
              <div className="mt-2">
                <div className="h-1.5 rounded-full bg-ink/[0.07] overflow-hidden">
                  <div className="h-full bg-violet rounded-full" style={{ width: `${a.pct}%` }} />
                </div>
                <p className="text-[10px] text-faint mt-1">{a.pct}%</p>
              </div>
            )}
            {a.earned && <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gold mt-2"><UiIcon name="check" size={12} strokeWidth={3} /> Conquistada</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
