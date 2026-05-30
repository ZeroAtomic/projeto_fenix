// ============================================================
// MOD_INSIGHTS_ENGINE — InsightsWidget
// Gráfico de progresso por disciplina usando Recharts
// Calcula métricas de APs concluídas vs pendentes
// Integração com Fenix AI Advisor
// ============================================================
import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import { TrendingUp, Sparkles, Key, Loader2, Save } from 'lucide-react';
import { useFenixStore } from '../../store/useFenixStore';

interface TooltipPayload {
  value: number;
  name: string;
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-card border border-dark-border rounded-xl px-4 py-3 shadow-xl">
        <p className="text-xs text-slate-400 mb-1">{label}</p>
        <p className="text-sm font-bold text-brand-400">{payload[0].value}% concluído</p>
      </div>
    );
  }
  return null;
};

export function InsightsWidget() {
  const { 
    disciplinas: rawDisciplinas, 
    aps, 
    aiInsight, 
    gerandoInsight, 
    apiKeySalva,
    saveGeminiKey,
    checkGeminiKey,
    fetchAiInsight 
  } = useFenixStore();

  React.useEffect(() => {
    checkGeminiKey();
  }, [checkGeminiKey]);

  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [activeTab, setActiveTab] = useState<'grafico' | 'ai'>('grafico');

  // Filtrar disciplinas que têm ID válido e extrair checklists
  const disciplinas = rawDisciplinas || [];

  if (disciplinas.length === 0) return null;

  const data = disciplinas.map(d => {
    const discAps = aps.filter(a => a.disciplinaId === d.id);
    const discItems = discAps.flatMap(a => a.checklists || []);
    
    const progresso = discItems.length > 0 
      ? Math.round((discItems.filter(c => c.concluido).length / discItems.length) * 100) 
      : 0;

    return {
      nome: d.nome.length > 18 ? d.nome.substring(0, 18) + '…' : d.nome,
      progresso,
      aps: discAps.length,
    };
  });

  const mediaGeral = data.length > 0
    ? Math.round(data.reduce((acc, d) => acc + d.progresso, 0) / data.length)
    : 0;

  const handleSaveKey = () => {
    if (apiKeyInput.trim()) {
      saveGeminiKey(apiKeyInput.trim());
      setShowKeyInput(false);
      setApiKeyInput('');
    }
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-dark-border mb-6">
        <button
          onClick={() => setActiveTab('grafico')}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'grafico' ? 'border-brand-500 text-brand-400' : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          Gráfico de Progresso
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'ai' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Fenix AI Advisor
        </button>
      </div>

      {activeTab === 'grafico' ? (
        <>
          {/* Header Gráfico */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-brand-500/10 border border-brand-500/20 rounded-xl text-brand-500">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Visão Geral de Progresso</h3>
                <p className="text-xs text-slate-500 mt-0.5">Progresso por disciplina</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-brand-400">{mediaGeral}%</p>
              <p className="text-xs text-slate-500">média geral</p>
            </div>
          </div>

          {/* Gráfico */}
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis
                dataKey="nome"
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#334155', opacity: 0.4 }} />
              <Bar dataKey="progresso" radius={[6, 6, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.progresso >= 70 ? '#22c55e' : entry.progresso >= 40 ? '#eab308' : '#ef4444'}
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Legenda */}
          <div className="flex gap-4 mt-4 pt-4 border-t border-dark-border">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <div className="w-3 h-3 rounded-sm bg-brand-500" />
              ≥ 70% Ótimo
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <div className="w-3 h-3 rounded-sm bg-yellow-500" />
              ≥ 40% Em progresso
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <div className="w-3 h-3 rounded-sm bg-red-500" />
              &lt; 40% Atenção
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Tutor Acadêmico de Inteligência Artificial</h3>
              <p className="text-xs text-slate-500 mt-0.5">Insights personalizados baseados no seu progresso atual.</p>
            </div>
          </div>

          {/* Configuração da Chave da API */}
          {(!apiKeySalva || showKeyInput) && (
            <div className="bg-dark-bg p-4 rounded-xl border border-dark-border">
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <Key className="w-4 h-4" /> Configurar Chave da API Gemini
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Cole sua API Key do Google Gemini aqui..."
                  className="flex-1 bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                />
                <button
                  onClick={handleSaveKey}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Salvar
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Para essa apresentação, a chave será salva no seu banco SQLite local para permitir a comunicação com a Inteligência Artificial.
              </p>
            </div>
          )}

          {/* Área de Insight */}
          <div className="mt-6">
            <button
              onClick={fetchAiInsight}
              disabled={gerandoInsight || (!apiKeySalva && !showKeyInput && !apiKeyInput)}
              className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-3 rounded-xl font-medium transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {gerandoInsight ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analisando seus dados...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Gerar Insight Inteligente
                </>
              )}
            </button>

            {apiKeySalva && !showKeyInput && (
              <button 
                onClick={() => setShowKeyInput(true)}
                className="w-full text-center text-xs text-purple-400 mt-3 hover:underline"
              >
                Quer alterar a chave da API salva?
              </button>
            )}

            {aiInsight && (
              <div className="mt-6 p-5 bg-gradient-to-br from-purple-900/40 to-indigo-900/20 border border-purple-500/30 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                <h4 className="text-sm font-semibold text-purple-300 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Dica do seu Tutor Fênix:
                </h4>
                <p className="text-slate-200 text-sm leading-relaxed italic relative z-10">
                  "{aiInsight}"
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
