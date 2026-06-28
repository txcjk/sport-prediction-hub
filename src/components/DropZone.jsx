import { useState, useRef, useCallback } from 'react';
import { Upload, Loader2, FileUp } from 'lucide-react';

export default function DropZone({ onFileDrop, isParsing, disabled }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled) return;
    onFileDrop();
  }, [disabled, onFileDrop]);

  const handleClick = () => {
    if (disabled || isParsing) return;
    inputRef.current?.click();
  };

  const handleFileChange = () => {
    if (disabled || isParsing) return;
    onFileDrop();
    // Reset input so the same file can be selected again
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFileChange}
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-2xl min-h-[200px] sm:min-h-[240px]
          flex flex-col items-center justify-center gap-3 cursor-pointer
          transition-all duration-300 select-none
          ${isDragOver
            ? 'border-emerald-400 bg-emerald-500/10 scale-[1.02]'
            : disabled
              ? 'border-slate-700/50 bg-slate-900/20 cursor-default'
              : 'border-slate-700 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-900/60'
          }
        `}
      >
        {isParsing ? (
          <>
            <div className="w-16 h-16 rounded-full bg-blue-500/15 flex items-center justify-center">
              <Loader2 size={32} className="text-blue-400 animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-300">Analyse du fichier en cours...</p>
              <p className="text-xs text-slate-500 mt-1">Veuillez patienter</p>
            </div>
          </>
        ) : (
          <>
            <div className={`
              w-16 h-16 rounded-full flex items-center justify-center
              transition-all duration-300
              ${isDragOver
                ? 'bg-emerald-500/20 scale-110'
                : 'bg-slate-800/60'
              }
            `}>
              <Upload size={32} className={`
                transition-all duration-300
                ${isDragOver ? 'text-emerald-400' : 'text-slate-400'}
              `} />
            </div>
            <div className="text-center">
              <p className={`
                text-sm font-semibold transition-colors duration-300
                ${isDragOver ? 'text-emerald-300' : 'text-slate-300'}
              `}>
                Glissez votre fichier CSV ici
              </p>
              <p className="text-xs text-slate-500 mt-1.5">
                ou cliquez pour parcourir
              </p>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <FileUp size={12} className="text-slate-600" />
              <span className="text-[10px] text-slate-600">Format .csv accepté</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
