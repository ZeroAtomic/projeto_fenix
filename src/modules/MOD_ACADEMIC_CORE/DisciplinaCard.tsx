// ============================================================
// MOD_ACADEMIC_CORE — DisciplinaCard
// Card visual de uma disciplina com progresso calculado via Zustand/SQLite
// ============================================================
import { BookOpen, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useFenixStore } from '../../store/useFenixStore';

interface Props {
  disciplina: {
    id: number;
    nome: string;
    professor: string;
    semestre: string;
    descricao?: string;
  };
  onEdit: (d: any) => void;
  onDelete: (id: number) => void;
  onClick: (id: number) => void;
}

export function DisciplinaCard({ disciplina, onEdit, onDelete, onClick }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Pega as APs da store global que já vêm com seus checklists do SQLite
  const storeAps = useFenixStore(state => state.aps);
  const aps = storeAps.filter(ap => ap.disciplinaId === disciplina.id);
  const checklistItems = aps.flatMap(ap => ap.checklists || []);

  const totalItems = checklistItems.length;
  const concluidos = checklistItems.filter(i => i.concluido).length;
  const progresso = totalItems > 0 ? Math.round((concluidos / totalItems) * 100) : 0;

  const progressColor = progresso >= 70
    ? 'bg-brand-500'
    : progresso >= 40
    ? 'bg-yellow-500'
    : 'bg-red-500';

  const badgeColor = aps.length >= 2
    ? 'bg-brand-500/20 text-brand-500'
    : 'bg-yellow-500/20 text-yellow-500';

  return (
    <div
      className="bg-dark-card border border-dark-border rounded-2xl p-6 hover:border-brand-500/40 transition-all group cursor-pointer relative"
      onClick={() => onClick(disciplina.id)}
    >
      {/* Menu de opções */}
      <div
        className="absolute top-4 right-4 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-dark-bg transition-colors"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-8 bg-dark-card border border-dark-border rounded-xl shadow-xl z-20 w-36 overflow-hidden">
              <button
                onClick={() => { setMenuOpen(false); onEdit(disciplina); }}
                className="flex items-center gap-2 w-full px-4 py-3 text-sm text-slate-300 hover:bg-dark-bg hover:text-white transition-colors"
              >
                <Pencil className="w-4 h-4" /> Editar
              </button>
              <button
                onClick={() => { setMenuOpen(false); onDelete(disciplina.id); }}
                className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Excluir
              </button>
            </div>
          </>
        )}
      </div>

      {/* Ícone e nome */}
      <div className="flex items-start gap-4 mb-5">
        <div className="p-3 bg-brand-500/10 rounded-xl border border-brand-500/20 text-brand-500 flex-none">
          <BookOpen className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-200 group-hover:text-brand-400 transition-colors leading-snug">
            {disciplina.nome}
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">{disciplina.professor}</p>
        </div>
      </div>

      {/* Badge APs */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-slate-500">
          {aps.length}/2 APs cadastradas
        </span>
        <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${badgeColor}`}>
          {disciplina.semestre}
        </span>
      </div>

      {/* Barra de progresso */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Progresso geral</span>
          <span className="font-medium text-slate-300">{progresso}%</span>
        </div>
        <div className="h-1.5 w-full bg-dark-bg rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${progressColor}`}
            style={{ width: `${progresso}%` }}
          />
        </div>
      </div>
    </div>
  );
}
