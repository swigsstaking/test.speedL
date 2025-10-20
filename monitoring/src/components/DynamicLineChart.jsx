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

  // Enrichir les données avec la couleur
  const enrichedData = data.map(point => ({
    ...point,
    color: getColor(point[dataKey])
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={enrichedData}>
        <defs>
          {/* Gradient pour la ligne */}
          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={normalColor} stopOpacity={0.8}/>
            <stop offset="100%" stopColor={normalColor} stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
        <YAxis stroke="#64748b" fontSize={12} domain={yDomain} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#ffffff', 
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
          }}
          formatter={(value) => [`${value.toFixed(1)}${unit}`, dataKey === 'latency' ? 'Latence' : 'Valeur']}
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
        
        {/* Une seule ligne avec couleur dynamique via stroke */}
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={normalColor}
          strokeWidth={2}
          dot={(props) => {
            const { cx, cy, payload } = props;
            const color = getColor(payload[dataKey]);
            return (
              <circle 
                cx={cx} 
                cy={cy} 
                r={3} 
                fill={color}
                stroke={color}
                strokeWidth={2}
              />
            );
          }}
          activeDot={{ r: 6 }}
          isAnimationActive={true}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default DynamicLineChart;
