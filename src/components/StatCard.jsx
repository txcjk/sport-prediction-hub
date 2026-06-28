const accentStyles = {
  emerald: {
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
    valueColor: 'text-emerald-300',
  },
  blue: {
    iconBg: 'bg-blue-500/15',
    iconColor: 'text-blue-400',
    valueColor: 'text-blue-300',
  },
  orange: {
    iconBg: 'bg-orange-500/15',
    iconColor: 'text-orange-400',
    valueColor: 'text-orange-300',
  },
  slate: {
    iconBg: 'bg-slate-500/15',
    iconColor: 'text-slate-300',
    valueColor: 'text-slate-200',
  },
};

export default function StatCard({ icon: Icon, label, value, accent = 'slate', delay = 0 }) {
  const styles = accentStyles[accent];

  return (
    <div
      className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl shadow-black/20 p-4 transition-all duration-300 hover:border-slate-700 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
          <p className={`text-xl font-bold tracking-tight mt-1 ${styles.valueColor}`}>{value}</p>
        </div>
        <div className={`${styles.iconBg} p-2 rounded-xl shrink-0`}>
          <Icon size={18} className={styles.iconColor} />
        </div>
      </div>
    </div>
  );
}
