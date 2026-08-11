import { readFile } from 'node:fs/promises';

async function text(path){return readFile(path,'utf8');}
function requireText(source,needle,label){if(!source.includes(needle))throw new Error(`UI contract missing: ${label}`);}

const [appV2,panels,publicApp,apiApp,hermesApi,compose,whatsapp]=await Promise.all([
  text('apps/dashboard/src/AppV2.tsx'),
  text('apps/dashboard/src/CompletionPanels.tsx'),
  text('App.tsx'),
  text('apps/api/src/app.ts'),
  text('apps/api/src/routes/hermes.ts'),
  text('infra/docker/compose.yml'),
  text('apps/whatsapp/src/index.ts'),
]);

for(const [needle,label] of [
  ['AdminSetupPanel','Admin setup mounted'],['UstadzAttendancePanel','Ustadz attendance mounted'],['AgentRuntimePanel','Santri agent runtime mounted'],['NotificationSettingsPanel','notification settings mounted'],['AdminPortfolioPanel','Admin portfolio manager mounted'],
])requireText(appV2,needle,label);
for(const [needle,label] of [
  ['/v1/admissions/periods','admission period UI'],['/v1/catalog/programs','program UI'],['/v1/catalog/cohorts','cohort UI'],['AdminEnrollmentPanel','enrollment queue UI'],['/roster','teacher roster UI'],['/attendance','attendance write UI'],['/v1/notifications/preferences','notification preference UI'],['/v1/notifications/channels','notification channel UI'],['/start','Hermes start UI'],['/stop','Hermes stop UI'],
])requireText(panels,needle,label);
for(const [needle,label] of [['path="/activate"','activation route'],['path="/daftar"','public registration route'],['path="/portfolio"','public portfolio route']])requireText(publicApp,needle,label);
requireText(apiApp,'config.CORS_ORIGINS','CORS configured allowlist');
if(apiApp.includes('origin: true'))throw new Error('UI/security contract: permissive CORS is still enabled');
requireText(hermesApi,"/v1/hermes/agents/:id/start",'Hermes start API');
requireText(hermesApi,"/v1/hermes/agents/:id/stop",'Hermes stop API');
requireText(compose,'Dockerfile.whatsapp','Baileys Compose service');
requireText(whatsapp,"app.post('/send'",'Baileys send endpoint');
requireText(whatsapp,"app.post('/pairing-code'",'Baileys pairing endpoint');
console.log('PMMI frontend/operator completion contract: OK');
