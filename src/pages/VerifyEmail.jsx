// src/pages/VerifyEmail.jsx
// Tela exibida enquanto o e-mail não foi confirmado (modo Firebase).
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from '../components/common/Button'
import UiIcon from '../components/icons/UiIcon'
import { BrandMark } from '../components/Brand'

export default function VerifyEmail() {
  const { user, resendVerification, reloadUser, logout } = useAuth()
  const navigate = useNavigate()
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  // Verifica automaticamente de tempos em tempos (caso confirme em outra aba).
  useEffect(() => {
    const id = setInterval(async () => {
      const u = await reloadUser()
      if (u && u.emailVerified) { clearInterval(id); navigate('/app') }
    }, 5000)
    return () => clearInterval(id)
  }, []) // eslint-disable-line

  async function resend() {
    setBusy(true); setMsg(null)
    try { await resendVerification(); setMsg({ type: 'ok', msg: 'E-mail de confirmação reenviado. Confira sua caixa (e o spam).' }); setCooldown(45) }
    catch (e) { setMsg({ type: 'err', msg: e.message }) } finally { setBusy(false) }
  }

  async function check() {
    setBusy(true); setMsg(null)
    const u = await reloadUser()
    setBusy(false)
    if (u && u.emailVerified) navigate('/app')
    else setMsg({ type: 'err', msg: 'Ainda não confirmamos seu e-mail. Clique no link que enviamos e tente de novo.' })
  }

  async function sair() { await logout(); navigate('/') }

  return (
    <div className="min-h-screen bg-cloud grid place-items-center px-4">
      <div className="max-w-sm w-full text-center">
        <div className="flex justify-center mb-4"><BrandMark size={40} /></div>
        <span className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-violet-wash text-violet"><UiIcon name="message" size={28} /></span>
        <h1 className="font-display text-2xl font-extrabold text-ink">Confirme seu e-mail</h1>
        <p className="text-slatey mt-2">
          Enviamos um link de confirmação para<br /><strong className="text-ink">{user?.email}</strong>.
          Abra o e-mail e clique no link para liberar seu acesso.
        </p>

        {msg && (
          <p className={`text-sm mt-4 flex items-center justify-center gap-1.5 ${msg.type === 'ok' ? 'text-mint' : 'text-ember'}`}>
            <UiIcon name={msg.type === 'ok' ? 'check' : 'close'} size={15} /> {msg.msg}
          </p>
        )}

        <div className="flex flex-col gap-2 mt-6">
          <Button onClick={check} disabled={busy} className="w-full"><UiIcon name="refresh" size={18} /> Já confirmei</Button>
          <Button variant="ghost" onClick={resend} disabled={busy || cooldown > 0} className="w-full">
            {cooldown > 0 ? `Reenviar em ${cooldown}s` : 'Reenviar e-mail'}
          </Button>
          <button onClick={sair} className="text-sm text-slatey mt-1">Usar outra conta</button>
        </div>

        <p className="text-xs text-faint mt-6">Não recebeu? Verifique a pasta de spam ou confirme se o e-mail foi digitado corretamente.</p>
      </div>
    </div>
  )
}
