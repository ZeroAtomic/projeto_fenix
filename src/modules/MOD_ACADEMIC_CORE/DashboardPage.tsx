// ============================================================
// MOD_ACADEMIC_CORE — DashboardPage
// Dashboard principal com métricas reais do store
// Cards de disciplinas com progresso calculado + gráfico
// ============================================================
import { useNavigate } from 'react-router-dom';
import { BookOpen, Activity, Clock, ChevronRight, Plus } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { AppLayout } from '../../components/Layout/AppLayout';
import { InsightsWidget } from '../MOD_INSIGHTS_ENGINE/InsightsWidget';
import { db } from '../../modules/MOD_DB/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { BackupManager } from '../MOD_FILE_VAULT/BackupManager';

export function DashboardPage() {
  const navigate = useNavigate();
  const userProfile = useAppStore(state => state.userProfile);
  const userId = Number(userProfile?.id) || 1;

  const disciplinas = useLiveQuery(() => db.disciplinas.where({ user_id: userId }).toArray(), [userId]) || [];
  const aps = useLiveQuery(() => db.aps.where({ user_id: userId }).toArray(), [userId]) || [];
  
  const checklistItems = useLiveQuery(async () => {
    const apIds = aps.map(a => a.id!);
    if (apIds.length === 0) return [];
    return await db.checklist.where('id_ap').anyOf(apIds).toArray();
  }, [aps]) || [];

  // Métricas calculadas
  const totalPendentes = checklistItems.filter(c => !c.concluido).length;
  const totalConcluidos = checklistItems.filter(c => c.concluido).length;
  const totalItems = checklistItems.length;
  const progressoGeral = totalItems > 0
    ? Math.round((totalConcluidos / totalItems) * 100)
    : 0;

  // Progresso do semestre (baseado em quantos APs existem vs capacidade máxima)
  const capacidadeMaxima = disciplinas.length * 2;
  const progressoSemestre = capacidadeMaxima > 0
    ? Math.round((aps.length / capacidadeMaxima) * 100)
    : 0;

  const primeiroNome = userProfile?.nome?.split(' ')[0] || 'Estudante';

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Banner de boas-vindas */}
        <div className="relative bg-gradient-to-br from-brand-900/50 via-brand-800/20 to-transparent border border-brand-500/20 rounded-2xl p-8 overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-brand-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
          <div className="relative">
            <p className="text-brand-400 text-sm font-medium mb-1">
              {userProfile?.curso && `${userProfile.curso} · ${userProfile.semestre_atual}º semestre`}
            </p>
            <h2 className="text-3xl font-bold text-white mb-2">
              Olá, {primeiroNome}! 👋
            </h2>
            <p className="text-slate-300 text-sm">
              {totalPendentes > 0
                ? `Você tem ${totalPendentes} item${totalPendentes > 1 ? 'ns' : ''} pendente${totalPendentes > 1 ? 's' : ''} no seu checklist.`
                : totalItems > 0
                ? '🎉 Todos os itens do checklist estão concluídos!'
                : 'Comece adicionando suas disciplinas do semestre.'}
            </p>

            <div className="flex flex-wrap gap-3 mt-4">
              <button
                onClick={() => navigate('/disciplinas')}
                className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all shadow-lg shadow-brand-500/20"
              >
                Gerenciar Disciplinas
                <ChevronRight className="w-4 h-4" />
              </button>
              <BackupManager />
            </div>
          </div>
        </div>

        {/* Cards de métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Disciplinas */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 hover:border-brand-500/30 transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-brand-500/10 border border-brand-500/20 rounded-xl text-brand-500">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Disciplinas</p>
                <p className="text-3xl font-bold text-white">{disciplinas.length}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{aps.length} APs cadastradas</span>
              <span className="text-brand-500">{progressoSemestre}% do semestre</span>
            </div>
            <div className="mt-2 h-1 w-full bg-dark-bg rounded-full overflow-hidden">
              <div className="h-full bg-brand-500 rounded-full transition-all duration-700" style={{ width: `${progressoSemestre}%` }} />
            </div>
          </div>

          {/* Progresso geral */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 hover:border-blue-500/30 transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Progresso Geral</p>
                <p className="text-3xl font-bold text-white">{progressoGeral}%</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span>{totalConcluidos} concluídos</span>
              <span>{totalPendentes} pendentes</span>
            </div>
            <div className="h-1 w-full bg-dark-bg rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-700"
                style={{ width: `${progressoGeral}%` }}
              />
            </div>
          </div>

          {/* Horas (estimativa estática — base para futura integração) */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 hover:border-purple-500/30 transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Horas Estimadas</p>
                <p className="text-3xl font-bold text-white">
                  {aps.length * 6}h
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              ~6h por AP · {aps.length} APs cadastradas
            </p>
          </div>
        </div>

        {/* Gráfico de progresso */}
        {disciplinas.length > 0 && <InsightsWidget />}

        {/* Preview das disciplinas */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Disciplinas Recentes</h3>
            <button
              onClick={() => navigate('/disciplinas')}
              className="text-sm text-brand-500 hover:text-brand-400 font-medium transition-colors flex items-center gap-1"
            >
              Ver todas
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {disciplinas.length === 0 ? (
            <div className="bg-dark-card border-2 border-dashed border-dark-border rounded-2xl p-12 text-center">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-medium mb-1">Nenhuma disciplina cadastrada</p>
              <p className="text-slate-600 text-sm mb-4">Adicione as disciplinas do seu semestre para começar.</p>
              <button
                onClick={() => navigate('/disciplinas')}
                className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all"
              >
                <Plus className="w-4 h-4" />
                Adicionar Disciplina
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {disciplinas.slice(0, 4).map(d => {
                const discAps = aps.filter(a => a.id_disciplina === d.id).map(a => a.id!);
                const discItems = checklistItems.filter(c => discAps.includes(c.id_ap));
                const progresso = discItems.length > 0 
                  ? Math.round((discItems.filter(c => c.concluido).length / discItems.length) * 100) 
                  : 0;
                
                const progressColor = progresso >= 70 ? 'bg-brand-500' : progresso >= 40 ? 'bg-yellow-500' : 'bg-red-500';
                return (
                  <button
                    key={d.id}
                    onClick={() => navigate(`/disciplinas/${d.id}`)}
                    className="bg-dark-card border border-dark-border hover:border-brand-500/40 rounded-2xl p-5 text-left transition-all group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-slate-200 group-hover:text-brand-400 transition-colors text-sm">
                          {d.nome}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">{d.professor}</p>
                      </div>
                      <span className="text-xs font-bold text-white">{progresso}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-dark-bg rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${progressColor}`}
                        style={{ width: `${progresso}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </AppLayout>
  );
}
