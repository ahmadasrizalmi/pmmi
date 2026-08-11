import { randomUUID } from 'node:crypto';
import { workerConfig } from './config.js';

export type ExternalChannel='EMAIL'|'WHATSAPP'|'TELEGRAM';
export class ProviderUnavailable extends Error { constructor(message:string){super(message);this.name='ProviderUnavailable';} }

type Circuit={failures:number;openUntil:number};
const circuits=new Map<ExternalChannel,Circuit>();
const FAILURE_THRESHOLD=3;
const OPEN_MS=60_000;

function assertCircuit(channel:ExternalChannel){const c=circuits.get(channel);if(c&&c.openUntil>Date.now())throw new ProviderUnavailable(`${channel} provider circuit open`);if(c&&c.openUntil&&c.openUntil<=Date.now())circuits.set(channel,{failures:0,openUntil:0});}
function success(channel:ExternalChannel){circuits.set(channel,{failures:0,openUntil:0});}
function failure(channel:ExternalChannel,error:unknown){const prev=circuits.get(channel)??{failures:0,openUntil:0};const failures=prev.failures+1;circuits.set(channel,{failures,openUntil:failures>=FAILURE_THRESHOLD?Date.now()+OPEN_MS:0});return error;}

async function jsonFetch(url:string,init:RequestInit){
  const response=await fetch(url,init);const text=await response.text();let body:any=null;try{body=text?JSON.parse(text):null;}catch{body=text;}
  if(!response.ok)throw new Error(`${response.status} ${typeof body==='string'?body:JSON.stringify(body)}`);
  return body;
}

async function email(to:string,title:string,body:string){
  if(!workerConfig.RESEND_API_KEY)throw new ProviderUnavailable('Resend is not configured');
  const data=await jsonFetch('https://api.resend.com/emails',{method:'POST',headers:{authorization:`Bearer ${workerConfig.RESEND_API_KEY}`,'content-type':'application/json'},body:JSON.stringify({from:workerConfig.EMAIL_FROM,to:[to],subject:title,text:body})});
  return String(data?.id??randomUUID());
}
async function telegram(to:string,title:string,body:string){
  if(!workerConfig.TELEGRAM_BOT_TOKEN)throw new ProviderUnavailable('Telegram bot is not configured');
  const data=await jsonFetch(`https://api.telegram.org/bot${workerConfig.TELEGRAM_BOT_TOKEN}/sendMessage`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({chat_id:to,text:`${title}\n\n${body}`,disable_web_page_preview:true})});
  return String(data?.result?.message_id??randomUUID());
}
async function whatsapp(to:string,title:string,body:string){
  if(workerConfig.WHATSAPP_PROVIDER==='disabled')throw new ProviderUnavailable('WhatsApp provider is disabled');
  if(workerConfig.WHATSAPP_PROVIDER==='baileys'){
    if(!workerConfig.BAILEYS_GATEWAY_URL||!workerConfig.BAILEYS_SERVICE_TOKEN)throw new ProviderUnavailable('Baileys gateway is not configured');
    const data=await jsonFetch(`${workerConfig.BAILEYS_GATEWAY_URL.replace(/\/$/,'')}/send`,{method:'POST',headers:{authorization:`Bearer ${workerConfig.BAILEYS_SERVICE_TOKEN}`,'content-type':'application/json'},body:JSON.stringify({to,text:`${title}\n\n${body}`})});
    return String(data?.id??data?.messageId??randomUUID());
  }
  if(!workerConfig.META_WHATSAPP_URL||!workerConfig.META_WHATSAPP_TOKEN)throw new ProviderUnavailable('Meta WhatsApp adapter is not configured');
  const data=await jsonFetch(workerConfig.META_WHATSAPP_URL,{method:'POST',headers:{authorization:`Bearer ${workerConfig.META_WHATSAPP_TOKEN}`,'content-type':'application/json'},body:JSON.stringify({messaging_product:'whatsapp',to,type:'text',text:{body:`${title}\n\n${body}`}})});
  return String(data?.messages?.[0]?.id??randomUUID());
}

export async function sendExternal(channel:ExternalChannel,to:string,title:string,body:string){
  if(workerConfig.NOTIFICATION_TRANSPORT==='mock')return {providerMessageId:`mock-${channel.toLowerCase()}-${randomUUID()}`};
  assertCircuit(channel);
  try{
    const providerMessageId=channel==='EMAIL'?await email(to,title,body):channel==='TELEGRAM'?await telegram(to,title,body):await whatsapp(to,title,body);
    success(channel);return {providerMessageId};
  }catch(error){failure(channel,error);throw error;}
}

export function providerCircuitState(){return Object.fromEntries([...circuits.entries()].map(([channel,state])=>[channel,{...state,open:state.openUntil>Date.now()}]));}
