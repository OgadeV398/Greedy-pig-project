import 'dotenv/config';

const env = process.env;
const nodeEnv = env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';

if (isProd && (!env.JWT_SECRET || env.JWT_SECRET === 'change-me')) {
  throw new Error('JWT_SECRET must be set to a long random string in production');
}

export const config = {
  nodeEnv,
  isProd,
  isTest: nodeEnv === 'test',
  port: Number(env.PORT) || 5000,

  // DATABASE_URL wins; otherwise fall back to the DB_* vars from the main README.
  db: env.DATABASE_URL
    ? {
        connectionString: env.DATABASE_URL,
        // Hosted Postgres (Render, Neon, Supabase...) needs SSL. Set PGSSL=false to turn off.
        ssl: env.PGSSL === 'false' || !isProd ? false : { rejectUnauthorized: false },
      }
    : {
        user: env.DB_USER || 'postgres',
        host: env.DB_HOST || 'localhost',
        database: env.DB_NAME || 'greedy_pig',
        password: env.DB_PASSWORD || 'csc',
        port: Number(env.DB_PORT) || 5432,
      },

  // Per-IP, per-minute. Generous on purpose: a whole classroom can share one public IP.
  rateLimitPerMin: Number(env.RATE_LIMIT_PER_MIN) || 1200,

  jwtSecret: env.JWT_SECRET || 'dev-only-secret-do-not-use-in-prod',
  jwtExpiresIn: env.JWT_EXPIRES_IN || '7d',

  corsOrigins: (env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),

  game: {
    minPlayers: 2,
    maxPlayers: 8,
    minMaxPoints: 25, // matches min={25} on the Setup screen
    maxMaxPoints: 500,
    defaultMaxPoints: 100,
    minLevel: 1,
    maxLevel: 5,
    defaultLevel: 1,
  },
};
