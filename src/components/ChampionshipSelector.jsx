import { Trophy } from 'lucide-react';

const championshipLabelMap = {
  'World Cup': 'Coupe du Monde',
  'WC Qualifiers': 'Qualifs CDM',
  'Euro': 'Euro',
  'All': 'Tous les championnats',
};

export default function ChampionshipSelector({ championships = [], selected, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <Trophy size={16} className="text-slate-500 shrink-0" />
      <div className="flex gap-2">
        {championships.map((championship) => (
          <button
            key={championship}
            onClick={() => onChange(championship)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
              selected === championship
                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:border-slate-600'
            }`}
          >
            {championshipLabelMap[championship] || championship}
          </button>
        ))}
      </div>
    </div>
  );
}
