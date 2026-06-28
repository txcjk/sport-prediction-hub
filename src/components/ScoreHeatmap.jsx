import React from 'react';

export default function ScoreHeatmap({ heatmap, homeTeam, awayTeam }) {
  if (!heatmap || heatmap.length === 0) return null;

  const goals = ['0', '1', '2', '3', '4', '5+'];

  // Find max percent for normalization
  const maxPercent = Math.max(...heatmap.map((c) => c.percent || 0), 1);

  const getCellStyle = (cell) => {
    if (!cell || cell.count === 0)
      return 'bg-slate-800/30 border-slate-700/30 text-slate-600';
    const intensity = Math.min(cell.percent / maxPercent, 1);
    // Scale from slate-800 (low) → emerald-900 (mid) → emerald-600 (high)
    const sat = Math.round(40 + intensity * 60);
    const lig = Math.round(20 + intensity * 30);
    return `bg-emerald-${Math.round(900 - intensity * 400)}/${Math.round(20 + intensity * 50)} border-emerald-500/${Math.round(intensity * 30)} text-slate-${intensity > 0.5 ? 100 : 300}`;
  };

  const gridStyle =
    'grid grid-cols-7 gap-[2px] sm:gap-[3px] w-full';

  const headerCellStyle =
    'text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center py-2';

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl shadow-black/20 p-5 animate-fade-in-up">
      <div className="mb-4">
        <h3 className="font-semibold text-slate-100 tracking-tight">
          Matrice des Scores Exactes (10 000 simulations)
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          {homeTeam} vs {awayTeam}
        </p>
      </div>

      <div className={gridStyle}>
        {/* Corner */}
        <div className={headerCellStyle}>Away &rarr;<br />Home &darr;</div>
        {/* Away goal headers */}
        {goals.map((g) => (
          <div key={`header-${g}`} className={headerCellStyle}>
            {g}
          </div>
        ))}

        {/* Rows */}
        {goals.map((hLabel, hIdx) => (
          <React.Fragment key={hLabel}>
            {/* Home goal label */}
            <div className="flex items-center justify-center text-[11px] font-semibold text-slate-500">
              {hLabel}
            </div>
            {/* Cells */}
            {goals.map((_, aIdx) => {
              const cell = heatmap.find(
                (c) => c.home === hIdx && c.away === aIdx
              );
              const isTop = cell && cell.percent > 0 && cell.percent >= maxPercent * 0.9;
              const count = cell ? cell.count : 0;

              return (
                <div
                  key={`${hIdx}-${aIdx}`}
                  className={`w-full aspect-square flex flex-col items-center justify-center rounded-lg border text-center text-[11px] font-medium transition-all ${
                    count === 0
                      ? 'bg-slate-800/30 border-slate-700/30 text-slate-600'
                      : ''
                  } ${isTop ? 'ring-2 ring-emerald-400/50' : ''}`}
                  style={
                    count > 0
                      ? {
                          backgroundColor: `rgba(16, 185, 129, ${Math.min(cell.percent / maxPercent, 1) * 0.65})`,
                          borderColor: `rgba(16, 185, 129, ${Math.min(cell.percent / maxPercent, 1) * 0.3})`,
                          color: cell.percent > maxPercent * 0.5 ? '#f1f5f9' : '#94a3b8',
                        }
                      : {}
                  }
                >
                  {count > 0 ? (
                    <>
                      <span className="font-bold leading-tight">
                        {cell.percent.toFixed(1)}%
                      </span>
                      <span className="opacity-70 leading-tight mt-[1px]">
                        {count}
                      </span>
                    </>
                  ) : (
                    <span>&mdash;</span>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-slate-800/50 border border-slate-700/50" />
            <span className="text-[10px] text-slate-500">0</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }} />
            <span className="text-[10px] text-slate-500">Faible</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(16, 185, 129, 0.65)' }} />
            <span className="text-[10px] text-slate-500">&Eacute;lev&eacute;</span>
          </div>
        </div>
        <p className="text-[10px] text-slate-600">
          Buts &agrave; domicile &darr; &middot; Buts &agrave; l&rsquo;ext&eacute;rieur &rarr;
        </p>
      </div>
    </div>
  );
}
