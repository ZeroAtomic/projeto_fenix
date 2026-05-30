// ============================================================
// MOD_ACADEMIC_CORE — DisciplinaModal
// Modal para Adicionar ou Editar uma Disciplina
// ============================================================
import { useState, useEffect } from 'react';
import { X, BookOpen } from 'lucide-react';
import type { Disciplina } from '../../modules/MOD_DB/db';

interface Props {
  isOpen: boolean;
  disciplina?: Disciplina | null; // null = criação, objeto = edição
  onClose: () => void;
  onSave: (d: Disciplina) => void;
}

const SEMESTRES = ['1º', '2º', '3º', '4º', '5º', '6º', '7º', '8º'];

export function DisciplinaModal({ isOpen, disciplina, onClose, onSave }: Props) {
  const [nome, setNome] = useState('');
  const [professor, setProfessor] = useState('');
  const [semestre, setSemestre] = useState('1º');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (disciplina) {
      setNome(disciplina.nome);
      setProfessor(disciplina.professor);
      setSemestre(disciplina.semestre);
    } else {
      setNome('');
      setProfessor('');
      setSemestre('1º');
    }
  }, [disciplina, isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!nome.trim()) return;
    setIsLoading(true);

    try {
      onSave({
        nome,
        professor,
        semestre,
        user_id: 0, // será substituído no componente pai
      } as Disciplina);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-dark-card border border-dark-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Top accent */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-brand-500 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-500/10 rounded-lg text-brand-500">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="font-semibold text-lg text-white">
              {disciplina ? 'Editar Disciplina' : 'Nova Disciplina'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-dark-bg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nome da Disciplina *
            </label>
            <input
              id="input-disciplina-nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Desenvolvimento Web API"
              className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Professor
            </label>
            <input
              id="input-disciplina-professor"
              type="text"
              value={professor}
              onChange={(e) => setProfessor(e.target.value)}
              placeholder="Ex: Marcos Silva"
              className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Semestre
            </label>
            <div className="flex gap-2 flex-wrap">
              {SEMESTRES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSemestre(s)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                    semestre === s
                      ? 'bg-brand-500/20 border-brand-500/50 text-brand-400'
                      : 'bg-dark-bg border-dark-border text-slate-400 hover:border-slate-500 hover:text-slate-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-dark-border">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-dark-border text-slate-400 hover:text-white hover:border-slate-500 transition-all text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            id="btn-disciplina-save"
            onClick={handleSave}
            disabled={!nome.trim() || isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              disciplina ? 'Salvar' : 'Criar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
