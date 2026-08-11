import { randomUUID } from 'node:crypto';
import { workerConfig } from './config.js';

export type ExternalChannel='EMAIL'|'WHATSAPP'|'TELEGRAM';
export class ProviderUnavailable extends Error {}

async function checkedJson(url:string,options:RequestInit){
  const response=await fetch(url,options);const text=await response.text();if(!response.ok)throw new Error(`provider ${response.status}: ${text.slice(0,500)}`);try{return JSON.parse(text);}catch{return {raw:text};}
}

export async function sendExternal(channel:ExternalChannel,to:string,subject:string|undefined,body:string){
  if(workerConfig.NOTIFICATION_TRANSPORT==='mock')return {providerMessageId:`mock-${randomUUID()}`};
  if(channel==='EMAIL'){
    if(!workerConfig.RESEND_API_KEY)throw new ProviderUnavailable('Resend is not configured');
    const data:any=await checkedJson('https://api.resend.com/emails',{method:'POST',headers:{authorization:`Bearer ${workerConfig.RESEND_API_KEY}`,'content-type':'application/json'},body:JSON.stringify({from:workerConfig.EMAIL_FROM,to:[to],subject:subject??'PMMI Digital Campus',text:body})});
    return {providerMessageId:String(data?.id??'')};
  }
  if(channel==='TELEGRAM'){
    if(!workerConfig.TELEGRAM_BOT_TOKEN)throw new ProviderUnavailable('Telegram Bot is not configured');
    const data:any=await checkedJson(`https://api.telegram.org/bot${workerConfig.TELEGRAM_BOT_TOKEN}/sendMessage`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({chat_id:to,text:body,disable_web_page_preview:true})});
    return {providerMessageId:String(data?.result?.message_id??'')};
  }
  if(workerConfig.WHATSAPP_PROVIDER==='disabled')throw new ProviderUnavailable('WhatsApp provider disabled');
  if(workerConfig.WHATSAPP_PROVIDER==='baileys'){
    if(!workerConfig.BAILEYS_GATEWAY_URL)throw new ProviderUnavailable('Baileys gateway is not configured');
    const data:any=await checkedJson(`${workerConfig.BAILEYS_GATEWAY_URL.replace(/\/$/,'')}/messages`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({to,text:body})});
    return {providerMessageId:String(data?.id??data?.messageId??'')};
  }
  if(!workerConfig.META_WHATSAPP_URL||!workerConfig.META_WHATSAPP_TOKEN)throw new ProviderUnavailable('Meta WhatsApp is not configured');
  const data:any=await checkedJson(workerConfig.META_WHATSAPP_URL,{method:'POST',headers:{authorization:`Bearer ${workerConfig.META_WHATSAPP_TOKEN}`,'content-type':'application/json'},body:JSON.stringify({messaging_product:'whatsapp',to,type:'text',text:{body}})});
  return {providerMessageId:String(data?.messages?.[0]?.id??'')};
}
