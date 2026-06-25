// src/hooks/usePwaInstall.js
// Gerencia a instalação do app (PWA): captura o evento do navegador,
// detecta se já está instalado e identifica o iOS (que instala via menu Compartilhar).
import { useEffect, useState, useCallback } from 'react'

export function usePwaInstall() {
  const [deferred, setDeferred] = useState(null)
  const [installed, setInstalled] = useState(false)

  const isStandalone =
    typeof window !== 'undefined' &&
    (window.matchMedia?.('(display-mode: standalone)').matches ||
      window.navigator.standalone === true)

  const isIOS =
    typeof navigator !== 'undefined' &&
    /iphone|ipad|ipod/i.test(navigator.userAgent) &&
    !/crios|fxios/i.test(navigator.userAgent)

  useEffect(() => {
    function onPrompt(e) {
      e.preventDefault()
      setDeferred(e)
    }
    function onInstalled() {
      setInstalled(true)
      setDeferred(null)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const promptInstall = useCallback(async () => {
    if (!deferred) return 'unavailable'
    deferred.prompt()
    const choice = await deferred.userChoice
    setDeferred(null)
    return choice?.outcome || 'dismissed'
  }, [deferred])

  // canInstall: dá pra instalar agora (Android/desktop com prompt, ou iOS via instruções)
  const canInstall = (!!deferred || isIOS) && !isStandalone && !installed

  return { canInstall, promptInstall, isIOS, isStandalone, installed, hasPrompt: !!deferred }
}
