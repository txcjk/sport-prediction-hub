import { CheckCircle, Info, AlertTriangle } from 'lucide-react';

const typeConfig = {
  success: { icon: CheckCircle, color: 'text-emerald-400' },
  info: { icon: Info, color: 'text-blue-400' },
  warning: { icon: AlertTriangle, color: 'text-orange-400' },
};

export default function ActivityFeed({ logs }) {
  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl shadow-black/20 p-5 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-100 tracking-tight">
          Journal d&apos;Activité
        </h3>
        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1">
          <span className="relative flex w-2 h-2">
            <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping" />
            <span className="relative rounded-full bg-emerald-400 w-2 h-2" />
          </span>
          <span className="text-[10px] font-semibold text-emerald-400 tracking-wider">LIVE</span>
        </div>
      </div>

      {/* Log entries */}
      <div className="max-h-[300px] overflow-y-auto space-y-0.5 pr-1 scrollbar-thin">
        {logs.map((log, i) => {
          const TypeIcon = typeConfig[log.type]?.icon || Info;
          const iconColor = typeConfig[log.type]?.color || 'text-slate-400';
          const delay = Math.min(i * 60, 400);

          return (
            <div
              key={log.id}
              className="flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-slate-800/40 transition-colors duration-150 animate-fade-in-up"
              style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
            >
              <span className="text-xs font-mono text-slate-500 shrink-0 w-16 pt-0.5">
                {log.time}
              </span>
              <TypeIcon size={14} className={`${iconColor} shrink-0 mt-0.5`} />
              <span className="text-sm text-slate-300 leading-relaxed">
                {log.message}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
