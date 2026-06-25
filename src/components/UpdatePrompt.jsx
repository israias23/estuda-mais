// src/components/UpdatePrompt.jsx
// Avisa quando há uma nova versão. O usuário escolhe atualizar agora ou depois.
// Se adiar, volta a perguntar no próximo acesso (a versão fica "esperando").
import { useEffect, useState } from 'react'
import { onUpdate, applyUpdate } from '../services/swUpdate'
import Button from './common/Button'
import UiIcon from './icons/UiIcon'
import { BrandMark } from './Brand'

export default function UpdatePrompt() {
  const [ready, setReady] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [applying, setApplying] = useState(false)

  useEffect(() => onUpdate(setReady), [])

  if (applying) {
    return (
      <div className="fixed inset-0 z-[100] grid place-items-center bg-night/95 backdrop-blur-sm text-white animate-fade">
        <div className="text-center">
          <div className="mx-auto mb-5 h-16 w-16 animate-spin rounded-full border-4 border-white/15 border-t-violet-soft" />
          <BrandMark size={36} />
          <p className="font-display font-bold text-lg mt-3">Aplicando atualização…</p>
          <p className="text-white/60 text-sm">Só um instante, já voltamos.</p>
        </div>
      </div>
    )
  }

  if (!ready || dismissed) return null

  function update() {
    setApplying(true)
    // pequena folga para a animação aparecer antes de recarregar
    setTimeout(applyUpdate, 400)
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[90] p-4 animate-sheet" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
      <div className="max-w-md mx-auto rounded-xl2 bg-surface border border-line shadow-lift p-4 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-wash text-violet shrink-0"><UiIcon name="refresh" size={22} /></span>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-ink">Nova versão disponível</p>
          <p className="text-sm text-slatey">Atualize para ter as últimas melhorias.</p>
        </div>
        <div className="flex flex-col gap-1.5 shrink-0">
          <Button onClick={update} size="sm">Atualizar agora</Button>
          <button onClick={() => setDismissed(true)} className="text-xs text-slatey font-semibold">Agora não</button>
        </div>
      </div>
    </div>
  )
}
