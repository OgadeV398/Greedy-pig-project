import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { config } from '../config.js';
import { registerSchema, loginSchema } from '../lib/validation.js';
import * as accounts from '../services/accountService.js';

const router = Router();

// Brute-force protection on the two endpoints that take passwords.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: () => config.isTest,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many attempts. Please wait a few minutes and try again.' } },
});

router.post('/register', limiter, async (req, res) => {
  const body = registerSchema.parse(req.body);
  res.status(201).json(await accounts.register(body));
});

router.post('/login', limiter, async (req, res) => {
  const body = loginSchema.parse(req.body);
  res.json(await accounts.login(body));
});

export default router;
