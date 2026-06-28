import { useState, useEffect, useRef } from 'react';
import { Dices, Loader2, CheckCircle } from 'lucide-react';
import { kpis } from '../data/mockData';
import MonteCarloChart from '../components/MonteCarloChart';
import MonteCarloStats from '../components/MonteCarloStats';

function runSimulation(capital, numBets, stakePercent, numTrajectories, successRate, avgOdds) {
  const trajectories = [];
  const stepCount = numBets + 1;

  for (let t = 0; t < numTrajectories; t++) {
    const trajectory = [capital];
    let currentCapital = capital;

    for (let step = 1; step < stepCount; step++) {
      const stake = currentCapital * (stakePercent / 100);
      const roll = Math.random();
      const won = roll < successRate / 100;

      if (won) {
        currentCapital += stake * (avgOdds - 1);
      } else {
        currentCapital -= stake;
      }

      if (currentCapital < 0) currentCapital = 0;
      trajectory.push(currentCapital);
    }

    trajectories.push(trajectory);
  }

  // Median trajectory (mean per step across all trajectories)
  const medianTrajectory = [];
  for (let step = 0; step < stepCount; step++) {
    let sum = 0;
    for (let t = 0; t < numTrajectories; t++) {
      sum += trajectories[t][step];
    }
    medianTrajectory.push(sum / numTrajectories);
  }

  // Risk KPIs
  const ruinThreshold = capital * 0.1;
  let ruinCount = 0;
  const finalValues = [];

  for (let t = 0; t < numTrajectories; t++) {
    const final = trajectories[t][stepCount - 1];
    finalValues.push(final);
    for (let step = 0; step < stepCount; step++) {
      if (trajectories[t][step] < ruinThreshold) {
        ruinCount++;
        break;
      }
    }
  }

  finalValues.sort((a, b) => a - b);
  const ruinRisk = (ruinCount / numTrajectories) * 100;
  const medianFinal = finalValues[Math.floor(numTrajectories / 2)];
  const worstCase = finalValues[0];
  const bestCase = finalValues[numTrajectories - 1];

  return {
    trajectories,
    medianTrajectory,
    ruinRisk: Math.round(ruinRisk * 10) / 10,
    medianFinal: Math.round(medianFinal * 100) / 100,
    worstCase: Math.round(worstCase * 100) / 100,
    bestCase: Math.round(bestCase * 100) / 100,
    stepCount,
  };
}

const TRAJECTORY_OPTIONS = [100, 500, 1000];
const EMPTY_STAT_LABELS = ['Risque de Ruine', 'Rendement Médian', 'Scénario Pire', 'Scénario Idéal'];

export default function MonteCarloTab() {
  const [config, setConfig] = useState({
    capital: 1000,
    numBets: 100,
    stakePercent: 3,
    numTrajectories: 500,
  });
  const [simState, setSimState] = useState('idle');
  const [results, setResults] = useState(null);

  const doneTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (doneTimerRef.current) clearTimeout(doneTimerRef.current);
    };
  }, []);

  const updateConfig = (key, value) => {
    setConfig((c) => ({ ...c, [key]: value }));
  };

  const handleRun = async () => {
    if (simState !== 'idle') return;
    if (doneTimerRef.current) clearTimeout(doneTimerRef.current);

    setSimState('loading');
    setResults(null);

    // Artificial delay so UX feels intentional even if computation is instant
    await new Promise((r) => setTimeout(r, 800));

    const res = runSimulation(
      config.capital,
      config.numBets,
      config.stakePercent,
      config.numTrajectories,
      kpis.successRate,
      kpis.avgOdds,
    );

    setResults(res);
    setSimState('done');
    doneTimerRef.current = setTimeout(() => setSimState('idle'), 2000);
  };

  const inputClass = 'bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 w-28 text-sm';
  const labelClass = 'text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 block';

  return (
    <div className="animate-fade-in-up">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Simulation Monte-Carlo</h1>
          <p className="text-sm text-slate-400 mt-1">
            Analyse probabiliste de la bankroll à long terme basée sur les performances du modèle XGBoost
          </p>
        </div>
      </div>

      {/* Config panel */}
      <div className="flex flex-wrap items-end gap-4 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl shadow-black/20 p-5 mb-6">
        {/* Capital Initial */}
        <div>
          <label className={labelClass}>Capital Initial</label>
          <input
            type="number"
            value={config.capital}
            onChange={(e) => updateConfig('capital', Math.max(100, parseInt(e.target.value) || 0))}
            min={100}
            step={100}
            className={inputClass}
          />
        </div>

        {/* Nb Paris */}
        <div>
          <label className={labelClass}>Nb Paris</label>
          <input
            type="number"
            value={config.numBets}
            onChange={(e) =>
              updateConfig('numBets', Math.max(10, Math.min(500, parseInt(e.target.value) || 0)))
            }
            min={10}
            max={500}
            step={10}
            className={inputClass}
          />
        </div>

        {/* Mise % — range slider */}
        <div>
          <label className={labelClass}>Mise %</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={1}
              max={10}
              step={0.5}
              value={config.stakePercent}
              onChange={(e) => updateConfig('stakePercent', parseFloat(e.target.value))}
              className="w-24 accent-emerald-500"
            />
            <span className="text-sm text-slate-300 font-medium w-10">
              {config.stakePercent.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Trajectoires — pill buttons */}
        <div>
          <label className={labelClass}>Trajectoires</label>
          <div className="flex gap-1.5">
            {TRAJECTORY_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => updateConfig('numTrajectories', opt)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  config.numTrajectories === opt
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                    : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:border-slate-600'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Lancer la Simulation button */}
        <button
          onClick={handleRun}
          disabled={simState !== 'idle'}
          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
        >
          {simState === 'loading' && <Loader2 size={16} className="animate-spin" />}
          {simState === 'done' && <CheckCircle size={16} />}
          <span>
            {simState === 'idle' && 'Lancer la Simulation'}
            {simState === 'loading' && 'Simulation en cours...'}
            {simState === 'done' && 'Terminé'}
          </span>
        </button>
      </div>

      {/* Results */}
      {results ? (
        <>
          {/* KPI cards */}
          <div className="mb-6">
            <MonteCarloStats
              results={results}
              initialCapital={config.capital}
              numTrajectories={config.numTrajectories}
            />
          </div>

          {/* Chart */}
          <MonteCarloChart
            trajectories={results.trajectories}
            medianTrajectory={results.medianTrajectory}
            stepCount={results.stepCount}
            numBets={config.numBets}
          />
        </>
      ) : (
        <>
          {/* Empty KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {EMPTY_STAT_LABELS.map((label, i) => (
              <div
                key={label}
                className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl shadow-black/20 p-5 animate-fade-in-up"
                style={{ animationDelay: `${80 + i * 60}ms`, animationFillMode: 'both' }}
              >
                <p className="text-xs font-medium text-slate-400 tracking-wide uppercase">{label}</p>
                <p className="text-3xl font-bold tracking-tight mt-1 text-slate-600">—</p>
              </div>
            ))}
          </div>

          {/* Empty chart state */}
          <div className="text-center py-16 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl shadow-black/20">
            <Dices size={48} className="mx-auto mb-4 text-slate-600" />
            <p className="text-lg font-medium text-slate-400">Aucune simulation lancée</p>
            <p className="text-sm mt-1 text-slate-500">Configurez les paramètres et lancez la simulation</p>
          </div>
        </>
      )}
    </div>
  );
}
