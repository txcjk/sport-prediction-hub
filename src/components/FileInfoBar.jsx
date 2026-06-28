import { FileText, Trash2 } from 'lucide-react';

export default function FileInfoBar({ fileInfo, onRemove, onReset }) {
  if (!fileInfo) return null;

  return (
    <div className="animate-fade-in-up bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl shadow-black/20 p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
          <FileText size={24} className="text-emerald-400" />
        </div>

        {/* Filename */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-200 truncate">
            {fileInfo.filename}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Fichier importé</p>
        </div>

        {/* Stats pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-medium bg-slate-800/80 text-slate-300 rounded-lg border border-slate-700/50">
            {fileInfo.rows} lignes
          </span>
          <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-medium bg-slate-800/80 text-slate-300 rounded-lg border border-slate-700/50">
            {fileInfo.columns} colonnes
          </span>
          <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-medium bg-slate-800/80 text-slate-300 rounded-lg border border-slate-700/50">
            {fileInfo.sizeKb} KB
          </span>
        </div>

        {/* Remove / Change button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-medium text-slate-400 bg-slate-800/60 border border-slate-700/50 rounded-lg hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all duration-200"
          >
            <FileText size={14} />
            <span className="hidden sm:inline">Charger un autre</span>
          </button>
          <button
            onClick={onRemove}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg hover:bg-red-500/20 hover:text-red-300 transition-all duration-200"
            title="Retirer le fichier"
          >
            <Trash2 size={14} />
            <span className="hidden sm:inline">Retirer</span>
          </button>
        </div>
      </div>
    </div>
  );
}
