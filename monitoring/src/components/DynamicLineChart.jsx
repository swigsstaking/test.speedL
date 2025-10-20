import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

/**
 * Graphique avec ligne qui change de couleur selon le seuil
 */
const DynamicLineChart = ({ 
  data, 
  dataKey = 'value',
  warningThreshold = 60,
  dangerThreshold = 80,
  normalColor = '#10b981',
  warningColor = '#f59e0b',
  dangerColor = '#ef4444',
  yDomain = [0, 100],
  unit = '%',
  height = 300
}) => {
  // Fonction pour déterminer la couleur selon la valeur
  const getColor = (value) => {
    if (value >= dangerThreshold) return dangerColor;
    if (value >= warningThreshold) return warningColor;
    return normalColor;
  };

  // Vérifier si on a des données
  if (!data || data.length === 0) {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <div className="flex items-center justify-center h-full text-slate-400">
          Aucune donnée disponible
        </div>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
        <YAxis stroke="#64748b" fontSize={12} domain={yDomain} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#ffffff', 
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
          }}
          formatter={(value) => [`${value?.toFixed(1)}${unit}`, dataKey === 'latency' ? 'Latence' : 'Valeur']}
          labelStyle={{ fontWeight: 'bold' }}
        />
        
        {/* Lignes de référence pour les seuils */}
        <ReferenceLine 
          y={warningThreshold} 
          stroke={warningColor} 
          strokeDasharray="3 3" 
          strokeOpacity={0.3}
          label={{ value: `${warningThreshold}${unit}`, position: 'right', fill: warningColor, fontSize: 10 }}
        />
        <ReferenceLine 
          y={dangerThreshold} 
          stroke={dangerColor} 
          strokeDasharray="3 3" 
          strokeOpacity={0.3}
          label={{ value: `${dangerThreshold}${unit}`, position: 'right', fill: dangerColor, fontSize: 10 }}
        />
        
        {/* Ligne colorée selon les seuils */}
        {data.map((point, index) => {
          if (index === data.length - 1) return null;
          const nextPoint = data[index + 1];
          const value = point[dataKey];
          const color = getColor(value);
          
          return (
            <Line
              key={`segment-${index}`}
              data={[point, nextPoint]}
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={3}
              dot={false}
              isAnimationActive={false}
              connectNulls={true}
            />
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default DynamicLineChart;
