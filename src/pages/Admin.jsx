// src/pages/Admin.jsx
// Painel administrativo — acessível apenas pela rota /painel (não aparece em lugar
// nenhum para o usuário comum). Exige senha de admin; no 1º acesso, troca obrigatória.
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  isAdminSession, adminLogin, adminLoginFirebase, setAdminPassword, adminLogout,
  adminStats, adminLoadLesson, adminSaveLesson,
} from '../services/adminService'
import { firebaseEnabled } from '../firebase/config'
import { saveCustomCatalog, loadCustomCatalog } from '../services/customCatalog'
import { listSubjects, getSubject, getTrack, TRACKS } from '../data/tracks'
import { listThreads, deleteThreadAdmin } from '../services/forumService'
import { timeAgo } from '../services/format'
import Button from '../components/common/Button'
import Spinner from '../components/common/Spinner'
import SubjectGlyph, { subjectColor } from '../components/icons/SubjectGlyph'
import UiIcon from '../components/icons/UiIcon'
import { BrandMark } from '../components/Brand'

function Shell({ children, onLogout }) {
  return (
    <div className="min-h-screen bg-cloud">
      <header className="bg-night text-white">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrandMark size={28} />
            <span className="font-display font-extrabold">Estuda<span className="text-violet-soft">+</span> · Admin</span>
          </div>
          {onLogout && (
            <button onClick={onLogout} className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white">
              <UiIcon name="logout" size={16} /> Sair
            </button>
          )}
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slatey mb-1 block">{label}</span>
      <input className="field" {...props} />
    </label>
  )
}

// ---------- LOGIN ----------
function AdminLogin({ onIn }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  async function go(e) {
    e.preventDefault(); setErr(''); setBusy(true)
    try {
      const r = firebaseEnabled ? await adminLoginFirebase(email, pw) : await adminLogin(pw)
      onIn(r.mustChange)
    } catch (e) { setErr(traduzAdmin(e)) } finally { setBusy(false) }
  }
  return (
    <Shell>
      <div className="max-w-sm mx-auto mt-10">
        <div className="text-center mb-6">
          <span className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-night text-white"><UiIcon name="lock" size={26} /></span>
          <h1 className="font-display text-2xl font-extrabold text-ink">Área administrativa</h1>
          <p className="text-slatey text-sm">Acesso restrito.{firebaseEnabled ? ' Entre com a conta de administrador.' : ' Informe a senha de administrador.'}</p>
        </div>
        <form onSubmit={go} className="flex flex-col gap-3">
          {firebaseEnabled && (
            <Field label="E-mail do admin" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus placeholder="admin@email.com" />
          )}
          <Field label={firebaseEnabled ? 'Senha' : 'Senha de admin'} type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus={!firebaseEnabled} placeholder="••••••••" />
          {err && <p className="text-ember text-sm flex items-center gap-1.5"><UiIcon name="close" size={15} /> {err}</p>}
          <Button type="submit" disabled={busy} className="w-full">{busy ? 'Verificando…' : 'Entrar'}</Button>
          <button type="button" onClick={() => navigate('/')} className="text-sm text-slatey mt-1">Voltar ao site</button>
        </form>
      </div>
    </Shell>
  )
}

function traduzAdmin(e) {
  const m = (e?.code || e?.message || '').toString()
  if (m.includes('invalid-credential') || m.includes('wrong-password') || m.includes('user-not-found')) return 'E-mail ou senha incorretos.'
  if (m.includes('too-many-requests')) return 'Muitas tentativas. Tente novamente mais tarde.'
  return e?.message || 'Não foi possível entrar.'
}

// ---------- TROCA OBRIGATÓRIA ----------
function AdminChangePw({ onDone }) {
  const [p1, setP1] = useState(''); const [p2, setP2] = useState('')
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false)
  async function go(e) {
    e.preventDefault(); setErr('')
    if (p1 !== p2) return setErr('As senhas não conferem.')
    setBusy(true)
    try { await setAdminPassword(p1); onDone() }
    catch (e) { setErr(e.message) } finally { setBusy(false) }
  }
  return (
    <Shell>
      <div className="max-w-sm mx-auto mt-10">
        <div className="text-center mb-6">
          <span className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-ember/15 text-ember"><UiIcon name="lock" size={26} /></span>
          <h1 className="font-display text-2xl font-extrabold text-ink">Defina sua senha</h1>
          <p className="text-slatey text-sm">Por segurança, troque a senha provisória antes de continuar.</p>
        </div>
        <form onSubmit={go} className="flex flex-col gap-3">
          <Field label="Nova senha (mín. 8 caracteres)" type="password" value={p1} onChange={(e) => setP1(e.target.value)} autoFocus />
          <Field label="Confirmar nova senha" type="password" value={p2} onChange={(e) => setP2(e.target.value)} />
          {err && <p className="text-ember text-sm flex items-center gap-1.5"><UiIcon name="close" size={15} /> {err}</p>}
          <Button type="submit" disabled={busy} className="w-full">{busy ? 'Salvando…' : 'Salvar e continuar'}</Button>
        </form>
      </div>
    </Shell>
  )
}

