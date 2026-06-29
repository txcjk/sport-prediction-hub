import { useState, useRef, useEffect } from 'react';
import { Target, Loader2, CheckCircle, Sparkles, CloudSun } from 'lucide-react';
import { todayMatches } from '../data/mockData';
import { enrichWithLiveStats } from '../hooks/useLiveData';
import ScoreHeatmap from '../components/ScoreHeatmap';
import ScoreBarChart from '../components/ScoreBarChart';
import MppAdvice from '../components/MppAdvice';

function poissonRandom(lambda) {
  if (lambda <= 0) return 0;
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  return k - 1;
}

function runSimulation(homeProb, drawProb, awayProb, iterations, goalAdjustment = 0) {
  // Ajuster le nombre total de buts attendus en fonction de la météo
  // Base: 2.5 buts en conditions normales
  // Pluie/orage: -20% à -30%
  const baseGoals = 2.5;
  const adjustedGoals = Math.max(1.0, baseGoals + (goalAdjustment / 100) * baseGoals);
  const totalExpectedGoals = adjustedGoals;

  const lambdaHome = (totalExpectedGoals * (homeProb + drawProb / 2)) / 100;
  const lambdaAway = (totalExpectedGoals * (awayProb + drawProb / 2)) / 100;

  const scoreCounts = {};
  let totalSims = 0;

  for (let i = 0; i < iterations; i++) {
    const goalsHome = poissonRandom(lambdaHome);
    const goalsAway = poissonRandom(lambdaAway);
    const key = `${goalsHome}-${goalsAway}`;
    scoreCounts[key] = (scoreCounts[key] || 0) + 1;
    totalSims++;
  }

  // Build heatmap 0-5+ (6x6 grid)
  const heatmap = [];
  for (let h = 0; h <= 5; h++) {
    for (let a = 0; a <= 5; a++) {
      const hLabel = h === 5 ? '5+' : String(h);
      const aLabel = a === 5 ? '5+' : String(a);
      let count = 0;
      if (h < 5 && a < 5) {
        count = scoreCounts[`${h}-${a}`] || 0;
      } else if (h === 5 && a < 5) {
        for (let hh = 5; hh <= 20; hh++) count += scoreCounts[`${hh}-${a}`] || 0;
      } else if (h < 5 && a === 5) {
        for (let aa = 5; aa <= 20; aa++) count += scoreCounts[`${h}-${aa}`] || 0;
      } else {
        for (let hh = 5; hh <= 20; hh++)
          for (let aa = 5; aa <= 20; aa++)
            count += scoreCounts[`${hh}-${aa}`] || 0;
      }
      heatmap.push({
        h: hLabel,
        a: aLabel,
        home: h,
        away: a,
        percent: (count / totalSims) * 100,
        count,
      });
    }
  }

  // Top 5 scores
  const top5 = Object.entries(scoreCounts)
    .map(([key, count]) => {
      const [h, a] = key.split('-').map(Number);
      return {
        home: h,
        away: a,
        label: `${h}-${a}`,
        count,
        percent: (count / totalSims) * 100,
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Advice
  const best = top5[0];
  const advice = best
    ? `Le score optimal à tenter pour ta ligue est le ${best.label} (${best.percent.toFixed(1)}%), car il offre le meilleur ratio probabilité/prise de risque avec ${best.count} occurrences sur ${totalSims} simulations.`
    : '';

  return { top5, heatmap, advice, totalSims };
}

export default function MppTab() {
  const enriched = enrichWithLiveStats(todayMatches);
  const [selectedMatchId, setSelectedMatchId] = useState(enriched[0]?.id || 1);
  const [probs, setProbs] = useState({ home: 42, draw: 27, away: 31 });
  const [simState, setSimState] = useState('idle');
  const [results, setResults] = useState(null);

  const doneTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (doneTimerRef.current) clearTimeout(doneTimerRef.current);
    };
  }, []);

  const currentMatch = enriched.find((m) => m.id === selectedMatchId);

  // Météo et ajustement pour le match courant
  const weather = currentMatch?.homeTeam?.weather;
  const adjustment = weather?.goal_impact || 0;
  const homeStats = currentMatch?.homeTeam?.liveStats;
  const awayStats = currentMatch?.awayTeam?.liveStats;

  const handleMatchChange = (id) => {
    const match = enriched.find((m) => m.id === Number(id));
    if (match) {
      setSelectedMatchId(match.id);
      // Utiliser les aiProbs du match, ajustées par la météo/forme
      const baseProbs = { ...match.aiProbs };
      // Ajustement fin basé sur la forme si dispo
      const hStats = match.homeTeam?.liveStats;
      const aStats = match.awayTeam?.liveStats;
      if (hStats?.win_rate && aStats?.win_rate && hStats?.win_rate + aStats?.win_rate > 0) {
        const ratio = hStats.win_rate / (hStats.win_rate + aStats.win_rate);
        baseProbs.home = Math.round(baseProbs.home * (0.7 + 0.3 * ratio));
        baseProbs.away = Math.round(baseProbs.away * (0.7 + 0.3 * (1 - ratio)));
        baseProbs.draw = 100 - baseProbs.home - baseProbs.away;
      }
      setProbs(baseProbs);
      setResults(null);
      setSimState('idle');
    }
  };

  const handleProbChange = (key, value) => {
    const num = Math.max(0, Math.min(100, parseInt(value) || 0));
    const newProbs = { ...probs, [key]: num };
    // Auto-adjust to sum ~100 by normalizing
    const sum = newProbs.home + newProbs.draw + newProbs.away;
    if (sum > 0 && sum !== 100) {
      const factor = 100 / sum;
      newProbs.home = Math.round(newProbs.home * factor);
      newProbs.draw = Math.round(newProbs.draw * factor);
      newProbs.away = 100 - newProbs.home - newProbs.draw;
    }
    setProbs(newProbs);
  };

  const handleRun = async () => {
    if (simState !== 'idle') return;
    if (doneTimerRef.current) clearTimeout(doneTimerRef.current);

    setSimState('loading');
    setResults(null);

    // Short artificial delay so spinner is visible
    await new Promise((r) => setTimeout(r, 400));

    const res = runSimulation(probs.home, probs.draw, probs.away, 10000, adjustment);

    setResults(res);
    setSimState('done');
    doneTimerRef.current = setTimeout(() => setSimState('idle'), 2000);
  };

  const inputClass =
    'bg-slate-800 border-slate-700 rounded-lg px-2 py-1.5 text-slate-200 w-16 text-center text-sm';
  const labelClass = 'text-xs font-medium uppercase tracking-wider mb-1 block';

  const buttonDisabled = simState !== 'idle';

  return (
    <div className="animate-fade-in-up">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Simulateur Monte-Carlo (Sp&eacute;cial MPP)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Simulation de 10 000 scores exacts via loi de Poisson pour optimiser tes pronostics Mon Petit Prono
          </p>
        </div>
      </div>

      {/* Top bar: match selector + prob inputs + button */}
      <div className="flex flex-wrap items-end gap-4 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl shadow-black/20 p-5 mb-6">
        {/* Match selector */}
        <div className="flex-1 min-w-[200px]">
          <label className={labelClass}>Match</label>
          <select
            value={selectedMatchId}
            onChange={(e) => handleMatchChange(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50"
          >
            {todayMatches.map((m) => (
              <option key={m.id} value={m.id}>
                {m.homeTeam.name} vs {m.awayTeam.name}
              </option>
            ))}
          </select>
        </div>

        {/* Prob inputs */}
        <div className="flex gap-3 items-end">
          <div>
            <label className={`${labelClass} text-emerald-400`}>1</label>
            <input
              type="number"
              min={0}
              max={100}
              value={probs.home}
              onChange={(e) => handleProbChange('home', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={`${labelClass} text-blue-400`}>N</label>
            <input
              type="number"
              min={0}
              max={100}
              value={probs.draw}
              onChange={(e) => handleProbChange('draw', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={`${labelClass} text-orange-400`}>2</label>
            <input
              type="number"
              min={0}
              max={100}
              value={probs.away}
              onChange={(e) => handleProbChange('away', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {/* Infos météo + forme */}
        <div className="flex flex-col gap-1 text-[10px] text-slate-500">
          {weather?.label && (
            <span className="flex items-center gap-1">
              <CloudSun size={12} className="text-slate-400" />
              {weather.label} · {adjustment}% buts
            </span>
          )}
          {homeStats?.form && (
            <span className="flex items-center gap-1">
              <span className="font-mono text-[9px]">{homeStats.form}</span>
              vs
              <span className="font-mono text-[9px]">{awayStats?.form || '-'}</span>
              <span className="text-slate-600">(forme)</span>
            </span>
          )}
        </div>

        {/* Run button */}
        <button
          onClick={handleRun}
          disabled={buttonDisabled}
          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
        >
          {simState === 'loading' && (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Simulation en cours...</span>
            </>
          )}
          {simState === 'done' && (
            <>
              <CheckCircle size={16} />
              <span>Termin&eacute;</span>
            </>
          )}
          {simState === 'idle' && (
            <>
              <Sparkles size={16} />
              <span>Lancer 10 000 Simulations de Monte-Carlo</span>
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {results ? (
        <>
          {/* Heatmap + BarChart side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ScoreHeatmap
              heatmap={results.heatmap}
              homeTeam={currentMatch?.homeTeam?.name || ''}
              awayTeam={currentMatch?.awayTeam?.name || ''}
            />
            <ScoreBarChart top5={results.top5} />
          </div>

          {/* MPP Advice */}
          <MppAdvice
            advice={results.advice}
            bestScore={results.top5[0]?.label}
            bestPercent={results.top5[0]?.percent}
          />
        </>
      ) : (
        /* Empty state */
        <div className="text-center py-20 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl shadow-black/20">
          <Target size={56} className="mx-auto mb-4 text-slate-600" />
          <p className="text-lg font-medium text-slate-400">
            S&eacute;lectionne un match et lance la simulation
          </p>
          <p className="text-sm mt-1 text-slate-500 max-w-md mx-auto">
            L&rsquo;algorithme Monte-Carlo simulera 10 000 r&eacute;sultats &agrave; partir des probabilit&eacute;s
            pour trouver les scores exactes les plus probables.
          </p>
        </div>
      )}
    </div>
  );
}
