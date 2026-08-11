import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { config } from './config.js';
import { registerAuthRoutes } from './routes/auth.js';
import { registerAdmissionRoutes } from './routes/admissions.js';
import { registerAcademicRoutes } from './routes/academic.js';
import { registerBlueprintAdmissionRoutes } from './routes/blueprintAdmissions.js';
import { registerBlueprintAcademicRoutes } from './routes/blueprintAcademic.js';
import { registerBlueprintNotificationRoutes } from './routes/blueprintNotifications.js';
import { registerBlueprintAIHermesRoutes } from './routes/blueprintAIHermes.js';
import { registerBlueprintOpsRoutes } from './routes/blueprintOps.js';

export async function buildBlueprintApp(){
  const app=Fastify({logger:true});
  await app.register(cors,{origin:true});
  await app.register(jwt,{secret:config.JWT_SECRET});
  app.get('/health',async()=>({status:'ok',service:'pmmi-api',blueprint:true}));
  app.get('/v1',async()=>({name:'PMMI Digital Campus API',status:'blueprint-code-complete',corePhases:[1,2]}));
  await registerAuthRoutes(app);
  await registerAdmissionRoutes(app);
  await registerAcademicRoutes(app);
  await registerBlueprintAdmissionRoutes(app);
  await registerBlueprintAcademicRoutes(app);
  await registerBlueprintNotificationRoutes(app);
  await registerBlueprintAIHermesRoutes(app);
  await registerBlueprintOpsRoutes(app);
  return app;
}
