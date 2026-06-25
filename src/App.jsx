// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ProgressProvider, useProgress } from './context/ProgressContext'
import Spinner from './components/common/Spinner'
import AppShell from './components/layout/AppShell'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import Trail from './pages/Trail'
import Lesson from './pages/Lesson'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'
import Certificate from './pages/Certificate'
import Forum from './pages/Forum'
import ForumThread from './pages/ForumThread'
import Notes from './pages/Notes'
import Settings from './pages/Settings'
import Review from './pages/Review'
import Simulado from './pages/Simulado'
import Statistics from './pages/Statistics'
import Rotina from './pages/Rotina'
import Achievements from './pages/Achievements'
import Search from './pages/Search'
import Admin from './pages/Admin'
import Landing, { landingSeen } from './pages/Landing'
import ValidateCertificate from './pages/ValidateCertificate'
import VerifyEmail from './pages/VerifyEmail'
import UpdatePrompt from './components/UpdatePrompt'

// Exige login. Se ainda não escolheu trilha/matérias, manda para o onboarding.
function Protected({ children, requireOnboarding = true, requireVerified = true }) {
  const { user, loading, needsEmailVerification } = useAuth()
  const { progress, loading: pLoading } = useProgress()
  const location = useLocation()

  if (loading || (user && (pLoading || !progress))) {
    return <div className="min-h-screen grid place-items-center"><Spinner /></div>
  }
  if (!user) return <Navigate to="/" replace state={{ from: location }} />

  // E-mail não confirmado (modo Firebase) → tela de verificação.
  if (requireVerified && needsEmailVerification) return <Navigate to="/verificar-email" replace />

  const needsOnboarding = !progress?.track || (progress?.subjects?.length ?? 0) === 0
  if (requireOnboarding && needsOnboarding) return <Navigate to="/onboarding" replace />

  return children
}

// Se já estiver logado, pula a tela de login.
function PublicOnly({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen grid place-items-center"><Spinner /></div>
  if (user) return <Navigate to="/app" replace />
  return children
}

// Primeiro acesso mostra a apresentação; depois, vai direto ao login.
function Entry() {
  return landingSeen() ? <Login /> : <Landing />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProgressProvider>
          <Routes>
            <Route path="/" element={<PublicOnly><Entry /></PublicOnly>} />
            <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
            <Route path="/validar-certificado" element={<ValidateCertificate />} />
            <Route
              path="/verificar-email"
              element={<Protected requireOnboarding={false} requireVerified={false}><VerifyEmail /></Protected>}
            />
            <Route
              path="/onboarding"
              element={
                <Protected requireOnboarding={false}>
                  <Onboarding />
                </Protected>
              }
            />
            <Route
              path="/app"
              element={
                <Protected>
                  <AppShell><Home /></AppShell>
                </Protected>
              }
            />
            <Route
              path="/app/trilha/:subjectId"
              element={<Protected><AppShell><Trail /></AppShell></Protected>}
            />
            <Route
              path="/app/licao/:subjectId/:lessonId"
              element={<Protected><AppShell><Lesson /></AppShell></Protected>}
            />
            <Route
              path="/app/ranking"
              element={<Protected><AppShell><Leaderboard /></AppShell></Protected>}
            />
            <Route
              path="/app/forum"
              element={<Protected><AppShell><Forum /></AppShell></Protected>}
            />
            <Route
              path="/app/forum/:threadId"
              element={<Protected><AppShell><ForumThread /></AppShell></Protected>}
            />
            <Route
              path="/app/perfil"
              element={<Protected><AppShell><Profile /></AppShell></Protected>}
            />
            <Route
              path="/app/anotacoes"
              element={<Protected><AppShell><Notes /></AppShell></Protected>}
            />
            <Route
              path="/app/configuracoes"
              element={<Protected><AppShell><Settings /></AppShell></Protected>}
            />
            <Route
              path="/app/revisao"
              element={<Protected><AppShell><Review /></AppShell></Protected>}
            />
            <Route
              path="/app/simulado"
              element={<Protected><AppShell><Simulado /></AppShell></Protected>}
            />
            <Route
              path="/app/estatisticas"
              element={<Protected><AppShell><Statistics /></AppShell></Protected>}
            />
            <Route
              path="/app/rotina"
              element={<Protected><AppShell><Rotina /></AppShell></Protected>}
            />
            <Route
              path="/app/conquistas"
              element={<Protected><AppShell><Achievements /></AppShell></Protected>}
            />
            <Route
              path="/app/busca"
              element={<Protected><AppShell><Search /></AppShell></Protected>}
            />
            <Route
              path="/app/certificado/:subjectId"
              element={<Protected><AppShell><Certificate /></AppShell></Protected>}
            />
            {/* Rota administrativa oculta — não referenciada em nenhuma tela de usuário */}
            <Route path="/painel" element={<Admin />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <UpdatePrompt />
        </ProgressProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
