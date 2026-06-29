import { CalendarDays, CloudSun, AlertTriangle } from 'lucide-react';
import KpiBanner from '../components/KpiBanner';
import MatchCard from '../components/MatchCard';
import WeatherBadge from '../components/WeatherBadge';
import { kpis, todayMatches } from '../data/mockData';
import { useLiveData, enrichWithLiveStats } from '../hooks/useLiveData';

export default function DashboardTab() {
  const { data: liveData } = useLiveData();
  const enriched = enrichWithLiveStats(todayMatches);

  // Météo du jour — prendre le premier match non-finish avec météo dispo
  const todayWeather = liveData?.matches?.find(m => !m.finished && m.weather)?.weather;

  // Compter les matchs du jour avec alertes
  const alertCount = enriched.filter(m => m.homeTeam?.liveStats?.alerts || m.awayTeam?.liveStats?.alerts).length;

  return (
    <div className="animate-fade-in-up">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Tableau de Bord</h1>
          <p className="text-sm text-slate-400 mt-1">Vue d&apos;ensemble des prédictions du jour</p>
        </div>
        <div className="flex items-center gap-3">
          {todayWeather && (
            <WeatherBadge weather={todayWeather} />
          )}
          <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-xl px-4 py-2.5">
            <CalendarDays size={16} className="text-slate-500" />
            <span>{new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* KPI banner */}
      <div className="mb-8">
        <KpiBanner kpis={kpis} />
      </div>

      {/* Alerte météo globale si conditions extrêmes */}
      {todayWeather && (todayWeather.label?.includes('Orage') || todayWeather.goal_impact < -15) && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
          <CloudSun size={18} className="text-amber-400 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-200">
              Conditions météo difficiles
            </p>
            <p className="text-xs text-amber-400/70">
              {todayWeather.goal_impact}% de buts attendus · avantage terrain renforcé
            </p>
          </div>
        </div>
      )}

      {/* Alerte blessures globale */}
      {alertCount > 0 && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
          <AlertTriangle size={18} className="text-red-400 shrink-0" />
          <p className="text-sm text-red-200">
            ⚠️ {alertCount} match{alertCount > 1 ? 's' : ''} avec signal{alertCount > 1 ? 's' : ''} blessure/forfait détecté{alertCount > 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Today's matches */}
      <div>
        <h2 className="text-lg font-semibold text-slate-200 mb-4">
          Matchs du jour
          <span className="ml-2 text-sm font-normal text-slate-500">({enriched.length} rencontres)</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {enriched.map((match, index) => (
            <MatchCard key={match.id} match={match} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
