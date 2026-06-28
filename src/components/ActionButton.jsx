import { Loader2, CheckCircle } from 'lucide-react';

const accentMap = {
  emerald: 'hover:border-emerald-500/50 hover:bg-emerald-500/10',
  blue: 'hover:border-blue-500/50 hover:bg-blue-500/10',
};

export default function ActionButton({
  idleLabel,
  loadingLabel,
  doneLabel,
  Icon,
  accent = 'emerald',
  state,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      disabled={state !== 'idle'}
      className={`w-full py-3 px-4 rounded-xl bg-slate-800/50 border border-slate-700
        ${accentMap[accent] || accentMap.emerald}
        text-slate-200 font-medium transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2.5
        hover:-translate-y-0.5 active:translate-y-0`}
    >
      {state === 'idle' && Icon && <Icon size={18} />}
      {state === 'loading' && <Loader2 size={18} className="animate-spin" />}
      {state === 'done' && <CheckCircle size={18} className="text-emerald-400" />}
      <span>
        {state === 'loading' && loadingLabel}
        {state === 'done' && doneLabel}
        {state === 'idle' && idleLabel}
      </span>
    </button>
  );
}
