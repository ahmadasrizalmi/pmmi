import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { pool, withTransaction } from '../db.js';
import { requireAuth } from '../security/authz.js';
import { config } from '../config.js';

const preferenceSchema = z.object({ category:z.string().min(1).max(80), channel:z.enum(['IN_APP','EMAIL','WHATSAPP','TELEGRAM']), enabled:z.boolean() });
const channelSchema = z.object({ channel:z.enum(['EMAIL','WHATSAPP']), address:z.string().min(3).max(200), enabled:z.boolean().default(true) });
const tokenHash=(value:string)=>createHash('sha256').update(value).digest('hex');

function verifySvix(raw:string,headers:Record<string,unknown>){
  if(!config.RESEND_WEBHOOK_SECRET)return false;
  const id=String(headers['svix-id']??'');const timestamp=String(headers['svix-timestamp']??'');const signature=String(headers['svix-signature']??'');if(!id||!timestamp||!signature)return false;
  const ts=Number(timestamp);if(!Number.isFinite(ts)||Math.abs(Date.now()/1000-ts)>300)return false;
  const encoded=config.RESEND_WEBHOOK_SECRET.replace(/^whsec_/,'');let key:Buffer;try{key=Buffer.from(encoded,'base64');}catch{return false;}
  const expected=createHmac('sha256',key).update(`${id}.${timestamp}.${raw}`).digest('base64');
  for(const item of signature.split(' ')){const [version,value]=item.split(',');if(version!=='v1'||!value)continue;const a=Buffer.from(expected);const b=Buffer.from(value);if(a.length===b.length&&timingSafeEqual(a,b))return true;}
  return false;
}

