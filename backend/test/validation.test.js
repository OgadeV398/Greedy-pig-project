import test from 'node:test';
import assert from 'node:assert/strict';
import { startGameSchema } from '../src/lib/validation.js';

const gameRequest = { players: ['A', 'B'] };

test('game difficulty defaults to Level 1 and accepts Levels 1 through 5', () => {
  assert.equal(startGameSchema.parse(gameRequest).level, 1);
  assert.equal(startGameSchema.parse({ ...gameRequest, level: '2' }).level, 2);
  assert.equal(startGameSchema.parse({ ...gameRequest, level: 5 }).level, 5);
});

test('game difficulty rejects values outside Levels 1 through 5', () => {
  for (const level of [0, 6, 2.5, 'not-a-level']) {
    assert.throws(() => startGameSchema.parse({ ...gameRequest, level }));
  }
});
