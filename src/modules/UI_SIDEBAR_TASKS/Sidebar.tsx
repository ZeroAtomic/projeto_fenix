// ============================================================
// UI_SIDEBAR_TASKS — Sidebar
// Painel lateral de acesso rápido a tarefas (ChecklistItems)
// Conectado ao Zustand (useFenixStore)
// ============================================================
import { useState, useEffect } from 'react';
import { Search, CheckCircle2, Circle, FileText, Filter, LayoutList, AlertCircle } from 'lucide-react';
import { useFenixStore } from '../../store/useFenixStore';

type FilterType = 'all' | 'pending' | 'completed' | 'files';

export function Sidebar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  const { aps, fetchAps, marcarChecklist } = useFenixStore();

  useEffect(() => {
    fetchAps();
  }, [fetchAps]);

  // Extrair todos os checklists de todas as APs
  const checklistItems = aps.flatMap(ap => 
    ap.checklists.map((item: any) => {
      // Dica 7: Prioridade 48h
      // Usar a data do item se existir, senão assumir Infinity
      const dataEntregaStr = item.data_entrega || ap.createdAt; // mock provisório
      const timeDiff = dataEntregaStr ? new Date(dataEntregaStr).getTime() - Date.now() : Infinity;
      const isPriority = !item.concluido && timeDiff > 0 && timeDiff < 48 * 3600 * 1000;

      return {
        ...item,
        apTitulo: ap.titulo || 'AP',
        disciplinaNome: ap.disciplina?.nome || 'Disciplina',
        isPriority
      };
    })
  );

  const handleToggle = async (id: number, concluido: boolean) => {
    await marcarChecklist(id, !concluido);
  };

  // Filtra
  const filtered = checklistItems.filter(item => {
    const searchMatch =
      item.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.apTitulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.disciplinaNome.toLowerCase().includes(searchTerm.toLowerCase());

    if (!searchMatch) return false;

    switch (filter) {
      case 'pending':   return !item.concluido;
      case 'completed': return item.concluido;
      case 'files':     return !!item.arquivoUrl;
      default:          return true;
    }
  });

  const totalPendentes = checklistItems.filter(c => !c.concluido).length;

  const FILTERS: { key: FilterType; label: string }[] = [
    { key: 'all',       label: 'Todas'      },
    { key: 'pending',   label: 'Pendentes'  },
    { key: 'completed', label: 'Concluídas' },
    { key: 'files',     label: 'Com Arquivo'},
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-dark-border flex-none">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <LayoutList className="w-4 h-4 text-brand-500" />
            <h2 className="text-base font-semibold text-white">Tarefas</h2>
          </div>
          {totalPendentes > 0 && (
            <span className="bg-brand-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {totalPendentes > 9 ? '9+' : totalPendentes}
            </span>
          )}
        </div>

        {/* Busca */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-dark-bg border border-dark-border rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>

        {/* Filtros */}
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                filter === f.key
                  ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                  : 'text-slate-500 border border-transparent hover:text-slate-300 hover:border-dark-border'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filtered.length > 0 ? (
          filtered.map(item => (
            <div
              key={item.id}
              className={`p-3 rounded-xl border transition-all ${
                item.concluido
                  ? 'bg-dark-bg/40 border-dark-border/50 opacity-60'
                  : 'bg-dark-bg border-dark-border hover:border-brand-500/40'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {/* Toggle checkbox */}
                <button
                  onClick={() => handleToggle(item.id, item.concluido)}
                  className="mt-0.5 flex-none text-slate-500 hover:text-brand-500 transition-colors"
                >
                  {item.concluido
                    ? <CheckCircle2 className="w-4 h-4 text-brand-500" />
                    : <Circle className={`w-4 h-4 ${item.isPriority ? 'text-red-500 animate-pulse' : ''}`} />
                  }
                </button>

                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium leading-snug ${
                    item.concluido ? 'line-through text-slate-500' : 'text-slate-200'
                  } ${item.isPriority && !item.concluido ? 'text-red-400' : ''}`}>
                    {item.descricao}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-600 truncate">
                    <span className="truncate">{item.disciplinaNome}</span>
                    <span>·</span>
                    <span className="truncate">{item.apTitulo}</span>
                  </div>
                </div>

                {/* Ícone de arquivo */}
                {item.arquivoUrl && (
                  <div className="flex-none text-brand-500/60" title="Possui anexo">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                )}

                {/* Priority highlight */}
                {item.isPriority && (
                  <div className="flex-none text-red-500" title="Vence em menos de 48h!">
                    <AlertCircle className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Filter className="w-8 h-8 text-slate-700 mb-3" />
            <p className="text-xs text-slate-500">
              {searchTerm ? 'Nenhuma tarefa encontrada.' : 'Nenhuma tarefa nesta categoria.'}
            </p>
          </div>
        )}
      </div>

      {/* Footer com contagem */}
      {checklistItems.length > 0 && (
        <div className="flex-none p-4 border-t border-dark-border">
          <div className="flex justify-between text-xs text-slate-500">
            <span>{checklistItems.filter(c => c.concluido).length} concluídos</span>
            <span>{totalPendentes} pendentes</span>
          </div>
          <div className="mt-2 h-1 w-full bg-dark-bg rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-700"
              style={{
                width: checklistItems.length > 0
                  ? `${Math.round((checklistItems.filter(c => c.concluido).length / checklistItems.length) * 100)}%`
                  : '0%'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
