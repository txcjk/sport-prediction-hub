import { useState, useEffect } from 'react';
import liveData from '../data/liveData.json';

/**
 * 🔄 Mapping FR → EN pour faire correspondre les noms d'équipes
 * entre mockData.js (français) et liveData.json (anglais).
 *
 * Clé = nom français (mockData), Valeur = nom anglais (liveData)
 */
const TEAM_NAME_MAP = {
  'Afrique du Sud': 'South Africa',
  'Algérie': 'Algeria',
  'Allemagne': 'Germany',
  'Angleterre': 'England',
  'Arabie Saoudite': 'Saudi Arabia',
  'Argentine': 'Argentina',
  'Australie': 'Australia',
  'Autriche': 'Austria',
  'Belgique': 'Belgium',
  'Bosnie': 'Bosnia-Herzegovina',
  'Brésil': 'Brazil',
  'Canada': 'Canada',
  'Cap-Vert': 'Cape Verde Islands',
  'Colombie': 'Colombia',
  'Corée du Sud': 'South Korea',
  'Croatie': 'Croatia',
  'Côte d\'Ivoire': 'Ivory Coast',
  'Curaçao': 'Curaçao',
  'RD Congo': 'Congo DR',
  'République Tchèque': 'Czechia',
  'Égypte': 'Egypt',
  'Équateur': 'Ecuador',
  'Écosse': 'Scotland',
  'Espagne': 'Spain',
  'France': 'France',
  'Ghana': 'Ghana',
  'Haïti': 'Haiti',
  'Irak': 'Iraq',
  'Iran': 'Iran',
  'Italie': 'Italy',
  'Jamaïque': 'Jamaica',
  'Japon': 'Japan',
  'Jordanie': 'Jordan',
  'Maroc': 'Morocco',
  'Mexique': 'Mexico',
  'Norvège': 'Norway',
  'Nouvelle-Zélande': 'New Zealand',
  'Ouzbékistan': 'Uzbekistan',
  'Panama': 'Panama',
  'Paraguay': 'Paraguay',
  'Pays-Bas': 'Netherlands',
  'Portugal': 'Portugal',
  'Qatar': 'Qatar',
  'Sénégal': 'Senegal',
  'Suisse': 'Switzerland',
  'Suède': 'Sweden',
  'Tchèquie': 'Czechia',
  'Tunisie': 'Tunisia',
  'Turquie': 'Turkey',
  'USA': 'United States',
  'États-Unis': 'United States',
  'Uruguay': 'Uruguay',
};

/**
 * Traduit un nom d'équipe français → anglais
 */
function translateTeamName(frenchName) {
  if (!frenchName) return null;
  return TEAM_NAME_MAP[frenchName] || frenchName;
}

/**
 * Hook qui fournit les données live depuis le fichier généré par feed-data.py.
 */
export function useLiveData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
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
 * Construit un index des stats par nom d'équipe (anglais) depuis liveData.
 */
function buildStatsIndex() {
  if (!liveData || !liveData.matches) return {};

  const index = {};

  for (const match of liveData.matches) {
    if (match.homeTeam?.stats) {
      // Index par nom anglais + par tla
      index[match.homeTeam.name] = {
        ...match.homeTeam.stats,
        crest: match.homeTeam.crest,
        flag: match.homeTeam.flag,
        shortName: match.homeTeam.shortName,
        tla: match.homeTeam.tla,
        alerts: match.alerts?.homeTeam || [],
      };
    }
    if (match.awayTeam?.stats) {
      index[match.awayTeam.name] = {
        ...match.awayTeam.stats,
        crest: match.awayTeam.crest,
        flag: match.awayTeam.flag,
        shortName: match.awayTeam.shortName,
        tla: match.awayTeam.tla,
        alerts: match.alerts?.awayTeam || [],
      };
    }
  }

  // Ajouter météo depuis le premier match non-finish
  const weatherData = {};
  for (const match of liveData.matches) {
    if (!match.finished && match.weather) {
      weatherData[match.homeTeam.name] = match.weather;
      weatherData[match.awayTeam.name] = match.weather;
    }
  }

  return { byName: index, weather: weatherData };
}

/**
 * Enrichit les matchs du dashboard avec les stats live des équipes.
 * Utilise le mapping FR → EN pour faire correspondre les noms.
 */
export function enrichWithLiveStats(matches) {
  if (!liveData || !liveData.matches) return matches;

  const { byName, weather } = buildStatsIndex();

  return matches.map(match => {
    const homeFr = match.homeTeam?.name;
    const awayFr = match.awayTeam?.name;

    // Traduire les noms français → anglais
    const homeEn = translateTeamName(homeFr);
    const awayEn = translateTeamName(awayFr);

    const homeStats = byName[homeEn] || null;
    const awayStats = byName[awayEn] || null;

    return {
      ...match,
      homeTeam: {
        ...match.homeTeam,
        liveStats: homeStats,
        weather: weather[homeEn] || null,
      },
      awayTeam: {
        ...match.awayTeam,
        liveStats: awayStats,
        weather: weather[awayEn] || null,
      },
    };
  });
}

/**
 * Récupère les scores réels des matchs depuis liveData.
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
