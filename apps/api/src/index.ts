import Fastify from 'fastify';
import cors from '@fastify/cors';
import { registerAcademicRoutes } from './routes/academic.js';

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });
await registerAcademicRoutes(app);

app.get('/health', async () => ({ status: 'ok', service: 'pmmi-api' }));
app.get('/v1', async () => ({ name: 'PMMI Digital Campus API', phase: 2 }));

const port = Number(process.env.PORT ?? 3001);
const host = process.env.HOST ?? '0.0.0.0';
await app.listen({ port, host });
