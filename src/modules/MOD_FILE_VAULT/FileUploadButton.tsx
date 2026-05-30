// ============================================================
// MOD_FILE_VAULT — FileUploadButton
// Componente reutilizável de upload de arquivo para a API Express
// Exibe barra de progresso e feedback visual durante o salvamento
// ============================================================
import { useState, useRef } from 'react';
import { Upload, XCircle, Download } from 'lucide-react';
import api from '../../api/client';

interface Props {
  checklistItemId: number;
  currentFile?: string;
}

export function FileUploadButton({ checklistItemId, currentFile }: Props) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [fileName, setFileName] = useState(currentFile || '');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setStatus('uploading');
    setProgress(0);
    setErrorMsg('');

    try {
      // Cria FormData com o arquivo
      const formData = new FormData();
      formData.append('file', file);

      // Envia para a API Express
      await api.post(`/checklist/${checklistItemId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          }
        }
      });

      setStatus('success');
      setProgress(100);
      setFileName(file.name);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMsg('Erro ao enviar arquivo para o servidor.');
    }
  };

  const handleDownload = async () => {
    try {
      const response = await api.get(`/checklist/${checklistItemId}/download`, {
        responseType: 'blob'
      });
      const url = URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'anexo';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao baixar arquivo:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-2">
      {/* Botão / Status */}
      {status === 'uploading' ? (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Enviando arquivo...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-dark-bg rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 transition-all duration-200 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : status === 'success' || fileName ? (
        <div className="flex items-center gap-2">
          <button 
            onClick={handleDownload}
            className="flex items-center gap-1.5 text-xs text-brand-500 bg-brand-500/10 border border-brand-500/20 px-3 py-1.5 rounded-lg hover:bg-brand-500/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            {fileName || 'Ver arquivo'}
          </button>
          <button
            onClick={() => inputRef.current?.click()}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Substituir
          </button>
        </div>
      ) : status === 'error' ? (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg">
            <XCircle className="w-3.5 h-3.5" />
            {errorMsg || 'Erro no upload'}
          </div>
          <button
            onClick={() => { setStatus('idle'); inputRef.current?.click(); }}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-brand-400 bg-dark-bg border border-dark-border hover:border-brand-500/40 px-3 py-1.5 rounded-lg transition-all"
        >
          <Upload className="w-3.5 h-3.5" />
          Anexar arquivo
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleChange}
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip"
      />
    </div>
  );
}
