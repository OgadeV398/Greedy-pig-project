// Integration tests: real Express app + real Postgres, scripted dice.
// Needs a throwaway database:  TEST_DATABASE_URL=postgres://user:pass@localhost:5432/greedy_pig_test npm test
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/greedy_pig_test';

import test, { before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

const { createApp } = await import('../src/app.js');
const { migrate } = await import('../src/db/migrate.js');
const { pool, query } = await import('../src/db.js');
const { __setDiceSourceForTests } = await import('../src/lib/dice.js');

let server, base;

const api = async (method, path, body, token) => {
  const res = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
};

/** Dice that return the given values in order, then explode if the code asks for more. */
const scriptDice = (...values) => {
  let i = 0;
  __setDiceSourceForTests(() => {
    if (i >= values.length) throw new Error('dice script exhausted');
    return values[i++];
  });
};

let n = 0;
const newUser = async (name = `pig${++n}`) => {
  const r = await api('POST', '/api/auth/register', { username: name, password: 'hunter2hunter2' });
  assert.equal(r.status, 201);
  return { token: r.body.token, id: r.body.player.id, username: name };
};

const startGame = (token, extra = {}) =>
  api('POST', '/api/game/start', { players: ['Me', 'Rival'], maxPoints: 25, ...extra }, token);
const roll = (gameId, token) => api('POST', '/api/game/roll', { gameId }, token);
const hold = (gameId, token) => api('POST', '/api/game/hold', { gameId }, token);

/** Seat 0 rolls 6,6,6,6,3 = 27 >= 25 and wins. Dice must already be scripted. */
async function seatZeroWins(gameId, token) {
  let last;
  for (let i = 0; i < 5; i++) last = await roll(gameId, token);
  return last;
}
const WIN_DICE = [6, 6, 6, 6, 3];

before(async () => {
  await migrate();
  server = createApp().listen(0);
  base = `http://127.0.0.1:${server.address().port}`;
});

beforeEach(async () => {
  await query('TRUNCATE xp_events, games, match_results, players RESTART IDENTITY CASCADE');
  __setDiceSourceForTests();
});

after(async () => {
  __setDiceSourceForTests();
  await new Promise((r) => server.close(r));
  await pool.end();
});

// ---------------------------------------------------------------- accounts
test('register: validates input, rejects duplicates case-insensitively', async () => {
  assert.equal((await api('POST', '/api/auth/register', { username: 'ab', password: 'longenough1' })).status, 400);
  assert.equal((await api('POST', '/api/auth/register', { username: 'has space', password: 'longenough1' })).status, 400);
  const short = await api('POST', '/api/auth/register', { username: 'okname', password: 'short' });
  assert.equal(short.status, 400);
  assert.equal(short.body.error.code, 'VALIDATION_ERROR');
  assert.match(short.body.error.message, /at least 8/);

  const ok = await api('POST', '/api/auth/register', { username: 'Hamlet', password: 'longenough1' });
  assert.equal(ok.status, 201);
  assert.equal(ok.body.player.level, 1);
  assert.equal(ok.body.player.xp, 0);
  assert.equal(ok.body.player.title, 'Piglet');
  assert.equal('password_hash' in ok.body.player, false);

  const dup = await api('POST', '/api/auth/register', { username: 'hamlet', password: 'longenough1' });
  assert.equal(dup.status, 409);
  assert.equal(dup.body.error.code, 'USERNAME_TAKEN');
});

test('login: works case-insensitively; wrong password and unknown user look identical', async () => {
  await api('POST', '/api/auth/register', { username: 'Wilbur', password: 'longenough1' });
  assert.equal((await api('POST', '/api/auth/login', { username: 'wilbur', password: 'longenough1' })).status, 200);
  const wrongPw = await api('POST', '/api/auth/login', { username: 'Wilbur', password: 'nope-nope-nope' });
  const noUser = await api('POST', '/api/auth/login', { username: 'ghost', password: 'nope-nope-nope' });
  assert.equal(wrongPw.status, 401);
  assert.equal(noUser.status, 401);
  assert.deepEqual(wrongPw.body, noUser.body);
});

test('legacy seeded players (no password) cannot be logged into or re-registered', async () => {
  await query("INSERT INTO players (username, total_wins, highest_score, games_played) VALUES ('PiggyMaster', 15, 250, 20)");
  assert.equal((await api('POST', '/api/auth/login', { username: 'PiggyMaster', password: 'anything-at-all' })).status, 401);
  assert.equal((await api('POST', '/api/auth/register', { username: 'piggymaster', password: 'longenough1' })).status, 409);
});

test('/me needs a valid token', async () => {
  assert.equal((await api('GET', '/api/me')).status, 401);
  const bad = await api('GET', '/api/me', undefined, 'garbage.token.here');
  assert.equal(bad.status, 401);
  assert.equal(bad.body.error.code, 'BAD_TOKEN');
  const u = await newUser();
  const me = await api('GET', '/api/me', undefined, u.token);
  assert.equal(me.status, 200);
  assert.equal(me.body.player.username, u.username);
});

// ---------------------------------------------------------------- game basics
test('guest games work, record a match, and award no XP', async () => {
  scriptDice(...WIN_DICE);
  const g = await startGame();
  assert.equal(g.status, 201);
  assert.equal(g.body.game.players[0].name, 'Me');
  const last = await seatZeroWins(g.body.game_id);
  assert.equal(last.body.outcome, 'win');
  assert.equal(last.body.game.winnerIndex, 0);
  assert.equal(last.body.progression, null);
  const { rows } = await query('SELECT * FROM match_results');
  assert.equal(rows.length, 1);
  assert.equal(rows[0].winner_name, 'Me');
  assert.equal(rows[0].winning_score, 27);
  assert.deepEqual(rows[0].all_players, ['Me', 'Rival']);
});

test('turn order: roll, bust passes the turn, hold banks and passes', async () => {
  scriptDice(5, 1, 4);
  const g = (await startGame()).body.game_id;
  let r = await roll(g);
  assert.equal(r.body.die, 5);
  assert.equal(r.body.game.players[0].running_points, 5);
  r = await roll(g);
  assert.equal(r.body.outcome, 'bust');
  assert.equal(r.body.game.currentPlayer, 1);
  assert.equal(r.body.game.players[0].score, 0);
  await roll(g); // seat 1 rolls 4
  r = await hold(g);
  assert.equal(r.body.outcome, 'hold');
  assert.equal(r.body.game.players[1].total_points, 4);
  assert.equal(r.body.game.currentPlayer, 0);
});

test('game state can be fetched to resume, and hides server internals', async () => {
  scriptDice(3);
  const started = await startGame(undefined, { level: 4 });
  const g = started.body.game_id;
  assert.equal(started.body.game.level, 4);
  await roll(g);
  const got = await api('GET', `/api/game/${g}`);
  assert.equal(got.status, 200);
  assert.equal(got.body.game.level, 4);
  assert.equal(got.body.game.players[0].running_points, 3);
  assert.equal('rolls' in got.body.game, false);
});

// ---------------------------------------------------------------- progression
test('a logged-in win awards XP, updates stats, and shows up in /me and xp-history', async () => {
  const u = await newUser();
  scriptDice(...WIN_DICE);
  const g = (await startGame(u.token)).body.game_id;
  const last = await seatZeroWins(g, u.token);

  const p = last.body.progression;
  assert.equal(p.won, true);
  assert.equal(p.xp_awarded, 47); // 12 played + 25 won + 10 bold turn (27 in one turn)
  assert.deepEqual(p.breakdown.map((b) => b.amount), [12, 25, 10]);
  assert.equal(p.level, 1);
  assert.equal(p.leveled_up, false);
  assert.equal(p.xp_to_next_level, 53);

  const me = (await api('GET', '/api/me', undefined, u.token)).body.player;
  assert.equal(me.xp, 47);
  assert.equal(me.total_wins, 1);
  assert.equal(me.games_played, 1);
  assert.equal(me.highest_score, 27);
  assert.equal(me.username, u.username);

  const hist = (await api('GET', '/api/me/xp-history', undefined, u.token)).body.events;
  assert.equal(hist.length, 1);
  assert.equal(hist[0].amount, 47);
});

test('the account name is used for an unnamed linked seat', async () => {
  const u = await newUser('Napoleon');
  const g = await api('POST', '/api/game/start', { players: [{ name: '', tag: '' }, { name: 'B' }], maxPoints: 25 }, u.token);
  assert.equal(g.body.game.players[0].name, 'Napoleon');
  assert.equal(g.body.game.linkedIndex, 0);

  // ...also when the frontend sends plain empty strings
  const g2 = await api('POST', '/api/game/start', { players: ['', 'B'], maxPoints: 25 }, u.token);
  assert.equal(g2.body.game.players[0].name, 'Napoleon');
  assert.equal(g2.body.game.players[1].name, 'B');
});

test('a loss still earns participation XP but no win', async () => {
  const u = await newUser();
  scriptDice(...WIN_DICE);
  // seat 1 is the account; seat 0 (the rival) gets the win
  const g = (await startGame(u.token, { linkedIndex: 1 })).body.game_id;
  let last;
  for (let i = 0; i < 5; i++) last = await roll(g, u.token);
  assert.equal(last.body.game.winnerIndex, 0);
  assert.equal(last.body.progression.won, false);
  assert.equal(last.body.progression.xp_awarded, 12);
  const me = (await api('GET', '/api/me', undefined, u.token)).body.player;
  assert.equal(me.total_wins, 0);
  assert.equal(me.games_played, 1);
});

test('crossing a level threshold reports leveled_up with the new title', async () => {
  const u = await newUser();
  await query('UPDATE players SET xp = 90 WHERE id = $1', [u.id]);
  scriptDice(...WIN_DICE);
  const g = (await startGame(u.token)).body.game_id;
  const p = (await seatZeroWins(g, u.token)).body.progression;
  assert.equal(p.previous_level, 1);
  assert.equal(p.level, 2);
  assert.equal(p.leveled_up, true);
  assert.equal(p.xp, 137);
  assert.equal((await api('GET', '/api/me', undefined, u.token)).body.player.level, 2);
});

test('daily XP cap trims the award and says so', async () => {
  const u = await newUser();
  await query("INSERT INTO xp_events (player_id, game_id, amount) VALUES ($1, NULL, 480)", [u.id]);
  scriptDice(...WIN_DICE);
  const g = (await startGame(u.token)).body.game_id;
  const p = (await seatZeroWins(g, u.token)).body.progression;
  assert.equal(p.xp_awarded, 20); // 500 cap - 480 already earned
  assert.equal(p.daily_cap_reached, true);
});

// ---------------------------------------------------------------- anti-cheat
test('XP can only be earned once per game: replaying a finished game is rejected', async () => {
  const u = await newUser();
  scriptDice(...WIN_DICE, 6, 6);
  const g = (await startGame(u.token)).body.game_id;
  await seatZeroWins(g, u.token);
  const replay = await roll(g, u.token);
  assert.equal(replay.status, 409);
  assert.equal((await hold(g, u.token)).status, 409);
  assert.equal((await api('GET', '/api/me', undefined, u.token)).body.player.xp, 47);
  assert.equal((await query('SELECT count(*)::int AS c FROM xp_events')).rows[0].c, 1);
});

test('the client cannot choose dice or scores: extra body fields are ignored', async () => {
  scriptDice(2);
  const g = (await startGame()).body.game_id;
  const r = await api('POST', '/api/game/roll', { gameId: g, die: 6, score: 9999, total_points: 9999 });
  assert.equal(r.body.die, 2);
  assert.equal(r.body.game.players[0].score, 2);
});

test('a client cannot claim XP for a seat without logging in', async () => {
  const r = await startGame(undefined, { linkedIndex: 0 });
  assert.equal(r.status, 401);
  assert.equal(r.body.error.code, 'AUTH_REQUIRED');
});

test("nobody else can play (or farm) someone's XP game", async () => {
  const owner = await newUser();
  const other = await newUser();
  const g = (await startGame(owner.token)).body.game_id;
  assert.equal((await roll(g)).status, 401); // no token
  assert.equal((await roll(g, other.token)).status, 403); // wrong account
  assert.equal((await api('GET', `/api/game/${g}`, undefined, other.token)).status, 403);
});

test('concurrent rolls are applied exactly once each (row locking works)', async () => {
  scriptDice(...Array(10).fill(2));
  const g = (await startGame()).body.game_id;
  const results = await Promise.all(Array.from({ length: 10 }, () => roll(g)));
  assert.ok(results.every((r) => r.status === 200));
  const state = (await api('GET', `/api/game/${g}`)).body.game;
  assert.equal(state.players[0].running_points, 20); // 10 rolls x 2, none lost or doubled
});

test('two simultaneous winning rolls pay out once', async () => {
  const u = await newUser();
  scriptDice(6, 6, 6, 6, 3, 3);
  const g = (await startGame(u.token)).body.game_id;
  for (let i = 0; i < 4; i++) await roll(g, u.token);
  const [a, b] = await Promise.all([roll(g, u.token), roll(g, u.token)]);
  assert.deepEqual([a.status, b.status].sort(), [200, 409]);
  assert.equal((await query('SELECT count(*)::int AS c FROM match_results')).rows[0].c, 1);
  assert.equal((await query('SELECT count(*)::int AS c FROM xp_events')).rows[0].c, 1);
  assert.equal((await api('GET', '/api/me', undefined, u.token)).body.player.games_played, 1);
});

// ---------------------------------------------------------------- validation
test('start-game validation', async () => {
  const post = (body) => api('POST', '/api/game/start', body);
  assert.equal((await post({ players: ['solo'] })).status, 400);
  assert.equal((await post({ players: Array(9).fill('p') })).status, 400);
  assert.equal((await post({ players: ['a', 'b'], maxPoints: 10 })).status, 400);
  assert.equal((await post({ players: ['a', 'b'], maxPoints: 99999 })).status, 400);
  assert.equal((await post({ players: ['a', 'b'], maxPoints: 'abc' })).status, 400);
  assert.equal((await post({ players: ['a', 'x'.repeat(21)] })).status, 400);
  assert.equal((await post({})).status, 400);
  assert.equal((await post({ players: ['a', 'b'], linkedIndex: 5 })).status, 400);

  const strMax = await post({ players: ['a', 'b'], maxPoints: '100' }); // UI sends strings
  assert.equal(strMax.status, 201);
  assert.equal(strMax.body.game.maxPoints, 100);
  assert.equal(strMax.body.game.level, 1);
  assert.equal((await post({ players: ['a', 'b'], level: '5' })).body.game.level, 5);
  assert.equal((await post({ players: ['a', 'b'], level: 0 })).status, 400);
  assert.equal((await post({ players: ['a', 'b'], level: 6 })).status, 400);
  assert.equal((await post({ players: ['a', 'b'], level: 2.5 })).status, 400);
  const dflt = await post({ players: ['a', 'b'] });
  assert.equal(dflt.body.game.maxPoints, 100);

  const shape = await post({ players: [{ name: '', tag: 'Hammy' }, { name: '', tag: '' }] });
  assert.deepEqual(shape.body.game.players.map((p) => p.name), ['Hammy', 'Player 2']);
});

test('roll/hold/get reject bad and unknown game ids', async () => {
  assert.equal((await api('POST', '/api/game/roll', {})).status, 400);
  assert.equal((await api('POST', '/api/game/roll', { gameId: 'nope' })).status, 400);
  assert.equal((await api('POST', '/api/game/hold', { gameId: 123 })).status, 400);
  const missing = await roll('00000000-0000-4000-8000-000000000000');
  assert.equal(missing.status, 404);
  assert.equal(missing.body.error.code, 'GAME_NOT_FOUND');
  assert.equal((await api('GET', '/api/game/not-a-uuid')).status, 400);
});

test('bad JSON and unknown routes return clean JSON errors', async () => {
  const bad = await api('POST', '/api/game/start', '{not json');
  assert.equal(bad.status, 400);
  assert.equal(bad.body.error.code, 'BAD_JSON');
  const nf = await api('GET', '/api/nope');
  assert.equal(nf.status, 404);
  assert.equal(nf.body.error.code, 'NOT_FOUND');
});

// ---------------------------------------------------------------- leaderboard & levels
test('leaderboard: array shape, level/title included, filters and sorting work', async () => {
  await query(`INSERT INTO players (username, total_wins, highest_score, games_played, xp, level) VALUES
    ('Alpha', 10, 120, 12, 100, 2), ('Bravo', 3, 90, 5, 4600, 10), ('Charlie', 3, 40, 4, 0, 1)`);

  const all = await api('GET', '/api/leaderboard?search=&minPoints=');
  assert.equal(all.status, 200);
  assert.ok(Array.isArray(all.body));
  assert.deepEqual(all.body.map((p) => p.username), ['Alpha', 'Bravo', 'Charlie']);
  assert.equal(all.body[1].title, 'Bacon Baron');
  assert.equal(all.body[1].level, 10);

  assert.deepEqual((await api('GET', '/api/leaderboard?search=ch')).body.map((p) => p.username), ['Charlie']);
  assert.deepEqual((await api('GET', '/api/leaderboard?minPoints=100')).body.map((p) => p.username), ['Alpha']);
  assert.equal((await api('GET', '/api/leaderboard?sort=level')).body[0].username, 'Bravo');
  assert.equal((await api('GET', '/api/leaderboard?limit=1')).body.length, 1);
  assert.equal((await api('GET', '/api/leaderboard?sort=DROP_TABLE')).status, 400);
  assert.equal((await api('GET', '/api/leaderboard?limit=9999')).status, 400);
  assert.equal((await api('GET', '/api/leaderboard?search=%25')).body.length, 0); // '%' is literal, not a wildcard
});

test('/levels is public and lists the ladder', async () => {
  const r = await api('GET', '/api/levels');
  assert.equal(r.status, 200);
  assert.equal(r.body.levels[0].xp_required, 0);
  assert.equal(r.body.levels[1].xp_required, 100);
  assert.equal(r.body.levels.length, 50);
});
