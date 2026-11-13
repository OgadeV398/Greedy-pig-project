import { Router } from 'express';
import { leaderboardQuerySchema } from '../lib/validation.js';
import { getLeaderboard } from '../services/leaderboardService.js';

const router = Router();

// Returns a plain array, which is what the existing frontend service expects.
router.get('/', async (req, res) => {
  const filters = leaderboardQuerySchema.parse(req.query);
  res.json(await getLeaderboard(filters));
});

export default router;
