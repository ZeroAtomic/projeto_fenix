// ============================================================
// Layout — AppLayout
// Layout base de toda a aplicação autenticada
// Header com navegação, área de conteúdo e sidebar lateral
// ============================================================
import { NavLink, useNavigate } from 'react-router-dom';
import { Sidebar } from '../../modules/UI_SIDEBAR_TASKS/Sidebar';
import { useAppStore } from '../../store/useAppStore';
import { useFenixStore } from '../../store/useFenixStore';
import { LayoutDashboard, BookOpen, LogOut, Flame } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const logout = useAppStore(state => state.logout);
  const userProfile = useAppStore(state => state.userProfile);
  const clearFenixData = useFenixStore(state => state.clearData);
  const navigate = useNavigate();

  const handleLogout = () => {
    clearFenixData();
    logout();
    localStorage.removeItem('fenix_token');
    navigate('/login', { replace: true });
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
      isActive
        ? 'bg-brand-500/20 text-brand-400 border border-brand-500/20'
        : 'text-slate-400 hover:text-white hover:bg-dark-border/40'
    }`;

  return (
    <div className="flex h-screen bg-dark-bg text-slate-100 overflow-hidden">

      {/* Área principal (conteúdo + header) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">

        {/* Header */}
        <header className="flex-none h-14 border-b border-dark-border bg-dark-card/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
          {/* Logo + nav */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
                <Flame className="w-4 h-4 text-brand-500" />
              </div>
              <span className="font-bold text-white tracking-tight">Fênix</span>
            </div>

            <nav className="flex items-center gap-1">
              <NavLink to="/dashboard" className={navLinkClass} id="nav-dashboard">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </NavLink>
              <NavLink to="/disciplinas" className={navLinkClass} id="nav-disciplinas">
                <BookOpen className="w-4 h-4" />
                Disciplinas
              </NavLink>
            </nav>
          </div>

          {/* Perfil + logout */}
          <div className="flex items-center gap-4">
            {userProfile && (
              <div className="text-right hidden sm:block">
                <p className="text-xs font-medium text-white">{userProfile.nome || 'Aluno'}</p>
                <p className="text-xs text-slate-500">RA: {userProfile.ra}</p>
              </div>
            )}
            <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 text-sm font-bold">
              {userProfile?.nome?.[0]?.toUpperCase() || userProfile?.ra?.[0] || 'A'}
            </div>
            <button
              id="btn-logout"
              onClick={handleLogout}
              title="Sair"
              className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Conteúdo da página */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      {/* Sidebar lateral direita — UI_SIDEBAR_TASKS */}
      <aside className="w-72 flex-none border-l border-dark-border bg-dark-card h-full hidden lg:flex flex-col">
        <Sidebar />
      </aside>

    </div>
  );
}
