import { readFile } from 'node:fs/promises';

async function text(path){return readFile(path,'utf8');}
function requireText(source,needle,label){if(!source.includes(needle))throw new Error(`UI contract missing: ${label}`);}

const [main,appV14,appV2,styles,panels,publicApp,apiApp,authz,apiKeysRoute,hermesApi,compose,whatsapp]=await Promise.all([
  text('apps/dashboard/src/main.tsx'),
  text('apps/dashboard/src/AppV14.tsx'),
  text('apps/dashboard/src/AppV2.tsx'),
  text('apps/dashboard/src/styles.css'),
  text('apps/dashboard/src/CompletionPanels.tsx'),
  text('App.tsx'),
  text('apps/api/src/app.ts'),
  text('apps/api/src/security/authz.ts'),
  text('apps/api/src/routes/api-keys.ts'),
  text('apps/api/src/routes/hermes.ts'),
  text('infra/docker/compose.yml'),
  text('apps/whatsapp/src/index.ts'),
]);

requireText(main,"import AppV14 from './AppV14'",'v1.4 shell mounted');
for(const [needle,label] of [
  ['pmmi-theme','light/dark preference'],['pmmi-sidebar-collapsed','collapsible sidebar preference'],['mobile-nav-open','mobile navigation drawer'],['API untuk Proyek','Developer API workspace'],['DeveloperApiPanel','Developer Key UI'],['AdminApiKeyPanel','Admin API key UI'],['Agent Key dibuat','Agent/Developer key separation copy'],
])requireText(appV14,needle,label);
if(appV14.includes('Chat AI')||appV14.includes('Mulai Chat'))throw new Error('UX v1.4 contract: dashboard must not expose Chat AI as a core surface');
if(/[✅❌🚀🎉🔥]/u.test(appV14))throw new Error('UX v1.4 contract: new shell must use icons, not emoji');
for(const [needle,label] of [
  ['--bg:#f7f8fa','light mode default tokens'],[':root[data-theme="dark"]','dark mode tokens'],['sidebar-collapsed','collapsed sidebar styles'],['@media(max-width:1000px)','mobile layout'],
])requireText(styles,needle,label);

// Preserve the existing completion surfaces while they are migrated into v1.4 workspaces.
for(const [needle,label] of [
  ['AdminSetupPanel','Admin setup available'],['UstadzAttendancePanel','Ustadz attendance available'],['AgentRuntimePanel','Santri agent runtime available'],['NotificationSettingsPanel','notification settings available'],['AdminPortfolioPanel','Admin portfolio manager available'],
])requireText(appV2,needle,label);
for(const [needle,label] of [
  ['/v1/admissions/periods','admission period UI'],['/v1/catalog/programs','program UI'],['/v1/catalog/cohorts','cohort UI'],['AdminEnrollmentPanel','enrollment queue UI'],['/roster','teacher roster UI'],['/attendance','attendance write UI'],['/v1/notifications/preferences','notification preference UI'],['/v1/notifications/channels','notification channel UI'],["kind:'start'|'stop'",'Hermes runtime action type'],['/v1/hermes/agents/${id}/${kind}','Hermes runtime endpoint'],["action(a.id,'start')",'Hermes start UI'],["action(a.id,'stop')",'Hermes stop UI'],
])requireText(panels,needle,label);
for(const [needle,label] of [['path="/activate"','activation route'],['path="/daftar"','public registration route'],['path="/portfolio"','public portfolio route']])requireText(publicApp,needle,label);

requireText(apiApp,'registerApiKeyRoutes','API key routes registered');
requireText(apiApp,'config.CORS_ORIGINS','CORS configured allowlist');
if(apiApp.includes('origin: true'))throw new Error('UI/security contract: permissive CORS is still enabled');
for(const [needle,label] of [
  ["app.post('/v1/ai/api-keys'",'Developer Key create endpoint'],["/v1/ai/api-keys/:id/rotate",'Developer Key rotate endpoint'],["app.delete('/v1/ai/api-keys/:id'",'Developer Key revoke endpoint'],["/v1/admin/ai/api-keys",'Admin API key endpoint'],
])requireText(apiKeysRoute,needle,label);
requireText(authz,"token?.startsWith('pmmi_')",'API key auth path');
requireText(authz,"'/v1/chat/completions'",'OpenAI-compatible API key scope');
requireText(hermesApi,"/v1/hermes/agents/:id/start",'Hermes start API');
requireText(hermesApi,"/v1/hermes/agents/:id/stop",'Hermes stop API');
requireText(compose,'Dockerfile.whatsapp','Baileys Compose service');
requireText(whatsapp,"app.post('/send'",'Baileys send endpoint');
requireText(whatsapp,"app.post('/pairing-code'",'Baileys pairing endpoint');
console.log('PMMI UX v1.4 frontend/operator contract: OK');
