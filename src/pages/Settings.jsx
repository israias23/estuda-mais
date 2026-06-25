// src/pages/Settings.jsx
// Configurações da conta e dos estudos.
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProgress } from '../context/ProgressContext'
import { isValidEmail } from '../services/authService'
import { notifSupported, notifPermission, enableNotifications } from '../services/notifications'
import { pushSupported, subscribeToPush, unsubscribeFromPush, isPushSubscribed, sendTestPush } from '../services/webpush'
import { getTheme, setTheme } from '../services/theme'
import Button from '../components/common/Button'
import UiIcon from '../components/icons/UiIcon'

function Section({ icon, title, children }) {
  return (
    <div className="rounded-xl2 bg-surface border border-line shadow-soft p-5">
      <h2 className="font-display font-bold text-ink flex items-center gap-2 mb-3">
        <UiIcon name={icon} size={18} className="text-violet" /> {title}
      </h2>
      {children}
    </div>
  )
}

function Feedback({ state }) {
  if (!state) return null
  const ok = state.type === 'ok'
  return (
    <p className={`text-sm mt-2 flex items-center gap-1.5 ${ok ? 'text-mint' : 'text-ember'}`}>
      <UiIcon name={ok ? 'check' : 'close'} size={15} strokeWidth={2.2} /> {state.msg}
    </p>
  )
}

