import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { historyQuerySchema } from '../lib/validation.js';
import { levelTable, DAILY_XP_CAP } from '../lib/progression.js';
import * as accounts from '../services/accountService.js';

const router = Router();

// Public: the level ladder (for a "how do levels work" screen).
router.get('/levels', (_req, res) => {
  res.json({ daily_xp_cap: DAILY_XP_CAP, levels: levelTable() });
});

// The logged-in player's profile + level/XP progress.
router.get('/me', requireAuth, async (req, res) => {
  res.json({ player: await accounts.getProfile(req.user.id) });
});

// Recent XP awards, newest first (powers an "XP history" list).
router.get('/me/xp-history', requireAuth, async (req, res) => {
  const { limit } = historyQuerySchema.parse(req.query);
  res.json({ events: await accounts.getXpHistory(req.user.id, limit) });
});

export default router;
