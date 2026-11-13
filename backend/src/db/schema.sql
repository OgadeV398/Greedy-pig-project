-- Idempotent: safe to run on a fresh database AND on the existing one from the README.

-- ---------- players (accounts + career stats + progression) ----------
CREATE TABLE IF NOT EXISTS players (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(100) UNIQUE NOT NULL,
  total_wins    INT DEFAULT 0,
  highest_score INT DEFAULT 0,
  games_played  INT DEFAULT 0,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Progression columns (added without breaking the existing table)
ALTER TABLE players ADD COLUMN IF NOT EXISTS password_hash TEXT;            -- NULL for old seeded demo players
ALTER TABLE players ADD COLUMN IF NOT EXISTS xp    INT NOT NULL DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS level INT NOT NULL DEFAULT 1;
ALTER TABLE players ADD COLUMN IF NOT EXISTS avatar TEXT;                   -- Leaderboard.jsx reads p.avatar

DO $$ BEGIN
  ALTER TABLE players ADD CONSTRAINT players_xp_nonneg CHECK (xp >= 0);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- "Pig" and "pig" are the same person
CREATE UNIQUE INDEX IF NOT EXISTS players_username_lower_idx ON players (LOWER(username));
CREATE INDEX IF NOT EXISTS players_level_idx ON players (level DESC, xp DESC);

-- ---------- match_results (one row per finished game) ----------
CREATE TABLE IF NOT EXISTS match_results (
  id            SERIAL PRIMARY KEY,
  winner_name   VARCHAR(100) NOT NULL,
  winning_score INT NOT NULL,
  players_count INT NOT NULL,
  all_players   TEXT[] NOT NULL,
  played_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE match_results ADD COLUMN IF NOT EXISTS game_id UUID;
CREATE UNIQUE INDEX IF NOT EXISTS match_results_game_id_idx ON match_results (game_id);

-- ---------- games (server-side sessions: the server owns the dice + scores) ----------
CREATE TABLE IF NOT EXISTS games (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state      JSONB NOT NULL,
  status     TEXT  NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'finished')),
  player_id  INT REFERENCES players(id) ON DELETE SET NULL,  -- account that earns XP, if any
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS games_status_updated_idx ON games (status, updated_at);

-- ---------- xp_events (audit log of every XP award) ----------
CREATE TABLE IF NOT EXISTS xp_events (
  id         SERIAL PRIMARY KEY,
  player_id  INT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  game_id    UUID,
  amount     INT NOT NULL CHECK (amount >= 0),
  breakdown  JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (player_id, game_id)          -- a game can only ever pay out once per player
);
CREATE INDEX IF NOT EXISTS xp_events_player_time_idx ON xp_events (player_id, created_at DESC);