export default function Settings() {
  const navigate = useNavigate()
  const { user, updateAccount, changePassword, authMethod } = useAuth()
  const { progress, update } = useProgress()
  const passwordless = authMethod() === 'passwordless'

  // Conta
  const [name, setName] = useState(progress?.name || user?.displayName || '')
  const [email, setEmail] = useState(user?.email || '')
  const [accMsg, setAccMsg] = useState(null)
  const [accBusy, setAccBusy] = useState(false)

  // Senha
  const [cur, setCur] = useState('')
  const [nw, setNw] = useState('')
  const [pwdMsg, setPwdMsg] = useState(null)
  const [pwdBusy, setPwdBusy] = useState(false)

  // Estudos
  const [goal, setGoal] = useState(progress?.weeklyGoalXp || 350)
  const [examDate, setExamDate] = useState(progress?.examDate || '')
  const [examLabel, setExamLabel] = useState(progress?.examLabel || '')
  const [studyMsg, setStudyMsg] = useState(null)
  const [notif, setNotif] = useState(notifPermission())
  const [pushOn, setPushOn] = useState(false)
  const [pushBusy, setPushBusy] = useState(false)
  const [pushMsg, setPushMsg] = useState(null)
  const [theme, setThemeState] = useState(getTheme())

  function chooseTheme(t) { setThemeState(t); setTheme(t) }

  useEffect(() => { isPushSubscribed().then(setPushOn) }, [])

  async function askNotif() {
    setPushBusy(true); setPushMsg(null)
    try {
      if (pushSupported()) {
        const r = await subscribeToPush(user?.uid)
        if (r.ok) {
          setPushOn(true); setNotif('granted')
          setPushMsg({ type: 'ok', msg: 'Lembretes ativados! Você receberá avisos mesmo com o app fechado.' })
          setPushBusy(false)
          return
        }
        if (r.reason === 'denied') { setNotif('denied'); setPushBusy(false); return }
        // servidor de push não configurado → cai para lembrete local
      }
      const r = await enableNotifications()
      setNotif(r === 'granted' ? 'granted' : notifPermission())
      if (r === 'granted') setPushMsg({ type: 'ok', msg: 'Lembretes locais ativados (aparecem ao abrir o app).' })
    } catch (e) {
      setPushMsg({ type: 'err', msg: 'Não foi possível ativar agora. Tente novamente.' })
    }
    setPushBusy(false)
  }

  async function turnOffPush() {
    setPushBusy(true)
    try { await unsubscribeFromPush(); setPushOn(false); setPushMsg({ type: 'ok', msg: 'Lembretes desativados.' }) } catch { /* */ }
    setPushBusy(false)
  }

  async function testPush() {
    setPushMsg(null)
    try { await sendTestPush(user?.uid); setPushMsg({ type: 'ok', msg: 'Enviamos uma notificação de teste.' }) }
    catch { setPushMsg({ type: 'err', msg: 'Não foi possível enviar o teste (servidor de push ativo?).' }) }
  }

  async function saveAccount() {
    setAccMsg(null)
    if (name.trim().length < 2) return setAccMsg({ type: 'err', msg: 'Digite seu nome.' })
    if (!isValidEmail(email)) return setAccMsg({ type: 'err', msg: 'E-mail inválido.' })
    setAccBusy(true)
    try {
      await updateAccount({ name, email })
      await update((p) => ({ ...p, name: name.trim(), fullName: p.fullName || name.trim() }))
      setAccMsg({ type: 'ok', msg: 'Dados atualizados!' })
    } catch (e) {
      setAccMsg({ type: 'err', msg: traduz(e) })
    }
    setAccBusy(false)
  }

  async function savePassword() {
    setPwdMsg(null)
    setPwdBusy(true)
    try {
      await changePassword(cur, nw)
      setCur(''); setNw('')
      setPwdMsg({ type: 'ok', msg: 'Senha alterada com sucesso!' })
    } catch (e) {
      setPwdMsg({ type: 'err', msg: traduz(e) })
    }
    setPwdBusy(false)
  }

  async function saveStudies() {
    await update((p) => ({
      ...p,
      weeklyGoalXp: Math.max(50, Number(goal) || 350),
      examDate: examDate || null,
      examLabel: examLabel.trim(),
    }))
    setStudyMsg({ type: 'ok', msg: 'Preferências salvas!' })
    setTimeout(() => setStudyMsg(null), 2500)
  }

  return (
    <div className="animate-rise">
      <button onClick={() => navigate('/app/perfil')} className="inline-flex items-center gap-1 text-violet font-semibold text-sm mb-3">
        <UiIcon name="chevronLeft" size={16} /> Perfil
      </button>
      <h1 className="font-display text-3xl font-extrabold text-ink flex items-center gap-2 mb-6">
        <UiIcon name="settings" size={24} className="text-violet" /> Configurações
      </h1>

      <div className="flex flex-col gap-4">
        {/* Conta */}
        <Section icon="user" title="Conta">
          <label className="text-sm font-semibold text-slatey">Nome</label>
          <input className="field mt-1 mb-3" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
          <label className="text-sm font-semibold text-slatey">E-mail</label>
          <input className="field mt-1" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" />
          <Feedback state={accMsg} />
          <Button onClick={saveAccount} disabled={accBusy} className="mt-3">{accBusy ? 'Salvando…' : 'Salvar alterações'}</Button>
        </Section>

        {/* Senha */}
        <Section icon="lock" title="Senha">
          {passwordless ? (
            <p className="text-sm text-slatey">
              Você entrou apenas com e-mail (sem senha), então não há senha para alterar. Para usar senha, crie uma conta com e-mail e senha.
            </p>
          ) : (
            <>
              <label className="text-sm font-semibold text-slatey">Senha atual</label>
              <input className="field mt-1 mb-3" type="password" value={cur} onChange={(e) => setCur(e.target.value)} placeholder="••••••" />
              <label className="text-sm font-semibold text-slatey">Nova senha</label>
              <input className="field mt-1" type="password" value={nw} onChange={(e) => setNw(e.target.value)} placeholder="Mínimo de 6 caracteres" />
              <Feedback state={pwdMsg} />
              <Button onClick={savePassword} disabled={pwdBusy || !cur || nw.length < 6} className="mt-3">{pwdBusy ? 'Alterando…' : 'Alterar senha'}</Button>
            </>
          )}
        </Section>

        {/* Estudos */}
        <Section icon="target" title="Estudos">
          <label className="text-sm font-semibold text-slatey">Meta semanal de XP</label>
          <div className="flex items-center gap-3 mt-1 mb-4">
            <input type="range" min={50} max={1000} step={50} value={goal} onChange={(e) => setGoal(e.target.value)} className="flex-1 accent-violet" />
            <span className="font-display font-bold text-violet w-20 text-right tabular-nums">{goal} XP</span>
          </div>
          <label className="text-sm font-semibold text-slatey">Data da prova (contagem regressiva)</label>
          <input className="field mt-1 mb-3" type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
          <label className="text-sm font-semibold text-slatey">Nome da prova</label>
          <input className="field mt-1" value={examLabel} onChange={(e) => setExamLabel(e.target.value)} placeholder="Ex.: ENEM 2026, Concurso TRT…" maxLength={40} />
          <Feedback state={studyMsg} />
          <Button onClick={saveStudies} className="mt-3">Salvar preferências</Button>

          <div className="border-t border-line mt-5 pt-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-display font-semibold text-ink flex items-center gap-1.5"><UiIcon name="flame" size={16} className="text-ember" /> Lembretes da ofensiva</p>
                <p className="text-sm text-slatey">Avisos para você não perder a sequência.</p>
              </div>
              {!notifSupported() && !pushSupported() ? (
                <span className="text-xs text-slatey">Indisponível</span>
              ) : pushOn ? (
                <span className="chip bg-mint/12 text-mint"><UiIcon name="check" size={13} strokeWidth={2.5} /> Ativados</span>
              ) : notif === 'granted' ? (
                <span className="chip bg-mint/12 text-mint"><UiIcon name="check" size={13} strokeWidth={2.5} /> Ativados</span>
              ) : notif === 'denied' ? (
                <span className="text-xs text-slatey">Bloqueado no navegador</span>
              ) : (
                <Button size="sm" onClick={askNotif} disabled={pushBusy}>{pushBusy ? 'Ativando…' : 'Ativar'}</Button>
              )}
            </div>
            {pushMsg && <Feedback state={pushMsg} />}
            {pushOn && (
              <div className="flex items-center gap-3 mt-2">
                <button onClick={testPush} className="text-xs font-semibold text-violet">Enviar teste</button>
                <span className="text-faint">·</span>
                <button onClick={turnOffPush} disabled={pushBusy} className="text-xs font-semibold text-slatey">Desativar</button>
              </div>
            )}
            <p className="text-[11px] text-faint mt-2">Lembretes com o app fechado usam Web Push (precisa do servidor configurado). Sem ele, avisamos ao abrir o app.</p>
          </div>
        </Section>

        {/* Aparência */}
        <Section icon="sparkles" title="Aparência">
          <p className="text-sm text-slatey mb-3">Escolha o tema do app.</p>
          <div className="grid grid-cols-3 gap-2">
            {[{ id: 'light', label: 'Claro', icon: 'sun' }, { id: 'dark', label: 'Escuro', icon: 'moon' }, { id: 'system', label: 'Sistema', icon: 'settings' }].map((t) => (
              <button key={t.id} onClick={() => chooseTheme(t.id)}
                className={`py-3 rounded-xl2 font-display font-bold border-2 transition-colors flex flex-col items-center gap-1 ${
                  theme === t.id ? 'border-violet bg-violet-wash text-violet' : 'border-line text-slatey hover:border-violet/40'}`}>
                <UiIcon name={t.icon} size={18} /> <span className="text-sm">{t.label}</span>
              </button>
            ))}
          </div>
        </Section>
      </div>
    </div>
  )
}

function traduz(e) {
  const m = (e?.code || e?.message || '').toString()
  if (m.includes('wrong-password') || m.includes('invalid-credential')) return 'Senha atual incorreta.'
  if (m.includes('requires-recent-login')) return 'Por segurança, saia e entre novamente antes de alterar.'
  if (m.includes('email-already-in-use')) return 'Este e-mail já está em uso.'
  if (m.includes('invalid-email')) return 'E-mail inválido.'
  return e?.message || 'Não foi possível concluir. Tente novamente.'
}
