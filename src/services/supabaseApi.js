import { supabase } from '../lib/supabase';
import { todayMatches, backtestHistory, pipelineLogs } from '../data/mockData';

const isConfigured = () => {
  return import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co';
};

export const db = {
  // ── Matches ──────────────────────────────────────────────
  async getTodayMatches() {
    if (!isConfigured()) return todayMatches;

    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('status', 'pending')
      .order('match_date');

    if (error) throw error;

    return (data || []).map((m) => ({
      id: m.id,
      league: m.league,
      date: m.match_date,
      homeTeam: { name: m.home_team, logoColor: m.home_logo_color },
      awayTeam: { name: m.away_team, logoColor: m.away_logo_color },
      odds: { home: Number(m.odds_home), draw: Number(m.odds_draw), away: Number(m.odds_away) },
      aiProbs: { home: m.ai_prob_home, draw: m.ai_prob_draw, away: m.ai_prob_away },
      confidence: m.confidence,
      prediction: m.prediction,
      valueBet: m.value_bet,
      expectedValue: Number(m.expected_value),
      result: m.actual_result,
    }));
  },

  // ── Backtest History ─────────────────────────────────────
  async getBacktestHistory(season, championship) {
    if (!isConfigured()) {
      return backtestHistory.filter((m) => {
        if (season && m.season !== season) return false;
        if (championship && m.championship !== championship) return false;
        return true;
      });
    }

    let query = supabase.from('backtest_history').select('*');
    if (season) query = query.eq('season', season);
    if (championship) query = query.eq('championship', championship);

    const { data, error } = await query.order('match_date', { ascending: false });
    if (error) throw error;

    return data || [];
  },

  // ── Pipeline Logs ────────────────────────────────────────
  async getPipelineLogs() {
    if (!isConfigured()) return pipelineLogs;

    const { data, error } = await supabase
      .from('pipeline_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    return (data || []).map((l) => ({
      id: l.id,
      time: l.log_time,
      type: l.log_type,
      message: l.message,
    }));
  },

  async addPipelineLog(type, message) {
    if (!isConfigured()) return null;

    const { error } = await supabase
      .from('pipeline_logs')
      .insert({ log_type: type, message });

    if (error) throw error;
  },

  // ── Predictions (user-specific) ──────────────────────────
  async getUserPredictions() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;
    return data || [];
  },

  async savePrediction(matchId, outcome, score) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('predictions')
      .upsert({
        match_id: matchId,
        user_id: user.id,
        predicted_outcome: outcome,
        predicted_score: score,
      }, { onConflict: 'match_id,user_id' });

    if (error) throw error;
  },

  // ── Profile ──────────────────────────────────────────────
  async getProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) return null;
    return data;
  },
};
