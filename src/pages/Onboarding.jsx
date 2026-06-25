// src/pages/Onboarding.jsx
// Primeiro acesso: escolher a trilha e as matérias.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProgress } from '../context/ProgressContext'
import { TRACKS, listSubjects } from '../data/tracks'
import Button from '../components/common/Button'
import SubjectGlyph from '../components/icons/SubjectGlyph'
import UiIcon from '../components/icons/UiIcon'
import Brand from '../components/Brand'

export default function Onboarding() {
  const { progress, update } = useProgress()
  const navigate = useNavigate()
  const [step, setStep] = useState(progress?.track ? 2 : 1)
  const [track, setTrack] = useState(progress?.track || null)
  const [subjects, setSubjects] = useState(progress?.subjects || [])
  const [busy, setBusy] = useState(false)

  const available = listSubjects(track)

  function toggleSubject(id) {
    setSubjects((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))
  }

  async function finish() {
    setBusy(true)
    await update((p) => ({ ...p, track, subjects }))
    navigate('/app')
  }

  return (
    <div className="min-h-screen bg-cloud">
      <div className="mx-auto max-w-2xl px-4 py-7">
        <div className="flex items-center justify-between mb-6">
          <Brand size={32} />
          <span className="chip bg-violet-wash text-violet">Passo {step} de 2</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-line overflow-hidden mb-8">
          <div className="h-full rounded-full bg-violet transition-all duration-500" style={{ width: step === 1 ? '50%' : '100%' }} />
        </div>

        {step === 1 && (
          <div className="animate-rise">
            <h1 className="font-display text-3xl font-extrabold text-ink text-balance">O que você quer estudar?</h1>
            <p className="text-slatey mt-1.5 mb-6">Escolha seu objetivo. Dá para mudar quando quiser.</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {TRACKS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setTrack(t.id); setSubjects([]); setStep(2) }}
                  className="group text-left rounded-xl2 bg-surface p-5 border-2 border-line hover:border-violet shadow-soft transition-all tap"
                >
                  <div className="flex items-start gap-3.5">
                    <SubjectGlyph id={t.id} tile size={52} />
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-lg text-ink">{t.title}</h3>
                      <p className="text-sm text-slatey mt-0.5">{t.tagline}</p>
                    </div>
                    <UiIcon name="chevronRight" className="text-faint group-hover:text-violet transition-colors mt-1" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-rise">
            <button onClick={() => setStep(1)} className="inline-flex items-center gap-1 text-violet font-semibold text-sm mb-3">
              <UiIcon name="chevronLeft" size={16} /> Trocar objetivo
            </button>
            <h1 className="font-display text-3xl font-extrabold text-ink">Quais matérias?</h1>
            <p className="text-slatey mt-1.5 mb-6">Selecione por onde começar. Você pode adicionar mais depois.</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {available.map((s) => {
                const on = subjects.includes(s.id)
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleSubject(s.id)}
                    className={`relative rounded-xl2 p-4 text-left border-2 transition-all tap ${
                      on ? 'bg-violet-wash border-violet shadow-soft' : 'bg-surface border-line hover:border-violet/40'
                    }`}
                  >
                    {on && (
                      <span className="absolute top-2.5 right-2.5 grid h-5 w-5 place-items-center rounded-full bg-violet text-white">
                        <UiIcon name="check" size={13} strokeWidth={3} />
                      </span>
                    )}
                    <SubjectGlyph id={s.id} tile size={44} />
                    <h3 className="font-display font-bold text-ink mt-2.5 text-sm leading-tight">{s.title}</h3>
                    <p className="text-xs text-slatey mt-0.5">{s.lessons} lições</p>
                  </button>
                )
              })}
            </div>

            <div className="sticky bottom-4 mt-8">
              <Button onClick={finish} disabled={subjects.length === 0 || busy} size="lg" className="w-full shadow-lift">
                {busy ? 'Preparando…' : subjects.length ? `Começar com ${subjects.length} matéria${subjects.length > 1 ? 's' : ''}` : 'Escolha ao menos uma matéria'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
