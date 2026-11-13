import bcrypt from 'bcryptjs';
import { query } from '../db.js';
import { AppError } from '../middleware/errors.js';
import { signToken } from '../middleware/auth.js';
import { progressSummary } from '../lib/progression.js';

const BCRYPT_ROUNDS = 10;
// Compared against when the username doesn't exist, so "no such user" and
// "wrong password" take the same time (prevents username enumeration by timing).
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', BCRYPT_ROUNDS);

export const toProfile = (row) => ({
  id: row.id,
  username: row.username,
  avatar: row.avatar,
  total_wins: row.total_wins ?? 0,
  highest_score: row.highest_score ?? 0,
  games_played: row.games_played ?? 0,
  created_at: row.created_at,
  ...progressSummary(row.xp),
});

export async function register({ username, password }) {
  const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  try {
    const { rows } = await query(
      'INSERT INTO players (username, password_hash) VALUES ($1, $2) RETURNING *',
      [username, hash]
    );
    return { token: signToken(rows[0]), player: toProfile(rows[0]) };
  } catch (err) {
    if (err.code === '23505') {
      throw new AppError(409, 'USERNAME_TAKEN', 'That username is already taken. Try another one.');
    }
    throw err;
  }
}

export async function login({ username, password }) {
  const { rows } = await query('SELECT * FROM players WHERE LOWER(username) = LOWER($1)', [username]);
  const row = rows[0];
  const ok = await bcrypt.compare(password, row?.password_hash ?? DUMMY_HASH);
  if (!row || !row.password_hash || !ok) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Wrong username or password');
  }
  return { token: signToken(row), player: toProfile(row) };
}

export async function getProfile(playerId) {
  const { rows } = await query('SELECT * FROM players WHERE id = $1', [playerId]);
  if (!rows[0]) throw new AppError(401, 'BAD_TOKEN', 'This account no longer exists. Please log in again.');
  return toProfile(rows[0]);
}

export async function getXpHistory(playerId, limit) {
  const { rows } = await query(
    `SELECT game_id, amount, breakdown, created_at
       FROM xp_events WHERE player_id = $1
      ORDER BY created_at DESC, id DESC LIMIT $2`,
    [playerId, limit]
  );
  return rows;
}
