// ============================================================
// MOD_INSIGHTS_ENGINE — InsightsWidget
// Gráfico de progresso por disciplina usando Recharts
// Calcula métricas de APs concluídas vs pendentes
// ============================================================
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import { useAppStore } from '../../store/useAppStore';
import { TrendingUp } from 'lucide-react';
import { db } from '../MOD_DB/db';
import { useLiveQuery } from 'dexie-react-hooks';

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
  const userProfile = useAppStore(state => state.userProfile);
  const userId = Number(userProfile?.id) || 1;

  const disciplinas = useLiveQuery(() => db.disciplinas.where({ user_id: userId }).toArray(), [userId]) || [];
  const aps = useLiveQuery(() => db.aps.where({ user_id: userId }).toArray(), [userId]) || [];
  const checklistItems = useLiveQuery(
    async () => {
      const apIds = aps.map(a => a.id!);
      if (apIds.length === 0) return [];
      return await db.checklist.where('id_ap').anyOf(apIds).toArray();
    },
    [aps]
  ) || [];

  if (disciplinas.length === 0) return null;

  const data = disciplinas.map(d => {
    const discAps = aps.filter(a => a.id_disciplina === d.id).map(a => a.id!);
    const discItems = checklistItems.filter(c => discAps.includes(c.id_ap));
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

  return (
    <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
      {/* Header */}
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
    </div>
  );
}
