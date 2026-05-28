// ============================================================
// MOD_AUTH — SignupPage
// Cadastro de novo usuário via backend local (Express/Prisma)
// ============================================================
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import api from '../../api/client';
import { UserPlus, AlertCircle } from 'lucide-react';

export function SignupPage() {
  const [nome, setNome] = useState('');
  const [ra, setRa] = useState('');
  const [email, setEmail] = useState('');
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
      setRa(val);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nome || !ra || !email || !password) {
      setError('Todos os campos são obrigatórios.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/register', {
        nome,
        ra,
        email,
        senha: password
      });

      const user = response.data.user;

      const jwtToken = response.data.token;

      // Limpar cache antigo de curso/semestre para forçar o Onboarding
      localStorage.removeItem('fenix_user_profile');
      
      localStorage.setItem('fenix_token', jwtToken);
      setAuthToken(jwtToken);
      setUserProfile({
        ra: user.ra,
        nome: user.nome,
        curso: '',
        semestre_atual: 1,
        total_semestres: 8,
      });

      // Redireciona via React Router para o Onboarding
      navigate('/onboarding', { replace: true });
    } catch (err: any) {
      console.error('Erro no cadastro', err);
      setError(err.response?.data?.error || 'Ocorreu um erro ao conectar com o servidor local.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="bg-dark-card border border-dark-border rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-brand-500 via-brand-400 to-transparent" />

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 mb-4">
              <UserPlus className="w-8 h-8 text-brand-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-1">Criar Conta</h1>
            <p className="text-slate-400 text-sm">Preencha seus dados para começar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Nome Completo</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                placeholder="Ex: João da Silva"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">RA (Registro Acadêmico)</label>
              <input
                type="text"
                value={ra}
                onChange={handleRaChange}
                className={`w-full bg-dark-bg border ${error ? 'border-red-500' : 'border-dark-border'} rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all`}
                placeholder="Ex: 12345678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                placeholder="Ex: joao@aluno.impacta.edu.br"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm mt-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-none" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 mt-6"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Cadastrar'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Já tem uma conta?{' '}
            <button type="button" onClick={() => navigate('/login')} className="text-brand-500 hover:text-brand-400 font-medium transition-colors">
              Fazer Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
