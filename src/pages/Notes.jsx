// src/pages/Notes.jsx
// Todas as anotações do usuário, organizadas por matéria. Pode editar e apagar.
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProgress } from '../context/ProgressContext'
import { getSubject } from '../data/tracks'
import { timeAgo } from '../services/format'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import EmptyState from '../components/common/EmptyState'
import SubjectGlyph from '../components/icons/SubjectGlyph'
import UiIcon from '../components/icons/UiIcon'

export default function Notes() {
  const { progress, update } = useProgress()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(null) // { key, text, lessonTitle }

  const grouped = useMemo(() => {
    const notes = Object.entries(progress?.notes || {}).map(([key, n]) => ({ key, ...n }))
    notes.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
    const bySubject = {}
    for (const n of notes) {
      ;(bySubject[n.subjectId] = bySubject[n.subjectId] || []).push(n)
    }
    return bySubject
  }, [progress?.notes])

  const subjectIds = Object.keys(grouped)
  const total = Object.values(grouped).reduce((a, arr) => a + arr.length, 0)

  async function saveEdit() {
    const text = editing.text.trim()
    const key = editing.key
    await update((p) => {
      const notes = { ...(p.notes || {}) }
      if (!text) delete notes[key]
      else notes[key] = { ...notes[key], text, updatedAt: Date.now() }
      return { ...p, notes }
    })
    setEditing(null)
  }

  async function remove(key) {
    await update((p) => {
      const notes = { ...(p.notes || {}) }
      delete notes[key]
      return { ...p, notes }
    })
  }

  return (
    <div className="animate-rise">
      <button onClick={() => navigate('/app/perfil')} className="inline-flex items-center gap-1 text-violet font-semibold text-sm mb-3">
        <UiIcon name="chevronLeft" size={16} /> Perfil
      </button>
      <h1 className="font-display text-3xl font-extrabold text-ink flex items-center gap-2">
        <UiIcon name="edit" size={24} className="text-violet" /> Minhas anotações
      </h1>
      <p className="text-slatey mb-6">{total > 0 ? (total === 1 ? '1 anotação salva.' : `${total} anotações salvas.`) : 'Suas anotações das aulas aparecem aqui.'}</p>

      {subjectIds.length === 0 ? (
        <EmptyState icon={<UiIcon name="edit" />} title="Nenhuma anotação ainda"
          action={<Button onClick={() => navigate('/app')}>Ir estudar</Button>}>
          Durante uma aula, toque no botão flutuante de anotações para guardar o que achar importante.
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-6">
          {subjectIds.map((sid) => {
            const subject = getSubject(sid)
            return (
              <div key={sid}>
                <div className="flex items-center gap-2.5 mb-3">
                  <SubjectGlyph id={sid} tile size={38} />
                  <h2 className="font-display font-bold text-ink">{subject?.title || 'Matéria'}</h2>
                  <span className="chip bg-violet-wash text-violet">{grouped[sid].length}</span>
                </div>
                <div className="flex flex-col gap-3">
                  {grouped[sid].map((n) => (
                    <div key={n.key} className="rounded-xl2 bg-surface border border-line shadow-soft p-4">
                      <div className="flex items-start justify-between gap-2">
                        <button onClick={() => navigate(`/app/licao/${n.subjectId}/${n.lessonId}`)} className="font-display font-bold text-ink text-left hover:text-violet transition-colors">
                          {n.lessonTitle}
                        </button>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => setEditing({ key: n.key, text: n.text, lessonTitle: n.lessonTitle })}
                            aria-label="Editar" className="grid h-8 w-8 place-items-center rounded-full text-slatey hover:bg-violet-wash hover:text-violet">
                            <UiIcon name="edit" size={16} />
                          </button>
                          <button onClick={() => remove(n.key)}
                            aria-label="Apagar" className="grid h-8 w-8 place-items-center rounded-full text-slatey hover:bg-ember/10 hover:text-ember">
                            <UiIcon name="close" size={16} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-ink/85 whitespace-pre-wrap mt-1.5 leading-relaxed">{n.text}</p>
                      <p className="text-xs text-faint mt-2">{timeAgo(n.updatedAt)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar anotação">
        {editing && (
          <>
            <p className="text-sm text-slatey -mt-1 mb-3">{editing.lessonTitle}</p>
            <textarea value={editing.text} onChange={(e) => setEditing({ ...editing, text: e.target.value })}
              rows={8} className="field resize-y leading-relaxed" autoFocus />
            <div className="flex justify-end mt-3">
              <Button onClick={saveEdit}><UiIcon name="check" size={18} strokeWidth={2.4} /> Salvar</Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
