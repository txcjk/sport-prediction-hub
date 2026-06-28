-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- MATCHES
-- =====================
CREATE TABLE matches (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  league TEXT NOT NULL,
  match_date TIMESTAMPTZ NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  home_logo_color TEXT DEFAULT '#64748b',
  away_logo_color TEXT DEFAULT '#64748b',
  odds_home DECIMAL(6,2),
  odds_draw DECIMAL(6,2),
  odds_away DECIMAL(6,2),
  ai_prob_home INTEGER,
  ai_prob_draw INTEGER,
  ai_prob_away INTEGER,
  confidence INTEGER,
  prediction TEXT,
  value_bet BOOLEAN DEFAULT false,
  expected_value DECIMAL(6,3),
  actual_result TEXT,
  actual_score TEXT,
  status TEXT DEFAULT 'pending'
);

-- =====================
-- PREDICTIONS
-- =====================
CREATE TABLE predictions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  match_id BIGINT REFERENCES matches(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  predicted_outcome TEXT NOT NULL,
  predicted_score TEXT,
  confidence INTEGER,
  is_correct BOOLEAN,
  points INTEGER DEFAULT 0
);

-- =====================
-- BACKTEST HISTORY
-- =====================
CREATE TABLE backtest_history (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  match_date DATE NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  prediction TEXT NOT NULL,
  result TEXT,
  status TEXT DEFAULT 'pending',
  odds DECIMAL(6,2),
  profit DECIMAL(8,2),
  season TEXT,
  championship TEXT
);

-- =====================
-- PIPELINE LOGS
-- =====================
CREATE TABLE pipeline_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  log_time TIME NOT NULL DEFAULT NOW(),
  log_type TEXT NOT NULL CHECK (log_type IN ('success', 'info', 'warning', 'error')),
  message TEXT NOT NULL
);

-- =====================
-- USER PROFILES (extends auth.users)
-- =====================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  username TEXT UNIQUE,
  total_predictions INTEGER DEFAULT 0,
  correct_predictions INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================
-- ROW LEVEL SECURITY
-- =====================
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE backtest_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Public read access for matches, backtest, logs
CREATE POLICY "Public read matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Public read backtest" ON backtest_history FOR SELECT USING (true);
CREATE POLICY "Public read logs" ON pipeline_logs FOR SELECT USING (true);

-- Authenticated access for predictions
CREATE POLICY "Users read own predictions" ON predictions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own predictions" ON predictions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own predictions" ON predictions FOR UPDATE USING (auth.uid() = user_id);

-- Profiles: users read/write own
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
