// src/pages/ForumThread.jsx
// Detalhe de uma pergunta do fórum: enunciado, respostas e campo de resposta.
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProgress } from '../context/ProgressContext'
import { getThread, addReply, acceptReply, voteReply } from '../services/forumService'
import { getSubject, getTrack } from '../data/tracks'
import { timeAgo } from '../services/format'
import Spinner from '../components/common/Spinner'
import Button from '../components/common/Button'
import Avatar from '../components/common/Avatar'
import EmptyState from '../components/common/EmptyState'
import SubjectGlyph from '../components/icons/SubjectGlyph'
import UiIcon from '../components/icons/UiIcon'

export default function ForumThread() {
  const { threadId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { progress } = useProgress()

  const [data, setData] = useState(undefined) // undefined=carregando, null=não achou
  const [reply, setReply] = useState('')
  const [busy, setBusy] = useState(false)
  const [voted, setVoted] = useState({}) // evita votos repetidos na mesma sessão

  useEffect(() => { getThread(threadId).then(setData) }, [threadId])

  if (data === undefined) return <Spinner label="Abrindo a discussão…" />
  if (data === null) {
    return (
      <EmptyState icon={<UiIcon name="forum" />} title="Pergunta não encontrada"
        action={<Button onClick={() => navigate('/app/forum')}>Voltar ao fórum</Button>}>
        Ela pode ter sido removida.
      </EmptyState>
    )
  }

  const { thread, replies } = data
  const subject = thread.subjectId ? getSubject(thread.subjectId) : null
  const track = thread.track ? getTrack(thread.track) : null
  const isAuthor = (user?.uid || progress?.uid) && thread.authorUid === (user?.uid || progress?.uid)

  async function submit() {
    if (reply.trim().length < 2) return
    setBusy(true)
    const r = await addReply(threadId, {
      body: reply,
      author: { name: progress?.name || 'Estudante', uid: user?.uid || progress?.uid },
    })
    setBusy(false)
    setReply('')
    setData((d) => ({ thread: { ...d.thread, replyCount: (d.thread.replyCount || 0) + 1 }, replies: [...d.replies, r] }))
  }

  async function onAccept(replyId) {
    const turnOn = !replies.find((r) => r.id === replyId)?.accepted
    await acceptReply(threadId, replyId, turnOn)
    setData((d) => ({
      thread: { ...d.thread, solved: turnOn },
      replies: d.replies.map((r) => ({ ...r, accepted: turnOn && r.id === replyId })),
    }))
  }

  async function onVote(replyId) {
    if (voted[replyId]) return
    setVoted((v) => ({ ...v, [replyId]: true }))
    await voteReply(replyId, 1)
    setData((d) => ({ ...d, replies: d.replies.map((r) => (r.id === replyId ? { ...r, votes: (r.votes || 0) + 1 } : r)) }))
  }

  return (
    <div className="animate-rise">
      <button onClick={() => navigate('/app/forum')} className="inline-flex items-center gap-1 text-violet font-semibold text-sm mb-3">
        <UiIcon name="chevronLeft" size={16} /> Fórum
      </button>

      {/* Pergunta */}
      <div className="rounded-xl2 bg-surface border border-line shadow-soft p-5">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          {(subject || track) && (
            <span className="chip bg-violet-wash text-violet">
              <SubjectGlyph id={thread.subjectId || thread.track} size={14} /> {subject?.title || track?.title}
            </span>
          )}
          {thread.solved && <span className="chip bg-mint/12 text-mint"><UiIcon name="check" size={12} strokeWidth={3} /> Resolvido</span>}
        </div>
        <h1 className="font-display text-xl font-extrabold text-ink leading-tight">{thread.title}</h1>
        <p className="prose-study mt-2 whitespace-pre-wrap"><span className="text-ink/90">{thread.body}</span></p>
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-line text-sm">
          <Avatar name={thread.authorName} size={28} />
          <span className="font-semibold text-ink">{thread.authorName}</span>
          <span className="text-faint">· {timeAgo(thread.createdAt)}</span>
        </div>
      </div>

      {/* Respostas */}
      <h2 className="font-display font-bold text-ink mt-6 mb-3 flex items-center gap-2">
        <UiIcon name="message" size={18} className="text-sky" />
        {replies.length} {replies.length === 1 ? 'resposta' : 'respostas'}
      </h2>

      <div className="flex flex-col gap-3">
        {replies.map((r) => (
          <div key={r.id} className={`rounded-xl2 p-4 border shadow-soft ${r.accepted ? 'bg-mint/[0.06] border-mint/30' : 'bg-surface border-line'}`}>
            {r.accepted && (
              <span className="chip bg-mint/12 text-mint mb-2"><UiIcon name="check" size={12} strokeWidth={3} /> Resposta aceita</span>
            )}
            <p className="prose-study whitespace-pre-wrap"><span className="text-ink/90">{r.body}</span></p>
            <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-line/70 text-sm">
              <Avatar name={r.authorName} size={26} />
              <span className="font-semibold text-ink">{r.authorName}</span>
              <span className="text-faint">· {timeAgo(r.createdAt)}</span>
              <div className="flex-1" />
              <button onClick={() => onVote(r.id)} disabled={voted[r.id]}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${voted[r.id] ? 'bg-violet-wash text-violet' : 'text-slatey hover:bg-violet-wash hover:text-violet'}`}>
                <UiIcon name="thumbsUp" size={14} /> {r.votes || 0}
              </button>
              {isAuthor && (
                <button onClick={() => onAccept(r.id)}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${r.accepted ? 'bg-mint/15 text-mint' : 'text-slatey hover:bg-mint/10 hover:text-mint'}`}>
                  <UiIcon name="check" size={14} strokeWidth={2.5} /> {r.accepted ? 'Aceita' : 'Aceitar'}
                </button>
              )}
            </div>
          </div>
        ))}
        {replies.length === 0 && (
          <p className="text-sm text-slatey text-center py-4">Ainda não há respostas. Que tal ser o primeiro a ajudar?</p>
        )}
      </div>

      {/* Responder */}
      <div className="sticky bottom-4 mt-6">
        <div className="rounded-xl2 bg-surface border border-line shadow-card p-3">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={2}
            placeholder="Escreva sua resposta…"
            className="w-full resize-none bg-transparent px-2 py-1.5 text-ink placeholder:text-faint focus:outline-none"
          />
          <div className="flex justify-end">
            <Button onClick={submit} disabled={busy || reply.trim().length < 2} size="sm">
              {busy ? 'Enviando…' : <>Responder <UiIcon name="send" size={16} /></>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
