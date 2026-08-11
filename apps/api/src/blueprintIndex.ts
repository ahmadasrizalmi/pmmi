import { buildBlueprintApp } from './blueprintApp.js';
import { config } from './config.js';

const app=await buildBlueprintApp();
await app.listen({port:config.PORT,host:config.HOST});
