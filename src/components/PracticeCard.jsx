// src/components/PracticeCard.jsx
import { useState } from 'react'
import Button from './common/Button'
import Badge from './common/Badge'
import UiIcon from './icons/UiIcon'
import { evaluatePractice } from '../services/aiService'

export default function PracticeCard({ practice, subject, topic, track, onDone }) {
  const [answer, setAnswer] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null) // { correct, feedback }
  const isCode = practice.type === 'code'

  async function check() {
    if (!answer.trim()) return
    setBusy(true); setResult(null)
    const r = await evaluatePractice({
      subject, topic, task: practice.prompt, userAnswer: answer, language: practice.language || '', track,
    })
    setResult(r); setBusy(false)
  }

  return (
    <div className="animate-rise">
      <Badge tone="mint" className="mb-2"><UiIcon name="edit" size={13} /> Atividade prática</Badge>
      <h2 className="font-display text-xl font-bold text-ink mb-2">Hora de praticar</h2>
      <p className="prose-study mb-2"><span className="text-ink/90">{practice.prompt}</span></p>
      {practice.hint && (
        <p className="text-sm text-slatey mb-4 flex items-start gap-1.5">
          <UiIcon name="sparkles" size={15} className="text-gold mt-0.5 shrink-0" /> {practice.hint}
        </p>
      )}

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={isCode ? 8 : 5}
        placeholder={isCode ? `Escreva seu código em ${practice.language || 'código'} aqui…` : 'Escreva sua resposta aqui…'}
        className={`w-full rounded-xl2 border-2 border-line p-4 focus:border-violet resize-y transition-colors
          ${isCode ? 'font-mono text-sm bg-night text-cloud placeholder:text-white/40' : 'bg-surface'}`}
      />

      {result && (
        <div className={`mt-4 rounded-xl2 p-4 animate-rise border ${result.correct ? 'bg-mint/10 border-mint/30' : 'bg-ember/10 border-ember/30'}`}>
          <p className="font-display font-bold mb-1 text-ink flex items-center gap-1.5">
            <UiIcon name={result.correct ? 'check' : 'refresh'} size={18} strokeWidth={2.2} className={result.correct ? 'text-mint' : 'text-ember'} />
            {result.correct ? 'Mandou bem!' : 'Quase lá'}
          </p>
          <p className="text-sm text-slatey">{result.feedback}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        {!result?.correct && (
          <Button onClick={check} disabled={busy || !answer.trim()} className="flex-1">
            {busy ? 'Avaliando…' : 'Verificar resposta'}
          </Button>
        )}
        <Button variant={result?.correct ? 'primary' : 'ghost'} onClick={() => onDone(Boolean(result?.correct))} className="flex-1">
          {result?.correct ? 'Concluir lição' : 'Pular e concluir'}
        </Button>
      </div>
    </div>
  )
}
