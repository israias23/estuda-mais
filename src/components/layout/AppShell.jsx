// src/components/layout/AppShell.jsx
// Estrutura visual comum. Mobile-first: cabeçalho + navegação inferior.
// Em telas grandes vira uma barra lateral escura. Inclui o novo item "Fórum".
import { NavLink, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useProgress } from '../../context/ProgressContext'
import { levelFromXp } from '../../services/progressService'
import { maybeRemind } from '../../services/notifications'
import StreakBadge from '../StreakBadge'
import XpPill from '../XpPill'
import UiIcon from '../icons/UiIcon'
import { BrandMark } from '../Brand'
import { InstallBanner } from '../InstallApp'

const tabs = [
  { to: '/app', label: 'Início', icon: 'home', end: true },
  { to: '/app/forum', label: 'Fórum', icon: 'forum' },
  { to: '/app/ranking', label: 'Ranking', icon: 'trophy' },
  { to: '/app/perfil', label: 'Perfil', icon: 'user' },
]

export default function AppShell({ children }) {
  const { progress } = useProgress()
  const navigate = useNavigate()
  const { level, intoLevel, levelNeed } = levelFromXp(progress?.xp || 0)
  const pct = Math.round((intoLevel / levelNeed) * 100)

  useEffect(() => {
    const t = setTimeout(() => maybeRemind(progress), 4000)
    return () => clearTimeout(t)
  }, [progress?.lastStudyDay]) // eslint-disable-line

  return (
    <div className="min-h-screen bg-cloud md:flex">
      {/* Cabeçalho (celular) */}
      <header className="sticky top-0 z-30 flex items-center justify-between bg-surface/85 backdrop-blur-md px-4 py-3 border-b border-line md:hidden">
        <button onClick={() => navigate('/app')} className="flex items-center gap-2 tap" aria-label="Início">
          <BrandMark size={30} />
          <span className="font-display font-extrabold text-ink">Estuda<span className="text-violet">+</span></span>
        </button>
        <div className="flex items-center gap-2.5">
          <button onClick={() => navigate('/app/busca')} aria-label="Buscar" className="grid h-9 w-9 place-items-center rounded-full text-slatey hover:bg-violet-wash hover:text-violet">
            <UiIcon name="search" size={20} />
          </button>
          <StreakBadge days={progress?.streak || 0} />
          <XpPill xp={progress?.xp || 0} />
        </div>
      </header>

      {/* Barra lateral (desktop/tablet) */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:shrink-0 md:h-screen md:sticky md:top-0 bg-night text-white p-5">
        <button onClick={() => navigate('/app')} className="flex items-center gap-2.5 mb-8 tap">
          <BrandMark size={36} />
          <span className="font-display font-extrabold text-xl">Estuda<span className="text-violet-soft">+</span></span>
        </button>

        <nav className="flex flex-col gap-1">
          <NavLink
            to="/app/busca"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl2 px-4 py-3 font-display font-semibold transition-colors ${
                isActive ? 'bg-violet text-white shadow-soft' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <UiIcon name="search" size={21} /> Buscar
          </NavLink>
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl2 px-4 py-3 font-display font-semibold transition-colors ${
                  isActive ? 'bg-violet text-white shadow-soft' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <UiIcon name={t.icon} size={21} />
              {t.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto">
          <div className="rounded-xl2 bg-white/[0.06] p-4">
            <div className="flex items-center justify-between mb-2">
              <StreakBadge days={progress?.streak || 0} />
              <span className="font-display font-bold text-violet-soft text-sm">Nível {level}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-gold transition-all duration-700" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-2 text-xs text-white/50">{(progress?.xp || 0).toLocaleString('pt-BR')} XP · faltam {levelNeed - intoLevel} p/ subir</p>
          </div>
        </div>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 pb-24 md:pb-10">
        <div className="mx-auto w-full max-w-2xl px-4 pt-4 md:pt-8">
          <div className="md:hidden mb-4"><InstallBanner /></div>
        </div>
        <div className="mx-auto w-full max-w-2xl px-4 pb-6">{children}</div>
      </main>

      {/* Navegação inferior (celular) */}
      <nav className="fixed bottom-0 inset-x-0 z-30 grid grid-cols-4 bg-surface/95 backdrop-blur-md border-t border-line md:hidden pb-[env(safe-area-inset-bottom)]">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold transition-colors ${
                isActive ? 'text-violet' : 'text-faint'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-violet" />}
                <UiIcon name={t.icon} size={22} strokeWidth={isActive ? 2.1 : 1.8} />
                {t.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
