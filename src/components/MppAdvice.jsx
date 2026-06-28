import { Target, Sparkles } from 'lucide-react';

export default function MppAdvice({ advice, bestScore, bestPercent }) {
  if (!advice) {
    return (
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-2xl shadow-xl shadow-black/20 p-6 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-800/50 text-slate-500">
            <Target size={20} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">
              Lancez une simulation pour obtenir un conseil
            </p>
            <p className="text-xs text-slate-600 mt-0.5">
              Le conseil MPP appara&icirc;tra automatiquement apr&egrave;s l&rsquo;analyse
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-emerald-500/5 border border-emerald-500/20 border-l-emerald-400 border-l-4 rounded-2xl shadow-xl shadow-black/20 p-6 animate-fade-in-up relative overflow-hidden">
      {/* Decorative icon top-right */}
      <div className="absolute top-3 right-3 p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
        <Target size={20} />
      </div>

      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
          <Sparkles size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-slate-100 tracking-tight text-base">
            Conseil MPP
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Pour maximiser tes chances sur Mon Petit Prono
          </p>
        </div>
      </div>

      <p className="text-sm text-slate-200 leading-relaxed mb-4">
        {advice}
      </p>

      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
          <Target size={12} />
          Score optimal
        </span>
        <span className="text-xs text-slate-500">
          {bestPercent.toFixed(1)}% de probabilit&eacute;
        </span>
      </div>
    </div>
  );
}
