// src/firebase/config.js
// Inicializa o Firebase SOMENTE se as variáveis de ambiente estiverem presentes.
// Sem isso, o app funciona em "modo local" (localStorage) para você poder testar
// imediatamente. Quando você preencher o .env, o app passa a usar o Firebase de verdade.

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'

const cfg = {
  apiKey: "AIzaSyAZLaFBq0fUScYbljV5aFNfw7RNH_FAWi8",
  authDomain: "estuda-plus.firebaseapp.com",
  projectId: "estuda-plus",
  storageBucket: "estuda-plus.firebasestorage.app",
  messagingSenderId: "153905543245",
  appId: "1:153905543245:web:448fc88952b75896238404",
  measurementId: "G-BBZ91BGDQT"
};

// App Check (reCAPTCHA v3): protege contra uso do backend fora do seu app.
// Cole aqui a CHAVE DE SITE do reCAPTCHA v3 (veja o README, "Segurança"). Vazio = desativado.
const RECAPTCHA_SITE_KEY = ''

// Consideramos "configurado" se houver apiKey e projectId.
export const firebaseEnabled = Boolean(cfg.apiKey && cfg.projectId)

let auth = null
let db = null

if (firebaseEnabled) {
  const app = initializeApp(cfg)
  if (RECAPTCHA_SITE_KEY) {
    try {
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(RECAPTCHA_SITE_KEY),
        isTokenAutoRefreshEnabled: true,
      })
    } catch (e) {
      console.warn('[Estuda+] App Check não inicializado:', e.message)
    }
  }
  auth = getAuth(app)
  db = getFirestore(app)
  console.info('[Estuda+] Firebase ativo — dados na nuvem.')
} else {
  console.warn(
    '[Estuda+] Firebase NÃO configurado. Rodando em modo local (localStorage).\n' +
      'Preencha o arquivo .env com as chaves do Firebase para ativar a nuvem.'
  )
}

export { auth, db }
