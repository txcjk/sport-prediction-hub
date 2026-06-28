import { useState, useEffect, useRef } from 'react';
import {
  Database,
  Server,
  BrainCircuit,
  Workflow,
  Download,
  RefreshCw,
  Activity,
  Cpu,
  HardDrive,
  Clock,
} from 'lucide-react';
import ServiceCard from '../components/ServiceCard';
import ActivityFeed from '../components/ActivityFeed';
import ActionButton from '../components/ActionButton';
import { pipelineServices, pipelineLogs as initialLogs } from '../data/mockData';
import { api } from '../services/api';

const serviceIcons = {
  db: Database,
  api: Server,
  xgb: BrainCircuit,
  n8n: Workflow,
};

const healthStats = [
  { id: 'uptime', label: 'Uptime', value: '99.8%', icon: Activity, accent: 'emerald', barWidth: '99%' },
  { id: 'cpu', label: 'CPU', value: '34%', icon: Cpu, accent: 'blue', barWidth: '34%' },
  { id: 'memory', label: 'Mémoire', value: '2.1 GB / 4 GB', icon: HardDrive, accent: 'slate', barWidth: '53%' },
  { id: 'sync', label: 'Dernier sync', value: 'Il y a 12 min', icon: Clock, accent: 'slate', barWidth: null },
];

const healthAccentMap = {
  emerald: { text: 'text-emerald-300', bar: 'bg-emerald-500' },
  blue: { text: 'text-blue-300', bar: 'bg-blue-500' },
  slate: { text: 'text-slate-300', bar: 'bg-slate-500' },
};

function HealthBar({ width }) {
  if (!width) return null;
  return (
    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-1.5">
      <div
        className={`h-full rounded-full bg-slate-500 transition-all duration-700`}
        style={{ width }}
      />
    </div>
  );
}

export default function PipelineTab() {
  const [logs, setLogs] = useState(initialLogs);
  const [extractState, setExtractState] = useState('idle');
  const [trainState, setTrainState] = useState('idle');

  const extractTimerRef = useRef(null);
  const extractResetRef = useRef(null);
  const trainResetRef = useRef(null);

  useEffect(() => {
    return () => {
      if (extractTimerRef.current) clearTimeout(extractTimerRef.current);
      if (extractResetRef.current) clearTimeout(extractResetRef.current);
      if (trainResetRef.current) clearTimeout(trainResetRef.current);
    };
  }, []);

  const handleExtract = async () => {
    if (extractState !== 'idle') return;
    setExtractState('loading');

    try {
      const result = await api.triggerExtract();
      setExtractState('done');
      setLogs((prev) => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
          type: 'success',
          message: `Extraction manuelle déclenchée — Job #${result.job_id || 'N/A'}`,
        },
        ...prev,
      ]);
      extractResetRef.current = setTimeout(() => setExtractState('idle'), 3000);
    } catch (err) {
      setExtractState('idle');
      setLogs((prev) => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
          type: 'warning',
          message: `Échec extraction: ${err.message} — Mode simulé`,
        },
        ...prev,
      ]);
    }
  };

  const handleTrain = async () => {
    if (trainState !== 'idle') return;
    setTrainState('loading');

    try {
      const result = await api.triggerRetrain();
      setTrainState('done');
      setLogs((prev) => [
        {
          id: Date.now() + 1,
          time: new Date().toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
          type: 'success',
          message: `Ré-entraînement XGBoost déclenché — Job #${result.job_id || 'N/A'}`,
        },
        ...prev,
      ]);
      trainResetRef.current = setTimeout(() => setTrainState('idle'), 3000);
    } catch (err) {
      setTrainState('idle');
      setLogs((prev) => [
        {
          id: Date.now() + 1,
          time: new Date().toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
          type: 'warning',
          message: `Échec entraînement: ${err.message} — Mode simulé`,
        },
        ...prev,
      ]);
    }
  };

  return (
    <div className="animate-fade-in-up">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Pipeline</h1>
          <p className="text-sm text-slate-400 mt-1">
            Surveillance des services et actions manuelles
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-xl px-4 py-2.5">
          <Activity size={16} className="text-slate-500" />
          <span>Statut du pipeline</span>
        </div>
      </div>

      {/* System health mini-dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {healthStats.map((stat, i) => {
          const StatIcon = stat.icon;
          const accent = healthAccentMap[stat.accent] || healthAccentMap.slate;
          const delay = 80 + i * 60;

          return (
            <div
              key={stat.id}
              className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-xl shadow-xl shadow-black/20 p-3.5 transition-all duration-300 hover:border-slate-700 animate-fade-in-up"
              style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                  {stat.label}
                </span>
                <StatIcon size={12} className="text-slate-500" />
              </div>
              <p className={`text-sm font-semibold ${accent.text}`}>
                {stat.value}
              </p>
              <HealthBar width={stat.barWidth} />
            </div>
          );
        })}
      </div>

      {/* Service cards */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">
          Services
          <span className="ml-2 text-sm font-normal text-slate-500">
            ({pipelineServices.length} services)
          </span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {pipelineServices.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              icon={serviceIcons[service.id]}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* Activity feed + Action buttons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity feed — takes 2/3 on desktop */}
        <div className="lg:col-span-2">
          <ActivityFeed logs={logs} />
        </div>

        {/* Action buttons — takes 1/3 on desktop */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl shadow-black/20 p-5 animate-fade-in-up">
          <h3 className="font-semibold text-slate-100 tracking-tight mb-4">
            Actions Manuelles
          </h3>
          <div className="flex flex-col gap-3">
            <ActionButton
              idleLabel="Lancer l'extraction manuelle"
              loadingLabel="Extraction en cours..."
              doneLabel="Terminé"
              Icon={Download}
              accent="emerald"
              state={extractState}
              onClick={handleExtract}
            />
            <ActionButton
              idleLabel="Ré-entraîner le modèle XGBoost"
              loadingLabel="Entraînement en cours..."
              doneLabel="Terminé"
              Icon={RefreshCw}
              accent="blue"
              state={trainState}
              onClick={handleTrain}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
