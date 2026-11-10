import test from 'node:test';
import assert from 'node:assert/strict';
import {
  xpForLevel, levelFromXp, titleForLevel, progressSummary, computeGameXp, applyDailyCap, MAX_LEVEL,
} from '../src/lib/progression.js';

test('level thresholds follow 50 * n * (n-1)', () => {
  assert.deepEqual([1, 2, 3, 4, 5, 10].map(xpForLevel), [0, 100, 300, 600, 1000, 4500]);
});

test('levelFromXp is exact at every boundary', () => {
  assert.equal(levelFromXp(0), 1);
  assert.equal(levelFromXp(99), 1);
  assert.equal(levelFromXp(100), 2);
  assert.equal(levelFromXp(299), 2);
  assert.equal(levelFromXp(300), 3);
  assert.equal(levelFromXp(1000), 5);
});

test('levelFromXp never exceeds MAX_LEVEL', () => {
  assert.equal(levelFromXp(10_000_000), MAX_LEVEL);
});

test('titles change at the configured levels', () => {
  assert.equal(titleForLevel(1), 'Piglet');
  assert.equal(titleForLevel(2), 'Piglet');
  assert.equal(titleForLevel(3), 'Mud Wallower');
  assert.equal(titleForLevel(25), 'Legendary Boar');
});

test('progressSummary: mid-level numbers add up', () => {
  const s = progressSummary(150); // level 2 spans 100..300
  assert.equal(s.level, 2);
  assert.equal(s.xp_into_level, 50);
  assert.equal(s.xp_to_next_level, 150);
  assert.equal(s.xp_for_next_level, 300);
  assert.equal(s.progress_pct, 25);
  assert.equal(s.is_max_level, false);
});

test('progressSummary: max level is a full bar with nothing left to earn', () => {
  const s = progressSummary(xpForLevel(MAX_LEVEL) + 5);
  assert.equal(s.is_max_level, true);
  assert.equal(s.progress_pct, 100);
  assert.equal(s.xp_to_next_level, 0);
  assert.equal(s.xp_for_next_level, null);
});

test('computeGameXp: loser, winner, and risky-turn bonuses (100-pt game)', () => {
  assert.equal(computeGameXp({ maxPoints: 100, won: false, bestTurn: 5 }).total, 20);
  assert.equal(computeGameXp({ maxPoints: 100, won: true, bestTurn: 5 }).total, 60);
  assert.equal(computeGameXp({ maxPoints: 100, won: true, bestTurn: 20 }).total, 70);
  assert.equal(computeGameXp({ maxPoints: 100, won: true, bestTurn: 35 }).total, 80);
});

test('longer games pay more', () => {
  const short = computeGameXp({ maxPoints: 25, won: true, bestTurn: 0 }).total;
  const long = computeGameXp({ maxPoints: 300, won: true, bestTurn: 0 }).total;
  assert.ok(long > short);
});

test('applyDailyCap trims the award to the room left', () => {
  const award = { total: 60, breakdown: [] };
  assert.deepEqual(applyDailyCap(award, 0, 500), { total: 60, breakdown: [], capped: false });
  assert.equal(applyDailyCap(award, 470, 500).total, 30);
  assert.equal(applyDailyCap(award, 470, 500).capped, true);
  assert.equal(applyDailyCap(award, 500, 500).total, 0);
  assert.equal(applyDailyCap(award, 900, 500).total, 0); // never negative
});