export async function registerNotificationRoutes(app:FastifyInstance){
  app.get('/v1/notifications',async(request,reply)=>{const session=await requireAuth(request,reply);if(!session)return;const query=z.object({unread:z.coerce.boolean().optional(),limit:z.coerce.number().int().min(1).max(100).default(50)}).safeParse(request.query);if(!query.success)return reply.code(400).send({error:'invalid query'});const result=await pool.query(`select id,type,category,title,body,data,priority,action_url,read_at,created_at from notifications where user_id=$1 and ($2::boolean is false or read_at is null) and (expires_at is null or expires_at>now()) order by created_at desc limit $3`,[session.sub,query.data.unread??false,query.data.limit]);const unread=await pool.query(`select count(*)::int count from notifications where user_id=$1 and read_at is null and (expires_at is null or expires_at>now())`,[session.sub]);return {items:result.rows,unread:unread.rows[0].count};});
  app.patch('/v1/notifications/:id/read',async(request,reply)=>{const session=await requireAuth(request,reply);if(!session)return;const {id}=request.params as {id:string};const result=await pool.query(`update notifications set read_at=coalesce(read_at,now()) where id=$1 and user_id=$2 returning id,read_at`,[id,session.sub]);if(!result.rowCount)return reply.code(404).send({error:'notification not found'});return result.rows[0];});
  app.post('/v1/notifications/read-all',async(request,reply)=>{const session=await requireAuth(request,reply);if(!session)return;const result=await pool.query(`update notifications set read_at=now() where user_id=$1 and read_at is null`,[session.sub]);return {updated:result.rowCount};});
  app.get('/v1/notifications/preferences',async(request,reply)=>{const session=await requireAuth(request,reply);if(!session)return;return {items:(await pool.query(`select category,channel,enabled from notification_preferences where user_id=$1 order by category,channel`,[session.sub])).rows};});
  app.put('/v1/notifications/preferences',async(request,reply)=>{const session=await requireAuth(request,reply);if(!session)return;const parsed=z.array(preferenceSchema).min(1).max(100).safeParse(request.body);if(!parsed.success)return reply.code(400).send({error:'invalid preferences',issues:parsed.error.flatten()});await withTransaction(async client=>{for(const item of parsed.data)await client.query(`insert into notification_preferences(user_id,category,channel,enabled) values($1,$2,$3,$4) on conflict(user_id,category,channel) do update set enabled=excluded.enabled,updated_at=now()`,[session.sub,item.category,item.channel,item.enabled]);});return {updated:parsed.data.length};});
  app.get('/v1/notifications/channels',async(request,reply)=>{const session=await requireAuth(request,reply);if(!session)return;return {items:(await pool.query(`select id,channel,address_or_external_id,verified_at,enabled,priority,metadata from user_notification_channels where user_id=$1 order by priority,created_at`,[session.sub])).rows};});
  app.put('/v1/notifications/channels',async(request,reply)=>{const session=await requireAuth(request,reply);if(!session)return;const parsed=channelSchema.safeParse(request.body);if(!parsed.success)return reply.code(400).send({error:'invalid channel'});const result=await pool.query(`insert into user_notification_channels(user_id,channel,address_or_external_id,verified_at,enabled) values($1,$2,$3,case when $2='EMAIL' then now() else null end,$4) on conflict(user_id,channel,address_or_external_id) do update set enabled=excluded.enabled,updated_at=now() returning id,channel,address_or_external_id,verified_at,enabled`,[session.sub,parsed.data.channel,parsed.data.address,parsed.data.enabled]);return result.rows[0];});
  app.post('/v1/notifications/telegram/link-token',async(request,reply)=>{const session=await requireAuth(request,reply);if(!session)return;const token=randomBytes(24).toString('hex');await pool.query(`insert into channel_link_tokens(user_id,channel,token_hash,expires_at) values($1,'TELEGRAM',$2,now()+interval '15 minutes')`,[session.sub,tokenHash(token)]);return {token,expiresInSeconds:900,deepLink:config.TELEGRAM_BOT_USERNAME?`https://t.me/${config.TELEGRAM_BOT_USERNAME}?start=${token}`:null};});
  app.post('/v1/integrations/telegram/webhook',async(request,reply)=>{if(config.TELEGRAM_WEBHOOK_SECRET&&request.headers['x-telegram-bot-api-secret-token']!==config.TELEGRAM_WEBHOOK_SECRET)return reply.code(403).send({error:'invalid webhook secret'});const body=request.body as any;const text=body?.message?.text as string|undefined;const chatId=body?.message?.chat?.id;if(!text?.startsWith('/start ')||chatId===undefined)return {ok:true,linked:false};const token=text.slice(7).trim();const linked=await withTransaction(async client=>{const result=await client.query(`select id,user_id from channel_link_tokens where channel='TELEGRAM' and token_hash=$1 and used_at is null and expires_at>now() for update`,[tokenHash(token)]);if(!result.rowCount)return false;const row=result.rows[0];await client.query(`update channel_link_tokens set used_at=now() where id=$1`,[row.id]);await client.query(`insert into user_notification_channels(user_id,channel,address_or_external_id,verified_at,metadata) values($1,'TELEGRAM',$2,now(),$3::jsonb) on conflict(user_id,channel,address_or_external_id) do update set verified_at=now(),enabled=true,updated_at=now()`,[row.user_id,String(chatId),JSON.stringify({username:body?.message?.chat?.username??null})]);return true;});return {ok:true,linked};});

  await app.register(async resend=>{
    resend.removeContentTypeParser('application/json');
    resend.addContentTypeParser('application/json',{parseAs:'string'},(_req,body,done)=>done(null,body));
    resend.post('/v1/integrations/resend/webhook',async(request,reply)=>{
      const raw=String(request.body??'');if(!verifySvix(raw,request.headers as Record<string,unknown>))return reply.code(401).send({error:'invalid webhook signature'});
      let event:any;try{event=JSON.parse(raw);}catch{return reply.code(400).send({error:'invalid JSON'});}const emailId=event?.data?.email_id;if(!emailId)return {ok:true,updated:0};
      const delivered=['email.delivered'].includes(event.type);const failed=['email.bounced','email.failed'].includes(event.type);if(!delivered&&!failed)return {ok:true,updated:0};
      const result=await pool.query(`update notification_deliveries set status=$1,delivered_at=case when $1='DELIVERED' then now() else delivered_at end,last_error=case when $1='FAILED' then $2 else null end,updated_at=now() where channel='EMAIL' and provider_message_id=$3`,[delivered?'DELIVERED':'FAILED',failed?event.type:null,emailId]);return {ok:true,updated:result.rowCount};
    });
  });
}
