// src/components/InstallApp.jsx
// Convite para instalar o app no aparelho. No Android/desktop usa o prompt nativo;
// no iOS mostra o passo a passo (Compartilhar -> Adicionar à Tela de Início).
import { useState } from 'react'
import { usePwaInstall } from '../hooks/usePwaInstall'
import Modal from './common/Modal'
import Button from './common/Button'
import UiIcon from './icons/UiIcon'
import { BrandMark } from './Brand'

function IOSSteps() {
  return (
    <ol className="mt-2 flex flex-col gap-3 text-sm text-ink/90">
      <li className="flex items-center gap-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-violet-wash font-bold text-violet">1</span>
        Toque no botão <strong>Compartilhar</strong> do Safari
        <UiIcon name="share" size={18} className="text-violet" />
      </li>
      <li className="flex items-center gap-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-violet-wash font-bold text-violet">2</span>
        Escolha <strong>Adicionar à Tela de Início</strong>
        <UiIcon name="plus" size={18} className="text-violet" />
      </li>
      <li className="flex items-center gap-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-violet-wash font-bold text-violet">3</span>
        Confirme em <strong>Adicionar</strong>. Pronto!
      </li>
    </ol>
  )
}

// Cartão completo (usado no Perfil)
export function InstallCard() {
  const { canInstall, promptInstall, isIOS, isStandalone } = usePwaInstall()
  const [open, setOpen] = useState(false)

  if (isStandalone) {
    return (
      <div className="card p-4 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-mint/12 text-mint"><UiIcon name="check" /></span>
        <div>
          <p className="font-display font-bold text-ink">App instalado</p>
          <p className="text-sm text-slatey">Você está usando o Estuda+ como aplicativo.</p>
        </div>
      </div>
    )
  }
  async function go() {
    if (isIOS) { setOpen(true); return }
    const r = await promptInstall()
    if (r === 'unavailable') setOpen(true)
  }

  // Sem prompt nativo disponível (ou ainda não disparado): oferece o passo a passo manual.
  if (!canInstall) {
    return (
      <>
        <button onClick={() => setOpen(true)} className="card p-4 w-full text-left flex items-center gap-3 tap hover:border-violet/40">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-wash text-violet"><UiIcon name="install" /></span>
          <div className="flex-1">
            <p className="font-display font-bold text-ink">Adicionar à tela inicial</p>
            <p className="text-sm text-slatey">Use o Estuda+ como app, com acesso rápido e offline.</p>
          </div>
          <UiIcon name="chevronRight" className="text-faint" />
        </button>
        <Modal open={open} onClose={() => setOpen(false)} title="Instalar o Estuda+">
          <div className="flex items-center gap-3 mb-2">
            <BrandMark size={40} />
            <p className="text-sm text-slatey">No celular, abra o menu do navegador e escolha <strong>Adicionar à Tela de Início</strong>.</p>
          </div>
          <IOSSteps />
          <Button onClick={() => setOpen(false)} className="w-full mt-5">Entendi</Button>
        </Modal>
      </>
    )
  }

  return (
    <>
      <button onClick={go} className="card p-4 w-full text-left flex items-center gap-3 tap hover:border-violet/40">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet text-white"><UiIcon name="install" /></span>
        <div className="flex-1">
          <p className="font-display font-bold text-ink">Instalar o aplicativo</p>
          <p className="text-sm text-slatey">Acesso rápido na tela inicial e uso offline.</p>
        </div>
        <UiIcon name="chevronRight" className="text-faint" />
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Instalar o Estuda+">
        <div className="flex items-center gap-3 mb-2">
          <BrandMark size={40} />
          <p className="text-sm text-slatey">Tenha o app na tela inicial do seu aparelho.</p>
        </div>
        <IOSSteps />
        <Button onClick={() => setOpen(false)} className="w-full mt-5">Entendi</Button>
      </Modal>
    </>
  )
}

// Faixa compacta (usada no topo do app, dispensável)
export function InstallBanner() {
  const { canInstall, promptInstall, isIOS } = usePwaInstall()
  const [hidden, setHidden] = useState(() => sessionStorage.getItem('estuda:hideInstall') === '1')
  const [open, setOpen] = useState(false)
  if (!canInstall || hidden) return null

  function dismiss() { setHidden(true); sessionStorage.setItem('estuda:hideInstall', '1') }
  async function go() {
    if (isIOS) { setOpen(true); return }
    const r = await promptInstall()
    if (r === 'unavailable') setOpen(true)
  }

  return (
    <>
      <div className="flex items-center gap-3 rounded-xl2 bg-brand text-white px-4 py-3 shadow-soft">
        <BrandMark size={30} />
        <p className="flex-1 text-sm font-medium leading-tight">Instale o Estuda+ no seu aparelho</p>
        <button onClick={go} className="rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold tap hover:bg-white/25">Instalar</button>
        <button onClick={dismiss} aria-label="Dispensar" className="text-white/70 hover:text-white"><UiIcon name="close" size={18} /></button>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Instalar o Estuda+">
        <IOSSteps />
        <Button onClick={() => setOpen(false)} className="w-full mt-5">Entendi</Button>
      </Modal>
    </>
  )
}
