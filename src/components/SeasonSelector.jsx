import { Calendar } from 'lucide-react';

export default function SeasonSelector({ seasons = [], selected, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <Calendar size={16} className="text-slate-500 shrink-0" />
      <div className="flex gap-2">
        {seasons.map((season) => (
          <button
            key={season}
            onClick={() => onChange(season)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
              selected === season
                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:border-slate-600'
            }`}
          >
            {season}
          </button>
        ))}
      </div>
    </div>
  );
}
