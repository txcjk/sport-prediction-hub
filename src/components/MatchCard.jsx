import { Brain, Zap } from 'lucide-react';
import ProbabilityBar from './ProbabilityBar';
import MatchStats from './MatchStats';
import { enrichWithLiveStats } from '../hooks/useLiveData';

function TeamBadge({ team, liveStats }) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-lg shrink-0"
          style={{ backgroundColor: team.logoColor }}
        >
          {team.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
        </div>
        <span className="font-semibold text-slate-200 text-sm">{team.name}</span>
      </div>
      <MatchStats teamStats={liveStats} />
    </div>
  );
}

function formatKickoff(isoDate) {
  const d = new Date(isoDate);
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export default function MatchCard({ match, index = 0 }) {
  const delay = 100 + (index || 0) * 80;
  const enriched = enrichWithLiveStats([match])[0];

  return (
    <div
      className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl shadow-black/20 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-slate-700 hover:bg-slate-900/80 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{match.league}</span>
        <span className="text-xs text-slate-400">{formatKickoff(match.date)}</span>
      </div>

      {/* Teams */}
      <div className="space-y-3 mb-4">
        <TeamBadge team={match.homeTeam} liveStats={enriched?.homeTeam?.liveStats} />
        <div className="flex items-center gap-3 ml-1">
          <div className="w-px h-6 bg-slate-700 ml-[19px]" />
          <span className="text-xs font-bold text-slate-500 tracking-widest">VS</span>
        </div>
        <TeamBadge team={match.awayTeam} liveStats={enriched?.awayTeam?.liveStats} />
      </div>

      {/* Odds */}
      <div className="flex gap-2 mb-4">
        {[
          { label: '1', value: match.odds.home.toFixed(2) },
          { label: 'N', value: match.odds.draw.toFixed(2) },
          { label: '2', value: match.odds.away.toFixed(2) },
        ].map((odd) => (
          <div key={odd.label} className="flex-1 bg-slate-800/60 rounded-lg py-2 px-3 text-center border border-slate-700/50">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">{odd.label}</span>
            <span className="text-sm font-mono font-semibold text-slate-200">{odd.value}</span>
          </div>
        ))}
      </div>

      {/* AI Probabilities */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Brain size={14} className="text-blue-400" />
          <span className="text-xs font-semibold text-slate-300">Probabilités IA</span>
        </div>
        <div className="space-y-1.5">
          <ProbabilityBar label="Dom" value={match.aiProbs.home} colorClass="bg-emerald-400" />
          <ProbabilityBar label="Nul" value={match.aiProbs.draw} colorClass="bg-blue-400" />
          <ProbabilityBar label="Ext" value={match.aiProbs.away} colorClass="bg-orange-400" />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800">
        <div>
          <span className="text-xs text-slate-400">Prédiction: </span>
          <span className="text-sm font-semibold text-slate-200">{match.prediction}</span>
        </div>
        <div className="flex items-center gap-2">
          {match.valueBet && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-gradient-to-r from-emerald-500/20 to-emerald-400/10 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-500/10">
              <Zap size={10} className="animate-pulse" />
              Value Bet
            </span>
          )}
          {/* Confidence dots */}
          <div className="flex items-center gap-1" title={`Confiance: ${match.confidence}%`}>
            {[1, 2, 3, 4, 5].map((dot) => (
              <div
                key={dot}
                className={`w-1.5 h-1.5 rounded-full ${
                  match.confidence >= dot * 20 ? 'bg-emerald-400' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
