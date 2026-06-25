// src/pages/Forum.jsx
// Fórum global da comunidade, organizado por trilha e matéria.
import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProgress } from '../context/ProgressContext'
import { TRACKS, listSubjects, getSubject, getTrack } from '../data/tracks'
import { listThreads, createThread } from '../services/forumService'
import { timeAgo } from '../services/format'
import Spinner from '../components/common/Spinner'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import Avatar from '../components/common/Avatar'
import EmptyState from '../components/common/EmptyState'
import SubjectGlyph from '../components/icons/SubjectGlyph'
import UiIcon from '../components/icons/UiIcon'

const SORTS = [
  { id: 'recent', label: 'Recentes' },
  { id: 'top', label: 'Populares' },
  { id: 'unanswered', label: 'Sem resposta' },
]

function ThreadRow({ t, onClick }) {
  const subject = t.subjectId ? getSubject(t.subjectId) : null
  const track = t.track ? getTrack(t.track) : null
  return (
    <button onClick={onClick} className="group w-full text-left rounded-xl2 bg-surface p-4 border border-line shadow-soft tap hover:border-violet/40 hover:shadow-card">
      <div className="flex gap-3">
        <SubjectGlyph id={t.subjectId || t.track} tile size={44} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <h3 className="font-display font-bold text-ink leading-tight flex-1">{t.title}</h3>
            {t.solved && (
              <span className="chip bg-mint/12 text-mint !px-2 !py-0.5 shrink-0"><UiIcon name="check" size={12} strokeWidth={3} /> Resolvido</span>
            )}
          </div>
          <p className="text-sm text-slatey line-clamp-2 mt-0.5">{t.body}</p>
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-faint">
            <span className="inline-flex items-center gap-1.5">
              <Avatar name={t.authorName} size={18} /> {t.authorName}
            </span>
            <span>{timeAgo(t.createdAt)}</span>
            {(subject || track) && <span className="text-slatey font-medium">{subject?.title || track?.title}</span>}
            <span className="inline-flex items-center gap-1"><UiIcon name="message" size={13} /> {t.replyCount || 0}</span>
            {(t.votes || 0) > 0 && <span className="inline-flex items-center gap-1"><UiIcon name="bolt" size={13} /> {t.votes}</span>}
          </div>
        </div>
        <UiIcon name="chevronRight" className="text-faint self-center group-hover:text-violet transition-colors" />
      </div>
    </button>
  )
}

function AskModal({ open, onClose, onCreated }) {
  const { user } = useAuth()
  const { progress } = useProgress()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [track, setTrack] = useState(progress?.track || '')
  const [subjectId, setSubjectId] = useState('')
  const [busy, setBusy] = useState(false)
  const subjects = useMemo(() => listSubjects(track || null), [track])

  async function submit() {
    if (title.trim().length < 8 || body.trim().length < 10) return
    setBusy(true)
    const t = await createThread({
      title, body, track: track || null, subjectId: subjectId || null,
      author: { name: progress?.name || 'Estudante', uid: user?.uid || progress?.uid },
    })
    setBusy(false)
    setTitle(''); setBody(''); setSubjectId('')
    onCreated(t)
  }

  return (
    <Modal open={open} onClose={onClose} title="Nova pergunta">
      <div className="flex flex-col gap-3">
        <input className="field" placeholder="Qual é a sua dúvida? (título)" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
        <textarea className="field resize-none" rows={4} placeholder="Explique com detalhes para a comunidade te ajudar melhor." value={body} onChange={(e) => setBody(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <select className="field !py-2.5" value={track} onChange={(e) => { setTrack(e.target.value); setSubjectId('') }}>
            <option value="">Trilha (opcional)</option>
            {TRACKS.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
          <select className="field !py-2.5" value={subjectId} onChange={(e) => setSubjectId(e.target.value)} disabled={!track}>
            <option value="">Matéria (opcional)</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
        </div>
        <p className="text-xs text-slatey">Seja claro e respeitoso. Perguntas bem escritas recebem mais respostas.</p>
        <Button onClick={submit} disabled={busy || title.trim().length < 8 || body.trim().length < 10} className="w-full">
          {busy ? 'Publicando…' : 'Publicar pergunta'}
        </Button>
      </div>
    </Modal>
  )
}

export default function Forum() {
  const navigate = useNavigate()
  const [rows, setRows] = useState(null)
  const [track, setTrack] = useState(null)
  const [sort, setSort] = useState('recent')
  const [search, setSearch] = useState('')
  const [asking, setAsking] = useState(false)

  function reload() {
    setRows(null)
    listThreads({ track, sort }).then(setRows)
  }
  useEffect(() => { reload() }, [track, sort]) // eslint-disable-line

  const filtered = useMemo(() => {
    if (!rows) return null
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((t) => (t.title + ' ' + t.body).toLowerCase().includes(q))
  }, [rows, search])

  return (
    <div className="animate-rise">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ink flex items-center gap-2">
            <UiIcon name="forum" size={26} className="text-sky" /> Fórum
          </h1>
          <p className="text-slatey">Tire dúvidas e ajude outros estudantes.</p>
        </div>
        <Button onClick={() => setAsking(true)} size="sm" className="shrink-0"><UiIcon name="plus" size={16} /> Perguntar</Button>
      </div>

      {/* Busca */}
      <div className="relative mt-5">
        <UiIcon name="search" size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
        <input className="field !pl-10" placeholder="Buscar no fórum…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Categorias (trilhas) */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mt-4 -mx-4 px-4 pb-1">
        <CatChip active={!track} onClick={() => setTrack(null)} label="Todas" />
        {TRACKS.map((t) => (
          <CatChip key={t.id} active={track === t.id} onClick={() => setTrack(t.id)} label={t.title} id={t.id} />
        ))}
      </div>

      {/* Ordenação */}
      <div className="grid grid-cols-3 gap-1 p-1 rounded-xl2 bg-line/70 mt-4">
        {SORTS.map((s) => (
          <button key={s.id} onClick={() => setSort(s.id)}
            className={`py-2 rounded-xl font-display font-semibold text-sm transition-colors ${sort === s.id ? 'bg-surface text-ink shadow-soft' : 'text-slatey'}`}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="mt-4">
        {!filtered ? <Spinner label="Carregando o fórum…" /> : filtered.length === 0 ? (
          <EmptyState icon={<UiIcon name="forum" />} title="Nenhuma pergunta por aqui ainda"
            action={<Button onClick={() => setAsking(true)}><UiIcon name="plus" size={16} /> Fazer a primeira pergunta</Button>}>
            Seja o primeiro a iniciar uma conversa nesta categoria.
          </EmptyState>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((t) => <ThreadRow key={t.id} t={t} onClick={() => navigate(`/app/forum/${t.id}`)} />)}
          </div>
        )}
      </div>

      <AskModal open={asking} onClose={() => setAsking(false)} onCreated={(t) => { setAsking(false); navigate(`/app/forum/${t.id}`) }} />
    </div>
  )
}

function CatChip({ active, onClick, label, id }) {
  return (
    <button onClick={onClick}
      className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold border transition-colors ${
        active ? 'bg-violet text-white border-violet' : 'bg-surface text-slatey border-line hover:border-violet/40'
      }`}>
      {id && <SubjectGlyph id={id} size={16} color={active ? '#fff' : undefined} />}
      {label}
    </button>
  )
}
