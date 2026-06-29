import { AlertTriangle, CheckCircle } from 'lucide-react';

/**
 * InjuryAlert — Badge d'alerte blessure/forfait pour une équipe.
 * Rouge pour les blessures, vert pour les retours.
 */
export default function InjuryAlert({ alerts, side }) {
  if (!alerts || alerts.length === 0) return null;

  const teamSide = side === 'homeTeam' ? '🏠' : '✈️';
  const injuryAlerts = alerts.filter(a => a.type === 'injury');
  const returnAlerts = alerts.filter(a => a.type === 'return');

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {injuryAlerts.map((alert, i) => (
        <span
          key={`injury-${i}`}
          className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full
                     bg-red-500/15 text-red-300 border border-red-500/30"
          title={alert.title}
        >
          <AlertTriangle size={10} className="text-red-400" />
          ⚠️ {alert.keywords[0]}
        </span>
      ))}
      {returnAlerts.map((alert, i) => (
        <span
          key={`return-${i}`}
          className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full
                     bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
          title={alert.title}
        >
          <CheckCircle size={10} className="text-emerald-400" />
          ✅ Retour
        </span>
      ))}
    </div>
  );
}
