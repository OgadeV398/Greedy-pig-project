import { query, withTransaction } from '../db.js';
import { AppError } from '../middleware/errors.js';
import { rollDie } from '../lib/dice.js';
import { createGame, applyRoll, applyHold, toPublicState } from '../lib/gameEngine.js';
import { computeGameXp, applyDailyCap, levelFromXp, progressSummary } from '../lib/progression.js';

const rawName = (seat) => (typeof seat === 'string' ? seat : seat.name || seat.tag || '').trim();
const seatName = (seat, i) => rawName(seat) || `Player ${i + 1}`;

export async function startGame({ players, maxPoints, level, linkedIndex }, user) {
  // Logged in and didn't say which seat is theirs -> seat 0. Explicit null = play without XP.
  let linked = linkedIndex === undefined ? (user ? 0 : null) : linkedIndex;
  if (linked != null && !user) {
    throw new AppError(401, 'AUTH_REQUIRED', 'Log in to earn XP in this game');
  }

  const names = players.map(seatName);
  if (linked != null && !rawName(players[linked])) {
    names[linked] = user.username; // unnamed account seat shows the account name
  }

  const state = createGame({ names, maxPoints, level, linkedIndex: linked });

  // Housekeeping: abandoned games (2 days) and finished sessions (7 days; match_results keeps the record).
  await query(
    `DELETE FROM games WHERE (status = 'active'   AND updated_at < now() - interval '2 days')
                          OR (status = 'finished' AND updated_at < now() - interval '7 days')`
  );

  try {
    const { rows } = await query(
      'INSERT INTO games (state, player_id) VALUES ($1, $2) RETURNING id',
      [JSON.stringify(state), linked != null ? user.id : null]
    );
    return { game_id: rows[0].id, game: toPublicState(state) };
  } catch (err) {
    if (err.code === '23503') throw new AppError(401, 'BAD_TOKEN', 'This account no longer exists. Please log in again.');
    throw err;
  }
}

function assertCanPlay(game, user) {
  if (!game.player_id) return; // anonymous game: the unguessable UUID is the capability
  if (!user) throw new AppError(401, 'AUTH_REQUIRED', 'Log in to continue this game');
  if (user.id !== game.player_id) throw new AppError(403, 'NOT_YOUR_GAME', 'This game belongs to another account');
}

export async function getGame(gameId, user) {
  const { rows } = await query('SELECT * FROM games WHERE id = $1', [gameId]);
  if (!rows[0]) throw new AppError(404, 'GAME_NOT_FOUND', 'Game not found');
  assertCanPlay(rows[0], user);
  return { game_id: gameId, game: toPublicState(rows[0].state) };
}

/** Roll or hold. One transaction + a row lock => two simultaneous requests can never both apply. */
export function advanceGame(gameId, action, user) {
  return withTransaction(async (client) => {
    const { rows } = await client.query('SELECT * FROM games WHERE id = $1 FOR UPDATE', [gameId]);
    const game = rows[0];
    if (!game) throw new AppError(404, 'GAME_NOT_FOUND', 'Game not found');
    assertCanPlay(game, user);

    const die = action === 'roll' ? rollDie(game.state.level ?? 1) : null;
    const { state, outcome } = action === 'roll' ? applyRoll(game.state, die) : applyHold(game.state);

    await client.query(
      'UPDATE games SET state = $2, status = $3, updated_at = now() WHERE id = $1',
      [gameId, JSON.stringify(state), state.status]
    );

    const progression = state.status === 'finished' ? await finalizeGame(client, game, state) : null;

    return {
      game_id: gameId,
      ...(action === 'roll' ? { die } : {}),
      outcome,
      game: toPublicState(state),
      progression, // null unless the game just ended AND it belongs to a logged-in account
    };
  });
}

/** Runs exactly once per game (inside the locked transaction that finished it). */
async function finalizeGame(client, game, state) {
  const winner = state.players[state.winnerIndex];

  await client.query(
    `INSERT INTO match_results (winner_name, winning_score, players_count, all_players, game_id)
     VALUES ($1, $2, $3, $4, $5)`,
    [winner.name, winner.total, state.players.length, state.players.map((p) => p.name), game.id]
  );

  if (!game.player_id || state.linkedIndex == null) return null;

  const seat = state.players[state.linkedIndex];
  const won = state.winnerIndex === state.linkedIndex;

  const locked = await client.query('SELECT xp, level FROM players WHERE id = $1 FOR UPDATE', [game.player_id]);
  if (!locked.rows[0]) return null; // account deleted mid-game
  const { xp: oldXp, level: oldLevel } = locked.rows[0];

  const earned = await client.query(
    `SELECT COALESCE(SUM(amount), 0)::int AS total FROM xp_events
      WHERE player_id = $1 AND created_at > now() - interval '24 hours'`,
    [game.player_id]
  );
  const award = applyDailyCap(
    computeGameXp({ maxPoints: state.maxPoints, won, bestTurn: seat.bestTurn }),
    earned.rows[0].total
  );

  const newXp = oldXp + award.total;
  const newLevel = levelFromXp(newXp);

  await client.query(
    `UPDATE players
        SET xp = $2, level = $3,
            games_played  = COALESCE(games_played, 0) + 1,
            total_wins    = COALESCE(total_wins, 0) + $4,
            highest_score = GREATEST(COALESCE(highest_score, 0), $5)
      WHERE id = $1`,
    [game.player_id, newXp, newLevel, won ? 1 : 0, seat.total]
  );
  await client.query(
    'INSERT INTO xp_events (player_id, game_id, amount, breakdown) VALUES ($1, $2, $3, $4)',
    [game.player_id, game.id, award.total, JSON.stringify(award.breakdown)]
  );

  return {
    won,
    xp_awarded: award.total,
    breakdown: award.breakdown,
    daily_cap_reached: award.capped,
    previous_level: oldLevel,
    leveled_up: newLevel > oldLevel,
    ...progressSummary(newXp),
  };
}
