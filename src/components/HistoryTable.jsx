import { Brain } from 'lucide-react';

const statusStyles = {
  won: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30',
  lost: 'bg-red-500/10 text-red-300 border border-red-500/30',
};

const statusLabels = {
  won: 'Gagné',
  lost: 'Perdu',
};

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}

export default function HistoryTable({ history = [] }) {
  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl shadow-black/20 p-5 animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-100 tracking-tight">
          Historique des Prédictions
          <span className="ml-2 text-sm font-normal text-slate-500">({history.length})</span>
        </h3>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <p className="text-lg font-medium">Aucun match trouvé</p>
          <p className="text-sm mt-1">Aucune donnée de backtesting pour la saison et le championnat sélectionnés</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="max-h-[400px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-900 z-10">
                <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-slate-800">
                  <th className="text-left py-3 pr-4 font-medium">Date</th>
                  <th className="text-left py-3 pr-4 font-medium">Match</th>
                  <th className="text-left py-3 pr-4 font-medium">Prédiction IA</th>
                  <th className="text-center py-3 pr-4 font-medium">Résultat</th>
                  <th className="text-right py-3 pr-4 font-medium">Cote</th>
                  <th className="text-center py-3 pr-4 font-medium">Statut</th>
                  <th className="text-right py-3 font-medium">P&amp;L</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row, index) => (
                  <tr
                    key={row.id}
                    className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors"
                    style={{
                      animation: index < 10 ? 'fadeInUp 0.4s ease-out forwards' : 'none',
                      animationDelay: `${80 + index * 40}ms`,
                      opacity: index < 10 ? 0 : 1,
                    }}
                  >
                    <td className="py-3 pr-4 text-slate-400 whitespace-nowrap">{formatDate(row.date)}</td>
                    <td className="py-3 pr-4 text-slate-200 whitespace-nowrap">
                      {row.homeTeam} vs {row.awayTeam}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="inline-flex items-center gap-1.5 text-blue-300">
                        <Brain size={12} />
                        {row.prediction}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-slate-300 text-center whitespace-nowrap">{row.result}</td>
                    <td className="py-3 pr-4 text-slate-400 font-mono text-right">{row.odds.toFixed(2)}</td>
                    <td className="py-3 pr-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[row.status]}`}
                      >
                        {statusLabels[row.status]}
                      </span>
                    </td>
                    <td
                      className={`py-3 text-right font-mono font-semibold whitespace-nowrap ${
                        row.profit >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {row.profit >= 0 ? '+' : ''}€{row.profit.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
