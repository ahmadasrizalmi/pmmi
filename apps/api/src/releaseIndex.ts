import { buildReleaseApp } from './releaseApp.js';
import { config } from './config.js';
const app=await buildReleaseApp();
await app.listen({port:config.PORT,host:config.HOST});
