import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { completeEmailLinkSignIn } from './services/authService'
import { applyCustomCatalog } from './services/customCatalog'
import { registerSW } from './services/swUpdate'
import { watchSystemTheme } from './services/theme'

watchSystemTheme()

// Aquece o cache apenas em desenvolvimento.
if (import.meta.env.DEV) import('./devWarm')

// Antes de renderizar: conclui login por link mágico e aplica o catálogo personalizado.
Promise.all([
  completeEmailLinkSignIn().catch(() => {}),
  applyCustomCatalog().catch(() => {}),
]).finally(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
})

// Registra o Service Worker (PWA) — só em produção, para não atrapalhar o dev.
if (import.meta.env.PROD) registerSW()
