// src/pages/Login.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { firebaseEnabled } from '../firebase/config'
import Button from '../components/common/Button'
import UiIcon from '../components/icons/UiIcon'
import Brand, { BrandMark } from '../components/Brand'
import { checkEmail, passwordStrength } from '../services/validators'

const features = [
  { icon: 'target', title: 'Missões diárias', desc: 'Lições curtas que cabem na sua rotina.' },
  { icon: 'flame', title: 'Ofensiva ativa', desc: 'Mantenha a sequência e não perca o ritmo.' },
  { icon: 'award', title: 'Certificados', desc: 'Conclua trilhas e emita o seu diploma.' },
]

export default function Login() {
  const { login, register, resetPassword, loginWithEmail } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [suggestion, setSuggestion] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError(''); setInfo(''); setSuggestion('')
    if (mode === 'register') {
      const ec = checkEmail(email)
      if (!ec.ok) { setError(ec.reason); setSuggestion(ec.suggestion || ''); return }
      if (!passwordStrength(password).ok) {
        setError('Senha fraca: use 8+ caracteres, com letras e números.'); return
      }
    }
    setBusy(true)
    try {
      if (mode === 'login') await login(email, password)
      else await register(name, email, password)
      navigate('/app')
    } catch (err) {
      setError(traduzErro(err))
    } finally {
      setBusy(false)
    }
  }

  async function forgot() {
    setError(''); setInfo('')
    if (!email) { setError('Digite seu e-mail no campo acima para recuperar a senha.'); return }
    try {
      await resetPassword(email)
      setInfo('Enviamos um link para redefinir sua senha. Confira seu e-mail.')
    } catch (err) { setError(traduzErro(err)) }
  }

  async function emailOnly() {
    setError(''); setInfo(''); setBusy(true)
    try {
      const r = await loginWithEmail(email)
      if (r?.sent) setInfo('Enviamos um link de acesso para seu e-mail. Abra-o para entrar sem senha.')
      else navigate('/app')
    } catch (err) { setError(traduzErro(err)) } finally { setBusy(false) }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_1fr]">
      {/* Painel da marca */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-night text-white p-12">
        <div className="absolute inset-0 bg-mesh opacity-90" />
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-violet/30 blur-3xl" />
        <div className="relative">
          <Brand size={40} textClass="text-white" />
        </div>
        <div className="relative max-w-md">
          <p className="chip bg-white/10 text-white/80 mb-5">Plataforma de estudos</p>
          <h1 className="font-display text-[2.6rem] leading-[1.05] font-extrabold text-balance">
            Sua trilha rumo ao ENEM, concursos e tecnologia.
          </h1>
          <p className="mt-4 text-white/70 text-lg">
            Aprenda em pequenas missões, acompanhe seu progresso e conquiste certificados.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            {features.map((f) => (
              <div key={f.title} className="flex items-center gap-3 rounded-xl2 bg-white/[0.06] p-3.5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet text-white">
                  <UiIcon name={f.icon} size={20} />
                </span>
                <div>
                  <p className="font-display font-bold">{f.title}</p>
                  <p className="text-sm text-white/60">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative flex items-center gap-6 text-white/60 text-sm">
          <span><strong className="text-white font-display">40+</strong> matérias</span>
          <span className="h-4 w-px bg-white/15" />
          <span><strong className="text-white font-display">5</strong> trilhas</span>
          <span className="h-4 w-px bg-white/15" />
          <span>Conteúdo com IA</span>
        </div>
      </div>

      {/* Formulário */}
      <div className="flex flex-col justify-center p-6 sm:p-10 bg-cloud">
        <div className="mx-auto w-full max-w-sm">
          <div className="lg:hidden flex justify-center mb-8"><Brand size={40} /></div>

          {/* alternância login / cadastro */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl2 bg-line/70 mb-6">
            {['login', 'register'].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className={`py-2.5 rounded-xl font-display font-semibold text-sm transition-colors ${
                  mode === m ? 'bg-surface text-ink shadow-soft' : 'text-slatey'
                }`}
              >
                {m === 'login' ? 'Entrar' : 'Criar conta'}
              </button>
            ))}
          </div>

          <h2 className="font-display text-2xl font-extrabold text-ink">
            {mode === 'login' ? 'Bem-vindo de volta' : 'Vamos começar'}
          </h2>
          <p className="text-slatey mt-1 mb-6">
            {mode === 'login' ? 'Continue de onde parou.' : 'Crie sua conta e abra sua primeira trilha.'}
          </p>

          <form onSubmit={submit} className="flex flex-col gap-3">
            {mode === 'register' && (
              <label className="block">
                <span className="text-sm font-medium text-slatey mb-1 block">Seu nome</span>
                <input className="field" placeholder="Como devemos te chamar?" value={name}
                  onChange={(e) => setName(e.target.value)} required />
              </label>
            )}
            <label className="block">
              <span className="text-sm font-medium text-slatey mb-1 block">E-mail</span>
              <input type="email" className="field" placeholder="voce@email.com" value={email}
                onChange={(e) => { setEmail(e.target.value); setSuggestion('') }} required />
              {suggestion && (
                <button type="button" onClick={() => { setEmail(suggestion); setSuggestion(''); setError('') }}
                  className="text-xs text-violet font-semibold mt-1">Usar {suggestion}</button>
              )}
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slatey mb-1 block">Senha</span>
              <div className="relative">
                <input type={show ? 'text' : 'password'} className="field pr-12" placeholder={mode === 'register' ? 'Mínimo de 8 caracteres' : 'Sua senha'}
                  value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slatey hover:text-ink">
                  <UiIcon name={show ? 'eyeOff' : 'eye'} size={20} />
                </button>
              </div>
              {mode === 'register' && password && <PasswordMeter password={password} />}
            </label>

            {mode === 'login' && (
              <button type="button" onClick={forgot} className="self-end -mt-1 text-sm font-semibold text-violet hover:text-violet-deep">
                Esqueci minha senha
              </button>
            )}

            {error && (
              <p className="flex items-center gap-2 text-ember text-sm font-medium">
                <UiIcon name="close" size={16} /> {error}
              </p>
            )}
            {info && (
              <p className="flex items-start gap-2 text-mint text-sm font-medium">
                <UiIcon name="check" size={16} strokeWidth={2.4} className="mt-0.5 shrink-0" /> {info}
              </p>
            )}

            <Button type="submit" disabled={busy} size="lg" className="w-full mt-2">
              {busy ? 'Aguarde…' : mode === 'login' ? 'Entrar' : 'Criar minha conta'}
              {!busy && <UiIcon name="arrowRight" size={18} />}
            </Button>
          </form>

          {/* Entrar só com e-mail (sem senha) */}
          <div className="flex items-center gap-3 my-5">
            <span className="h-px flex-1 bg-line" />
            <span className="text-xs text-faint font-semibold">ou</span>
            <span className="h-px flex-1 bg-line" />
          </div>
          <button type="button" onClick={emailOnly} disabled={busy}
            className="w-full rounded-xl2 border-2 border-line bg-surface py-3 font-display font-semibold text-ink tap hover:border-violet/40 flex items-center justify-center gap-2 disabled:opacity-60">
            <UiIcon name="message" size={18} className="text-violet" /> Entrar só com e-mail
          </button>
          <p className="text-xs text-slatey text-center mt-2">Sem criar senha. {firebaseEnabled ? 'Enviamos um link de acesso por e-mail.' : 'No modo local, entra direto.'}</p>

          {!firebaseEnabled && (
            <p className="mt-6 text-xs text-slatey bg-violet-wash rounded-xl2 p-3 flex gap-2">
              <UiIcon name="sparkles" size={16} className="text-violet shrink-0 mt-0.5" />
              <span>Modo de teste local: seus dados ficam só neste navegador. Configure o Firebase (veja o README) para salvar na nuvem e ativar o ranking e o fórum entre usuários.</span>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function PasswordMeter({ password }) {
  const s = passwordStrength(password)
  const colors = ['#E9E7F4', '#FF6A45', '#F6B53D', '#3C8DFF', '#13C09A']
  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-1.5 flex-1 rounded-full" style={{ background: i < s.score ? colors[s.score] : '#E9E7F4' }} />
        ))}
      </div>
      <p className="text-xs mt-1" style={{ color: s.ok ? '#13C09A' : '#6B6A85' }}>
        Força: {s.label}{!s.ok && s.tips.length ? ` — ${s.tips[0]}` : ''}
      </p>
    </div>
  )
}

function traduzErro(err) {
  const m = err?.code || err?.message || ''
  if (m.includes('email-already-in-use')) return 'Este e-mail já está cadastrado.'
  if (m.includes('invalid-email')) return 'E-mail inválido.'
  if (m.includes('weak-password')) return 'A senha precisa de pelo menos 6 caracteres.'
  if (m.includes('user-not-found') || m.includes('wrong-password') || m.includes('invalid-credential'))
    return 'E-mail ou senha incorretos.'
  return err.message || 'Algo deu errado. Tente novamente.'
}
