import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const entry = payload[0].payload;

  return (
    <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-xl px-4 py-3 shadow-xl shadow-black/30 text-sm">
      <p className="text-slate-400 text-xs mb-1">
        Score {entry.home}-{entry.away}
      </p>
      <p className="font-semibold text-slate-200">
        Probabilit&eacute;:{' '}
        <span className="text-emerald-400">{entry.percent.toFixed(1)}%</span>
      </p>
      <p className="text-xs text-slate-500 mt-0.5">
        {entry.count} occurrences
      </p>
    </div>
  );
}

export default function ScoreBarChart({ top5 }) {
  if (!top5 || top5.length === 0) return null;

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl shadow-black/20 p-5 animate-fade-in-up">
      <div className="mb-4">
        <h3 className="font-semibold text-slate-100 tracking-tight">
          Top 5 Scores les Plus Probables
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Class&eacute;s par fr&eacute;quence d&rsquo;apparition sur 10 000 simulations
        </p>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={top5}
          layout="vertical"
          margin={{ left: 20, right: 30, top: 5, bottom: 5 }}
        >
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#1e293b"
            horizontal={false}
          />
          <XAxis
            type="number"
            stroke="#475569"
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => v + '%'}
            axisLine={{ stroke: '#334155' }}
            tickLine={false}
            dy={6}
          />
          <YAxis
            type="category"
            dataKey="label"
            stroke="#475569"
            tick={{ fontSize: 12, fill: '#94a3b8' }}
            width={45}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b' }} />
          <Bar
            dataKey="percent"
            fill="url(#scoreGradient)"
            radius={[0, 4, 4, 0]}
            barSize={28}
            label={{
              position: 'right',
              fill: '#94a3b8',
              fontSize: 11,
              formatter: (v) => v.toFixed(1) + '%',
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
