import { Download, Upload } from 'lucide-react';
import { db } from '../MOD_DB/db';
import { useState, useRef } from 'react';

export function BackupManager() {
  const [status, setStatus] = useState<'idle' | 'working' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setStatus('working');
    try {
      const usuarios = await db.usuarios.toArray();
      const disciplinas = await db.disciplinas.toArray();
      const aps = await db.aps.toArray();
      const checklist = await db.checklist.toArray();

      const backupData = {
        exportDate: new Date().toISOString(),
        data: { usuarios, disciplinas, aps, checklist: checklist.map(i => ({ ...i, arquivo_blob: undefined })) }
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fenix_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus('working');
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!json.data) throw new Error('Formato inválido');

        // Limpa e importa (Cuidado: isso sobrescreve o banco local)
        if (window.confirm('Isso irá substituir seus dados locais pelos dados do arquivo. Continuar?')) {
          await db.transaction('rw', db.usuarios, db.disciplinas, db.aps, db.checklist, async () => {
            await db.usuarios.clear();
            await db.disciplinas.clear();
            await db.aps.clear();
            await db.checklist.clear();

            if (json.data.usuarios) await db.usuarios.bulkAdd(json.data.usuarios);
            if (json.data.disciplinas) await db.disciplinas.bulkAdd(json.data.disciplinas);
            if (json.data.aps) await db.aps.bulkAdd(json.data.aps);
            if (json.data.checklist) await db.checklist.bulkAdd(json.data.checklist);
          });
          setStatus('success');
          window.location.reload(); // Recarrega para aplicar as mudanças
        }
      } catch (err) {
        console.error(err);
        alert('Erro ao importar arquivo. Verifique se o JSON é válido.');
        setStatus('error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-wrap gap-3">
      {/* Exportar */}
      <button
        onClick={handleExport}
        disabled={status === 'working'}
        className="flex items-center gap-2 bg-dark-bg border border-dark-border hover:border-brand-500/50 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl transition-all group"
      >
        {status === 'working' ? (
          <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        ) : (
          <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
        )}
        <div className="text-left">
          <p className="text-sm font-medium">Exportar</p>
          <p className="text-[10px] text-slate-500">Salvar backup .json</p>
        </div>
      </button>

      {/* Importar */}
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={status === 'working'}
        className="flex items-center gap-2 bg-dark-bg border border-dark-border hover:border-blue-500/50 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl transition-all group"
      >
        <Upload className="w-4 h-4 group-hover:scale-110 transition-transform text-blue-400" />
        <div className="text-left">
          <p className="text-sm font-medium">Importar</p>
          <p className="text-[10px] text-slate-500">Restaurar de .json</p>
        </div>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />
    </div>
  );
}
