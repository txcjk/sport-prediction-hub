import { useState, useEffect, useRef, useCallback } from 'react';
import { Database, CheckCircle } from 'lucide-react';
import DropZone from '../components/DropZone';
import FileInfoBar from '../components/FileInfoBar';
import DataPreviewTable from '../components/DataPreviewTable';
import ImportProgress from '../components/ImportProgress';
import { csvPreviewColumns, csvPreviewRows, mockFileInfo } from '../data/mockData';

export default function ImportTab() {
  const [fileLoaded, setFileLoaded] = useState(false);
  const [fileInfo, setFileInfo] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const parseTimerRef = useRef(null);
  const successTimerRef = useRef(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (parseTimerRef.current) clearTimeout(parseTimerRef.current);
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  const handleFileDrop = useCallback(() => {
    if (isParsing || fileLoaded) return;

    setIsParsing(true);

    parseTimerRef.current = setTimeout(() => {
      setIsParsing(false);
      setFileLoaded(true);
      setFileInfo(mockFileInfo);
      setShowSuccess(true);

      successTimerRef.current = setTimeout(() => {
        setShowSuccess(false);
        successTimerRef.current = null;
      }, 800);

      parseTimerRef.current = null;
    }, 1200);
  }, [isParsing, fileLoaded]);

  const handleRemove = useCallback(() => {
    if (parseTimerRef.current) clearTimeout(parseTimerRef.current);
    if (successTimerRef.current) clearTimeout(successTimerRef.current);
    setFileLoaded(false);
    setFileInfo(null);
    setIsParsing(false);
    setShowSuccess(false);
  }, []);

  const handleReset = useCallback(() => {
    // Like remove but allows re-upload
    handleRemove();
  }, [handleRemove]);

  return (
    <div className="animate-fade-in-up">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Import de Données</h1>
          <p className="text-sm text-slate-400 mt-1">
            Importez vos fichiers CSV de matchs pour enrichir la base d&apos;entraînement
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-xl px-4 py-2.5">
          <Database size={16} className="text-slate-500" />
          <span>PostgreSQL • Docker</span>
        </div>
      </div>

      {/* Success flash overlay */}
      {showSuccess && (
        <div className="animate-fade-in-up mb-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle size={20} className="text-emerald-400 shrink-0" />
          <p className="text-sm font-medium text-emerald-300">
            Fichier analysé avec succès — {mockFileInfo.rows} lignes détectées
          </p>
        </div>
      )}

      {/* Drop zone (when no file loaded or parsing) */}
      {!fileLoaded && (
        <div className="mb-6">
          <DropZone
            onFileDrop={handleFileDrop}
            isParsing={isParsing}
            disabled={false}
          />
        </div>
      )}

      {/* File info bar (when loaded) */}
      {fileLoaded && fileInfo && (
        <div className="mb-4">
          <FileInfoBar
            fileInfo={fileInfo}
            onRemove={handleRemove}
            onReset={handleReset}
          />
        </div>
      )}

      {/* Data preview table (when loaded) */}
      {fileLoaded && (
        <div className="mb-4 space-y-4">
          <DataPreviewTable
            columns={csvPreviewColumns}
            rows={csvPreviewRows}
          />
        </div>
      )}

      {/* Import action */}
      {fileLoaded && (
        <ImportProgress fileInfo={fileInfo} />
      )}
    </div>
  );
}
