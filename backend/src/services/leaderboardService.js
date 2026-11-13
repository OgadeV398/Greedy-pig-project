import { query } from '../db.js';
import { titleForLevel } from '../lib/progression.js';

const ORDER = {
  wins: 'COALESCE(total_wins, 0) DESC, COALESCE(highest_score, 0) DESC, username ASC',
  level: 'level DESC, xp DESC, COALESCE(total_wins, 0) DESC, username ASC',
};

export async function getLeaderboard({ search, minPoints, sort, limit }) {
  const like = `%${search.replace(/[\\%_]/g, '\\$&')}%`;
  // `sort` is validated against an enum, so picking the clause from a fixed map is injection-safe.
  const { rows } = await query(
    `SELECT id, username, avatar, total_wins, highest_score, games_played, xp, level
       FROM players
      WHERE username ILIKE $1 ESCAPE '\\' AND COALESCE(highest_score, 0) >= $2
      ORDER BY ${ORDER[sort]}
      LIMIT $3`,
    [like, minPoints, limit]
  );
  return rows.map((r) => ({
    ...r,
    total_wins: r.total_wins ?? 0,
    highest_score: r.highest_score ?? 0,
    games_played: r.games_played ?? 0,
    title: titleForLevel(r.level),
  }));
}
