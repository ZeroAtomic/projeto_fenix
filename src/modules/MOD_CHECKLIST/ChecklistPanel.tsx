// ============================================================
// MOD_CHECKLIST — ChecklistPanel
// Lista de sub-tópicos de uma AP com checkbox e upload de arquivo
// O toggle atualiza o progresso da AP instantaneamente via Zustand
// ============================================================
import { useState } from 'react';
import { Plus, CheckCircle2, Circle, Trash2, Calendar } from 'lucide-react';
import { FileUploadButton } from '../MOD_FILE_VAULT/FileUploadButton';
import { db, type ChecklistItem } from '../../modules/MOD_DB/db';
import { useLiveQuery } from 'dexie-react-hooks';

interface Props {
  apId: number;
}

export function ChecklistPanel({ apId }: Props) {
  const [novoItem, setNovoItem] = useState('');
  const [adicionando, setAdicionando] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [novaData, setNovaData] = useState('');

  const items = useLiveQuery(
    () => db.checklist.where({ id_ap: apId }).toArray(),
    [apId]
  ) || [];
  
  const concluidos = items.filter(c => c.concluido).length;

  const handleToggle = async (item: ChecklistItem) => {
    try {
      await db.checklist.update(item.id!, { concluido: !item.concluido });
    } catch (err) { console.error(err); }
  };

  const handleAddItem = async () => {
    if (!novoItem.trim()) return;
    setIsSaving(true);

    try {
      await db.checklist.add({
        id_ap: apId,
        descricao: novoItem.trim(),
        concluido: false,
        data_entrega: novaData || undefined
      });
      setNovoItem('');
      setNovaData('');
      setAdicionando(false);
    } catch (err) { console.error(err); }
    
    setIsSaving(false);
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    try {
      await db.checklist.delete(id);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-3">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-medium text-slate-200">Checklist</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            {concluidos}/{items.length} itens concluídos
          </p>
        </div>
        <button
          id={`btn-add-checklist-${apId}`}
          onClick={() => setAdicionando(true)}
          className="flex items-center gap-1.5 text-sm text-brand-500 hover:text-brand-400 font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Adicionar
        </button>
      </div>

      {/* Lista de itens */}
      {items.length === 0 && !adicionando ? (
        <div className="text-center py-6 text-slate-600 text-sm">
          <p>Nenhum item no checklist.</p>
          <button
            onClick={() => setAdicionando(true)}
            className="mt-2 text-brand-500 hover:text-brand-400 transition-colors"
          >
            Adicionar o primeiro item
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-start gap-3 p-3 rounded-xl border transition-all group ${
                item.concluido
                  ? 'bg-dark-bg/50 border-dark-border/50'
                  : 'bg-dark-bg border-dark-border hover:border-brand-500/30'
              }`}
            >
              {/* Toggle */}
              <button
                onClick={() => handleToggle(item)}
                className="mt-0.5 flex-none text-slate-500 hover:text-brand-500 transition-colors"
              >
                {item.concluido
                  ? <CheckCircle2 className="w-5 h-5 text-brand-500" />
                  : <Circle className="w-5 h-5" />
                }
              </button>

              {/* Conteúdo */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <p className={`text-sm leading-snug ${item.concluido ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                  {item.descricao}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {item.data_entrega && (
                    <div className="flex items-center gap-1 text-xs text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.data_entrega).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <FileUploadButton
                  checklistItemId={item.id!}
                  currentFile={item.arquivo_nome}
                />
              </div>

              {/* Delete */}
              <button
                onClick={() => handleDelete(item.id)}
                className="opacity-0 group-hover:opacity-100 flex-none mt-0.5 text-slate-600 hover:text-red-400 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Campo novo item */}
      {adicionando && (
        <div className="flex flex-col gap-2 mt-2 bg-dark-card border border-dark-border p-3 rounded-xl">
          <input
            id="input-novo-checklist"
            type="text"
            autoFocus
            value={novoItem}
            onChange={(e) => setNovoItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddItem();
              if (e.key === 'Escape') { setAdicionando(false); setNovoItem(''); setNovaData(''); }
            }}
            placeholder="Descreva o item..."
            className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-all"
          />
          <div className="flex gap-2 items-center mt-1">
            <input
              type="date"
              value={novaData}
              onChange={(e) => setNovaData(e.target.value)}
              className="bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-brand-500"
            />
            <div className="flex-1" />
            <button
              onClick={() => { setAdicionando(false); setNovoItem(''); setNovaData(''); }}
              className="px-3 py-2 rounded-xl text-slate-400 hover:text-white transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={handleAddItem}
              disabled={!novoItem.trim() || isSaving}
              className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-medium transition-all"
            >
              {isSaving ? 'Salvando...' : 'Adicionar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
