import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { config } from './config.js';
import { registerAuthRoutes } from './routes/auth.js';
import { registerAdmissionRoutes } from './routes/admissions.js';
import { registerAcademicRoutes } from './routes/academic.js';

export async function buildApp() {
  const app = Fastify({ logger: true });
  await app.register(cors, { origin: true });
  await app.register(jwt, { secret: config.JWT_SECRET });

  app.get('/health', async () => ({ status: 'ok', service: 'pmmi-api' }));
  app.get('/v1', async () => ({ name: 'PMMI Digital Campus API', phases: [1, 2], status: 'hardened' }));

  await registerAuthRoutes(app);
  await registerAdmissionRoutes(app);
  await registerAcademicRoutes(app);
  return app;
}
