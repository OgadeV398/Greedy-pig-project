import { Router } from 'express';
import { optionalAuth } from '../middleware/auth.js';
import { startGameSchema, gameIdSchema } from '../lib/validation.js';
import * as games from '../services/gameService.js';

const router = Router();
router.use(optionalAuth); // guests can play; logged-in players earn XP

router.post('/start', async (req, res) => {
  const body = startGameSchema.parse(req.body);
  res.status(201).json(await games.startGame(body, req.user));
});

router.post('/roll', async (req, res) => {
  const { gameId } = gameIdSchema.parse(req.body);
  res.json(await games.advanceGame(gameId, 'roll', req.user));
});

router.post('/hold', async (req, res) => {
  const { gameId } = gameIdSchema.parse(req.body);
  res.json(await games.advanceGame(gameId, 'hold', req.user));
});

// Resume a game after a refresh / back-button.
router.get('/:gameId', async (req, res) => {
  const { gameId } = gameIdSchema.parse(req.params);
  res.json(await games.getGame(gameId, req.user));
});

export default router;
