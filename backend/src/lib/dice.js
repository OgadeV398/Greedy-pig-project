import { randomInt } from 'node:crypto';

// Cryptographically secure d6 (Math.random can be predicted; this can't).
let source = () => randomInt(1, 7);

export const rollDie = () => source();

/** Tests only: script the dice. Call with no argument to restore the real one. */
export function __setDiceSourceForTests(fn) {
  source = fn ?? (() => randomInt(1, 7));
}
