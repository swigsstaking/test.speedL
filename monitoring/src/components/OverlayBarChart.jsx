import { useMemo } from 'react';

/**
 * Graphique à barres avec superposition
 * Barres projection (rayées) en fond, barres réelles (pleines) par-dessus
 */
const OverlayBarChart = ({ data, height = 300 }) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    // Calculer min/max pour échelle Y
    const allValues = data.flatMap(d => [
      d['Revenus (Projection)'] || 0,
      d['Revenus (Payé)'] || 0,
      d['Coûts'] || 0,
      d['Profit (Projection)'] || 0,
      d['Profit (Réel)'] || 0
    ]);
    const maxValue = Math.max(...allValues, 0);
    const minValue = Math.min(...allValues, 0);
    const range = maxValue - minValue;
    const yMax = maxValue + range * 0.1;
    const yMin = minValue - range * 0.1;

    return { yMax, yMin, range: yMax - yMin };
  }, [data]);

  if (!chartData || !data) return null;

  const width = 900;
  const padding = { top: 20, right: 40, bottom: 60, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  const barGroupWidth = chartWidth / data.length;
  const barWidth = barGroupWidth / 6; // 5 barres + espace
  const { yMax, yMin } = chartData;

  // Fonction pour convertir valeur en coordonnée Y
  const getY = (value) => {
    const ratio = (value - yMin) / (yMax - yMin);
    return chartHeight - (ratio * chartHeight);
  };

  // Fonction pour dessiner une barre
  const drawBar = (x, value, fill, pattern = null, stroke = null) => {
    if (value === 0) return null;
    
    const y = getY(Math.max(value, 0));
    const barHeight = Math.abs(getY(value) - getY(0));
    const actualY = value >= 0 ? y : getY(0);

    return (
      <rect
        x={x}
        y={actualY}
        width={barWidth}
        height={barHeight}
        fill={pattern || fill}
        stroke={stroke}
        strokeWidth={stroke ? 2 : 0}
        strokeDasharray={stroke ? "4 4" : "0"}
        rx={4}
        ry={4}
      />
    );
  };

  return (
    <div className="w-full overflow-x-auto">
      <svg width={width} height={height} className="mx-auto">
        <defs>
          {/* Pattern rayures vertes */}
          <pattern id="greenStripes" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#10b981" strokeWidth="3" />
          </pattern>
          {/* Pattern rayures bleues */}
          <pattern id="blueStripes" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#3b82f6" strokeWidth="3" />
          </pattern>
        </defs>

        <g transform={`translate(${padding.left}, ${padding.top})`}>
          {/* Grille */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = chartHeight * (1 - ratio);
            const value = yMin + (yMax - yMin) * ratio;
            return (
              <g key={ratio}>
                <line
                  x1={0}
                  y1={y}
                  x2={chartWidth}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="3 3"
                />
                <text
                  x={-10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="12"
                  fill="#64748b"
                >
                  {value.toFixed(0)}
                </text>
              </g>
            );
          })}

          {/* Axe X */}
          <line x1={0} y1={getY(0)} x2={chartWidth} y2={getY(0)} stroke="#64748b" strokeWidth={2} />

          {/* Barres pour chaque mois */}
          {data.map((item, index) => {
            const groupX = index * barGroupWidth + barGroupWidth * 0.1;

            return (
              <g key={index}>
                {/* GROUPE 1: Revenus - SUPERPOSÉES */}
                <g>
                  {/* Projection (rayée) - EN FOND */}
                  {drawBar(groupX, item['Revenus (Projection)'], 'url(#greenStripes)')}
                  {/* Payé (plein) - PAR-DESSUS */}
                  {drawBar(groupX, item['Revenus (Payé)'], '#10b981')}
                </g>

                {/* GROUPE 2: Coûts */}
                {drawBar(groupX + barWidth * 1.5, item['Coûts'], '#ef4444')}

                {/* GROUPE 3: Profit - SUPERPOSÉES */}
                <g>
                  {/* Projection (rayée) - EN FOND */}
                  {drawBar(groupX + barWidth * 3, item['Profit (Projection)'], 'url(#blueStripes)')}
                  {/* Réel (plein) - PAR-DESSUS */}
                  {drawBar(groupX + barWidth * 3, item['Profit (Réel)'], '#3b82f6')}
                </g>

                {/* Label mois */}
                <text
                  x={groupX + barWidth * 2}
                  y={chartHeight + 20}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#64748b"
                >
                  {item.name}
                </text>
              </g>
            );
          })}
        </g>

        {/* Légende */}
        <g transform={`translate(${width / 2 - 200}, ${height - 20})`}>
          <rect x={0} y={0} width={15} height={15} fill="url(#greenStripes)" rx={2} />
          <text x={20} y={12} fontSize="12" fill="#64748b">Revenus Projection</text>

          <rect x={140} y={0} width={15} height={15} fill="#10b981" rx={2} />
          <text x={160} y={12} fontSize="12" fill="#64748b">Revenus Payé</text>

          <rect x={260} y={0} width={15} height={15} fill="#ef4444" rx={2} />
          <text x={280} y={12} fontSize="12" fill="#64748b">Coûts</text>
        </g>
      </svg>
    </div>
  );
};

export default OverlayBarChart;
