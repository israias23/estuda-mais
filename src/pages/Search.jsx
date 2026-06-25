// src/pages/Search.jsx
// Busca global: matérias, lições e suas anotações.
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProgress } from '../context/ProgressContext'
import { listSubjects, getSubject } from '../data/tracks'
import SubjectGlyph from '../components/icons/SubjectGlyph'
import UiIcon from '../components/icons/UiIcon'

function norm(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') }

export default function Search() {
  const navigate = useNavigate()
  const { progress } = useProgress()
  const [q, setQ] = useState('')

  // Índice plano de tudo que é buscável.
  const index = useMemo(() => {
    const items = []
    for (const s of listSubjects(null)) {
      items.push({ type: 'subject', id: s.id, title: s.title, sub: 'Matéria', to: `/app/trilha/${s.id}`, subjectId: s.id })
      const subject = getSubject(s.id)
      for (const l of subject?.lessons || []) {
        items.push({ type: 'lesson', id: `${s.id}/${l.id}`, title: l.title, sub: `Lição · ${s.title}`, to: `/app/licao/${s.id}/${l.id}`, subjectId: s.id })
      }
    }
    for (const [key, n] of Object.entries(progress?.notes || {})) {
      items.push({ type: 'note', id: key, title: n.text.slice(0, 80), sub: `Anotação · ${getSubject(n.subjectId)?.title || ''}`, to: `/app/licao/${n.subjectId}/${n.lessonId}`, subjectId: n.subjectId })
    }
    return items
  }, [progress?.notes])

  const results = useMemo(() => {
    const term = norm(q.trim())
    if (term.length < 2) return []
    return index.filter((it) => norm(it.title).includes(term) || norm(it.sub).includes(term)).slice(0, 40)
  }, [q, index])

  return (
    <div className="animate-rise">
      <h1 className="font-display text-3xl font-extrabold text-ink flex items-center gap-2 mb-4">
        <UiIcon name="search" size={24} className="text-violet" /> Buscar
      </h1>
      <div className="relative">
        <UiIcon name="search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-faint" />
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Matéria, lição ou anotação…"
          className="field pl-11" />
      </div>

      <div className="mt-5 flex flex-col gap-2">
        {q.trim().length >= 2 && results.length === 0 && (
          <p className="text-slatey text-sm text-center py-8">Nada encontrado para "{q}".</p>
        )}
        {results.map((r) => (
          <button key={r.type + r.id} onClick={() => navigate(r.to)}
            className="flex items-center gap-3 rounded-xl2 bg-surface border border-line shadow-soft p-3.5 text-left tap hover:border-violet/40">
            <SubjectGlyph id={r.subjectId} tile size={38} />
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold text-ink truncate">{r.title}</p>
              <p className="text-xs text-slatey">{r.sub}</p>
            </div>
            <UiIcon name="chevronRight" size={18} className="text-faint" />
          </button>
        ))}
        {q.trim().length < 2 && (
          <p className="text-faint text-sm text-center py-8">Digite ao menos 2 letras para buscar.</p>
        )}
      </div>
    </div>
  )
}
