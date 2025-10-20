import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

/**
 * Graphique avec ligne qui change de couleur selon le seuil
 * @param {Array} data - Données du graphique
 * @param {string} dataKey - Clé des données
 * @param {number} warningThreshold - Seuil d'avertissement (orange)
 * @param {number} dangerThreshold - Seuil de danger (rouge)
 * @param {string} normalColor - Couleur normale (par défaut vert)
 * @param {string} warningColor - Couleur avertissement (par défaut orange)
 * @param {string} dangerColor - Couleur danger (par défaut rouge)
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
  // Créer des segments avec couleurs différentes
  const segments = [];
  
  for (let i = 0; i < data.length - 1; i++) {
    const current = data[i];
    const next = data[i + 1];
    const value = current[dataKey];
    
    let color = normalColor;
    if (value >= dangerThreshold) {
      color = dangerColor;
    } else if (value >= warningThreshold) {
      color = warningColor;
    }
    
    segments.push({
      data: [current, next],
      color
    });
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
          formatter={(value) => `${value.toFixed(1)}${unit}`}
        />
        
        {/* Lignes de référence pour les seuils */}
        <ReferenceLine 
          y={warningThreshold} 
          stroke={warningColor} 
          strokeDasharray="3 3" 
          strokeOpacity={0.3}
        />
        <ReferenceLine 
          y={dangerThreshold} 
          stroke={dangerColor} 
          strokeDasharray="3 3" 
          strokeOpacity={0.3}
        />
        
        {/* Dessiner chaque segment avec sa couleur */}
        {segments.map((segment, index) => (
          <Line
            key={index}
            data={segment.data}
            type="monotone"
            dataKey={dataKey}
            stroke={segment.color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default DynamicLineChart;
