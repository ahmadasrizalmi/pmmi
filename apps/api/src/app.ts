import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { config } from './config.js';
import { registerAuthRoutes } from './routes/auth.js';
import { registerUserRoutes } from './routes/users.js';
import { registerApplicantRoutes } from './routes/applicant.js';
import { registerApplicantAdminRoutes } from './routes/applicant-admin.js';
import { registerAdmissionRoutes } from './routes/admissions.js';
import { registerAcademicRoutes } from './routes/academic.js';
import { registerAcademicExtraRoutes } from './routes/academic-extra.js';
import { registerCatalogRoutes } from './routes/catalog.js';
import { registerNotificationRoutes } from './routes/notifications.js';
import { registerAiRoutes } from './routes/ai.js';
import { registerHermesRoutes } from './routes/hermes.js';
import { registerRewardRoutes } from './routes/rewards.js';
import { registerDashboardRoutes } from './routes/dashboard.js';
import { registerOpsRoutes } from './routes/ops.js';
import { registerLifecycleRoutes } from './routes/lifecycle.js';
import { registerAdminExtraRoutes } from './routes/admin-extra.js';

function allowedOrigins(){
  const configured=config.CORS_ORIGINS.split(',').map(value=>value.trim()).filter(Boolean);
  return new Set([config.PUBLIC_WEB_URL,config.DASHBOARD_URL,...configured].map(value=>value.replace(/\/$/,'')));
}

export async function buildApp() {
  const app = Fastify({ logger: true, bodyLimit: 2 * 1024 * 1024 });
  const origins=allowedOrigins();
  await app.register(cors, {
    origin(origin,callback){
      if(!origin || origins.has(origin.replace(/\/$/,'')))return callback(null,true);
      return callback(new Error('origin not allowed'),false);
    },
    credentials:true,
  });
  await app.register(jwt, { secret: config.JWT_SECRET });
  app.get('/health', async () => ({ status: 'ok', service: 'pmmi-api' }));
  app.get('/v1', async () => ({ name: 'PMMI Digital Campus API', phases: 'blueprint-complete', status: 'hardened' }));
  await registerAuthRoutes(app);
  await registerUserRoutes(app);
  await registerAdminExtraRoutes(app);
  await registerApplicantAdminRoutes(app);
  await registerCatalogRoutes(app);
  await registerApplicantRoutes(app);
  await registerAdmissionRoutes(app);
  await registerAcademicRoutes(app);
  await registerAcademicExtraRoutes(app);
  await registerLifecycleRoutes(app);
  await registerNotificationRoutes(app);
  await registerAiRoutes(app);
  await registerHermesRoutes(app);
  await registerRewardRoutes(app);
  await registerDashboardRoutes(app);
  await registerOpsRoutes(app);
  return app;
}