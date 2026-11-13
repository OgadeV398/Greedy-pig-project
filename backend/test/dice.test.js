import test from 'node:test';
import assert from 'node:assert/strict';
import { diceWeights, dieForTicket } from '../src/lib/dice.js';

test('Level 1 keeps the standard one-in-six die odds', () => {
  assert.deepEqual(diceWeights(1), [5, 5, 5, 5, 5, 5]);
});

test('each higher level increases the chance of a 1 by 40%', () => {
  for (let level = 1; level < 5; level++) {
    const current = diceWeights(level);
    const next = diceWeights(level + 1);
    const currentChance = current[0] / current.reduce((sum, weight) => sum + weight, 0);
    const nextChance = next[0] / next.reduce((sum, weight) => sum + weight, 0);
    assert.ok(Math.abs(nextChance / currentChance - 1.4) < 1e-12);
  }
});

test('each non-1 face remains equally likely at every level', () => {
  for (let level = 1; level <= 5; level++) {
    const weights = diceWeights(level);
    assert.equal(new Set(weights.slice(1)).size, 1);
    let ticket = 0;
    for (let face = 1; face <= 6; face++) {
      for (let i = 0; i < weights[face - 1]; i++) {
        assert.equal(dieForTicket(level, ticket++), face);
      }
    }
    assert.equal(ticket, weights.reduce((sum, weight) => sum + weight, 0));
  }
});
