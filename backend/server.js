import { config } from './src/config.js';
import { createApp } from './src/app.js';
import { migrate } from './src/db/migrate.js';
import { pool } from './src/db.js';

try {
  await migrate(); // idempotent; means a fresh deploy "just works"
} catch (err) {
  console.error('Could not prepare the database:', err.message);
  process.exit(1);
}

const server = createApp().listen(config.port, () =>
  console.log(`Greedy Pig API listening on :${config.port} (${config.nodeEnv})`)
);

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => pool.end().then(() => process.exit(0))));
}
