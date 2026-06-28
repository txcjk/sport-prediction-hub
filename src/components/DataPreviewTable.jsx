export default function DataPreviewTable({ columns, rows }) {
  if (!columns || !rows) return null;

  const getFtrPill = (value) => {
    const base = 'inline-flex items-center px-2 py-0.5 text-[11px] font-bold rounded-md';
    if (value === 'H') {
      return `${base} bg-emerald-500/15 text-emerald-300 border border-emerald-500/20`;
    }
    if (value === 'D') {
      return `${base} bg-slate-500/15 text-slate-300 border border-slate-500/20`;
    }
    if (value === 'A') {
      return `${base} bg-orange-500/15 text-orange-300 border border-orange-500/20`;
    }
    return `${base} bg-slate-800/60 text-slate-400`;
  };

  const numericColumns = ['FTHG', 'FTAG', 'B365H', 'B365D', 'B365A'];

  return (
    <div className="animate-fade-in-up bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl shadow-black/20 p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-100 tracking-tight">Aperçu des Données</h3>
          <p className="text-xs text-slate-500 mt-0.5">10 premières lignes</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-4 sm:-mx-5">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-slate-800">
              {columns.map((col, i) => (
                <th key={i} className="px-3 py-3 text-left font-medium first:pl-5 last:pr-5">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors animate-fade-in-up"
                style={{ animationDelay: `${rowIdx * 60}ms`, animationFillMode: 'both' }}
              >
                {row.map((cell, cellIdx) => {
                  const colName = columns[cellIdx];
                  const isNumeric = numericColumns.includes(colName);
                  const isFtr = colName === 'FTR';
                  const isDate = colName === 'Date';
                  const isTeam = colName === 'HomeTeam' || colName === 'AwayTeam';

                  let cellClass = 'px-3 py-2.5 whitespace-nowrap first:pl-5 last:pr-5';
                  if (isNumeric) cellClass += ' font-mono text-slate-300 text-right';
                  else if (isDate) cellClass += ' text-slate-400';
                  else if (isTeam) cellClass += ' text-slate-200 font-medium';
                  else cellClass += ' text-slate-300';

                  return (
                    <td key={cellIdx} className={cellClass}>
                      {isFtr ? (
                        <span className={getFtrPill(cell)}>{cell}</span>
                      ) : (
                        cell
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
