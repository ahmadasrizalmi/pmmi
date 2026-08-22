import { randomUUID } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { pool, withTransaction } from '../db.js';
import { requireAuth } from '../security/authz.js';
import { enqueueOutbox } from '../events.js';

const ruleSchema=z.object({code:z.string().min(2).max(80).regex(/^[A-Z0-9_]+$/),name:z.string().min(2),description:z.string().max(3000).optional(),triggerType:z.string().min(2).max(100),aiCredits:z.number().int().min(0).default(0),hermesSlots:z.number().int().min(0).max(20).default(0),enabled:z.boolean().default(true),metadata:z.record(z.unknown()).default({})});
const grantSchema=z.object({userId:z.string().uuid(),rewardRuleId:z.string().uuid(),sourceType:z.string().min(1).max(80).default('manual'),sourceId:z.string().max(200).optional(),metadata:z.record(z.unknown()).default({})});

export async function grantReward(client:import('pg').PoolClient,userId:string,rewardRuleId:string,sourceType:string,sourceId:string|null,grantedBy:string|null,metadata:Record<string,unknown>={}){
  const rule=await client.query(`select * from reward_rules where id=$1 and enabled=true`,[rewardRuleId]);if(!rule.rowCount)return {kind:'rule_missing' as const};const r=rule.rows[0];
  const achievementId=randomUUID();
  const inserted=await client.query(`insert into achievements(id,user_id,reward_rule_id,source_type,source_id,granted_by,metadata) values($1,$2,$3,$4,$5,$6,$7::jsonb) on conflict(user_id,reward_rule_id,source_type,source_id) do nothing returning id`,[achievementId,userId,rewardRuleId,sourceType,sourceId,grantedBy,JSON.stringify(metadata)]);
  if(!inserted.rowCount)return {kind:'duplicate' as const};
  if(Number(r.ai_credits)>0){const w=await client.query(`insert into ai_credit_wallets(user_id,balance) values($1,$2) on conflict(user_id) do update set balance=ai_credit_wallets.balance+excluded.balance,updated_at=now() returning balance`,[userId,r.ai_credits]);const balance=Number(w.rows[0].balance);await client.query(`update resource_entitlements set ai_credit_balance=$1,updated_at=now() where user_id=$2`,[balance,userId]);await client.query(`insert into ai_credit_ledger(user_id,delta,balance_after,reason,reference_type,reference_id,idempotency_key,actor_user_id) values($1,$2,$3,'reward.granted','achievement',$4,$5,$6)`,[userId,r.ai_credits,balance,achievementId,`reward:${achievementId}:credits`,grantedBy]);}
  if(Number(r.hermes_slots)>0){await client.query(`insert into resource_entitlements(user_id,hermes_agent_slots) values($1,$2) on conflict(user_id) do update set hermes_agent_slots=resource_entitlements.hermes_agent_slots+excluded.hermes_agent_slots,updated_at=now()`,[userId,r.hermes_slots]);}
  await enqueueOutbox(client,'reward.achievement_unlocked','achievement',achievementId,{achievementId,userId,rewardCode:r.code,rewardName:r.name,aiCredits:Number(r.ai_credits),hermesSlots:Number(r.hermes_slots)},`reward-notify:${achievementId}`);
  return {kind:'ok' as const,achievementId,reward:r};
}

export async function registerRewardRoutes(app:FastifyInstance){
  app.get('/v1/rewards/rules',async(request,reply)=>{const user=await requireAuth(request,reply);if(!user)return;return {items:(await pool.query(`select * from reward_rules where enabled=true order by name`)).rows};});
  app.post('/v1/rewards/rules',async(request,reply)=>{const admin=await requireAuth(request,reply,['ADMIN']);if(!admin)return;const parsed=ruleSchema.safeParse(request.body);if(!parsed.success)return reply.code(400).send({error:'invalid reward rule',issues:parsed.error.flatten()});const d=parsed.data;const result=await pool.query(`insert into reward_rules(code,name,description,trigger_type,ai_credits,hermes_slots,enabled,metadata) values($1,$2,$3,$4,$5,$6,$7,$8::jsonb) on conflict(code) do update set name=excluded.name,description=excluded.description,trigger_type=excluded.trigger_type,ai_credits=excluded.ai_credits,hermes_slots=excluded.hermes_slots,enabled=excluded.enabled,metadata=excluded.metadata,updated_at=now() returning *`,[d.code,d.name,d.description??null,d.triggerType,d.aiCredits,d.hermesSlots,d.enabled,JSON.stringify(d.metadata)]);return reply.code(201).send(result.rows[0]);});
  app.post('/v1/rewards/grant',async(request,reply)=>{const admin=await requireAuth(request,reply,['ADMIN']);if(!admin)return;const parsed=grantSchema.safeParse(request.body);if(!parsed.success)return reply.code(400).send({error:'invalid reward grant'});const d=parsed.data;const result=await withTransaction(client=>grantReward(client,d.userId,d.rewardRuleId,d.sourceType,d.sourceId??null,admin.sub,d.metadata));if(result.kind==='rule_missing')return reply.code(404).send({error:'reward rule not found'});if(result.kind==='duplicate')return reply.code(409).send({error:'achievement already granted'});return reply.code(201).send(result);});
  app.get('/v1/rewards/my',async(request,reply)=>{const user=await requireAuth(request,reply);if(!user)return;const result=await pool.query(`select a.id,a.source_type,a.source_id,a.granted_at,a.metadata,r.code,r.name,r.description,r.ai_credits,r.hermes_slots from achievements a join reward_rules r on r.id=a.reward_rule_id where a.user_id=$1 order by a.granted_at desc`,[user.sub]);return {items:result.rows};});

  app.get('/v1/rewards',async(request,reply)=>{const admin=await requireAuth(request,reply,['ADMIN']);if(!admin)return;
    const rules=await pool.query(`select id,code,name,description,trigger_type type,coalesce(ai_credits,hermes_slots,0) value,enabled,created_at from reward_rules order by name`);
    const grants=await pool.query(`select a.id,a.user_id,u.full_name user_name,r.code,r.name reward_name,r.ai_credits,r.hermes_slots,coalesce(a.metadata->>'reason','') reason,a.granted_at from achievements a join reward_rules r on r.id=a.reward_rule_id join users u on u.id=a.user_id order by a.granted_at desc limit 200`);
    return {rules:rules.rows,grants:grants.rows};
  });
}
