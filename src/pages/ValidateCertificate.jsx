// src/pages/ValidateCertificate.jsx
// Página pública de validação de certificado (/validar-certificado).
// Qualquer pessoa digita o código e confere a autenticidade.
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { validateCertificate } from '../services/certificateService'
import Button from '../components/common/Button'
import UiIcon from '../components/icons/UiIcon'
import { BrandMark } from '../components/Brand'
import SubjectGlyph from '../components/icons/SubjectGlyph'

export default function ValidateCertificate() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [code, setCode] = useState(params.get('code') || '')
  const [state, setState] = useState('idle') // idle | loading | found | notfound
  const [record, setRecord] = useState(null)

  async function check(c) {
    const value = (c ?? code).trim()
    if (!value) return
    setState('loading')
    const r = await validateCertificate(value)
    if (r) { setRecord(r); setState('found') } else { setRecord(null); setState('notfound') }
  }

  useEffect(() => { if (params.get('code')) check(params.get('code')) }, []) // eslint-disable-line

  return (
    <div className="min-h-screen bg-cloud">
      <header className="bg-night text-white">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <BrandMark size={28} />
            <span className="font-display font-extrabold">Estuda<span className="text-violet-soft">+</span></span>
          </button>
          <span className="text-sm text-white/70">Validação de certificado</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <span className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-violet-wash text-violet"><UiIcon name="award" size={28} /></span>
          <h1 className="font-display text-2xl font-extrabold text-ink">Validar certificado</h1>
          <p className="text-slatey text-sm">Digite o código que aparece no certificado para conferir sua autenticidade.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input className="field font-mono uppercase tracking-wider text-center" placeholder="0000-0000" value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === 'Enter' && check()} maxLength={9} />
          <Button onClick={() => check()} disabled={state === 'loading' || !code.trim()}>
            {state === 'loading' ? 'Verificando…' : 'Validar'}
          </Button>
        </div>

        {state === 'notfound' && (
          <div className="max-w-md mx-auto mt-6 rounded-xl2 bg-ember/10 border border-ember/30 p-5 text-center">
            <span className="mx-auto mb-2 grid h-11 w-11 place-items-center rounded-2xl bg-ember/15 text-ember"><UiIcon name="close" size={24} /></span>
            <p className="font-display font-bold text-ink">Certificado não encontrado</p>
            <p className="text-sm text-slatey">Confira o código e tente novamente. Certificados são registrados quando emitidos pelo aluno.</p>
          </div>
        )}

        {state === 'found' && record && (
          <div className="max-w-lg mx-auto mt-6 animate-rise">
            <div className="rounded-xl2 bg-mint/10 border border-mint/30 p-3 mb-4 flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-mint text-white"><UiIcon name="check" size={18} strokeWidth={3} /></span>
              <div>
                <p className="font-display font-bold text-ink">Certificado válido</p>
                <p className="text-sm text-slatey">Emitido pela plataforma Estuda+.</p>
              </div>
            </div>

            <div className="rounded-xl2 bg-gradient-to-br from-violet-wash to-cloud border border-violet/20 p-3 shadow-card">
              <div className="rounded-xl bg-surface border-[3px] border-double border-gold p-6 text-center">
                <div className="mx-auto mb-3 flex items-center justify-center gap-2">
                  <BrandMark size={30} />
                  <SubjectGlyph id={record.subjectId} size={24} />
                </div>
                <p className="font-display font-extrabold text-ink tracking-[0.2em] text-sm">CERTIFICADO DE CONCLUSÃO</p>
                <p className="text-xs text-slatey mt-3">A plataforma Estuda+ certifica que</p>
                <p className="font-display text-lg font-extrabold text-violet-deep mt-1">{record.studentName}</p>
                {record.cpf && <p className="text-xs text-slatey">CPF: {record.cpf}</p>}
                <div className="mx-auto my-3 h-px w-28 bg-gold/60" />
                <p className="text-sm text-ink">concluiu a trilha de <strong>{record.subjectTitle}</strong></p>
                <p className="text-xs text-slatey mt-1">{record.dateStr} · {Number(record.xp || 0).toLocaleString('pt-BR')} XP</p>
                <p className="text-[10px] text-slatey mt-3">Código: <span className="font-mono font-semibold text-ink">{record.code}</span></p>
              </div>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-faint mt-8">Estuda+ · verificação pública de certificados</p>
      </main>
    </div>
  )
}
