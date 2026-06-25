// src/pages/Profile.jsx
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProgress } from '../context/ProgressContext'
import { getSubject, getTrack } from '../data/tracks'
import { levelFromXp } from '../services/progressService'
import Button from '../components/common/Button'
import Avatar from '../components/common/Avatar'
import UiIcon from '../components/icons/UiIcon'
import SubjectGlyph from '../components/icons/SubjectGlyph'
import { InstallCard } from '../components/InstallApp'

export default function Profile() {
  const { user, logout } = useAuth()
  const { progress } = useProgress()
  const navigate = useNavigate()
  const { level } = levelFromXp(progress.xp || 0)
  const track = getTrack(progress.track)

  const earnedIds = new Set([
    ...(progress.certificates || []),
    ...(progress.subjects || [])
      .map(getSubject).filter(Boolean)
      .filter((s) => (progress.completed?.[s.id] || []).length >= s.lessons.length)
      .map((s) => s.id),
  ])
  const completedSubjects = [...earnedIds].map(getSubject).filter(Boolean)

  const totalDone = Object.values(progress.completed || {}).reduce((a, arr) => a + arr.length, 0)

  const stats = [
    { label: 'Nível', value: level, icon: 'bolt', color: 'text-violet' },
    { label: 'XP total', value: (progress.xp || 0).toLocaleString('pt-BR'), icon: 'sparkles', color: 'text-gold' },
    { label: 'Ofensiva', value: `${progress.streak || 0}d`, icon: 'flame', color: 'text-ember' },
    { label: 'Lições', value: totalDone, icon: 'check', color: 'text-mint' },
  ]

  async function handleLogout() { await logout(); navigate('/') }

  return (
    <div className="animate-rise">
      {/* Cabeçalho do perfil */}
      <div className="rounded-xl2 bg-night text-white p-5 shadow-card relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-60" />
        <div className="relative flex items-center gap-4">
          <Avatar name={progress.name} size={64} ring />
          <div className="min-w-0">
            <h1 className="font-display text-xl font-extrabold truncate">{progress.name}</h1>
            <p className="text-white/60 text-sm truncate">{user?.email}</p>
            {track && (
              <span className="chip bg-white/10 text-white/80 mt-1.5"><SubjectGlyph id={track.id} size={14} color="#fff" /> {track.title}</span>
            )}
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-4 gap-2.5 mt-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl2 bg-surface p-3 text-center border border-line shadow-soft">
            <UiIcon name={s.icon} size={18} className={`mx-auto mb-1 ${s.color}`} />
            <p className="font-display text-lg font-extrabold text-ink leading-none">{s.value}</p>
            <p className="text-[11px] text-slatey mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Atalhos */}
      <div className="flex flex-col gap-3 mt-7">
        <button onClick={() => navigate('/app/conquistas')}
          className="flex items-center gap-3 rounded-xl2 bg-surface p-4 border border-line shadow-soft text-left tap hover:border-violet/40">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gold/15 text-gold"><UiIcon name="trophy" /></span>
          <div className="flex-1">
            <p className="font-display font-bold text-ink">Conquistas</p>
            <p className="text-sm text-slatey">Medalhas que você desbloqueou</p>
          </div>
          <UiIcon name="chevronRight" className="text-faint" />
        </button>
        <button onClick={() => navigate('/app/estatisticas')}
          className="flex items-center gap-3 rounded-xl2 bg-surface p-4 border border-line shadow-soft text-left tap hover:border-violet/40">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-wash text-violet"><UiIcon name="layers" /></span>
          <div className="flex-1">
            <p className="font-display font-bold text-ink">Estatísticas</p>
            <p className="text-sm text-slatey">Sua evolução e acerto por matéria</p>
          </div>
          <UiIcon name="chevronRight" className="text-faint" />
        </button>
        <button onClick={() => navigate('/app/rotina')}
          className="flex items-center gap-3 rounded-xl2 bg-surface p-4 border border-line shadow-soft text-left tap hover:border-violet/40">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-wash text-violet"><UiIcon name="clock" /></span>
          <div className="flex-1">
            <p className="font-display font-bold text-ink">Rotina de estudos</p>
            <p className="text-sm text-slatey">Planeje o que estudar em cada dia</p>
          </div>
          <UiIcon name="chevronRight" className="text-faint" />
        </button>
        <button onClick={() => navigate('/app/anotacoes')}
          className="flex items-center gap-3 rounded-xl2 bg-surface p-4 border border-line shadow-soft text-left tap hover:border-violet/40">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-wash text-violet"><UiIcon name="edit" /></span>
          <div className="flex-1">
            <p className="font-display font-bold text-ink">Minhas anotações</p>
            <p className="text-sm text-slatey">Tudo o que você anotou nas aulas</p>
          </div>
          <UiIcon name="chevronRight" className="text-faint" />
        </button>
        <button onClick={() => navigate('/app/configuracoes')}
          className="flex items-center gap-3 rounded-xl2 bg-surface p-4 border border-line shadow-soft text-left tap hover:border-violet/40">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-wash text-violet"><UiIcon name="settings" /></span>
          <div className="flex-1">
            <p className="font-display font-bold text-ink">Configurações</p>
            <p className="text-sm text-slatey">Conta, senha, meta e data da prova</p>
          </div>
          <UiIcon name="chevronRight" className="text-faint" />
        </button>
      </div>

      {/* Instalar app */}
      <h2 className="font-display text-lg font-bold text-ink mt-7 mb-3">Aplicativo</h2>
      <InstallCard />

      {/* Certificados */}
      <h2 className="font-display text-lg font-bold text-ink mt-7 mb-3">Seus certificados</h2>
      {completedSubjects.length === 0 ? (
        <div className="rounded-xl2 border-2 border-dashed border-line p-6 text-center text-slatey">
          <span className="mx-auto mb-2 grid h-11 w-11 place-items-center rounded-2xl bg-gold/15 text-[#B5841E]"><UiIcon name="award" /></span>
          Conclua uma trilha inteira para ganhar seu primeiro certificado.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {completedSubjects.map((s) => (
            <button key={s.id} onClick={() => navigate(`/app/certificado/${s.id}`)}
              className="flex items-center gap-3 rounded-xl2 bg-surface p-4 border border-line shadow-soft text-left tap hover:border-violet/40">
              <SubjectGlyph id={s.id} tile size={46} />
              <div className="flex-1">
                <p className="font-display font-bold text-ink">{s.title}</p>
                <p className="text-sm text-slatey">Certificado disponível</p>
              </div>
              <UiIcon name="award" className="text-gold" />
            </button>
          ))}
        </div>
      )}

      <Button variant="ghost" onClick={handleLogout} className="w-full mt-7">
        <UiIcon name="logout" size={18} /> Sair da conta
      </Button>
    </div>
  )
}
