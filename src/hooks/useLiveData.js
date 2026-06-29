import { useState, useEffect } from 'react';
import liveData from '../data/liveData.json';

/**
 * Hook qui fournit les données live depuis le fichier généré par feed-data.py.
 * Remplace/étend les données mock quand le fichier est présent.
 */
export function useLiveData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      // Vérifie si le fichier contient des données valides
      if (liveData && liveData.matches && liveData.matches.length > 0) {
        setData(liveData);
      } else {
        setError('Aucune donnée live disponible');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error };
}

/**
 * Enrichit les matchs du dashboard avec les stats live des équipes.
 * @param {Array} matches - Les matchs du mockData ou d'ailleurs
 * @returns {Array} - Les matchs enrichis avec les stats live
 */
export function enrichWithLiveStats(matches) {
  if (!liveData || !liveData.matches) return matches;

  // Construire un map équipe_id → stats depuis liveData
  const teamStats = {};
  for (const match of liveData.matches) {
    if (match.homeTeam?.stats) {
      teamStats[match.homeTeam.id] = match.homeTeam.stats;
    }
    if (match.awayTeam?.stats) {
      teamStats[match.awayTeam.id] = match.awayTeam.stats;
    }
  }

  // Construire un map nom_équipe → stats
  const teamStatsByName = {};
  for (const match of liveData.matches) {
    if (match.homeTeam?.stats) {
      teamStatsByName[match.homeTeam.name] = match.homeTeam.stats;
    }
    if (match.awayTeam?.stats) {
      teamStatsByName[match.awayTeam.name] = match.awayTeam.stats;
    }
  }

  return matches.map(match => {
    const homeName = match.homeTeam?.name;
    const awayName = match.awayTeam?.name;

    return {
      ...match,
      homeTeam: {
        ...match.homeTeam,
        liveStats: teamStatsByName[homeName] || null,
      },
      awayTeam: {
        ...match.awayTeam,
        liveStats: teamStatsByName[awayName] || null,
      },
    };
  });
}

/**
 * Récupère les scores réels des matchs depuis liveData.
 * Utile pour le backtesting automatique.
 */
export function getLiveResults() {
  if (!liveData || !liveData.matches) return [];

  return liveData.matches
    .filter(m => m.finished && m.score?.home !== null)
    .map(m => ({
      id: m.id,
      date: m.date,
      homeTeam: m.homeTeam.name,
      awayTeam: m.awayTeam.name,
      homeScore: parseInt(m.score.home),
      awayScore: parseInt(m.score.away),
      group: m.group,
      matchday: m.matchday,
      type: m.type,
    }));
}
