// src/pages/Landing.jsx
// Página de apresentação exibida no primeiro acesso (antes do login).
import { useNavigate } from 'react-router-dom'
import Button from '../components/common/Button'
import UiIcon from '../components/icons/UiIcon'
import { BrandMark } from '../components/Brand'
import SubjectGlyph from '../components/icons/SubjectGlyph'

const LANDING_SEEN = 'estudamais:landingSeen'
export const markLandingSeen = () => { try { localStorage.setItem(LANDING_SEEN, '1') } catch { /* */ } }
export const landingSeen = () => { try { return localStorage.getItem(LANDING_SEEN) === '1' } catch { return true } }

const FEATURES = [
  { icon: 'sparkles', title: 'Aulas com IA', text: 'Conteúdo desenvolvido sob medida para cada lição.' },
  { icon: 'refresh', title: 'Revisão espaçada', text: 'O que você erra volta na hora certa para fixar de vez.' },
  { icon: 'target', title: 'Simulados', text: 'Treine no clima da prova e veja onde focar.' },
  { icon: 'award', title: 'Certificados', text: 'Conclua trilhas e emita um certificado com validação.' },
  { icon: 'forum', title: 'Comunidade', text: 'Tire dúvidas e ajude outros estudantes no fórum.' },
  { icon: 'flame', title: 'Ofensiva diária', text: 'Mantenha a sequência e crie o hábito de estudar.' },
]

export default function Landing() {
  const navigate = useNavigate()
  const start = () => { markLandingSeen(); navigate('/login') }

  return (
    <div className="min-h-screen bg-night text-white overflow-x-hidden">
      {/* topo */}
      <header className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BrandMark size={32} />
          <span className="font-display font-extrabold text-lg">Estuda<span className="text-violet-soft">+</span></span>
        </div>
        <button onClick={start} className="text-sm font-semibold text-white/80 hover:text-white">Entrar</button>
      </header>

      {/* hero */}
      <section className="relative max-w-5xl mx-auto px-5 pt-8 pb-14 text-center">
        <div className="absolute inset-0 bg-mesh opacity-50" />
        <div className="relative">
          <span className="chip bg-white/10 text-white/80 mb-4">Plataforma de estudos gamificada</span>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold leading-[1.05] text-balance">
            Sua trilha rumo ao <span className="text-violet-soft">ENEM</span>, <span className="text-gold">concursos</span> e <span className="text-mint">tecnologia</span>.
          </h1>
          <p className="text-white/70 mt-4 max-w-xl mx-auto text-lg">
            Aprenda em pequenas missões, com revisão inteligente, simulados e certificados. Tudo no seu ritmo.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-7">
            <Button onClick={start} size="lg" className="sm:w-auto">Começar agora <UiIcon name="arrowRight" size={18} /></Button>
            <button onClick={start} className="rounded-xl2 border border-white/20 px-5 py-3 font-display font-semibold text-white/90 hover:bg-white/5">Já tenho conta</button>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-white/60">
            <span><strong className="text-white">40+</strong> matérias</span>
            <span className="h-4 w-px bg-white/15" />
            <span><strong className="text-white">5</strong> trilhas</span>
            <span className="h-4 w-px bg-white/15" />
            <span>Instalável como app</span>
          </div>
        </div>
      </section>

      {/* trilhas */}
      <section className="max-w-5xl mx-auto px-5 pb-12">
        <div className="flex flex-wrap justify-center gap-2.5">
          {['python', 'matematica', 'redacao', 'cyber-fundamentos', 'informatica', 'linux', 'javascript', 'historia'].map((id) => (
            <span key={id} className="inline-flex items-center gap-1.5 rounded-full bg-white/8 border border-white/10 px-3 py-2 text-sm">
              <SubjectGlyph id={id} size={16} color="#fff" /> <span className="text-white/80 capitalize">{id.replace('-', ' ')}</span>
            </span>
          ))}
        </div>
      </section>

      {/* features */}
      <section className="bg-cloud text-ink py-14">
        <div className="max-w-5xl mx-auto px-5">
          <h2 className="font-display text-2xl font-extrabold text-center mb-2">Feito para você aprender de verdade</h2>
          <p className="text-slatey text-center mb-8">Não é só assistir — é fixar, praticar e evoluir.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-xl2 bg-surface border border-line shadow-soft p-5">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-wash text-violet mb-3"><UiIcon name={f.icon} size={22} /></span>
                <h3 className="font-display font-bold text-ink">{f.title}</h3>
                <p className="text-sm text-slatey mt-1">{f.text}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button onClick={start} size="lg">Criar minha conta grátis <UiIcon name="arrowRight" size={18} /></Button>
          </div>
        </div>
      </section>

      <footer className="bg-night text-white/50 text-center text-sm py-6">
        Estuda+ · feito para quem quer evoluir nos estudos
      </footer>
    </div>
  )
}
