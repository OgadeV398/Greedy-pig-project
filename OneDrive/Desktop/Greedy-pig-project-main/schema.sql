-- 1. Create a players table to track unique usernames and career performance
CREATE TABLE IF NOT EXISTS public.players (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    total_wins INTEGER DEFAULT 0,
    highest_score INTEGER DEFAULT 0,
    games_played INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create a match_results table to record every finished game for Match History
CREATE TABLE IF NOT EXISTS public.match_results (
    id SERIAL PRIMARY KEY,
    winner_name TEXT NOT NULL,
    winning_score INTEGER NOT NULL,
    players_count INTEGER NOT NULL,
    played_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable Row Level Security (RLS) for safety
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;

-- 4. Create policies so anyone can read the leaderboard and match history
CREATE POLICY "Allow public read access on players" 
ON public.players FOR SELECT USING (true);

CREATE POLICY "Allow public read access on match_results" 
ON public.match_results FOR SELECT USING (true);

-- 5. Allow inserts so games can save scores when they end
CREATE POLICY "Allow public insert access on match_results" 
ON public.match_results FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert/update on players" 
ON public.players FOR ALL USING (true);