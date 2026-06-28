import { useState, useEffect, useRef } from 'react';
import { Database, Loader2, CheckCircle } from 'lucide-react';

export default function ImportProgress({ fileInfo }) {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importDone, setImportDone] = useState(false);
  const intervalRef = useRef(null);
  const resetTimerRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const handleImport = () => {
    if (isImporting || importDone) return;

    setIsImporting(true);
    setImportProgress(0);
    setImportDone(false);

    const stepTime = 40; // ms per step
    const totalSteps = 50; // 50 steps * 40ms = 2000ms total

    let currentStep = 0;

    intervalRef.current = setInterval(() => {
      currentStep += 1;
      const progress = Math.min(Math.round((currentStep / totalSteps) * 100), 100);
      setImportProgress(progress);

      if (currentStep >= totalSteps) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;

        setImportProgress(100);
        setIsImporting(false);
        setImportDone(true);

        // Auto-reset after 3 seconds
        resetTimerRef.current = setTimeout(() => {
          setImportDone(false);
          setImportProgress(0);
          resetTimerRef.current = null;
        }, 3000);
      }
    }, stepTime);
  };

  const rowCount = fileInfo?.rows ?? 72;

  return (
    <div className="animate-fade-in-up">
      {/* Progress bar */}
      {importProgress > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-400">
              {importDone
                ? 'Import terminé'
                : 'Import en cours...'
              }
            </span>
            <span className="text-xs font-mono text-slate-500">
              {importProgress}%
            </span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300 ease-out bg-emerald-400"
              style={{ width: `${importProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Action button */}
      <button
        onClick={handleImport}
        disabled={isImporting || importDone}
        className={`
          w-full sm:w-auto inline-flex items-center justify-center gap-2
          px-6 py-3 text-sm font-semibold rounded-xl
          transition-all duration-200
          ${importDone
            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 cursor-default'
            : isImporting
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300/60 cursor-not-allowed'
              : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/10 cursor-pointer'
          }
        `}
      >
        {importDone ? (
          <>
            <CheckCircle size={18} className="text-emerald-400" />
            {rowCount} lignes importées avec succès
          </>
        ) : isImporting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Import en cours... {importProgress}%
          </>
        ) : (
          <>
            <Database size={18} />
            Lancer l'import en base
          </>
        )}
      </button>
    </div>
  );
}
