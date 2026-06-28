const statusConfig = {
  online: {
    dot: 'bg-emerald-400',
    ring: 'bg-emerald-400/20',
    label: 'En ligne',
    text: 'text-emerald-400',
    bar: 'bg-emerald-500',
    barWidth: '95%',
  },
  ready: {
    dot: 'bg-amber-400',
    ring: 'bg-amber-400/20',
    label: 'Prêt',
    text: 'text-amber-400',
    bar: 'bg-amber-500',
    barWidth: '70%',
  },
  idle: {
    dot: 'bg-orange-400',
    ring: 'bg-orange-400/20',
    label: 'Inactif',
    text: 'text-orange-400',
    bar: 'bg-orange-500',
    barWidth: '40%',
  },
  offline: {
    dot: 'bg-red-500',
    ring: 'bg-red-500/20',
    label: 'Hors ligne',
    text: 'text-red-500',
    bar: 'bg-red-500',
    barWidth: '10%',
  },
};

export default function ServiceCard({ service, icon: Icon, index = 0 }) {
  const cfg = statusConfig[service.status] || statusConfig.offline;
  const delay = 100 + index * 80;

  return (
    <div
      className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl shadow-black/20 p-5 transition-all duration-300 hover:border-slate-700 hover:bg-slate-900/80 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      {/* Top row: icon + status dot */}
      <div className="flex items-center justify-between mb-4">
        <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
          <Icon size={18} className="text-slate-300" />
        </div>
        <div className="relative flex items-center justify-center w-3 h-3">
          <div className={`absolute inset-0 rounded-full ${cfg.ring} animate-ping`} />
          <div className={`relative w-2 h-2 rounded-full ${cfg.dot}`} />
        </div>
      </div>

      {/* Service name */}
      <h3 className="font-semibold text-slate-100 tracking-tight text-sm mb-1">
        {service.name}
      </h3>

      {/* Status label */}
      <p className={`text-xs font-medium ${cfg.text} mb-2`}>
        {cfg.label}
      </p>

      {/* Detail line */}
      <p className="text-xs text-slate-400 mb-3 min-h-[2.5rem] leading-relaxed">
        {service.detail}
      </p>

      {/* Health bar */}
      <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${cfg.bar} transition-all duration-700`}
          style={{ width: cfg.barWidth }}
        />
      </div>
    </div>
  );
}
