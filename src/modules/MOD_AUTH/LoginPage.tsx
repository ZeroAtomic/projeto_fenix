// ============================================================
// MOD_AUTH — LoginPage
// Autenticação mock local via SQLite/Prisma (API /api/auth/login)
// ============================================================
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import api from '../../api/client';
import { LogIn, User, AlertCircle } from 'lucide-react';

export function LoginPage() {
  const [identificador, setIdentificador] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const setUserProfile = useAppStore(state => state.setUserProfile);
  const setAuthToken = useAppStore(state => state.setAuthToken);
  const navigate = useNavigate();

  const handleRaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Dica 5: Validação Rígida de RA (apenas números)
    const val = e.target.value;
    if (/^\d*$/.test(val)) {
      setIdentificador(val);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identificador) {
      setError('O RA é obrigatório.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', {
        ra: identificador,
        senha: password
      });

      const user = response.data.user;

      const jwtToken = response.data.token;
      
      localStorage.setItem('fenix_token', jwtToken);
      setAuthToken(jwtToken);
      setUserProfile({
        ra: user.ra,
        nome: user.nome,
        curso: '', // Mock
        semestre_atual: 1,
        total_semestres: 8,
      });

      // Navega para o Dashboard usando o roteador React (fluido e sem piscar a tela)
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error('API Error', err);
      setError(err.response?.data?.error || 'Erro de conexão com o servidor local.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Card */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-brand-500 via-brand-400 to-transparent" />

          {/* Logo / Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 mb-4">
              <User className="w-8 h-8 text-brand-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-1">Fênix</h1>
            <p className="text-slate-400 text-sm">Seu painel acadêmico Impacta</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                RA
              </label>
              <input
                id="input-identificador"
                type="text"
                value={identificador}
                onChange={handleRaChange}
                className={`w-full bg-dark-bg border ${error ? 'border-red-500' : 'border-dark-border'} rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all`}
                placeholder="Ex: 12345678"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Senha
              </label>
              <input
                id="input-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-none" />
                {error}
              </div>
            )}

            <button
              id="btn-login"
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Entrar
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Primeiro acesso?{' '}
            <button type="button" onClick={() => navigate('/signup')} className="text-brand-500 hover:text-brand-400 font-medium transition-colors">
              Crie sua conta
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
