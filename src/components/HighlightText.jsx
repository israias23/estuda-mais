// src/components/HighlightText.jsx
// Marcador de texto: o usuário seleciona um trecho, escolhe a cor e ele fica destacado.
// As marcações ficam salvas (por lição) e reaparecem ao voltar. Clicar remove.
import { useRef, useState } from 'react'

export const HL_COLORS = [
  { id: 'yellow', bg: '#FDE68A' },
  { id: 'green', bg: '#A7F3D0' },
  { id: 'pink', bg: '#FBCFE8' },
  { id: 'blue', bg: '#BFDBFE' },
]
const bgOf = (id) => (HL_COLORS.find((c) => c.id === id) || HL_COLORS[0]).bg

function splitKeep(text, sub) {
  const out = []; let i = 0; let idx
  while (sub && (idx = text.indexOf(sub, i)) !== -1) {
    if (idx > i) out.push(text.slice(i, idx))
    out.push(sub)
    i = idx + sub.length
  }
  if (i < text.length) out.push(text.slice(i))
  return out.length ? out : [text]
}

function renderParagraph(text, highlights, onRemove) {
  let segments = [{ text, mark: null }]
  for (const h of highlights) {
    const next = []
    for (const seg of segments) {
      if (seg.mark || !seg.text.includes(h.text)) { next.push(seg); continue }
      for (const part of splitKeep(seg.text, h.text)) {
        next.push({ text: part, mark: part === h.text ? h.color : null })
      }
    }
    segments = next
  }
  return segments.map((s, i) => s.mark
    ? <mark key={i} onClick={(e) => { e.stopPropagation(); onRemove(s.text) }}
        style={{ background: bgOf(s.mark), borderRadius: '3px', padding: '0 2px', cursor: 'pointer', color: 'inherit' }}
        title="Remover marcação">{s.text}</mark>
    : <span key={i}>{s.text}</span>)
}

export default function HighlightText({ paragraphs = [], highlights = [], onAdd, onRemove, className = '' }) {
  const ref = useRef(null)
  const [pop, setPop] = useState(null) // { x, y, text }

  function onSelect() {
    const sel = window.getSelection()
    const text = sel ? sel.toString().trim() : ''
    if (!text || text.length < 3) { setPop(null); return }
    if (!ref.current || !sel.anchorNode || !ref.current.contains(sel.anchorNode)) { setPop(null); return }
    try {
      const rect = sel.getRangeAt(0).getBoundingClientRect()
      setPop({ x: rect.left + rect.width / 2, y: rect.top, text })
    } catch { setPop(null) }
  }

  function pick(color) {
    if (pop?.text) onAdd({ text: pop.text, color })
    setPop(null)
    window.getSelection()?.removeAllRanges()
  }

  return (
    <div ref={ref} className={className} onMouseUp={onSelect} onTouchEnd={onSelect}>
      {paragraphs.map((para, i) => <p key={i}>{renderParagraph(para, highlights, onRemove)}</p>)}

      {pop && (
        <div className="fixed z-50 -translate-x-1/2 -translate-y-full" style={{ left: pop.x, top: pop.y - 8 }}>
          <div className="flex items-center gap-1.5 rounded-full bg-night shadow-lift px-2.5 py-2">
            {HL_COLORS.map((c) => (
              <button key={c.id} onClick={() => pick(c.id)} aria-label={`Marcar ${c.id}`}
                className="h-6 w-6 rounded-full border-2 border-white/30 active:scale-90 transition-transform"
                style={{ background: c.bg }} />
            ))}
          </div>
          <div className="mx-auto h-2 w-2 rotate-45 bg-night -mt-1" />
        </div>
      )}
    </div>
  )
}
