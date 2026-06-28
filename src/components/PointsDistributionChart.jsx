import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-xl px-4 py-3 shadow-xl shadow-black/30 text-sm">
      <p className="text-slate-400 text-xs mb-1">{label} prédiction{label !== '1' ? 's' : ''} correcte{label !== '1' ? 's' : ''}</p>
      <p className="font-semibold text-slate-200">
        Fréquence: <span className="text-emerald-400">{payload[0].value.toLocaleString('fr-FR')}</span>
      </p>
    </div>
  );
}

export default function PointsDistributionChart({ distribution, totalSims, medianScore, expectedScore }) {
  const chartData = distribution.map((count, i) => ({
    score: String(i),
    count,
  }));

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl shadow-black/20 p-5 animate-fade-in-up">
      <div className="mb-4">
        <h3 className="font-semibold text-slate-100 tracking-tight">
          Distribution des Scores (10 000 simulations)
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Répartition des prédictions correctes sur {totalSims.toLocaleString('fr-FR')} simulations
        </p>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="score"
            stroke="#475569"
            tick={{ fontSize: 11 }}
            label={{
              value: 'Prédictions correctes',
              position: 'insideBottom',
              offset: -5,
              style: { fill: '#64748b', fontSize: 11 },
            }}
          />
          <YAxis
            stroke="#475569"
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v)}
          />
          <Tooltip content={<CustomTooltip />} />
          <defs>
            <linearGradient id="ptsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
          <Bar
            dataKey="count"
            fill="url(#ptsGradient)"
            radius={[3, 3, 0, 0]}
            maxBarSize={40}
          />
          <ReferenceLine
            x={String(medianScore)}
            stroke="#f59e0b"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            label={{
              value: 'Médiane',
              position: 'top',
              fill: '#f59e0b',
              fontSize: 10,
            }}
          />
          <ReferenceLine
            x={String(Math.round(expectedScore))}
            stroke="#60a5fa"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            label={{
              value: 'Moyenne',
              position: 'top',
              fill: '#60a5fa',
              fontSize: 10,
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
