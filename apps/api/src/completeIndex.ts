import { buildCompleteApp } from './completeApp.js';
import { config } from './config.js';

const app=await buildCompleteApp();
await app.listen({port:config.PORT,host:config.HOST});
