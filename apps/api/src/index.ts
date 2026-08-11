import { buildApp } from './app.js';
import { config } from './config.js';
import { closeDatabase } from './db.js';

const app = await buildApp();

const shutdown = async () => {
  await app.close();
  await closeDatabase();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

await app.listen({ port: config.PORT, host: config.HOST });
