// src/services/authService.js
// Camada única de autenticação. Se o Firebase estiver ativo, usa Firebase Auth.
// Caso contrário, usa um login local simples (e-mail salvo no navegador) para testes.

import { auth, firebaseEnabled } from '../firebase/config'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged as fbOnAuthStateChanged,
  updateProfile,
  updateEmail,
  updatePassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  reload as fbReload,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from 'firebase/auth'
import { passwordStrength } from './validators'

const LOCAL_KEY = 'estudamais:user'
const EMAIL_FOR_LINK = 'estudamais:emailForSignIn'

// Valida formato de e-mail (simples e suficiente para o app).
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || '').trim())
}

// ---- Modo local (sem Firebase) ----
const localAuth = {
  current: JSON.parse(localStorage.getItem(LOCAL_KEY) || 'null'),
  listeners: new Set(),
  emit() {
    this.listeners.forEach((cb) => cb(this.current))
  },
  save(user) {
    this.current = user
    if (user) localStorage.setItem(LOCAL_KEY, JSON.stringify(user))
    else localStorage.removeItem(LOCAL_KEY)
    this.emit()
  },
}

const METHOD_KEY = 'estudamais:authMethod'
function setMethod(m) { try { localStorage.setItem(METHOD_KEY, m) } catch { /* */ } }
export function currentAuthMethod() {
  return localStorage.getItem(METHOD_KEY) || 'password'
}

export async function signUp(name, email, password) {
  if (!passwordStrength(password).ok) {
    throw new Error('Senha fraca: use ao menos 8 caracteres, com letras e números.')
  }
  if (firebaseEnabled) {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName: name })
    try { await sendEmailVerification(cred.user) } catch { /* não bloqueia o cadastro */ }
    setMethod('password')
    return cred.user
  }
  if (!isValidEmail(email)) {
    throw new Error('Use um e-mail válido.')
  }
  const user = { uid: 'local-' + btoa(email).slice(0, 12), email, displayName: name, emailVerified: true }
  setMethod('password')
  localAuth.save(user)
  return user
}

export async function signIn(email, password) {
  if (firebaseEnabled) {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    setMethod('password')
    return cred.user
  }
  if (!email || !password) throw new Error('Informe e-mail e senha.')
  const name = email.split('@')[0]
  const user = { uid: 'local-' + btoa(email).slice(0, 12), email, displayName: name, emailVerified: true }
  setMethod('password')
  localAuth.save(user)
  return user
}

// Reenvia o e-mail de verificação para o usuário logado.
export async function resendVerification() {
  if (!firebaseEnabled) return true
  if (!auth.currentUser) throw new Error('Sessão inválida. Entre novamente.')
  await sendEmailVerification(auth.currentUser)
  return true
}

// Recarrega o usuário atual (para detectar quando o e-mail foi verificado).
export async function reloadCurrentUser() {
  if (!firebaseEnabled || !auth.currentUser) return null
  await fbReload(auth.currentUser)
  return auth.currentUser
}

// Login só com e-mail (sem senha). No Firebase usa link mágico por e-mail;
// no modo local entra direto como convidado.
export async function signInWithEmail(email) {
  if (!isValidEmail(email)) throw new Error('Digite um e-mail válido.')
  if (firebaseEnabled) {
    const actionCodeSettings = {
      url: window.location.origin + '/?emailSignIn=1',
      handleCodeInApp: true,
    }
    await sendSignInLinkToEmail(auth, email, actionCodeSettings)
    localStorage.setItem(EMAIL_FOR_LINK, email)
    return { sent: true }
  }
  const name = email.split('@')[0]
  const user = { uid: 'local-' + btoa(email).slice(0, 12), email, displayName: name, emailVerified: true }
  setMethod('passwordless')
  localAuth.save(user)
  return { user }
}

// Completa o login por link mágico ao retornar do e-mail. Chamado na inicialização.
export async function completeEmailLinkSignIn() {
  if (!firebaseEnabled) return false
  if (!isSignInWithEmailLink(auth, window.location.href)) return false
  let email = localStorage.getItem(EMAIL_FOR_LINK)
  if (!email) email = window.prompt('Confirme seu e-mail para concluir o login:')
  if (!email) return false
  await signInWithEmailLink(auth, email, window.location.href)
  localStorage.removeItem(EMAIL_FOR_LINK)
  setMethod('passwordless')
  window.history.replaceState({}, '', '/app')
  return true
}

// Recuperação de senha (esqueci a senha).
export async function sendReset(email) {
  if (!isValidEmail(email)) throw new Error('Digite um e-mail válido.')
  if (firebaseEnabled) {
    await sendPasswordResetEmail(auth, email)
    return true
  }
  throw new Error('No modo de teste local não há envio de e-mail. Configure o Firebase para recuperar a senha.')
}

// Alterar senha (no perfil). Reautentica com a senha atual por segurança.
export async function changePassword(currentPassword, newPassword) {
  if (newPassword.length < 6) throw new Error('A nova senha precisa ter ao menos 6 caracteres.')
  if (firebaseEnabled) {
    const u = auth.currentUser
    if (!u || !u.email) throw new Error('Sessão inválida. Entre novamente.')
    const cred = EmailAuthProvider.credential(u.email, currentPassword)
    await reauthenticateWithCredential(u, cred)
    await updatePassword(u, newPassword)
    return true
  }
  throw new Error('No modo de teste local a senha não é armazenada. Ative o Firebase para alterar a senha.')
}

// Atualizar dados da conta (nome e e-mail) com validação.
export async function updateAccount({ name, email }) {
  if (name !== undefined && name.trim().length < 2) throw new Error('Digite seu nome.')
  if (email !== undefined && !isValidEmail(email)) throw new Error('Digite um e-mail válido.')
  if (firebaseEnabled) {
    const u = auth.currentUser
    if (!u) throw new Error('Sessão inválida. Entre novamente.')
    if (name !== undefined) await updateProfile(u, { displayName: name.trim() })
    if (email !== undefined && email.trim() !== u.email) await updateEmail(u, email.trim())
    return { uid: u.uid, email: u.email, displayName: u.displayName }
  }
  const next = { ...localAuth.current }
  if (name !== undefined) next.displayName = name.trim()
  if (email !== undefined) next.email = email.trim() // uid permanece o mesmo (preserva o progresso)
  localAuth.save(next)
  return next
}

export async function signOut() {
  if (firebaseEnabled) return fbSignOut(auth)
  localAuth.save(null)
}

// Observa o estado de login. Retorna função de cancelamento.
export function onAuthChange(callback) {
  if (firebaseEnabled) return fbOnAuthStateChanged(auth, callback)
  // local: dispara imediatamente e ouve mudanças
  callback(localAuth.current)
  localAuth.listeners.add(callback)
  return () => localAuth.listeners.delete(callback)
}
