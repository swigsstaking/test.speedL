import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { monitoringApi } from '../services/api';

const HistoryChart = ({ serverId, metric = 'cpu', title }) => {
  const [period, setPeriod] = useState('24h');

  const { data: serverData } = useQuery({
    queryKey: ['server-history', serverId, period],
    queryFn: () => monitoringApi.getServer(serverId, period),
    enabled: !!serverId,
    refetchInterval: 60000, // Refresh toutes les minutes
  });

  const periods = [
    { value: '1h', label: '1h' },
    { value: '24h', label: '24h' },
    { value: '7d', label: '7j' },
    { value: '30d', label: '30j' },
  ];

  // Transformer les données pour le graphique
  const chartData = serverData?.data?.metrics?.map(m => {
    const date = new Date(m.timestamp);
    let timeLabel;
    
    if (period === '30d') {
      // Pour 30 jours : afficher juste la date
      timeLabel = date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    } else if (period === '7d') {
      // Pour 7 jours : afficher date + heure
      timeLabel = date.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit',
        hour: '2-digit'
      });
    } else {
      // Pour 1h et 24h : afficher juste l'heure
      timeLabel = date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit'
      });
    }
    
    return {
      time: timeLabel,
      value: metric === 'cpu' ? m.metrics?.cpu?.usage || 0 : m.metrics?.ram?.percent || 0
    };
  }) || [];

  const color = metric === 'cpu' ? '#0ea5e9' : '#10b981';

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
        <div className="flex gap-2">
          {periods.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                period === p.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      
      {chartData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-slate-500 dark:text-slate-400">
          Chargement des données...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`color${metric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="time" 
              stroke="#64748b" 
              fontSize={12}
              interval={period === '30d' ? 'preserveStartEnd' : 'auto'}
            />
            <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--tooltip-bg, #ffffff)', 
                border: '1px solid var(--tooltip-border, #e2e8f0)',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                color: 'var(--tooltip-text, #1e293b)'
              }}
              formatter={(value) => `${value.toFixed(1)}%`}
              labelStyle={{ color: 'var(--tooltip-text, #1e293b)' }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              strokeWidth={2}
              fill={`url(#color${metric})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default HistoryChart;
