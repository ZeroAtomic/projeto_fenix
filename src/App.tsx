// ============================================================
// App.tsx — Roteamento principal do Projeto Fênix
// ============================================================
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from './api/client';

// MOD_AUTH
import { LoginPage } from './modules/MOD_AUTH/LoginPage';
import { SignupPage } from './modules/MOD_AUTH/SignupPage';

// MOD_USER_PROFILE
import { OnboardingPage } from './modules/MOD_USER_PROFILE/OnboardingPage';

// MOD_ACADEMIC_CORE
import { DashboardPage } from './modules/MOD_ACADEMIC_CORE/DashboardPage';
import { DisciplinasPage } from './modules/MOD_ACADEMIC_CORE/DisciplinasPage';

// MOD_ACTIVITY_MANAGER
import { APManagerPage } from './modules/MOD_ACTIVITY_MANAGER/APManagerPage';

// Store
import { useAppStore } from './store/useAppStore';

// --- Rota Protegida (requer login) ---
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const userProfile = useAppStore(state => state.userProfile);
  if (!userProfile) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// --- Rota de Onboarding (só acessa se logado mas sem curso) ---
const OnboardingRoute = ({ children }: { children: React.ReactNode }) => {
  const userProfile = useAppStore(state => state.userProfile);
  if (!userProfile) {
    return <Navigate to="/login" replace />;
  }
  if (userProfile.curso) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

function App() {
  const { setUserProfile, setAuthToken } = useAppStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const rehydrate = async () => {
      const token = localStorage.getItem('fenix_token');
      if (token) {
        try {
          // Decodifica o payload do JWT manualmente
          const payloadBase64 = token.split('.')[1];
          const payloadStr = atob(payloadBase64);
          const payload = JSON.parse(payloadStr);

          // Tenta ler o perfil salvo localmente pelo Onboarding
          const cachedProfileStr = localStorage.getItem('fenix_user_profile');
          const cachedProfile = cachedProfileStr ? JSON.parse(cachedProfileStr) : null;

          setAuthToken(token);
          setUserProfile({
            ra: payload.ra,
            nome: payload.nome || 'Aluno',
            curso: cachedProfile?.curso || '',
            semestre_atual: cachedProfile?.semestre_atual || 1,
            total_semestres: cachedProfile?.total_semestres || 8,
            id: payload.id
          } as any);

          // Buscar dados reais do backend para preencher o nome dinâmico
          api.get('/auth/me').then(res => {
            setUserProfile({
              ra: res.data.ra,
              nome: res.data.nome,
              email: res.data.email,
              curso: cachedProfile?.curso || '',
              semestre_atual: cachedProfile?.semestre_atual || 1,
              total_semestres: cachedProfile?.total_semestres || 8,
              id: res.data.id
            } as any);
          }).catch(err => console.error('Erro ao buscar perfil do usuário:', err));
        } catch (err) {
          console.error('Erro ao recuperar sessão local ou decodificar JWT:', err);
        }
      }
      setIsInitializing(false);
    };
    rehydrate();
  }, [setAuthToken, setUserProfile]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Público */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Onboarding — só para usuários sem curso configurado */}
        <Route
          path="/onboarding"
          element={
            <OnboardingRoute>
              <OnboardingPage />
            </OnboardingRoute>
          }
        />

        {/* Protegidas — requerem login */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/disciplinas"
          element={
            <ProtectedRoute>
              <DisciplinasPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/disciplinas/:id"
          element={
            <ProtectedRoute>
              <APManagerPage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all → Dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
