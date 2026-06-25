// src/components/LessonNotes.jsx
// Botão flutuante de anotações dentro da aula. Fica SEMPRE visível (fixo na tela),
// mesmo rolando o conteúdo — por isso é renderizado via portal no <body>, fora de
// qualquer container com transform (que "prende" elementos position:fixed).
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useProgress } from '../context/ProgressContext'
import Modal from './common/Modal'
import Button from './common/Button'
import UiIcon from './icons/UiIcon'

export const noteKey = (subjectId, lessonId) => `${subjectId}/${lessonId}`

export default function LessonNotes({ subjectId, lessonId, lessonTitle }) {
  const { progress, update } = useProgress()
  const key = noteKey(subjectId, lessonId)
  const existing = progress?.notes?.[key]
  const [open, setOpen] = useState(false)
  const [text, setText] = useState(existing?.text || '')
  const [savedAt, setSavedAt] = useState(null)

  useEffect(() => { setText(progress?.notes?.[key]?.text || '') }, [key]) // eslint-disable-line

  async function save() {
    const trimmed = text.trim()
    await update((p) => {
      const notes = { ...(p.notes || {}) }
      if (!trimmed) delete notes[key]
      else notes[key] = { text: trimmed, subjectId, lessonId, lessonTitle, updatedAt: Date.now() }
      return { ...p, notes }
    })
    setSavedAt(Date.now())
    setTimeout(() => setOpen(false), 500)
  }

  const hasNote = Boolean(existing?.text)

  // Renderizado no body para ficar realmente fixo na viewport.
  return createPortal(
    <>
      <button
        onClick={() => { setSavedAt(null); setOpen(true) }}
        aria-label="Anotações da aula"
        className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-40 grid h-14 w-14 place-items-center rounded-full
          bg-violet text-white shadow-lift tap hover:bg-violet-deep transition-colors"
      >
        <UiIcon name="edit" size={22} />
        {hasNote && <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-gold ring-2 ring-white" />}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Anotações da aula">
        <p className="text-sm text-slatey -mt-1 mb-3">{lessonTitle}</p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          autoFocus
          placeholder="Escreva o que achou importante, dúvidas, macetes…"
          className="field resize-y leading-relaxed"
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-mint font-semibold">
            {savedAt ? <span className="inline-flex items-center gap-1"><UiIcon name="check" size={14} strokeWidth={2.5} /> Salvo!</span> : ''}
          </span>
          <Button onClick={save}><UiIcon name="check" size={18} strokeWidth={2.4} /> Salvar anotação</Button>
        </div>
      </Modal>
    </>,
    document.body
  )
}
