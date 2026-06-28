import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Target, Ticket } from 'lucide-react';
import SeasonSelector from '../components/SeasonSelector';
import ChampionshipSelector from '../components/ChampionshipSelector';
import StatCard from '../components/StatCard';
import CapitalChart from '../components/CapitalChart';
import HistoryTable from '../components/HistoryTable';
import { backtestHistory, capitalCurve, capitalCurveSeason2 } from '../data/mockData';

const SEASONS = ['2026 Coupe du Monde', '2024-2025 Qualifs CDM'];
const CHAMPIONSHIPS = ['World Cup', 'WC Qualifiers', 'Euro'];

export default function BacktestingTab() {
  const [selectedSeason, setSelectedSeason] = useState('2026 Coupe du Monde');
  const [selectedChampionship, setSelectedChampionship] = useState('World Cup');

  const { filteredHistory, filteredCapital, startCapital, endCapital, stats } = useMemo(() => {
    const fHistory = backtestHistory.filter((m) => {
      const seasonMatch = m.season === selectedSeason;
      const championshipMatch = selectedChampionship === 'All' ? true : m.championship === selectedChampionship;
      return seasonMatch && championshipMatch;
    });

    const isSeasonCDM = selectedSeason === '2026 Coupe du Monde';
    const capitalData = isSeasonCDM ? capitalCurve : capitalCurveSeason2;

    const totalBets = fHistory.length;
    const wonBets = fHistory.filter((m) => m.status === 'won').length;
    const winRate = totalBets > 0 ? (wonBets / totalBets) * 100 : 0;
    const totalProfit = fHistory.reduce((sum, m) => sum + m.profit, 0);

    let peak = capitalData[0]?.capital || 0;
    let maxDrawdown = 0;
    capitalData.forEach((point) => {
      if (point.capital > peak) peak = point.capital;
      const dd = peak - point.capital;
      if (dd > maxDrawdown) maxDrawdown = dd;
    });

    const sCapital = capitalData[0]?.capital || 0;
    const eCapital = capitalData[capitalData.length - 1]?.capital || 0;

    return {
      filteredHistory: fHistory,
      filteredCapital: capitalData,
      startCapital: sCapital,
      endCapital: eCapital,
      stats: { totalProfit, winRate, maxDrawdown, totalBets },
    };
  }, [selectedSeason, selectedChampionship]);

  return (
    <div className="animate-fade-in-up">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Backtesting &amp; Validation</h1>
          <p className="text-sm text-slate-400 mt-1">
            Analyse des performances historiques du modèle XGBoost
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SeasonSelector seasons={SEASONS} selected={selectedSeason} onChange={setSelectedSeason} />
          <ChampionshipSelector championships={CHAMPIONSHIPS} selected={selectedChampionship} onChange={setSelectedChampionship} />
        </div>
      </div>

      {/* Summary stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard
          icon={TrendingUp}
          label="Profit Total"
          value={`€${stats.totalProfit.toFixed(2)}`}
          accent="emerald"
          delay={50}
        />
        <StatCard
          icon={Target}
          label="Taux de Réussite"
          value={`${stats.winRate.toFixed(1)}%`}
          accent="blue"
          delay={100}
        />
        <StatCard
          icon={TrendingDown}
          label="Drawdown Max"
          value={`-€${stats.maxDrawdown.toFixed(2)}`}
          accent="orange"
          delay={150}
        />
        <StatCard
          icon={Ticket}
          label="Paris Placés"
          value={stats.totalBets}
          accent="slate"
          delay={200}
        />
      </div>

      {/* Capital growth chart */}
      <div className="mb-6">
        <CapitalChart
          data={filteredCapital}
          startCapital={startCapital}
          endCapital={endCapital}
          compositeKey={`${selectedSeason}-${selectedChampionship}`}
        />
      </div>

      {/* History table */}
      <HistoryTable history={filteredHistory} />
    </div>
  );
}
