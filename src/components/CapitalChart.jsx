import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-xl px-4 py-3 shadow-xl shadow-black/30 text-sm">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <p className="font-semibold text-slate-200">
        Capital: <span className="text-emerald-400">€{payload[0].value.toFixed(2)}</span>
      </p>
    </div>
  );
}

export default function CapitalChart({ data = [], startCapital = 0, endCapital = 0, compositeKey = '' }) {
  return (
    <div
      key={compositeKey}
      className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl shadow-black/20 p-5 animate-fade-in-up"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-100 tracking-tight">Croissance du Capital (Backtesting)</h3>
          <p className="text-xs text-slate-500 mt-1">
            Capital initial: <span className="text-emerald-400 font-medium">€{startCapital.toFixed(2)}</span>
            {' · '}
            Capital final: <span className="text-emerald-400 font-medium">€{endCapital.toFixed(2)}</span>
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <defs>
            <linearGradient id="capitalGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} vertical={false} />
          <XAxis
            dataKey="day"
            stroke="#475569"
            tick={{ fontSize: 11 }}
            axisLine={{ stroke: '#334155' }}
            tickLine={false}
            dy={8}
          />
          <YAxis
            stroke="#475569"
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            dx={-4}
            tickFormatter={(v) => `${v}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="capital"
            stroke="#34d399"
            strokeWidth={2.5}
            fill="url(#capitalGradient)"
            dot={false}
            activeDot={{ r: 5, stroke: '#34d399', strokeWidth: 2, fill: '#0f172a' }}
            isAnimationActive
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
