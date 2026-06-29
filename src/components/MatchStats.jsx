/**
 * Composant affichant les stats live enrichies pour un match.
 * Forme (W/D/L), moyenne de buts, etc.
 */
export default function MatchStats({ teamStats, side }) {
  if (!teamStats) return null;

  const formColors = {
    'W': 'text-emerald-400 bg-emerald-500/20',
    'D': 'text-yellow-400 bg-yellow-500/20',
    'L': 'text-red-400 bg-red-500/20',
  };

  return (
    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
      {/* Forme (5 derniers matchs) */}
      {teamStats.form && teamStats.form !== '-' && (
        <div className="flex items-center gap-0.5" title="Forme (5 derniers matchs)">
          {teamStats.form.split('').map((letter, i) => (
            <span
              key={i}
              className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center font-bold text-[8px] leading-none ${
                formColors[letter] || 'text-slate-500 bg-slate-700'
              }`}
            >
              {letter}
            </span>
          ))}
        </div>
      )}

      {/* Win rate */}
      {teamStats.win_rate > 0 && (
        <span className="text-slate-500">
          {teamStats.win_rate}%
        </span>
      )}

      {/* Moyennes buts */}
      {teamStats.avg_goals_scored > 0 && (
        <span className="text-slate-500">
          ⚽ {teamStats.avg_goals_scored}/{teamStats.avg_goals_conceded}
        </span>
      )}
    </div>
  );
}
