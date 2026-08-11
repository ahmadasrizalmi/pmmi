import Fastify from 'fastify';
import makeWASocket,{DisconnectReason,useMultiFileAuthState} from '@whiskeysockets/baileys';
import pino from 'pino';
import { z } from 'zod';

const env=z.object({
  PORT:z.coerce.number().int().positive().default(3010),
  HOST:z.string().default('0.0.0.0'),
  BAILEYS_AUTH_DIR:z.string().default('/data/auth'),
  BAILEYS_SERVICE_TOKEN:z.string().min(24),
}).parse(process.env);

const logger=pino({level:process.env.LOG_LEVEL??'warn'});
let socket:ReturnType<typeof makeWASocket>|null=null;
let state:{connection:'connecting'|'open'|'closed'|'logged_out';qr:string|null;lastError:string|null}={connection:'connecting',qr:null,lastError:null};
let reconnectTimer:NodeJS.Timeout|null=null;

function authorized(value:unknown){return typeof value==='string'&&value===`Bearer ${env.BAILEYS_SERVICE_TOKEN}`;}
function toJid(value:string){const digits=value.replace(/\D/g,'');if(digits.length<8||digits.length>16)throw new Error('WhatsApp destination must include country code');return `${digits}@s.whatsapp.net`;}

async function connect(){
  if(reconnectTimer){clearTimeout(reconnectTimer);reconnectTimer=null;}
  state={...state,connection:'connecting',lastError:null};
  const {state:auth,saveCreds}=await useMultiFileAuthState(env.BAILEYS_AUTH_DIR);
  const sock=makeWASocket({auth,logger,printQRInTerminal:false,syncFullHistory:false,markOnlineOnConnect:false});
  socket=sock;
  sock.ev.on('creds.update',saveCreds);
  sock.ev.on('connection.update',update=>{
    if(update.qr)state={...state,qr:update.qr,connection:'connecting'};
    if(update.connection==='open')state={connection:'open',qr:null,lastError:null};
    if(update.connection==='close'){
      const statusCode=(update.lastDisconnect?.error as any)?.output?.statusCode as number|undefined;
      const loggedOut=statusCode===DisconnectReason.loggedOut;
      state={connection:loggedOut?'logged_out':'closed',qr:null,lastError:String((update.lastDisconnect?.error as any)?.message??'connection closed')};
      socket=null;
      if(!loggedOut)reconnectTimer=setTimeout(()=>{void connect().catch(error=>logger.error({error},'Baileys reconnect failed'));},5000);
    }
  });
}

const app=Fastify({logger:false,bodyLimit:64*1024});
app.get('/health',async()=>({status:'ok',service:'pmmi-whatsapp',connection:state.connection}));
app.get('/session',async(request,reply)=>{if(!authorized(request.headers.authorization))return reply.code(401).send({error:'unauthorized'});return state;});
app.post('/pairing-code',async(request,reply)=>{
  if(!authorized(request.headers.authorization))return reply.code(401).send({error:'unauthorized'});
  const parsed=z.object({phone:z.string().min(8).max(20)}).safeParse(request.body);if(!parsed.success)return reply.code(400).send({error:'invalid phone'});
  if(!socket)return reply.code(503).send({error:'WhatsApp socket is not ready'});
  const digits=parsed.data.phone.replace(/\D/g,'');
  try{return {code:await socket.requestPairingCode(digits)};}catch(error:any){return reply.code(502).send({error:String(error?.message??error)});}
});
app.post('/send',async(request,reply)=>{
  if(!authorized(request.headers.authorization))return reply.code(401).send({error:'unauthorized'});
  const parsed=z.object({to:z.string().min(8).max(32),text:z.string().min(1).max(12000)}).safeParse(request.body);if(!parsed.success)return reply.code(400).send({error:'invalid message'});
  if(!socket||state.connection!=='open')return reply.code(503).send({error:'WhatsApp session is not connected'});
  try{const sent=await socket.sendMessage(toJid(parsed.data.to),{text:parsed.data.text});return {id:sent?.key?.id??null,messageId:sent?.key?.id??null};}catch(error:any){logger.error({error},'WhatsApp send failed');return reply.code(502).send({error:String(error?.message??error)});}
});

await connect().catch(error=>{state={connection:'closed',qr:null,lastError:String(error)};logger.error({error},'Initial Baileys connection failed');});
await app.listen({port:env.PORT,host:env.HOST});
