import { AlertTriangle, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';

function formatCapital(v) {
  const abs = Math.abs(v);
  if (abs >= 1000) return (abs / 1000).toFixed(1) + 'k';
  return abs.toFixed(0);
}

function formatChange(v, initial) {
  const diff = v - initial;
  const prefix = diff >= 0 ? '+' : '-';
  const abs = Math.abs(diff);
  const formatted = abs >= 1000 ? (abs / 1000).toFixed(1) + 'k' : abs.toFixed(0);
  return `${prefix}€${formatted}`;
}

function formatAbsolute(v) {
  const formatted = v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v.toFixed(0);
  return `€${formatted}`;
}

const accentMap = {
  emerald: { iconBg: 'bg-emerald-500/15', iconColor: 'text-emerald-400', valueColor: 'text-emerald-300' },
  red: { iconBg: 'bg-red-500/15', iconColor: 'text-red-400', valueColor: 'text-red-400' },
};

export default function MonteCarloStats({ results, initialCapital, numTrajectories }) {
  const { ruinRisk, medianFinal, worstCase, bestCase } = results;

  const isRuinHigh = ruinRisk > 5;
  const isMedianPositive = medianFinal >= initialCapital;

  const cards = [
    {
      icon: AlertTriangle,
      label: 'Risque de Ruine',
      value: `${ruinRisk}%`,
      accent: isRuinHigh ? 'red' : 'emerald',
      border: isRuinHigh ? 'border-red-500/20' : 'border-emerald-500/20',
      detail: 'Capital < 10% initial',
    },
    {
      icon: TrendingUp,
      label: 'Rendement Médian',
      value: formatChange(medianFinal, initialCapital),
      accent: isMedianPositive ? 'emerald' : 'red',
      border: isMedianPositive ? 'border-emerald-500/20' : 'border-red-500/20',
      detail: `Médiane des ${numTrajectories} trajectoires`,
    },
    {
      icon: TrendingDown,
      label: 'Scénario Pire',
      value: formatAbsolute(worstCase),
      accent: 'red',
      border: 'border-red-500/20',
      detail: 'Plus faible bankroll finale',
    },
    {
      icon: Sparkles,
      label: 'Scénario Idéal',
      value: formatAbsolute(bestCase),
      accent: 'emerald',
      border: 'border-emerald-500/20',
      detail: 'Plus haute bankroll finale',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        const styles = accentMap[card.accent];
        return (
          <div
            key={card.label}
            className={`relative bg-slate-900/60 backdrop-blur-xl border ${card.border} rounded-2xl shadow-xl shadow-black/20 p-5 transition-all duration-300 hover:border-slate-700 overflow-hidden animate-fade-in-up`}
            style={{ animationDelay: `${80 + i * 60}ms`, animationFillMode: 'both' }}
          >
            <div className="absolute inset-0 opacity-[0.03] rounded-2xl bg-gradient-to-br from-slate-400 to-transparent" />
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-xs font-medium text-slate-400 tracking-wide uppercase">{card.label}</p>
                <p className={`text-3xl font-bold tracking-tight mt-1 ${styles.valueColor}`}>{card.value}</p>
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
  );
}
