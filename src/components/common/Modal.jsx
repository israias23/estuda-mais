// src/components/common/Modal.jsx
import { useEffect } from 'react'
import UiIcon from '../icons/UiIcon'

export default function Modal({ open, onClose, children, title }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    if (open) {
      document.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    }
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open, onClose])

  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/45 backdrop-blur-sm animate-fade p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-surface rounded-t-3xl sm:rounded-3xl shadow-lift p-6 animate-sheet relative"
        onClick={(e) => e.stopPropagation()}
        role="dialog" aria-modal="true"
      >
        <div className="sm:hidden mx-auto mb-4 h-1.5 w-12 rounded-full bg-line" />
        {title && (
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-lg font-extrabold text-ink">{title}</h3>
            <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full text-slatey hover:bg-line">
              <UiIcon name="close" size={18} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
