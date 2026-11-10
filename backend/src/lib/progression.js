/**
 * Levels & XP — pure functions, no DB. This file is the single source of truth
 * for the progression rules.
 *
 *   XP needed to REACH level n  =  50 * n * (n - 1)
 *   L2=100  L3=300  L4=600  L5=1000  L10=4500  L25=30000
 *
 * Early levels come fast (hooks new players); later ones take real commitment.
 */

export const MAX_LEVEL = 50;
export const DAILY_XP_CAP = 500; // rolling 24h; blunts "play against yourself" farming

export const TITLES = [
  { minLevel: 1, title: 'Piglet' },
  { minLevel: 3, title: 'Mud Wallower' },
  { minLevel: 5, title: 'Truffle Hunter' },
  { minLevel: 8, title: 'Bacon Baron' },
  { minLevel: 12, title: 'Hog Hero' },
  { minLevel: 18, title: 'Swine Sage' },
  { minLevel: 25, title: 'Legendary Boar' },
];

export const xpForLevel = (level) => 50 * level * (level - 1);

export function levelFromXp(xp) {
  let level = 1;
  while (level < MAX_LEVEL && xp >= xpForLevel(level + 1)) level++;
  return level;
}

export function titleForLevel(level) {
  let title = TITLES[0].title;
  for (const t of TITLES) if (level >= t.minLevel) title = t.title;
  return title;
}

/** Everything a UI needs to draw a level badge + progress bar. */
export function progressSummary(xp) {
  const level = levelFromXp(xp);
  const isMaxLevel = level >= MAX_LEVEL;
  const floor = xpForLevel(level);
  const ceiling = isMaxLevel ? floor : xpForLevel(level + 1);
  const xpIntoLevel = xp - floor;
  const span = ceiling - floor;
  return {
    xp,
    level,
    title: titleForLevel(level),
    xp_into_level: xpIntoLevel,
    xp_to_next_level: isMaxLevel ? 0 : ceiling - xp,
    xp_for_next_level: isMaxLevel ? null : ceiling,
    progress_pct: isMaxLevel || span === 0 ? 100 : Math.floor((xpIntoLevel / span) * 100),
    is_max_level: isMaxLevel,
  };
}

export function levelTable() {
  return Array.from({ length: MAX_LEVEL }, (_, i) => {
    const level = i + 1;
    return { level, xp_required: xpForLevel(level), title: titleForLevel(level) };
  });
}

/**
 * XP for one finished game. Inputs come from the SERVER's game state only.
 *
 *  - Playing:      10 + 1 per 10 target points      (100-pt game -> 20)
 *  - Winning:      20 + 1 per  5 target points      (100-pt game -> 40)
 *  - Bold turn:    best banked/winning turn >= 20 -> +10, >= 30 -> +20
 *                  (rewards the push-your-luck spirit)
 */
export function computeGameXp({ maxPoints, won, bestTurn }) {
  const breakdown = [{ reason: 'Played a match', amount: 10 + Math.floor(maxPoints / 10) }];
  if (won) breakdown.push({ reason: 'Won the match', amount: 20 + Math.floor(maxPoints / 5) });
  if (bestTurn >= 30) breakdown.push({ reason: 'Greedy turn (30+ in one turn)', amount: 20 });
  else if (bestTurn >= 20) breakdown.push({ reason: 'Bold turn (20+ in one turn)', amount: 10 });
  const total = breakdown.reduce((sum, b) => sum + b.amount, 0);
  return { total, breakdown };
}

/** Trim an award so the last-24h total never exceeds the cap. */
export function applyDailyCap(award, earnedLast24h, cap = DAILY_XP_CAP) {
  const room = Math.max(0, cap - earnedLast24h);
  const granted = Math.min(award.total, room);
  return {
    total: granted,
    breakdown: award.breakdown,
    capped: granted < award.total,
  };
}
