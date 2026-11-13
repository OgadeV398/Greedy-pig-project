import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import { query } from './db.js';
import { errorHandler, notFound } from './middleware/errors.js';
import authRoutes from './routes/auth.js';
import gameRoutes from './routes/game.js';
import leaderboardRoutes from './routes/leaderboard.js';
import progressRoutes from './routes/progress.js';

export function createApp() {
  const app = express();
  app.set('trust proxy', 1); // behind Render/Railway/Vercel proxies: needed for correct client IPs

  app.use(helmet());
  app.use(
    cors({
      origin(origin, cb) {
        // no Origin header = curl / server-to-server; otherwise it must be on the allow-list
        if (!origin || config.corsOrigins.includes(origin)) return cb(null, true);
        cb(null, false);
      },
    })
  );
  app.use(express.json({ limit: '10kb' }));
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      limit: config.rateLimitPerMin,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      skip: () => config.isTest,
      message: { error: { code: 'RATE_LIMITED', message: 'Slow down a little!' } },
    })
  );

  app.get('/api/health', async (_req, res) => {
    try {
      await query('SELECT 1');
      res.json({ status: 'ok' });
    } catch {
      res.status(503).json({ status: 'db_unavailable' });
    }
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/game', gameRoutes);
  app.use('/api/leaderboard', leaderboardRoutes);
  app.use('/api', progressRoutes); // /levels, /me, /me/xp-history

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
