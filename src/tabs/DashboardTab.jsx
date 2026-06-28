import { CalendarDays } from 'lucide-react';
import KpiBanner from '../components/KpiBanner';
import MatchCard from '../components/MatchCard';
import { kpis, todayMatches } from '../data/mockData';

export default function DashboardTab() {
  return (
    <div className="animate-fade-in-up">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Tableau de Bord</h1>
          <p className="text-sm text-slate-400 mt-1">Vue d&apos;ensemble des prédictions du jour</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-xl px-4 py-2.5">
          <CalendarDays size={16} className="text-slate-500" />
          <span>{new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      {/* KPI banner */}
      <div className="mb-8">
        <KpiBanner kpis={kpis} />
      </div>

      {/* Today's matches */}
      <div>
        <h2 className="text-lg font-semibold text-slate-200 mb-4">
          Matchs du jour
          <span className="ml-2 text-sm font-normal text-slate-500">({todayMatches.length} rencontres)</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {todayMatches.map((match, index) => (
            <MatchCard key={match.id} match={match} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
