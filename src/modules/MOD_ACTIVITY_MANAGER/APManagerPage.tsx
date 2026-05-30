// ============================================================
// MOD_ACTIVITY_MANAGER — APManagerPage
// Tela de detalhe de uma Disciplina: gestão de APs e checklists
// Constraint: máximo de 2 APs por disciplina
// ============================================================
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Trash2, AlertTriangle, BookOpen, Target } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { AppLayout } from '../../components/Layout/AppLayout';
import { ChecklistPanel } from '../MOD_CHECKLIST/ChecklistPanel';
import { useFenixStore } from '../../store/useFenixStore';

export function APManagerPage() {
  const { id: disciplinaId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [novaAPTitulo, setNovaAPTitulo] = useState('');
  const [novaAPTipo, setNovaAPTipo] = useState<'AP' | 'PF'>('AP');
  const [adicionandoAP, setAdicionandoAP] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const userProfile = useAppStore(state => state.userProfile);

  // Carrega dados da Store Zustand
  const { disciplinas: apiDisciplinas, aps, fetchDisciplinas, fetchAps, addAp, deleteAp, carregando } = useFenixStore();

  useEffect(() => {
    fetchDisciplinas();
    fetchAps();
  }, [fetchDisciplinas, fetchAps]);

  // Mapeia disciplinas do SQLite para o formato esperado
  const disciplinasFormatadas = apiDisciplinas.map(d => {
    let professor = '';
    let semestre = '1º';
    if (d.descricao) {
      try {
        const parsed = JSON.parse(d.descricao);
        professor = parsed.professor || '';
        semestre = parsed.semestre || '1º';
      } catch (e) {
        professor = d.descricao;
      }
    }
    return {
      id: d.id,
      nome: d.nome,
      professor,
      semestre,
      descricao: d.descricao
    };
  });

  const disciplina = disciplinasFormatadas.find(d => d.id === Number(disciplinaId));

  // Filtra APs da disciplina atual
  const apsDestaDisciplina = aps.filter(ap => ap.disciplinaId === Number(disciplinaId)) || [];

  const podeAdicionarAP = apsDestaDisciplina.length < 2;

  if (!disciplina) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64 text-slate-500">
          Disciplina não encontrada.
        </div>
      </AppLayout>
    );
  }

  const handleAddAP = async () => {
    if (!novaAPTitulo.trim() || podeAdicionarAP === false || !disciplinaId) return;
    setIsSaving(true);

    try {
      await addAp(novaAPTitulo.trim(), novaAPTipo, Number(disciplinaId));
      setNovaAPTitulo('');
      setAdicionandoAP(false);
    } catch (err) {
      console.error('Erro ao salvar AP', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAP = async (apId?: number) => {
    if (!apId) return;
    if (!window.confirm('Excluir esta AP e todos os seus itens?')) return;
    try {
      await deleteAp(apId);
    } catch (err) {
      console.error('Erro ao deletar AP', err);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Breadcrumb */}
        <button
          onClick={() => navigate('/disciplinas')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Voltar para Disciplinas
        </button>

        {/* Header da disciplina */}
        <div className="bg-gradient-to-r from-brand-900/30 to-brand-600/10 border border-brand-500/20 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-brand-500/10 border border-brand-500/20 rounded-xl text-brand-500">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{disciplina.nome}</h2>
              <p className="text-slate-400 text-sm mt-1">
                {disciplina.professor && `Prof. ${disciplina.professor} · `}
                {disciplina.semestre} semestre
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  apsDestaDisciplina.length >= 2
                    ? 'bg-brand-500/20 text-brand-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {apsDestaDisciplina.length}/2 APs
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Aviso de limite */}
        {!podeAdicionarAP && (
          <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-none mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-400">Limite de APs atingido</p>
              <p className="text-xs text-yellow-500/80 mt-0.5">
                Esta disciplina já possui 2 APs cadastradas. Exclua uma para adicionar outra.
              </p>
            </div>
          </div>
        )}

        {/* Lista de APs */}
        <div className="space-y-4">
          {apsDestaDisciplina.map((ap) => {
            const items = ap.checklists || [];
            const total = items.length;
            const concluidos = items.filter(c => c.concluido).length;
            const progresso = total > 0 ? Math.round((concluidos / total) * 100) : 0;
            const progressColor = progresso >= 70 ? 'bg-brand-500' : progresso >= 40 ? 'bg-yellow-500' : 'bg-red-500';

            return (
              <div key={ap.id} className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
                {/* AP Header */}
                <div className="flex items-center justify-between p-5 border-b border-dark-border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
                      <Target className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">{ap.titulo}</h3>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                          {ap.tipo}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-dark-bg rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${progressColor}`}
                              style={{ width: `${progresso}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400">{progresso}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteAP(ap.id)}
                    className="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Checklist */}
                <div className="p-5">
                  <ChecklistPanel apId={ap.id!} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Adicionar AP */}
        {podeAdicionarAP && (
          <div>
            {adicionandoAP ? (
              <div className="bg-dark-card border border-brand-500/30 rounded-2xl p-5 space-y-4">
                <h3 className="font-medium text-white">Nova Atividade Parcial</h3>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">Título</label>
                  <input
                    id="input-nova-ap"
                    type="text"
                    autoFocus
                    value={novaAPTitulo}
                    onChange={(e) => setNovaAPTitulo(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddAP()}
                    placeholder="Ex: Implementação do Backend"
                    className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">Tipo</label>
                  <div className="flex gap-2">
                    {(['AP', 'PF'] as const).map((tipo) => (
                      <button
                        key={tipo}
                        type="button"
                        onClick={() => setNovaAPTipo(tipo)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                          novaAPTipo === tipo
                            ? 'bg-brand-500/20 border-brand-500/50 text-brand-400'
                            : 'bg-dark-bg border-dark-border text-slate-400 hover:border-slate-500'
                        }`}
                      >
                        {tipo === 'AP' ? '📋 Avaliação Parcial' : '📝 Prova Final'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => { setAdicionandoAP(false); setNovaAPTitulo(''); }}
                    className="flex-1 py-2.5 rounded-xl border border-dark-border text-slate-400 hover:text-white text-sm font-medium transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    id="btn-salvar-ap"
                    onClick={handleAddAP}
                    disabled={!novaAPTitulo.trim() || isSaving}
                    className="flex-1 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    {isSaving
                      ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : 'Criar AP'
                    }
                  </button>
                </div>
              </div>
            ) : (
              <button
                id="btn-add-ap"
                onClick={() => setAdicionandoAP(true)}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-dark-border hover:border-brand-500/40 hover:bg-brand-500/5 text-slate-500 hover:text-brand-400 transition-all group"
              >
                <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Adicionar AP ({apsDestaDisciplina.length}/2)</span>
              </button>
            )}
          </div>
        )}

      </div>
    </AppLayout>
  );
}
