import { z } from 'zod';
import { config } from '../config.js';

const { game } = config;

export const usernameSchema = z
  .string({ required_error: 'Username is required' })
  .trim()
  .regex(/^[A-Za-z0-9_]{3,20}$/, 'Username must be 3-20 characters: letters, numbers or underscore');

export const registerSchema = z.object({
  username: usernameSchema,
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be at most 72 characters'),
});

export const loginSchema = z.object({
  username: z.string({ required_error: 'Username is required' }).trim().min(1, 'Username is required').max(100),
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required').max(72),
});

// Accepts "Alice" or { name, tag } — the shape the frontend's playerData already uses.
const seat = z.union([
  z.string().trim().max(20, 'Player names can be at most 20 characters'),
  z.object({
    name: z.string().trim().max(20, 'Player names can be at most 20 characters').optional(),
    tag: z.string().trim().max(20).optional(),
  }),
]);

export const startGameSchema = z
  .object({
    players: z
      .array(seat, { required_error: 'players is required' })
      .min(game.minPlayers, `At least ${game.minPlayers} players are needed`)
      .max(game.maxPlayers, `At most ${game.maxPlayers} players can play`),
    // UI number inputs arrive as strings ("100"), so coerce.
    maxPoints: z.coerce
      .number()
      .int('Max score must be a whole number')
      .min(game.minMaxPoints, `Max score must be at least ${game.minMaxPoints}`)
      .max(game.maxMaxPoints, `Max score must be at most ${game.maxMaxPoints}`)
      .default(game.defaultMaxPoints),
    level: z.coerce
      .number()
      .int('Level must be a whole number')
      .min(game.minLevel, `Level must be at least ${game.minLevel}`)
      .max(game.maxLevel, `Level must be at most ${game.maxLevel}`)
      .default(game.defaultLevel),
    // Which seat is the logged-in account? Defaults to seat 0 when a token is sent.
    linkedIndex: z.number().int().min(0).nullish(),
  })
  .superRefine((v, ctx) => {
    if (v.linkedIndex != null && v.linkedIndex >= v.players.length) {
      ctx.addIssue({ code: 'custom', path: ['linkedIndex'], message: 'linkedIndex must point at one of the players' });
    }
  });

export const gameIdSchema = z.object({
  gameId: z.string({ required_error: 'gameId is required' }).uuid('gameId is not valid'),
});

export const leaderboardQuerySchema = z.object({
  search: z.string().trim().max(50).optional().default(''),
  minPoints: z.preprocess(
    (v) => (v === '' || v === undefined ? 0 : v),
    z.coerce.number().int().min(0).default(0)
  ),
  sort: z.enum(['wins', 'level']).optional().default('wins'),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const historyQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});
