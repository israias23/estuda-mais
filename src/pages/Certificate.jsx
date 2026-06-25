// src/pages/Certificate.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProgress } from '../context/ProgressContext'
import { getSubject } from '../data/tracks'
import { downloadCertificate, shareCertificate, issueCertificate, certCode } from '../services/certificateService'
import { formatCPF, isValidCPF } from '../services/cpf'
import Button from '../components/common/Button'
import UiIcon from '../components/icons/UiIcon'
import SubjectGlyph from '../components/icons/SubjectGlyph'
import { BrandMark } from '../components/Brand'

const validateHost = () => { try { return window.location.host } catch { return 'estuda+' } }

export default function Certificate() {
  const { subjectId } = useParams()
  const navigate = useNavigate()
  const { progress, update } = useProgress()
  const subject = getSubject(subjectId)

  const [fullName, setFullName] = useState(progress.fullName || progress.name || '')
  const [cpf, setCpf] = useState(progress.cpf || '')
  const [err, setErr] = useState('')

  const done = progress.completed?.[subjectId] || []
  const eligible = subject && done.length >= subject.lessons.length
  const dataComplete = Boolean(progress.fullName && progress.cpf)

  // Data de emissão FIXA (gravada na primeira vez) — garante código estável.
  const stored = progress.certData?.[subjectId]
  const studentName = progress.fullName || progress.name
  const subjectTitle = subject?.title || ''
  const xpTotal = subject ? subject.lessons.reduce((a, l) => a + (l.xp || 50), 0) : 0
  const dateStr = stored?.dateStr || new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  const code = stored?.code || certCode(studentName, subjectTitle, dateStr)

  // Quando os dados estão completos, registra o certificado globalmente (uma vez).
  useEffect(() => {
    if (!subject || !eligible || !dataComplete) return
    if (stored?.code) return
    ;(async () => {
      const c = await issueCertificate({ uid: progress.uid, studentName, cpf: progress.cpf, subjectId, subjectTitle, xp: xpTotal, dateStr })
      await update((p) => ({
        ...p,
        certData: { ...(p.certData || {}), [subjectId]: { dateStr, code: c } },
        certificates: [...new Set([...(p.certificates || []), subjectId])],
      }))
    })()
  }, [dataComplete, eligible, subjectId]) // eslint-disable-line

  if (!subject || !eligible) {
    return (
      <div className="text-center py-16">
        <p className="text-slatey">Conclua toda a trilha de {subject?.title || 'estudo'} para liberar o certificado.</p>
        <Button onClick={() => navigate(`/app/trilha/${subjectId}`)} className="mt-4">Ir para a trilha</Button>
      </div>
    )
  }

  const opts = {
    studentName,
    cpf: progress.cpf,
    subjectTitle,
    xp: xpTotal,
    dateStr,
  }

  async function saveData() {
    setErr('')
    if (fullName.trim().split(' ').length < 2) { setErr('Digite seu nome completo (nome e sobrenome).'); return }
    if (!isValidCPF(cpf)) { setErr('CPF inválido. Confira os números.'); return }
    await update((p) => ({ ...p, fullName: fullName.trim(), cpf: formatCPF(cpf) }))
  }

  // ---- Formulário de dados ----
  if (!dataComplete) {
    return (
      <div className="animate-rise max-w-md mx-auto">
        <button onClick={() => navigate('/app/perfil')} className="inline-flex items-center gap-1 text-violet font-semibold text-sm mb-3">
          <UiIcon name="chevronLeft" size={16} /> Perfil
        </button>
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gold/15 text-[#B5841E] mb-3"><UiIcon name="award" size={28} /></span>
        <h1 className="font-display text-2xl font-extrabold text-ink text-center">Quase lá!</h1>
        <p className="text-slatey text-center mb-6">
          Para emitir seu certificado, precisamos do seu nome completo e CPF — é o que dá validade ao documento.
        </p>
        <div className="flex flex-col gap-3">
          <input className="field" placeholder="Nome completo" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <input className="field" placeholder="CPF (000.000.000-00)" inputMode="numeric" value={cpf}
            onChange={(e) => setCpf(formatCPF(e.target.value))} maxLength={14} />
          {err && <p className="text-ember text-sm flex items-center gap-1.5"><UiIcon name="close" size={15} /> {err}</p>}
          <Button onClick={saveData} className="w-full mt-2">Gerar meu certificado</Button>
        </div>
        <p className="text-xs text-slatey mt-4 text-center">Seus dados ficam salvos só no seu perfil e aparecem apenas no seu certificado.</p>
      </div>
    )
  }

  // ---- Prévia + ações ----
  return (
    <div className="animate-rise">
      <button onClick={() => navigate('/app/perfil')} className="inline-flex items-center gap-1 text-violet font-semibold text-sm mb-3">
        <UiIcon name="chevronLeft" size={16} /> Perfil
      </button>
      <h1 className="font-display text-2xl font-extrabold text-ink mb-4 flex items-center gap-2">
        <UiIcon name="award" size={24} className="text-gold" /> Seu certificado
      </h1>

      <div className="rounded-xl2 bg-gradient-to-br from-violet-wash to-cloud border border-violet/20 p-3 shadow-card">
        <div className="rounded-xl bg-surface border-[3px] border-double border-gold p-6 text-center relative overflow-hidden">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-violet/5" />
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <span className="font-display font-extrabold text-[3.5rem] text-violet/[0.04] tracking-widest">ESTUDA+</span>
          </div>
          <div className="relative">
            <div className="mx-auto mb-3 flex items-center justify-center gap-2">
              <BrandMark size={34} />
              <SubjectGlyph id={subjectId} size={26} />
            </div>
            <p className="font-display font-extrabold text-ink tracking-[0.22em] text-sm">CERTIFICADO</p>
            <p className="text-[10px] text-slatey tracking-[0.3em] mt-0.5">DE CONCLUSÃO</p>
            <p className="text-xs text-slatey mt-4">A plataforma Estuda+ certifica que</p>
            <p className="font-display text-xl font-extrabold text-violet-deep mt-1">{opts.studentName}</p>
            <p className="text-xs text-slatey">CPF: {opts.cpf}</p>
            <div className="mx-auto my-3 h-px w-32 bg-gold/60" />
            <p className="text-sm text-ink leading-relaxed">
              concluiu com êxito a trilha de <strong>{subject.title}</strong>,<br />
              com aproveitamento de {opts.xp.toLocaleString('pt-BR')} XP de estudo.
            </p>
            <div className="flex items-end justify-center gap-10 mt-6">
              <div className="text-center">
                <p className="text-xs text-ink border-t border-ink/40 pt-1 px-2">{dateStr}</p>
                <p className="text-[10px] text-slatey">Conclusão</p>
              </div>
              <div className="text-center">
                <p className="font-serif italic text-base text-ink leading-none -mb-0.5">Israias Alves Marques</p>
                <p className="text-xs text-ink border-t border-ink/40 pt-1 px-2">Fundador · Estuda+</p>
              </div>
            </div>
            <p className="text-[10px] text-slatey mt-4">Código: <span className="font-mono font-semibold text-ink">{code}</span> · valide em {validateHost()}/validar-certificado</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl2 bg-violet-wash p-3 mt-4 flex items-center gap-2.5">
        <UiIcon name="award" size={18} className="text-violet shrink-0" />
        <p className="text-sm text-ink/80">Este certificado pode ser validado publicamente pelo código <strong className="font-mono">{code}</strong>.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <Button onClick={() => downloadCertificate(opts)} className="flex-1"><UiIcon name="download" size={18} /> Baixar PDF</Button>
        <Button variant="ember" onClick={() => shareCertificate(opts)} className="flex-1"><UiIcon name="share" size={18} /> Compartilhar</Button>
      </div>
      <button onClick={() => update((p) => ({ ...p, fullName: '', cpf: '' }))} className="text-xs text-slatey mt-4 w-full text-center underline">
        Corrigir nome ou CPF
      </button>
    </div>
  )
}
