import './VatChart.css';

/**
 * VatChart — Gráfico simples de barras em SVG mostrando histórico de saldo de VATs.
 */
const VatChart = ({ history = [] }) => {
  if (history.length === 0) {
    return (
      <div className="vat-chart-empty">
        <p className="text-muted text-sm">Nenhuma transação registrada ainda.</p>
      </div>
    );
  }

  // Calcular saldo cumulativo
  const dataPoints = [];
  let tempBalance = 0;
  for (const entry of history) {
    const b = entry.balance !== undefined ? entry.balance : (
      entry.type === 'credit' ? tempBalance + entry.amount : tempBalance - entry.amount
    );
    tempBalance = b;
    dataPoints.push({ ...entry, balance: b });
  }

  const maxBalance = Math.max(...dataPoints.map((d) => d.balance), 1);
  const chartWidth = 600;
  const chartHeight = 200;
  const barWidth = Math.min(40, (chartWidth - 40) / dataPoints.length - 4);
  const padding = 40;

  return (
    <div className="vat-chart">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`} className="vat-chart-svg">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = chartHeight - ratio * (chartHeight - padding) + 10;
          return (
            <g key={ratio}>
              <line
                x1={padding}
                y1={y}
                x2={chartWidth - 10}
                y2={y}
                stroke="var(--color-border)"
                strokeDasharray="4"
              />
              <text
                x={padding - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill="var(--color-text-muted)"
              >
                {Math.round(maxBalance * ratio)}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {dataPoints.map((point, i) => {
          const barHeight = (point.balance / maxBalance) * (chartHeight - padding);
          const x = padding + i * ((chartWidth - padding - 10) / dataPoints.length) + 4;
          const y = chartHeight - barHeight + 10;

          return (
            <g key={point.id || i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="4"
                fill={point.type === 'credit' ? 'var(--color-success)' : 'var(--color-error)'}
                opacity="0.8"
              >
                <title>{`${point.description}: ${point.type === 'credit' ? '+' : '-'}${point.amount} VATs (Saldo: ${point.balance})`}</title>
              </rect>
              <text
                x={x + barWidth / 2}
                y={chartHeight + 25}
                textAnchor="middle"
                fontSize="9"
                fill="var(--color-text-muted)"
              >
                {point.type === 'credit' ? '+' : '-'}{point.amount}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default VatChart;
