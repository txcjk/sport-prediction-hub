import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  const medianPoint = payload.find((p) => p.dataKey === 'median');

  return (
    <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-xl px-4 py-3 shadow-xl shadow-black/30 text-sm">
      <p className="text-slate-400 text-xs mb-1">Paris #{label}</p>
      {medianPoint && (
        <p className="font-semibold text-slate-200">
          Médiane: <span className="text-cyan-400">€{medianPoint.value.toFixed(2)}</span>
        </p>
      )}
    </div>
  );
}

export default function MonteCarloChart({ trajectories, medianTrajectory, stepCount, numBets }) {
  const sampledTrajectories = trajectories.slice(0, 30);
  const initialCapital = trajectories[0]?.[0] || 0;

  // Build chart-friendly data: one object per step with t0..t29 + median keys
  const chartData = [];
  for (let step = 0; step < stepCount; step++) {
    const point = { step };
    sampledTrajectories.forEach((traj, i) => {
      point[`t${i}`] = traj[step];
    });
    point.median = medianTrajectory[step];
    chartData.push(point);
  }

  // Label each trajectory as winning (final >= initial) or losing
  const winningStatus = sampledTrajectories.map(
    (traj) => traj[traj.length - 1] >= initialCapital,
  );

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl shadow-black/20 p-5 animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-100 tracking-tight">
            Trajectoires de Bankroll (30 simulations + médiane)
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Capital initial:{' '}
            <span className="text-emerald-400 font-medium">€{initialCapital.toFixed(0)}</span>
            {' · '}
            {numBets} paris · {trajectories.length} trajectoires
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} vertical={false} />
          <XAxis
            dataKey="step"
            stroke="#475569"
            tick={{ fontSize: 11 }}
            axisLine={{ stroke: '#334155' }}
            tickLine={false}
            dy={8}
            label={{
              value: 'Paris',
              position: 'insideBottomRight',
              offset: -10,
              style: { fill: '#475569', fontSize: 11 },
            }}
          />
          <YAxis
            stroke="#475569"
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            dx={-4}
            tickFormatter={(v) => (v >= 1000 ? (v / 1000).toFixed(1) + 'k€' : v + '€')}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Initial capital reference line */}
          <ReferenceLine
            y={initialCapital}
            stroke="#475569"
            strokeDasharray="4 4"
            strokeWidth={1}
          />

          {/* 30 trajectory lines — winning = emerald, losing = red */}
          {winningStatus.map((isWin, i) => (
            <Line
              key={`t${i}`}
              type="monotone"
              dataKey={`t${i}`}
              stroke={isWin ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.10)'}
              strokeWidth={1}
              dot={false}
              isAnimationActive
              animationDuration={1000}
            />
          ))}

          {/* Median trajectory — cyan / blue electric */}
          <Line
            type="monotone"
            dataKey="median"
            stroke="#38bdf8"
            strokeWidth={2.5}
            dot={false}
            isAnimationActive
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