// ---------- DASHBOARD ----------
function Overview() {
  const [data, setData] = useState(null)
  useEffect(() => { adminStats().then(setData) }, [])
  if (!data) return <Spinner label="Carregando dados…" />
  const cards = [
    { label: 'Usuários', value: data.userCount, icon: 'user', color: 'text-violet' },
    { label: 'Avaliações', value: data.feedbackTotal, icon: 'message', color: 'text-sky' },
    { label: 'Positivas', value: `${data.positivePct}%`, icon: 'thumbsUp', color: 'text-mint' },
  ]
  const subjectRows = Object.entries(data.bySubject)
    .map(([id, s]) => ({ id, ...s, pct: s.total ? Math.round((s.pos / s.total) * 100) : 0, title: getSubject(id)?.title || id }))
    .sort((a, b) => b.total - a.total)
  return (
    <div>
      <div className="grid grid-cols-3 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl2 bg-surface p-4 text-center border border-line shadow-soft">
            <UiIcon name={c.icon} size={20} className={`mx-auto mb-1 ${c.color}`} />
            <p className="font-display text-2xl font-extrabold text-ink leading-none">{c.value}</p>
            <p className="text-xs text-slatey mt-1">{c.label}</p>
          </div>
        ))}
      </div>
      <h2 className="font-display font-bold text-ink mt-6 mb-3">Novos usuários (14 dias)</h2>
      <NewUsersChart data={data.newUsersByDay || []} />

      <h2 className="font-display font-bold text-ink mt-6 mb-3">Avaliação por matéria</h2>
      {subjectRows.length === 0 ? (
        <p className="text-sm text-slatey">Nenhuma avaliação recebida ainda.</p>
      ) : (
        <div className="rounded-xl2 bg-surface border border-line shadow-soft p-5 flex flex-col gap-4">
          {subjectRows.map((r) => {
            const c = subjectColor(r.id)
            return (
              <div key={r.id}>
                <div className="flex items-center gap-2 mb-1.5">
                  <SubjectGlyph id={r.id} size={18} />
                  <span className="font-display font-semibold text-ink text-sm flex-1">{r.title}</span>
                  <span className="text-sm font-bold" style={{ color: c }}>{r.pct}%</span>
                  <span className="text-xs text-faint">({r.pos}/{r.total})</span>
                </div>
                <div className="h-2.5 rounded-full bg-ink/[0.06] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: c }} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Feedbacks() {
  const [data, setData] = useState(null)
  useEffect(() => { adminStats().then(setData) }, [])
  if (!data) return <Spinner label="Carregando feedbacks…" />
  if (data.recent.length === 0) return <p className="text-sm text-slatey">Nenhum feedback ainda.</p>
  return (
    <div className="flex flex-col gap-3">
      {data.recent.map((f, i) => (
        <div key={f.id || i} className="rounded-xl2 bg-surface border border-line shadow-soft p-4">
          <div className="flex items-center gap-2">
            <span className={`grid h-7 w-7 place-items-center rounded-full text-white ${f.relevant ? 'bg-mint' : 'bg-ember'}`}>
              <UiIcon name={f.relevant ? 'thumbsUp' : 'thumbsDown'} size={14} />
            </span>
            <span className="font-display font-bold text-ink text-sm flex-1">{getSubject(f.subjectId)?.title || f.subjectId} · {f.lessonTitle || f.lessonId}</span>
            <span className="text-xs text-faint">{timeAgo(f.createdAt)}</span>
          </div>
          {f.comment && <p className="text-sm text-ink/85 mt-2">"{f.comment}"</p>}
        </div>
      ))}
    </div>
  )
}

function ContentEditor() {
  const subjects = useMemo(() => listSubjects(null).filter((s) => s.ready), [])
  const [sid, setSid] = useState('')
  const [lid, setLid] = useState('')
  const [json, setJson] = useState('')
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)
  const lessons = sid ? (getSubject(sid)?.lessons || []) : []

  async function load() {
    if (!sid || !lid) return
    setLoading(true); setMsg(null)
    const content = await adminLoadLesson(sid, lid)
    setLoading(false)
    if (content) {
      const clean = { ...content }; delete clean.subjectId; delete clean.lessonId; delete clean.updatedAt; delete clean.createdAt
      setJson(JSON.stringify(clean, null, 2))
      setMsg({ type: 'ok', msg: 'Conteúdo carregado.' })
    } else {
      setJson(JSON.stringify({ theory: ['Parágrafo 1…'], keypoints: ['Ponto-chave'], examples: [{ title: 'Exemplo', body: '...' }], questions: [{ q: 'Pergunta?', options: ['A', 'B', 'C', 'D'], correct: 1, explain: 'Por quê.' }], practice: null }, null, 2))
      setMsg({ type: 'warn', msg: 'Sem conteúdo salvo ainda — editando um modelo novo.' })
    }
  }

  async function save() {
    setMsg(null)
    let parsed
    try { parsed = JSON.parse(json) } catch { return setMsg({ type: 'err', msg: 'JSON inválido. Confira a formatação.' }) }
    if (!Array.isArray(parsed.theory) || !Array.isArray(parsed.questions)) {
      return setMsg({ type: 'err', msg: 'O conteúdo precisa ter "theory" (lista) e "questions" (lista).' })
    }
    try { await adminSaveLesson(sid, lid, parsed); setMsg({ type: 'ok', msg: 'Conteúdo salvo! Já vale para os usuários.' }) }
    catch (e) { setMsg({ type: 'err', msg: e.message }) }
  }

  return (
    <div>
      <p className="text-sm text-slatey mb-4">Melhore ou crie o conteúdo de qualquer lição. O que você salvar aqui passa a ser servido aos usuários (substitui a geração por IA daquela lição).</p>
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm font-semibold text-slatey mb-1 block">Matéria</span>
          <select className="field" value={sid} onChange={(e) => { setSid(e.target.value); setLid('') }}>
            <option value="">Selecione…</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slatey mb-1 block">Lição</span>
          <select className="field" value={lid} onChange={(e) => setLid(e.target.value)} disabled={!sid}>
            <option value="">Selecione…</option>
            {lessons.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
          </select>
        </label>
      </div>
      <Button onClick={load} disabled={!sid || !lid || loading} variant="ghost" className="mt-3">{loading ? 'Carregando…' : 'Carregar conteúdo'}</Button>

      {json && (
        <>
          <textarea value={json} onChange={(e) => setJson(e.target.value)} rows={16}
            className="field font-mono text-xs mt-4 leading-relaxed" spellCheck={false} />
          {msg && <p className={`text-sm mt-2 flex items-center gap-1.5 ${msg.type === 'ok' ? 'text-mint' : msg.type === 'warn' ? 'text-gold' : 'text-ember'}`}>
            <UiIcon name={msg.type === 'ok' ? 'check' : 'close'} size={15} /> {msg.msg}</p>}
          <Button onClick={save} className="mt-3"><UiIcon name="check" size={18} strokeWidth={2.3} /> Salvar conteúdo</Button>
        </>
      )}
      {!json && msg && <p className="text-sm mt-2 text-slatey">{msg.msg}</p>}
    </div>
  )
}

function CatalogEditor() {
  const [cat, setCat] = useState(null)
  const [msg, setMsg] = useState(null)
  // objetivo (trilha)
  const [tId, setTId] = useState(''); const [tTitle, setTTitle] = useState(''); const [tTag, setTTag] = useState('')
  // matéria
  const [sId, setSId] = useState(''); const [sTitle, setSTitle] = useState(''); const [sTrack, setSTrack] = useState('')
  const [sDesc, setSDesc] = useState(''); const [sLessons, setSLessons] = useState('')

  useEffect(() => { loadCustomCatalog().then(setCat) }, [])

  async function addTrack() {
    setMsg(null)
    const id = tId.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-')
    if (!id || tTitle.trim().length < 2) return setMsg({ type: 'err', msg: 'Informe um id e um título para o objetivo.' })
    const next = { ...cat, tracks: [...(cat.tracks || []).filter((t) => t.id !== id), { id, title: tTitle.trim(), tagline: tTag.trim() }] }
    await saveCustomCatalog(next); setCat(next); setTId(''); setTTitle(''); setTTag('')
    setMsg({ type: 'ok', msg: 'Objetivo adicionado ao catálogo.' })
  }

  async function addSubject() {
    setMsg(null)
    const id = sId.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-')
    if (!id || sTitle.trim().length < 2 || !sTrack) return setMsg({ type: 'err', msg: 'Informe id, título e a trilha da matéria.' })
    const lessons = sLessons.split('\n').map((l) => l.trim()).filter(Boolean).map((line, i) => {
      const [lid, ...rest] = line.split('|')
      return { id: (lid || `aula-${i + 1}`).trim(), title: (rest.join('|') || lid).trim(), focus: '' }
    })
    const subjects = { ...(cat.subjects || {}), [id]: { id, title: sTitle.trim(), description: sDesc.trim(), tracks: [sTrack], color: 'violet', lessons } }
    const next = { ...cat, subjects }
    await saveCustomCatalog(next); setCat(next)
    setSId(''); setSTitle(''); setSDesc(''); setSLessons('')
    setMsg({ type: 'ok', msg: `Matéria adicionada com ${lessons.length} lição(ões). Já aparece no app.` })
  }

  if (!cat) return <Spinner label="Carregando catálogo…" />
  const allTracks = [...TRACKS]

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-slatey">Adicione novos objetivos (trilhas) e matérias. Eles entram no catálogo do app na hora — aparecem no onboarding e no início.</p>

      <div className="rounded-xl2 bg-surface border border-line shadow-soft p-5">
        <h3 className="font-display font-bold text-ink mb-3">Novo objetivo (trilha)</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="ID (ex.: oab)" value={tId} onChange={(e) => setTId(e.target.value)} />
          <Field label="Título" value={tTitle} onChange={(e) => setTTitle(e.target.value)} />
          <Field label="Descrição curta" value={tTag} onChange={(e) => setTTag(e.target.value)} />
        </div>
        <Button onClick={addTrack} className="mt-3"><UiIcon name="plus" size={16} /> Adicionar objetivo</Button>
      </div>

      <div className="rounded-xl2 bg-surface border border-line shadow-soft p-5">
        <h3 className="font-display font-bold text-ink mb-3">Nova matéria</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="ID (ex.: direito-civil)" value={sId} onChange={(e) => setSId(e.target.value)} />
          <Field label="Título" value={sTitle} onChange={(e) => setSTitle(e.target.value)} />
        </div>
        <label className="block mt-3">
          <span className="text-sm font-semibold text-slatey mb-1 block">Trilha (objetivo)</span>
          <select className="field" value={sTrack} onChange={(e) => setSTrack(e.target.value)}>
            <option value="">Selecione…</option>
            {allTracks.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
        </label>
        <label className="block mt-3">
          <span className="text-sm font-semibold text-slatey mb-1 block">Descrição</span>
          <input className="field" value={sDesc} onChange={(e) => setSDesc(e.target.value)} />
        </label>
        <label className="block mt-3">
          <span className="text-sm font-semibold text-slatey mb-1 block">Lições (uma por linha — formato: id | Título)</span>
          <textarea className="field font-mono text-xs" rows={5} value={sLessons} onChange={(e) => setSLessons(e.target.value)}
            placeholder={'intro | Introdução\nconceitos | Conceitos básicos'} />
        </label>
        <Button onClick={addSubject} className="mt-3"><UiIcon name="plus" size={16} /> Adicionar matéria</Button>
      </div>

      {msg && <p className={`text-sm flex items-center gap-1.5 ${msg.type === 'ok' ? 'text-mint' : 'text-ember'}`}>
        <UiIcon name={msg.type === 'ok' ? 'check' : 'close'} size={15} /> {msg.msg}</p>}

      {(cat.tracks?.length > 0 || Object.keys(cat.subjects || {}).length > 0) && (
        <div className="rounded-xl2 bg-violet-wash p-4">
          <p className="font-display font-bold text-ink mb-2 text-sm">Itens personalizados</p>
          <div className="flex flex-wrap gap-2">
            {cat.tracks?.map((t) => <span key={t.id} className="chip bg-surface text-violet">Trilha: {t.title}</span>)}
            {Object.values(cat.subjects || {}).map((s) => <span key={s.id} className="chip bg-surface text-ink">{s.title} ({s.lessons?.length || 0})</span>)}
          </div>
        </div>
      )}
    </div>
  )
}

function NewUsersChart({ data }) {
  const max = Math.max(1, ...data.map((d) => d.count))
  const total = data.reduce((a, d) => a + d.count, 0)
  return (
    <div className="rounded-xl2 bg-surface border border-line shadow-soft p-5">
      <p className="text-sm text-slatey mb-3"><strong className="text-ink">{total}</strong> novos nos últimos 14 dias</p>
      <div className="flex items-end justify-between gap-1 h-28">
        {data.map((d, i) => (
          <div key={d.key} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
            <div className="w-full rounded-t-md bg-violet/80" style={{ height: `${Math.max(3, (d.count / max) * 100)}%` }} title={`${d.count} usuário(s)`} />
            {(i % 2 === 0 || i === data.length - 1) && <span className="text-[9px] text-faint">{d.date.getDate()}/{d.date.getMonth() + 1}</span>}
          </div>
        ))}
      </div>
      <p className="text-[11px] text-faint mt-2">Contado a partir da data de criação da conta (vale para novos cadastros).</p>
    </div>
  )
}

function Moderation() {
  const [threads, setThreads] = useState(null)
  const [busy, setBusy] = useState(null)
  useEffect(() => { listThreads({ sort: 'recent' }).then(setThreads) }, [])
  async function remove(id) {
    if (!confirm('Excluir este tópico e todas as respostas? Esta ação não pode ser desfeita.')) return
    setBusy(id)
    await deleteThreadAdmin(id)
    setThreads((list) => list.filter((t) => t.id !== id))
    setBusy(null)
  }
  if (!threads) return <Spinner label="Carregando fórum…" />
  if (threads.length === 0) return <p className="text-sm text-slatey">Nenhum tópico no fórum.</p>
  return (
    <div>
      <p className="text-sm text-slatey mb-4">Modere a comunidade: remova tópicos impróprios. A exclusão apaga também as respostas.</p>
      <div className="flex flex-col gap-3">
        {threads.map((t) => (
          <div key={t.id} className="rounded-xl2 bg-surface border border-line shadow-soft p-4">
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-ink text-sm">{t.title}</p>
                {t.body && <p className="text-sm text-slatey mt-0.5 line-clamp-2">{t.body}</p>}
                <p className="text-xs text-faint mt-1">{t.authorName || 'Anônimo'} · {t.replyCount || 0} resposta(s){t.subjectId ? ` · ${getSubject(t.subjectId)?.title || t.subjectId}` : ''}</p>
              </div>
              <button onClick={() => remove(t.id)} disabled={busy === t.id}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ember hover:bg-ember/10" aria-label="Excluir tópico">
                <UiIcon name="close" size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AdminDashboard({ onLogout }) {
  const [tab, setTab] = useState('overview')
  const tabs = [
    { id: 'overview', label: 'Visão geral', icon: 'grid' },
    { id: 'feedback', label: 'Feedbacks', icon: 'message' },
    { id: 'content', label: 'Conteúdo', icon: 'edit' },
    { id: 'catalog', label: 'Catálogo', icon: 'plus' },
    { id: 'forum', label: 'Fórum', icon: 'forum' },
  ]
  return (
    <Shell onLogout={onLogout}>
      <h1 className="font-display text-2xl font-extrabold text-ink mb-4">Painel administrativo</h1>
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold border transition-colors ${
              tab === t.id ? 'bg-violet text-white border-violet' : 'bg-surface text-slatey border-line hover:border-violet/40'}`}>
            <UiIcon name={t.icon} size={15} /> {t.label}
          </button>
        ))}
      </div>
      {tab === 'overview' && <Overview />}
      {tab === 'feedback' && <Feedbacks />}
      {tab === 'content' && <ContentEditor />}
      {tab === 'catalog' && <CatalogEditor />}
      {tab === 'forum' && <Moderation />}
    </Shell>
  )
}

export default function Admin() {
  const [authed, setAuthed] = useState(isAdminSession())
  const [mustChange, setMustChange] = useState(false)
  if (!authed) return <AdminLogin onIn={(mc) => { setAuthed(true); setMustChange(mc) }} />
  if (mustChange) return <AdminChangePw onDone={() => setMustChange(false)} />
  return <AdminDashboard onLogout={() => { adminLogout(); setAuthed(false) }} />
}
