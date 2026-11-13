/**
 * Greedy Pig rules — pure functions, no DB, no HTTP.
 * Mirrors the original client logic so behaviour doesn't change:
 *   - roll a 1  -> turn total is lost, turn passes
 *   - roll 2-6  -> added to the turn total, the player may keep rolling
 *   - hold/pass -> turn total is banked, turn passes (allowed at any time)
 *   - first player whose banked + turn total reaches maxPoints wins ON THE ROLL
 */

export class GameRuleError extends Error {
  constructor(message) {
    super(message);
    this.name = 'GameRuleError';
  }
}

export function createGame({ names, maxPoints, level = 1, linkedIndex = null }) {
  return {
    maxPoints,
    level,
    currentPlayer: 0,
    status: 'active',
    winnerIndex: null,
    linkedIndex, // seat that belongs to the logged-in account (earns XP), or null
    lastDie: null,
    rolls: 0,
    players: names.map((name) => ({ name, total: 0, running: 0, bestTurn: 0, busts: 0 })),
  };
}

const nextSeat = (state) => (state.currentPlayer + 1) % state.players.length;

function assertActive(state) {
  if (state.status !== 'active') throw new GameRuleError('This game is already over');
}

/** Apply a die value to the current player. Returns { state, outcome } without mutating the input. */
export function applyRoll(prev, die) {
  assertActive(prev);
  if (!Number.isInteger(die) || die < 1 || die > 6) throw new GameRuleError('Invalid die value');

  const state = structuredClone(prev);
  const p = state.players[state.currentPlayer];
  state.rolls += 1;
  state.lastDie = die;

  if (die === 1) {
    p.running = 0;
    p.busts += 1;
    state.currentPlayer = nextSeat(state);
    return { state, outcome: 'bust' };
  }

  p.running += die;
  if (p.total + p.running >= state.maxPoints) {
    p.total += p.running;
    p.bestTurn = Math.max(p.bestTurn, p.running);
    p.running = 0;
    state.status = 'finished';
    state.winnerIndex = state.currentPlayer;
    return { state, outcome: 'win' };
  }
  return { state, outcome: 'continue' };
}

/** Bank the current turn total and pass the turn. */
export function applyHold(prev) {
  assertActive(prev);
  const state = structuredClone(prev);
  const p = state.players[state.currentPlayer];

  p.total += p.running;
  p.bestTurn = Math.max(p.bestTurn, p.running);
  p.running = 0;
  state.lastDie = null;

  if (p.total >= state.maxPoints) {
    state.status = 'finished';
    state.winnerIndex = state.currentPlayer;
    return { state, outcome: 'win' };
  }
  state.currentPlayer = nextSeat(state);
  return { state, outcome: 'hold' };
}

/** What the client is allowed to see. */
export function toPublicState(state) {
  return {
    maxPoints: state.maxPoints,
    level: state.level ?? 1,
    status: state.status,
    currentPlayer: state.currentPlayer,
    winnerIndex: state.winnerIndex,
    linkedIndex: state.linkedIndex,
    lastDie: state.lastDie,
    players: state.players.map((p) => ({
      name: p.name,
      total_points: p.total,
      running_points: p.running,
      score: p.total + p.running,
    })),
  };
}
