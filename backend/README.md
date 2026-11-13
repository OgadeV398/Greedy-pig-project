# Greedy Pig – Backend

Express + PostgreSQL API. The **server owns the dice and the scores**, including
the selected game difficulty.

## Run it

```bash
cd backend
npm install
npm run dev                 # http://localhost:5000  (tables are created automatically on boot)
npm test                    # needs a throwaway DB, see below
```

Create `.env` in the `backend` directory with your PostgreSQL settings before starting the server:

```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=greedy_pig
DB_PASSWORD=your_local_postgres_password
DB_PORT=5432
```

Tests use real Postgres. Create an empty database and point `TEST_DATABASE_URL` at it
(**tests wipe its tables**, never use your real one):

```bash
TEST_DATABASE_URL=postgres://postgres:pw@localhost:5432/greedy_pig_test npm test
```

## Game difficulty levels

The game setup offers Levels 1–5. Level 1 uses the normal 1-in-6 chance of rolling a 1.
Each step multiplies that chance by 1.4; the remaining probability is shared equally
among faces 2–6. The chosen level is saved in the server-side game state, and the server
uses it for every roll.

## Separate account XP levels

| | |
|---|---|
| XP to reach level *n* | `50 · n · (n−1)` → L2 = 100, L3 = 300, L5 = 1000, L10 = 4500 (max level 50) |
| Played a match | `10 + maxPoints/10` XP (100-pt game → 20) |
| Won the match | `+ 20 + maxPoints/5` XP (100-pt game → +40) |
| Bold turn | best banked/winning turn ≥ 20 → +10, ≥ 30 → +20 |
| Daily cap | 500 XP per rolling 24 h (stops "play against yourself" farming) |
| Titles | Piglet → Mud Wallower (L3) → Truffle Hunter (L5) → Bacon Baron (L8) → Hog Hero (L12) → Swine Sage (L18) → Legendary Boar (L25) |

All rules live in one file: `src/lib/progression.js`.

**Why it can't be cheated:** XP is computed inside the transaction that finishes a game, from
server-side state only. The client never sends a score or a die value. A finished game rejects
further rolls/holds, and `xp_events` has `UNIQUE(player_id, game_id)` so a game pays out once.
Roll/hold run under a row lock (`SELECT … FOR UPDATE`) so concurrent requests can't double-apply.

## API

All responses are JSON, snake_case. Errors: `{ "error": { "code", "message", "details?" } }`.
Send `Authorization: Bearer <token>` for logged-in features.

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | – | `{username, password}` → `{token, player}` (201) |
| POST | `/api/auth/login` | – | `{username, password}` → `{token, player}` |
| GET | `/api/me` | ✅ | Profile + level/XP progress |
| GET | `/api/me/xp-history?limit=10` | ✅ | Recent XP awards |
| GET | `/api/levels` | – | The account XP level ladder |
| POST | `/api/game/start` | optional | `{players, maxPoints?, level?, linkedIndex?}` → `{game_id, game}` |
| POST | `/api/game/roll` | optional* | `{gameId}` → `{die, outcome, game, progression}` |
| POST | `/api/game/hold` | optional* | `{gameId}` → `{outcome, game, progression}` |
| GET | `/api/game/:gameId` | optional* | Resume a game after refresh |
| GET | `/api/leaderboard?search=&minPoints=&sort=wins\|level&limit=20` | – | Array of players (now with `level`, `xp`, `title`) |
| GET | `/api/health` | – | Liveness + DB check |

\* Required when the game belongs to an account.

**Starting a game.** `players` is an array of names or `{name, tag}` objects (empty names become
`Player N`). `maxPoints` is 25–500 (default 100; strings like `"100"` are accepted). `level` is 1–5
(default 1; strings like `"2"` are accepted). If a token is
sent, seat `0` belongs to the account unless `linkedIndex` says otherwise (`null` = play without XP).
Only the linked seat earns XP. Without a token, games are guest games (no XP).

**Game object** (`game`): `{ status: 'active'|'finished', currentPlayer, winnerIndex, lastDie, maxPoints, level, players: [{name, total_points, running_points, score}] }`

**`outcome`**: `continue` · `bust` (rolled a 1) · `hold` · `win`

**`progression`** is `null` until the game ends (and for guest games). On the final roll/hold:

```json
{
  "won": true, "xp_awarded": 60,
  "breakdown": [{"reason":"Played a match","amount":20},{"reason":"Won the match","amount":40}],
  "daily_cap_reached": false,
  "previous_level": 1, "leveled_up": true,
  "xp": 140, "level": 2, "title": "Piglet",
  "xp_into_level": 40, "xp_to_next_level": 160, "xp_for_next_level": 300,
  "progress_pct": 20, "is_max_level": false
}
```

## Database

`src/db/schema.sql` is idempotent: it creates what's missing and adds columns to the existing
`players` table, so your current database keeps working.

- `players` + `password_hash, xp, level, avatar` (old seeded players stay on the leaderboard but can't be logged into)
- `games` – server-side sessions (JSONB state)
- `xp_events` – audit log of every XP award
- `match_results` + `game_id` – written automatically when a game ends

## Deploy (Render + Render Postgres, free tier works)

1. Create a **PostgreSQL** instance; copy its *Internal* connection string.
2. Create a **Web Service** from the repo: *Root directory* `backend`, *Build* `npm install`, *Start* `npm start`.
3. Environment variables: `NODE_ENV=production`, `DATABASE_URL`, `JWT_SECRET` (long random string),
   `CORS_ORIGIN` (your Vercel URL, comma-separated if several).
4. Free instances sleep when idle: **open `/api/health` a minute before your demo.**

## Frontend integration

The local game setup offers Levels 1–5 and sends the selected level when starting a match.
The API base URL in `src/services/gameService.js` is still `http://localhost:5000/api`;
configure it for your deployment before hosting the frontend. The browser falls back to local
dice if the API is unavailable, so the selected difficulty is enforced only for server-backed games.
