// ============================================================
// MOD_USER_PROFILE — OnboardingPage
// Configuração inicial: Curso e Semestre do aluno
// Executado uma vez após o primeiro login
// ============================================================
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { GraduationCap, ChevronRight, Flame } from 'lucide-react';

const CURSOS = [
  'Análise e Desenvolvimento de Sistemas',
  'Ciência da Computação',
  'Engenharia de Software',
  'Sistemas de Informação',
  'Redes de Computadores',
  'Banco de Dados',
  'Outro',
];

export function OnboardingPage() {
  const [curso, setCurso] = useState('');
  const [semestreAtual, setSemestreAtual] = useState('1');
  const [totalSemestres, setTotalSemestres] = useState('8');
  const [isLoading, setIsLoading] = useState(false);

  const userProfile = useAppStore(state => state.userProfile);
  const setUserProfile = useAppStore(state => state.setUserProfile);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!curso) return;
    setIsLoading(true);

    try {
      localStorage.setItem('fenix_user_profile', JSON.stringify({
        curso,
        semestre_atual: Number(semestreAtual),
        total_semestres: Number(totalSemestres),
      }));
    } catch (err) {
      console.error('Erro ao salvar perfil local:', err);
    }

    setUserProfile({
      ra: userProfile?.ra || '',
      nome: userProfile?.nome || '',
      curso,
      semestre_atual: Number(semestreAtual),
      total_semestres: Number(totalSemestres),
      id: userProfile?.id
    } as any);

    setIsLoading(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative">
        <div className="bg-dark-card border border-dark-border rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-brand-500 via-brand-400 to-transparent" />

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 mb-4">
              <Flame className="w-8 h-8 text-brand-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Bem-vindo ao Fênix!</h1>
            <p className="text-slate-400 text-sm">
              Conta pra gente sobre sua jornada acadêmica para personalizar sua experiência.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Curso */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                <GraduationCap className="inline w-4 h-4 mr-1.5 text-brand-500" />
                Qual é o seu curso?
              </label>
              <div className="grid grid-cols-1 gap-2">
                {CURSOS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCurso(c)}
                    className={`px-4 py-3 rounded-xl text-left text-sm font-medium transition-all border ${
                      curso === c
                        ? 'bg-brand-500/20 border-brand-500/50 text-brand-400'
                        : 'bg-dark-bg border-dark-border text-slate-400 hover:border-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Semestre */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Semestre atual
                </label>
                <select
                  value={semestreAtual}
                  onChange={(e) => setSemestreAtual(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all appearance-none"
                >
                  {Array.from({ length: 8 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}º Semestre</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Total de semestres
                </label>
                <select
                  value={totalSemestres}
                  onChange={(e) => setTotalSemestres(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all appearance-none"
                >
                  {[4, 6, 8, 10].map((n) => (
                    <option key={n} value={n}>{n} semestres</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              id="btn-onboarding-confirm"
              type="submit"
              disabled={!curso || isLoading}
              className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Começar
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
