// ============================================================
// MOD_ACADEMIC_CORE — DisciplinasPage
// Listagem e gestão de disciplinas do aluno vinculadas ao SQLite
// ============================================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Search } from 'lucide-react';
import { AppLayout } from '../../components/Layout/AppLayout';
import { DisciplinaCard } from './DisciplinaCard';
import { DisciplinaModal } from './DisciplinaModal';
import { useFenixStore } from '../../store/useFenixStore';

export function DisciplinasPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<any>(null);
  const [search, setSearch] = useState('');

  const navigate = useNavigate();
  const { disciplinas: apiDisciplinas, fetchDisciplinas, addDisciplina, deleteDisciplina, carregando } = useFenixStore();

  useEffect(() => {
    fetchDisciplinas();
  }, [fetchDisciplinas]);

  // Mapeia disciplinas da API para o formato esperado pelo frontend
  const disciplinas = apiDisciplinas.map(d => {
    let professor = '';
    let semestre = '1º';
    if (d.descricao) {
      try {
        const parsed = JSON.parse(d.descricao);
        professor = parsed.professor || '';
        semestre = parsed.semestre || '1º';
      } catch (e) {
        professor = d.descricao; // fallback se for texto puro
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

  const handleSave = async (d: any) => {
    try {
      const descricaoJson = JSON.stringify({
        professor: d.professor,
        semestre: d.semestre
      });
      
      await addDisciplina(d.nome, descricaoJson);
      setEditando(null);
      setModalOpen(false);
    } catch (err) {
      console.error('Erro ao salvar disciplina', err);
    }
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (!window.confirm('Tem certeza que deseja excluir esta disciplina? (Todas as APs e Checklists atrelados serão apagados do SQLite)')) return;
    try {
      await deleteDisciplina(id);
    } catch (err) { 
      console.error('Erro ao excluir', err);
    }
  };

  const handleEdit = (d: any) => {
    setEditando(d);
    setModalOpen(true);
  };

  const filtered = disciplinas.filter(d =>
    d.nome.toLowerCase().includes(search.toLowerCase()) ||
    d.professor.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Minhas Disciplinas</h2>
            <p className="text-slate-400 text-sm mt-1">
              {disciplinas.length} disciplina{disciplinas.length !== 1 ? 's' : ''} cadastrada{disciplinas.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            id="btn-nova-disciplina"
            onClick={() => { setEditando(null); setModalOpen(true); }}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-medium px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-brand-500/20"
          >
            <Plus className="w-5 h-5" />
            Nova Disciplina
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar disciplina ou professor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-dark-card border border-dark-border rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
          />
        </div>

        {/* Grid de cards */}
        {carregando ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-dark-card border border-dark-border rounded-2xl p-6 animate-pulse">
                <div className="h-5 bg-dark-border rounded w-3/4 mb-3" />
                <div className="h-4 bg-dark-border rounded w-1/2 mb-6" />
                <div className="h-2 bg-dark-border rounded w-full" />
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map(d => (
              <DisciplinaCard
                key={d.id}
                disciplina={d as any}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onClick={(id) => navigate(`/disciplinas/${id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-6 bg-dark-card border border-dark-border rounded-2xl mb-4">
              <BookOpen className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-slate-300 font-medium mb-2">
              {search ? 'Nenhuma disciplina encontrada' : 'Nenhuma disciplina cadastrada'}
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              {search ? 'Tente outro termo de busca.' : 'Adicione sua primeira disciplina para começar.'}
            </p>
            {!search && (
              <button
                onClick={() => { setEditando(null); setModalOpen(true); }}
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-medium px-4 py-2.5 rounded-xl transition-all"
              >
                <Plus className="w-4 h-4" />
                Adicionar Disciplina
              </button>
            )}
          </div>
        )}

      </div>

      <DisciplinaModal
        isOpen={modalOpen}
        disciplina={editando}
        onClose={() => { setModalOpen(false); setEditando(null); }}
        onSave={handleSave}
      />
    </AppLayout>
  );
}
