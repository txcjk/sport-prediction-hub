import { useState, useEffect, useRef } from 'react';
import { Swords, Loader2, CheckCircle, Target, TrendingUp, BarChart3, Trophy } from 'lucide-react';
import { todayMatches } from '../data/mockData';
import PointsDistributionChart from '../components/PointsDistributionChart';

const KNOCKOUT_MATCHES = todayMatches.slice(0, 16).map(m => ({
  ...m,
  result: m.result ?? null,  // null = match non joué, 'home'|'draw'|'away' = résultat réel
}));

function runKnockoutSim(iterations) {
  const matches = KNOCKOUT_MATCHES;
  const totalMatches = matches.length;

  // Split: known results vs to-simulate
  const knownIndices = [];
  const simIndices = [];
  matches.forEach((m, j) => {
    if (m.result !== null && m.result !== undefined) knownIndices.push(j);
    else simIndices.push(j);
  });

  const simCount = simIndices.length;
  const knownCount = knownIndices.length;

  // Pre-compute: matches with known results — did AI predict correctly?
  const predictedOutcomes = matches.map((m) => {
    const { home, draw, away } = m.aiProbs;
    if (home >= draw && home >= away) return 'home';
    if (draw >= home && draw >= away) return 'draw';
    return 'away';
  });

  let guaranteedScore = 0;
  knownIndices.forEach((j) => {
    if (matches[j].result === predictedOutcomes[j]) guaranteedScore++;
  });

  // Sim only remaining matches
  const matchProbs = matches.map((m) => {
    const { home, draw, away } = m.aiProbs;
    const total = home + draw + away;
    return { home: home / total, draw: draw / total, away: away / total };
  });

  // Distribution: counts for 0...totalMatches correct
  const distribution = new Array(totalMatches + 1).fill(0);
  const matchCorrectCounts = new Array(totalMatches).fill(0);

  for (let i = 0; i < iterations; i++) {
    let correct = guaranteedScore;

    // Count known results
    knownIndices.forEach((j) => {
      if (matches[j].result === predictedOutcomes[j]) matchCorrectCounts[j]++;
    });

    // Simulate remaining
    for (let si = 0; si < simCount; si++) {
      const j = simIndices[si];
      const p = matchProbs[j];
      const roll = Math.random();
      let outcome;
      if (roll < p.home) outcome = 'home';
      else if (roll < p.home + p.draw) outcome = 'draw';
      else outcome = 'away';

      if (outcome === predictedOutcomes[j]) {
        correct++;
        matchCorrectCounts[j]++;
      }
    }

    distribution[correct]++;
  }

  // Adjust: known matches always counted in distribution
  // Already handled by starting `correct` at guaranteedScore

  // Stats
  const perfectCount = distribution[totalMatches];
  const perfectProb = perfectCount / iterations;
  const perfectOneIn = perfectCount > 0 ? Math.round(iterations / perfectCount) : Infinity;

  let expectedSum = 0;
  for (let k = 0; k <= totalMatches; k++) {
    expectedSum += k * (distribution[k] / iterations);
  }
  const expectedScore = Math.round(expectedSum * 10) / 10;

  let cumulative = 0;
  let medianScore = 0;
  for (let k = 0; k <= totalMatches; k++) {
    cumulative += distribution[k];
    if (cumulative >= iterations / 2) { medianScore = k; break; }
  }

  let top10Cumulative = 0;
  let top10Score = totalMatches;
  for (let k = totalMatches; k >= 0; k--) {
    top10Cumulative += distribution[k];
    if (top10Cumulative >= iterations * 0.1) { top10Score = k; break; }
  }

  const matchAccuracy = matches.map((_m, j) => ({
    ...matches[j],
    predictedOutcome: predictedOutcomes[j],
    simAccuracy: simIndices.includes(j)
      ? matchCorrectCounts[j] / iterations
      : (matches[j].result === predictedOutcomes[j] ? 1 : 0),
    isSimulated: simIndices.includes(j),
  }));

  return {
    distribution,
    perfectProb,
    perfectOneIn,
    expectedScore,
    medianScore,
    top10Score,
    matchAccuracy,
    guaranteedScore,
    knownCount,
    simCount,
    totalMatches,
    iterations,
  };
}

function formatPerfect(oneIn) {
  if (oneIn === Infinity || oneIn > 1000000) return '1 sur 1 000 000+';
  return '1 sur ' + oneIn.toLocaleString('fr-FR');
}

