import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, applyRoll, applyHold, toPublicState, GameRuleError } from '../src/lib/gameEngine.js';

const fresh = (maxPoints = 50) => createGame({ names: ['A', 'B', 'C'], maxPoints });

test('rolling 2-6 adds to the turn total and keeps the turn', () => {
  const { state, outcome } = applyRoll(fresh(), 4);
  assert.equal(outcome, 'continue');
  assert.equal(state.players[0].running, 4);
  assert.equal(state.currentPlayer, 0);
});

test('rolling a 1 wipes the turn total and passes the turn', () => {
  let s = applyRoll(fresh(), 6).state;
  const r = applyRoll(s, 1);
  assert.equal(r.outcome, 'bust');
  assert.equal(r.state.players[0].running, 0);
  assert.equal(r.state.players[0].total, 0);
  assert.equal(r.state.players[0].busts, 1);
  assert.equal(r.state.currentPlayer, 1);
});

test('a bust never touches already-banked points', () => {
  let s = applyRoll(fresh(), 6).state;
  s = applyHold(s).state; // A banks 6, B's turn
  s = applyHold(s).state; // B passes, C's turn
  s = applyHold(s).state; // C passes, A's turn
  s = applyRoll(s, 5).state;
  s = applyRoll(s, 1).state;
  assert.equal(s.players[0].total, 6);
});

test('hold banks the turn total and rotates, wrapping around', () => {
  let s = applyRoll(fresh(), 5).state;
  s = applyHold(s).state;
  assert.equal(s.players[0].total, 5);
  assert.equal(s.currentPlayer, 1);
  s = applyHold(applyHold(s).state).state;
  assert.equal(s.currentPlayer, 0);
});

test('reaching maxPoints wins on the roll itself, without needing to hold', () => {
  let s = createGame({ names: ['A', 'B'], maxPoints: 12 });
  s = applyRoll(s, 6).state;
  const r = applyRoll(s, 6);
  assert.equal(r.outcome, 'win');
  assert.equal(r.state.status, 'finished');
  assert.equal(r.state.winnerIndex, 0);
  assert.equal(r.state.players[0].total, 12);
  assert.equal(r.state.players[0].bestTurn, 12);
});

test('banked points count towards the win', () => {
  let s = createGame({ names: ['A', 'B'], maxPoints: 12 });
  s = applyRoll(s, 6).state;
  s = applyHold(s).state; // A has 6 banked
  s = applyHold(s).state; // B passes
  const r = applyRoll(s, 6); // 6 banked + 6 = 12
  assert.equal(r.outcome, 'win');
});

test('no actions are allowed once the game is over', () => {
  let s = createGame({ names: ['A', 'B'], maxPoints: 6 });
  s = applyRoll(s, 6).state;
  assert.equal(s.status, 'finished');
  assert.throws(() => applyRoll(s, 3), GameRuleError);
  assert.throws(() => applyHold(s), GameRuleError);
});

test('impossible die values are rejected', () => {
  for (const bad of [0, 7, -1, 2.5, '3', NaN, null]) {
    assert.throws(() => applyRoll(fresh(), bad), GameRuleError);
  }
});

test('the engine never mutates the state it was given', () => {
  const before = fresh();
  const snapshot = structuredClone(before);
  applyRoll(before, 4);
  applyHold(before);
  assert.deepEqual(before, snapshot);
});

test('public state uses the frontend field names and hides internals', () => {
  const pub = toPublicState(applyRoll(fresh(), 3).state);
  assert.deepEqual(pub.players[0], { name: 'A', total_points: 0, running_points: 3, score: 3 });
  assert.equal('rolls' in pub, false);
  assert.equal('bestTurn' in pub.players[0], false);
});
