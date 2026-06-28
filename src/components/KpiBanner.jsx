import { Target, Gauge, BarChart3, TrendingUp } from 'lucide-react';

const accentStyles = {
  emerald: {
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
    valueColor: 'text-emerald-300',
    glow: 'shadow-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  blue: {
    iconBg: 'bg-blue-500/15',
    iconColor: 'text-blue-400',
    valueColor: 'text-blue-300',
    glow: 'shadow-blue-500/10',
    border: 'border-blue-500/20',
  },
  slate: {
    iconBg: 'bg-slate-500/15',
    iconColor: 'text-slate-300',
    valueColor: 'text-slate-200',
    glow: 'shadow-slate-500/10',
    border: 'border-slate-500/20',
  },
};

export default function KpiBanner({ kpis: d }) {
  const items = [
    { key: 'successRate', icon: Target, label: 'Taux de réussite', value: `${d.successRate}%`, accent: 'emerald', subtitle: 'Données CDM 2026' },
    { key: 'brierScore', icon: Gauge, label: 'Brier Score', value: d.brierScore.toFixed(2), accent: 'blue', subtitle: 'Plus bas = meilleur' },
    { key: 'matchesAnalyzed', icon: BarChart3, label: 'Matchs analysés', value: d.matchesAnalyzed.toLocaleString('fr-FR'), accent: 'slate', subtitle: 'Tous championnats' },
    { key: 'monthlyRoi', icon: TrendingUp, label: 'ROI du mois', value: `${d.monthlyRoi}%`, accent: 'emerald', subtitle: 'Performance actuelle' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((kpi) => {
        const Icon = kpi.icon;
        const accent = accentStyles[kpi.accent];

        return (
          <div
            key={kpi.key}
            className={`relative bg-slate-900/60 backdrop-blur-xl border ${accent.border} rounded-2xl shadow-xl ${accent.glow} p-5 transition-all duration-300 hover:border-slate-700 hover:bg-slate-900/80 overflow-hidden`}
          >
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-xs font-medium text-slate-400 tracking-wide uppercase">{kpi.label}</p>
                <p className={`text-3xl font-bold tracking-tight mt-1 ${accent.valueColor}`}>
                  {kpi.value}
                </p>
                <p className="text-xs text-slate-500 mt-1">{kpi.subtitle}</p>
              </div>
              <div className={`${accent.iconBg} p-2.5 rounded-xl shrink-0`}>
                <Icon size={20} className={accent.iconColor} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