const outcomeConfig = {
  home: {
    label: 'Victoire domicile',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    short: '1',
  },
  draw: {
    label: 'Match Nul',
    badgeClass: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    short: 'N',
  },
  away: {
    label: 'Victoire extérieur',
    badgeClass: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
    short: '2',
  },
};

export default function KnockoutSimTab() {
  const [simState, setSimState] = useState('idle');
  const [results, setResults] = useState(null);

  const doneTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (doneTimerRef.current) clearTimeout(doneTimerRef.current);
    };
  }, []);

  const handleRun = async () => {
    if (simState !== 'idle') return;
    if (doneTimerRef.current) clearTimeout(doneTimerRef.current);

    setSimState('loading');
    setResults(null);

    // Small delay so loading state is visible
    await new Promise((r) => setTimeout(r, 300));

    const res = runKnockoutSim(10000);

    setResults(res);
    setSimState('done');
    doneTimerRef.current = setTimeout(() => setSimState('idle'), 2000);
  };

  const buttonDisabled = simState !== 'idle';

  const statsCards = results
    ? [
        {
          icon: Target,
          label: 'Score Garanti',
          value: `${results.guaranteedScore} / ${results.totalMatches}`,
          detail: `${results.knownCount} résultats connus`,
          accent: results.guaranteedScore > 0 ? 'emerald' : 'slate',
        },
        {
          icon: BarChart3,
          label: 'Score Attendu',
          value: `${results.expectedScore} / ${results.totalMatches}`,
          detail: `Moyenne sur ${results.iterations.toLocaleString('fr-FR')} sims`,
          accent: 'blue',
        },
        {
          icon: TrendingUp,
          label: 'Score Médian',
          value: `${results.medianScore} / ${results.totalMatches}`,
          detail: '50% font mieux',
          accent: 'amber',
        },
        {
          icon: Trophy,
          label: 'Perfect (16/16)',
          value: formatPerfect(results.perfectOneIn),
          detail: `Probabilité: ${(results.perfectProb * 100).toFixed(3)}%`,
          accent: results.perfectProb > 0.001 ? 'emerald' : 'purple',
        },
      ]
    : [];

  const accentStyles = {
    emerald: { iconBg: 'bg-emerald-500/15', iconColor: 'text-emerald-400', border: 'border-emerald-500/20', valueColor: 'text-emerald-300' },
    blue: { iconBg: 'bg-blue-500/15', iconColor: 'text-blue-400', border: 'border-blue-500/20', valueColor: 'text-blue-300' },
    amber: { iconBg: 'bg-amber-500/15', iconColor: 'text-amber-400', border: 'border-amber-500/20', valueColor: 'text-amber-300' },
    purple: { iconBg: 'bg-purple-500/15', iconColor: 'text-purple-400', border: 'border-purple-500/20', valueColor: 'text-purple-300' },
    slate: { iconBg: 'bg-slate-500/15', iconColor: 'text-slate-300', border: 'border-slate-500/20', valueColor: 'text-slate-200' },
  };

  return (
    <div className="animate-fade-in-up">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            ⚔️ Simulation des Phases Finales
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Pronostics optimisés pour Mon Petit Prono — 16 matchs des 1/16 de finale
          </p>
        </div>
      </div>

      {/* Config card */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl shadow-black/20 p-5 mb-6">
        <div>
          <p className="text-sm text-slate-300 font-medium">
            {results ? `${results.knownCount} résultats connus · ${results.simCount} à simuler` : '16 matchs · 10 000 simulations'}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {results
              ? `${results.knownCount} match${results.knownCount > 1 ? 's' : ''} joué${results.knownCount > 1 ? 's' : ''} · ${results.simCount} simulé${results.simCount > 1 ? 's' : ''}`
              : 'Simulation parallélisée de tous les matchs des 1/16 de finale'}
          </p>
        </div>
        <button
          onClick={handleRun}
          disabled={buttonDisabled}
          className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto justify-center"
        >
          {simState === 'loading' && (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Simulation en cours...</span>
            </>
          )}
          {simState === 'done' && (
            <>
              <CheckCircle size={18} />
              <span>Terminé</span>
            </>
          )}
          {simState === 'idle' && (
            <>
              <Swords size={18} />
              <span>Lancer 10 000 Simulations des 16 matchs</span>
            </>
          )}
        </button>
      </div>

      {/* Results section */}
      {results ? (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statsCards.map((card, i) => {
              const Icon = card.icon;
              const styles = accentStyles[card.accent];
              return (
                <div
                  key={card.label}
                  className={`relative bg-slate-900/60 backdrop-blur-xl border ${styles.border} rounded-2xl shadow-xl shadow-black/20 p-5 transition-all duration-300 hover:border-slate-700 overflow-hidden animate-fade-in-up`}
                  style={{ animationDelay: `${80 + i * 60}ms`, animationFillMode: 'both' }}
                >
                  <div className="absolute inset-0 opacity-[0.03] rounded-2xl bg-gradient-to-br from-slate-400 to-transparent" />
                  <div className="flex items-start justify-between relative z-10">
                    <div>
                      <p className="text-xs font-medium text-slate-400 tracking-wide uppercase">{card.label}</p>
                      <p className={`text-2xl font-bold tracking-tight mt-1 ${styles.valueColor}`}>{card.value}</p>
                      <p className="text-xs text-slate-500 mt-1">{card.detail}</p>
                    </div>
                    <div className={`${styles.iconBg} p-2.5 rounded-xl shrink-0`}>
                      <Icon size={20} className={styles.iconColor} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Distribution chart */}
          <div className="mb-6">
            <PointsDistributionChart
              distribution={results.distribution}
              totalSims={results.iterations}
              medianScore={results.medianScore}
              expectedScore={results.expectedScore}
            />
          </div>
        </>
      ) : simState === 'idle' && (
        /* Empty state before simulation */
        <div className="text-center py-12 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl shadow-black/20 mb-6">
          <Swords size={48} className="mx-auto mb-4 text-slate-600" />
          <p className="text-lg font-medium text-slate-400">
            Lancez la simulation pour voir les résultats
          </p>
          <p className="text-sm mt-1 text-slate-500">
            Analyse probabiliste des 16 matchs des 1/16 de finale de la Coupe du Monde 2026
          </p>
        </div>
      )}

      {/* Match grid (always visible) */}
      <div>
        <h2 className="text-lg font-semibold text-slate-200 mb-4">
          Matchs des 1/16 de Finale
          <span className="ml-2 text-sm font-normal text-slate-500">({KNOCKOUT_MATCHES.length} rencontres)</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {KNOCKOUT_MATCHES.map((match, idx) => {
            const { home, draw, away } = match.aiProbs;
            const predictedOutcome = results?.matchAccuracy?.[idx]?.predictedOutcome;
            const simAccuracy = results?.matchAccuracy?.[idx]?.simAccuracy;
            const isSimulated = results?.matchAccuracy?.[idx]?.isSimulated ?? true;
            const actualResult = match.result;
            const hasResult = actualResult !== null && actualResult !== undefined;
            const isCorrect = hasResult && actualResult === predictedOutcome;
            const outcome = predictedOutcome
              ? outcomeConfig[predictedOutcome]
              : null;

            return (
              <div
                key={match.id}
                className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-xl shadow-xl shadow-black/20 p-3.5 animate-fade-in-up"
                style={{ animationDelay: `${idx * 40}ms`, animationFillMode: 'both' }}
              >
                <p className="text-[10px] text-slate-500 mb-1.5 truncate">{match.league}</p>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-sm font-medium text-slate-200 truncate">{match.homeTeam.name}</span>
                  <span className="text-[10px] text-slate-500 shrink-0">{home}%</span>
                </div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-sm font-medium text-slate-200 truncate">{match.awayTeam.name}</span>
                  <span className="text-[10px] text-slate-500 shrink-0">{away}%</span>
                </div>

                {/* Footer with result/sim status */}
                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  {/* Known result */}
                  {hasResult && (
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${
                      isCorrect
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : 'bg-red-500/15 text-red-300 border-red-500/30'
                    }`}>
                      {isCorrect ? '✅ ' : '❌ '}
                      {match.prediction}
                    </span>
                  )}
                  {/* Not yet played */}
                  {!hasResult && outcome && (
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${outcome.badgeClass}`}>
                      {match.prediction}
                    </span>
                  )}
                  {!hasResult && !outcome && (
                    <span className="text-[11px] text-slate-500">Prédit: {match.prediction}</span>
                  )}

                  {/* Accuracy / status */}
                  {simAccuracy !== undefined && (
                    <span className={`text-[11px] font-medium shrink-0 ${
                      hasResult
                        ? (isCorrect ? 'text-emerald-400' : 'text-red-400')
                        : 'text-slate-400'
                    }`}>
                      {hasResult
                        ? (isCorrect ? 'Correct' : 'Incorrect')
                        : `${(simAccuracy * 100).toFixed(0)}% sim.`}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
