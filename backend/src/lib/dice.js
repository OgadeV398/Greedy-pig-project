import { randomInt } from 'node:crypto';
import { config } from '../config.js';

export function diceWeights(level) {
  const { minLevel, maxLevel } = config.game;
  if (!Number.isInteger(level) || level < minLevel || level > maxLevel) {
    throw new RangeError(`Level must be an integer from ${minLevel} to ${maxLevel}`);
  }

  const exponent = level - minLevel;
  const oneWeight = 5 * 7 ** exponent;
  const otherWeight = 6 * 5 ** exponent - 7 ** exponent;
  return [oneWeight, ...Array(5).fill(otherWeight)];
}

export function dieForTicket(level, ticket) {
  const weights = diceWeights(level);
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  if (!Number.isInteger(ticket) || ticket < 0 || ticket >= total) {
    throw new RangeError('Ticket is outside the level weight range');
  }

  let boundary = 0;
  for (let face = 1; face <= weights.length; face++) {
    boundary += weights[face - 1];
    if (ticket < boundary) return face;
  }
}

let testSource = null;

export const rollDie = (level = config.game.defaultLevel) => {
  if (testSource) return testSource(level);
  const total = diceWeights(level).reduce((sum, weight) => sum + weight, 0);
  return dieForTicket(level, randomInt(total));
};

/** Tests only: script the dice. Call with no argument to restore the real one. */
export function __setDiceSourceForTests(fn) {
  testSource = fn ?? null;
}
