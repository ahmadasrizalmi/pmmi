import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { config } from './config.js';
import { registerAuthRoutes } from './routes/auth.js';
import { registerAcademicRoutes } from './routes/academic.js';
import { registerCompleteAdmissionRoutes } from './routes/completeAdmissions.js';
import { registerBlueprintAdmissionRoutes } from './routes/blueprintAdmissions.js';
import { registerBlueprintAcademicRoutes } from './routes/blueprintAcademic.js';
import { registerBlueprintNotificationRoutes } from './routes/blueprintNotifications.js';
import { registerFinalAIRoutes } from './routes/finalAI.js';
import { registerFinalHermesRewardRoutes } from './routes/finalHermesRewards.js';
import { registerBlueprintOpsRoutes } from './routes/blueprintOps.js';

export async function buildReleaseApp(){
  const app=Fastify({logger:true});
  await app.register(cors,{origin:true});
  await app.register(jwt,{secret:config.JWT_SECRET});
  app.get('/health',async()=>({status:'ok',service:'pmmi-api',runtime:'release-blueprint'}));
  app.get('/v1',async()=>({name:'PMMI Digital Campus API',status:'release-blueprint',corePhases:[1,2]}));
  await registerAuthRoutes(app);
  await registerCompleteAdmissionRoutes(app);
  await registerAcademicRoutes(app);
  await registerBlueprintAdmissionRoutes(app);
  await registerBlueprintAcademicRoutes(app);
  await registerBlueprintNotificationRoutes(app);
  await registerFinalAIRoutes(app);
  await registerFinalHermesRewardRoutes(app);
  await registerBlueprintOpsRoutes(app);
  return app;
}
